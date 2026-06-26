# 🏋️ A Academia

> Organize seus treinos, acompanhe sua evolução e descubra novos
> exercícios em uma única aplicação.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![ExerciseDB](https://img.shields.io/badge/API-ExerciseDB-success?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-orange?style=for-the-badge)

---

# 📖 Sobre

**A Academia** é uma aplicação web desenvolvida em HTML, CSS e
JavaScript puro com foco em praticantes de musculação.

O sistema permite criar treinos personalizados, pesquisar exercícios
através da ExerciseDB, organizar a rotina semanal, acompanhar o
histórico de treinos e registrar o tempo de cada sessão.

## ✨ Funcionalidades

- Cadastro de treinos personalizados
- Pesquisa de exercícios
- Favoritar exercícios
- Calendário semanal
- Cronômetro de treino
- Histórico de treinos
- Persistência com LocalStorage
- Interface responsiva

---

# 📸 Screenshots

Crie a estrutura:

```md
![Banner](docs/images/banner.png)

## Home

![Home](docs/images/home.png)

## Treinos

![Treinos](docs/images/treinos.png)

## Exercícios

![Exercícios](docs/images/exercicios.png)

## Favoritos

![Favoritos](docs/images/favoritos.png)

## Equipamentos

![Equipamentos](docs/images/equipamentos.png)
```

---

# 🏗 Arquitetura

```text
                Usuário
                   │
                   ▼
        HTML + CSS (Interface)
                   │
                   ▼
          JavaScript (ES Modules)
     ┌──────────┼──────────┐
     │          │          │
 Components    Search     API
     │          │          │
     └──────┬───┴──────┬───┘
            │          │
            ▼          ▼
       LocalStorage ExerciseDB
```

---

# 📂 Estrutura do Projeto

```text
academia/
├── assets/
├── css/
│   ├── exercicios/
│   ├── favoritos/
│   ├── inicio/
│   ├── treinos/
│   └── global.css
├── docs/
│   └── images/
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
├── index.html
├── exercicios.html
├── treinos.html
├── favoritos.html
└── equipamentos.html
```

---

# ⚙ Tecnologias

Tecnologia Finalidade

---

HTML5 Estrutura
CSS3 Interface
JavaScript ES Modules Lógica
LocalStorage Persistência
ExerciseDB Exercícios

---

# 🧩 Módulos

## api.js

Comunicação com a ExerciseDB.

## storage.js

Centraliza toda a persistência.

Gerencia:

- Treinos
- Favoritos
- Histórico
- Calendário

## components.js

Componentes reutilizáveis:

- Header
- Sidebar
- Footer
- Cards
- Toasts
- Modais

## search.js

Responsável pelo sistema de busca.

## weeklyCalendar.js

Renderiza o calendário semanal reutilizado entre páginas.

## constants.js

Constantes compartilhadas.

---

# 📄 Páginas

Página Descrição

---

index.html Dashboard inicial
exercicios.html Pesquisa de exercícios
treinos.html Gerenciamento de treinos
favoritos.html Exercícios favoritos
equipamentos.html Exercícios por equipamento

---

# 💾 Estrutura do LocalStorage

Chave Conteúdo

---

academia:treinos Lista de treinos
academia:favoritos Exercícios favoritos
academia:historico Histórico de sessões
academia:calendario Agenda semanal

---

# 🚀 Como executar

```bash
git clone <URL_DO_REPOSITORIO>
cd academia
```

Utilize a extensão Live Server.

Abra:

http://localhost:5502

---

# 🛣 Roadmap

- [x] Sistema de treinos
- [x] Pesquisa de exercícios
- [x] Favoritos
- [x] Calendário
- [x] Cronômetro
- [x] Histórico
- [ ] Login
- [ ] Backend
- [ ] Banco de dados
- [ ] Sincronização
- [ ] PWA
- [ ] Aplicativo Android
- [ ] Perfil
- [ ] Estatísticas

---

# 💡 Melhorias Futuras

- Autenticação
- Compartilhamento de treinos
- Backup em nuvem
- Metas semanais
- Gráficos de evolução
- Modo escuro/claro
- Notificações

---

# 👨‍💻 Autor

**Kayo Moura**

Projeto desenvolvido para estudos do curso de **Análise e
Desenvolvimento de Sistemas**.

Se este projeto foi útil, considere deixar uma ⭐ no repositório.
