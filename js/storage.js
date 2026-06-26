const KEYS = {
  TREINOS:    'academia:treinos',
  FAVORITOS:  'academia:favoritos',
  HISTORICO:  'academia:historico',
  CALENDARIO: 'academia:calendario',
};

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const TreinosStorage = {

  getAll() {
    return read(KEYS.TREINOS) || [];
  },

  getById(id) {
    return this.getAll().find(t => t.id === id) || null;
  },

  save(treino) {
    const treinos = this.getAll();
    const idx = treinos.findIndex(t => t.id === treino.id);
    if (idx >= 0) {
      treinos[idx] = { ...treinos[idx], ...treino, updatedAt: Date.now() };
    } else {
      treinos.push({
        ...treino,
        id: treino.id || `treino_${Date.now()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        exercicios: treino.exercicios || [],
      });
    }
    write(KEYS.TREINOS, treinos);
    return treinos.find(t => t.id === (treino.id || treinos[treinos.length - 1].id));
  },

  remove(id) {
    const treinos = this.getAll().filter(t => t.id !== id);
    write(KEYS.TREINOS, treinos);
  },

  addExercicio(treinoId, exercicio, config = { series: 3, reps: '10-12', descanso: 60 }) {
    const treino = this.getById(treinoId);
    if (!treino) return null;
    const jaExiste = treino.exercicios.some(e => e.exercicioId === exercicio.id);
    if (!jaExiste) {
      treino.exercicios.push({
        exercicioId: exercicio.id,
        name: exercicio.name,
        gifUrl: exercicio.gifUrl,
        bodyPart: exercicio.bodyPart,
        target: exercicio.target,
        equipment: exercicio.equipment,
        ...config,
      });
    }
    return this.save(treino);
  },

  removeExercicio(treinoId, exercicioId) {
    const treino = this.getById(treinoId);
    if (!treino) return null;
    treino.exercicios = treino.exercicios.filter(e => e.exercicioId !== exercicioId);
    return this.save(treino);
  },
};

export const FavoritosStorage = {
  getAll() {
    return read(KEYS.FAVORITOS) || [];
  },

  isFavorito(exercicioId) {
    return this.getAll().some(f => f.id === exercicioId);
  },

  toggle(exercicio) {
    const favs = this.getAll();
    const idx = favs.findIndex(f => f.id === exercicio.id);
    if (idx >= 0) {
      favs.splice(idx, 1);
    } else {
      favs.push({
        id: exercicio.id,
        name: exercicio.name,
        gifUrl: exercicio.gifUrl,
        bodyPart: exercicio.bodyPart,
        target: exercicio.target,
        equipment: exercicio.equipment,
        savedAt: Date.now(),
      });
    }
    write(KEYS.FAVORITOS, favs);
    return idx < 0;
  },
};

export const HistoricoStorage = {
  getAll() {
    return (read(KEYS.HISTORICO) || []).sort((a, b) => b.iniciadoEm - a.iniciadoEm);
  },

  registrar({ treinoId, treinoNome, duracao, exerciciosFei = [] }) {
    const historico = this.getAll();
    const entrada = {
      id: `hist_${Date.now()}`,
      treinoId,
      treinoNome,
      duracao,
      exerciciosFei,
      iniciadoEm: Date.now(),
      data: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    };
    historico.unshift(entrada);

    if (historico.length > 100) historico.pop();
    write(KEYS.HISTORICO, historico);
    return entrada;
  },

  remover(id) {
    const historico = this.getAll().filter(h => h.id !== id);
    write(KEYS.HISTORICO, historico);
  },

  limpar() {
    write(KEYS.HISTORICO, []);
  },

  recentes(n = 10) {
    return this.getAll().slice(0, n);
  },
};

export const CalendarioStorage = {

  get() {
    return read(KEYS.CALENDARIO) || {
      segunda: null, terca: null, quarta: null,
      quinta: null, sexta: null, sabado: null, domingo: null,
    };
  },

  set(diasConfig) {
    write(KEYS.CALENDARIO, diasConfig);
  },

  setDia(dia, treinoId) {
    const cal = this.get();
    cal[dia] = treinoId;
    this.set(cal);
  },
};
