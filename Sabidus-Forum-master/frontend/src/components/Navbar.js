import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faUser,
  faSignOutAlt,
  faCog,
  faBrain
} from '@fortawesome/free-solid-svg-icons';

const SearchResults = ({ className }) => {
  const navigate = useNavigate();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      console.log('Buscando por:', searchQuery);
      navigate(`/search?query=${searchQuery}`);
    }
  };

  return (
    <form className={`search-form ${className}`} onSubmit={handleSearchSubmit}>
      <div className={`input-group ${searchFocused ? 'focused' : ''}`}>
        <span className="input-group-text">
          <FontAwesomeIcon icon={faSearch} />
        </span>
        <input
          type="search"
          className="form-control"
          placeholder="Buscar no Sabidus..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
      </div>
    </form>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <>
      <div className="navbar-spacer"></div>
      <nav className="navbar navbar-expand-lg fixed-top">
        <div className="container">
          <div className="navbar-content">
            <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
              <FontAwesomeIcon
                icon={faBrain}
                className="logo-icon"
                style={{ fontSize: '1.8rem' }}
              />
              <h1 className="d-none d-lg-inline logo-text mb-0">
                Sabi<span className="brand-highlight">dus</span>
              </h1>
            </Link>

            <SearchResults className="search-section" />

            <div className="navbar-actions">
              {user ? (
                <div className="dropdown" ref={menuRef}>
                  <button
                    className="btn btn-link text-dark p-0 d-flex align-items-center gap-2"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${user.nome || 'User'}&background=random`}
                      alt="Avatar"
                      className="rounded-circle"
                      width="32"
                      height="32"
                    />
                    <span className="d-none d-lg-block">
                      {user.nome || user.email}
                    </span>
                  </button>

                  <div 
                    className={`dropdown-menu shadow ${showUserMenu ? 'show' : ''}`}
                    style={{ position: 'absolute', right: 0, top: '100%', zIndex: 1050 }}
                  >
                    <Link className="dropdown-item" to="/profile">
                      <FontAwesomeIcon icon={faUser} className="me-2" />
                      Perfil
                    </Link>
                    <Link className="dropdown-item" to="/settings">
                      <FontAwesomeIcon icon={faCog} className="me-2" />
                      Configurações
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button 
                      className="dropdown-item text-danger" 
                      onClick={handleLogout}
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                      Sair
                    </button>
                  </div>
                </div>
              ) : (
                <div className="auth-buttons">
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate('/register')}
                  >
                    Cadastre-se
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

          .navbar-spacer {
            height: 64px;
          }

          .navbar {
            height: 64px;
            font-family: 'Roboto', Arial, sans-serif;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(231, 231, 231, 0.8);
            padding: 0;
            z-index: 1040;
          }

          .navbar-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            gap: 1rem;
          }

          .navbar-brand {
            flex-shrink: 0;
            text-decoration: none;
          }

          .search-section {
            flex: 0 1 400px;
            min-width: 200px;
          }

          .navbar-actions {
            display: flex;
            align-items: center;
            gap: 1rem;
            flex-shrink: 0;
          }

          .logo-icon {
            color: #3498DB;
            margin-bottom: 0.25rem;
          }

          .logo-text {
            font-family: 'Poppins', sans-serif;
            font-weight: 700;
            font-size: 1.5rem;
            color: #2C3E50;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 0;
          }

          .brand-highlight {
            color: #3498DB;
          }

          .search-form {
            width: 100%;
          }

          .input-group {
            transition: all 0.2s ease;
            border-radius: 25px;
            overflow: hidden;
            background: #f0f2f5;
            border: 1px solid transparent;
          }

          .input-group.focused {
            background: white;
            border-color: #3498DB;
            box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.1);
          }

          .input-group-text {
            background: transparent;
            border: none;
            color: #6c757d;
            padding-left: 1.25rem;
          }

          .search-form .form-control {
            border: none;
            padding: 0.7rem 1rem;
            background: transparent;
            font-size: 0.95rem;
            height: 42px;
          }

          .search-form .form-control:focus {
            box-shadow: none;
          }

          .auth-buttons {
            display: flex;
            gap: 0.5rem;
          }

          .auth-buttons .btn {
            border-radius: 20px;
            padding: 0.5rem 1.25rem;
            font-weight: 500;
            font-size: 0.875rem;
            white-space: nowrap;
          }

          .btn-primary {
            background-color: #3498DB;
            border-color: #3498DB;
            transition: all 0.2s ease;
          }

          .btn-primary:hover {
            background-color: #2980b9;
            border-color: #2980b9;
            transform: translateY(-1px);
          }

          .btn-outline-primary {
            color: #3498DB;
            border-color: #3498DB;
            transition: all 0.2s ease;
          }

          .btn-outline-primary:hover {
            background-color: #3498DB;
            border-color: #3498DB;
            transform: translateY(-1px);
          }

          .dropdown {
            position: relative;
            z-index: 1050;
          }

          .dropdown-menu {
            margin-top: 0.75rem;
            border: none;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            min-width: 220px;
          }

          .dropdown-item {
            padding: 0.7rem 1.25rem;
            font-size: 0.95rem;
            transition: all 0.2s ease;
          }

          .dropdown-item:hover {
            background-color: #f8f9fa;
          }

          .dropdown-divider {
            margin: 0.5rem 0;
            border-top-color: #f1f1f1;
          }

          @media (max-width: 991.98px) {
            .search-section {
              flex: 0 1 300px;
              min-width: 150px;
            }

            .auth-buttons {
              gap: 0.25rem;
            }

            .auth-buttons .btn {
              padding: 0.375rem 0.75rem;
              font-size: 0.875rem;
            }

            .input-group {
              height: 36px;
            }

            .search-form .form-control {
              height: 36px;
              padding: 0.4rem 0.75rem;
              font-size: 0.875rem;
            }

            .input-group-text {
              padding-left: 0.75rem;
            }

            .logo-text {
              font-size: 1.25rem;
            }
          }

          @media (max-width: 510px) {
          .search-section {
            flex: 0 1 200px;
            min-width: 120px;
          }

          .search-form .form-control {
            font-size: 0.8rem;
            padding: 0.5rem 0.5rem;
          }

          .input-group-text {
            padding-left: 0.5rem;
            padding-right: 0.25rem;
          }

          .auth-buttons .btn {
            padding: 0.5rem 0.4rem;
            font-size: 0.8rem;
          }

          .logo-icon {
            font-size: 1.5rem !important;
          }
        }

        @media (max-width: 345px) {
          .search-section {
            flex: 0 1 130px;
            min-width: 70px;
          }

          .search-form .form-control {
            font-size: 0.75rem;
            padding: 0.5rem 0.3rem;
          }

          .auth-buttons .btn {
            padding: 0.5rem 0.4rem;
            font-size: 0.75rem;
          }

          .navbar-content {
            gap: 0.5rem;
          }

          .input-group-text {
            padding-left: 0.4rem;
            padding-right: 0.2rem;
          }
        `}
      </style>
    </>
  );
};

export default Navbar;