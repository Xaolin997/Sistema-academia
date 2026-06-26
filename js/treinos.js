import { TreinosStorage, HistoricoStorage, CalendarioStorage } from './storage.js';
import { initLayout, buildExerciseCard, openExerciseModal, showToast } from './components.js';
import ExerciseAPI from './api.js';
import { initSearch } from './search.js';
import { renderWeeklyCalendar } from './weeklyCalendar.js';
import { DIAS_CONFIG } from './constants.js';

let treinoAtivo = null;
let treinoInicio = null;
let cronometroInterval = null;

function renderTreinos() {
  const list = document.getElementById('treinos-list');
  if (!list) return;

  const treinos = TreinosStorage.getAll();

  if (!treinos.length) {
    list.innerHTML = `
      <div style="background:var(--clr-surface);border:1px dashed var(--clr-border);border-radius:var(--radius-md);padding:48px;text-align:center;color:var(--clr-muted)">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:.3;margin-bottom:12px">
          <path d="M6 4v16M18 4v16M3 8h3M18 8h3M3 16h3M18 16h3M6 12h12"/>
        </svg>
        <p style="margin-bottom:16px;font-size:.9rem">Nenhum treino criado ainda.</p>
        <button class="btn btn-primary" id="novo-treino-btn-empty">Criar primeiro treino</button>
      </div>`;
    document.getElementById('novo-treino-btn-empty')?.addEventListener('click', abrirModalNovoTreino);
    renderCalendarioSemanal();
    return;
  }

  list.innerHTML = treinos.map(t => `
    <div class="treino-item" data-id="${t.id}">
      <div class="treino-item__head">
        <div class="treino-item__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 4v16M18 4v16M3 8h3M18 8h3M3 16h3M18 16h3M6 12h12"/>
          </svg>
        </div>
        <div class="treino-item__info">
          <div class="treino-item__name">${t.nome}</div>
          <div class="treino-item__meta">${t.descricao || ''} · ${t.exercicios?.length || 0} exercícios · ${diasDoTreino(t.id)}</div>
        </div>
        <div class="treino-item__actions">
          <button class="btn btn-primary iniciar-btn" data-id="${t.id}" style="padding:7px 16px;font-size:.8rem">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Iniciar
          </button>
          <button class="treino-item__toggle" aria-label="Expandir">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="treino-item__body">
        <div class="exercicio-list" id="ex-list-${t.id}">
          ${renderExercicioRows(t)}
        </div>
        <button class="add-exercicio-btn" data-treino-id="${t.id}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Adicionar exercício
        </button>
        <div class="treino-item__footer">
          <button class="btn btn-outline calendario-btn" data-id="${t.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Agendar dias
          </button>
          <button class="btn btn-outline editar-nome-btn" data-id="${t.id}">Renomear</button>
          <button class="btn btn-outline deletar-btn" data-id="${t.id}" style="color:#e05c5c;border-color:#e05c5c40">Excluir</button>
        </div>
      </div>
    </div>
  `).join('');

  bindTreinoEvents();
  renderCalendarioSemanal();
}

function renderExercicioRows(t) {
  if (!t.exercicios?.length) {
    return `<p style="color:var(--clr-muted);font-size:.83rem;text-align:center;padding:16px">Nenhum exercício. Clique abaixo para adicionar.</p>`;
  }
  return t.exercicios.map(ex => `
   <div class="exercicio-row" data-ex-id="${ex.exercicioId}" data-treino-id="${t.id}">
  <div class="exercicio-row__info">
    <div class="exercicio-row__name">
      ${cap(ex.name)}
    </div>

    <div class="exercicio-row__tags">
      ${cap(ex.bodyPart || '')} · ${cap(ex.equipment || '')}
    </div>
  </div>

  <div class="exercicio-row__sets">
    <span class="sets-badge">
      ${ex.series}x${ex.reps}
    </span>
  </div>

  <button
    class="exercicio-row__remove"
    data-ex-id="${ex.exercicioId}"
    data-treino-id="${t.id}"
    aria-label="Remover">

    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14H6L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4h6v2"/>
    </svg>

  </button>
</div>
  `).join('');
}

function renderCalendarioSemanal() {
  renderWeeklyCalendar({
    container: document.getElementById('calendario-semanal'),
    calendario: CalendarioStorage.get(),
    treinos: TreinosStorage.getAll(),
    dias: DIAS_CONFIG.map(dia => dia.key),
    editable: true,
    onEdit: abrirModalAgendaDia,
  });
}

let agendaOverlay = null;

function abrirModalAgendaDia(dia) {
  abrirAgendaModal({ modoDia: true, diaFixo: dia });
}

function abrirModalAgendaTreino(treinoId) {
  abrirAgendaModal({ modoDia: false, treinoIdFixo: treinoId });
}

function abrirAgendaModal({ modoDia, diaFixo, treinoIdFixo }) {
  if (!agendaOverlay) {
    agendaOverlay = document.createElement('div');
    agendaOverlay.className = 'modal-overlay';
    document.body.appendChild(agendaOverlay);
    agendaOverlay.addEventListener('click', e => {
      if (e.target === agendaOverlay) agendaOverlay.classList.remove('open');
    });
  }

  const treinos = TreinosStorage.getAll();
  const cal = CalendarioStorage.get();

  if (modoDia) {

    const diaLabel = DIAS_CONFIG.find(d => d.key === diaFixo)?.label || diaFixo;

    agendaOverlay.innerHTML = `
      <div class="modal" style="max-width:420px">
        <div class="modal__header">
          <h2 class="modal__title" style="font-size:1.1rem">Agendar ${diaLabel}</h2>
          <button class="modal__close">✕</button>
        </div>
        <div class="modal-form" style="padding-top:12px">
          <p style="font-size:.82rem;color:var(--clr-muted);margin-bottom:14px">Escolha o treino para este dia:</p>
          <div class="agenda-opcoes">
            <label class="agenda-opcao ${!cal[diaFixo] ? 'selected' : ''}">
              <input type="radio" name="treino-dia" value="" ${!cal[diaFixo] ? 'checked' : ''} />
              <span class="agenda-opcao__icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>
              </span>
              <span class="agenda-opcao__text">
                <strong>Sem treino</strong>
                <small>Remover agendamento</small>
              </span>
            </label>
            <label class="agenda-opcao ${cal[diaFixo] === 'descanso' ? 'selected' : ''}">
              <input type="radio" name="treino-dia" value="descanso" ${cal[diaFixo] === 'descanso' ? 'checked' : ''} />
              <span class="agenda-opcao__icon" style="background:rgba(88,88,88,.15);color:var(--clr-muted)">😴</span>
              <span class="agenda-opcao__text">
                <strong>Descanso</strong>
                <small>Dia de recuperação</small>
              </span>
            </label>
            ${treinos.map(t => `
              <label class="agenda-opcao ${cal[diaFixo] === t.id ? 'selected' : ''}">
                <input type="radio" name="treino-dia" value="${t.id}" ${cal[diaFixo] === t.id ? 'checked' : ''} />
                <span class="agenda-opcao__icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 4v16M18 4v16M3 8h3M18 8h3M3 16h3M18 16h3M6 12h12"/>
                  </svg>
                </span>
                <span class="agenda-opcao__text">
                  <strong>${t.nome}</strong>
                  <small>${t.exercicios?.length || 0} exercícios${t.descricao ? ' · ' + t.descricao : ''}</small>
                </span>
              </label>
            `).join('')}
          </div>
          <div class="form-footer" style="margin-top:20px">
            <button class="btn btn-outline" id="agenda-cancel">Cancelar</button>
            <button class="btn btn-primary" id="agenda-salvar">Salvar</button>
          </div>
        </div>
      </div>
    `;

    agendaOverlay.querySelectorAll('.agenda-opcao input').forEach(radio => {
      radio.addEventListener('change', () => {
        agendaOverlay.querySelectorAll('.agenda-opcao').forEach(l => l.classList.remove('selected'));
        radio.closest('.agenda-opcao').classList.add('selected');
      });
    });

    agendaOverlay.querySelector('#agenda-salvar').addEventListener('click', () => {
      const val = agendaOverlay.querySelector('input[name="treino-dia"]:checked')?.value ?? '';
      CalendarioStorage.setDia(diaFixo, val || null);
      showToast(`📅 ${diaLabel} atualizado!`);
      agendaOverlay.classList.remove('open');
      renderCalendarioSemanal();
    });

  } else {

    const treino = TreinosStorage.getById(treinoIdFixo);
    if (!treino) return;

    const diasAtivos = DIAS_CONFIG
      .filter(d => cal[d.key] === treinoIdFixo)
      .map(d => d.key);

    agendaOverlay.innerHTML = `
      <div class="modal" style="max-width:420px">
        <div class="modal__header">
          <h2 class="modal__title" style="font-size:1.1rem">Agendar "${treino.nome}"</h2>
          <button class="modal__close">✕</button>
        </div>
        <div class="modal-form" style="padding-top:12px">
          <p style="font-size:.82rem;color:var(--clr-muted);margin-bottom:14px">Escolha os dias da semana:</p>
          <div class="dias-semana-grid">
            ${DIAS_CONFIG.map(({ key, label }) => `
              <label class="dia-check ${diasAtivos.includes(key) ? 'active' : ''}">
                <input type="checkbox" value="${key}" ${diasAtivos.includes(key) ? 'checked' : ''} />
                <span class="dia-check__abrev">${label.slice(0, 3)}</span>
                <span class="dia-check__nome">${label.split('-')[0]}</span>
              </label>
            `).join('')}
          </div>
          <div class="form-footer" style="margin-top:20px">
            <button class="btn btn-outline" id="agenda-cancel">Cancelar</button>
            <button class="btn btn-primary" id="agenda-salvar">Salvar</button>
          </div>
        </div>
      </div>
    `;

    agendaOverlay.querySelectorAll('.dia-check input').forEach(chk => {
      chk.addEventListener('change', () => {
        chk.closest('.dia-check').classList.toggle('active', chk.checked);
      });
    });

    agendaOverlay.querySelector('#agenda-salvar').addEventListener('click', () => {
      const checked = [...agendaOverlay.querySelectorAll('.dia-check input:checked')].map(c => c.value);

      DIAS_CONFIG.forEach(({ key }) => {
        if (checked.includes(key)) {
          CalendarioStorage.setDia(key, treinoIdFixo);
        } else if (cal[key] === treinoIdFixo) {
          CalendarioStorage.setDia(key, null);
        }
      });

      showToast(`📅 "${treino.nome}" agendado para ${checked.length} dia(s)!`);
      agendaOverlay.classList.remove('open');
      renderTreinos();
    });
  }

  agendaOverlay.querySelector('.modal__close').addEventListener('click', () => agendaOverlay.classList.remove('open'));
  agendaOverlay.querySelector('#agenda-cancel').addEventListener('click', () => agendaOverlay.classList.remove('open'));
  agendaOverlay.classList.add('open');
}

function diasDoTreino(treinoId) {
  const cal = CalendarioStorage.get();
  const dias = DIAS_CONFIG.filter(d => cal[d.key] === treinoId).map(d => d.label.split('-')[0]);
  return dias.length ? dias.join(', ') : 'Sem dias agendados';
}

function bindTreinoEvents() {
  document.querySelectorAll('.treino-item__toggle').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.treino-item').classList.toggle('expanded'));
  });

  document.querySelectorAll('.iniciar-btn').forEach(btn => {
    btn.addEventListener('click', () => iniciarTreino(btn.dataset.id));
  });

  document.querySelectorAll('.exercicio-row__remove').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      TreinosStorage.removeExercicio(btn.dataset.treinoId, btn.dataset.exId);
      showToast('Exercício removido');
      renderTreinos();
    });
  });

  document.querySelectorAll('.add-exercicio-btn').forEach(btn => {
    btn.addEventListener('click', () => abrirPickerExercicio(btn.dataset.treinoId));
  });

  document.querySelectorAll('.calendario-btn').forEach(btn => {
    btn.addEventListener('click', () => abrirModalAgendaTreino(btn.dataset.id));
  });

  document.querySelectorAll('.deletar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Excluir este treino?')) {
        TreinosStorage.remove(btn.dataset.id);
        showToast('Treino excluído');
        renderTreinos();
      }
    });
  });

  document.querySelectorAll('.editar-nome-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const treino = TreinosStorage.getById(btn.dataset.id);
      if (!treino) return;
      const novoNome = prompt('Novo nome do treino:', treino.nome);
      if (novoNome?.trim()) {
        TreinosStorage.save({ ...treino, nome: novoNome.trim() });
        showToast('Treino renomeado!');
        renderTreinos();
      }
    });
  });
}

let pickerOverlay = null;

async function abrirPickerExercicio(treinoId) {
  if (!pickerOverlay) {
    pickerOverlay = document.createElement('div');
    pickerOverlay.className = 'modal-overlay';
    document.body.appendChild(pickerOverlay);
    pickerOverlay.addEventListener('click', e => {
      if (e.target === pickerOverlay) pickerOverlay.classList.remove('open');
    });
  }

  pickerOverlay.innerHTML = `
    <div class="modal" style="max-width:520px">
      <div class="modal__header">
        <h2 class="modal__title" style="font-size:1.2rem">Adicionar exercício</h2>
        <button class="modal__close">✕</button>
      </div>
      <div class="modal-form">
        <div class="form-group">
          <label>Buscar exercício</label>
          <input type="text" id="picker-search" placeholder="Nome do exercício..." />
        </div>
        <div class="exercicio-picker" id="picker-list">
          <p style="color:var(--clr-muted);font-size:.83rem;text-align:center;padding:16px">Digite para buscar...</p>
        </div>
        <div class="form-footer" style="margin-top:16px">
          <button class="btn btn-outline" id="picker-cancel">Cancelar</button>
        </div>
      </div>
    </div>
  `;

  pickerOverlay.querySelector('.modal__close').addEventListener('click', () => pickerOverlay.classList.remove('open'));
  pickerOverlay.querySelector('#picker-cancel').addEventListener('click', () => pickerOverlay.classList.remove('open'));
  pickerOverlay.classList.add('open');

  let searchTimeout;
  const searchInput = pickerOverlay.querySelector('#picker-search');
  const pickerList = pickerOverlay.querySelector('#picker-list');

  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    const q = searchInput.value.trim();
    if (q.length < 2) {
      pickerList.innerHTML = `<p style="color:var(--clr-muted);font-size:.83rem;text-align:center;padding:16px">Digite ao menos 2 caracteres...</p>`;
      return;
    }
    pickerList.innerHTML = `<p style="color:var(--clr-muted);font-size:.83rem;text-align:center;padding:16px">Buscando...</p>`;
    searchTimeout = setTimeout(async () => {
      try {
        const results = await ExerciseAPI.getExercisesByName(q, 15);
        if (!results.length) {
          pickerList.innerHTML = `<p style="color:var(--clr-muted);font-size:.83rem;text-align:center;padding:16px">Nenhum exercício encontrado.</p>`;
          return;
        }
        pickerList.innerHTML = results.map(ex => `
          <div class="exercicio-picker-item" data-id="${ex.id}">
            <div class="info">
              <strong>${cap(ex.name)}</strong>
                <span>${cap(ex.bodyPart)} · ${cap(ex.equipment)}</span>
            </div>
          </div>
          `).join('');
        pickerList.querySelectorAll('.exercicio-picker-item').forEach((item, i) => {
          item.addEventListener('click', () => {
            TreinosStorage.addExercicio(treinoId, results[i]);
            showToast(`✅ ${cap(results[i].name)} adicionado!`);
            pickerOverlay.classList.remove('open');
            renderTreinos();
          });
        });
      } catch {
        pickerList.innerHTML = `<p style="color:var(--clr-muted);font-size:.83rem;text-align:center;padding:16px">Erro ao buscar.</p>`;
      }
    }, 400);
  });

  searchInput.focus();
}

let novoTreinoOverlay = null;

function abrirModalNovoTreino() {
  if (!novoTreinoOverlay) {
    novoTreinoOverlay = document.createElement('div');
    novoTreinoOverlay.className = 'modal-overlay';
    document.body.appendChild(novoTreinoOverlay);
    novoTreinoOverlay.addEventListener('click', e => {
      if (e.target === novoTreinoOverlay) novoTreinoOverlay.classList.remove('open');
    });
  }

  novoTreinoOverlay.innerHTML = `
    <div class="modal">
      <div class="modal__header">
        <h2 class="modal__title" style="font-size:1.2rem">Novo Treino</h2>
        <button class="modal__close">✕</button>
      </div>
      <div class="modal-form">
        <div class="form-group">
          <label>Nome do treino *</label>
          <input type="text" id="novo-treino-nome" placeholder="Ex: Peito e Tríceps" />
        </div>
        <div class="form-group">
          <label>Descrição</label>
          <textarea id="novo-treino-desc" placeholder="Descrição opcional..."></textarea>
        </div>

        <div class="form-group">
          <label>Agendar dias da semana</label>
          <p style="font-size:.75rem;color:var(--clr-muted);margin-bottom:10px">Opcional — você pode alterar depois</p>
          <div class="dias-semana-grid" id="novo-treino-dias">
            ${DIAS_CONFIG.map(({ key, label }) => `
              <label class="dia-check">
                <input type="checkbox" value="${key}" />
                <span class="dia-check__abrev">${label.slice(0, 3)}</span>
                <span class="dia-check__nome">${label.split('-')[0]}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <div class="form-footer">
          <button class="btn btn-outline" id="cancel-novo">Cancelar</button>
          <button class="btn btn-primary" id="salvar-novo">Criar treino</button>
        </div>
      </div>
    </div>
  `;

  novoTreinoOverlay.querySelectorAll('.dia-check input').forEach(chk => {
    chk.addEventListener('change', () => chk.closest('.dia-check').classList.toggle('active', chk.checked));
  });

  novoTreinoOverlay.querySelector('.modal__close').addEventListener('click', () => novoTreinoOverlay.classList.remove('open'));
  novoTreinoOverlay.querySelector('#cancel-novo').addEventListener('click', () => novoTreinoOverlay.classList.remove('open'));

  novoTreinoOverlay.querySelector('#salvar-novo').addEventListener('click', () => {
    const nome = novoTreinoOverlay.querySelector('#novo-treino-nome').value.trim();
    const desc = novoTreinoOverlay.querySelector('#novo-treino-desc').value.trim();
    if (!nome) { alert('Informe o nome do treino.'); return; }

    const novoTreino = TreinosStorage.save({ nome, descricao: desc, exercicios: [] });

    const diasEscolhidos = [...novoTreinoOverlay.querySelectorAll('.dia-check input:checked')].map(c => c.value);
    diasEscolhidos.forEach(dia => CalendarioStorage.setDia(dia, novoTreino.id));

    const msgDias = diasEscolhidos.length ? ` agendado para ${diasEscolhidos.length} dia(s)` : '';
    showToast(`🏋️ Treino "${nome}" criado${msgDias}!`);
    novoTreinoOverlay.classList.remove('open');
    renderTreinos();
  });

  novoTreinoOverlay.classList.add('open');
  novoTreinoOverlay.querySelector('#novo-treino-nome').focus();
}

function iniciarTreino(treinoId) {
  const treino = TreinosStorage.getById(treinoId);
  if (!treino) return;

  if (treinoAtivo) {
    alert('Já existe um treino em andamento.');
    return;
  }

  treinoAtivo = treino;
  treinoInicio = Date.now();

  showToast(`▶️ Treino "${treino.nome}" iniciado!`);

  renderTreinoAtivo();
  iniciarCronometro();
}
function renderTreinoAtivo() {
  let banner = document.getElementById('treino-ativo-banner');

  if (!banner) {
    const main = document.querySelector('main');
    const header = document.querySelector('.treinos-page-header');

    banner = document.createElement('div');
    banner.id = 'treino-ativo-banner';
    banner.className = 'active-workout-banner';

    main.insertBefore(banner, header.nextSibling);
  }

  banner.innerHTML = `
    <div class="active-workout-banner__info">
      <div class="active-workout-banner__name">
        ${treinoAtivo.nome}
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
    .addEventListener('click', encerrarTreino);
}

function iniciarCronometro() {
  atualizarCronometro();

  cronometroInterval = setInterval(() => {
    atualizarCronometro();
  }, 1000);
}

function atualizarCronometro() {
  const cronometro = document.getElementById('cronometro-treino');
  if (!cronometro || !treinoInicio) return;

  const tempoTotal = Math.floor((Date.now() - treinoInicio) / 1000);

  const horas = Math.floor(tempoTotal / 3600);
  const minutos = Math.floor((tempoTotal % 3600) / 60);
  const segundos = tempoTotal % 60;

  cronometro.textContent = [
    horas,
    minutos,
    segundos
  ].map(n => String(n).padStart(2, '0')).join(':');
}

function encerrarTreino() {
  if (!treinoAtivo || !treinoInicio) return;

  const confirmar = confirm(`Encerrar treino "${treinoAtivo.nome}"?`);
  if (!confirmar) return;

  const duracaoSegundos = Math.floor((Date.now() - treinoInicio) / 1000);
  const duracao = formatarDuracao(duracaoSegundos);

  HistoricoStorage.registrar({
    treinoId: treinoAtivo.id,
    treinoNome: treinoAtivo.nome,
    duracao,
    exerciciosFei: treinoAtivo.exercicios,
  });

  clearInterval(cronometroInterval);

  showToast(`✅ Treino finalizado! ${duracao} registrado no histórico.`);

  document.getElementById('treino-ativo-banner')?.remove();

  treinoAtivo = null;
  treinoInicio = null;
  cronometroInterval = null;
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

function cap(str = '') { return str.replace(/\b\w/g, c => c.toUpperCase()); }

document.addEventListener('DOMContentLoaded', () => {
  initLayout("treinos");
  initSearch({ onSelect: openExerciseModal });
  renderTreinos();
  document.getElementById('novo-treino-btn')?.addEventListener('click', abrirModalNovoTreino);
});
