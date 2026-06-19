import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function CreateCVPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Connect to the backend
      const response = await axios.post('http://localhost:3001/api/cv/generate', {
        companyName,
        jobDescription,
        resumeText
      });

      if (response.data && response.data.id) {
        navigate(`/preview/${response.data.id}`);
      } else {
        // Fallback for demo
        navigate('/preview/temp-id');
      }
    } catch (err) {
      console.warn('Backend connection failed, simulating generation...');
      // Simulated generation delay
      setTimeout(() => {
        setLoading(false);
        navigate('/preview/simulated-id');
      }, 1500);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '700px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '30px' }}>
        <Link to="/dashboard" style={{ color: '#0ea5e9', textDecoration: 'none', fontWeight: 'bold' }}>&larr; Back to Dashboard</Link>
        <h2 style={{ color: '#1e293b', marginTop: '15px' }}>Tailor a New CV</h2>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h3 style={{ color: '#0ea5e9' }}>Analyzing and Adapting CV...</h3>
          <p style={{ color: '#64748b' }}>Scanning company website and matching skills to modern ATS standards.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && <p style={{ color: '#ef4444', fontWeight: 'bold' }}>{error}</p>}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#475569' }}>Target Company Name *</label>
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required placeholder="e.g. Acme Corp" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#475569' }}>Job Description *</label>
            <textarea rows={5} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} required placeholder="Paste the target job description here..." style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'sans-serif' }}></textarea>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#475569' }}>Current Resume / Profile Details *</label>
            <textarea rows={6} value={resumeText} onChange={(e) => setResumeText(e.target.value)} required placeholder="Paste your current resume or experiences..." style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'sans-serif' }}></textarea>
          </div>

          <button type="submit" style={{ padding: '14px', backgroundColor: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
            Generate Tailored CV
          </button>
        </form>
      )}
    </div>
  );
}
