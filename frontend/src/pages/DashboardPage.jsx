import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cvs, setCvs] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
    }

    // Default simulated CVs
    const mockCvs = [
      { id: '1', title: 'React Developer at FinTech', matchedScore: 92, date: '2026-06-12' },
      { id: '2', title: 'Frontend Engineer at HealthCorp', matchedScore: 85, date: '2026-06-11' }
    ];
    setCvs(mockCvs);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
        <h2 style={{ color: '#1e293b', margin: 0 }}>Dashboard</h2>
        <div style={{ display: 'flex', gap: '15px', marginLeft: 'auto', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: '#475569' }}>Welcome, {user?.name || 'User'}</span>
          <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#334155', margin: 0 }}>My Tailored CVs</h3>
        <Link to="/create" style={{ padding: '10px 20px', backgroundColor: '#0ea5e9', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
          + Tailor New CV
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {cvs.map((cv) => (
          <div key={cv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{cv.title}</h4>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Matched on {cv.date}</p>
            </div>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <span style={{ padding: '6px 12px', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 'bold' }}>
                {cv.matchedScore}% Match
              </span>
              <Link to={`/preview/${cv.id}`} style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 'bold' }}>
                Preview & Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
