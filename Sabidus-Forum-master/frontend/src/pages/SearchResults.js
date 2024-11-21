import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { addComment, deleteComment, likeComment, likePost } from '../service/api';
import { 
  faHeart, 
  faComment, 
  faShare, 
  faTrash,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';

const CommentSection = ({ post, user, updatePosts, formatDate }) => {
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localComments, setLocalComments] = useState(post.comentarios || []);

  useEffect(() => {
    setLocalComments(post.comentarios || []);
  }, [post.comentarios]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      const brasiliaDate = new Date().toLocaleString("en-US", {
        timeZone: "America/Sao_Paulo"
      });

      const commentData = {
        usuarioId: user.id,
        nome: user.nome,
        conteudo: newComment,
        createdAt: new Date(brasiliaDate).toISOString(),
        likes: []
      };

      const tempComment = {
        ...commentData,
        _id: `temp-${Date.now()}`
      };

      setLocalComments(prevComments => [tempComment, ...prevComments]);
      setNewComment('');

      const updatedPost = await addComment(post._id, commentData);
      
      if (updatedPost && updatedPost.comentarios) {
        const newComments = updatedPost.comentarios.map(comment => ({
          ...comment,
          createdAt: comment.createdAt || new Date(brasiliaDate).toISOString(),
          likes: comment.likes || []
        }));

        setLocalComments(newComments);
        updatePosts((prevPosts) => 
          prevPosts.map(p => 
            p._id === post._id ? {
              ...updatedPost,
              comentarios: newComments
            } : p
          )
        );
      }
    } catch (error) {
      setLocalComments(prevComments => 
        prevComments.filter(comment => !comment._id.startsWith('temp-'))
      );
      console.error('Erro ao adicionar comentário:', error);
      alert('Erro ao adicionar comentário. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (comentarioId) => {
    if (!user || !window.confirm('Tem certeza que deseja excluir este comentário?')) return;

    try {
      setLocalComments(prev => prev.filter(c => c._id !== comentarioId));
      
      await deleteComment(post._id, comentarioId, user.id);

      updatePosts(prevPosts => 
        prevPosts.map(p => 
          p._id === post._id 
            ? {
                ...p,
                comentarios: p.comentarios.filter(c => c._id !== comentarioId)
              }
            : p
        )
      );
    } catch (error) {
      setLocalComments(post.comentarios || []);
      console.error('Erro ao excluir comentário:', error);
      alert('Erro ao excluir comentário. Tente novamente.');
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!user) {
      alert("Você precisa estar logado para curtir um comentário!");
      return;
    }

    try {
      const response = await likeComment(post._id, commentId, user.id);
      
      if (response) {
        setLocalComments(prev => 
          prev.map(comment => {
            if (comment._id === commentId) {
              const hasLiked = comment.likes?.includes(user.id);
              const newLikes = hasLiked
                ? comment.likes.filter(id => id !== user.id)
                : [...(comment.likes || []), user.id];
              return { ...comment, likes: newLikes };
            }
            return comment;
          })
        );

        updatePosts(prevPosts => 
          prevPosts.map(p => {
            if (p._id === post._id) {
              return {
                ...p,
                comentarios: p.comentarios.map(comment => {
                  if (comment._id === commentId) {
                    const hasLiked = comment.likes?.includes(user.id);
                    const newLikes = hasLiked
                      ? comment.likes.filter(id => id !== user.id)
                      : [...(comment.likes || []), user.id];
                    return { ...comment, likes: newLikes };
                  }
                  return comment;
                })
              };
            }
            return p;
          })
        );
      }
    } catch (error) {
      console.error('Erro ao curtir comentário:', error);
      alert('Erro ao curtir comentário. Tente novamente.');
    }
  };

  const handleShareComment = (comment) => {
    if (navigator.share) {
      navigator.share({
        title: 'Compartilhar comentário',
        text: `${comment.nome} comentou: ${comment.conteudo}`,
        url: window.location.href
      })
      .catch((error) => console.log('Erro ao compartilhar:', error));
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = `${comment.nome} comentou: ${comment.conteudo}\n${window.location.href}`;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert('Link copiado para a área de transferência!');
      } catch (err) {
        console.error('Erro ao copiar:', err);
      }
      document.body.removeChild(textArea);
    }
  };
  
  return (
    <div className="mt-4">
      {user && (
        <form onSubmit={handleAddComment} className="mb-3">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Escreva um comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading || !newComment.trim()}
            >
              Comentar
            </button>
          </div>
        </form>
      )}

      <div className="comments-list">
        {localComments.map((comment) => (
          <div 
            key={comment._id}
            className={`comment-item p-3 mb-2 bg-light rounded ${
              comment._id.startsWith('temp-') ? 'opacity-75' : ''
            }`}
          >
            <div className="d-flex gap-2">
              <img
                src={`https://ui-avatars.com/api/?name=${comment.nome}&background=random`}
                alt="Avatar"
                className="rounded-circle"
                width="32"
                height="32"
              />
              <div>
                <div className="fw-bold">{comment.nome}</div>
                <small className="text-muted">
                  {formatDate(comment.createdAt)}
                </small>
              </div>
            </div>
            <p className="mt-2 mb-2">{comment.conteudo}</p>
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex gap-2">
                <button
                  className={`btn btn-sm ${comment.likes?.includes(user?.id) ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleLikeComment(comment._id)}
                  disabled={!user || comment._id.startsWith('temp-')}
                >
                  <FontAwesomeIcon icon={faHeart} />
                  <span className="ms-1">{comment.likes?.length || 0}</span>
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => handleShareComment(comment)}
                  disabled={comment._id.startsWith('temp-')}
                >
                  <FontAwesomeIcon icon={faShare} />
                </button>
              </div>
              {user && comment.usuarioId === user.id && !comment._id.startsWith('temp-') && (
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDeleteComment(comment._id)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};



const SearchResults = () => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const REFRESH_INTERVAL = 10000; 

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "Data inválida";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Data inválida";

    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZone: 'America/Sao_Paulo'
    };

    return new Intl.DateTimeFormat('pt-BR', options).format(date);
  }, []);

  const performSearch = useCallback(async (query, force = false) => {
    if (!force && Date.now() - lastUpdate < REFRESH_INTERVAL) {
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`http://localhost:5000/usuarios/posts/listar`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      const filteredResults = response.data.filter(post =>
        post.titulo.toLowerCase().includes(query.toLowerCase()) ||
        post.conteudo.toLowerCase().includes(query.toLowerCase()) ||
        post.categoria.toLowerCase().includes(query.toLowerCase())
      ).map(post => ({
        ...post,
        likes: Array.isArray(post.likes) ? post.likes : [],
        comentarios: Array.isArray(post.comentarios) ? post.comentarios : []
      }));

      setResults(filteredResults);
      setLastUpdate(Date.now());
    } catch (err) {
      setError('Ocorreu um erro ao buscar os resultados. Tente novamente.');
      console.error('Erro na busca:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, lastUpdate]);

  useEffect(() => {
    const searchQuery = new URLSearchParams(location.search).get('query');
    if (searchQuery) {
      performSearch(searchQuery, true);

    
      const intervalId = setInterval(() => {
        performSearch(searchQuery);
      }, REFRESH_INTERVAL);

      return () => clearInterval(intervalId);
    }
  }, [location.search, performSearch]);

  const handleBackClick = () => {
    navigate('/');
  };

  const votePost = useCallback(async (postId) => {
    if (!user) {
      alert("Você precisa estar logado para votar em um post!");
      return;
    }

    try {
      await likePost(postId, user.id);
      
      setPosts(posts => posts.map(post => {
        if (post._id === postId) {
          const hasVoted = post.likes.includes(user.id);
          const newLikes = hasVoted 
            ? post.likes.filter(id => id !== user.id)
            : [...post.likes, user.id];
          return { ...post, likes: newLikes };
        }
        return post;
      }));
    } catch (error) {
      console.error('Erro ao votar no post:', error);
      alert('Erro ao votar no post. Tente novamente.');
    }
  }, [user]);

  const deletePost = async (postId) => {
    if (!user) {
      alert("Você precisa estar logado para excluir um post!");
      return;
    }

    if (window.confirm('Tem certeza que deseja excluir este post?')) {
      try {
        await axios.delete(`http://localhost:5000/usuarios/posts/${postId}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });

        setResults(prevPosts => prevPosts.filter(post => post._id !== postId));
      } catch (error) {
        console.error('Erro ao excluir post:', error);
        alert('Erro ao excluir o post. Tente novamente.');
      }
    }
  };

  const toggleComments = useCallback((postId) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  }, []);

  const handleSharePost = async (post) => {
    const shareData = {
      title: post.titulo,
      text: `${post.alunoId?.nome || 'Usuário'} postou: ${post.titulo}\n${post.conteudo}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = `${shareData.text}\n${shareData.url}`;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Link copiado para a área de transferência!');
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      alert('Erro ao compartilhar o post. Tente novamente.');
    }
  };

  return (
    <div className="home-container">
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="d-flex align-items-center mb-4">
            <button 
              className="btn btn-link text-decoration-none"
              onClick={handleBackClick}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Voltar
            </button>
            <h2 className="mb-0 ms-3">
              Resultados para "{new URLSearchParams(location.search).get('query')}"
            </h2>
          </div>

          {isLoading && results.length === 0 ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-5">
              <h3 className="h4 mb-3">Nenhum resultado encontrado</h3>
              <p className="text-muted">
                Tente usar palavras-chave diferentes ou verificar a ortografia
              </p>
            </div>
          ) : (
            <div className="posts-list">
              {results.map(post => (
                <div 
                  key={post._id} 
                  className="card mb-4 border-0 shadow-sm post-card"
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${post.alunoId?.nome || 'Usuario'}&background=random`}
                          alt="Avatar"
                          className="rounded-circle"
                          width="40"
                          height="40"
                        />
                        <div>
                          <div className="fw-bold">{post.alunoId?.nome || 'Usuário'}</div>
                          <small className="text-muted">
                            {formatDate(post.createdAt)}
                          </small>
                        </div>
                      </div>
                      <span className="badge bg-light text-dark">
                        {post.categoria}
                      </span>
                    </div>

                    <h3 className="h5 mb-3">{post.titulo}</h3>
                    <p className="card-text">{post.conteudo}</p>

                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div className="d-flex gap-3">
                        <button 
                          className={`btn btn-sm ${post.likes?.includes(user?.id) ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => votePost(post._id)}
                          disabled={!user}
                        >
                          <FontAwesomeIcon icon={faHeart} />
                          <span className="ms-1">{post.likes?.length || 0}</span>
                        </button>
                        <button 
                          className={`btn btn-sm ${expandedComments.has(post._id) ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => toggleComments(post._id)}
                        >
                          <FontAwesomeIcon icon={faComment} />
                          <span className="ms-1">{post.comentarios?.length || 0}</span>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleSharePost(post)}
                        >
                          <FontAwesomeIcon icon={faShare} />
                        </button>
                      </div>
                      {user && post.alunoId?._id === user.id && (
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => deletePost(post._id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      )}
                    </div>

                    {expandedComments.has(post._id) && (
                      <CommentSection
                        post={post}
                        user={user}
                        updatePosts={setResults}
                        formatDate={formatDate}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
         </div>
        </div>
      </div>
      <style>
        {`
          .home-container {
            background-color: #f8f9fa;
            min-height: calc(100vh - 56px);
            padding-top: 1rem;
          }

          .bg-light:hover {
            background-color: #f2f3f5 !important;
          }

          .welcome-section {
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }

          .post-card {
            transition: all 0.2s ease-in-out;
            border-radius: 8px;
          }

          .post-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }

          .btn-sm {
            padding: .25rem .5rem;
            font-size: .875rem;
            border-radius: .2rem;
          }

          .badge {
            font-weight: 500;
            padding: 0.5em 1em;
          }
        `}
      </style>
    </div>
  );
};

export default SearchResults;