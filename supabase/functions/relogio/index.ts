// Ninho - mensageiro do relogio (Supabase Edge Function "relogio")
// Recebe do atalho do iPhone (app Atalhos) os numeros do dia vindos do app Saude
// (sono, passos e batimentos) e guarda no Ninho de quem tem a chave.
// Nao usa login: quem prova a identidade e a chave pessoal gerada no app.
// Arquivo so com caracteres simples (sem crases nem acentos) para colar sem erro.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });

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
const hdr = (extra: Record<string, string> = {}) => {
  const h: Record<string, string> = { apikey: SRV, "Content-Type": "application/json", ...extra };
  if (!SRV.startsWith("sb_")) h.Authorization = "Bearer " + SRV;
  return h;
};

async function sha(t: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

// Aceita 7832, "7832", "7.832" (milhar), "7,5" (decimal), "6,5 h"...
export function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return isFinite(v) ? v : null;
  let s = String(v).trim().replace(/[^\d.,-]/g, "");
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, "").replace(",", ".");
  else s = s.replace(",", ".");
  const n = parseFloat(s);
  return isFinite(n) ? n : null;
}
// Sono pode chegar em horas (6,5), minutos (390) ou segundos (23400)
export function minutosDeSono(v: unknown): number | null {
  const n = num(v);
  if (n === null || n <= 0) return null;
  if (n < 24) return Math.round(n * 60);
  if (n <= 1440) return Math.round(n);
  return Math.round(n / 60);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ ok: false, msg: "use POST" }, 405);
  if (!SRV) return json({ ok: false, msg: "Falta a chave de servidor no Supabase" }, 500);
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return json({ ok: false, msg: "Corpo invalido" }, 400); }
  const chave = String(b.chave || "").trim();
  if (chave.length < 20) return json({ ok: false, msg: "Chave ausente" }, 401);

  const q = await fetch(SB_URL + "/rest/v1/relogio_chaves?select=user_id&chave_hash=eq." + (await sha(chave)), { headers: hdr() });
  if (!q.ok) return json({ ok: false, msg: "Sem acesso ao banco", status: q.status }, 500);
  const achou = await q.json();
  if (!achou.length) return json({ ok: false, msg: "Chave nao reconhecida. Gere uma nova no Ninho." }, 401);

  const hoje = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10); // horario de Brasilia
  const dia = /^\d{4}-\d{2}-\d{2}$/.test(String(b.dia || "")) ? String(b.dia) : hoje;
  const linha: Record<string, unknown> = { user_id: achou[0].user_id, dia, atualizado_em: new Date().toISOString() };
  const passos = num(b.passos), bpm = num(b.bpm), rep = num(b.repouso), sono = minutosDeSono(b.sono);
  if (passos !== null) linha.passos = Math.round(passos);
  if (sono !== null) linha.sono_min = sono;
  if (bpm !== null) linha.bpm_medio = Math.round(bpm);
  if (rep !== null) linha.bpm_repouso = Math.round(rep);

  const w = await fetch(SB_URL + "/rest/v1/relogio?on_conflict=user_id,dia", {
    method: "POST",
    headers: hdr({ Prefer: "resolution=merge-duplicates,return=minimal" }),
    body: JSON.stringify(linha),
  });
  if (!w.ok) return json({ ok: false, msg: "Nao consegui salvar agora", detalhe: (await w.text()).slice(0, 200) }, 500);

  const partes: string[] = [];
  if (linha.sono_min) partes.push(Math.floor(Number(linha.sono_min) / 60) + "h" + String(Number(linha.sono_min) % 60).padStart(2, "0") + " de sono");
  if (linha.passos !== undefined) partes.push(linha.passos + " passos");
  if (linha.bpm_repouso) partes.push(linha.bpm_repouso + " bpm em repouso");
  return json({ ok: true, msg: "Ninho atualizado: " + (partes.join(", ") || "sem numeros hoje") });
});
