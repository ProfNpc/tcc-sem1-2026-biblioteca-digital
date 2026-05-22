import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

const VAZIO = { titulo: '', autor: '', anoPublicacao: '', isbn: '' };

export default function AdminLivrosPage() {
  const [livros, setLivros] = useState([]);
  const [busca, setBusca] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(VAZIO);
  const [editId, setEditId] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const toast = useToast();

  function carregar() {
    api.getLivros().then(setLivros);
  }

  useEffect(() => { carregar(); }, []);

  function abrirNovo() {
    setForm(VAZIO); setEditId(null); setModal(true);
  }

  function abrirEditar(livro) {
    setForm({ titulo: livro.titulo, autor: livro.autor, anoPublicacao: livro.anoPublicacao, isbn: livro.isbn || '' });
    setEditId(livro.id);
    setModal(true);
  }

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      if (editId) {
        await api.editarLivro(editId, form);
        toast('✅ Livro atualizado com sucesso!');
      } else {
        await api.criarLivro(form);
        toast('✅ Livro cadastrado com sucesso!');
      }
      setModal(false);
      carregar();
    } catch {
      toast('⚠️ Erro ao salvar livro.');
    }
    setSalvando(false);
  }

  async function deletar(id, titulo) {
    if (!confirm(`Excluir "${titulo}"?`)) return;
    const resp = await api.deletarLivro(id);
    if (resp.ok) { toast('🗑️ Livro excluído.'); carregar(); }
    else toast('⚠️ Erro ao excluir.');
  }

  const filtrados = livros.filter(l =>
    l.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    l.autor.toLowerCase().includes(busca.toLowerCase()) ||
    (l.isbn || '').toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="tabela-container">
      <div className="tabela-header">
        <h2>Controle de Acervo</h2>
        <input className="input-busca" placeholder="🔍 Filtrar por título, autor ou ISBN..." value={busca} onChange={e => setBusca(e.target.value)} />
        <button className="btn-primario" onClick={abrirNovo}>+ Novo Livro</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Autor</th>
            <th>Ano</th>
            <th>ISBN</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtrados.length === 0 && (
            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Nenhum livro encontrado.</td></tr>
          )}
          {filtrados.map(l => (
            <tr key={l.id}>
              <td>#{l.id}</td>
              <td><strong>{l.titulo}</strong></td>
              <td>{l.autor}</td>
              <td>{l.anoPublicacao}</td>
              <td>{l.isbn || '-'}</td>
              <td>
                <span className={`status ${l.disponivel ? 'status-verde' : 'status-vermelho'}`}>
                  {l.disponivel ? 'Livre' : 'Emprestado'}
                </span>
              </td>
              <td>
                <button className="btn-icone btn-editar" onClick={() => abrirEditar(l)}>✏️</button>
                <button className="btn-icone btn-deletar" onClick={() => deletar(l.id, l.titulo)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL CRIAR/EDITAR */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box">
            <h3>{editId ? '✏️ Editar Livro' : '➕ Novo Livro'}</h3>
            <form onSubmit={salvar}>
              <div className="campo">
                <label>Título</label>
                <input required value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} />
              </div>
              <div className="campo">
                <label>Autor</label>
                <input required value={form.autor} onChange={e => setForm(f => ({ ...f, autor: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="campo">
                  <label>Ano de Publicação</label>
                  <input type="number" required value={form.anoPublicacao} onChange={e => setForm(f => ({ ...f, anoPublicacao: e.target.value }))} />
                </div>
                <div className="campo">
                  <label>ISBN</label>
                  <input value={form.isbn} onChange={e => setForm(f => ({ ...f, isbn: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancelar" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primario" disabled={salvando}>
                  {salvando ? 'Salvando...' : 'Salvar Livro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
