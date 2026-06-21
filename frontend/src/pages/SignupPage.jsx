import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await client.post('/auth/signup', { 
        email, 
        password,
        name 
      });

      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        alert('Account created successfully!');
        navigate('/dashboard');
      } else {
        setError('Unexpected response from server.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.error || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: '40px auto', fontFamily: 'sans-serif', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#fff' }}>
      <h2 style={{ fontSize: '1.75rem', color: '#0ea5e9', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold' }}>Create Account</h2>
      
      {error && (
        <div style={{ padding: '10px', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '15px', border: '1px solid #fee2e2', fontWeight: 'bold' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#475569' }}>Full Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            placeholder="John Doe"
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} 
            disabled={loading}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#475569' }}>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="your@email.com"
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} 
            disabled={loading}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#475569' }}>Password (min. 6 chars)</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="••••••••"
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} 
            disabled={loading}
          />
        </div>
        <button 
          type="submit" 
          style={{ padding: '12px', backgroundColor: loading ? '#93c5fd' : '#0ea5e9', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px' }}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem', color: '#64748b' }}>
        Already have an account? <Link to="/login" style={{ color: '#0ea5e9', textDecoration: 'none', fontWeight: 'bold' }}>Sign In</Link>
      </p>
    </div>
  );
}
