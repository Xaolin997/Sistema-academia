export const DIAS_CONFIG = [
  { key: 'segunda', label: 'Segunda-feira', shortLabel: 'Segunda', abrev: 'Seg' },
  { key: 'terca', label: 'Terça-feira', shortLabel: 'Terça', abrev: 'Ter' },
  { key: 'quarta', label: 'Quarta-feira', shortLabel: 'Quarta', abrev: 'Qua' },
  { key: 'quinta', label: 'Quinta-feira', shortLabel: 'Quinta', abrev: 'Qui' },
  { key: 'sexta', label: 'Sexta-feira', shortLabel: 'Sexta', abrev: 'Sex' },
  { key: 'sabado', label: 'Sábado', shortLabel: 'Sábado', abrev: 'Sáb' },
  { key: 'domingo', label: 'Domingo', shortLabel: 'Domingo', abrev: 'Dom' },
];

export const DIAS_UTEIS = ['segunda', 'terca', 'quarta', 'quinta', 'sexta'];

export const DIAS_LABEL = DIAS_CONFIG.reduce((acc, dia) => {
  acc[dia.key] = dia.shortLabel;
  return acc;
}, {});

export function getDiaAtualKey() {
  const map = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  return map[new Date().getDay()];
}

export function getDiaConfig(key) {
  return DIAS_CONFIG.find(dia => dia.key === key) || null;
}
