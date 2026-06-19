import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('user', JSON.stringify({ email, name: email.split('@')[0] }));
    alert('Logged in successfully!');
    navigate('/dashboard');
  };

  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: '40px auto', fontFamily: 'sans-serif', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
      <h2 style={{ fontSize: '1.75rem', color: '#0ea5e9', marginBottom: '20px', textAlign: 'center' }}>Sign In</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#475569' }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#475569' }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
        </div>
        <button type="submit" style={{ padding: '12px', backgroundColor: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
          Sign In
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem', color: '#64748b' }}>
        Don't have an account? <Link to="/signup" style={{ color: '#0ea5e9', textDecoration: 'none' }}>Sign Up</Link>
      </p>
    </div>
  );
}
