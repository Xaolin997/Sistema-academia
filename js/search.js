import ExerciseAPI from './api.js';

let searchTimeout = null;
let currentFilter = 'name';
let isOpen = false;

const FILTER_LABELS = {
  name:      'Nome',
  bodyPart:  'Parte do corpo',
  equipment: 'Equipamento',
};

const SINONIMOS = {

  'peito':        ['chest'],
  'peitoral':     ['chest'],
  'costas':       ['back'],
  'ombro':        ['shoulders'],
  'ombros':       ['shoulders'],
  'deltóide':     ['shoulders'],
  'bíceps':       ['upper arms'],
  'biceps':       ['upper arms'],
  'tríceps':      ['upper arms'],
  'triceps':      ['upper arms'],
  'braço':        ['upper arms'],
  'braços':       ['upper arms'],
  'antebraço':    ['lower arms'],
  'antebracos':   ['lower arms'],
  'perna':        ['upper legs'],
  'pernas':       ['upper legs'],
  'quadríceps':   ['upper legs'],
  'quadriceps':   ['upper legs'],
  'posterior':    ['upper legs'],
  'panturrilha':  ['lower legs'],
  'panturrilhas': ['lower legs'],
  'glúteo':       ['upper legs'],
  'gluteo':       ['upper legs'],
  'bumbum':       ['upper legs'],
  'abdômen':      ['waist'],
  'abdomen':      ['waist'],
  'abdominal':    ['waist'],
  'abs':          ['waist'],
  'lombar':       ['back'],
  'pescoço':      ['neck'],
  'pescoco':      ['neck'],
  'cardio':       ['cardio'],
  'aeróbico':     ['cardio'],
  'aerobico':     ['cardio'],

  'barra':        ['barbell'],
  'halter':       ['dumbbell'],
  'haltere':      ['dumbbell'],
  'halteres':     ['dumbbell'],
  'cabo':         ['cable'],
  'polia':        ['cable'],
  'máquina':      ['machine'],
  'maquina':      ['machine'],
  'peso corporal':['body weight'],
  'sem equipamento': ['body weight'],
  'elástico':     ['band'],
  'elastico':     ['band'],
  'faixa':        ['band'],
  'kettlebell':   ['kettlebell'],
  'anilha':       ['barbell'],
  'supino':       ['barbell'],
  'rosca':        ['dumbbell'],
  'smith':        ['smith machine'],

  'agachamento':  ['squat'],
  'levantamento': ['deadlift'],
  'terra':        ['deadlift'],
  'desenvolvimento': ['press'],
  'remada':       ['row'],
  'crucifixo':    ['fly'],
  'pulldown':     ['pulldown'],
  'puxada':       ['pulldown'],
  'rosca direta': ['curl'],
  'extensão':     ['extension'],
  'panturrilha sentado': ['calf'],
  'elevação':     ['raise'],
  'abdominal':    ['crunch'],
  'prancha':      ['plank'],
};

function resolverQuery(query) {
  const q = query.toLowerCase().trim();

  if (SINONIMOS[q]) return { termos: SINONIMOS[q], ehSinonimo: true };

  for (const [ptKey, enTerms] of Object.entries(SINONIMOS)) {
    if (ptKey.includes(q) || q.includes(ptKey)) {
      return { termos: enTerms, ehSinonimo: true };
    }
  }

  return { termos: [q], ehSinonimo: false };
}

export function initSearch({ onSelect } = {}) {
  const input      = document.querySelector('.header__search-input');
  const dropdown   = document.querySelector('.search-dropdown');
  const filterBtns = document.querySelectorAll('.filter-chip');
  const resultsList= document.querySelector('.search-results-list');

  if (!input || !dropdown) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      input.placeholder = `Buscar por ${FILTER_LABELS[currentFilter].toLowerCase()}...`;
      if (input.value.trim().length >= 2) {
        triggerSearch(input.value.trim(), resultsList, onSelect);
      }
    });
  });

  input.addEventListener('input', () => {
    const q = input.value.trim();
    clearTimeout(searchTimeout);
    if (q.length < 2) { close(dropdown); return; }
    showLoading(resultsList);
    open(dropdown);
    searchTimeout = setTimeout(() => triggerSearch(q, resultsList, onSelect), 380);
  });

  input.addEventListener('focus', () => {
    if (input.value.trim().length >= 2) open(dropdown);
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.header__search-wrap')) close(dropdown);
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') { close(dropdown); input.blur(); }
  });
}

async function triggerSearch(query, listEl, onSelect) {
  try {
    const { termos, ehSinonimo } = resolverQuery(query);
    let results = [];

    if (currentFilter === 'name' && ehSinonimo) {

      const promises = termos.map(t =>
        Promise.allSettled([
          ExerciseAPI.getExercisesByBodyPart(t, 8).catch(() => []),
          ExerciseAPI.getExercisesByEquipment(t, 8).catch(() => []),
          ExerciseAPI.getExercisesByName(t, 8).catch(() => []),
        ])
      );
      const settled = await Promise.all(promises);
      const seen = new Set();
      settled.flat().forEach(group => {
        if (group.status === 'fulfilled') {
          group.value.forEach(ex => {
            if (!seen.has(ex.id)) { seen.add(ex.id); results.push(ex); }
          });
        }
      });
    } else {

      const termo = ehSinonimo ? termos[0] : query;
      switch (currentFilter) {
        case 'name':
          results = await ExerciseAPI.getExercisesByName(termo, 12);
          break;
        case 'bodyPart':

          results = await ExerciseAPI.getExercisesByBodyPart(ehSinonimo ? termos[0] : query, 12);
          break;
        case 'equipment':
          results = await ExerciseAPI.getExercisesByEquipment(ehSinonimo ? termos[0] : query, 12);
          break;
      }
    }

    renderResults(results.slice(0, 12), listEl, onSelect);
  } catch (err) {
    console.error('[Search]', err);
    listEl.innerHTML = `<div class="search-empty">Erro ao buscar. Verifique sua conexão.</div>`;
  }
}

function renderResults(results, listEl, onSelect) {
  if (!results.length) {
    listEl.innerHTML = `<div class="search-empty">Nenhum exercício encontrado.</div>`;
    return;
  }

  listEl.innerHTML = results.map(ex => `
    <div class="search-result-item" data-id="${ex.id}">
      <div class="search-result-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 4v16M18 4v16M3 8h3M18 8h3M3 16h3M18 16h3M6 12h12"/>
        </svg>
      </div>
      <div class="search-result-info">
        <strong>${capitalize(ex.name)}</strong>
        <span>${capitalize(ex.bodyPart)} · ${capitalize(ex.equipment)}</span>
      </div>
      <svg class="search-result-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </div>
  `).join('');

  listEl.querySelectorAll('.search-result-item').forEach((item, i) => {
    item.addEventListener('click', () => {
      if (typeof onSelect === 'function') onSelect(results[i]);
      const input = document.querySelector('.header__search-input');
      if (input) input.value = '';
      close(document.querySelector('.search-dropdown'));
    });
  });
}

function showLoading(listEl) {
  listEl.innerHTML = `<div class="search-loading">Buscando...</div>`;
}

function open(d)  { if (d) { d.classList.add('open'); isOpen = true; } }
function close(d) { if (d) { d.classList.remove('open'); isOpen = false; } }
function capitalize(s = '') { return s.replace(/\b\w/g, c => c.toUpperCase()); }

export function isSearchOpen() { return isOpen; }
