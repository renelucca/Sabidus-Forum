import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importando useNavigate do react-router-dom
import $ from 'jquery'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min'; 
import Navbar from '../components/Navbar';
import PostForm from '../components/PostForm'; 
import { useAuth } from '../context/AuthContext';


const Home = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [userVotes, setUserVotes] = useState({});
  const [posts, setPosts] = useState([]);
  const {user, login, logout} = useAuth();

  const initialPosts = [
    {
      id: 1,
      title: "Os benefícios da meditação para a saúde mental",
      content: "A meditação tem se mostrado uma prática eficaz para reduzir o estresse e melhorar o bem-estar geral...",
      author: "MeditacaoFan",
      timestamp: "2023-04-15T10:30:00",
      votes: 42,
      comments: 15
    },
    {
      id: 2,
      title: "Como a inteligência artificial está revolucionando a medicina",
      content: "A IA está sendo utilizada para análise de imagens médicas, diagnósticos precoces e desenvolvimento de novos medicamentos...",
      author: "TechMedico",
      timestamp: "2023-04-14T16:45:00",
      votes: 78,
      comments: 23
    },
    {
      id: 3,
      title: "Dicas para uma alimentação saudável e equilibrada",
      content: "Uma dieta balanceada é essencial para manter a saúde. Aqui estão algumas dicas para melhorar sua alimentação...",
      author: "NutriExpert",
      timestamp: "2023-04-13T09:15:00",
      votes: 56,
      comments: 19
    },
    {
      id: 4,
      title: "O impacto das redes sociais na sociedade moderna",
      content: "As redes sociais transformaram a forma como nos comunicamos e interagimos. Vamos discutir os prós e contras...",
      author: "SocialMediaGuru",
      timestamp: "2023-04-12T14:20:00",
      votes: 63,
      comments: 31
    },
    {
      id: 5,
      title: "Estratégias eficazes para o gerenciamento do tempo",
      content: "Aprenda a organizar melhor suas tarefas e aumentar sua produtividade com estas técnicas comprovadas...",
      author: "TimeMaster",
      timestamp: "2023-04-11T11:00:00",
      votes: 39,
      comments: 12
    }
  ];

  useEffect(() => {
    setPosts(initialPosts);
    updateLoginStatus();
  }, []);

  const updateLoginStatus = () => {
    if (user) {
      $('#login-nav-item, #register-nav-item').addClass('d-none');
      $('#logout-nav-item').removeClass('d-none');
      $('#login-message').hide();
      $('.locked-action').removeClass('locked-action');
    } else {
      $('#login-nav-item, #register-nav-item').removeClass('d-none');
      $('#logout-nav-item').addClass('d-none');
      $('#login-message').show();
      $('.post-actions a').addClass('locked-action');
    }
  };


  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const addPost = (title, content) => {
    const newPost = {
      id: posts.length + 1,
      title: title,
      content: content,
      author: currentUser,
      timestamp: new Date().toISOString(),
      votes: 0,
      comments: 0
    };

    setPosts([newPost, ...posts]);
  };

  const votePost = (postId) => {
    if (!user) {
      alert("Você precisa estar logado para votar em um post!");
      return; // Retorna para evitar que o código abaixo seja executado
    }

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const newVotes = userVotes[postId] ? post.votes - 1 : post.votes + 1;
        const newUserVotes = { ...userVotes, [postId]: !userVotes[postId] };
        setUserVotes(newUserVotes);
        return { ...post, votes: newVotes };
      }
      return post;
    });

    setPosts(updatedPosts);
  };

  const deletePost = (postId) => {
    const updatedPosts = posts.filter(post => post.id !== postId);
    setPosts(updatedPosts);
  };

  const renderPosts = () => {
    return posts.map(post => (
      <div className="card mb-4" key={post.id}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="post-info">
              <img src="https://via.placeholder.com/32" alt="Avatar" className="post-avatar me-2" />
              <span className="fw-bold">{post.author}</span> • {formatDate(post.timestamp)}
            </div>
            <div className="post-votes">
              <button className={`btn btn-sm ${userVotes[post.id] ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => votePost(post.id)}>
                <i className="fas fa-arrow-up"></i>
              </button>
              <span className="vote-count">{post.votes}</span>
            </div>
          </div>
          <h5 className="card-title post-title">{post.title}</h5>
          <p className="card-text post-content">{post.content}</p>
          <div className="post-actions d-flex justify-content-between align-items-center">
            <a href="#" className="card-link comment-link">
              <i className="far fa-comment"></i> {post.comments} Comentários
            </a>
            <a href="#" className="card-link share-link">
              <i className="fas fa-share"></i> Compartilhar
            </a>
            {post.author === currentUser ? (
              <a href="#" className="card-link delete-button" onClick={() => deletePost(post.id)}>
                <i className="fas fa-trash-alt"></i> Excluir
              </a>
            ) : null}
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="container">
      <Navbar /> 
      <h1 className="mb-4">Bem-vindo ao nosso fórum de discussões!</h1>
      <p id="login-message" className="alert alert-info" style={{ display: user ? 'none' : 'block' }}>
        Por favor, faça login para interagir com os posts.
      </p>

      {/* Usando o PostForm */}
      {user && <PostForm user={user} addPost={addPost}  />} {/* O formulário só será exibido se o usuário estiver logado */}

      <h2 className="mt-5">Posts Recentes</h2>
      <div className="posts-list">
        {renderPosts()}
      </div>
    </div>
  );
};

export default Home;
