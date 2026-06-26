import { FavoritosStorage } from './storage.js';
import ExerciseAPI from './api.js';

export function buildExerciseCard(ex, { onClick, onFav, useStaticImage = true } = {}) {
  const isFav = FavoritosStorage.isFavorito(ex.id);
  const card = document.createElement('div');
  card.className = 'exercise-card';
  card.dataset.id = ex.id;

  const imgSrc = ex.gifUrl || '';

  card.innerHTML = `
    <div class="exercise-card__img-wrap">
      <img class="exercise-card__img" src="${imgSrc}" alt="${capitalize(ex.name)}" loading="lazy" />
    </div>
    <div class="exercise-card__body">
      <div class="exercise-card__name">${capitalize(ex.name)}</div>
      <div class="exercise-card__tags">${capitalize(ex.bodyPart)} · ${capitalize(ex.target)}</div>
    </div>
    <button class="exercise-card__fav${isFav ? ' active' : ''}" aria-label="Favoritar">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>
  `;

  if (useStaticImage && ex.id) {
    const imgEl = card.querySelector('.exercise-card__img');
    ExerciseAPI.getExerciseImage(ex.id, 180).then(blobUrl => {
      if (blobUrl && imgEl.isConnected) imgEl.src = blobUrl;

    });
  }

  card.querySelector('.exercise-card__fav').addEventListener('click', e => {
    e.stopPropagation();
    const added = FavoritosStorage.toggle(ex);
    const btn = e.currentTarget;
    btn.classList.toggle('active', added);
    btn.querySelector('svg').setAttribute('fill', added ? 'currentColor' : 'none');
    showToast(added ? `❤️ ${capitalize(ex.name)} adicionado aos favoritos` : `Removido dos favoritos`);
    if (typeof onFav === 'function') onFav(ex, added);
  });

  if (typeof onClick === 'function') {
    card.addEventListener('click', e => {
      if (!e.target.closest('.exercise-card__fav')) onClick(ex);
    });
  }

  return card;
}

let modalOverlay = null;

export function openExerciseModal(ex) {
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    document.body.appendChild(modalOverlay);
    modalOverlay.addEventListener('click', e => {
      if (e.target === modalOverlay) closeExerciseModal();
    });
  }

  const isFav = FavoritosStorage.isFavorito(ex.id);

  const initialSrc = ex.gifUrl || '';

  modalOverlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal__header">
        <h2 class="modal__title">${capitalize(ex.name)}</h2>
        <button class="modal__close" aria-label="Fechar">✕</button>
      </div>
      <div class="modal__img-wrap" style="position:relative;background:var(--clr-surface2)">
        <img class="modal__gif" src="${initialSrc}" alt="${capitalize(ex.name)}" />
        <div class="modal__img-loading" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s;pointer-events:none">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--clr-muted)" stroke-width="2" style="animation:spin 1s linear infinite">
            <circle cx="12" cy="12" r="10" stroke-opacity=".2"/><path d="M12 2a10 10 0 0 1 10 10"/>
          </svg>
        </div>
      </div>
      <div class="modal__body">
        <div class="modal__tags">
          <span class="tag">${capitalize(ex.bodyPart)}</span>
          <span class="tag">${capitalize(ex.target)}</span>
          <span class="tag">${capitalize(ex.equipment)}</span>
        </div>
        ${ex.secondaryMuscles?.length ? `
          <p style="font-size:.8rem;color:var(--clr-muted);margin-bottom:8px;">
            Músculos secundários: ${ex.secondaryMuscles.map(capitalize).join(', ')}
          </p>` : ''}
        ${ex.instructions?.length ? `
          <ol style="padding-left:18px;display:flex;flex-direction:column;gap:8px;margin-top:12px;">
            ${ex.instructions.map(i => `<li style="font-size:.85rem;color:var(--clr-muted);line-height:1.5">${i}</li>`).join('')}
          </ol>` : ''}
        <div style="display:flex;gap:10px;margin-top:20px;">
          <button class="btn btn-primary fav-modal-btn" style="flex:1">
            ${isFav ? '❤️ Favoritado' : '🤍 Favoritar'}
          </button>
        </div>
      </div>
    </div>
  `;

  if (ex.id) {
    const modalImg = modalOverlay.querySelector('.modal__gif');
    const loadingIndicator = modalOverlay.querySelector('.modal__img-loading');

    ExerciseAPI.getExerciseImage(ex.id, 360).then(blobUrl => {
      if (blobUrl && modalImg.isConnected) {
        loadingIndicator.style.opacity = '0';
        modalImg.src = blobUrl;
      }
    });
  }

  modalOverlay.querySelector('.modal__close').addEventListener('click', closeExerciseModal);
  modalOverlay.querySelector('.fav-modal-btn').addEventListener('click', () => {
    const added = FavoritosStorage.toggle(ex);
    modalOverlay.querySelector('.fav-modal-btn').textContent = added ? '❤️ Favoritado' : '🤍 Favoritar';
    showToast(added ? `❤️ ${capitalize(ex.name)} adicionado aos favoritos` : 'Removido dos favoritos');
  });

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeExerciseModal() {
  if (modalOverlay) modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

let toastContainer = null;

export function showToast(message, duration = 3000) {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

export function buildSkeletonCards(count = 5) {
  return Array.from({ length: count }, () => {
    const div = document.createElement('div');
    div.className = 'skeleton-card';
    div.innerHTML = `<div class="skeleton-img"></div><div class="skeleton-text"></div><div class="skeleton-text short"></div>`;
    return div;
  });
}

export function buildSidebar(activePage = 'inicio') {
  const links = [
    { id: 'inicio', label: 'Inicio', href: 'index.html', icon: homeIcon() },
    { id: 'exercicios', label: 'Exercícios', href: 'exercicios.html', icon: dumbellIcon() },
    { id: 'equipamentos', label: 'Equipamentos', href: 'equipamentos.html', icon: equipIcon() },
    { id: 'favoritos', label: 'Favoritos', href: 'favoritos.html', icon: heartIcon() },
    { id: 'treinos', label: 'Treinos', href: 'treinos.html', icon: listIcon() },
  ];

  return `
    <nav class="sidebar__nav">
      ${links.map(l => `
        <a href="${l.href}" class="nav-link ${activePage === l.id ? 'active' : ''}">
          ${l.icon}${l.label}
        </a>
      `).join('')}
    </nav>
  `;
}

export function buildHeader() {
  return `
    <a href="index.html" class="header__logo">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#f4a01c"/>
        <path d="M8 16h4m8 0h4M10 12v8M22 12v8M14 14h4v4h-4z" stroke="#000" stroke-width="2" stroke-linecap="round"/>
      </svg>
      A <span>ACADEMIA</span>
    </a>
    <div class="header__search-wrap">
      <svg class="header__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input type="text" class="header__search-input" placeholder="Buscar por nome..." autocomplete="off" />
      <div class="search-dropdown">
        <div class="search-dropdown__filters">
          <span style="font-size:.72rem;font-weight:700;letter-spacing:.08em;color:var(--clr-muted);text-transform:uppercase;align-self:center">Filtrar:</span>
          <button class="filter-chip active" data-filter="name">Nome</button>
          <button class="filter-chip" data-filter="bodyPart">Parte do corpo</button>
          <button class="filter-chip" data-filter="equipment">Equipamento</button>
        </div>
        <div class="search-results-list"></div>
      </div>
    </div>
    <div class="header__actions">
      <button class="btn-icon" id="themeToggle" title="Alternar tema">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      </button>
      <button class="btn-icon" title="Perfil">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      </button>
    </div>
  `;
}

export function capitalize(str = '') {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

function homeIcon() {
  return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
}
function dumbellIcon() {
  return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4v16M18 4v16M3 8h3M18 8h3M3 16h3M18 16h3M6 12h12"/></svg>`;
}
function equipIcon() {
  return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>`;
}
function heartIcon() {
  return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
}
function listIcon() {
  return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`;
}

export function buildFooter() {
  return `
        <div class="footer-content">

            <h3 class="footer-logo">
                <span>A</span> Academia
            </h3>

            <p class="footer-text">
                Treine melhor. Evolua todos os dias.
            </p>

            <div class="footer-links">
                <span>🏋️ 1300+ Exercícios</span>
                <span>📅 Treinos Personalizados</span>
                <span>📈 Histórico de Treinos</span>
            </div>

            <small>
                © 2026 A Academia • Desenvolvido por Kayo Moura
            </small>

        </div>
    `;
}

export function initLayout(pagina) {

  document.querySelector(".header").innerHTML =
    buildHeader();

  document.querySelector(".sidebar").innerHTML =
    buildSidebar(pagina);

  document.querySelector(".footer").innerHTML =
    buildFooter();

}
