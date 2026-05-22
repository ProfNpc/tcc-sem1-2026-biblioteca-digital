# BiblioTech - Front-end em React 🚀

## Pré-requisitos
- Node.js instalado (baixe em https://nodejs.org — versão LTS)
- Back-end Spring Boot rodando em http://localhost:8080

## Como rodar

1. Extraia a pasta `bibliotech-react`
2. Abra o terminal (CMD ou PowerShell) dentro dessa pasta
3. Execute os comandos abaixo:

```bash
# Instala as dependências (só na primeira vez)
npm install

# Inicia o servidor de desenvolvimento
npm run dev
```

4. Acesse no navegador: **http://localhost:3000**

## Estrutura do projeto

```
src/
  pages/
    LoginPage.jsx        ← Tela de login + cadastro
    CatalogoPage.jsx     ← Home pública com os livros
    AcervoPage.jsx       ← Catálogo para aluno logado + reservar
    ReservasPage.jsx     ← Minhas reservas (aluno)
    AdminReservasPage.jsx← Gestão de reservas + dashboard (admin)
    AdminLivrosPage.jsx  ← CRUD completo de livros (admin) ⭐
    AdminAlunosPage.jsx  ← CRUD completo de alunos (admin) ⭐
  components/
    Toast.jsx            ← Notificações pop-up
  services/
    api.js               ← Todas as chamadas para o back-end
  App.jsx                ← Componente principal (navegação)
  index.css              ← Estilos globais
```

## CRUDs implementados (para a apresentação)

### 1. CRUD de Livros (`/api/livros`)
- Listar todos os livros
- Adicionar novo livro
- Editar livro existente
- Excluir livro

### 2. CRUD de Alunos (`/api/alunos`)
- Listar todos os alunos
- Adicionar novo aluno
- Editar aluno existente
- Excluir aluno

## Login de teste
- Admin: RA `admin` / Senha `admin123`
- Aluno: RA `aluno1` / Senha `123456`
