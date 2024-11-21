import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaBrain } from 'react-icons/fa';
import { registerUser } from '../service/api';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [curso, setCurso] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('As senhas não coincidem.'); 
      return;
    }

    const userData = {
      nome: username,
      email,
      senha: password,
      confirmarSenha: confirmPassword, 
      curso,
      disciplina,
      periodo,
      tipoUsuario
    };

    try {
      await registerUser(userData);
      setMessage('Registro bem-sucedido! Redirecionando para a página de login...'); 
      setTimeout(() => navigate('/login'), 2000); 
    } catch (error) {
      console.error('Erro ao registrar:', error);
      setMessage('Falha ao registrar. Tente novamente.'); 
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.registerContainer}>
        <div style={styles.registerHeader}>
          <FaBrain style={styles.logoIcon} />
          <h1 style={styles.headerTitle}>Sabi<span style={styles.headerSpan}>dus</span></h1>
        </div>
        {message && <div className="alert alert-danger" role="alert">{message}</div>}
        <form id="register-form" onSubmit={handleSubmit}>
          <div className="form-floating mb-3">
            <input 
              type="text" 
              className="form-control" 
              id="username" 
              placeholder="Nome de usuário" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
            <label htmlFor="username">Nome de usuário</label>
          </div>
          <div className="form-floating mb-3">
            <input 
              type="email" 
              className="form-control" 
              id="email" 
              placeholder="nome@exemplo.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <label htmlFor="email">Email</label>
          </div>
          <div className="form-floating mb-3">
            <input 
              type="password" 
              className="form-control" 
              id="password" 
              placeholder="Senha" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <label htmlFor="password">Senha</label>
          </div>
          <div className="form-floating mb-3">
            <input 
              type="password" 
              className="form-control" 
              id="confirm-password" 
              placeholder="Confirme a senha" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
            />
            <label htmlFor="confirm-password">Confirme a senha</label>
          </div>
          <div className="form-floating mb-3">
            <input 
              type="text" 
              className="form-control" 
              id="curso" 
              placeholder="Curso" 
              value={curso} 
              onChange={(e) => setCurso(e.target.value)} 
              required 
            />
            <label htmlFor="curso">Curso</label>
          </div>
          <div className="form-floating mb-3">
            <input 
              type="text" 
              className="form-control" 
              id="disciplina" 
              placeholder="Disciplina" 
              value={disciplina} 
              onChange={(e) => setDisciplina(e.target.value)} 
              required 
            />
            <label htmlFor="disciplina">Disciplina</label>
          </div>
          <div className="form-floating mb-3">
            <input 
              type="text" 
              className="form-control" 
              id="periodo" 
              placeholder="Período" 
              value={periodo} 
              onChange={(e) => setPeriodo(e.target.value)} 
              required 
            />
            <label htmlFor="periodo">Período</label>
          </div>
          <div className="form-floating mb-3">
            <select 
              className="form-select" 
              id="tipoUsuario" 
              value={tipoUsuario} 
              onChange={(e) => setTipoUsuario(e.target.value)} 
              required
            >
              <option value="">Escolha o tipo de usuário</option>
              <option value="aluno">Aluno</option>
              <option value="monitor">Monitor</option>
            </select>
            <label htmlFor="tipoUsuario">Tipo de Usuário</label>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={styles.button}>Registrar</button>
        </form>
        <div style={styles.loginLink}>
          <p>Já tem uma conta? <a href="/login" style={styles.loginLinkText}>Faça login</a></p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  body: {
    fontFamily: "'Roboto', Arial, sans-serif",
    backgroundColor: '#f8f9fa',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    margin: 0,
    padding: '20px 0',
  },
  registerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '2rem',
    width: '100%',
    maxWidth: '400px',
  },
  registerHeader: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  headerTitle: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 700,
    fontSize: '2rem',
    color: '#2C3E50',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginTop: '0.5rem',
  },
  headerSpan: {
    color: '#3498DB',
  },
  logoIcon: {
    fontSize: '3rem',
    color: '#3498DB',
    marginBottom: '0.5rem',
  },
  loginLink: {
    textAlign: 'center',
    marginTop: '1rem',
  },
  loginLinkText: {
    color: '#3498DB',
    textDecoration: 'none',
  },
  button: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
    width: '100%',
  },
};

export default Register;
