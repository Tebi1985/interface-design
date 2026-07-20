/* ============================================================
   Módulo Fibonacci embebible — φ análisis técnico
   Uso dentro del reporte de portfolio (un solo archivo HTML):
   pegar este archivo completo dentro de un tag script inline
   (IMPORTANTE: este código no debe contener la secuencia de cierre
   de script, por eso este comentario no muestra tags), y luego en
   otro script llamar:
     initFibonacciModule(document.getElementById('fib'),
       { tickers:['AAPL','MSFT','GGAL.BA'], demo:false });
   Descarga el histórico completo del ticker en vivo (Yahoo Finance,
   con proxies CORS de respaldo), detecta el impulso vigente, traza
   retrocesos/extensiones y estima probabilidades con el backtest del
   propio papel. Autocontenido: inyecta sus estilos (prefijo .fibm)
   y no depende de librerías externas.
   ============================================================ */
(function(){
"use strict";
if(window.initFibonacciModule)return;

/* ---------------- estilos (inyectados una sola vez) ---------------- */
const CSS=`
.fibm{
  --fbg:#0c0c0a;--fpanel:#121210;--fpanel2:#181814;--finset:#090907;
  --fline:rgba(236,222,180,.075);--fline-soft:rgba(236,222,180,.045);--fline-strong:rgba(236,222,180,.16);
  --fink:#ecead9;--fink2:#a8a595;--fink3:#71705f;--fink4:#4c4b40;
  --fgold:#d9a84e;--fgold-ink:#e8c47c;--fgold-soft:rgba(217,168,78,.13);--fgold-line:rgba(217,168,78,.38);
  --fext:#7ea3d4;--fext-soft:rgba(126,163,212,.12);
  --fup:#3fb374;--fup-ink:#84d6ab;--fup-soft:rgba(63,179,116,.12);
  --fdown:#d95c5c;--fdown-ink:#eb9a9a;--fdown-soft:rgba(217,92,92,.12);
  --fmono:ui-monospace,"SF Mono","Cascadia Code","JetBrains Mono",Consolas,monospace;
  color:var(--fink);font:13px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
  -webkit-font-smoothing:antialiased;
}
.fibm *{box-sizing:border-box;margin:0;padding:0}
.fibm button{font:inherit;color:inherit;background:none;border:none;cursor:pointer}
.fibm input{font:inherit;color:inherit}
.fibm :focus-visible{outline:2px solid var(--fgold-line);outline-offset:2px;border-radius:4px}
.fibm .f-mono{font-family:var(--fmono);font-variant-numeric:tabular-nums}

.fibm .f-picker{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:14px}
.fibm .f-picker .lbl{color:var(--fink3);font-size:11px;letter-spacing:.08em;text-transform:uppercase}
.fibm .f-chip{
  font:500 11.5px var(--fmono);letter-spacing:.05em;color:var(--fink2);
  border:1px solid var(--fline);border-radius:99px;padding:4px 12px;
  transition:all .12s cubic-bezier(.23,1,.32,1);
}
.fibm .f-chip:hover{border-color:var(--fgold-line);color:var(--fgold-ink);background:var(--fgold-soft)}
.fibm .f-chip.on{border-color:var(--fgold-line);color:var(--fgold-ink);background:var(--fgold-soft);font-weight:600}
.fibm .f-free{display:flex;gap:6px;margin-left:auto}
.fibm .f-free input{
  width:110px;background:var(--finset);border:1px solid var(--fline);border-radius:5px;
  padding:4px 10px;font-family:var(--fmono);font-size:11.5px;letter-spacing:.04em;text-transform:uppercase;
}
.fibm .f-free input:focus{border-color:var(--fgold-line);outline:none}
.fibm .f-free button{
  background:var(--fgold-soft);border:1px solid var(--fgold-line);color:var(--fgold-ink);
  border-radius:5px;padding:4px 12px;font-weight:600;font-size:11.5px;
}
.fibm .f-free button:active{transform:scale(.97)}

.fibm .f-state{border:1px solid var(--fline);border-radius:10px;background:var(--fpanel);padding:26px;text-align:center;max-width:460px;margin:0 auto}
.fibm .f-spinner{width:28px;height:28px;margin:0 auto 14px;border-radius:50%;border:2px solid var(--fline-strong);border-top-color:var(--fgold);animation:fibmspin .8s linear infinite}
@keyframes fibmspin{to{transform:rotate(360deg)}}
.fibm .f-state h4{font-size:14px;font-weight:600}
.fibm .f-state.err h4{color:var(--fdown-ink)}
.fibm .f-state .msg{color:var(--fink2);font-size:12px;margin-top:6px}
.fibm .f-state .actions{margin-top:14px;display:flex;gap:8px;justify-content:center}

.fibm .f-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:12px}
.fibm .f-card{background:var(--fpanel);border:1px solid var(--fline);border-radius:10px;padding:16px;min-width:0}
.fibm .f-card h5{font-size:11px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:var(--fink3);margin-bottom:12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.fibm .f-card h5 .n{font-family:var(--fmono);letter-spacing:0;text-transform:none;color:var(--fink4);font-weight:500}

.fibm .f-ident{grid-column:1/-1;display:flex;align-items:flex-end;gap:20px;flex-wrap:wrap;padding:2px 2px 0}
.fibm .f-ident .sym{font:650 19px/1 var(--fmono);letter-spacing:.02em}
.fibm .f-ident .name{color:var(--fink2);font-size:12px;margin-top:4px}
.fibm .f-ident .meta{color:var(--fink3);font-size:11px;margin-top:2px}
.fibm .f-ident .px{font:600 24px/1 var(--fmono);font-variant-numeric:tabular-nums}
.fibm .f-ident .px small{font-size:11px;color:var(--fink3);font-weight:500;margin-left:4px}
.fibm .f-delta{font:500 12px var(--fmono);font-variant-numeric:tabular-nums;padding:3px 8px;border-radius:5px}
.fibm .f-delta.up{color:var(--fup-ink);background:var(--fup-soft)}
.fibm .f-delta.down{color:var(--fdown-ink);background:var(--fdown-soft)}
.fibm .f-ident .right{margin-left:auto}
.fibm .f-seg{display:flex;background:var(--finset);border:1px solid var(--fline);border-radius:7px;padding:2px}
.fibm .f-seg button{padding:5px 13px;border-radius:5px;font-size:12px;font-weight:500;color:var(--fink3);transition:all .13s}
.fibm .f-seg button:hover{color:var(--fink2)}
.fibm .f-seg button.on{background:var(--fgold-soft);color:var(--fgold-ink);font-weight:600}

.fibm .f-verdict{grid-column:1/-1;display:grid;grid-template-columns:minmax(280px,5fr) minmax(260px,7fr);gap:0;padding:0;overflow:hidden}
.fibm .f-verdict .main{padding:18px 20px;border-right:1px solid var(--fline)}
.fibm .f-verdict .why{padding:16px 20px;background:linear-gradient(180deg,transparent,rgba(0,0,0,.14))}
.fibm .v-label{font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:var(--fink3)}
.fibm .v-word{font-size:28px;font-weight:700;letter-spacing:-.02em;line-height:1.15;margin:6px 0 2px}
.fibm .v-word.buy{color:var(--fup-ink)}.fibm .v-word.sell{color:var(--fdown-ink)}.fibm .v-word.hold{color:var(--fgold-ink)}
.fibm .v-sub{color:var(--fink2);font-size:12.5px;max-width:42ch}
.fibm .v-conf{display:flex;gap:10px;margin-top:12px;align-items:center;flex-wrap:wrap}
.fibm .v-conf .pill{font-size:11px;letter-spacing:.05em;padding:3px 10px;border-radius:99px;border:1px solid var(--fline-strong);color:var(--fink2)}
.fibm .v-conf .pill b{color:var(--fink)}
.fibm .gauge{margin-top:16px;max-width:340px}
.fibm .gauge .track{height:6px;border-radius:3px;position:relative;opacity:.85;
  background:linear-gradient(90deg,var(--fdown) 0 18%,rgba(217,92,92,.35) 18% 38%,var(--fgold-soft) 38% 62%,rgba(63,179,116,.35) 62% 82%,var(--fup) 82% 100%)}
.fibm .gauge .pin{position:absolute;top:-5px;width:2px;height:16px;background:var(--fink);border-radius:1px}
.fibm .gauge .lbls{display:flex;justify-content:space-between;color:var(--fink4);font-size:10px;letter-spacing:.07em;margin-top:6px;text-transform:uppercase}
.fibm .why h5{margin-bottom:8px}
.fibm .why-row{display:flex;gap:10px;align-items:baseline;padding:5px 0;border-bottom:1px solid var(--fline-soft);font-size:12.5px}
.fibm .why-row:last-child{border-bottom:none}
.fibm .why-row .pts{font:600 11.5px var(--fmono);min-width:30px;text-align:right;padding:1px 5px;border-radius:4px}
.fibm .pts.pos{color:var(--fup-ink);background:var(--fup-soft)}
.fibm .pts.neg{color:var(--fdown-ink);background:var(--fdown-soft)}
.fibm .pts.nil{color:var(--fink3);background:rgba(255,255,255,.04)}
.fibm .why-row .txt{color:var(--fink2)}

.fibm .f-chartcard{grid-column:1/9;position:relative}
.fibm .f-legend{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:10px}
.fibm .lg{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--fink3)}
.fibm .lg i{width:14px;height:0;border-top:2px solid;display:block;border-radius:1px}
.fibm .lg i.dash{border-top-style:dashed}
.fibm .lg i.band{height:8px;border:none;border-radius:2px}
.fibm .f-help{margin:0 0 12px;border:1px solid var(--fline);border-radius:8px;background:var(--finset);overflow:hidden}
.fibm .f-help summary{cursor:pointer;padding:8px 12px;font-size:12px;font-weight:600;color:var(--fgold-ink);list-style:none;display:flex;align-items:center;gap:8px}
.fibm .f-help summary::-webkit-details-marker{display:none}
.fibm .f-help summary::before{content:"?";display:inline-grid;place-items:center;width:16px;height:16px;border-radius:50%;border:1px solid var(--fgold-line);background:var(--fgold-soft);font:600 10px var(--fmono);flex:0 0 auto}
.fibm .f-help summary span{font-weight:400;color:var(--fink3);font-size:11px}
.fibm .f-help[open] summary{border-bottom:1px solid var(--fline)}
.fibm .f-help ol{margin:0;padding:10px 14px 12px 30px;display:grid;gap:6px}
.fibm .f-help li{font-size:12px;color:var(--fink2);line-height:1.5}
.fibm .f-help li b{color:var(--fink);font-weight:600}
.fibm .chart-wrap{position:relative}
.fibm .f-canvas{width:100%;display:block;border-radius:5px}
.fibm .f-tip{position:absolute;pointer-events:none;background:var(--fpanel2);border:1px solid var(--fline-strong);
  border-radius:8px;padding:8px 11px;font-size:11.5px;z-index:5;display:none;min-width:150px}
.fibm .f-tip .d{color:var(--fink3);font-size:10.5px;margin-bottom:3px}
.fibm .f-tip .row{display:flex;justify-content:space-between;gap:14px}
.fibm .f-tip .row span{color:var(--fink3)}
.fibm .f-tip .row b{font:600 11.5px var(--fmono);font-variant-numeric:tabular-nums}

.fibm .f-ladder{grid-column:9/13;display:flex;flex-direction:column;min-height:0}
.fibm .f-ladder .rows{overflow-y:auto;max-height:520px;margin:0 -6px;padding:0 6px}
.fibm .lrow{display:grid;grid-template-columns:52px 1fr auto;gap:4px 10px;align-items:center;
  padding:7px 8px;border-radius:8px;border:1px solid transparent;position:relative}
.fibm .lrow:hover{background:rgba(255,255,255,.03)}
.fibm .lrow .ratio{font:600 11px var(--fmono);color:var(--fink3)}
.fibm .lrow.ret .ratio{color:var(--fgold-ink)}
.fibm .lrow.ext .ratio{color:var(--fext)}
.fibm .lrow .lvl{display:flex;align-items:baseline;gap:8px;min-width:0;flex-wrap:wrap}
.fibm .lrow .price{font:600 13px var(--fmono);font-variant-numeric:tabular-nums}
.fibm .lrow .role{font-size:10.5px;color:var(--fink3);letter-spacing:.03em;text-transform:uppercase}
.fibm .lrow .dist{font:500 11px var(--fmono);font-variant-numeric:tabular-nums;color:var(--fink3);justify-self:end}
.fibm .f-badge{font-size:9.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--fgold-ink);
  border:1px solid var(--fgold-line);background:var(--fgold-soft);border-radius:99px;padding:1px 7px}
.fibm .f-badge.conf{color:var(--fext);border-color:rgba(126,163,212,.4);background:var(--fext-soft)}
.fibm .lrow .prob{grid-column:2/4;display:flex;align-items:center;gap:8px;margin-top:2px}
.fibm .prob .bar{flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,.06);overflow:hidden}
.fibm .prob .bar i{display:block;height:100%;background:linear-gradient(90deg,var(--fgold-line),var(--fgold));border-radius:2px}
.fibm .lrow.ext .prob .bar i{background:linear-gradient(90deg,rgba(126,163,212,.4),var(--fext))}
.fibm .prob .pv{font:600 10.5px var(--fmono);font-variant-numeric:tabular-nums;color:var(--fink2);min-width:32px;text-align:right}
.fibm .lrow.done{opacity:.5}
.fibm .lrow.done .price{text-decoration:line-through;text-decoration-color:var(--fink4)}
.fibm .lrow.now{border-color:var(--fgold-line);background:var(--fgold-soft);margin:3px 0}
.fibm .lrow.now .ratio{color:var(--fgold)}
.fibm .lrow.now .role{color:var(--fgold-ink)}
.fibm .lrow.base{border-top:1px dashed var(--fline-strong)}
.fibm .lrow.base .ratio,.fibm .lrow.base .price{color:var(--fdown-ink)}

.fibm .f-scen{grid-column:span 4;display:flex;flex-direction:column}
.fibm .f-scen .head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.fibm .f-scen .head h5{margin:0}
.fibm .f-scen .p-big{font:650 21px var(--fmono);font-variant-numeric:tabular-nums}
.fibm .f-scen.up-s .p-big{color:var(--fup-ink)}.fibm .f-scen.down-s .p-big{color:var(--fdown-ink)}
.fibm .f-scen p.desc{color:var(--fink2);font-size:12.5px}
.fibm .f-scen .kv{margin-top:auto;padding-top:12px}
.fibm .kv .r{display:flex;justify-content:space-between;padding:4px 0;border-top:1px solid var(--fline-soft);font-size:12px}
.fibm .kv .r span{color:var(--fink3)}
.fibm .kv .r b{font:600 12px var(--fmono);font-variant-numeric:tabular-nums}
.fibm .kv .r b.up{color:var(--fup-ink)}.fibm .kv .r b.down{color:var(--fdown-ink)}.fibm .kv .r b.gold{color:var(--fgold-ink)}

.fibm .f-dist{grid-column:1/8}
.fibm .f-dist .drow{display:grid;grid-template-columns:110px 1fr 74px;gap:12px;align-items:center;padding:4px 0}
.fibm .f-dist .dl{font:500 11px var(--fmono);color:var(--fink2);text-align:right}
.fibm .f-dist .dbar{height:14px;border-radius:3px;background:rgba(255,255,255,.05);overflow:hidden;position:relative}
.fibm .f-dist .dbar i{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,var(--fgold-line),var(--fgold));border-radius:3px}
.fibm .f-dist .drow.cur .dbar{outline:1px solid var(--fgold-line);outline-offset:2px}
.fibm .f-dist .dv{font:600 11px var(--fmono);font-variant-numeric:tabular-nums;color:var(--fink2)}
.fibm .f-dist .dv small{color:var(--fink4);font-weight:500;margin-left:4px}
.fibm .f-dist .foot{color:var(--fink3);font-size:11px;margin-top:10px}
.fibm .f-facts{grid-column:8/13}
.fibm .f-facts .kv .r:first-child{border-top:none}
.fibm .f-method{grid-column:1/-1;color:var(--fink3);font-size:11.5px;line-height:1.65;padding:2px 6px}
.fibm .f-method b{color:var(--fink2);font-weight:600}

@media(max-width:900px){
  .fibm .f-chartcard,.fibm .f-ladder,.fibm .f-scen,.fibm .f-dist,.fibm .f-facts{grid-column:1/-1}
  .fibm .f-verdict{grid-template-columns:1fr}
  .fibm .f-verdict .main{border-right:none;border-bottom:1px solid var(--fline)}
}
@media(prefers-reduced-motion:reduce){.fibm *{animation:none!important;transition:none!important}}
`;

/* ---------------- utilidades ---------------- */
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const fmtDateL=t=>new Date(t).toLocaleDateString("es-AR",{day:"2-digit",month:"short",year:"numeric"});
const fmtDateS=t=>new Date(t).toLocaleDateString("es-AR",{month:"short",year:"2-digit"});
function fmtN(v,dec){
  if(v==null||!isFinite(v))return"—";
  if(dec==null)dec=Math.abs(v)>=1000?1:Math.abs(v)>=10?2:3;
  return v.toLocaleString("es-AR",{minimumFractionDigits:dec,maximumFractionDigits:dec});
}
const fmtPct=(v,dec=1)=>(v>0?"+":"")+fmtN(v,dec)+"%";
const mean=a=>a.reduce((s,x)=>s+x,0)/(a.length||1);
function stdev(a){if(a.length<2)return 0;const m=mean(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1));}
const rets=c=>c.slice(1).map((v,i)=>Math.log(v/c[i]));
function sma(arr,n,i){if(i==null)i=arr.length-1;if(i+1<n)return null;let s=0;for(let k=i-n+1;k<=i;k++)s+=arr[k];return s/n;}
function rsi14(c){
  const n=14;if(c.length<n+1)return null;
  let g=0,l=0;
  for(let i=1;i<=n;i++){const d=c[i]-c[i-1];if(d>0)g+=d;else l-=d;}
  let ag=g/n,al=l/n;
  for(let i=n+1;i<c.length;i++){const d=c[i]-c[i-1];ag=(ag*13+Math.max(d,0))/14;al=(al*13+Math.max(-d,0))/14;}
  if(al===0)return 100;
  return 100-100/(1+ag/al);
}
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---------------- datos ---------------- */
const PROXIES=[
  u=>u,
  u=>"https://corsproxy.io/?url="+encodeURIComponent(u),
  u=>"https://api.allorigins.win/raw?url="+encodeURIComponent(u),
  u=>"https://api.codetabs.com/v1/proxy?quest="+encodeURIComponent(u),
];
async function fetchRaw(url,as,ms=9000){
  const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),ms);
  try{
    const r=await fetch(url,{signal:ctl.signal});
    if(!r.ok)throw new Error("HTTP "+r.status);
    return as==="json"?await r.json():await r.text();
  }finally{clearTimeout(t);}
}
function parseStooqCSV(txt){
  const lines=String(txt).trim().split(/\r?\n/);
  const bars=[];
  for(let i=1;i<lines.length;i++){
    const p=lines[i].split(",");
    if(p.length<5)continue;
    const t=Date.parse(p[0]);const c=parseFloat(p[4]);
    if(!isFinite(t)||!isFinite(c)||c<=0)continue;
    bars.push({t,o:parseFloat(p[1])||c,h:parseFloat(p[2])||c,l:parseFloat(p[3])||c,c,v:parseFloat(p[5])||0});
  }
  return bars;
}
async function fetchHistory(sym,onStep){
  /* 10 años es el máximo con granularidad diaria confiable en Yahoo; con range=max
     los históricos muy largos vuelven en velas mensuales y el análisis pierde sentido.
     Cadena de resiliencia: query1 y query2 directos → proxies CORS → respaldo Stooq. */
  let lastErr=null;
  const yUrl=h=>`https://${h}.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=10y&interval=1d&events=div%2Csplit`;
  const attempts=[
    [yUrl("query1"),0],[yUrl("query2"),0],
    [yUrl("query1"),1],[yUrl("query1"),2],[yUrl("query1"),3],
    [yUrl("query2"),2],
  ];
  for(let k=0;k<attempts.length;k++){
    onStep(k===0?"Conectando con Yahoo Finance…":`Reintentando por ruta alternativa (${k}/${attempts.length-1})…`);
    try{
      const j=await fetchRaw(PROXIES[attempts[k][1]](attempts[k][0]),"json");
      const res=j?.chart?.result?.[0];
      if(!res){
        const code=j?.chart?.error?.code||"";
        if(/not found/i.test(code)||/no data/i.test(j?.chart?.error?.description||""))
          throw Object.assign(new Error("NOTFOUND"),{notFound:true});
        throw new Error(code||"respuesta vacía");
      }
      return parseYahoo(res);
    }catch(e){if(e.notFound)throw e;lastErr=e;}
  }
  if(!sym.includes(".")){
    const sUrl=`https://stooq.com/q/d/l/?s=${sym.toLowerCase()}.us&i=d`;
    for(const px of [1,2,3]){
      onStep("Yahoo no responde; probando fuente de respaldo (Stooq)…");
      try{
        const txt=await fetchRaw(PROXIES[px](sUrl),"text");
        const cut=Date.now()-3653*864e5;
        const bars=parseStooqCSV(txt).filter(b=>b.t>=cut);
        if(bars.length>=120)
          return {bars,meta:{symbol:sym,name:"",currency:"USD",exchange:"Stooq · fuente de respaldo"}};
        throw new Error("CSV insuficiente");
      }catch(e){lastErr=e;}
    }
  }
  throw new Error("No se pudieron traer los precios ("+(lastErr?.message||"sin conexión")+"). Los proxies públicos fallan a veces — suele resolverse reintentando en unos segundos.");
}
function parseYahoo(res){
  const q=res.indicators?.quote?.[0]||{};
  const ts=res.timestamp||[];
  const bars=[];
  for(let i=0;i<ts.length;i++){
    const c=q.close?.[i];
    if(c==null)continue;
    bars.push({t:ts[i]*1000,o:q.open?.[i]??c,h:q.high?.[i]??c,l:q.low?.[i]??c,c,v:q.volume?.[i]??0});
  }
  const m=res.meta||{};
  return {bars,meta:{
    symbol:m.symbol||"",name:m.longName||m.shortName||"",currency:m.currency||"",
    exchange:m.fullExchangeName||m.exchangeName||"",
  }};
}
function demoData(){
  let s=42;const rnd=()=>((s=(s*1664525+1013904223)>>>0)/2**32);
  const bars=[];let p=68;const n=1600;const t0=Date.now()-n*864e5*1.45;
  let drift=0.0006,k=0;
  for(let i=0;i<n;i++){
    if(--k<=0){k=60+Math.floor(rnd()*140);const r=rnd();drift=r<.52?0.0011:r<.8?-0.0009:0.0001;}
    const shock=(rnd()+rnd()+rnd()-1.5)*0.024;
    p=Math.max(4,p*Math.exp(drift+shock));
    const day=Math.floor(i/5)*7+(i%5);
    const hi=p*(1+rnd()*0.013),lo=p*(1-rnd()*0.013);
    bars.push({t:t0+day*864e5,o:(hi+lo)/2,h:hi,l:lo,c:p,v:1e6*(0.5+rnd())});
  }
  return {bars,meta:{symbol:"DEMO",name:"Serie sintética de demostración",currency:"USD",exchange:"Simulado"}};
}

/* ---------------- motor de análisis ---------------- */
/* Ventanas definidas por FECHA (días calendario), no por cantidad de velas:
   así una serie con huecos o granularidad inesperada no distorsiona el grado del swing.
   Regla: la ventana de análisis ≈ 2-4× el horizonte de decisión. */
const HORIZONS={
  corto:{label:"Corto",days:270,base:5,desc:"~9 meses de vista · para decisiones de semanas a 6 meses"},
  medio:{label:"Medio",days:730,base:9,desc:"~2 años de vista · swings intermedios"},
  largo:{label:"Largo",days:1825,base:15,desc:"~5 años de vista · estructura mayor (contexto)"},
};
function medianSpacingDays(bars){
  if(bars.length<30)return 1;
  const gaps=[];
  for(let i=1;i<Math.min(bars.length,400);i++)gaps.push(bars[i].t-bars[i-1].t);
  gaps.sort((a,b)=>a-b);
  return gaps[Math.floor(gaps.length/2)]/864e5;
}
const RETS=[0.236,0.382,0.5,0.618,0.786];
const EXTS=[1.272,1.618,2.0];
const PRIOR_W=6;
const PRIOR={
  S:{0.236:.95,0.382:.80,0.5:.62,0.618:.45,0.786:.26,1:.11},
  up:{back:.62,e1272:.42,e1618:.28,e200:.16},
  down:{back:.55,e1272:.34,e1618:.21,e200:.12},
};
function zigzag(bars,thrPct){
  const thr=thrPct/100,piv=[];
  const mk=(i,kind)=>{
    let j=i;
    for(let k=Math.max(0,i-2);k<=Math.min(bars.length-1,i+2);k++)
      if(kind==="H"?bars[k].h>bars[j].h:bars[k].l<bars[j].l)j=k;
    return {i:j,t:bars[j].t,p:kind==="H"?bars[j].h:bars[j].l,kind};
  };
  let dir=0,extI=0,hiI=0,loI=0;
  for(let i=1;i<bars.length;i++){
    const c=bars[i].c;
    if(dir===0){
      if(c>bars[hiI].c)hiI=i;
      if(c<bars[loI].c)loI=i;
      if(c<=bars[hiI].c*(1-thr)){piv.push(mk(hiI,"H"));dir=-1;extI=i;}
      else if(c>=bars[loI].c*(1+thr)){piv.push(mk(loI,"L"));dir=1;extI=i;}
    }else if(dir===1){
      if(c>=bars[extI].c)extI=i;
      else if(c<=bars[extI].c*(1-thr)){piv.push(mk(extI,"H"));dir=-1;extI=i;}
    }else{
      if(c<=bars[extI].c)extI=i;
      else if(c>=bars[extI].c*(1+thr)){piv.push(mk(extI,"L"));dir=1;extI=i;}
    }
  }
  if(dir!==0)piv.push(Object.assign(mk(extI,dir===1?"H":"L"),{prov:true}));
  return piv;
}
function backtest(bars,piv){
  const out={up:[],down:[]};
  for(let k=1;k<piv.length-1;k++){
    const A=piv[k-1],B=piv[k],C=piv[k+1];
    if(A.kind===B.kind||B.kind===C.kind||C.prov)continue;
    const up=B.kind==="H";
    const range=Math.abs(B.p-A.p);
    if(range/Math.min(A.p,B.p)<0.025)continue;
    const depth=up?(B.p-C.p)/range:(C.p-B.p)/range;
    if(!(depth>0))continue;
    const lv=up
      ?{back:B.p,e1272:A.p+range*1.272,e1618:A.p+range*1.618,e200:A.p+range*2,inv:A.p}
      :{back:B.p,e1272:A.p-range*1.272,e1618:A.p-range*1.618,e200:A.p-range*2,inv:A.p};
    let iB=null,i127=null,i161=null,i200=null,iInv=null;
    for(let i=C.i+1;i<bars.length;i++){
      const h=bars[i].h,l=bars[i].l;
      if(up){
        if(iB==null&&h>=lv.back)iB=i;
        if(i127==null&&h>=lv.e1272)i127=i;
        if(i161==null&&h>=lv.e1618)i161=i;
        if(i200==null&&h>=lv.e200)i200=i;
        if(iInv==null&&l<=lv.inv)iInv=i;
      }else{
        if(iB==null&&l<=lv.back)iB=i;
        if(i127==null&&l<=lv.e1272)i127=i;
        if(i161==null&&l<=lv.e1618)i161=i;
        if(i200==null&&l<=lv.e200)i200=i;
        if(iInv==null&&h>=lv.inv)iInv=i;
      }
      if(iInv!=null||i200!=null)break;
    }
    const before=x=>x!=null&&(iInv==null||x<iInv);
    out[up?"up":"down"].push({
      depth,
      hitB:before(iB),resB:iB!=null||iInv!=null,
      h127:before(i127),res127:before(i127)||iInv!=null,
      h161:before(i161),res161:before(i161)||iInv!=null,
      h200:before(i200),res200:before(i200)||iInv!=null,
    });
  }
  return out;
}
function shrink(hits,n,prior){return (hits+PRIOR_W*prior)/(n+PRIOR_W);}
function condTargets(cases,d0,dirKey){
  const sel=cases.filter(c=>c.depth>=Math.max(0,d0-0.03));
  const P=PRIOR[dirKey];
  const calc=(hk,rk,pr)=>{
    const r=sel.filter(c=>c[rk]);
    return {p:shrink(r.filter(c=>c[hk]).length,r.length,pr),n:r.length};
  };
  return {
    back:calc("hitB","resB",P.back),
    e1272:calc("h127","res127",P.e1272),
    e1618:calc("h161","res161",P.e1618),
    e200:calc("h200","res200",P.e200),
    n:sel.length,
  };
}
function survivalProb(cases,d0,r){
  if(d0>=r)return 1;
  const S=x=>{
    const n=cases.length;
    const emp=n?cases.filter(c=>c.depth>=x).length/n:0;
    const keys=Object.keys(PRIOR.S).map(Number).sort((a,b)=>a-b);
    let pr=PRIOR.S[1];
    for(const k of keys)if(x<=k){pr=PRIOR.S[k];break;}
    return (emp*n+pr*PRIOR_W)/(n+PRIOR_W);
  };
  return clamp(S(r)/Math.max(S(d0),1e-6),0,1);
}
function pickSwing(bars,wStart){
  const win=bars.slice(wStart);
  const last=bars.length-1;
  const closes=bars.map(b=>b.c);
  const s200=sma(closes,200);
  const price=closes[last];
  let up=s200!=null?price>=s200:win[win.length-1].c>=win[0].c;
  const build=isUp=>{
    let iB=wStart;
    for(let i=wStart;i<bars.length;i++)
      if(isUp?bars[i].h>=bars[iB].h:bars[i].l<=bars[iB].l)iB=i;
    let iA=wStart;
    for(let i=wStart;i<=iB;i++)
      if(isUp?bars[i].l<=bars[iA].l:bars[i].h>=bars[iA].h)iA=i;
    if(iA===iB)return null;
    const A={i:iA,t:bars[iA].t,p:isUp?bars[iA].l:bars[iA].h};
    const B={i:iB,t:bars[iB].t,p:isUp?bars[iB].h:bars[iB].l};
    if(Math.abs(B.p-A.p)/Math.min(A.p,B.p)<0.03)return null;
    return {A,B,up:isUp,range:Math.abs(B.p-A.p)};
  };
  let sw=build(up);
  if(sw){
    const depth=sw.up?(sw.B.p-price)/sw.range:(price-sw.B.p)/sw.range;
    if(depth>1){up=!up;sw=build(up)||sw;}
  }
  if(!sw)sw=build(!up);
  return sw;
}
function levelPrice(sw,r){return sw.up?sw.B.p-sw.range*r:sw.B.p+sw.range*r;}
function extPrice(sw,e){return sw.up?sw.A.p+sw.range*e:sw.A.p-sw.range*e;}

function analyze(bars,horizonKey){
  const H=HORIZONS[horizonKey];
  const closes=bars.map(b=>b.c);
  const last=bars.length-1,price=closes[last];
  const lastT=bars[last].t;
  /* inicio de ventana por FECHA: primer índice dentro de los últimos H.days días */
  const winStart=days=>{
    const cut=lastT-days*864e5;
    let i=bars.findIndex(b=>b.t>=cut);
    if(i<0)i=0;
    return Math.max(0,Math.min(i,last-40));
  };
  const wStart=winStart(H.days);
  const volD=stdev(rets(closes.slice(wStart)));
  const thr=clamp(Math.max(H.base,volD*100*5.5),H.base,30);
  const piv=zigzag(bars,thr);
  const sw=pickSwing(bars,wStart);
  if(!sw)return null;
  const bt=backtest(bars,piv);
  const dirKey=sw.up?"up":"down";
  const cases=bt[dirKey];
  const depth=clamp(sw.up?(sw.B.p-price)/sw.range:(price-sw.B.p)/sw.range,0,1.6);
  const tg=condTargets(cases,depth,dirKey);
  const s200=sma(closes,200),s50=sma(closes,50);
  const rsi=rsi14(closes.slice(-260));
  const annVol=volD*Math.sqrt(252)*100;

  const upKey=horizonKey==="corto"?"medio":horizonKey==="medio"?"largo":null;
  let confl=[];
  if(upKey){
    const sw2=pickSwing(bars,winStart(HORIZONS[upKey].days));
    if(sw2&&sw2.up===sw.up){
      for(const r of RETS)confl.push(levelPrice(sw2,r));
      confl.push(sw2.A.p,sw2.B.p);
    }
  }
  const isConfl=p=>confl.some(c=>Math.abs(c-p)/p<0.012);

  const factors=[];
  let score=0;
  if(s200!=null&&s50!=null){
    if(price>=s200&&s50>=s200){score+=2;factors.push([+2,"Tendencia de fondo alcista: precio sobre la SMA200 y SMA50 por encima de la SMA200."]);}
    else if(price>=s200){score+=1;factors.push([+1,"Precio sobre la SMA200, pero la SMA50 aún no confirma."]);}
    else if(s50<s200){score-=2;factors.push([-2,"Tendencia de fondo bajista: precio bajo la SMA200 y SMA50 debajo de la SMA200."]);}
    else{score-=1;factors.push([-1,"Precio debajo de la SMA200: tendencia de fondo debilitada."]);}
  }
  const pb=Math.round(tg.back.p*100);
  if(sw.up){
    if(depth<0.15){factors.push([0,`Retroceso mínimo (${fmtN(depth*100,1)}%): el precio está pegado al máximo del impulso, sin descuento para comprar.`]);}
    else if(depth<0.382){score+=1;factors.push([+1,`Retroceso superficial (${fmtN(depth*100,1)}%): corrección sana dentro del impulso.`]);}
    else if(depth<0.66){score+=2;factors.push([+2,`Precio en la zona de reversión φ (retroceso ${fmtN(depth*100,1)}%, entre 38,2% y 61,8%): zona clásica de compra.`]);}
    else if(depth<0.786){score+=1;factors.push([+1,`Descuento profundo (${fmtN(depth*100,1)}%): aún válido, pero exige confirmación.`]);}
    else if(depth<1){score-=1;factors.push([-1,`Retroceso ${fmtN(depth*100,1)}%: la estructura alcista está debilitada (perforó el 78,6%).`]);}
    else{score-=3;factors.push([-3,"El retroceso superó el 100%: impulso alcista invalidado."]);}
    if(tg.back.p>=0.7){score+=2;factors.push([+2,`Histórico favorable: en retrocesos comparables, ${pb}% de las veces recuperó el máximo antes de invalidar.`]);}
    else if(tg.back.p>=0.58){score+=1;factors.push([+1,`Histórico levemente favorable: ${pb}% de recuperación del máximo en casos comparables.`]);}
    else if(tg.back.p<0.4){score-=2;factors.push([-2,`Histórico adverso: solo ${pb}% de los retrocesos comparables recuperaron el máximo.`]);}
    else if(tg.back.p<0.48){score-=1;factors.push([-1,`Histórico neutro-adverso: ${pb}% de recuperación en casos comparables.`]);}
    else{factors.push([0,`Histórico neutral: ${pb}% de los casos comparables recuperaron el máximo previo.`]);}
  }else{
    if(depth<0.15){factors.push([0,`Rebote mínimo (${fmtN(depth*100,1)}%): el precio sigue pegado al mínimo del impulso bajista.`]);}
    else if(depth<0.382){score-=1;factors.push([-1,`Rebote superficial (${fmtN(depth*100,1)}%) dentro de un impulso bajista.`]);}
    else if(depth<0.66){score-=2;factors.push([-2,`Rebote en la zona de reversión φ (${fmtN(depth*100,1)}%): zona clásica de venta en tendencia bajista.`]);}
    else if(depth<0.786){score-=1;factors.push([-1,`Rebote profundo (${fmtN(depth*100,1)}%): presión bajista en duda, pero estructura aún vendedora.`]);}
    else if(depth<1){score+=1;factors.push([+1,`El rebote recuperó ${fmtN(depth*100,1)}% del impulso bajista: la estructura empieza a girar.`]);}
    else{score+=3;factors.push([+3,"El rebote superó el 100% del impulso bajista: estructura bajista invalidada."]);}
    if(tg.back.p>=0.7){score-=2;factors.push([-2,`Histórico adverso: en rebotes comparables, ${pb}% de las veces volvió al mínimo antes de invalidar.`]);}
    else if(tg.back.p>=0.58){score-=1;factors.push([-1,`Histórico levemente adverso: ${pb}% de continuación bajista en casos comparables.`]);}
    else if(tg.back.p<0.4){score+=2;factors.push([+2,`Histórico favorable: solo ${pb}% de los rebotes comparables retomaron la caída.`]);}
    else{factors.push([0,`Histórico neutral: ${pb}% de continuación bajista en casos comparables.`]);}
  }
  if(rsi!=null){
    if(rsi<32){score+=1;factors.push([+1,`RSI(14) en ${fmtN(rsi,0)}: sobreventa.`]);}
    else if(rsi>68){score-=1;factors.push([-1,`RSI(14) en ${fmtN(rsi,0)}: sobrecompra.`]);}
    else factors.push([0,`RSI(14) en ${fmtN(rsi,0)}: zona neutral.`]);
  }
  let verdict,vClass;
  if(score>=5){verdict="COMPRA FUERTE";vClass="buy";}
  else if(score>=3){verdict="COMPRA";vClass="buy";}
  else if(score>=0){verdict="MANTENER / ESPERAR";vClass="hold";}
  else if(score>=-3){verdict="REDUCIR";vClass="sell";}
  else{verdict="VENTA";vClass="sell";}
  const nCond=tg.n;
  const confidence=nCond>=25&&Math.abs(score)>=4?"alta":nCond>=10?"media":"baja";
  return {horizonKey,H,thr,piv,sw,bt,cases,depth,tg,price,s200,s50,rsi,annVol,
          factors,score,verdict,vClass,confidence,nCond,isConfl,wStart};
}
function buildLadder(an){
  const {sw,price,depth,tg,cases}=an;
  const rows=[];
  const extProb={1.272:tg.e1272,1.618:tg.e1618,2:tg.e200};
  for(const e of [...EXTS].reverse()){
    rows.push({kind:"ext",ratio:fmtN(e*100,1)+"%",price:extPrice(sw,e),
      role:sw.up?"objetivo de extensión":"objetivo bajista",
      prob:extProb[e].p,pn:extProb[e].n});
  }
  rows.push({kind:"top",ratio:"0%",price:sw.B.p,
    role:sw.up?"máximo del impulso":"mínimo del impulso",
    prob:tg.back.p,pn:tg.back.n});
  for(const r of RETS){
    const p=levelPrice(sw,r);
    const passed=sw.up?price<p:price>p;
    rows.push({kind:"ret",ratio:fmtN(r*100,1)+"%",price:p,
      role:passed?(sw.up?"resistencia · superado":"soporte · superado")
                 :(sw.up?"soporte":"resistencia"),
      prob:passed?null:Math.min(0.97,survivalProb(cases,depth,r)),
      pn:passed?null:cases.length,
      golden:r===0.618,done:passed});
  }
  rows.push({kind:"base",ratio:"100%",price:sw.A.p,role:"invalidación",
    prob:clamp(1-tg.back.p,0,1),pn:tg.back.n});
  const above=rows.filter(r=>r.price>=price).sort((a,b)=>a.price-b.price);
  const below=rows.filter(r=>r.price<price).sort((a,b)=>b.price-a.price);
  for(const list of [above,below]){
    let m=1;
    for(const r of list){if(r.prob==null)continue;m=Math.min(m,r.prob);r.prob=m;}
  }
  rows.sort((a,b)=>b.price-a.price);
  return rows;
}

/* ---------------- módulo (una instancia por contenedor) ---------------- */
function initFibonacciModule(container,opts={}){
  if(!document.getElementById("fibm-styles")){
    const st=document.createElement("style");
    st.id="fibm-styles";st.textContent=CSS;
    document.head.appendChild(st);
  }
  const tickers=(opts.tickers||[]).map(t=>String(t).trim().toUpperCase()).filter(Boolean);
  const root=document.createElement("div");
  root.className="fibm";
  root.innerHTML=`
    <div class="f-picker" role="tablist" aria-label="Ticker a analizar">
      <span class="lbl">Posición:</span>
      ${tickers.map(t=>`<button class="f-chip" role="tab" data-sym="${esc(t)}">${esc(t)}</button>`).join("")}
      ${opts.demo?'<button class="f-chip" data-sym="DEMO">DEMO</button>':""}
      <form class="f-free">
        <input placeholder="Otro ticker" aria-label="Otro ticker" spellcheck="false">
        <button type="submit">Analizar</button>
      </form>
    </div>
    <div class="f-body"></div>`;
  container.appendChild(root);
  const body=root.querySelector(".f-body");
  const state={data:null,horizon:opts.horizon||"corto",an:null,sym:null};
  let chartGeom=null;

  root.querySelectorAll(".f-picker [data-sym]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.sym)));
  root.querySelector(".f-free").addEventListener("submit",e=>{
    e.preventDefault();
    go(root.querySelector(".f-free input").value);
  });

  function markActive(sym){
    root.querySelectorAll(".f-picker .f-chip").forEach(b=>
      b.classList.toggle("on",b.dataset.sym===sym));
  }

  async function go(symRaw){
    const sym=(symRaw||"").trim().toUpperCase();
    if(!sym)return;
    state.sym=sym;markActive(sym);
    body.innerHTML=`<div class="f-state">
      <div class="f-spinner" role="status" aria-label="Cargando"></div>
      <h4>Analizando <span class="f-mono">${esc(sym)}</span></h4>
      <div class="msg" data-role="loadmsg">Preparando…</div></div>`;
    const onStep=m=>{const el=body.querySelector('[data-role="loadmsg"]');if(el)el.textContent=m;};
    try{
      const data=sym==="DEMO"?demoData():await fetchHistory(sym,onStep);
      if(!data.bars||data.bars.length<120)
        throw new Error("Histórico insuficiente ("+(data.bars?.length||0)+" sesiones).");
      const spc=medianSpacingDays(data.bars);
      if(spc>2.6)
        throw new Error("La fuente devolvió velas de ~"+Math.round(spc)+" días en lugar de diarias; el análisis perdería sentido. Reintentá en unos segundos.");
      onStep("Detectando swings y calculando probabilidades…");
      state.data=data;
      state.an=analyze(data.bars,state.horizon);
      if(!state.an)throw new Error("No se pudo identificar un impulso significativo en la serie.");
      render();
    }catch(e){
      body.innerHTML=`<div class="f-state err">
        <h4>${e.notFound?"Ticker no encontrado":"No se pudieron obtener los datos"}</h4>
        <div class="msg">${e.notFound?`Yahoo Finance no reconoce <b class="f-mono">${esc(sym)}</b>.`:esc(e.message||"Error de red.")}</div>
        <div class="actions"><button class="f-chip" data-retry>Reintentar</button></div></div>`;
      body.querySelector("[data-retry]").addEventListener("click",()=>go(sym));
    }
  }

  function verdictSub(an){
    const sw=an.sw;
    if(sw.up){
      if(an.vClass==="buy")return an.depth<0.15
        ?"Estructura alcista sólida, pero el precio está pegado a máximos: comprar de forma escalonada o dejar órdenes en la zona φ del plan operativo."
        :`Impulso alcista con descuento del ${fmtN(an.depth*100,1)}% y estructura a favor: la zona actual ofrece relación riesgo-beneficio ${an.score>=5?"muy atractiva":"favorable"}.`;
      if(an.vClass==="hold")return an.depth<0.15
        ?"El precio está sobre el máximo del impulso, sin descuento: conviene esperar un retroceso hacia la zona φ antes de sumar."
        :"Señales mixtas: la estructura no habilita compra agresiva ni justifica vender. Esperar confirmación en los niveles marcados.";
      return "La estructura alcista está comprometida: el retroceso es demasiado profundo o el histórico juega en contra.";
    }
    if(an.vClass==="sell")return `Impulso bajista vigente con rebote del ${fmtN(an.depth*100,1)}%: zona de venta técnica; el histórico favorece la continuación de la caída.`;
    if(an.vClass==="hold")return "Impulso bajista, pero sin señal clara de continuación: mejor esperar definición en los niveles marcados.";
    return "El rebote está girando la estructura bajista: primeras señales de reversión alcista.";
  }
  function buildPlan(an){
    const {sw}=an,price=an.price;
    const gp=[levelPrice(sw,0.618),levelPrice(sw,0.5)];
    if(sw.up){
      const stop=sw.A.p*(1-0.01);
      const inZone=an.depth>=0.35&&an.depth<=0.85;
      const entry=inZone?price:(gp[0]+gp[1])/2;
      const t1=sw.B.p,t2=extPrice(sw,1.272);
      const rr=x=>fmtN((x-entry)/Math.max(entry-stop,1e-9),1);
      if(an.vClass==="sell")return {title:"Plan operativo",desc:"Sin plan de compra: estructura débil. Si hay tenencia, usar los rebotes hacia los niveles superiores para reducir.",rows:[
        ["Zona de reducción",`${fmtN(levelPrice(sw,0.382))} – ${fmtN(levelPrice(sw,0.236))}`,"down"],
        ["Invalidación del sesgo",fmtN(sw.B.p),"up"]]};
      return {title:"Plan operativo · compra",
        desc:inZone
          ?"El precio ya está en zona operable: entrada escalonada con stop bajo el origen del impulso."
          :"El precio aún no llegó a la zona φ: dejar orden escalonada en la zona 50–61,8% y operar solo si llega.",
        rows:[
          ["Entrada "+(inZone?"actual":"sugerida"),inZone?fmtN(entry):`${fmtN(gp[1])} – ${fmtN(gp[0])}`,"gold"],
          ["Stop loss",fmtN(stop),"down"],
          ["Objetivo 1 (máximo)",`${fmtN(t1)} · R:B ${rr(t1)}`,"up"],
          ["Objetivo 2 (ext. 127,2%)",`${fmtN(t2)} · R:B ${rr(t2)}`,"up"],
        ]};
    }
    const stop=sw.A.p*1.01;
    return {title:"Plan operativo · defensa",
      desc:"Estructura bajista: prioridad proteger capital. Rebotes hacia la zona φ del impulso bajista son oportunidades de reducción, no de compra.",
      rows:[
        ["Zona de reducción",`${fmtN(gp[1])} – ${fmtN(gp[0])}`,"gold"],
        ["Invalidación (giro alcista)",fmtN(stop),"up"],
        ["Riesgo a ext. 127,2%",fmtN(extPrice(sw,1.272)),"down"],
      ]};
  }
  function ladderHtml(rows,an){
    const price=an.price;
    const out=[];
    let nowInserted=false;
    for(const r of rows){
      if(!nowInserted&&r.price<price){
        out.push(`<div class="lrow now">
          <span class="ratio">▸</span>
          <span class="lvl"><span class="price">${fmtN(price)}</span><span class="role">precio actual · ${an.sw.up?"retroceso":"rebote"} ${fmtN(an.depth*100,1)}%</span></span>
          <span class="dist"></span></div>`);
        nowInserted=true;
      }
      const dist=(r.price/price-1)*100;
      const confl=an.isConfl(r.price);
      out.push(`<div class="lrow ${r.kind} ${r.done?"done":""}">
        <span class="ratio">${r.ratio}</span>
        <span class="lvl">
          <span class="price">${fmtN(r.price)}</span>
          <span class="role">${r.role}</span>
          ${r.golden&&!r.done?'<span class="f-badge">golden pocket ✦</span>':""}
          ${confl?'<span class="f-badge conf">confluencia</span>':""}
        </span>
        <span class="dist">${fmtPct(dist,1)}</span>
        ${r.prob!=null?`<span class="prob">
          <span class="bar"><i style="width:${Math.round(r.prob*100)}%"></i></span>
          <span class="pv">${Math.round(r.prob*100)}%</span></span>`:""}
      </div>`);
    }
    if(!nowInserted)out.push(`<div class="lrow now"><span class="ratio">▸</span>
      <span class="lvl"><span class="price">${fmtN(price)}</span><span class="role">precio actual</span></span><span class="dist"></span></div>`);
    return out.join("");
  }

  function render(){
    const {bars,meta}=state.data;
    const an=state.an,sw=an.sw,price=an.price;
    const prev=bars.length>1?bars[bars.length-2].c:price;
    const dPct=(price/prev-1)*100;
    const pB=Math.round(an.tg.back.p*100),pInv=100-pB;
    const ladder=buildLadder(an);
    const plan=buildPlan(an);
    const distBins=[["<38,2%",0,0.382],["38,2–50%",0.382,0.5],["50–61,8%",0.5,0.618],["61,8–78,6%",0.618,0.786],["78,6–100%",0.786,1],["≥100% (falla)",1,99]];
    const dCases=an.cases;
    const curBin=distBins.findIndex(([,a,b])=>an.depth>=a&&an.depth<b);
    const scorePos=clamp((an.score+8)/16,0,1)*100;

    body.innerHTML=`
    <div class="f-grid">
      <div class="f-ident">
        <div>
          <div class="sym">${esc(meta.symbol)}</div>
          <div class="name">${esc(meta.name||"")}</div>
          <div class="meta">${esc(meta.exchange)} · última vela ${fmtDateL(bars[bars.length-1].t)} · datos en vivo</div>
        </div>
        <div>
          <div class="px">${fmtN(price)}<small>${esc(meta.currency)}</small></div>
          <div style="margin-top:6px"><span class="f-delta ${dPct>=0?"up":"down"}">${fmtPct(dPct,2)} hoy</span></div>
        </div>
        <div class="right">
          <div class="f-seg" role="tablist" aria-label="Horizonte">
            ${Object.entries(HORIZONS).map(([k,h])=>
              `<button role="tab" aria-selected="${k===state.horizon}" class="${k===state.horizon?"on":""}" data-h="${k}" title="${h.desc}">${h.label}</button>`).join("")}
          </div>
        </div>
      </div>

      <section class="f-card f-verdict">
        <div class="main">
          <div class="v-label">Recomendación técnica · horizonte ${an.H.label.toLowerCase()}</div>
          <div class="v-word ${an.vClass}">${an.verdict}</div>
          <p class="v-sub">${verdictSub(an)}</p>
          <div class="v-conf">
            <span class="pill">confianza <b>${an.confidence}</b></span>
            <span class="pill f-mono">score <b>${an.score>0?"+":""}${an.score}</b></span>
            <span class="pill">muestra <b class="f-mono">${an.nCond}</b> swings comparables</span>
          </div>
          <div class="gauge" aria-hidden="true">
            <div class="track"><div class="pin" style="left:${scorePos}%"></div></div>
            <div class="lbls"><span>venta</span><span>neutral</span><span>compra</span></div>
          </div>
        </div>
        <div class="why">
          <h5>Por qué</h5>
          ${an.factors.map(([p,t])=>`
            <div class="why-row">
              <span class="pts ${p>0?"pos":p<0?"neg":"nil"}">${p>0?"+"+p:p}</span>
              <span class="txt">${t}</span>
            </div>`).join("")}
        </div>
      </section>

      <section class="f-card f-chartcard">
        <h5>Impulso ${sw.up?"alcista":"bajista"} analizado
          <span class="n">${fmtN(sw.A.p)} → ${fmtN(sw.B.p)} · ${fmtDateS(sw.A.t)} – ${fmtDateS(sw.B.t)} · umbral zigzag ${fmtN(an.thr,1)}%</span></h5>
        <div class="f-legend">
          <span class="lg"><i style="border-color:var(--fink)"></i>Precio</span>
          <span class="lg"><i style="border-color:${sw.up?"var(--fup)":"var(--fdown)"}"></i>Impulso A→B</span>
          <span class="lg"><i class="dash" style="border-color:var(--fink3)"></i>SMA200 (tendencia)</span>
          <span class="lg"><i style="border-color:var(--fgold)"></i>Retrocesos (soportes)</span>
          <span class="lg"><i class="dash" style="border-color:var(--fext)"></i>Extensiones (objetivos)</span>
          <span class="lg"><i class="band" style="background:var(--fgold-soft);border:1px solid var(--fgold-line)"></i>Golden pocket</span>
        </div>
        <details class="f-help">
          <summary>¿Cómo leer este gráfico? <span>guía rápida para principiantes</span></summary>
          <ol>
            <li><b>La flecha ${sw.up?"verde":"roja"} es el impulso:</b> el último movimiento fuerte del precio (de <b>A</b> a <b>B</b>). Todo Fibonacci se mide sobre ese tramo.</li>
            <li><b>Tras el impulso el precio retrocede</b> y suele frenarse en las <b>líneas doradas</b> (posibles ${sw.up?"soportes donde rebotar":"resistencias donde caer"}). La banda <b>golden pocket (61,8–65%)</b> es la más observada del mercado.</li>
            <li><b>Si retoma la dirección del impulso</b>, las <b>líneas azules punteadas</b> son los objetivos (extensiones 127% · 162% · 200%).</li>
            <li><b>La línea 100% es la invalidación:</b> si el precio la cruza, el conteo deja de valer y la lectura cambia.</li>
            <li>La <b>escalera de la derecha</b> lista cada nivel con su precio y la <b>probabilidad histórica</b> de que el precio lo toque, calculada con el propio comportamiento de este papel.</li>
          </ol>
        </details>
        <div class="chart-wrap">
          <canvas class="f-canvas" height="452" aria-label="Gráfico de precios con niveles de Fibonacci"></canvas>
          <div class="f-tip"></div>
        </div>
      </section>

      <section class="f-card f-ladder">
        <h5>Escalera de niveles φ <span class="n">prob. de toque antes de invalidar</span></h5>
        <div class="rows">${ladderHtml(ladder,an)}</div>
      </section>

      <section class="f-card f-scen ${sw.up?"up-s":"down-s"}">
        <div class="head"><h5>Escenario ${sw.up?"alcista":"bajista"} (continuación)</h5><span class="p-big">${pB}%</span></div>
        <p class="desc">${sw.up
          ?`El precio recupera el máximo del impulso (<b class="f-mono">${fmtN(sw.B.p)}</b>) antes de perder el piso. Habilita las extensiones como objetivos.`
          :`El precio vuelve al mínimo del impulso (<b class="f-mono">${fmtN(sw.B.p)}</b>) antes de superar el origen. Habilita extensiones bajistas.`}</p>
        <div class="kv">
          <div class="r"><span>Objetivo 127,2%</span><b class="${sw.up?"up":"down"}">${fmtN(extPrice(sw,1.272))} · ${Math.round(an.tg.e1272.p*100)}%</b></div>
          <div class="r"><span>Objetivo 161,8% (φ)</span><b class="${sw.up?"up":"down"}">${fmtN(extPrice(sw,1.618))} · ${Math.round(an.tg.e1618.p*100)}%</b></div>
          <div class="r"><span>Objetivo 200%</span><b class="${sw.up?"up":"down"}">${fmtN(extPrice(sw,2))} · ${Math.round(an.tg.e200.p*100)}%</b></div>
        </div>
      </section>

      <section class="f-card f-scen ${sw.up?"down-s":"up-s"}">
        <div class="head"><h5>Escenario ${sw.up?"bajista":"alcista"} (invalidación)</h5><span class="p-big">${pInv}%</span></div>
        <p class="desc">${sw.up
          ?`El precio pierde el origen del impulso (<b class="f-mono">${fmtN(sw.A.p)}</b>): el conteo se invalida y la estructura pasa a bajista.`
          :`El precio supera el origen del impulso bajista (<b class="f-mono">${fmtN(sw.A.p)}</b>): la estructura bajista queda invalidada.`}</p>
        <div class="kv">
          <div class="r"><span>Nivel de invalidación</span><b class="${sw.up?"down":"up"}">${fmtN(sw.A.p)}</b></div>
          <div class="r"><span>Distancia desde el precio</span><b>${fmtPct((sw.A.p/price-1)*100,1)}</b></div>
          <div class="r"><span>Referencia posterior</span><b class="${sw.up?"down":"up"}">${(()=>{const ref=sw.up?sw.A.p-0.272*sw.range:sw.A.p+0.272*sw.range;return ref>0?fmtN(ref):"—";})()}</b></div>
        </div>
      </section>

      <section class="f-card f-scen">
        <div class="head"><h5>${plan.title}</h5></div>
        <p class="desc">${plan.desc}</p>
        <div class="kv">${plan.rows.map(r=>`<div class="r"><span>${r[0]}</span><b class="${r[2]||""}">${r[1]}</b></div>`).join("")}</div>
      </section>

      <section class="f-card f-dist">
        <h5>¿Dónde terminan los ${sw.up?"retrocesos":"rebotes"} de ${esc(meta.symbol)}?
          <span class="n">n=${dCases.length} swings ${sw.up?"alcistas":"bajistas"} en los últimos 10 años</span></h5>
        ${distBins.map(([lb,a,b],i)=>{
          const n=dCases.filter(c=>c.depth>=a&&c.depth<b).length;
          const pct=dCases.length?n/dCases.length*100:0;
          return `<div class="drow ${i===curBin?"cur":""}">
            <span class="dl">${lb}</span>
            <span class="dbar"><i style="width:${pct}%"></i></span>
            <span class="dv">${fmtN(pct,0)}%<small>n=${n}</small></span></div>`;}).join("")}
        <p class="foot">Profundidad terminal de cada corrección respecto de su impulso (pivotes zigzag, umbral ${fmtN(an.thr,1)}%).
        La fila resaltada es la zona del ${sw.up?"retroceso":"rebote"} actual (${fmtN(an.depth*100,1)}%). Esta distribución alimenta las probabilidades de la escalera.</p>
      </section>

      <section class="f-card f-facts">
        <h5>Ficha técnica</h5>
        <div class="kv">
          <div class="r"><span>Histórico analizado</span><b>${fmtN(bars.length,0)} sesiones · desde ${fmtDateS(bars[0].t)}</b></div>
          <div class="r"><span>Swings detectados</span><b>${an.bt.up.length+an.bt.down.length}</b></div>
          <div class="r"><span>${sw.up?"Retroceso":"Rebote"} actual</span><b class="gold">${fmtN(an.depth*100,1)}%</b></div>
          <div class="r"><span>RSI(14)</span><b>${an.rsi==null?"—":fmtN(an.rsi,0)}</b></div>
          <div class="r"><span>SMA50 / SMA200</span><b>${fmtN(an.s50)} / ${fmtN(an.s200)}</b></div>
          <div class="r"><span>Volatilidad anualizada</span><b>${fmtN(an.annVol,0)}%</b></div>
          <div class="r"><span>Grado de swing</span><b>${an.H.desc}</b></div>
        </div>
      </section>

      <p class="f-method">
        <b>Método.</b> El impulso vigente se define por el extremo dominante de la ventana del horizonte y su origen.
        Sobre él se proyectan retrocesos (23,6 · 38,2 · 50 · 61,8 · 78,6%) y extensiones (127,2 · 161,8 · 200%).
        Las probabilidades se estiman contando, en los últimos 10 años del papel (velas diarias), qué hizo el precio en situaciones
        comparables, con corrección bayesiana suave para muestras chicas. Datos técnicos en vivo al momento de abrir
        el reporte — pueden diferir del snapshot del análisis fundamental. No constituye asesoramiento financiero.
      </p>
    </div>`;

    body.querySelectorAll(".f-seg [data-h]").forEach(b=>b.addEventListener("click",()=>{
      state.horizon=b.dataset.h;
      state.an=analyze(state.data.bars,state.horizon)||state.an;
      render();
    }));
    drawChart();
  }

  /* ---- gráfico canvas ---- */
  function drawChart(){
    const cv=body.querySelector(".f-canvas");
    if(!cv||!state.an)return;
    const an=state.an,{sw}=an;
    const bars=state.data.bars;
    const dpr=window.devicePixelRatio||1;
    const W=cv.clientWidth,Hh=452;
    if(W<10)return;
    cv.width=W*dpr;cv.height=Hh*dpr;
    const ctx=cv.getContext("2d");
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const cs=getComputedStyle(root);
    const C={ink:cs.getPropertyValue("--fink").trim(),ink3:cs.getPropertyValue("--fink3").trim(),
      gold:cs.getPropertyValue("--fgold").trim(),gink:cs.getPropertyValue("--fgold-ink").trim(),
      ext:cs.getPropertyValue("--fext").trim(),up:cs.getPropertyValue("--fup-ink").trim(),
      down:cs.getPropertyValue("--fdown-ink").trim(),line:"rgba(236,222,180,.07)"};
    const MONO=cs.getPropertyValue("--fmono");
    const padR=66,padB=26,padT=10,padL=8;
    const iw=W-padL-padR,ih=Hh-padT-padB;
    const last=bars.length-1;
    /* --- escala temporal: el impulso A→B es el protagonista; un poco de contexto antes de A --- */
    const impDur=Math.max(sw.B.i-sw.A.i,1);
    const prefix=Math.max(6,Math.round(impDur*0.18));
    let start=sw.A.i-prefix;
    if(last-start<50)start=last-50;      // piso de contexto para impulsos muy recientes
    start=Math.max(0,start);
    const vis=bars.slice(start);
    let lo=Math.min(...vis.map(b=>b.l)),hi=Math.max(...vis.map(b=>b.h));
    const wish=[sw.A.p,sw.B.p,...RETS.map(r=>levelPrice(sw,r)),extPrice(sw,1.272)];
    const span0=hi-lo;
    for(const p of wish){if(p>lo-span0*0.6&&p<hi+span0*0.6){lo=Math.min(lo,p);hi=Math.max(hi,p);}}
    const e161=extPrice(sw,1.618);
    if(e161<hi+(hi-lo)*0.25&&e161>lo-(hi-lo)*0.25){lo=Math.min(lo,e161);hi=Math.max(hi,e161);}
    const pad=(hi-lo)*0.05;lo-=pad;hi+=pad;
    const X=i=>padL+((i-start)/Math.max(vis.length-1,1))*iw;
    const Y=p=>padT+(1-(p-lo)/(hi-lo))*ih;
    chartGeom={start,X,Y,padL,iw,vis};
    const xFib0=X(Math.max(sw.A.i,start)),xEnd=W-padR;
    const yOf=p=>Math.round(Y(p))+.5;
    const inView=y=>y>=padT&&y<=Hh-padB;

    ctx.clearRect(0,0,W,Hh);

    /* --- 1. ZONAS sombreadas con significado (detrás de todo) --- */
    const bandFill=(pa,pb,color)=>{
      const y1=Y(pa),y2=Y(pb);
      ctx.fillStyle=color;
      ctx.fillRect(xFib0,Math.min(y1,y2),xEnd-xFib0,Math.abs(y2-y1));
      return [Math.min(y1,y2),Math.max(y1,y2)];
    };
    const zoneTag=(txt,yTop,yBot,color)=>{
      if(yBot-yTop<13)return;
      ctx.font="9.5px "+MONO;
      const w=ctx.measureText(txt).width;
      const yc=(yTop+yBot)/2;
      ctx.fillStyle="rgba(12,12,10,.5)";ctx.fillRect(xFib0+5,yc-6,w+6,12);
      ctx.fillStyle=color;ctx.textAlign="left";ctx.textBaseline="middle";
      ctx.fillText(txt,xFib0+8,yc+.5);
    };
    // zona de objetivos (extensiones): de B hasta la ext 161,8%
    const ez=bandFill(sw.B.p,extPrice(sw,1.618),"rgba(126,163,212,.06)");
    // zona de retroceso (38,2%–78,6%): donde el precio suele reaccionar
    const rz=bandFill(levelPrice(sw,0.382),levelPrice(sw,0.786),"rgba(217,168,78,.05)");
    // golden pocket (61,8–65%): la más observada
    const gz=bandFill(levelPrice(sw,0.618),levelPrice(sw,0.65),"rgba(217,168,78,.15)");

    /* --- 2. grilla + eje de precios --- */
    ctx.font="10.5px "+MONO;
    ctx.strokeStyle=C.line;ctx.lineWidth=1;
    const steps=5;
    for(let i=0;i<=steps;i++){
      const p=lo+(hi-lo)*i/steps,y=yOf(p);
      ctx.beginPath();ctx.moveTo(padL,y);ctx.lineTo(W-padR,y);ctx.stroke();
      ctx.fillStyle=C.ink3;ctx.textAlign="left";ctx.textBaseline="middle";
      ctx.fillText(fmtN(p,p>=1000?0:p>=10?1:2),W-padR+8,y);
    }
    ctx.textAlign="center";ctx.textBaseline="top";
    const tickN=clamp(Math.floor(iw/110)+1,2,Math.min(6,vis.length));
    for(let i=0;i<tickN;i++){
      const idx=Math.round(i*(vis.length-1)/(tickN-1));
      ctx.fillStyle=C.ink3;
      ctx.fillText(fmtDateS(vis[idx].t),clamp(X(start+idx),padL+22,W-padR-22),Hh-padB+7);
    }

    /* --- 3. líneas de nivel con etiqueta clara (fondo legible) --- */
    const levLabel=(txt,y,color,strong)=>{
      ctx.font=(strong?"600 ":"")+"9.5px "+MONO;
      const w=ctx.measureText(txt).width;
      ctx.fillStyle="rgba(12,12,10,.6)";
      ctx.fillRect(xEnd-w-7,y-13,w+6,12);
      ctx.fillStyle=color;ctx.textAlign="right";ctx.textBaseline="bottom";
      ctx.fillText(txt,xEnd-4,y-2);
    };
    const price=an.price;
    for(const r of RETS){
      const p=levelPrice(sw,r),y=yOf(p);if(!inView(y))continue;
      const gold=r===0.618;
      ctx.strokeStyle="rgba(217,168,78,"+(gold?".75":".34")+")";
      ctx.lineWidth=gold?1.5:1;
      ctx.beginPath();ctx.moveTo(xFib0,y);ctx.lineTo(xEnd,y);ctx.stroke();
      const role=(sw.up?price>=p:price<=p)?"soporte":"resistencia";
      const txt=fmtN(r*100,1)+"%"+(gold?" · "+role+" clave":r===0.5?" · "+role:"");
      levLabel(txt,y,gold?C.gink:"rgba(232,196,124,.8)",gold);
    }
    // extremos del impulso: B (0%) y A (100% = invalidación)
    {const y=yOf(sw.B.p);if(inView(y)){
      ctx.strokeStyle="rgba(236,234,217,.45)";ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(xFib0,y);ctx.lineTo(xEnd,y);ctx.stroke();
      levLabel("0% · "+(sw.up?"máximo":"mínimo"),y,"rgba(236,234,217,.75)",true);}}
    {const y=yOf(sw.A.p);if(inView(y)){
      ctx.strokeStyle="rgba(217,92,92,.5)";ctx.lineWidth=1;ctx.setLineDash([4,3]);
      ctx.beginPath();ctx.moveTo(xFib0,y);ctx.lineTo(xEnd,y);ctx.stroke();ctx.setLineDash([]);
      levLabel("100% · invalidación",y,C.down,true);}}
    // extensiones = objetivos
    ctx.setLineDash([5,4]);
    const extName={1.272:"objetivo 127%",1.618:"objetivo 162% (φ)",2:"objetivo 200%"};
    for(const e of EXTS){
      const p=extPrice(sw,e),y=yOf(p);if(!inView(y))continue;
      ctx.strokeStyle="rgba(126,163,212,.5)";ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(xFib0,y);ctx.lineTo(xEnd,y);ctx.stroke();
      levLabel(extName[e],y,"rgba(126,163,212,.9)",e===1.618);
    }
    ctx.setLineDash([]);

    /* --- etiquetas de zona (sobre las bandas) --- */
    zoneTag("zona de objetivos",ez[0],ez[1],"rgba(126,163,212,.8)");
    zoneTag("zona de retroceso",rz[0],gz[0],"rgba(232,196,124,.75)");
    zoneTag("golden pocket ✦",gz[0],gz[1],C.gink);

    /* --- 4. SMA200 (tendencia de fondo) --- */
    const closes=bars.map(b=>b.c);
    ctx.setLineDash([2,4]);ctx.strokeStyle="rgba(168,165,149,.5)";ctx.lineWidth=1.2;
    ctx.beginPath();let started=false;
    for(let i=start;i<bars.length;i++){
      const v=sma(closes,200,i);if(v==null)continue;
      const x=X(i),y=Y(v);
      if(!started){ctx.moveTo(x,y);started=true;}else ctx.lineTo(x,y);
    }
    ctx.stroke();ctx.setLineDash([]);

    /* --- 5. precio (área + línea) --- */
    const grd=ctx.createLinearGradient(0,padT,0,Hh-padB);
    grd.addColorStop(0,"rgba(236,234,217,.10)");grd.addColorStop(1,"rgba(236,234,217,0)");
    ctx.beginPath();
    vis.forEach((b,i)=>{const x=X(start+i),y=Y(b.c);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
    ctx.lineTo(X(last),Hh-padB);ctx.lineTo(X(start),Hh-padB);ctx.closePath();
    ctx.fillStyle=grd;ctx.fill();
    ctx.beginPath();
    vis.forEach((b,i)=>{const x=X(start+i),y=Y(b.c);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
    ctx.strokeStyle=C.ink;ctx.lineWidth=1.6;ctx.lineJoin="round";ctx.stroke();

    /* --- 6. flecha del IMPULSO A→B (el movimiento que Fibonacci mide) --- */
    const ax=X(sw.A.i),ay=Y(sw.A.p),bx=X(sw.B.i),by=Y(sw.B.p);
    const dirCol=sw.up?"63,179,116":"217,92,92";
    ctx.strokeStyle="rgba("+dirCol+",.55)";ctx.lineWidth=2;ctx.setLineDash([]);
    ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();
    const ang=Math.atan2(by-ay,bx-ax),ah=8;
    ctx.beginPath();ctx.moveTo(bx,by);
    ctx.lineTo(bx-ah*Math.cos(ang-0.42),by-ah*Math.sin(ang-0.42));
    ctx.lineTo(bx-ah*Math.cos(ang+0.42),by-ah*Math.sin(ang+0.42));
    ctx.closePath();ctx.fillStyle="rgba("+dirCol+",.8)";ctx.fill();
    {const mtxt="impulso "+fmtPct((sw.B.p/sw.A.p-1)*100,0);
     // etiqueta cerca de A (tramo bajo del impulso, zona despejada), desplazada del trazo
     const t=0.3,mx=ax+t*(bx-ax),my=ay+t*(by-ay);
     ctx.font="600 10px "+MONO;const mw=ctx.measureText(mtxt).width;
     const lx=clamp(mx-mw/2-4,padL,xEnd-mw-8),ly=my+(sw.up?10:-24);
     ctx.fillStyle="rgba(12,12,10,.66)";ctx.fillRect(lx,ly,mw+8,14);
     ctx.fillStyle=sw.up?C.up:C.down;ctx.textAlign="left";ctx.textBaseline="middle";
     ctx.fillText(mtxt,lx+4,ly+8);}

    /* --- 7. pivotes A y B con nombre --- */
    for(const [pt,isB] of [[sw.A,false],[sw.B,true]]){
      const x=X(pt.i),y=Y(pt.p);
      ctx.beginPath();ctx.arc(x,y,4.5,0,7);
      ctx.fillStyle=C.gold;ctx.fill();
      ctx.lineWidth=2;ctx.strokeStyle="#0c0c0a";ctx.stroke();
      const lab=isB?"B · fin":"A · inicio";
      ctx.font="600 9.5px "+MONO;const lw=ctx.measureText(lab).width;
      const lx=clamp(x-lw/2-3,padL,W-padR-lw-6);
      const ly=isB===sw.up?y-22:y+8;
      ctx.fillStyle="rgba(12,12,10,.6)";ctx.fillRect(lx,ly,lw+6,13);
      ctx.fillStyle=C.gink;ctx.textAlign="left";ctx.textBaseline="top";
      ctx.fillText(lab,lx+3,ly+2);
    }

    /* --- 8. precio actual (dónde estás ahora) --- */
    const py=yOf(an.price);
    ctx.strokeStyle="rgba(236,234,217,.4)";ctx.setLineDash([1,3]);
    ctx.beginPath();ctx.moveTo(padL,py);ctx.lineTo(W-padR,py);ctx.stroke();ctx.setLineDash([]);
    const ptxt=fmtN(an.price);
    ctx.font="600 10.5px "+MONO;
    const tw=ctx.measureText(ptxt).width+12;
    ctx.fillStyle="#26241c";ctx.strokeStyle="rgba(217,168,78,.55)";ctx.lineWidth=1;
    const rx=W-padR+2,ry=py-9,rw=Math.max(tw,padR-6),rh=18,rr2=4;
    ctx.beginPath();
    ctx.moveTo(rx+rr2,ry);ctx.arcTo(rx+rw,ry,rx+rw,ry+rh,rr2);ctx.arcTo(rx+rw,ry+rh,rx,ry+rh,rr2);
    ctx.arcTo(rx,ry+rh,rx,ry,rr2);ctx.arcTo(rx,ry,rx+rw,ry,rr2);ctx.closePath();
    ctx.fill();ctx.stroke();
    ctx.fillStyle=C.gold;ctx.textAlign="left";ctx.textBaseline="middle";
    ctx.fillText(ptxt,W-padR+8,py+0.5);
    // etiqueta "acá estás" al borde izquierdo de la línea de precio
    ctx.font="600 9px "+MONO;const nowT="◂ precio hoy";
    ctx.fillStyle="rgba(12,12,10,.55)";ctx.fillRect(padL+2,py-6,ctx.measureText(nowT).width+6,12);
    ctx.fillStyle=C.gink;ctx.textAlign="left";ctx.textBaseline="middle";
    ctx.fillText(nowT,padL+5,py+.5);

    bindTooltip(cv);
  }
  function bindTooltip(cv){
    if(cv._tipBound)return;cv._tipBound=true;
    const tip=body.querySelector(".f-tip");
    cv.addEventListener("mousemove",e=>{
      if(!chartGeom||!tip)return;
      const r=cv.getBoundingClientRect();
      const mx=e.clientX-r.left;
      const {start,vis,X}=chartGeom;
      const idx=clamp(Math.round((mx-chartGeom.padL)/chartGeom.iw*(vis.length-1)),0,vis.length-1);
      const b=vis[idx];
      const an=state.an,sw=an.sw;
      const depthAt=sw.up?(sw.B.p-b.c)/sw.range:(b.c-sw.B.p)/sw.range;
      const inRetr=(start+idx)>=sw.B.i&&depthAt>-0.05&&depthAt<1.5;
      tip.style.display="block";
      tip.innerHTML=`<div class="d">${fmtDateL(b.t)}</div>
        <div class="row"><span>Cierre</span><b>${fmtN(b.c)}</b></div>
        <div class="row"><span>Máx / Mín</span><b>${fmtN(b.h)} / ${fmtN(b.l)}</b></div>
        ${inRetr?`<div class="row"><span>${sw.up?"Retroceso":"Rebote"}</span><b>${fmtN(clamp(depthAt,0,9)*100,1)}%</b></div>`:""}`;
      const tw=tip.offsetWidth;
      tip.style.left=clamp(X(start+idx)-tw/2,4,cv.clientWidth-tw-4)+"px";
      tip.style.top="12px";
    });
    cv.addEventListener("mouseleave",()=>{if(tip)tip.style.display="none";});
  }

  window.addEventListener("resize",drawChart,{passive:true});
  if(opts.auto!==false&&(tickers.length||opts.demo))go(tickers[0]||"DEMO");
  return {analyzeTicker:go};
}
window.initFibonacciModule=initFibonacciModule;
})();
