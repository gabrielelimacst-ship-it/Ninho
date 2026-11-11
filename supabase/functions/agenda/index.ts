// Ninho — mensageiro da agenda (Supabase Edge Function "agenda")
// Recebe os links secretos (Google / Apple) de quem está logado, busca as agendas
// e devolve os eventos já organizados (inclusive os que se repetem).
// Só aceita links do Google Agenda e do iCloud, e só para quem fez login no Ninho.
import ICAL from "npm:ical.js@2.2.1";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const PERMITIDOS = /^(calendar\.google\.com|[a-z0-9-]+\.icloud\.com)$/i;
const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "sb_publishable_a4_5xhZAn9NhGWV5SGTw3w_pwyZFIrN";

async function logado(req: Request) {
  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return false;
  const r = await fetch(`${SB_URL}/auth/v1/user`, { headers: { Authorization: auth, apikey: SB_KEY } });
  return r.ok;
}

// Núcleo: lê um texto .ics e devolve os eventos entre "de" e "ate".
// deno-lint-ignore no-explicit-any
function expandir(ICAL: any, texto: string, de: Date, ate: Date, cal: string) {
  const raiz = new ICAL.Component(ICAL.parse(texto));
  for (const tz of raiz.getAllSubcomponents("vtimezone")) {
    try { ICAL.TimezoneService.register(tz); } catch (_) { /* fuso repetido */ }
  }
  const nome = raiz.getFirstPropertyValue("x-wr-calname") || "";
  // deno-lint-ignore no-explicit-any
  const mestres = new Map<string, any>(), excecoes: any[] = [];
  for (const v of raiz.getAllSubcomponents("vevent")) {
    const e = new ICAL.Event(v);
    if (e.isRecurrenceException()) excecoes.push(e); else mestres.set(e.uid, e);
  }
  for (const x of excecoes) { const m = mestres.get(x.uid); if (m) m.relateException(x); else mestres.set(x.uid + "#" + x.recurrenceId, x); }
  const lista: unknown[] = [];
  // deno-lint-ignore no-explicit-any
  const add = (ini: any, fim: any, item: any) => {
    if (!ini) return;
    if (item.component.getFirstPropertyValue("status") === "CANCELLED") return;
    const dia = ini.isDate;
    const s = dia ? ini.toString().slice(0, 10) : ini.toJSDate().toISOString();
    const f = fim ? (dia ? fim.toString().slice(0, 10) : fim.toJSDate().toISOString()) : s;
    lista.push({ cal, t: item.summary || "(sem título)", s, e: f, ad: dia ? 1 : 0, l: item.location || "" });
  };
  const A = de.getTime(), B = ate.getTime();
  for (const e of mestres.values()) {
    if (!e.startDate) continue;
    if (e.isRecurring()) {
      const it = e.iterator();
      let n, voltas = 0;
      while ((n = it.next()) && voltas++ < 4000) {
        const t = n.toJSDate().getTime();
        if (t > B) break;
        const d = e.getOccurrenceDetails(n);
        const fimT = (d.endDate || d.startDate).toJSDate().getTime();
        if (fimT < A) continue;
        add(d.startDate, d.endDate, d.item);
      }
    } else {
      const ini = e.startDate.toJSDate().getTime(), fim = (e.endDate || e.startDate).toJSDate().getTime();
      if (fim >= A && ini <= B) add(e.startDate, e.endDate, e);
    }
  }
  return { nome, lista };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ erro: "use POST" }, 405);
  if (!(await logado(req))) return json({ erro: "login" }, 401);
  let corpo: { urls?: Record<string, string>; de?: string; ate?: string };
  try { corpo = await req.json(); } catch { return json({ erro: "corpo" }, 400); }
  const de = new Date(corpo.de || Date.now() - 31 * 864e5), ate = new Date(corpo.ate || Date.now() + 180 * 864e5);
  const eventos: unknown[] = [], status: Record<string, unknown> = {};
  for (const [cal, bruto] of Object.entries(corpo.urls || {})) {
    if (!bruto) continue;
    try {
      const u = new URL(String(bruto).trim().replace(/^webcals?:/i, "https:"));
      if (u.protocol !== "https:" || !PERMITIDOS.test(u.hostname)) { status[cal] = { ok: 0, erro: "link" }; continue; }
      const r = await fetch(u, { headers: { "User-Agent": "Ninho-agenda" }, redirect: "follow" });
      if (!r.ok) { status[cal] = { ok: 0, erro: "http", codigo: r.status }; continue; }
      const { nome, lista } = expandir(ICAL, await r.text(), de, ate, cal);
      eventos.push(...lista);
      status[cal] = { ok: 1, nome, total: lista.length };
    } catch (e) {
      status[cal] = { ok: 0, erro: "leitura", msg: String(e).slice(0, 120) };
    }
  }
  return json({ eventos, status });
});
