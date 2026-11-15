// Ninho - aviso de cadastro (Supabase Edge Function "aviso-cadastro") - versao 1
// Manda um e-mail para a dona do app quando alguem se cadastra.
// E chamada por um gatilho no banco (supabase/sql/aviso-cadastro.sql) a cada cadastro novo.
// Ela mesma confere na lista de contas quem ainda nao foi avisado; por isso nao precisa de senha:
// se alguem chamar o endereco a toa, nada acontece alem de conferir de novo.
// Na primeira vez (tabela vazia) manda UM e-mail com todos os cadastros que ja existiam.
// Segredos: GMAIL_USER e GMAIL_SENHA_APP (os mesmos da aviso-sugestao). Opcional: AVISO_PARA.
// Arquivo so com caracteres simples (sem crases nem acentos) para colar sem erro.
import nodemailer from "npm:nodemailer@6.9.16";

const VERSAO = 1;
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const SB_URL = Deno.env.get("SUPABASE_URL") || "";
const USER = Deno.env.get("GMAIL_USER") || "";
const PASS = (Deno.env.get("GMAIL_SENHA_APP") || "").replace(/\s/g, "");
const PARA = Deno.env.get("AVISO_PARA") || USER;

function chaveServidor(): string {
  try {
    const novas = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    const v = Object.values(novas)[0];
    if (typeof v === "string" && v) return v;
  } catch (_) { /* sem chaves novas */ }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
}
const SRV = chaveServidor();
const hdr = (extra: Record<string, string> = {}) => {
  const h: Record<string, string> = { apikey: SRV, "Content-Type": "application/json", ...extra };
  if (!SRV.startsWith("sb_")) h.Authorization = "Bearer " + SRV;
  return h;
};

const esc = (t: unknown) =>
  String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
const quando = (d: string) => new Date(d).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

// deno-lint-ignore no-explicit-any
type Conta = any;
async function contas(): Promise<Conta[]> {
  const out: Conta[] = [];
  for (let p = 1; p <= 20; p++) {
    const r = await fetch(SB_URL + "/auth/v1/admin/users?page=" + p + "&per_page=200", { headers: hdr() });
    if (!r.ok) throw new Error("auth " + r.status + " " + (await r.text()).slice(0, 200));
    const j = await r.json();
    const us = j.users || [];
    out.push(...us);
    if (us.length < 200) break;
  }
  return out;
}
async function avisados(): Promise<Set<string>> {
  const r = await fetch(SB_URL + "/rest/v1/cadastros_avisados?select=user_id", { headers: hdr() });
  if (!r.ok) throw new Error("tabela " + r.status + " " + (await r.text()).slice(0, 200));
  return new Set((await r.json()).map((x: { user_id: string }) => x.user_id));
}
async function marcar(ids: string[]) {
  if (!ids.length) return;
  const r = await fetch(SB_URL + "/rest/v1/cadastros_avisados", {
    method: "POST",
    headers: hdr({ Prefer: "resolution=ignore-duplicates,return=minimal" }),
    body: JSON.stringify(ids.map((id) => ({ user_id: id }))),
  });
  if (!r.ok) throw new Error("marcar " + r.status + " " + (await r.text()).slice(0, 200));
}

const linha = (u: Conta) => {
  const nome = (u.user_metadata && (u.user_metadata.full_name || u.user_metadata.name)) || "";
  const via = ((u.app_metadata && u.app_metadata.providers) || [u.app_metadata && u.app_metadata.provider]).filter(Boolean).join(", ") || "email";
  return '<tr><td style="padding:10px 0;border-top:1px solid #eeeeee;font-size:15px;color:#222222"><b>' + esc(u.email || "(sem e-mail)") + "</b>" +
    (nome ? " &middot; " + esc(nome) : "") + '<br><span style="font-size:13px;color:#888888">' + esc(quando(u.created_at)) + " &middot; entrou com " + esc(via) +
    (u.email_confirmed_at ? "" : " &middot; e-mail ainda n\u00e3o confirmado") + "</span></td></tr>";
};
function montar(lista: Conta[], retro: boolean, total: number) {
  const assunto = retro
    ? "\u{1FAB9} Ninho: todos os cadastros at\u00e9 agora (" + lista.length + ")"
    : "\u{1FAB9} Novo cadastro no Ninho: " + (lista.length === 1 ? (lista[0].email || "algu\u00e9m") : lista.length + " pessoas");
  const texto = lista.map((u) => (u.email || "(sem e-mail)") + " - " + quando(u.created_at)).join("\n") + "\n\nTotal de contas: " + total;
  const html =
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e6e2d3;padding:32px 12px;font-family:Helvetica,Arial,sans-serif">' +
    '<tr><td align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;background:#ffffff;border-radius:28px;padding:32px 28px;color:#222222">' +
    "<tr><td>" +
    '<p style="font-family:Georgia,serif;font-size:26px;font-weight:700;margin:0 0 4px;color:#111111">Ninho.</p>' +
    '<p style="font-size:13px;color:#888888;margin:0 0 20px">' + (retro ? "Todos os cadastros at\u00e9 agora" : "Algu\u00e9m chegou no ninho \u{1FAB9}") + "</p>" +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + lista.map(linha).join("") + "</table>" +
    '<p style="font-size:13px;color:#888888;margin:18px 0 0">Total de contas no Ninho: <b style="color:#444444">' + total + "</b></p>" +
    "</td></tr></table></td></tr></table>";
  return { assunto, texto, html };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method === "GET") return json({ versao: VERSAO, gmail: !!(USER && PASS), servidor: !!SRV });
  if (req.method !== "POST") return json({ ok: false }, 405);
  if (!USER || !PASS) return json({ ok: false, msg: "Faltam os segredos GMAIL_USER e GMAIL_SENHA_APP" }, 500);
  if (!SRV) return json({ ok: false, msg: "Falta a chave de servidor" }, 500);
  try {
    const [todas, ja] = await Promise.all([contas(), avisados()]);
    const novas = todas.filter((u) => !ja.has(u.id)).sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
    if (!novas.length) return json({ ok: true, novas: 0 });
    const retro = ja.size === 0;
    const m = montar(retro ? [...novas].reverse() : novas, retro, todas.length);
    const t = nodemailer.createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user: USER, pass: PASS } });
    await t.sendMail({ from: '"Ninho" <' + USER + ">", to: PARA, subject: m.assunto, text: m.texto, html: m.html });
    await marcar(novas.map((u) => u.id));
    return json({ ok: true, novas: novas.length, retroativo: retro });
  } catch (e) {
    return json({ ok: false, msg: "falha", detalhe: String(e).slice(0, 300) }, 500);
  }
});
