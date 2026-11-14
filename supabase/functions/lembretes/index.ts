// Ninho - lembretes (Supabase Edge Function "lembretes") - versao 1
// 1) O despertador do banco (a cada 5 min) manda a lista de avisos com o segredo LEMBRETES_SEGREDO.
// 2) O app pode pedir um aviso de teste para o proprio aparelho (precisa estar logado).
// Segredos (Edge Functions > Secrets): VAPID_PRIVADA e LEMBRETES_SEGREDO.
// Arquivo so com caracteres simples (sem crases nem acentos) para colar sem erro.
import webpush from "npm:web-push@3.6.7";

const VAPID_PUBLICA = "BBfVxfxXMMj0sJsuQ5IthaQQweijlN7eu5Fmmqxm2hbn0MSu8A-KQZhjLjC7nBMmYJfd9GBmYVwpd83PB4bo5J4";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const SB_URL = Deno.env.get("SUPABASE_URL") || "";
const ANON = Deno.env.get("SUPABASE_ANON_KEY") || "sb_publishable_a4_5xhZAn9NhGWV5SGTw3w_pwyZFIrN";
const PRIV = Deno.env.get("VAPID_PRIVADA") || "";
const SEGREDO = Deno.env.get("LEMBRETES_SEGREDO") || "";
if (PRIV) webpush.setVapidDetails("https://gabrielelimacst-ship-it.github.io/Ninho/", VAPID_PUBLICA, PRIV);

type Envio = { endpoint: string; p256dh: string; auth: string; titulo?: string; corpo?: string; tag?: string };
async function mandar(e: Envio) {
  try {
    await webpush.sendNotification(
      { endpoint: e.endpoint, keys: { p256dh: e.p256dh, auth: e.auth } },
      JSON.stringify({ titulo: e.titulo || "Ninho", corpo: e.corpo || "", tag: e.tag || "" }),
      { TTL: 3600 });
    return 1;
  } catch (_) { return 0; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method === "GET") return json({ versao: 1, vapid: !!PRIV, segredo: !!SEGREDO });
  if (req.method !== "POST") return json({ ok: false }, 405);
  if (!PRIV) return json({ ok: false, msg: "Falta o segredo VAPID_PRIVADA" }, 500);
  let b: { segredo?: string; envios?: Envio[]; teste?: Envio };
  try { b = await req.json(); } catch { return json({ ok: false, msg: "corpo" }, 400); }

  // Envio programado (vem do banco)
  if (b.envios) {
    if (!SEGREDO || b.segredo !== SEGREDO) return json({ ok: false, msg: "segredo" }, 401);
    let n = 0;
    for (const e of b.envios.slice(0, 500)) n += await mandar(e);
    return json({ ok: true, enviados: n });
  }

  // Teste pedido pelo app: so para quem esta logado e so para o proprio aparelho
  if (b.teste) {
    const auth = req.headers.get("Authorization") || "";
    const r = await fetch(SB_URL + "/auth/v1/user", { headers: { Authorization: auth, apikey: ANON } });
    if (!r.ok) return json({ ok: false, msg: "login" }, 401);
    const ok = await mandar({ ...b.teste, titulo: "Ninho", corpo: "Prontinho! Os lembretes chegam assim \u2728", tag: "teste" });
    return json({ ok: !!ok });
  }
  return json({ ok: false, msg: "nada para fazer" }, 400);
});
