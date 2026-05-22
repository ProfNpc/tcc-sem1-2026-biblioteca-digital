import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

const VAZIO = { nome: '', ra: '', senha: '', email: '', perfil: 'ALUNO' };

export default function AdminAlunosPage() {
  const [alunos, setAlunos] = useState([]);
  const [busca, setBusca] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(VAZIO);
  const [editId, setEditId] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const toast = useToast();

  function carregar() {
    api.getAlunos().then(setAlunos);
  }

  useEffect(() => { carregar(); }, []);

  function abrirNovo() {
    setForm(VAZIO); setEditId(null); setModal(true);
  }

  function abrirEditar(aluno) {
    setForm({ nome: aluno.nome, ra: aluno.ra, senha: '', email: aluno.email || '', perfil: aluno.perfil });
    setEditId(aluno.id);
    setModal(true);
  }

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      if (editId) {
        await api.editarAluno(editId, form);
        toast('✅ Aluno atualizado com sucesso!');
      } else {
        await api.criarAluno(form);
        toast('✅ Aluno cadastrado com sucesso!');
      }
      setModal(false);
      carregar();
    } catch {
      toast('⚠️ Erro ao salvar aluno.');
    }
    setSalvando(false);
  }

  async function deletar(id, nome) {
    if (!confirm(`Excluir o aluno "${nome}"?`)) return;
    const resp = await api.deletarAluno(id);
    if (resp.ok) { toast('🗑️ Aluno excluído.'); carregar(); }
    else toast('⚠️ Erro ao excluir.');
  }

  const filtrados = alunos.filter(a =>
    a.nome.toLowerCase().includes(busca.toLowerCase()) ||
    a.ra.toLowerCase().includes(busca.toLowerCase()) ||
    (a.email || '').toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="tabela-container">
      <div className="tabela-header">
        <h2>Gestão de Alunos</h2>
        <input className="input-busca" placeholder="🔍 Filtrar por nome, RA ou email..." value={busca} onChange={e => setBusca(e.target.value)} />
        <button className="btn-primario" onClick={abrirNovo}>+ Novo Aluno</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>RA</th>
            <th>Email</th>
            <th>Perfil</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtrados.length === 0 && (
            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Nenhum aluno encontrado.</td></tr>
          )}
          {filtrados.map(a => (
            <tr key={a.id}>
              <td>#{a.id}</td>
              <td><strong>{a.nome}</strong></td>
              <td>{a.ra}</td>
              <td>{a.email || '-'}</td>
              <td>
                <span className={`status ${a.perfil === 'ADMIN' ? 'status-azul' : 'status-verde'}`}>
                  {a.perfil === 'ADMIN' ? '⚙️ Admin' : '📚 Aluno'}
                </span>
              </td>
              <td>
                <button className="btn-icone btn-editar" onClick={() => abrirEditar(a)}>✏️</button>
                <button className="btn-icone btn-deletar" onClick={() => deletar(a.id, a.nome)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box">
            <h3>{editId ? '✏️ Editar Aluno' : '➕ Novo Aluno'}</h3>
            <form onSubmit={salvar}>
              <div className="campo">
                <label>Nome Completo</label>
                <input required value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="campo">
                  <label>RA</label>
                  <input required value={form.ra} onChange={e => setForm(f => ({ ...f, ra: e.target.value }))} />
                </div>
                <div className="campo">
                  <label>Senha {editId && '(deixe vazio para não alterar)'}</label>
                  <input type="password" required={!editId} value={form.senha} onChange={e => setForm(f => ({ ...f, senha: e.target.value }))} />
                </div>
              </div>
              <div className="campo">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="campo">
                <label>Perfil</label>
                <select value={form.perfil} onChange={e => setForm(f => ({ ...f, perfil: e.target.value }))}>
                  <option value="ALUNO">Aluno</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancelar" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primario" disabled={salvando}>
                  {salvando ? 'Salvando...' : 'Salvar Aluno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
