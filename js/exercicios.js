import ExerciseAPI from './api.js';
import { initLayout, buildExerciseCard, openExerciseModal, buildSkeletonCards } from './components.js';
import { initSearch } from './search.js';

const PAGE_SIZE = 5;
const state = {
  bodyPart: '',
  equipment: '',
  search: '',
  pageByCategory: {},
};

const BODY_PARTS = ['chest', 'back', 'upper arms', 'lower arms', 'upper legs', 'lower legs', 'waist', 'cardio', 'neck', 'shoulders'];
const BODY_PARTS_PT = {
  'chest': 'Peito', 'back': 'Costas', 'upper arms': 'Braços', 'lower arms': 'Antebraços',
  'upper legs': 'Pernas', 'lower legs': 'Panturrilha', 'waist': 'Abdômen', 'cardio': 'Cardio',
  'neck': 'Pescoço', 'shoulders': 'Ombros',
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function populateFilters() {
  const bodyPartSel = document.getElementById('filter-bodypart');
  const equipSel = document.getElementById('filter-equipment');

  try {
    const bodyParts = await ExerciseAPI.getBodyPartList();
    await sleep(1200);
    const equipments = await ExerciseAPI.getEquipmentList();

    if (bodyPartSel) {
      bodyParts.forEach(bp => {
        const opt = document.createElement('option');
        opt.value = bp;
        opt.textContent = BODY_PARTS_PT[bp] || capitalize(bp);
        bodyPartSel.appendChild(opt);
      });
    }

    if (equipSel) {
      equipments.forEach(eq => {
        const opt = document.createElement('option');
        opt.value = eq;
        opt.textContent = capitalize(eq);
        equipSel.appendChild(opt);
      });
    }
  } catch (err) {
    console.error('[Filters]', err);
  }
}

async function renderCategory(bodyPart) {
  const container = document.getElementById('categories-container');
  const pt = BODY_PARTS_PT[bodyPart] || capitalize(bodyPart);

  const section = document.createElement('div');
  section.className = 'category-section';
  section.id = `cat-${bodyPart.replace(/\s/g, '-')}`;
  section.innerHTML = `
    <div class="category-header">
      <h2 class="category-title">
        ${pt}
        <span class="category-count" id="count-${bodyPart.replace(/\s/g, '-')}">...</span>
      </h2>
      <a href="#" class="ver-todos" data-bodypart="${bodyPart}">ver todos →</a>
    </div>
    <div class="category-grid" id="grid-${bodyPart.replace(/\s/g, '-')}"></div>
    <div class="load-more-btn">
      <button class="btn btn-outline load-more" data-bodypart="${bodyPart}" style="display:none">
        Carregar mais
      </button>
    </div>
  `;
  container.appendChild(section);

  const grid = section.querySelector(`#grid-${bodyPart.replace(/\s/g, '-')}`);
  const countEl = section.querySelector(`#count-${bodyPart.replace(/\s/g, '-')}`);
  const loadMoreBtn = section.querySelector('.load-more');

  buildSkeletonCards(5).forEach(s => grid.appendChild(s));

  state.pageByCategory[bodyPart] = 0;

  try {
    const exercises = await ExerciseAPI.getExercisesByBodyPart(bodyPart, PAGE_SIZE, 0);
    grid.innerHTML = '';
    countEl.textContent = exercises.length;

    exercises.forEach(ex => {
      const card = buildExerciseCard(ex, { onClick: openExerciseModal });
      grid.appendChild(card);
    });

    if (exercises.length === PAGE_SIZE) {
      loadMoreBtn.style.display = 'flex';
      loadMoreBtn.addEventListener('click', () => loadMore(bodyPart, grid, loadMoreBtn, countEl));
    }
  } catch {
    grid.innerHTML = `<div class="no-results"><p>Erro ao carregar exercícios de ${pt}.</p></div>`;
  }

  section.querySelector('.ver-todos').addEventListener('click', e => {
    e.preventDefault();
    const sel = document.getElementById('filter-bodypart');
    if (sel) { sel.value = bodyPart; sel.dispatchEvent(new Event('change')); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

async function loadMore(bodyPart, grid, btn, countEl) {
  state.pageByCategory[bodyPart] = (state.pageByCategory[bodyPart] || 0) + 1;
  const offset = state.pageByCategory[bodyPart] * PAGE_SIZE;

  btn.textContent = 'Carregando...';
  btn.disabled = true;

  try {
    const exercises = await ExerciseAPI.getExercisesByBodyPart(bodyPart, PAGE_SIZE, offset);
    exercises.forEach(ex => {
      const card = buildExerciseCard(ex, { onClick: openExerciseModal });
      grid.appendChild(card);
    });
    countEl.textContent = parseInt(countEl.textContent || '0') + exercises.length;
    if (exercises.length < PAGE_SIZE) btn.style.display = 'none';
    else { btn.textContent = 'Carregar mais'; btn.disabled = false; }
  } catch {
    btn.textContent = 'Tentar novamente';
    btn.disabled = false;
  }
}

async function applyFilters() {
  const bodyPart = document.getElementById('filter-bodypart')?.value || '';
  const equipment = document.getElementById('filter-equipment')?.value || '';
  const container = document.getElementById('categories-container');
  if (!container) return;

  if (!bodyPart && !equipment) {
    renderAllCategories();
    return;
  }

  container.innerHTML = '';
  const section = document.createElement('div');
  section.className = 'category-section';
  section.innerHTML = `
    <div class="category-header">
      <h2 class="category-title">Resultados</h2>
    </div>
    <div class="category-grid filtered-grid" id="filtered-grid"></div>
  `;
  container.appendChild(section);
  const grid = document.getElementById('filtered-grid');

  buildSkeletonCards(5).forEach(s => grid.appendChild(s));

  try {
    let results;
    if (bodyPart && equipment) {
      const byPart = await ExerciseAPI.getExercisesByBodyPart(bodyPart, 50);
      await sleep(1200);
      const byEquip = await ExerciseAPI.getExercisesByEquipment(equipment, 50);

      const ids = new Set(byEquip.map(e => e.id));
      results = byPart.filter(e => ids.has(e.id));
    } else if (bodyPart) {
      results = await ExerciseAPI.getExercisesByBodyPart(bodyPart, 50);
    } else {
      results = await ExerciseAPI.getExercisesByEquipment(equipment, 50);
    }

    grid.innerHTML = '';
    if (!results.length) {
      grid.innerHTML = `<div class="no-results" style="grid-column:1/-1"><p>Nenhum exercício encontrado.</p></div>`;
    } else {
      results.forEach(ex => {
        const card = buildExerciseCard(ex, { onClick: openExerciseModal });
        grid.appendChild(card);
      });
    }
  } catch {
    grid.innerHTML = `<div class="no-results" style="grid-column:1/-1"><p>Erro ao filtrar.</p></div>`;
  }
}

let categoriesRendered = false;
async function renderAllCategories() {
  if (categoriesRendered) return;
  categoriesRendered = true;

  const container = document.getElementById('categories-container');
  container.innerHTML = '';

  const prioritized = ['chest', 'back', 'upper legs', 'upper arms', 'waist', 'shoulders'];
  for (const bp of prioritized) {
    await renderCategory(bp);
    await sleep(1200);
  }
}

function capitalize(str = '') {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

document.addEventListener('DOMContentLoaded', async () => {
  initLayout("exercicios");

  initSearch({ onSelect: openExerciseModal });

  await populateFilters();
  await sleep(1200);
  await renderAllCategories();

  document.getElementById('filter-bodypart')?.addEventListener('change', applyFilters);
  document.getElementById('filter-equipment')?.addEventListener('change', applyFilters);
  document.getElementById('reset-filters')?.addEventListener('click', async () => {
    document.getElementById('filter-bodypart').value = '';
    document.getElementById('filter-equipment').value = '';
    categoriesRendered = false;
    document.getElementById('categories-container').innerHTML = '';
    await renderAllCategories();
  });
});
