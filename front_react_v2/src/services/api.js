const BASE = 'http://localhost:8080/api';

export const api = {
  // LIVROS
  getLivros: () => fetch(`${BASE}/livros`).then(r => r.json()),
  criarLivro: (data) => fetch(`${BASE}/livros`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  editarLivro: (id, data) => fetch(`${BASE}/livros/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  deletarLivro: (id) => fetch(`${BASE}/livros/${id}`, { method: 'DELETE' }),

  // ALUNOS
  getAlunos: () => fetch(`${BASE}/alunos`).then(r => r.json()),
  criarAluno: (data) => fetch(`${BASE}/alunos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  editarAluno: (id, data) => fetch(`${BASE}/alunos/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  deletarAluno: (id) => fetch(`${BASE}/alunos/${id}`, { method: 'DELETE' }),
  login: (ra, senha) => fetch(`${BASE}/alunos/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ra, senha }) }),

  // EMPRESTIMOS
  getEmprestimos: () => fetch(`${BASE}/emprestimos/todos`).then(r => r.json()),
  getEmprestimosPorAluno: (nome) => fetch(`${BASE}/emprestimos/aluno/${encodeURIComponent(nome)}`).then(r => r.json()),
  criarEmprestimo: (data) => fetch(`${BASE}/emprestimos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  cancelarEmprestimo: (id) => fetch(`${BASE}/emprestimos/${id}`, { method: 'DELETE' }),
  confirmarEntrega: (id) => fetch(`${BASE}/emprestimos/${id}/entregar`, { method: 'POST' }),
  confirmarDevolucao: (id) => fetch(`${BASE}/emprestimos/${id}/devolver`, { method: 'POST' }),

  // STATS
  getStats: () => fetch(`${BASE}/admin/stats`).then(r => r.json()),
};
