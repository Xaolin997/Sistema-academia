import { TreinosStorage, HistoricoStorage, CalendarioStorage } from './storage.js';
import { initLayout, buildExerciseCard, openExerciseModal, showToast, buildSkeletonCards } from './components.js';
import ExerciseAPI from './api.js';
import { initSearch } from './search.js';
import { renderWeeklyCalendar } from './weeklyCalendar.js';
import { DIAS_UTEIS } from './constants.js';

async function renderDestaqueExercicios() {
  const grid = document.getElementById('destaque-grid');
  if (!grid) return;

  buildSkeletonCards(5).forEach(s => grid.appendChild(s));

  try {
    const exercises = await ExerciseAPI.getAllExercises(10, Math.floor(Math.random() * 200));
    grid.innerHTML = '';
    exercises.slice(0, 5).forEach(ex => {
      const card = buildExerciseCard(ex, { onClick: openExerciseModal });
      grid.appendChild(card);
    });
  } catch {
    grid.innerHTML = '<p style="color:var(--clr-muted);font-size:.85rem;grid-column:1/-1">Não foi possível carregar exercícios.</p>';
  }
}

async function renderDestaqueSection2() {
  const grid = document.getElementById('destaque-grid-2');
  if (!grid) return;

  buildSkeletonCards(5).forEach(s => grid.appendChild(s));

  try {
    const exercises = await ExerciseAPI.getExercisesByBodyPart('chest', 5);
    grid.innerHTML = '';
    exercises.slice(0, 5).forEach(ex => {
      const card = buildExerciseCard(ex, { onClick: openExerciseModal });
      grid.appendChild(card);
    });
  } catch {
    grid.innerHTML = '';
  }
}

function renderMeusTreinos() {
  const container = document.getElementById('meus-treinos');
  if (!container) return;

  const treinos = TreinosStorage.getAll().slice(0, 3);
  const letters = ['A', 'B', 'C'];

  if (!treinos.length) {
    container.innerHTML = `
      <div class="treinos-empty">
        <p>Você ainda não tem treinos criados.</p>
        <a href="treinos.html" class="btn btn-primary">Criar primeiro treino</a>
      </div>`;
    return;
  }

  container.innerHTML = treinos.map((t, i) => `
    <div class="treino-card">
      <div class="treino-card__header">
        <div class="treino-card__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 4v16M18 4v16M3 8h3M18 8h3M3 16h3M18 16h3M6 12h12"/>
          </svg>
        </div>
        <div class="treino-card__info">
          <div class="treino-card__label">Treino ${letters[i] || (i + 1)}</div>
          <div class="treino-card__desc">${t.nome || 'Sem nome'} · ${t.exercicios?.length || 0} exercícios</div>
        </div>
      </div>
      <div class="treino-card__actions">
        <button class="btn btn-primary" onclick="iniciarTreino('${t.id}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Iniciar
        </button>
        <a href="treinos.html" class="btn btn-outline">Editar</a>
      </div>
    </div>
  `).join('');
}

function renderCalendario() {
  renderWeeklyCalendar({
    container: document.getElementById('calendario-grid'),
    calendario: CalendarioStorage.get(),
    treinos: TreinosStorage.getAll(),
    dias: DIAS_UTEIS,
  });
}

function renderHistorico() {
  const tbody = document.getElementById('historico-tbody');
  if (!tbody) return;

  const historico = HistoricoStorage.recentes(6);

  if (!historico.length) {
    tbody.innerHTML = `<tr><td colspan="3" class="historico-empty">Nenhum treino registrado ainda.</td></tr>`;
    return;
  }

  tbody.innerHTML = historico.map(h => `
    <tr>
      <td>${h.data}</td>
      <td>${h.treinoNome}</td>
      <td class="duracao">${h.duracao}</td>
    </tr>
  `).join('');
}

let treinoAtivoHome = null;
let treinoInicioHome = null;
let cronometroHomeInterval = null;

window.iniciarTreino = function (treinoId) {
  const treino = TreinosStorage.getById(treinoId);
  if (!treino) return;

  if (treinoAtivoHome) {
    alert('Já existe um treino em andamento.');
    return;
  }

  treinoAtivoHome = treino;
  treinoInicioHome = Date.now();

  showToast(`▶️ Treino "${treino.nome}" iniciado!`);

  renderTreinoAtivoHome();
  iniciarCronometroHome();
};

function renderTreinoAtivoHome() {
  let banner = document.getElementById('treino-ativo-banner');

  if (!banner) {
    const main = document.querySelector('main');
    const meusTreinos = document.querySelector('#meus-treinos')?.closest('section');

    banner = document.createElement('div');
    banner.id = 'treino-ativo-banner';
    banner.className = 'active-workout-banner';

    main.insertBefore(banner, meusTreinos);
  }

  banner.innerHTML = `
    <div class="active-workout-banner__info">
      <div class="active-workout-banner__name">
        ${treinoAtivoHome.nome}
      </div>

      <div class="active-workout-banner__sub">
        Treino em andamento ·
        <span id="cronometro-treino">00:00:00</span>
      </div>
    </div>

    <button class="btn btn-primary" id="encerrar-treino-btn">
      Encerrar treino
    </button>
  `;

  document
    .getElementById('encerrar-treino-btn')
    .addEventListener('click', encerrarTreinoHome);
}

function iniciarCronometroHome() {
  atualizarCronometroHome();

  cronometroHomeInterval = setInterval(() => {
    atualizarCronometroHome();
  }, 1000);
}

function atualizarCronometroHome() {
  const cronometro = document.getElementById('cronometro-treino');
  if (!cronometro || !treinoInicioHome) return;

  const tempoTotal = Math.floor((Date.now() - treinoInicioHome) / 1000);

  const horas = Math.floor(tempoTotal / 3600);
  const minutos = Math.floor((tempoTotal % 3600) / 60);
  const segundos = tempoTotal % 60;

  cronometro.textContent = [horas, minutos, segundos]
    .map(n => String(n).padStart(2, '0'))
    .join(':');
}

function encerrarTreinoHome() {
  if (!treinoAtivoHome || !treinoInicioHome) return;

  const confirmar = confirm(`Encerrar treino "${treinoAtivoHome.nome}"?`);
  if (!confirmar) return;

  const duracaoSegundos = Math.floor((Date.now() - treinoInicioHome) / 1000);
  const duracao = formatarDuracao(duracaoSegundos);

  HistoricoStorage.registrar({
    treinoId: treinoAtivoHome.id,
    treinoNome: treinoAtivoHome.nome,
    duracao,
    exerciciosFei: treinoAtivoHome.exercicios,
  });

  clearInterval(cronometroHomeInterval);

  showToast(`✅ Treino finalizado! ${duracao}`);
  document.getElementById('treino-ativo-banner')?.remove();

  treinoAtivoHome = null;
  treinoInicioHome = null;
  cronometroHomeInterval = null;

  renderHistorico();
}

function formatarDuracao(totalSegundos) {
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;

  const partes = [];

  if (horas > 0) partes.push(`${horas}h`);
  if (minutos > 0) partes.push(`${minutos}min`);
  if (segundos > 0 || partes.length === 0) partes.push(`${segundos}s`);

  return partes.join(' ');
}

document.addEventListener('DOMContentLoaded', () => {

  initLayout("inicio");

  initSearch({ onSelect: openExerciseModal });

  renderMeusTreinos();
  renderCalendario();
  renderHistorico();
  renderDestaqueExercicios();
  renderDestaqueSection2();
});
