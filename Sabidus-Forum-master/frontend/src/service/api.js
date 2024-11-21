import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000', 
});

api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        config.headers['Authorization'] = `Bearer ${user.token}`; 
    }
    return config;
}, (error) => {
    return Promise.reject(error); 
});

export const registerUser = async (userData) => {
    try {
        const response = await api.post('/usuarios', userData);
        return response.data;
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        throw error; 
    }
};


export const getUserById = async (id) => {
    try {
        const response = await api.get(`/usuarios/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar usuário com ID ${id}:`, error);
        throw error;
    }
};

export const likeComment = async (postId, commentId, userId) => {
    try {
        if (!postId) throw new Error('ID do post é obrigatório');
        if (!commentId) throw new Error('ID do comentário é obrigatório');
        if (!userId) throw new Error('ID do usuário é obrigatório');

        const sanitizedPostId = String(postId).trim();
        const sanitizedCommentId = String(commentId).trim();
        const sanitizedUserId = String(userId).trim();

        const response = await api.post(`/usuarios/posts/${sanitizedPostId}/comentarios/${sanitizedCommentId}/like`, {
            usuarioId: sanitizedUserId  
        });
        
        if (!response.data) {
            throw new Error('Resposta inválida do servidor');
        }
        
        console.log('Response from like comment:', response.data); 
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('Erro do servidor:', error.response.data);
            throw new Error(error.response.data.mensagem || 'Erro ao curtir comentário');
        } else if (error.request) {
            console.error('Erro de rede:', error.request);
            throw new Error('Erro de conexão com o servidor');
        } else {
            console.error('Erro ao curtir comentário:', error.message);
            throw error;
        }
    }
};

export const getUsers = async () => {
    try {
        const response = await api.get('/usuarios');
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        throw error;
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await api.post('/usuarios/login', credentials); 
        return response.data;
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        throw error;
    }
};

export const postData = async (postData) => {
    try {
        const response = await api.post('/usuarios/posts', postData);
        return response.data;
    } catch (error) {
        console.error('Erro ao enviar post:', error);
        throw error;
    }
};

export const getPosts = async () => {
    try {
        const response = await api.get('/usuarios/posts/listar');
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar posts:', error);
        throw error;
    }
};

export const addComment = async (postId, commentData) => {
    try {
        const response = await api.post(`/usuarios/posts/${postId}/comentarios`, commentData);
        return response.data;
    } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
        throw error;
    }
};

export const getComments = async (postId) => {
    try {
      const response = await api.get(`usuarios/posts/${postId}/comments`);
      return response.data.comentarios; 
    } catch (error) {
      throw error;
    }
  };

  export const deleteComment = async (postId, comentarioId, usuarioId) => {
    try {
      const response = await api.delete(`usuarios/posts/${postId}/comentarios/${comentarioId}`, {
        data: { usuarioId }  
      });
      return response.data; 
    } catch (error) {
      throw error;
    }
  };

export const likePost = async (postId, userId) => {
    try {
        if (!postId) throw new Error('ID do post é obrigatório');
        if (!userId) throw new Error('ID do usuário é obrigatório');

        const sanitizedPostId = String(postId).trim();
        const sanitizedUserId = String(userId).trim();

        const response = await api.post(`/usuarios/posts/${sanitizedPostId}/like`, {
            userId: sanitizedUserId
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.data) {
            throw new Error('Resposta inválida do servidor');
        }

        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('Erro do servidor:', error.response.data);
            throw new Error(error.response.data.mensagem || 'Erro ao processar like');
        } else if (error.request) {
            console.error('Erro de rede:', error.request);
            throw new Error('Erro de conexão com o servidor');
        } else {
            console.error('Erro ao dar like:', error.message);
            throw error;
        }
    }
};

export const updatePostVotes = async (postId, votes) => {
    try {
        const response = await api.patch(`/usuarios/posts/${postId}/votos`, { votes });
        return response.data;
    } catch (error) {
        console.error('Erro ao atualizar votos do post:', error);
        throw error;
    }
};

export const deletePostAPI = async (postId) => {
    try {
        const response = await api.delete(`/usuarios/posts/${postId}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao excluir post:', error);
        throw error;
    }
};

export default api;
