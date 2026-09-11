/* FotoJoes GETIN – Update-Gate ab V33.
   Regel: Ist ein Client 5 Hauptversionen oder mehr hinter dem Serverstand,
   wird die Oberfläche blockiert und einmal automatisch frisch geladen.
*/
(()=>{
  const current=Number(window.FOTOJO_GETIN_BUILD||0);
  if(!current) return;
  const VERSION_URL="/fotojoe-version.json";
  let lastCheck=0;
  let checking=false;

  function gate(latest){
    if(document.getElementById("fotojoe-force-update")) return;
    const wrap=document.createElement("div");
    wrap.id="fotojoe-force-update";
    wrap.setAttribute("role","dialog");
    wrap.setAttribute("aria-modal","true");
    wrap.innerHTML=`<div class="fju-card"><div class="fju-mark">FotoJoes</div><h2>Update erforderlich</h2><p>Für FotoJoes ist eine wichtige Aktualisierung verfügbar. Die Bestellung kann erst nach dem Update fortgesetzt werden.</p><div class="fju-small">Installiert: V${current} · Aktuell: V${latest}</div><button type="button" id="fotojoe-force-update-btn">Jetzt aktualisieren</button></div>`;
    const style=document.createElement("style");
    style.textContent=`#fotojoe-force-update{position:fixed;inset:0;z-index:2147483647;background:rgba(20,20,20,.86);display:grid;place-items:center;padding:24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}.fju-card{width:min(520px,100%);background:#fff;color:#171717;border-radius:18px;padding:30px;box-shadow:0 28px 90px #0008;text-align:center}.fju-mark{font-weight:950;color:#ef3a19;letter-spacing:.02em}.fju-card h2{margin:8px 0 12px;font-size:28px}.fju-card p{line-height:1.5}.fju-small{margin:16px 0;color:#666;font-size:13px}.fju-card button{width:100%;border:0;border-radius:10px;padding:15px 18px;background:#ef3a19;color:#fff;font-weight:950;font-size:17px;cursor:pointer}`;
    document.head.appendChild(style);
    document.body.appendChild(wrap);
    document.getElementById("fotojoe-force-update-btn")?.addEventListener("click",()=>performUpdate(latest,true));
  }

  async function clearFotoJoeCaches(){
    if(!("caches" in window)) return;
    try{
      const keys=await caches.keys();
      await Promise.all(keys.filter(k=>k.startsWith("fotojoe-app-")||k.startsWith("fotojoes-app-")).map(k=>caches.delete(k)));
    }catch(_e){}
  }

  async function performUpdate(latest,manual=false){
    try{
      if("serviceWorker" in navigator){
        const regs=await navigator.serviceWorker.getRegistrations();
        for(const reg of regs){
          try{await reg.update();}catch(_e){}
          try{reg.waiting?.postMessage("SKIP_WAITING");}catch(_e){}
        }
      }
      await clearFotoJoeCaches();
    }catch(_e){}
    const u=new URL(location.href);
    u.searchParams.set("fotojoe_update",String(latest));
    u.searchParams.set("_fresh",String(Date.now()));
    if(manual){
      try{sessionStorage.removeItem(`fotojoe_force_attempt_${latest}`);}catch(_e){}
    }
    location.replace(u.toString());
  }

  async function check(){
    if(checking) return;
    checking=true;
    lastCheck=Date.now();
    try{
      const r=await fetch(`${VERSION_URL}?_=${Date.now()}`,{cache:"no-store",headers:{"cache-control":"no-cache"}});
      if(!r.ok) return;
      const cfg=await r.json();
      const latest=Number(cfg.latestBuild||0);
      const lag=Number(cfg.forceIfBehindBy||5);
      if(!latest || latest<=current || latest-current<lag) return;
      gate(latest);
      const key=`fotojoe_force_attempt_${latest}`;
      let attempted=false;
      try{attempted=sessionStorage.getItem(key)==="1";}catch(_e){}
      if(!attempted){
        try{sessionStorage.setItem(key,"1");}catch(_e){}
        window.setTimeout(()=>performUpdate(latest,false),700);
      }
    }catch(_e){
      // Kein Netz = kein Update erzwingen; bestehende Upload-Logik behandelt Offline-Fälle separat.
    }finally{
      checking=false;
    }
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",check,{once:true});
  else check();
  document.addEventListener("visibilitychange",()=>{
    if(document.visibilityState==="visible" && Date.now()-lastCheck>30*60*1000) check();
  });
})();
