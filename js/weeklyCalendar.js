import { DIAS_UTEIS, DIAS_LABEL, getDiaAtualKey } from './constants.js';

function getTreinoById(treinos, treinoId) {
  if (!treinoId || treinoId === 'descanso') return null;
  return treinos.find(treino => treino.id === treinoId) || null;
}

function renderEditButton(dia, editable) {
  if (!editable) return '';

  return `
    <button class="cal-day__edit" data-dia="${dia}" title="Alterar treino" aria-label="Alterar treino de ${DIAS_LABEL[dia] || dia}">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    </button>
  `;
}

function buildCalendarDay({ dia, calendario, treinos, diaAtual, editable }) {
  const treinoId = calendario[dia];
  const treino = getTreinoById(treinos, treinoId);
  const isHoje = dia === diaAtual;
  const isDescanso = !treinoId || treinoId === 'descanso';

  return `
    <div class="cal-day ${isHoje ? 'today' : ''} ${isDescanso ? 'descanso' : ''} ${editable ? 'cal-day--editable' : ''}">
      <div class="cal-day__name">${DIAS_LABEL[dia] || dia}</div>
      <div class="cal-day__treino">
        ${treino ? treino.nome : (treinoId === 'descanso' ? 'Descanso' : '—')}
      </div>
      ${renderEditButton(dia, editable)}
    </div>
  `;
}

export function renderWeeklyCalendar({
  container,
  calendario,
  treinos,
  dias = DIAS_UTEIS,
  editable = false,
  onEdit = null,
} = {}) {
  if (!container) return;

  const diaAtual = getDiaAtualKey();
  const cardsHtml = dias.map(dia => buildCalendarDay({
    dia,
    calendario,
    treinos,
    diaAtual,
    editable,
  })).join('');

  if (container.classList.contains('calendario-grid')) {
    container.innerHTML = cardsHtml;
  } else {
    container.innerHTML = `<div class="calendario-grid ${editable ? 'calendario-grid--editable' : ''}">${cardsHtml}</div>`;
  }

  if (editable && typeof onEdit === 'function') {
    container.querySelectorAll('.cal-day__edit').forEach(btn => {
      btn.addEventListener('click', event => {
        event.stopPropagation();
        onEdit(btn.dataset.dia);
      });
    });
  }
}
