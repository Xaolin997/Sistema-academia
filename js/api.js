const API_CONFIG = {
  BASE_URL: 'https://exercisedb.p.rapidapi.com',
  HEADERS: {
    'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
    'x-rapidapi-key': '8973d8c342mshd18b095a86f2af9p103274jsn7b5453b1f137',
  },
};

const jsonCache = new Map();
const imageCache = new Map();

async function get(endpoint, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_CONFIG.BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;

  if (jsonCache.has(url)) return jsonCache.get(url);

  const res = await fetch(url, {
    method: 'GET',
    headers: API_CONFIG.HEADERS,
  });

  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);

  const data = await res.json();
  jsonCache.set(url, data);
  return data;
}

async function getImage(exerciseId, resolution = 180) {
  const cacheKey = `${exerciseId}:${resolution}`;
  if (imageCache.has(cacheKey)) return imageCache.get(cacheKey);

  try {
    const url = `${API_CONFIG.BASE_URL}/image?exerciseId=${exerciseId}&resolution=${resolution}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: API_CONFIG.HEADERS,
    });

    if (!res.ok) throw new Error(`Image fetch error ${res.status}`);

    const blob = await res.blob();

    if (!blob.type.startsWith('image/')) throw new Error('Resposta não é imagem');

    const objectUrl = URL.createObjectURL(blob);
    imageCache.set(cacheKey, objectUrl);
    return objectUrl;
  } catch (err) {
    console.warn(`[API] Imagem não disponível para exercício ${exerciseId}:`, err.message);
    return null;
  }
}

function revokeAllImageCache() {
  imageCache.forEach(url => URL.revokeObjectURL(url));
  imageCache.clear();
}

const ExerciseAPI = {
  getAllExercises(limit = 10, offset = 0) {
    return get('/exercises', { limit, offset });
  },

  getExerciseById(id) {
    return get(`/exercises/exercise/${id}`);
  },

  getExercisesByName(name, limit = 10, offset = 0) {
    return get(`/exercises/name/${encodeURIComponent(name)}`, { limit, offset });
  },

  getExercisesByBodyPart(bodyPart, limit = 10, offset = 0) {
    return get(`/exercises/bodyPart/${encodeURIComponent(bodyPart)}`, { limit, offset });
  },

  getExercisesByEquipment(equipment, limit = 10, offset = 0) {
    return get(`/exercises/equipment/${encodeURIComponent(equipment)}`, { limit, offset });
  },

  getExercisesByTarget(target, limit = 10, offset = 0) {
    return get(`/exercises/target/${encodeURIComponent(target)}`, { limit, offset });
  },

  getBodyPartList() {
    return get('/exercises/bodyPartList');
  },

  getEquipmentList() {
    return get('/exercises/equipmentList');
  },

  getTargetList() {
    return get('/exercises/targetList');
  },

  getExerciseImage(exerciseId, resolution = 180) {
    return getImage(exerciseId, resolution);
  },
};

export { revokeAllImageCache };
export default ExerciseAPI;
