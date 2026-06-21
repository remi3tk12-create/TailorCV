import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch Profile info
      const profileRes = await client.get('/auth/profile');
      setProfile(profileRes.data);
      
      // Update local storage user just in case
      localStorage.setItem('user', JSON.stringify(profileRes.data));

      // 2. Fetch CV slots list
      const cvsRes = await client.get('/cv/list');
      if (cvsRes.data && Array.isArray(cvsRes.data.cvs)) {
        setCvs(cvsRes.data.cvs);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try signing in again.');
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleUpgradeMock = async () => {
    // If we want to simulate or update plan on the database, let's show an alert for now.
    // In our refinement flow, we can also mock premium status in localStorage if needed,
    // but the backend validates against the real database entry, so if the user wants 
    // to test premium features, they can toggle or upgrade.
    alert('Thank you for choosing Premium! (Refinement session is now available for your tailored CVs).');
    
    // Let's offer a quick frontend mock just to test UI states, but wait, since the backend
    // uses req.user.plan from the database, we can explain that.
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* Navigation / Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0ea5e9', textDecoration: 'none' }}>TailorCV</Link>
          <span style={{ fontSize: '1.25rem', color: '#94a3b8' }}>/</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>Dashboard</span>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: '#475569', fontWeight: '500' }}>
            {profile?.email}
          </span>
          <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.875rem' }}>
            Logout
          </button>
        </div>
      </div>

      {/* Account Info Bar */}
      {profile && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: '#f0f9ff', border: '1px solid #e0f2fe', borderRadius: '10px', marginBottom: '25px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0ea5e9', fontWeight: 'bold' }}>Subscription Plan</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <span style={{ fontWeight: 'bold', color: '#0369a1', fontSize: '1.1rem', textTransform: 'capitalize' }}>{profile.plan} Plan</span>
                {profile.plan === 'free' ? (
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#bae6fd', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>5 Slots Max</span>
                ) : (
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>⚡ Premium Active</span>
                )}
              </div>
            </div>
            <div style={{ width: '1px', height: '40px', backgroundColor: '#bae6fd' }} />
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0ea5e9', fontWeight: 'bold' }}>Slots Used</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0369a1', marginTop: '2px' }}>
                {profile.cvCount} / {profile.plan === 'free' ? '5' : '∞'}
              </div>
            </div>
          </div>
          {profile.plan === 'free' && (
            <button onClick={handleUpgradeMock} style={{ padding: '8px 16px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.875rem', boxShadow: '0 2px 4px rgba(245, 158, 11, 0.2)' }}>
              Upgrade to Premium
            </button>
          )}
        </div>
      )}

      {error && (
        <div style={{ padding: '12px', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '20px', border: '1px solid #fee2e2' }}>
          {error}
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#1e293b', margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>My Tailored CVs</h3>
        {(!profile || profile.plan === 'premium' || cvs.length < 5) ? (
          <Link to="/create" style={{ padding: '10px 20px', backgroundColor: '#0ea5e9', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 2px 4px rgba(14, 165, 233, 0.2)' }}>
            + Tailor New CV
          </Link>
        ) : (
          <button disabled style={{ padding: '10px 20px', backgroundColor: '#cbd5e1', color: '#64748b', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'not-allowed', border: 'none' }} title="Upgrade to Premium to create more CVs">
            Slot Limit Reached
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '1rem' }}>Loading your CV list...</div>
      ) : cvs.length === 0 ? (
        <div style={{ padding: '60px 40px', border: '2px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#334155', fontSize: '1.15rem' }}>No Tailored CVs Yet</h4>
          <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Upload a job description and adapt your experience in under 60 seconds.
          </p>
          <Link to="/create" style={{ padding: '10px 24px', backgroundColor: '#0ea5e9', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>
            Adapt Your First CV
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {cvs.map((cv) => (
            <div key={cv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#1e293b', fontSize: '1.1rem', fontWeight: 'bold' }}>{cv.jobTitle}</h4>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.85rem', color: '#64748b' }}>
                  <span style={{ fontWeight: '500', color: '#475569' }}>at {cv.companyName}</span>
                  <span>&bull;</span>
                  <span>Created {formatDate(cv.createdAt)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <span style={{ padding: '6px 12px', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'capitalize' }}>
                  {cv.status}
                </span>
                <Link to={`/preview/${cv.id}`} style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', transition: 'background-color 0.2s' }}>
                  Preview & Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
