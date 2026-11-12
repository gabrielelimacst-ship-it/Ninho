// Ninho - aviso de sugestao (Supabase Edge Function "aviso-sugestao") - versao 3
// O app chama esta funcao logo depois de salvar uma sugestao.
// Ela confere o login de quem enviou e manda um e-mail para a dona do app pelo Gmail (porta 465).
// Segredos necessarios (Edge Functions > Secrets): GMAIL_USER e GMAIL_SENHA_APP.
// Opcional: AVISO_PARA (para quem vai o aviso; padrao = GMAIL_USER).
// Arquivo so com caracteres simples (sem crases nem acentos) para colar sem erro.
import nodemailer from "npm:nodemailer@6.9.16";

const VERSAO = 3;
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const SB_URL = Deno.env.get("SUPABASE_URL") || "";
const ANON = Deno.env.get("SUPABASE_ANON_KEY") || "sb_publishable_a4_5xhZAn9NhGWV5SGTw3w_pwyZFIrN";
const USER = Deno.env.get("GMAIL_USER") || "";
const PASS = (Deno.env.get("GMAIL_SENHA_APP") || "").replace(/\s/g, "");
const PARA = Deno.env.get("AVISO_PARA") || USER;
const TIPOS = ["Ideia", "Problema", "Elogio"];

const esc = (t: unknown) =>
  String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));

// Quem esta logado? Devolve o e-mail da conta, ou null se o login nao vale.
async function quem(req: Request): Promise<string | null> {
  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return null;
  const r = await fetch(SB_URL + "/auth/v1/user", { headers: { Authorization: auth, apikey: ANON } });
  if (!r.ok) return null;
  const u = await r.json();
  return u && u.id ? String(u.email || "") : null;
}

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
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  // Conferencia rapida: qual versao esta instalada e se os segredos do Gmail existem (sem mostrar nenhum valor)
  if (req.method === "GET") return json({ versao: VERSAO, gmail: !!(USER && PASS) });
  if (req.method !== "POST") return json({ ok: false }, 405);
  if (!USER || !PASS) return json({ ok: false, msg: "Faltam os segredos GMAIL_USER e GMAIL_SENHA_APP" }, 500);

  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return json({ ok: false, msg: "corpo" }, 400); }
  // Chamadas do gatilho antigo do banco nao sao mais usadas
  if (b.record || b.table) return json({ ok: false, msg: "ignorado" }, 200);

  const email = await quem(req);
  if (email === null) return json({ ok: false, msg: "login" }, 401);
  const texto = String(b.texto || "").trim().slice(0, 2000);
  if (texto.length < 3) return json({ ok: false, msg: "texto curto" }, 400);
  const tipo = TIPOS.includes(String(b.tipo)) ? String(b.tipo) : "Ideia";

  try {
    await enviar(montar({ tipo, texto, email, versao: String(b.versao || "").slice(0, 12), criado_em: new Date().toISOString() }), email || undefined);
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, msg: "falha no envio", detalhe: String(e).slice(0, 200) }, 500);
  }
});
