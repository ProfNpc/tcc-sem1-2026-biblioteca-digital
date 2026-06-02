import { useEffect, useState, useRef } from 'react';
import { api, IMG_BASE } from '../services/api';
import { useToast } from '../components/Toast';

const VAZIO = { titulo: '', autor: '', anoPublicacao: '', isbn: '' };
const CAPA_PADRAO = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80';

export default function AdminLivrosPage() {
  const [livros, setLivros] = useState([]);
  const [busca, setBusca] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(VAZIO);
  const [editId, setEditId] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [confirmTitulo, setConfirmTitulo] = useState('');
  const [imagemPreview, setImagemPreview] = useState(null);
  const [arquivoImagem, setArquivoImagem] = useState(null);
  const inputImagemRef = useRef();
  const toast = useToast();

  function carregar() { api.getLivros().then(setLivros); }
  useEffect(() => { carregar(); }, []);

  function abrirNovo() {
    setForm(VAZIO); setEditId(null);
    setImagemPreview(null); setArquivoImagem(null);
    setModal(true);
  }

  function abrirEditar(livro) {
    setForm({ titulo: livro.titulo, autor: livro.autor, anoPublicacao: livro.anoPublicacao, isbn: livro.isbn || '' });
    setEditId(livro.id);
    setImagemPreview(livro.imagemCapa ? `${IMG_BASE}/${livro.imagemCapa}` : null);
    setArquivoImagem(null);
    setModal(true);
  }

  function onEscolherImagem(e) {
    const file = e.target.files[0];
    if (!file) return;
    setArquivoImagem(file);
    setImagemPreview(URL.createObjectURL(file));
  }

  async function salvar(e) {
    e.preventDefault(); setSalvando(true);
    try {
      let livroSalvo;
      if (editId) {
        livroSalvo = await api.editarLivro(editId, form);
        toast('✅ Livro atualizado com sucesso!');
      } else {
        livroSalvo = await api.criarLivro(form);
        toast('✅ Livro cadastrado com sucesso!');
      }

      // Se o admin escolheu uma imagem, faz o upload agora
      if (arquivoImagem && livroSalvo?.id) {
        const respImg = await api.uploadImagem(livroSalvo.id, arquivoImagem);
        if (respImg.ok) toast('🖼️ Imagem da capa enviada!');
        else toast('⚠️ Livro salvo, mas houve erro ao enviar a imagem.');
      }

      setModal(false); carregar();
    } catch { toast('⚠️ Erro ao salvar livro.'); }
    setSalvando(false);
  }

  async function confirmarDeletar() {
    const resp = await api.deletarLivro(confirmId);
    setConfirmId(null);
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
            <th>Capa</th><th>ID</th><th>Título</th><th>Autor</th><th>Ano</th><th>ISBN</th><th>Status</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtrados.length === 0 && (
            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Nenhum livro encontrado.</td></tr>
          )}
          {filtrados.map(l => (
            <tr key={l.id}>
              <td>
                <img
                  src={l.imagemCapa ? `${IMG_BASE}/${l.imagemCapa}` : CAPA_PADRAO}
                  alt={l.titulo}
                  style={{ width: '48px', height: '60px', objectFit: 'cover', borderRadius: '6px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                />
              </td>
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
                <button className="btn-icone btn-deletar" onClick={() => { setConfirmId(l.id); setConfirmTitulo(l.titulo); }}>🗑️</button>
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

              {/* PREVIEW DA IMAGEM */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <img
                  src={imagemPreview || CAPA_PADRAO}
                  alt="Capa do livro"
                  style={{ width: '100px', height: '130px', objectFit: 'cover', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '2px solid #e2e8f0' }}
                />
                <button type="button" className="btn-cancelar" style={{ fontSize: '0.85rem', padding: '7px 16px' }} onClick={() => inputImagemRef.current.click()}>
                  🖼️ {imagemPreview ? 'Trocar Capa' : 'Adicionar Capa'}
                </button>
                <input ref={inputImagemRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onEscolherImagem} />
              </div>

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

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {confirmId && (
        <div className="modal-confirm-overlay" onClick={e => e.target === e.currentTarget && setConfirmId(null)}>
          <div className="modal-confirm-box">
            <div className="modal-confirm-icon">
              <div className="modal-confirm-icon-circle">⚠️</div>
            </div>
            <div className="modal-confirm-body">
              <h3>Confirmar Exclusão</h3>
              <p>Deseja excluir o livro <strong>{confirmTitulo}</strong>?</p>
            </div>
            <div className="modal-confirm-footer">
              <button className="btn-confirm-voltar" onClick={() => setConfirmId(null)}>Voltar</button>
              <button className="btn-confirm-excluir" onClick={confirmarDeletar}>Sim, Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
