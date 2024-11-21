import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PostForm from '../components/PostForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { postData as createPost, deletePostAPI, likePost, deleteComment, addComment, likeComment } from '../service/api';
import { 
  faHeart, 
  faComment, 
  faTrash,
  faTrophy,
  faFilter,
  faFire,
  faTimes,
  faShare,
  faChartSimple 
} from '@fortawesome/free-solid-svg-icons';
import { getPosts } from '../service/api';

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

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [selectedCategory, setSelectedCategory] = useState(null);
  const REFRESH_INTERVAL = 100000;

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

  const fetchPosts = useCallback(async (force = false) => {
    if (!force && Date.now() - lastUpdate < REFRESH_INTERVAL) {
      return;
    }

    setLoading(true);
    try {
      const fetchedPosts = await getPosts();
      setPosts(fetchedPosts);
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
    } finally {
      setLoading(false);
    }
  }, [lastUpdate]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category === selectedCategory ? null : category);
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

  const getTopPosts = useCallback(() => {
    return [...posts]
      .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
      .slice(0, 5)
      .map(post => ({
        title: post.titulo,
        likes: post.likes?.length || 0,
        category: post.categoria
      }));
  }, [posts]);

  const getCategoryCount = (category) => {
    return posts.filter(post => post.categoria === category).length;
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

  const handleSharePost = (post) => {
    if (navigator.share) {
      navigator.share({
        title: post.titulo,
        text: `${post.alunoId?.nome} postou: ${post.titulo}\n${post.conteudo}`,
        url: window.location.href
      })
      .catch((error) => console.log('Erro ao compartilhar:', error));
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = `${post.alunoId?.nome} postou: ${post.titulo}\n${post.conteudo}\n${window.location.href}`;
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

  const deletePost = useCallback(async (postId) => {
    if (!user) return;
    
    if (window.confirm('Tem certeza que deseja excluir este post?')) {
      try {
        await deletePostAPI(postId);
        setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
      } catch (error) {
        console.error('Erro ao excluir post:', error);
        alert('Erro ao excluir post. Tente novamente.');
      }
    }
  }, [user]);

  useEffect(() => {
    fetchPosts(true); 

    const intervalId = setInterval(() => {
      fetchPosts();
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [fetchPosts]);

  const addPost = async (title, content) => {
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newPostData = {
        titulo: title,
        conteudo: content,
        categoria: "Geral",
      };

      const tempPost = {
        ...newPostData,
        _id: `temp-${Date.now()}`,
        alunoId: {
          _id: user.id,
          nome: user.nome
        },
        likes: [],
        comentarios: [],
        createdAt: new Date().toISOString(),
        isTemp: true
      };

      setPosts(prevPosts => [tempPost, ...prevPosts]);

      const createdPost = await createPost(newPostData);
      
      setPosts(prevPosts => {
        const filteredPosts = prevPosts.filter(p => !p.isTemp);
        return [
          {
            ...createdPost,
            alunoId: {
              _id: user.id,
              nome: user.nome
            },
            likes: [],
            comentarios: []
          },
          ...filteredPosts
        ];
      });

      await fetchPosts();
    } catch (error) {
      setPosts(prevPosts => prevPosts.filter(p => !p.isTemp));
      console.error('Erro ao criar post:', error);
      alert('Erro ao criar post. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFilteredAndSortedPosts = () => {
    let filteredPosts = [...posts];

    if (selectedCategory) {
      filteredPosts = filteredPosts.filter(post => post.categoria === selectedCategory);
    }
    
    switch (sortBy) {
      case 'trending':
        return filteredPosts.sort((a, b) => b.likes.length - a.likes.length);
      case 'recent':
        return filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'comments':
        return filteredPosts.sort((a, b) => (b.comentarios?.length || 0) - (a.comentarios?.length || 0));
      default:
        return filteredPosts;
    }
  };

  const handleSort = (method) => {
    setSortBy(method);
  };

  const displayPosts = getFilteredAndSortedPosts();

  return (
    posts ? (
      <div className="home-container">
        <div className="container py-4">
          <div className="row justify-content-center">
            {/* Sidebar Esquerda */}
            <div className="col-lg-3 d-none d-lg-block">
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                  <h5 className="card-title h6 mb-3">Navegação</h5>
                  <div className="list-group list-group-flush">
                    {[
                      { type: 'recent', icon: faChartSimple, label: 'Mais Recentes' },
                      { type: 'trending', icon: faFire, label: 'Em Alta' }
                    ].map(({type, icon, label}) => (
                      <button 
                        key={type}
                        className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${sortBy === type ? 'active' : ''}`}
                        onClick={() => handleSort(type)}
                      >
                        <FontAwesomeIcon icon={icon} />{label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="card-title h6 mb-0">Categorias</h5>
                      {selectedCategory && (
                        <span className="badge bg-light text-dark d-flex align-items-center gap-2">
                          <FontAwesomeIcon icon={faFilter} />
                          {selectedCategory}
                          <button 
                            className="btn btn-sm p-0 border-0 text-dark"
                            onClick={() => setSelectedCategory(null)}
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </span>
                      )}
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {['Tecnologia', 'Saúde', 'Educação', 'Ciência', 'Cultura'].map(category => (
                        <button 
                          key={category}
                          onClick={() => handleCategoryClick(category)}
                          className={`btn btn-sm ${selectedCategory === category ? 'btn-primary' : 'bg-light text-dark'}`}
                        >
                          {category}
                          <span className="ms-2 badge bg-white text-dark">
                            {getCategoryCount(category)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            {/* Conteúdo Principal */}
            <div className="col-lg-6 col-md-12">
              <div className="welcome-section text-center mb-4 p-4 bg-white rounded shadow-sm">
                <h1 className="display-5 mb-3">Bem-vindo ao Sabidus!</h1>
                <p className="lead text-muted">
                  Compartilhe conhecimento, aprenda e conecte-se com pessoas interessantes.
                </p>
                {!user && (
                  <div className="mt-3 d-flex justify-content-center">
                    <div className="auth-buttons">
                      <button 
                        className="btn btn-primary"
                        onClick={() => navigate('/login')}
                      >
                        Fazer Login
                      </button>
                      <button 
                        className="btn btn-outline-primary"
                        onClick={() => navigate('/register')}
                      >
                        Criar Conta
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {user && (
                <div className="mb-4">
                  <PostForm user={user} addPost={addPost} />
                </div>
              )}

              <div className="posts-list">
                {displayPosts.map(post => (
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
                            <span className="ms-1">{post?.comentarios?.length || 0}</span>
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
                          updatePosts={setPosts}
                          formatDate={formatDate}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

              {/* Sidebar Direita */}
              <div className="col-lg-3 d-none d-lg-block">
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-2">
                    <h6 className="mb-2 small">
                      <FontAwesomeIcon icon={faTrophy} className="me-1" />
                      Top 5 Posts
                    </h6>
                    {getTopPosts().map((post, index) => (
                      <div key={index} className="d-flex align-items-center bg-light rounded mb-1 p-1 small">
                        <span className="badge bg-primary">#{index + 1}</span>
                        <span className="badge bg-secondary ms-1">{post.category}</span>
                        <span className="text-truncate mx-2" style={{ maxWidth: '100px' }}>{post.title}</span>
                        <span className="text-muted ms-auto">
                          <FontAwesomeIcon icon={faHeart} className="me-1" />{post.likes}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {user && (
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title h6 mb-3">Sua Atividade</h5>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Posts</span>
                        <span className="badge bg-light text-dark">
                          {posts.filter(post => post.alunoId?._id === user.id).length}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Votos dados</span>
                        <span className="badge bg-light text-dark">
                          {posts.reduce((count, post) => 
                            count + (post.likes?.includes(user.id) ? 1 : 0), 0
                          )}
                            </span>
                          </div>
                          </div>
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

              .list-group-item-action {
                border: none;
                padding: .5rem 1rem;
              }

              .list-group-item-action:hover {
                background-color: #f8f9fa;
              }

              .list-group-item-action.active {
                background-color: #3498DB;
                border-color: #3498DB;
              }

              .btn-primary {
                background-color: #3498DB;
                border-color: #3498DB;
              }

              .btn-primary:hover {
                background-color: #2980b9;
                border-color: #2980b9;
              }

              .btn-outline-primary {
                color: #3498DB;
                border-color: #3498DB;
              }

              .btn-outline-primary:hover {
                background-color: #3498DB;
                border-color: #3498DB;
              }

              .badge.bg-primary {
                background-color: #3498DB !important;
              }

              h1, .h1 {
                color: #2C3E50;
              }

              @media (max-width: 768px) {
                .display-5 {
                  font-size: 1.8rem;
                }
                
                .lead {
                  font-size: 1rem;
                }

                .post-card {
                  margin: 0 -12px;
                  border-radius: 0;
                }
              }
            `}
          </style>
      </div>
    ) : null
  );
};

export default Home;