const BASE = 'http://localhost:8080/api';
export const IMG_BASE = 'http://localhost:8080/capas';

const TOKEN_KEY = 'bibliotech_token';

function getToken() { return localStorage.getItem(TOKEN_KEY); }
function setToken(token) { if (token) localStorage.setItem(TOKEN_KEY, token); }
function limparToken() { localStorage.removeItem(TOKEN_KEY); }

// Todo pedido protegido do backend precisa desse header - sem ele, o AuthFilter
// do Spring devolve 401 antes mesmo de chegar no controller.
function authHeaders(extra = {}) {
  const token = getToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

// Faz o fetch e, se a resposta não for OK (ex: 409 de duplicidade), joga um erro
// com a mensagem que o backend mandou no corpo - assim o front consegue mostrar
// a mensagem real ("Já existe um livro com este título") em vez de tratar como sucesso.
async function postOuPut(url, method, data) {
  const resp = await fetch(url, {
    method,
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });
  const texto = await resp.text();
  let corpo;
  try { corpo = texto ? JSON.parse(texto) : null; } catch { corpo = texto; }
  if (!resp.ok) {
    const mensagem = typeof corpo === 'string' ? corpo : (corpo?.message || 'Erro ao salvar.');
    const erro = new Error(mensagem);
    erro.status = resp.status;
    throw erro;
  }
  return corpo;
}

export const api = {
  // SESSÃO
  salvarSessao: (aluno) => setToken(aluno?.token),
  encerrarSessao: () => {
    fetch(`${BASE}/alunos/logout`, { method: 'POST', headers: authHeaders() }).catch(() => {});
    limparToken();
  },

  // LIVROS
  getLivros: (unidade) => {
    const query = unidade ? `?unidade=${encodeURIComponent(unidade)}` : '';
    return fetch(`${BASE}/livros${query}`).then(r => r.json());
  },
  criarLivro: (data) => postOuPut(`${BASE}/livros`, 'POST', data),
  editarLivro: (id, data) => postOuPut(`${BASE}/livros/${id}`, 'PUT', data),
  deletarLivro: (id) => fetch(`${BASE}/livros/${id}`, { method: 'DELETE', headers: authHeaders() }),
  uploadImagem: (id, arquivo) => {
    const form = new FormData();
    form.append('arquivo', arquivo);
    return fetch(`${BASE}/livros/${id}/imagem`, { method: 'POST', headers: authHeaders(), body: form });
  },

  // ALUNOS
  getAlunos: () => fetch(`${BASE}/alunos`, { headers: authHeaders() }).then(r => r.json()),
  criarAluno: (data) => postOuPut(`${BASE}/alunos`, 'POST', data),
  editarAluno: (id, data) => postOuPut(`${BASE}/alunos/${id}`, 'PUT', data),
  deletarAluno: (id) => fetch(`${BASE}/alunos/${id}`, { method: 'DELETE', headers: authHeaders() }),
  login: (ra, senha) => fetch(`${BASE}/alunos/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ra, senha }) }),

  // EMPRESTIMOS
  getEmprestimos: () => fetch(`${BASE}/emprestimos/todos`, { headers: authHeaders() }).then(r => r.json()),
  getEmprestimosPorAluno: (nome) => fetch(`${BASE}/emprestimos/aluno/${encodeURIComponent(nome)}`, { headers: authHeaders() }).then(r => r.json()),
  criarEmprestimo: (data) => fetch(`${BASE}/emprestimos`, { method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify(data) }),
  cancelarEmprestimo: (id) => fetch(`${BASE}/emprestimos/${id}`, { method: 'DELETE', headers: authHeaders() }),
  confirmarEntrega: (id) => fetch(`${BASE}/emprestimos/${id}/entregar`, { method: 'POST', headers: authHeaders() }),
  confirmarDevolucao: (id) => fetch(`${BASE}/emprestimos/${id}/devolver`, { method: 'POST', headers: authHeaders() }),

  // STATS
  getStats: () => fetch(`${BASE}/admin/stats`, { headers: authHeaders() }).then(r => r.json()),
};
