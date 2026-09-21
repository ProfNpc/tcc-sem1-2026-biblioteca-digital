import { useState } from 'react';
import { api } from '../services/api';
import { NOMES_UNIDADES } from '../constants/unidades';

export default function LoginPage({ onLogin }) {
  const [tela, setTela] = useState('escolha'); // 'escolha' | 'login' | 'cadastro' | 'escolher-unidade'
  const [intencao, setIntencao] = useState('ALUNO');
  const [ra, setRa] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [cadRa, setCadRa] = useState('');
  const [cadSenha, setCadSenha] = useState('');
  const [cadUnidade, setCadUnidade] = useState(NOMES_UNIDADES[0]);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  // Guarda o aluno autenticado enquanto esperamos ele escolher a unidade
  // (caso de conta antiga, cadastrada antes de esse campo existir)
  const [alunoPendente, setAlunoPendente] = useState(null);
  const [unidadePendente, setUnidadePendente] = useState(NOMES_UNIDADES[0]);

  function escolherPortal(perfil) {
    setIntencao(perfil);
    setErro('');
    setRa(''); setSenha('');
    setTela('login');
  }

  async function fazerLogin(e) {
    e.preventDefault();
    setErro(''); setLoading(true);
    try {
      const resp = await api.login(ra.trim(), senha.trim());
      if (!resp.ok) { setErro('RA ou Senha inválidos.'); setLoading(false); return; }
      const aluno = await resp.json();
      const perfil = (aluno.perfil || '').trim();
      if (intencao === 'ADMIN' && perfil !== 'ADMIN') {
        setErro('Acesso negado: você não é administrador.');
        setLoading(false); return;
      }

      // Conta de aluno sem unidade definida (cadastrada antes desse campo existir,
      // ou criada pelo admin sem preencher): pede a unidade antes de liberar o acervo.
      if (perfil === 'ALUNO' && !aluno.unidade) {
        api.salvarSessao(aluno); // já precisamos do token pra poder salvar a unidade a seguir
        setAlunoPendente(aluno);
        setTela('escolher-unidade');
        setLoading(false);
        return;
      }

      api.salvarSessao(aluno);
      onLogin(aluno);
    } catch {
      setErro('Erro de conexão. O servidor Java está ligado?');
    }
    setLoading(false);
  }

  async function confirmarUnidadePendente(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.editarAluno(alunoPendente.id, { unidade: unidadePendente });
      onLogin({ ...alunoPendente, unidade: unidadePendente });
    } catch {
      setErro('Não foi possível salvar sua unidade. Tente novamente.');
    }
    setLoading(false);
  }

  async function fazerCadastro(e) {
    e.preventDefault();
    setErro(''); setLoading(true);
    try {
      const aluno = await api.criarAluno({
        nome: nome.trim(),
        ra: cadRa.trim(),
        senha: cadSenha.trim(),
        email: 'novo@bibliotech.com',
        perfil: 'ALUNO',
        unidade: cadUnidade,
      });
      api.salvarSessao(aluno);
      onLogin(aluno);
    } catch (erroCadastro) {
      setErro(erroCadastro.message || 'Erro ao cadastrar. Tente novamente.');
    }
    setLoading(false);
  }

  return (
    <div className="login-page">
      <div className="login-esquerda">
        <h1>BiblioTech</h1>
        <p>O conhecimento do mundo na palma da sua mão. Acesse o nosso acervo e evolua com a gente.</p>
      </div>
      <div className="login-direita">

        {tela === 'escolha' && (
          <div className="caixa-login">
            <h2>Onde você deseja entrar?</h2>
            <div className="escolha-btns">
              <button className="btn-escolha" onClick={() => escolherPortal('ALUNO')}>📚 Portal do Aluno</button>
              <button className="btn-escolha admin" onClick={() => escolherPortal('ADMIN')}>⚙️ Painel Administrativo</button>
            </div>
            <div className="link-alternativo">
              Não tem conta?{' '}
              <button onClick={() => { setErro(''); setTela('cadastro'); }}>Cadastre-se</button>
            </div>
          </div>
        )}

        {tela === 'login' && (
          <div className="caixa-login">
            <h2>{intencao === 'ADMIN' ? '⚙️ Acesso Administrativo' : '📚 Portal do Aluno'}</h2>
            <form onSubmit={fazerLogin}>
              <div className="campo">
                <label>{intencao === 'ADMIN' ? 'Usuário Admin' : 'Usuário'}</label>
                <input type="text" placeholder="Digite seu Usuário" value={ra} onChange={e => setRa(e.target.value)} required />
              </div>
              <div className="campo">
                <label>Senha</label>
                <input type="password" placeholder="Sua senha" value={senha} onChange={e => setSenha(e.target.value)} required />
              </div>
              {erro && <p className="erro-msg">⚠️ {erro}</p>}
              <button type="submit" className="btn-primario" style={{ width: '100%', padding: '12px', marginTop: '8px', borderRadius: '10px' }} disabled={loading}>
                {loading ? 'Entrando...' : 'Acessar'}
              </button>
            </form>
            <div className="link-alternativo">
              <button onClick={() => { setErro(''); setTela('escolha'); }}>← Trocar Portal</button>
            </div>
          </div>
        )}

        {tela === 'cadastro' && (
          <div className="caixa-login">
            <h2>Criar Nova Conta</h2>
            <form onSubmit={fazerCadastro}>
              <div className="campo">
                <label>Nome Completo</label>
                <input type="text" placeholder="Ex: João da Silva" value={nome} onChange={e => setNome(e.target.value)} required />
              </div>
              <div className="campo">
                <label>Usuário</label>
                <input type="text" placeholder="Digite seu nome de usuário" value={cadRa} onChange={e => setCadRa(e.target.value)} required />
              </div>
              <div className="campo">
                <label>Senha</label>
                <input type="password" placeholder="Crie uma senha" value={cadSenha} onChange={e => setCadSenha(e.target.value)} required />
              </div>
              <div className="campo">
                <label>Unidade em que estuda</label>
                <select className="polo-select" value={cadUnidade} onChange={e => setCadUnidade(e.target.value)} required>
                  {NOMES_UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              {erro && <p className="erro-msg">⚠️ {erro}</p>}
              <button type="submit" className="btn-primario" style={{ width: '100%', padding: '12px', marginTop: '8px', borderRadius: '10px' }} disabled={loading}>
                {loading ? 'Cadastrando...' : 'Registrar e Acessar'}
              </button>
            </form>
            <div className="link-alternativo">
              <button onClick={() => { setErro(''); setTela('escolha'); }}>Já tem conta? Entrar</button>
            </div>
          </div>
        )}

        {tela === 'escolher-unidade' && (
          <div className="caixa-login">
            <h2>📍 Qual unidade você estuda?</h2>
            <p style={{ color: '#475569', marginBottom: '16px' }}>
              Sua conta ainda não tem uma unidade definida. Isso garante que você só veja livros
              disponíveis no seu polo.
            </p>
            <form onSubmit={confirmarUnidadePendente}>
              <div className="campo">
                <select className="polo-select" value={unidadePendente} onChange={e => setUnidadePendente(e.target.value)} required>
                  {NOMES_UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              {erro && <p className="erro-msg">⚠️ {erro}</p>}
              <button type="submit" className="btn-primario" style={{ width: '100%', padding: '12px', marginTop: '8px', borderRadius: '10px' }} disabled={loading}>
                {loading ? 'Salvando...' : 'Confirmar e Entrar'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
