import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserById } from '../service/api';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) {
                navigate('/login');
                return;
            }

            setLoading(true);
            
            try {
                console.log('usuario', user)
                const profileData = await getUserById(user.id);
                console.log('Dados do perfil:', profileData);
                setUserProfile(profileData);
            } catch (err) {
                console.error('Erro ao buscar perfil do usuário:', err);
                setError('Erro ao buscar perfil. Tente novamente mais tarde.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user, navigate]);

    if (!user) {
        return null;
    }

    return (
        <div className="profile-container">
            <div className="container py-4">
                <h1 className="text-center mb-4">Perfil do Usuário</h1>
                <div className="row justify-content-center">
                    <div className="col-lg-6 col-md-8">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title">Informações do Perfil</h5>
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}
                                
                                {loading ? (
                                    <div className="text-center">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Carregando...</span>
                                        </div>
                                    </div>
                                ) : userProfile ? (
                                    <div className="profile-info">
                                        <p><strong>ID:</strong> {userProfile._id}</p>
                                        <p><strong>Nome:</strong> {userProfile.nome}</p>
                                        <p><strong>Email:</strong> {userProfile.email}</p>
                                        <p><strong>Curso:</strong> {userProfile.curso}</p>
                                        <p><strong>Disciplina:</strong> {userProfile.disciplina}</p>
                                        <p><strong>Tipo de Usuário:</strong> {userProfile.tipoUsuario}</p>
                                    </div>
                                ) : (
                                    <p className="text-center text-muted">Perfil não encontrado.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                {`
                    .profile-container {
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

                    .profile-info p {
                        margin-bottom: 0.75rem;
                        padding-bottom: 0.75rem;
                        border-bottom: 1px solid #e9ecef;
                    }

                    .profile-info p:last-child {
                        border-bottom: none;
                        margin-bottom: 0;
                        padding-bottom: 0;
                    }
                `}
            </style>
        </div>
    );
};

export default Profile;