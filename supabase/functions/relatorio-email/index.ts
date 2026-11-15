// Ninho - envia o relatorio de saude (PDF) para o e-mail de quem esta logado
// (Supabase Edge Function "relatorio-email").
// O app gera o PDF e manda aqui; a funcao confere o login e envia SO para o e-mail da propria conta.
// Usa os mesmos segredos da funcao aviso-sugestao (Edge Functions > Secrets): GMAIL_USER e GMAIL_SENHA_APP.
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
const ANON = Deno.env.get("SUPABASE_ANON_KEY") || "sb_publishable_a4_5xhZAn9NhGWV5SGTw3w_pwyZFIrN";
const USER = Deno.env.get("GMAIL_USER") || "";
const PASS = (Deno.env.get("GMAIL_SENHA_APP") || "").replace(/\s/g, "");

async function quem(req: Request): Promise<string | null> {
  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return null;
  const r = await fetch(SB_URL + "/auth/v1/user", { headers: { Authorization: auth, apikey: ANON } });
  if (!r.ok) return null;
  const u = await r.json();
  return u && u.id && u.email ? String(u.email) : null;
}

const html =
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e6e2d3;padding:32px 12px;font-family:Helvetica,Arial,sans-serif">' +
  '<tr><td align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;background:#ffffff;border-radius:28px;padding:32px 28px;color:#222222">' +
  "<tr><td>" +
  '<p style="font-family:Georgia,serif;font-size:26px;font-weight:700;margin:0 0 4px;color:#111111">Ninho.</p>' +
  '<p style="font-size:13px;color:#888888;margin:0 0 24px">Seu relat\u00f3rio de sa\u00fade</p>' +
  '<p style="font-size:16px;line-height:1.55;margin:0 0 16px;color:#222222">O relat\u00f3rio que voc\u00ea gerou no Ninho est\u00e1 em anexo, em PDF. D\u00e1 para encaminhar para o seu m\u00e9dico ou levar impresso na consulta.</p>' +
  '<p style="font-size:12px;color:#aaaaaa;margin:20px 0 0">Correla\u00e7\u00e3o n\u00e3o \u00e9 causa: os padr\u00f5es s\u00e3o pistas para conversar na consulta.</p>' +
  "</td></tr></table></td></tr></table>";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method === "GET") return json({ versao: VERSAO, gmail: !!(USER && PASS) });
  if (req.method !== "POST") return json({ ok: false }, 405);
  if (!USER || !PASS) return json({ ok: false, msg: "Faltam os segredos GMAIL_USER e GMAIL_SENHA_APP" }, 500);

  const email = await quem(req);
  if (!email) return json({ ok: false, msg: "login" }, 401);
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return json({ ok: false, msg: "corpo" }, 400); }
  const pdf = String(b.pdf || "");
  if (pdf.length < 100 || pdf.length > 6000000 || !/^[A-Za-z0-9+/=]+$/.test(pdf)) return json({ ok: false, msg: "pdf" }, 400);
  const nome = /^[a-z0-9-]{1,60}\.pdf$/.test(String(b.nome || "")) ? String(b.nome) : "relatorio-ninho.pdf";

  try {
    const t = nodemailer.createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user: USER, pass: PASS } });
    await t.sendMail({
      from: '"Ninho" <' + USER + ">", to: email,
      subject: "\u{1FA7A} Seu relat\u00f3rio de sa\u00fade do Ninho",
      text: "O relatorio que voce gerou no Ninho esta em anexo, em PDF.",
      html,
      attachments: [{ filename: nome, content: pdf, encoding: "base64", contentType: "application/pdf" }],
    });
    return json({ ok: true, para: email.replace(/^(.).*(@.*)$/, "$1***$2") });
  } catch (e) {
    return json({ ok: false, msg: "falha no envio", detalhe: String(e).slice(0, 200) }, 500);
  }
});
