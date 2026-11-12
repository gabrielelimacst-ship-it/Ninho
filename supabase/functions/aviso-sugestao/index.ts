// Ninho - aviso de sugestao (Supabase Edge Function "aviso-sugestao")
// Chamada por um Database Webhook quando entra uma linha nova em "sugestoes".
// Confere a sugestao direto no banco (nao confia no que chegou) e manda um e-mail
// para a dona do app pelo Gmail (porta 465).
// Segredos necessarios (Edge Functions > Secrets): GMAIL_USER e GMAIL_SENHA_APP.
// Opcional: AVISO_PARA (para quem vai o aviso; padrao = GMAIL_USER).
// Arquivo so com caracteres simples (sem crases nem acentos) para colar sem erro.
import nodemailer from "npm:nodemailer@6.9.16";

const SB_URL = Deno.env.get("SUPABASE_URL") || "";
// Chave de servidor: formato novo (SUPABASE_SECRET_KEYS) ou antigo (SERVICE_ROLE)
function chaveServidor(): string {
  try {
    const novas = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    const v = Object.values(novas)[0];
    if (typeof v === "string" && v) return v;
  } catch (_) { /* sem chaves novas */ }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
}
const SRV = chaveServidor();
const USER = Deno.env.get("GMAIL_USER") || "";
const PASS = (Deno.env.get("GMAIL_SENHA_APP") || "").replace(/\s/g, "");
const PARA = Deno.env.get("AVISO_PARA") || USER;

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { "Content-Type": "application/json" } });
const esc = (t: unknown) =>
  String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));

// Monta o e-mail (separado para poder testar)
export function montar(s: Record<string, unknown>) {
  const tipo = String(s.tipo || "Sugest\u00e3o");
  const quando = new Date(String(s.criado_em || Date.now())).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const ic = tipo === "Problema" ? "\u{1F41E}" : tipo === "Elogio" ? "\u{1F49B}" : "\u{1F4A1}";
  const assunto = ic + " Nova sugest\u00e3o no Ninho: " + tipo;
  const texto = tipo + " de " + (s.email || "algu\u00e9m") + " (" + quando + ", vers\u00e3o " + (s.versao || "?") + "):\n\n" + String(s.texto || "");
  const html =
    '<div style="font-family:Helvetica,Arial,sans-serif;max-width:480px;color:#222">' +
    '<p style="font-family:Georgia,serif;font-size:22px;font-weight:700;margin:0 0 16px">Ninho.</p>' +
    '<p style="font-size:15px;margin:0 0 6px"><b>' + ic + " " + esc(tipo) + "</b> de " + esc(s.email || "algu\u00e9m") + "</p>" +
    '<p style="font-size:13px;color:#888;margin:0 0 16px">' + esc(quando) + " \u00b7 vers\u00e3o " + esc(s.versao || "?") + "</p>" +
    '<div style="background:#f3f1ea;border-radius:16px;padding:16px;font-size:15px;line-height:1.5;white-space:pre-wrap">' + esc(s.texto) + "</div>" +
    '<p style="font-size:12px;color:#999;margin:16px 0 0">Todas as sugest\u00f5es: Supabase \u203a Table Editor \u203a sugestoes</p></div>';
  return { assunto, texto, html };
}

export async function enviar(m: { assunto: string; texto: string; html: string }, replyTo?: string) {
  const t = nodemailer.createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user: USER, pass: PASS } });
  await t.sendMail({ from: '"Ninho" <' + USER + ">", to: PARA, replyTo: replyTo || undefined, subject: m.assunto, text: m.texto, html: m.html });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ ok: false }, 405);
  if (!USER || !PASS) return json({ ok: false, msg: "Faltam os segredos GMAIL_USER e GMAIL_SENHA_APP" }, 500);
  let b: { type?: string; table?: string; record?: { id?: number } };
  try { b = await req.json(); } catch { return json({ ok: false, msg: "corpo" }, 400); }
  const id = Number(b?.record?.id);
  if (b.table !== "sugestoes" || !id) return json({ ok: false, msg: "ignorado" }, 200);

  // Confere no banco: a sugestao existe e e recente (evita e-mails falsos ou repetidos)
  const h: Record<string, string> = { apikey: SRV };
  if (!SRV.startsWith("sb_")) h.Authorization = "Bearer " + SRV;
  if (!SRV) return json({ ok: false, msg: "sem chave de servidor" }, 500);
  const r = await fetch(SB_URL + "/rest/v1/sugestoes?select=id,tipo,texto,email,versao,criado_em&id=eq." + id, { headers: h });
  if (!r.ok) return json({ ok: false, msg: "sem acesso ao banco", status: r.status, detalhe: (await r.text()).slice(0, 160) }, 500);
  const s = (await r.json())[0];
  if (!s) return json({ ok: false, msg: "nao achei" }, 404);
  if (Date.now() - new Date(s.criado_em).getTime() > 10 * 60e3) return json({ ok: false, msg: "antiga" }, 200);

  try {
    await enviar(montar(s), s.email);
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, msg: "falha no envio", detalhe: String(e).slice(0, 200) }, 500);
  }
});
