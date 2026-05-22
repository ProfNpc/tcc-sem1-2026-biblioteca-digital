import { useState } from 'react';
import { api } from '../services/api';

export default function LoginPage({ onLogin }) {
  const [tela, setTela] = useState('escolha'); // 'escolha' | 'login' | 'cadastro'
  const [intencao, setIntencao] = useState('ALUNO');
  const [ra, setRa] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [cadRa, setCadRa] = useState('');
  const [cadSenha, setCadSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

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
      onLogin(aluno.nome, perfil);
    } catch {
      setErro('Erro de conexão. O servidor Java está ligado?');
    }
    setLoading(false);
  }

  async function fazerCadastro(e) {
    e.preventDefault();
    setErro(''); setLoading(true);
    try {
      const aluno = await api.criarAluno({ nome: nome.trim(), ra: cadRa.trim(), senha: cadSenha.trim(), email: 'novo@bibliotech.com', perfil: 'ALUNO' });
      onLogin(aluno.nome, 'ALUNO');
    } catch {
      setErro('Erro ao cadastrar. Tente novamente.');
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
                <label>{intencao === 'ADMIN' ? 'Usuário Admin' : 'RA do Aluno'}</label>
                <input type="text" placeholder="Digite seu RA" value={ra} onChange={e => setRa(e.target.value)} required />
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
                <label>RA do Aluno</label>
                <input type="text" placeholder="Digite seu RA" value={cadRa} onChange={e => setCadRa(e.target.value)} required />
              </div>
              <div className="campo">
                <label>Senha</label>
                <input type="password" placeholder="Crie uma senha" value={cadSenha} onChange={e => setCadSenha(e.target.value)} required />
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

      </div>
    </div>
  );
}
