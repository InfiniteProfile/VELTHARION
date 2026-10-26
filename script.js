(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const els = { grid:$('#profile-grid'), sentinel:$('#feed-sentinel'), count:$('#stream-count'), main:$('#app-main'), hero:$('#hero'), explorer:$('.explorer'), detail:$('#detail-view'), detailArt:$('#detail-art'), search:$('#search-overlay'), settings:$('#settings-overlay'), searchInput:$('#search-input'), searchError:$('#search-error'), searchHelp:$('#search-help'), searchLabel:$('#search-label'), suggestions:$('#suggestion-list'), results:$('#search-results'), announcer:$('#announcer'), toast:$('#toast') };
  const NAME_A=['Vael','Nyx','Zar','Vel','Aeth','Kry','Xav','Ori','Zeph','Thal','Vey','Cael','Rhy','Syl','Ely','Dra','Mora','Ith','Zyra','Kael','Lun','Ari','Vor','Nym','Eira','Sol','Myth','Rav','Oryn','Tae','Aven','Lior','Quin','Ser','Vexa','Noct','Ily','Zeth','Alth','Cyr'];
  const NAME_B=['thorin','avelle','ethion','moryn','ravis','salune','enthiel','ivanth','yraen','veris','oriel','athis','evryn','alara','yss','andor','elyth','ovain','arion','iselle','avorn','ythea','irion','aelis','orath','ivelle','yrian','ethra','ovelle','aeron','isara','ythorn','aveth','orin','elyra','anthir','esque','yvara','orune','aeth'];
  const CATEGORIES=['Astral Architect','Void Wanderer','Prismatic Soul','Crimson Oracle','Lunar Cipher','Obsidian Dreamer','Celestial Nomad','Eclipse Keeper'];
  const COLORS=[['#8b5cf6','#d61f45'],['#a78bfa','#e94b79'],['#6657dc','#ef704f'],['#c15ce8','#6245bd'],['#7a62ff','#b52e65'],['#b88bff','#d93656'],['#4e66bd','#ce4b82'],['#8b5cf6','#ed8d5a'],['#b35de0','#503d9c'],['#7c4dff','#ed4264']];
  const SHAPES=['crystal','orbital','prism','monolith','sigil','eclipse','lattice','shard'];
  const defaults={contrast:false,compact:false,reducedEffects:false,animations:true,history:false};
  let settings=loadSettings(), feedNext='1', batchBusy=false, observer=null, toastTimer=0, currentId=null, returnScroll=0, searchMode='id', historyIds=[], feedCheckQueued=false;
  function loadSettings(){try{const v=JSON.parse(localStorage.getItem('veltharion-settings')||'{}');return {...defaults,...(v&&typeof v==='object'?v:{})}}catch{return {...defaults}}}
  function saveSettings(){try{localStorage.setItem('veltharion-settings',JSON.stringify(settings))}catch{}}
  function loadHistory(){try{const v=JSON.parse(localStorage.getItem('veltharion-search-history')||'[]');return Array.isArray(v)?v.filter(x=>typeof x==='string').slice(0,8):[]}catch{return []}}
  function storeHistory(id){if(!settings.history)return;historyIds=[id,...historyIds.filter(x=>x!==id)].slice(0,8);try{localStorage.setItem('veltharion-search-history',JSON.stringify(historyIds))}catch{}}
  function applySettings(){document.documentElement.classList.toggle('high-contrast',!!settings.contrast);document.documentElement.classList.toggle('compact',!!settings.compact);document.documentElement.classList.toggle('reduced-effects',!!settings.reducedEffects);document.documentElement.classList.toggle('no-animations',!settings.animations||matchMedia('(prefers-reduced-motion: reduce)').matches);$$('[data-setting]').forEach(input=>input.checked=!!settings[input.dataset.setting]);}
  function validId(s){return typeof s==='string'&&/^[1-9][0-9]*$/.test(s)}
  function hashString(str, seed=2166136261){let h=seed>>>0;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)>>>0;h^=h>>>13;}return h>>>0}
  function hashPair(str, seed){return hashString(str,seed)>>>0}
  function seeded(id, salt){return hashPair(id,hashString(salt,0x9e3779b9))}
  function pick(arr,n){return arr[n%arr.length]}
  function profile(id){const h=seeded(id,'core'),h2=seeded(id,'name-2'),h3=seeded(id,'art-3'),h4=seeded(id,'meta-4'),c=pick(COLORS,h3),shape=pick(SHAPES,h4),name=NAME_A[h%NAME_A.length]+NAME_B[h2%NAME_B.length];const category=pick(CATEGORIES,h4>>>4);const signatures={crystal:'Crystalline geometry with a distant orbital halo',orbital:'Layered orbital rings suspended in deep space',prism:'Refracted prism light across a dark dimension',monolith:'A solitary monolith traced with luminous seams',sigil:'An intricate sigil surrounded by drifting light',eclipse:'An eclipsed core with a radiant corona',lattice:'A dimensional lattice of intersecting light',shard:'Floating shards in a violet-crimson field'};return {id,name,category,signature:signatures[shape],shape,c1:c[0],c2:c[1],seed:h,seed2:h2,seed3:h3,seed4:h4,description:`${name} exists at the edge of the known identity frontier. Its ${shape} signature marks a distinct point in the VELTHARION universe — generated from identity ${id}, and always returning to the same form.`}}
  function svgArtwork(p, large=false){const n=p.seed, n2=p.seed2, n3=p.seed3, c1=p.c1,c2=p.c2;const cx=120+(n%41)-20,cy=120+(n2%41)-20,r=35+(n3%27),rot=n%360, rings=2+n2%4, points=[];for(let i=0;i<7+(n%5);i++){const a=(i*137.5+(n%90))*Math.PI/180,rr=63+(hashString(p.id+'p'+i)%54);points.push(`<circle cx="${120+Math.cos(a)*rr}" cy="${120+Math.sin(a)*rr}" r="${1+(i%2)}" fill="${i%2?c1:c2}" opacity=".${3+(i%6)}"/>`)}let shape='';if(p.shape==='crystal'||p.shape==='shard'){shape=`<g transform="translate(${cx} ${cy}) rotate(${rot})"><path d="M0 ${-r*1.65} L${r*.82} ${-r*.48} L${r*.68} ${r*.82} L0 ${r*1.42} L${-r*.88} ${r*.65} L${-r*.75} ${-r*.52}Z" fill="url(#core)" stroke="${c1}" stroke-opacity=".8"/><path d="M0 ${-r*1.65} L0 ${r*1.42} L${r*.68} ${r*.82} L${r*.82} ${-r*.48}Z" fill="${c2}" opacity=".23"/><path d="M0 ${-r*1.65} L${r*.82} ${-r*.48} L0 ${-r*.12} L${-r*.75} ${-r*.52}Z" fill="#fff" opacity=".12"/></g>`}else if(p.shape==='orbital'||p.shape==='eclipse'){shape=`<circle cx="${cx}" cy="${cy}" r="${r*.7}" fill="url(#core)"/><circle cx="${cx-8}" cy="${cy-8}" r="${r*.53}" fill="#0b0b13"/><ellipse cx="${cx}" cy="${cy}" rx="${r*1.65}" ry="${r*.58}" transform="rotate(${rot} ${cx} ${cy})" fill="none" stroke="${c1}" stroke-width="2"/><ellipse cx="${cx}" cy="${cy}" rx="${r*1.8}" ry="${r*.78}" transform="rotate(${-rot/2} ${cx} ${cy})" fill="none" stroke="${c2}" stroke-opacity=".7"/>`}else if(p.shape==='prism'){shape=`<g transform="translate(${cx} ${cy}) rotate(${rot})"><path d="M0 ${-r*1.4} L${r} ${r*.9} L${-r} ${r*.9}Z" fill="url(#core)" stroke="${c1}"/><path d="M0 ${-r*1.4} L0 ${r*.9} L${r} ${r*.9}Z" fill="${c2}" opacity=".25"/></g>`}else if(p.shape==='monolith'){shape=`<path d="M${cx-r*.5} ${cy-r*1.4} L${cx+r*.4} ${cy-r*1.1} L${cx+r*.6} ${cy+r*1.2} L${cx-r*.45} ${cy+r*1.4}Z" fill="url(#core)" stroke="${c1}"/><path d="M${cx} ${cy-r*1.2} L${cx+r*.4} ${cy-r*1.1} L${cx+r*.6} ${cy+r*1.2} L${cx} ${cy+r*1.3}Z" fill="${c2}" opacity=".23"/>`}else if(p.shape==='sigil'){shape=`<g transform="translate(${cx} ${cy}) rotate(${rot})" fill="none" stroke="${c1}" stroke-width="2"><path d="M0 ${-r*1.3} L${r} 0 L0 ${r*1.3} L${-r} 0Z"/><path d="M0 ${-r} L${r*.75} ${r*.6} L${-r*.75} ${r*.6}Z" stroke="${c2}"/><circle r="${r*.35}"/></g>`}else{shape=`<g transform="translate(${cx} ${cy}) rotate(${rot})" stroke="${c1}" fill="none"><path d="M0 ${-r*1.3} L${r} ${-r*.6} L${r} ${r*.6} L0 ${r*1.3} L${-r} ${r*.6} L${-r} ${-r*.6}Z"/><path d="M${-r} ${-r*.6} L${r} ${r*.6} M${r} ${-r*.6} L${-r} ${r*.6} M0 ${-r*1.3} L0 ${r*1.3}" stroke="${c2}" stroke-opacity=".8"/></g>`}let ringSvg='';for(let i=0;i<rings;i++){const rr=38+i*15;ringSvg+=`<ellipse cx="120" cy="120" rx="${rr+15}" ry="${rr*.45+12}" transform="rotate(${(n+i*61)%180} 120 120)" fill="none" stroke="${i%2?c2:c1}" stroke-opacity=".${12+i*3}" stroke-width="${i===0?1.5:1}"/>`}const bg=large?`<rect width="240" height="240" fill="#0a0912"/>`:`<rect width="240" height="240" fill="#0a0912"/>`;return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" role="img" aria-label="Procedural artwork for ${p.name}"><defs><radialGradient id="bg"><stop stop-color="${c1}" stop-opacity=".23"/><stop offset="1" stop-color="#090910" stop-opacity="0"/></radialGradient><linearGradient id="core" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${c1}"/><stop offset=".55" stop-color="#242032"/><stop offset="1" stop-color="${c2}"/></linearGradient><filter id="blur"><feGaussianBlur stdDeviation="10"/></filter></defs>${bg}<circle cx="120" cy="120" r="112" fill="url(#bg)"/><circle cx="${cx}" cy="${cy}" r="${r*1.8}" fill="${c1}" opacity=".09" filter="url(#blur)"/>${ringSvg}<g opacity=".65">${points.join('')}</g>${shape}<path d="M18 29h12M24 23v12M202 205h12M208 199v12" stroke="${c1}" stroke-opacity=".6" stroke-width="1"/><path d="M14 14h18M14 14v18M226 14h-18M226 14v18M14 226h18M14 226v-18M226 226h-18M226 226v-18" fill="none" stroke="#d8d9e2" stroke-opacity=".25"/></svg>`}
  function cardHTML(p){return `<button class="profile-card" data-id="${p.id}" style="--accent:${p.c1};--accent2:${p.c2}" aria-label="Open identity ${p.name}, ID ${p.id}"><span class="avatar">${svgArtwork(p)}</span><span class="card-content"><span class="profile-name">${escapeHTML(p.name)}</span><span class="profile-id">ID / ${p.id}</span><span class="profile-category"><i class="category-dot"></i>${p.category}</span></span><span class="card-arrow" aria-hidden="true">↗</span></button>`}
  function escapeHTML(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function incrementDecimal(s){let a=s.split(''),i=a.length-1;while(i>=0&&a[i]==='9'){a[i]='0';i--}if(i<0)a.unshift('1');else a[i]=String.fromCharCode(a[i].charCodeAt(0)+1);return a.join('')}
  function addBatch(size=24){
    if(batchBusy || document.visibilityState==='hidden') return;
    batchBusy=true;
    let failed=false;
    try{
      const frag=document.createDocumentFragment();
      for(let i=0;i<size;i++){
        const id=feedNext;
        const p=profile(id);
        const wrap=document.createElement('div');
        wrap.innerHTML=cardHTML(p);
        frag.append(wrap.firstElementChild);
        feedNext=incrementDecimal(id);
      }
      els.grid.append(frag);
      els.count.innerHTML=`SEQUENCE <b>000001 → ${feedNext}</b>`;
      els.announcer.textContent=`Identities prepared. Next identity ${feedNext}.`;
      trimFeed();
    }catch(e){
      failed=true;
      console.error('Feed batch failed',e);
      showToast('Could not prepare identities. Retrying…');
    }finally{
      batchBusy=false;
      // Recheck after layout settles. This prevents an observer/sentinel from
      // getting stranded when the viewport is taller than the remaining feed.
      if(failed) setTimeout(()=>queueFeedCheck(true),250);
      else queueFeedCheck(false);
    }
  }
  function trimFeed(){
    // Bound DOM size without double-applying browser scroll anchoring.
    const max=180,remove=36;
    const cards=$$('.profile-card',els.grid);
    if(cards.length<=max) return;
    const firstVisible=cards.findIndex(c=>c.getBoundingClientRect().bottom>0);
    // Never remove cards intersecting the viewport; keep the trim safely behind it.
    if(firstVisible<remove) return;
    const anchor=cards[firstVisible];
    const before=anchor.getBoundingClientRect().top;
    for(let i=0;i<remove;i++) cards[i].remove();
    const after=anchor.getBoundingClientRect().top;
    const delta=after-before;
    if(delta) window.scrollBy(0,delta);
  }
  function nearFeedEnd(){
    return els.sentinel.getBoundingClientRect().top <= window.innerHeight + 1800;
  }
  function queueFeedCheck(force){
    if(feedCheckQueued) return;
    feedCheckQueued=true;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      feedCheckQueued=false;
      if(document.visibilityState!=='hidden' && (force || nearFeedEnd())) addBatch(24);
    }));
  }
  function setupObserver(){
    if(observer) observer.disconnect();
    // Scroll/resize checks complement the observer, and also recover if an
    // observer callback is skipped by a browser or the sentinel is already in view.
    const check=()=>{if(nearFeedEnd()) queueFeedCheck(false)};
    window.addEventListener('scroll',throttle(check,80),{passive:true});
    window.addEventListener('resize',throttle(check,80),{passive:true});
    if('IntersectionObserver' in window){
      observer=new IntersectionObserver(entries=>{
        if(entries.some(e=>e.isIntersecting)) queueFeedCheck(false);
      },{rootMargin:'1800px 0px'});
      observer.observe(els.sentinel);
    }
    queueFeedCheck(false);
  }
  function throttle(fn,wait){let last=0;return(...args)=>{const now=Date.now();if(now-last>=wait){last=now;fn(...args)}}}
  function showToast(msg){els.toast.textContent=msg;els.toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>els.toast.classList.remove('show'),2300)}
  function setView(view){const detail=view==='detail';els.main.classList.toggle('hidden',detail);els.detail.classList.toggle('hidden',!detail);if(!detail){window.scrollTo({top:returnScroll,behavior:settings.animations?'smooth':'auto'});}
  }
  function openProfile(id, push=true){if(!validId(id)){showToast('That identity number is not valid.');return}if(!els.detail.classList.contains('hidden')&&currentId!==null)returnScroll=returnScroll;else returnScroll=window.scrollY;const p=profile(id);currentId=id;$('#detail-name').textContent=p.name;$('#detail-id').textContent=p.id;$('#detail-record').textContent=p.id;$('#detail-category').textContent=p.category;$('#detail-signature').textContent=p.signature;$('#detail-description').textContent=p.description;els.detailArt.innerHTML=svgArtwork(p,true);setView('detail');if(push){const url=new URL(location.href);url.hash=`profile/${id}`;history.pushState({view:'profile',id,returnScroll},'',url)}storeHistory(id);closeOverlay(els.search);}
  function backToFeed(fromHistory=false){currentId=null;setView('feed');if(!fromHistory){const url=new URL(location.href);url.hash='explore';history.pushState({view:'feed'},'',url)} }
  function navigateRelative(direction){if(!currentId)return;let id=currentId;if(direction<0){if(id.length>1){id=id.slice(0,-1);id=incrementDecimal(id);/* corrected below: previous by decimal decrement */id=decrementDecimal(currentId)}else id='1'}else id=incrementDecimal(id);openProfile(id,true)}
  function decrementDecimal(s){let a=s.split(''),i=a.length-1;while(i>=0&&a[i]==='0'){a[i]='9';i--}if(i>=0)a[i]=String.fromCharCode(a[i].charCodeAt(0)-1);if(a[0]==='0'&&a.length>1)a.shift();const out=a.join('');return out==='0'?'1':out}
  function openOverlay(el){el.classList.remove('hidden');document.body.style.overflow='hidden';const inp=$('input',el);if(inp)setTimeout(()=>inp.focus(),50)}
  function closeOverlay(el){el.classList.add('hidden');if(els.search.classList.contains('hidden')&&els.settings.classList.contains('hidden'))document.body.style.overflow='';}
  function renderSuggestions(){const ids=historyIds.length&&settings.history?historyIds:['2048','17','999999','731'];els.suggestions.innerHTML=ids.slice(0,5).map(id=>`<button class="suggestion-chip" data-id="${id}">ID / ${id}</button>`).join('')}
  function setSearchMode(mode){searchMode=mode;$$('.search-tab').forEach(b=>{const active=b.dataset.mode===mode;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active))});els.searchError.textContent='';els.searchInput.value='';els.results.innerHTML='';if(mode==='id'){els.searchLabel.textContent='Exact positive decimal ID';els.searchInput.inputMode='numeric';els.searchInput.placeholder='Enter any identity number…';els.searchHelp.textContent='No digit limit. Your ID is kept exact, even when it is extraordinarily long.'}else if(mode==='name'){els.searchLabel.textContent='Search generated names';els.searchInput.inputMode='search';els.searchInput.placeholder='Try Vael, Nyx, or a full name…';els.searchHelp.textContent='Search checks a deterministic sample of generated identities; it does not scan every possible identity.'}else{els.searchLabel.textContent='Discover an identity';els.searchInput.inputMode='numeric';els.searchInput.placeholder='Optional starting identity ID';els.searchHelp.textContent='Leave empty to discover a fresh destination, or enter a valid ID to explore nearby identities.'}}
  function randomId(){const bytes=new Uint32Array(2);if(window.crypto&&crypto.getRandomValues)crypto.getRandomValues(bytes);else{bytes[0]=Date.now()>>>0;bytes[1]=Math.floor(Math.random()*4294967295)}return String((bytes[0]%900000)+100000)+String(bytes[1]%1000000).padStart(6,'0')}
  function submitSearch(e){e.preventDefault();const q=els.searchInput.value.trim();els.searchError.textContent='';els.results.innerHTML='';if(searchMode==='id'){if(!validId(q)){els.searchError.textContent='Enter a positive whole number using digits 1–9 followed by any digits. Zero, signs, decimals, and letters are not accepted.';return}openProfile(q);return}if(searchMode==='discover'){if(q&&!validId(q)){els.searchError.textContent='Enter a valid positive decimal ID, or leave the field empty.';return}const id=q||randomId();openProfile(id);return}if(q.length<2){els.searchError.textContent='Enter at least two characters to search generated names.';return}const norm=q.toLowerCase();const matches=[];const start=seeded(norm,'name-search')%250000+1;let id=String(start);for(let i=0;i<800;i++){const p=profile(id);if(p.name.toLowerCase()===norm)matches.unshift(p);else if(p.name.toLowerCase().includes(norm))matches.push(p);id=incrementDecimal(id);if(matches.length>=8)break}if(!matches.length){els.searchError.textContent='No match in this deterministic sample. Try a shorter name fragment or search by ID.';return}els.results.innerHTML=matches.map(p=>`<button class="result-row" data-id="${p.id}"><span class="avatar">${svgArtwork(p)}</span><span><strong>${escapeHTML(p.name)}</strong><small>ID / ${p.id} · ${p.category}</small></span></button>`).join('')}
  async function copyText(text,success){try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text)}else{const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();const ok=document.execCommand('copy');area.remove();if(!ok)throw new Error('copy failed')}showToast(success)}catch{showToast('Copy was blocked by the browser. Please copy it manually.')}}
  async function shareProfile(){if(!currentId)return;const url=new URL(location.href);url.hash=`profile/${currentId}`;const p=profile(currentId);try{if(navigator.share)await navigator.share({title:`${p.name} — VELTHARION`,text:`Explore identity ${p.name} (${p.id})`,url:url.href});else await copyText(url.href,'Profile link copied')}catch(e){if(e.name!=='AbortError')copyText(url.href,'Profile link copied')}}
  function resetSettings(){settings={...defaults};saveSettings();applySettings();showToast('Default settings restored')}
  function routeFromLocation(){const match=location.hash.match(/^#profile\/([0-9]+)$/);if(match&&validId(match[1])){openProfile(match[1],false);return}currentId=null;els.main.classList.remove('hidden');els.detail.classList.add('hidden');document.body.style.overflow='';window.scrollTo({top:returnScroll,behavior:'auto'})}
  document.addEventListener('click',e=>{const action=e.target.closest('[data-action]')?.dataset.action;if(action){switch(action){case'explore':if(!els.detail.classList.contains('hidden'))backToFeed();$('#explore').scrollIntoView({behavior:settings.animations?'smooth':'auto'});break;case'discover':openOverlay(els.search);setSearchMode('discover');break;case'random':openProfile(randomId());break;case'search-open':openOverlay(els.search);renderSuggestions();break;case'search-close':closeOverlay(els.search);break;case'settings-open':openOverlay(els.settings);break;case'settings-close':closeOverlay(els.settings);break;case'back':backToFeed();break;case'copy-id':if(currentId)copyText(currentId,'Identity ID copied');break;case'copy-name':if(currentId)copyText(profile(currentId).name,'Identity name copied');break;case'share':shareProfile();break;case'previous':navigateRelative(-1);break;case'next':navigateRelative(1);break;case'clear-history':historyIds=[];try{localStorage.removeItem('veltharion-search-history')}catch{}renderSuggestions();showToast('Search history cleared');break;case'reset-settings':resetSettings();break;}}
    const card=e.target.closest('[data-id]');if(card&&card.dataset.id&&validId(card.dataset.id)&&!e.target.closest('[data-action]')){if(card.classList.contains('suggestion-chip')||card.classList.contains('profile-card')||card.classList.contains('result-row'))openProfile(card.dataset.id)} });
  $$('.search-tab').forEach(b=>b.addEventListener('click',()=>setSearchMode(b.dataset.mode)));$('#search-form').addEventListener('submit',submitSearch);$$('[data-setting]').forEach(input=>input.addEventListener('change',()=>{settings[input.dataset.setting]=input.checked;saveSettings();applySettings()}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!els.search.classList.contains('hidden'))closeOverlay(els.search);if(!els.settings.classList.contains('hidden'))closeOverlay(els.settings)}if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();openOverlay(els.search);renderSuggestions()}if(e.altKey&&e.key==='ArrowLeft'&&!els.detail.classList.contains('hidden'))backToFeed()});
  window.addEventListener('popstate',()=>{routeFromLocation()});window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#profile/'))routeFromLocation();else if(!els.detail.classList.contains('hidden')){currentId=null;els.detail.classList.add('hidden');els.main.classList.remove('hidden')}});
  applySettings();historyIds=loadHistory();renderSuggestions();setupObserver();addBatch(36);if(location.hash.startsWith('#profile/'))routeFromLocation();const intro=$('#intro');const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;setTimeout(()=>intro.classList.add('done'),reduce?50:1050);setTimeout(()=>intro.remove(),reduce?450:1500);
})();
