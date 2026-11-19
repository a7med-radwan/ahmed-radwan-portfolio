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
    document.querySelectorAll('[data-tilt]').forEach(element => {
      element.style.removeProperty('--tilt-x');
      element.style.removeProperty('--tilt-y');
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
const mobileIndex = matchMedia('(max-width: 600px)');
const projectFilters = [...document.querySelectorAll('.work-filter-chip')];
const projectFilterStatus = document.getElementById('work-filter-status');
let activeFilter = 'all';
let currentProject = 0;

function filterMatches(tab) {
  if (activeFilter === 'all') return true;
  return (tab.dataset.tags || '').split(' ').includes(activeFilter);
}

function visibleProjectIndices() {
  return projectTabs.reduce((list, tab, i) => (filterMatches(tab) ? list.concat(i) : list), []);
}

function stepProject(direction) {
  const list = visibleProjectIndices();
  if (!list.length) return currentProject;
  const position = Math.max(0, list.indexOf(currentProject));
  return list[(position + direction + list.length) % list.length];
}

function applyProjectFilter(filter) {
  activeFilter = filter;
  projectFilters.forEach(chip => chip.setAttribute('aria-pressed', String(chip.dataset.filter === filter)));
  let firstVisible = -1;
  projectTabs.forEach((tab, i) => {
    const match = filterMatches(tab);
    tab.hidden = !match;
    if (match && firstVisible < 0) firstVisible = i;
  });
  const count = visibleProjectIndices().length;
  if (projectFilterStatus) projectFilterStatus.textContent = `${count} project${count === 1 ? '' : 's'} shown`;
  if (firstVisible >= 0 && !filterMatches(projectTabs[currentProject])) selectProject(firstVisible);
}
function selectProject(index, focus = false) {
  index = (index + projectTabs.length) % projectTabs.length;
  const previousPanel = projectPanels[currentProject];
  projectTabs.forEach((tab, i) => {
    const active = i === index;
    tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
    projectPanels[i].hidden = !active;
    projectPanels[i].classList.remove('entering');
  });
  currentProject = index;
  if (projectPanels[index] !== previousPanel && location.hash === '#' + previousPanel.id) {
    history.replaceState(history.state, '', '#' + projectPanels[index].id);
  }
  document.getElementById('project-current').textContent = String(index + 1).padStart(2, '0');
  if (motionEnabled) projectPanels[index].classList.add('entering');
  if (focus) projectTabs[index].focus({ preventScroll: true });
  if (mobileIndex.matches) {
    const tab = projectTabs[index];
    const offset = tab.getBoundingClientRect().left - projectList.getBoundingClientRect().left;
    const center = projectList.scrollLeft + offset - (projectList.clientWidth - tab.clientWidth) / 2;
    projectList.scrollTo({left: center, behavior: motionEnabled ? 'smooth' : 'instant'});
  }
}
projectTabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectProject(i));
  tab.addEventListener('keydown', event => {
    let next;
    if (['ArrowRight','ArrowDown'].includes(event.key)) next = stepProject(1);
    if (['ArrowLeft','ArrowUp'].includes(event.key)) next = stepProject(-1);
    if (event.key === 'Home') next = visibleProjectIndices()[0];
    if (event.key === 'End') next = visibleProjectIndices().slice(-1)[0];
    if (next !== undefined) { event.preventDefault(); selectProject(next, true); }
  });
});
projectPanels.forEach(panel => panel.addEventListener('animationend', () => panel.classList.remove('entering')));
document.getElementById('project-prev').addEventListener('click', () => selectProject(stepProject(-1)));
document.getElementById('project-next').addEventListener('click', () => selectProject(stepProject(1)));
projectFilters.forEach(chip => chip.addEventListener('click', () => applyProjectFilter(chip.dataset.filter || 'all')));
function orientIndex() { projectList.setAttribute('aria-orientation', mobileIndex.matches ? 'horizontal' : 'vertical'); }
mobileIndex.addEventListener('change', orientIndex); orientIndex();

document.querySelectorAll('[data-tilt]').forEach(diagram => {
  diagram.addEventListener('pointermove', event => {
    if (!motionEnabled || !finePointer.matches || event.pointerType !== 'mouse') return;
    const bounds = diagram.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    diagram.style.setProperty('--tilt-x', `${-y * 5}deg`);
    diagram.style.setProperty('--tilt-y', `${x * 5}deg`);
  }, { passive: true });
  diagram.addEventListener('pointerleave', () => {
    diagram.style.removeProperty('--tilt-x');
    diagram.style.removeProperty('--tilt-y');
  });
});

function setupProjectFilms() {
  if (typeof window.drawProjectFilm !== 'function') return;

  const previews = new Map();
  const stills = [.25, .6, 1];
  const duration = 3600;
  let colors;

  function render(preview, progress = preview.progress) {
    const { canvas, context, film } = preview;
    if (!preview.scale) return;
    preview.progress = progress;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    const scale = preview.scale;
    context.setTransform(scale, 0, 0, scale, (canvas.width - 360 * scale) / 2, (canvas.height - 130 * scale) / 2);
    window.drawProjectFilm(context, film, progress, colors);
  }

  function measure(preview) {
    const { canvas } = preview;
    if (!canvas.clientWidth || !canvas.clientHeight) return;
    const density = Math.min(devicePixelRatio || 1, 1.6);
    const width = Math.round(canvas.clientWidth * density);
    const height = Math.round(canvas.clientHeight * density);
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    preview.scale = Math.min(width / 360, height / 130);
    render(preview);
  }

  function stop(preview) {
    cancelAnimationFrame(preview.frame);
    preview.frame = 0;
  }

  function play(preview) {
    if (document.hidden || preview.panel.hidden) return;
    stop(preview);
    const start = performance.now();
    render(preview, 0);
    function advance(time) {
      preview.frame = 0;
      if (!motionEnabled || document.hidden || preview.panel.hidden) return;
      const progress = Math.min(1, Math.max(0, (time - start) / duration));
      render(preview, progress);
      if (progress < 1) preview.frame = requestAnimationFrame(advance);
    }
    preview.frame = requestAnimationFrame(advance);
  }

  function updateControl(preview) {
    preview.button.textContent = motionEnabled ? 'Replay animation' : 'Next step (' + (preview.step + 1) + '/3)';
  }

  function refreshColors() {
    const style = getComputedStyle(root);
    const tokens = ['accent', 'text', 'muted', 'surface', 'bg', 'line', 'raised'];
    colors = Object.fromEntries(tokens.map(name => [name, style.getPropertyValue('--' + name).trim()]));
    for (const preview of previews.values()) render(preview);
  }

  refreshColors();
  const sizeObserver = 'ResizeObserver' in window ? new ResizeObserver(entries => {
    for (const entry of entries) measure(previews.get(entry.target));
  }) : null;
  const viewObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for (const entry of entries) {
      const preview = previews.get(entry.target);
      if (entry.intersectionRatio >= .22) {
        measure(preview);
        if (motionEnabled) play(preview);
      } else if (preview.frame) {
        stop(preview);
        render(preview, 1);
      }
    }
  }, { threshold: .22 }) : null;

  document.querySelectorAll('.work-visual[data-film]').forEach(figure => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;
    canvas.className = 'project-film';
    canvas.setAttribute('aria-hidden', 'true');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'film-control';
    const preview = {
      panel: figure.closest('.work-panel'), canvas, context, button,
      film: figure.dataset.film, step: 0, frame: 0, progress: motionEnabled ? 1 : stills[0]
    };
    previews.set(figure, preview);
    updateControl(preview);
    button.addEventListener('click', () => {
      measure(preview);
      if (motionEnabled) {
        play(preview);
      } else {
        preview.step = (preview.step + 1) % stills.length;
        render(preview, stills[preview.step]);
        updateControl(preview);
      }
    });
    figure.classList.add('work-visual--animated');
    figure.querySelector('figcaption').after(button, canvas);
    sizeObserver?.observe(figure);
    viewObserver?.observe(figure);
    measure(preview);
  });
  if (!sizeObserver) window.addEventListener('resize', () => {
    for (const preview of previews.values()) measure(preview);
  });
  document.addEventListener('portfolio:themechange', refreshColors);
  document.addEventListener('portfolio:motionchange', () => {
    for (const preview of previews.values()) {
      stop(preview);
      preview.step = 0;
      preview.progress = motionEnabled ? 1 : stills[0];
      render(preview);
      updateControl(preview);
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    for (const preview of previews.values()) {
      if (!preview.frame) continue;
      stop(preview);
      render(preview, 1);
    }
  });
}
setupProjectFilms();

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

// Render the reading position without changing native scrolling.
const progressBar = document.getElementById('rail-progress');
const scrollPercent = document.getElementById('scroll-percent');
let scrollScheduled = false;

function updateScroll() {
  scrollScheduled = false;
  const extent = Math.max(1, root.scrollHeight - innerHeight);
  const progress = Math.max(0, Math.min(1, window.scrollY / extent));
  progressBar.style.transform = `scaleY(${progress})`;
  scrollPercent.textContent = String(Math.round(progress * 100)).padStart(2, '0');
}

window.addEventListener('scroll', () => {
  if (scrollScheduled) return;
  scrollScheduled = true;
  requestAnimationFrame(updateScroll);
}, { passive: true });
window.addEventListener('resize', updateScroll, { passive: true });
if ('ResizeObserver' in window) new ResizeObserver(updateScroll).observe(document.body);

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.dataset.reveal = 'visible';
      revealObserver.unobserve(entry.target);
    }
  }, { threshold: .12 });

  document.querySelectorAll('[data-reveal]').forEach(element => {
    if (element.getBoundingClientRect().top >= innerHeight) revealObserver.observe(element);
  });

  const sectionLinks = [...document.querySelectorAll('#navigation a, .rail-nav a')];
  const sectionObserver = new IntersectionObserver(entries => {
    const activeSection = entries.find(entry => entry.isIntersecting)?.target;
    if (!activeSection) return;
    for (const link of sectionLinks) {
      const active = link.hash === '#' + activeSection.id;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }, { rootMargin: '-12% 0px -70% 0px' });
  document.querySelectorAll('main > section[id]').forEach(section => sectionObserver.observe(section));
}

// The three layers form a schematic of the kinds of systems Ahmed builds.
const signal = document.querySelector('.signal-stage');
const signalButtons = [...signal.querySelectorAll('button[data-layer]')];
const signalDescription = document.getElementById('signal-description');
const signalProject = document.getElementById('signal-project');
const signalExamples = {
  interface: { panel: 'work-panel-2', description: 'A React interface brings drafting and semantic search into one publishing workflow.' },
  api: { panel: 'work-panel-5', description: 'An Express API protects pharmacy inventory with JWT authentication.' },
  ai: { panel: 'work-panel-0', description: 'OpenRouter turns a goal into a roadmap and daily tasks through a Laravel API.' }
};

function showLinkedProject() {
  const index = projectPanels.findIndex(panel => '#' + panel.id === location.hash);
  if (index < 0) return;
  if (!filterMatches(projectTabs[index])) applyProjectFilter('all');
  if (index !== currentProject) selectProject(index);
  const panel = projectPanels[index];
  panel.tabIndex = -1;
  panel.focus({ preventScroll: true });
  panel.scrollIntoView({ block: 'start' });
}

window.addEventListener('hashchange', showLinkedProject);
showLinkedProject();

function selectLayer(button) {
  signal.dataset.layer = button.dataset.layer;
  for (const option of signalButtons) option.setAttribute('aria-pressed', String(option === button));
  const example = signalExamples[button.dataset.layer];
  signalDescription.textContent = example.description;
  signalProject.hash = example.panel;
  signalProject.textContent = 'View ' + document.getElementById(example.panel).querySelector('h3').textContent;
  signal.dispatchEvent(new Event('signalchange'));
}

signalButtons.forEach((button, index) => {
  button.addEventListener('click', () => selectLayer(button));
  button.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % signalButtons.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + signalButtons.length - 1) % signalButtons.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = signalButtons.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    signalButtons[next].focus();
    selectLayer(signalButtons[next]);
  });
});

function drawSignal() {
  const canvas = document.getElementById('signal-canvas');
  const context = canvas.getContext('2d');
  if (!context) return;

  const portrait = signal.querySelector('.signal-portrait');
  const introduction = signal.querySelector('.hero-introduction');
  const workLink = signal.querySelector('.hero-link');
  const controlsLabel = document.getElementById('signal-label');
  let width = 0;
  let height = 0;
  let routes = [];
  let color = '';
  let frame = 0;
  let started = null;
  let visible = true;
  let target = 0;
  let drift = 0;

  function measure() {
    const bounds = canvas.getBoundingClientRect();
    const photo = portrait.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    const scale = Math.min(devicePixelRatio || 1, 1.6);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);

    const left = photo.left - bounds.left;
    const right = photo.right - bounds.left;
    const top = photo.top - bounds.top;
    const bottom = photo.bottom - bounds.top;
    const compact = getComputedStyle(signal).getPropertyValue('--signal-columns').trim() === '1';
    const leftStart = introduction.getBoundingClientRect().bottom - bounds.top + 8;
    const leftSpan = Math.max(8, workLink.getBoundingClientRect().top - bounds.top - leftStart - 7);
    const controlTop = controlsLabel.getBoundingClientRect().top - bounds.top;
    const rightStart = Math.max(16, controlTop * .2);
    const rightSpan = Math.max(20, controlTop - rightStart - 33);
    const bend = Math.min(25, left * .055);

    routes = Array.from({ length: compact ? 3 : 9 }, (_, i) => {
      if (compact) {
        const gap = 3 + i * 3;
        return [
          [[left + 19, top + gap], [gap, top + gap], [gap, bottom - 20 + i * 6], [left + 10, bottom - 10 + i * 6]],
          [[right - 19, top + 15 + i * 6], [width - gap, top + 15 + i * 6], [width - gap, bottom - gap], [right - 10, bottom - gap]]
        ];
      }

      const exit = leftStart + i * leftSpan / 8;
      const branch = rightStart + i * rightSpan / 8;
      const rightEdge = width - 22 - i * 4;
      return [
        [[23 + i * 5, exit], [left * .7, exit], [left * .7 + bend, exit - bend], [left + 1, exit - bend]],
        [[right - 1, branch + bend], [right + .25 * (width - right), branch + bend], [right + .25 * (width - right) + bend, branch], [rightEdge, branch]]
      ];
    });
    render();
  }

  function trace(points, active, progress) {
    const positions = points.map(([x, y], index) => [x, index === 0 || index === points.length - 1 ? y : y + drift]);
    context.beginPath();
    context.moveTo(...positions[0]);
    for (let i = 1; i < positions.length; i++) context.lineTo(...positions[i]);
    context.globalAlpha = active ? .85 : .28;
    context.lineWidth = active ? 1.5 : .85;
    context.stroke();

    const endpoint = positions[positions[0][0] < width / 2 ? 0 : positions.length - 1];
    context.beginPath();
    context.arc(...endpoint, active ? 3.5 : 2, 0, Math.PI * 2);
    if (active) context.fill();
    else context.stroke();

    if (!active || progress === null) return;
    const legs = positions.slice(1).map(([x, y], i) => ({
      dx: x - positions[i][0],
      dy: y - positions[i][1]
    }));
    const lengths = legs.map(({ dx, dy }) => Math.hypot(dx, dy));
    let distance = lengths.reduce((sum, length) => sum + length, 0) * progress;
    let segment = 0;
    while (segment < legs.length - 1 && distance > lengths[segment]) distance -= lengths[segment++];
    const ratio = lengths[segment] ? distance / lengths[segment] : 0;
    const x = positions[segment][0] + legs[segment].dx * ratio;
    const y = positions[segment][1] + legs[segment].dy * ratio;
    context.globalAlpha = 1;
    context.beginPath();
    context.arc(x, y, 4, 0, Math.PI * 2);
    context.fill();
  }

  function render(progress = null) {
    context.clearRect(0, 0, width, height);
    context.strokeStyle = color;
    context.fillStyle = color;
    const layer = signalButtons.findIndex(button => button.dataset.layer === signal.dataset.layer);
    const activeIndex = routes.length === 3 ? layer : 1 + layer * 3;
    for (const [index, pair] of routes.entries()) {
      for (const path of pair) trace(path, index === activeIndex, progress);
    }
    context.globalAlpha = 1;
  }

  function animate(time) {
    frame = 0;
    drift += (target - drift) * .24;
    const elapsed = started === null ? 0 : Math.max(0, time - started);
    if (elapsed > 960) started = null;
    render(started === null ? null : elapsed / 960);
    if (started !== null || Math.abs(target - drift) > .12) queue();
  }

  function queue() {
    if (!frame && motionEnabled && finePointer.matches && visible && !document.hidden) {
      frame = requestAnimationFrame(animate);
    }
  }

  function resetMotion() {
    cancelAnimationFrame(frame);
    frame = 0;
    started = null;
    target = 0;
    drift = 0;
    render();
  }

  function refreshColor() {
    color = getComputedStyle(canvas).color;
    render();
  }

  signal.addEventListener('signalchange', () => {
    if (motionEnabled && finePointer.matches && visible && !document.hidden) {
      started = performance.now();
      queue();
    }
    render();
  });
  signal.addEventListener('pointermove', event => {
    if (!motionEnabled || !finePointer.matches || event.pointerType !== 'mouse') return;
    const bounds = signal.getBoundingClientRect();
    target = ((event.clientY - bounds.top) / bounds.height - .5) * 23;
    queue();
  }, { passive: true });
  signal.addEventListener('pointerleave', () => {
    target = 0;
    queue();
  });
  document.addEventListener('portfolio:themechange', refreshColor);
  document.addEventListener('portfolio:motionchange', resetMotion);
  document.addEventListener('visibilitychange', resetMotion);
  finePointer.addEventListener('change', resetMotion);

  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(signal);
  else window.addEventListener('resize', measure, { passive: true });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) resetMotion();
    }).observe(signal);
  }
  refreshColor();
  measure();
  document.fonts?.ready.then(measure);
}
drawSignal();

function updateClock() {
  const clock=document.getElementById('local-clock');
  const now=new Date();
  clock.textContent=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Hebron',hour:'2-digit',minute:'2-digit'}).format(now);
  clock.dateTime=now.toISOString();
}
updateClock();setInterval(updateClock,60000);
applyMotion();
