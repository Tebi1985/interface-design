/* Proxy CORS propio para el analizador Fibonacci / reporte de portfolio φ.
   Desplegar gratis en Cloudflare Workers (~5 min):
     1. dash.cloudflare.com → Workers & Pages → Create Worker → Deploy
     2. Edit code → borrar todo → pegar este archivo → Deploy
     3. Copiar la URL (https://<nombre>.<cuenta>.workers.dev) y pegarla en el
        campo "proxy propio" que aparece en la pantalla de error de la app,
        o en la consola del navegador:
          localStorage.setItem('phi-proxy','https://<nombre>.<cuenta>.workers.dev')
   Solo permite Yahoo Finance (chart) y Stooq — no es un proxy abierto. */
export default {
  async fetch(req) {
    const u = new URL(req.url).searchParams.get("url");
    if (!u || !/^https:\/\/(query[12]\.finance\.yahoo\.com|stooq\.com)\//.test(u))
      return new Response("no permitido", { status: 400 });
    const r = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0" } });
    const h = new Headers(r.headers);
    h.set("Access-Control-Allow-Origin", "*");
    h.delete("set-cookie");
    return new Response(r.body, { status: r.status, headers: h });
  }
}
