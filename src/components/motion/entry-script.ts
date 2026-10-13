/** Runs before paint and independently of React: failed chunks cannot trap the visitor. */
export const entryScript = String.raw`(()=>{
  const root=document.documentElement;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const connection=navigator.connection;
  if(location.pathname!=='/'||location.hash||reduced.matches||connection?.saveData||performance.getEntriesByType('navigation')[0]?.type==='back_forward')return;
  let closed=false,ready=false,progress=0,exitTimer,minTimer;
  const started=performance.now();
  const finish=()=>{
    if(closed)return;
    closed=true;
    clearTimeout(safety);clearTimeout(exitTimer);clearTimeout(minTimer);
    delete root.dataset.entry;root.style.removeProperty('--entry-progress');
    document.removeEventListener('keydown',key,true);
    document.removeEventListener('click',click,true);
    document.removeEventListener('visibilitychange',visibility);
    window.removeEventListener('pagehide',finish);
    reduced.removeEventListener('change',preferences);
    connection?.removeEventListener?.('change',preferences);
    window.dispatchEvent(new Event('mansa:entry-complete'));
  };
  const key=event=>{if(event.key==='Tab'||event.key==='Escape')finish()};
  const click=event=>{if(event.target instanceof Element&&event.target.closest('[data-entry-skip]')){finish();document.querySelector('.skip-link')?.focus({preventScroll:true})}};
  const preferences=()=>{if(reduced.matches||connection?.saveData)finish()};
  const visibility=()=>{if(document.hidden)finish()};
  const safety=setTimeout(finish,4500);
  root.dataset.entry='loading';
  document.addEventListener('keydown',key,true);
  document.addEventListener('click',click,true);
  document.addEventListener('visibilitychange',visibility);
  window.addEventListener('pagehide',finish);
  reduced.addEventListener('change',preferences);
  connection?.addEventListener?.('change',preferences);
  const advance=value=>{
    if(closed)return;
    progress+=value;
    root.style.setProperty('--entry-progress',String(progress/100));
    document.querySelector('[data-entry-progress]')?.setAttribute('aria-valuenow',String(progress));
    if(progress===100&&!ready){
      ready=true;
      minTimer=setTimeout(()=>{
        if(closed)return;
        root.dataset.entry='revealing';
        window.dispatchEvent(new Event('mansa:entry-reveal'));
        exitTimer=setTimeout(finish,640);
      },Math.max(900,1400-(performance.now()-started)));
    }
  };
  const boot=()=>{
    if(closed)return;
    advance(20);
    Promise.resolve(document.fonts?.load('500 16px "Instrument Sans"')).then(()=>advance(40),()=>advance(40));
    const logo=document.querySelector('[data-entry-logo]');
    if(!logo||logo.complete)advance(40);
    else {const loaded=()=>{logo.removeEventListener('load',loaded);logo.removeEventListener('error',loaded);advance(40)};logo.addEventListener('load',loaded);logo.addEventListener('error',loaded)}
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})()`;
