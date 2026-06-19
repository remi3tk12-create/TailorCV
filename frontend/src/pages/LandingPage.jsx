import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', color: '#0ea5e9', marginBottom: '20px' }}>TailorCV</h1>
      <p style={{ fontSize: '1.25rem', color: '#475569', lineHeight: '1.6', marginBottom: '30px' }}>
        Automatically adapt your CV and resume to a specific job offer. Get a perfectly aligned, professional CV in seconds.
      </p>
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <Link to="/signup" style={{ padding: '12px 24px', backgroundColor: '#0ea5e9', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
          Sign Up Free
        </Link>
        <Link to="/login" style={{ padding: '12px 24px', backgroundColor: '#f1f5f9', color: '#1e293b', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', border: '1px solid #cbd5e1' }}>
          Sign In
        </Link>
      </div>
    </div>
  );
}
