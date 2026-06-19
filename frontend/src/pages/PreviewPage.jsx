import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function PreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cvData, setCvData] = useState(null);

  // Simulated editable contact details
  const [fullName, setFullName] = useState('John Doe');
  const [phone, setPhone] = useState('[Placeholder: Phone]');
  const [email, setEmail] = useState('[Placeholder: Email]');
  const [location, setLocation] = useState('[Placeholder: Location]');

  useEffect(() => {
    // Try to load CV data from API or use mock
    const fetchCV = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:3001/api/cv/${id}`);
        if (response.data) {
          setCvData(response.data);
          if (response.data.fullName) setFullName(response.data.fullName);
        }
      } catch (err) {
        console.warn('Backend not available, using high fidelity template mock...');
        // Standard high quality template details reflecting template specs
        setCvData({
          companyName: 'Acme Corp',
          roleTitle: 'Senior Frontend Developer',
          score: 95,
          summary: 'Highly experienced engineer with 5+ years of software design expertise. Specially aligned to Acme\'s web portal performance requirements, leveraging React, responsive CSS, and state optimization paradigms.',
          experience: [
            {
              title: 'Frontend Developer',
              company: 'Innovative Systems',
              dates: '2022 - Present',
              bullets: [
                'Designed and developed state-optimized user dashboards reducing rendering overhead by 40%.',
                'Collaborated with product teams to build secure, robust UI components adhering to accessibility directives.',
                'Engineered performance metrics tracking to identify client-side bottlenecks.'
              ]
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCV();
  }, [id]);

  const handleDownload = () => {
    alert('Exporting tailored CV to PDF format...');
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>Loading adapted CV preview...</div>;
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
        <Link to="/dashboard" style={{ color: '#0ea5e9', textDecoration: 'none', fontWeight: 'bold' }}>&larr; Dashboard</Link>
        <button onClick={handleDownload} style={{ padding: '10px 20px', backgroundColor: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          Download tailored PDF
        </button>
      </div>

      {cvData && (
        <div style={{ padding: '40px', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#fff' }}>
          {/* Header Info */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0ea5e9', paddingBottom: '20px', marginBottom: '25px' }}>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '2rem', color: '#1e293b' }}>{fullName}</h1>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', fontSize: '0.875rem', color: '#64748b' }}>
              <span>{phone}</span>
              <span>&bull;</span>
              <span>{email}</span>
              <span>&bull;</span>
              <span>{location}</span>
            </div>
            <p style={{ margin: '15px 0 0 0', fontWeight: 'bold', color: '#0ea5e9' }}>
              Targeting: {cvData.roleTitle} at {cvData.companyName} ({cvData.score}% Score Match)
            </p>
          </div>

          {/* Summary Section */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#0ea5e9', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #f1f5f9', paddingBottom: '5px', margin: '0 0 10px 0' }}>
              Professional Summary
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: '1.6', margin: 0 }}>{cvData.summary}</p>
          </div>

          {/* Experience Section */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#0ea5e9', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #f1f5f9', paddingBottom: '5px', margin: '0 0 10px 0' }}>
              Professional Experience
            </h3>
            {cvData.experience?.map((exp, idx) => (
              <div key={idx} style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.95rem', color: '#1e293b' }}>
                  <span>{exp.title} &mdash; {exp.company}</span>
                  <span style={{ color: '#64748b' }}>{exp.dates}</span>
                </div>
                <ul style={{ paddingLeft: '20px', margin: '10px 0 0 0', fontSize: '0.9rem', color: '#475569', lineHeight: '1.5' }}>
                  {exp.bullets?.map((bullet, bulletIdx) => (
                    <li key={bulletIdx} style={{ marginBottom: '6px' }}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Education */}
          <div>
            <h3 style={{ color: '#0ea5e9', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #f1f5f9', paddingBottom: '5px', margin: '0 0 10px 0' }}>
              Education
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#334155' }}>
              <span style={{ fontWeight: 'bold' }}>B.S. in Computer Science</span>
              <span style={{ color: '#64748b' }}>Graduated 2021</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
