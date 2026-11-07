'use strict';

// Existing preferences survive the redesign; a fresh visit starts in black & white.
const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch {} }
};
const root = document.documentElement;
const colorNames = ['mono', 'amethyst', 'blue', 'teal', 'green', 'indigo', 'gold'];
const appearance = document.querySelector('.appearance');
const modeButton = document.getElementById('theme-toggle');
const motionButton = document.getElementById('motion-toggle');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
let motionEnabled = !reducedMotion.matches && storage.get('portfolio-motion') !== 'off';

function applyColor(color, persist = false) {
  if (!colorNames.includes(color)) color = 'mono';
  root.dataset.themeColor = color;
  document.querySelectorAll('[data-color]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.color === color)));
  if (persist) storage.set('portfolio-theme-color', color);
  document.dispatchEvent(new Event('portfolio:themechange'));
}
function applyMode(light, persist = false) {
  root.dataset.mode = light ? 'light' : 'dark';
  document.body.classList.toggle('light-mode', light);
  modeButton.setAttribute('aria-pressed', String(light));
  modeButton.innerHTML = light ? 'Dark mode <span>☾</span>' : 'Light mode <span>☀</span>';
  if (persist) storage.set('portfolio-theme', light ? 'light' : 'dark');
  document.dispatchEvent(new Event('portfolio:themechange'));
}
function applyMotion() {
  root.dataset.motion = motionEnabled ? 'on' : 'off';
  motionButton.setAttribute('aria-pressed', String(motionEnabled));
  motionButton.disabled = reducedMotion.matches;
  motionButton.querySelector('.motion-status').textContent = reducedMotion.matches ? 'Reduced' : motionEnabled ? 'On' : 'Off';
  if (!motionEnabled) {
    document.querySelectorAll('[data-reveal]').forEach(element => { element.dataset.reveal = 'visible'; });
    document.querySelectorAll('[data-tilt], [data-magnetic]').forEach(element => {
      element.style.removeProperty('--tilt-x'); element.style.removeProperty('--tilt-y'); element.style.translate = '';
    });
  }
  document.dispatchEvent(new Event('portfolio:motionchange'));
  updateScroll();
}
applyColor(storage.get('portfolio-theme-color'));
applyMode(storage.get('portfolio-theme') === 'light');
document.querySelectorAll('[data-color]').forEach(button => button.addEventListener('click', () => applyColor(button.dataset.color, true)));
modeButton.addEventListener('click', () => applyMode(root.dataset.mode !== 'light', true));
motionButton.addEventListener('click', () => {
  if (reducedMotion.matches) return;
  motionEnabled = !motionEnabled;
  storage.set('portfolio-motion', motionEnabled ? 'on' : 'off');
  applyMotion();
});
reducedMotion.addEventListener('change', () => {
  motionEnabled = !reducedMotion.matches && storage.get('portfolio-motion') !== 'off';
  applyMotion();
});
document.addEventListener('click', event => { if (!appearance.contains(event.target)) appearance.open = false; });

// Navigation keeps native anchors and scrolling behavior.
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.getElementById('navigation');
function closeMenu() { navigation.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); }
menuButton.addEventListener('click', () => {
  appearance.open = false;
  menuButton.setAttribute('aria-expanded', String(navigation.classList.toggle('open')));
});
appearance.addEventListener('toggle', () => { if (appearance.open) closeMenu(); });
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (appearance.open) { appearance.open = false; appearance.querySelector('summary').focus(); }
  if (navigation.classList.contains('open')) { closeMenu(); menuButton.focus(); }
});
matchMedia('(min-width: 601px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

// One real project at a time, with a full nine-project index and keyboard controls.
const projectTabs = [...document.querySelectorAll('.work-tab')];
const projectPanels = [...document.querySelectorAll('.work-panel')];
const projectList = document.querySelector('.work-index');
let currentProject = 0;
function selectProject(index, focus = false) {
  index = (index + projectTabs.length) % projectTabs.length;
  projectTabs.forEach((tab, i) => {
    const active = i === index;
    tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
    projectPanels[i].hidden = !active;
    projectPanels[i].classList.remove('entering');
  });
  currentProject = index;
  document.getElementById('project-current').textContent = String(index + 1).padStart(2, '0');
  if (motionEnabled) projectPanels[index].classList.add('entering');
  if (focus) projectTabs[index].focus({ preventScroll: true });
  if (matchMedia('(max-width: 600px)').matches) {
    const tab = projectTabs[index];
    projectList.scrollTo({left: tab.offsetLeft - projectList.offsetLeft - (projectList.clientWidth - tab.clientWidth) / 2, behavior: motionEnabled ? 'smooth' : 'instant'});
  }
}
projectTabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectProject(i));
  tab.addEventListener('keydown', event => {
    let next;
    if (['ArrowRight','ArrowDown'].includes(event.key)) next = i + 1;
    if (['ArrowLeft','ArrowUp'].includes(event.key)) next = i - 1;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = projectTabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectProject(next, true); }
  });
});
projectPanels.forEach(panel => panel.addEventListener('animationend', () => panel.classList.remove('entering')));
document.getElementById('project-prev').addEventListener('click', () => selectProject(currentProject - 1));
document.getElementById('project-next').addEventListener('click', () => selectProject(currentProject + 1));
const mobileIndex = matchMedia('(max-width: 600px)');
function orientIndex() { projectList.setAttribute('aria-orientation', mobileIndex.matches ? 'horizontal' : 'vertical'); }
mobileIndex.addEventListener('change', orientIndex); orientIndex();

const journeyTabs = [...document.querySelectorAll('.journey-tabs [role=tab]')];
function selectJourney(tab, focus = false) {
  journeyTabs.forEach(item => {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
  });
  if (focus) tab.focus();
}
journeyTabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectJourney(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (i + 1) % journeyTabs.length;
    if (event.key === 'ArrowLeft') next = (i + journeyTabs.length - 1) % journeyTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = journeyTabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectJourney(journeyTabs[next], true); }
  });
});

// Scroll-linked details run at most once per animation frame, without scroll hijacking.
const hero = document.getElementById('hero');
const titleLines = [...document.querySelectorAll('.title-line')];
const ticker = document.querySelector('.ticker-line');
const progressBar = document.getElementById('rail-progress');
let scrollScheduled = false;
function updateScroll() {
  scrollScheduled = false;
  const y = window.scrollY;
  const extent = Math.max(1, root.scrollHeight - innerHeight);
  const progress = Math.min(1, y / extent);
  progressBar.style.transform = `scaleY(${progress})`;
  document.getElementById('scroll-percent').textContent = String(Math.round(progress * 100)).padStart(2, '0');
  const heroProgress = Math.min(1, y / Math.max(hero.offsetHeight, 1));
  titleLines.forEach((line, i) => { line.style.transform = motionEnabled ? `translateX(${heroProgress * (i ? 28 : -18)}px)` : ''; });
  document.querySelector('.title-asterisk').style.transform = motionEnabled ? `rotate(${heroProgress * 140}deg)` : '';
  ticker.style.transform = motionEnabled ? `translate3d(${-Math.min(y * .12, 320)}px,0,0)` : '';
}
window.addEventListener('scroll', () => { if (!scrollScheduled) { scrollScheduled = true; requestAnimationFrame(updateScroll); } }, {passive:true});
window.addEventListener('resize', updateScroll, {passive:true});
if ('ResizeObserver' in window) new ResizeObserver(updateScroll).observe(document.body);

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.dataset.reveal = 'visible'; revealObserver.unobserve(entry.target);
  }), {threshold:.07});
  document.querySelectorAll('[data-reveal]').forEach(element => {
    if (motionEnabled && element.getBoundingClientRect().top > innerHeight) element.dataset.reveal = 'pending';
    else element.dataset.reveal = 'visible';
    revealObserver.observe(element);
  });
  const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    document.querySelectorAll('#navigation a, .rail-nav a').forEach(link => {
      const active = link.hash === '#' + entry.target.id;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');
    });
  }), {rootMargin:'-15% 0px -60% 0px'});
  document.querySelectorAll('main > section[id]').forEach(section => sectionObserver.observe(section));
}

// Tactile response, using the native cursor and leaving touch scrolling intact.
document.querySelectorAll('[data-magnetic], [data-tilt]').forEach(element => {
  element.addEventListener('pointermove', event => {
    if (!motionEnabled || !finePointer.matches) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    if (element.hasAttribute('data-tilt')) {
      element.style.setProperty('--tilt-x', `${-y * 5}deg`);
      element.style.setProperty('--tilt-y', `${x * 5}deg`);
    } else element.style.translate = `${x * 10}px ${y * 8}px`;
  });
  element.addEventListener('pointerleave', () => {
    element.style.setProperty('--tilt-x','0deg'); element.style.setProperty('--tilt-y','0deg'); element.style.translate = '';
  });
});

// A small, projected Möbius surface. No libraries, textures, network, or GPU setup.
class Ribbon {
  constructor(canvas) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;
    this.width = 0; this.height = 0; this.rx = .9; this.ry = -.35;
    this.targetX = .9; this.targetY = -.35; this.turn = 0;
    this.pointer = {x:0,y:0}; this.drag = null; this.visible = true; this.raf = null; this.last = 0;
    this.curves = [];
    for (let j=0;j<=16;j++) {
      const curve=[];
      for(let i=0;i<=120;i++) curve.push(this.surface(i/120*Math.PI*2, -.46+j/16*.92));
      this.curves.push(curve);
    }
    for(let i=0;i<88;i++) {
      const curve=[];
      for(let j=0;j<=12;j++) curve.push(this.surface(i/88*Math.PI*2, -.46+j/12*.92));
      this.curves.push(curve);
    }
    this.color = getComputedStyle(canvas).color;
    const resize = () => {
      const bounds=canvas.getBoundingClientRect();
      this.width=bounds.width; this.height=bounds.height;
      const dpr=Math.min(devicePixelRatio||1,2);
      canvas.width=Math.round(this.width*dpr); canvas.height=Math.round(this.height*dpr);
      this.ctx.setTransform(dpr,0,0,dpr,0,0); this.draw();
    };
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener('resize',resize,{passive:true});
    canvas.addEventListener('pointerdown', event => {
      if(event.button!==0) return;
      this.drag={id:event.pointerId,x:event.clientX,y:event.clientY,rx:this.targetX,ry:this.targetY};
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener('pointermove', event => {
      const bounds=canvas.getBoundingClientRect();
      this.pointer.x=(event.clientX-bounds.left)/bounds.width-.5;
      this.pointer.y=(event.clientY-bounds.top)/bounds.height-.5;
      if(this.drag && this.drag.id===event.pointerId) {
        this.targetX=this.drag.rx+(event.clientY-this.drag.y)*.009;
        this.targetY=this.drag.ry+(event.clientX-this.drag.x)*.009;
        if(!motionEnabled) { this.rx=this.targetX; this.ry=this.targetY; this.draw(); }
      }
    });
    const endDrag=()=>{this.drag=null;};
    canvas.addEventListener('pointerup',endDrag); canvas.addEventListener('pointercancel',endDrag);
    canvas.addEventListener('lostpointercapture',endDrag);
    canvas.addEventListener('pointerleave',()=>{this.pointer={x:0,y:0};});
    canvas.addEventListener('dblclick',()=>this.reset());
    canvas.addEventListener('keydown',event=>{
      if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key)) return;
      event.preventDefault();
      if(event.key==='Home') { this.reset(); return; }
      this.targetY += event.key==='ArrowLeft'?-.18:event.key==='ArrowRight'?.18:0;
      this.targetX += event.key==='ArrowUp'?-.18:event.key==='ArrowDown'?.18:0;
      if(!motionEnabled) {this.rx=this.targetX;this.ry=this.targetY;this.draw();}
    });
    document.getElementById('reset-scene').addEventListener('click',()=>this.reset());
    document.addEventListener('portfolio:themechange',()=>{this.color=getComputedStyle(canvas).color;this.draw();});
    document.addEventListener('portfolio:motionchange',()=>this.schedule());
    document.addEventListener('visibilitychange',()=>this.schedule());
    if('IntersectionObserver' in window) new IntersectionObserver(entries=>{this.visible=entries[0].isIntersecting;this.schedule();},{threshold:0}).observe(canvas);
    resize(); this.schedule();
  }
  surface(t,v) { return [(1+v*Math.cos(t/2))*Math.cos(t),(1+v*Math.cos(t/2))*Math.sin(t),v*Math.sin(t/2)]; }
  reset() { this.targetX=.9;this.targetY=-.35;this.turn=0;this.pointer={x:0,y:0}; if(!motionEnabled){this.rx=.9;this.ry=-.35;this.draw();} }
  schedule() {
    if(this.raf) cancelAnimationFrame(this.raf);
    this.raf=null;this.last=0;
    if(motionEnabled && this.visible && !document.hidden) this.raf=requestAnimationFrame(t=>this.frame(t));
    else this.draw();
  }
  frame(time) {
    const dt=Math.min((time-(this.last||time))/1000,.05);this.last=time;
    if(!this.drag) this.turn+=dt*.08;
    const hover=finePointer.matches?1:0;
    this.rx+=(this.targetX+this.pointer.y*.15*hover-this.rx)*.065;
    this.ry+=(this.targetY+this.pointer.x*.2*hover-this.ry)*.065;
    this.draw();
    if(motionEnabled && this.visible && !document.hidden) this.raf=requestAnimationFrame(t=>this.frame(t));
    else this.raf=null;
  }
  draw() {
    if(!this.ctx || !this.width || !this.height) return;
    const ctx=this.ctx,w=this.width,h=this.height;
    ctx.clearRect(0,0,w,h);
    const ax=this.rx,ay=this.ry+this.turn,az=-.35;
    const sx=Math.sin(ax),cx=Math.cos(ax),sy=Math.sin(ay),cy=Math.cos(ay),sz=Math.sin(az),cz=Math.cos(az);
    const scale=Math.min(w*.32,h*.33);
    const project=p=>{
      const x=p[0]*cz-p[1]*sz,y=p[0]*sz+p[1]*cz;
      const yy=y*cx-p[2]*sx,zz=y*sx+p[2]*cx;
      const xx=x*cy+zz*sy,z=-x*sy+zz*cy;
      const perspective=4.5/(4.5+z);
      return [w*.5+xx*scale*perspective,h*.5+yy*scale*perspective,z];
    };
    ctx.strokeStyle=this.color;
    for(const curve of this.curves){
      const points=curve.map(project);
      const depth=points.reduce((sum,p)=>sum+p[2],0)/points.length;
      ctx.globalAlpha=Math.max(.13,Math.min(.8,.43-depth*.21));
      ctx.lineWidth=.65;
      ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();
    }
    ctx.globalAlpha=.15;ctx.lineWidth=.6;
    for(const [x,y] of [[w*.08,h*.35],[w*.92,h*.65]]){ctx.beginPath();ctx.moveTo(x-5,y);ctx.lineTo(x+5,y);ctx.moveTo(x,y-5);ctx.lineTo(x,y+5);ctx.stroke();}
    ctx.globalAlpha=1;
    this.canvas.dataset.rotation=`${this.rx.toFixed(3)},${(this.ry+this.turn).toFixed(3)}`;
    document.getElementById('scene-x').textContent=String(Math.round(this.ry*100));
    document.getElementById('scene-y').textContent=String(Math.round(this.rx*100));
  }
}
new Ribbon(document.getElementById('ribbon-canvas'));

function updateClock() {
  const clock=document.getElementById('local-clock');
  const now=new Date();
  clock.textContent=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Hebron',hour:'2-digit',minute:'2-digit'}).format(now);
  clock.dateTime=now.toISOString();
}
updateClock();setInterval(updateClock,60000);
applyMotion();
