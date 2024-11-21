import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserById } from '../service/api';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [accountInfo, setAccountInfo] = useState(null);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchAccountInfo = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const data = await getUserById(user.id, user.token);
        setAccountInfo(data);
      } catch (error) {
        console.error('Erro ao buscar informações da conta:', error);
        setError('Não foi possível carregar as informações da conta.');
      }
    };

    fetchAccountInfo();
  }, [user, navigate]);

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Esta ação é permanente e não pode ser desfeita. Todos os seus dados serão excluídos. Você tem certeza que deseja continuar?"
    );

    if (confirmDelete) {
      setIsDeleting(true);
      setError('');

      try {
        await deleteAccount();
        navigate('/');
      } catch (error) {
        setError(
          error.message || 'Ocorreu um erro ao tentar excluir sua conta. Tente novamente mais tarde.'
        );
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (!user) {
    return null; // ou um componente de loading
  }

  return (
    <div className="settings-container">
      <div className="container py-4">
        <h1 className="text-center mb-4">Configurações do Usuário</h1>
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Informações da Conta</h5>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                
                {accountInfo ? (
                  <>
                    <p><strong>Nome:</strong> {accountInfo.nome}</p>
                    <p><strong>Email:</strong> {accountInfo.email}</p>
                  </>
                ) : !error && (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Carregando...</span>
                    </div>
                  </div>
                )}

                <hr />
                
                <div className="delete-account-section">
                  <h5 className="card-title text-danger">Zona de Perigo</h5>
                  <p className="text-muted">
                    Ao excluir sua conta, todos os seus dados serão permanentemente removidos.
                    Esta ação não pode ser desfeita.
                  </p>
                  <button 
                    className="btn btn-danger"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Excluindo conta...
                      </>
                    ) : (
                      'Excluir Conta'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          .settings-container {
            background-color: #f8f9fa;
            min-height: calc(100vh - 56px);
          }

          .card {
            transition: transform 0.2s ease-in-out;
            background-color: white;
          }

          .card:hover {
            transform: translateY(-2px);
          }

          .delete-account-section {
            padding-top: 1rem;
          }

          .btn-danger {
            transition: all 0.3s ease;
          }

          .btn-danger:disabled {
            opacity: 0.65;
          }
        `}
      </style>
    </div>
  );
};

export default Settings;