import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../service/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = (userData) => {
        const { id, nome, email, tipoUsuario } = userData;
        const userToStore = {
            id,
            nome,
            email,
            tipoUsuario
        };
        setUser(userToStore);
        localStorage.setItem('user', JSON.stringify(userToStore));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user'); 
    };

    const deleteAccount = async () => {
        if (!user || !user.id) {
            console.log("Usuário não está definido ou ID é inválido");
            return;
        }

        console.log("Tentando excluir conta para o usuário com ID:", user.id);

        try {
            const response = await api.delete(`/usuarios/${user.id}`, { 
                headers: {
                    'Authorization': `Bearer ${user.token}`, 
                },
            });

            if (response.status === 200) {
                logout();
                alert("Sua conta foi excluída com sucesso.");
            } else {
                throw new Error('Erro ao excluir conta');
            }
        } catch (error) {
            console.error('Erro ao excluir conta:', error);
            alert('Não foi possível excluir sua conta. Tente novamente mais tarde.'); 
        }
    };

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user'); 
        }
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, login, logout, deleteAccount }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
