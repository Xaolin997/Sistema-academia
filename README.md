# 🏋️ A Academia

```{=html}
<p align="center">
```

Aplicação web para gerenciamento de treinos, consulta de exercícios e
acompanhamento da evolução física.

```{=html}
</p>
```

```{=html}
<p align="center">
```

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![LocalStorage](https://img.shields.io/badge/Storage-LocalStorage-orange?style=for-the-badge)
![ExerciseDB](https://img.shields.io/badge/API-ExerciseDB-green?style=for-the-badge)

```{=html}
</p>
```

---

## 📖 Sobre

**A Academia** é uma aplicação desenvolvida em HTML, CSS e JavaScript
puro com foco em oferecer uma experiência simples para organização de
treinos.

O projeto permite criar treinos personalizados, pesquisar exercícios
utilizando a ExerciseDB, favoritar exercícios, acompanhar um calendário
semanal e registrar o histórico das sessões.

---

# ✨ Funcionalidades

- ✅ Cadastro de treinos
- ✅ Adição e remoção de exercícios
- ✅ Pesquisa por nome, equipamento e grupo muscular
- ✅ Favoritos
- ✅ Calendário semanal
- ✅ Cronômetro durante o treino
- ✅ Histórico de treinos
- ✅ Toasts e modais personalizados
- ✅ Persistência com LocalStorage

---

# 📂 Estrutura

```text
academia/
│
├── assets/
├── css/
│   ├── exercicios/
│   ├── favoritos/
│   ├── inicio/
│   ├── treinos/
│   └── global.css
│
├── js/
│   ├── api.js
│   ├── components.js
│   ├── constants.js
│   ├── weeklyCalendar.js
│   ├── storage.js
│   ├── search.js
│   ├── inicio.js
│   ├── treinos.js
│   ├── exercicios.js
│   ├── favoritos.js
│   └── equipamentos.js
│
├── index.html
├── exercicios.html
├── treinos.html
├── favoritos.html
└── equipamentos.html
```

---

# 🏗 Arquitetura

    Usuário
       │
       ▼
    Interface (HTML/CSS)
       │
       ▼
    JavaScript
       │
       ├── Components
       ├── Search
       ├── Storage
       ├── API
       └── WeeklyCalendar
       │
       ▼
    ExerciseDB API
       │
       ▼
    LocalStorage

---

# 🧩 Principais módulos

Arquivo Responsabilidade

---

api.js Comunicação com a API
storage.js Persistência de dados
components.js Header, Sidebar, Footer, Cards, Toasts e Modais
search.js Busca global
weeklyCalendar.js Calendário reutilizável
constants.js Constantes compartilhadas

---

# 💾 LocalStorage

Chave Conteúdo

---

academia:treinos Treinos
academia:favoritos Favoritos
academia:historico Histórico
academia:calendario Calendário

---

# 🚀 Executando

Utilize a extensão Live Server.

Abra:

- http://localhost:5502

---

# 🗺 Roadmap

- [x] Sistema de treinos
- [x] Calendário semanal
- [x] Favoritos
- [x] Histórico
- [x] Cronômetro
- [ ] Login
- [ ] Banco de dados
- [ ] Backend
- [ ] Sincronização em nuvem
- [ ] PWA
- [ ] Aplicativo Android
- [ ] Estatísticas
- [ ] Perfil do usuário

---

# 📸 Screenshots

# Home

![Home](docs/images/home.png)

# Treinos

![Treinos](docs/images/treinos.png)

# Exercícios

![Exercícios](docs/images/exercicios.png)

# Favoritos

![Favoritos](docs/images/favoritos.png)

---

# 🙏 Créditos

- ExerciseDB API
- HTML5
- CSS3
- JavaScript ES Modules

---

# 👨‍💻 Autor

**Kayo Moura**

Projeto desenvolvido para estudos de Análise e Desenvolvimento de
Sistemas.
