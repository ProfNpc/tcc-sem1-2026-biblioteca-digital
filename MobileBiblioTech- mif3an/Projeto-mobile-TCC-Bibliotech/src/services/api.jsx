import { SERVIDOR } from '../config';

const BASE = `${SERVIDOR}/api`;
export const IMG_BASE = `${SERVIDOR}/capas`;

// No React o token ficava no localStorage. No celular não existe localStorage,
// então guardamos na memória do app (igual ao React, ao fechar o app o login some).
let token = null;

// A tela principal registra aqui o que fazer quando o servidor disser "sessão inválida" (401).
let aoSessaoExpirar = () => {};
export function definirAoSessaoExpirar(fn) { aoSessaoExpirar = fn; }

// Todo pedido protegido precisa desse header - sem ele o AuthFilter do Spring devolve 401.
function authHeaders(extra = {}) {
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

// fetch normal + 1 detalhe: se o servidor responder 401 estando logado (ex.: o back
// foi reiniciado e apagou os tokens da memória), avisa o app para voltar ao login.
async function pedir(url, opcoes = {}) {
  const resp = await fetch(url, opcoes);
  if (resp.status === 401 && token) aoSessaoExpirar();
  return resp;
}

// POST/PUT com JSON; se a resposta não for OK, joga um erro com a mensagem do back
// (ex.: 409 "Já existe um livro cadastrado com este título.").
async function postOuPut(url, method, data) {
  const resp = await pedir(url, {
    method,
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });
  const texto = await resp.text();
  let corpo;
  try { corpo = texto ? JSON.parse(texto) : null; } catch { corpo = texto; }
  if (!resp.ok) {
    const erro = new Error(typeof corpo === 'string' ? corpo : (corpo?.message || 'Erro ao salvar.'));
    erro.status = resp.status;
    throw erro;
  }
  return corpo;
}

// GET que devolve a lista já convertida de JSON, com o token
const lerLista = (url) => pedir(url, { headers: authHeaders() }).then(r => r.json());

export const api = {
  // SESSÃO
  salvarSessao: (aluno) => { if (aluno?.token) token = aluno.token; },
  limparSessao: () => { token = null; },
  encerrarSessao: () => {
    fetch(`${BASE}/alunos/logout`, { method: 'POST', headers: authHeaders() }).catch(() => {});
    token = null;
  },

  // LIVROS (a listagem é pública, por isso sem token)
  getLivros: (unidade) => {
    const query = unidade ? `?unidade=${encodeURIComponent(unidade)}` : '';
    return fetch(`${BASE}/livros${query}`).then(r => r.json());
  },
  criarLivro: (data) => postOuPut(`${BASE}/livros`, 'POST', data),
  editarLivro: (id, data) => postOuPut(`${BASE}/livros/${id}`, 'PUT', data),
  deletarLivro: (id) => pedir(`${BASE}/livros/${id}`, { method: 'DELETE', headers: authHeaders() }),

  // ALUNOS
  getAlunos: () => lerLista(`${BASE}/alunos`),
  criarAluno: (data) => postOuPut(`${BASE}/alunos`, 'POST', data),
  editarAluno: (id, data) => postOuPut(`${BASE}/alunos/${id}`, 'PUT', data),
  deletarAluno: (id) => pedir(`${BASE}/alunos/${id}`, { method: 'DELETE', headers: authHeaders() }),
  login: (ra, senha) => fetch(`${BASE}/alunos/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ra, senha }),
  }),

  // EMPRÉSTIMOS / RESERVAS
  getEmprestimos: () => lerLista(`${BASE}/emprestimos/todos`),
  getHistoricoEmprestimos: () => lerLista(`${BASE}/emprestimos/historico`),
  getEmprestimosPorAluno: (nome) => lerLista(`${BASE}/emprestimos/aluno/${encodeURIComponent(nome)}`),
  getHistoricoPorAluno: (nome) => lerLista(`${BASE}/emprestimos/aluno/${encodeURIComponent(nome)}/historico`),
  criarEmprestimo: (data) => pedir(`${BASE}/emprestimos`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  }),
  cancelarEmprestimo: (id) => pedir(`${BASE}/emprestimos/${id}`, { method: 'DELETE', headers: authHeaders() }),
  confirmarEntrega: (id) => pedir(`${BASE}/emprestimos/${id}/entregar`, { method: 'POST', headers: authHeaders() }),
  confirmarDevolucao: (id) => pedir(`${BASE}/emprestimos/${id}/devolver`, { method: 'POST', headers: authHeaders() }),

  // ESTATÍSTICAS DO PAINEL
  getStats: () => lerLista(`${BASE}/admin/stats`),
};
