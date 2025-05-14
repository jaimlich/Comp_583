import React from 'react';
import { useAuth } from '../context/AuthContext';
import LoginModal from './Auth/LoginModal';
import RegisterModal from './Auth/RegisterModal';
import ProfileDropdown from './Auth/ProfileDropdown';

const NavBar = () => {
  const { user, logout } = useAuth();
  const [showLogin, setShowLogin] = React.useState(false);
  const [showRegister, setShowRegister] = React.useState(false);

  return (
    <div className="navbar">
      <div className="search-bar">
        <input placeholder="Search..." />
      </div>
      <div className="auth-controls">
        {user ? (
          <ProfileDropdown user={user} onLogout={logout} />
        ) : (
          <>
            <button onClick={() => setShowLogin(true)}>Login</button>
            <button onClick={() => setShowRegister(true)}>Register</button>
          </>
        )}
      </div>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} />}
    </div>
  );
};

export default NavBar;
