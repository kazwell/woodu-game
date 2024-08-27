import React, { useState } from 'react';
import { useGame } from './GameContext';

const Profile: React.FC = () => {
  const { user, login, register, logout } = useGame();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegistering) {
        await register(username, password);
      } else {
        await login(username, password);
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    }
  };

  if (user) {
    return (
      <div className="profile">
        <h2>Welcome, {user.username}!</h2>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return (
    <div className="profile">
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
      </form>
      <p>
        {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
        <button onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? 'Login' : 'Register'}
        </button>
      </p>
    </div>
  );
};

export default Profile;
