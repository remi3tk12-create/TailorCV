import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import client from '../api/client';

export default function PreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cvSlot, setCvSlot] = useState(null);
  const [error, setError] = useState('');

  // Editable contact details with sensible defaults
  const [fullName, setFullName] = useState('Candidate Name');
  const [phone, setPhone] = useState('+1 (555) 019-2834');
  const [email, setEmail] = useState('candidate@email.com');
  const [location, setLocation] = useState('San Jose, CA');

  useEffect(() => {
    const fetchCV = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await client.get(`/cv/${id}`);
        if (response.data) {
          setCvSlot(response.data);
          
          // Pre-populate candidate info from response cvData
          const embeddedData = response.data.cvData;
          if (embeddedData) {
            if (embeddedData.name) setFullName(embeddedData.name);
            if (embeddedData.email) setEmail(embeddedData.email);
          }
        }
      } catch (err) {
        console.error('Error fetching real CV from backend:', err);
        setError('Could not fetch CV details from backend. Showing high fidelity mock preview.');
        
        // High quality fallback mock data reflecting specs
        setCvSlot({
          id: 'mock-id',
          jobTitle: 'Senior Frontend Developer',
          companyName: 'Acme Corp',
          cvData: {
            name: 'John Doe',
            email: 'john.doe@email.com',
            whyThisRole: "I am incredibly excited about the opportunity to join Acme Corp. Your mission and the work highlighted on your website, particularly in relation to high performance web portals and modular client architecture, aligns perfectly with my professional goals and passion. With my expertise, I am confident I can contribute significantly to your continued success and help drive the key initiatives outlined in this role.",
            skills: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'REST APIs', 'ATS Optimization'],
            experience: [
              {
                role: 'Senior Frontend Engineer',
                company: 'Innovative Systems',
                startDate: '2022-01',
                endDate: 'Present',
                description: 'Designed and developed state-optimized user dashboards reducing rendering overhead by 40%.\nCollaborated with product teams to build secure, robust UI components adhering to accessibility directives.\nEngineered performance metrics tracking to identify client-side bottlenecks.'
              },
              {
                role: 'Web Developer',
                company: 'Tech Solutions LLC',
                startDate: '2020-03',
                endDate: '2021-12',
                description: 'Developed responsive, cross-browser web interfaces utilizing HTML5, CSS3, and JavaScript.\nOptimized bundle sizes and asset loading pipelines to achieve a 25% page speed improvement.'
              }
            ],
            education: [
              {
                degree: 'Bachelor of Science in Computer Science',
                school: 'State Technical University',
                year: '2020'
              }
            ]
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCV();
  }, [id]);

  const handleDownload = async () => {
    try {
      const response = await client.get(`/cv/${id}/download`, {
        responseType: 'blob'
      });
      
      // Create a local URL for the PDF blob and trigger browser download stream
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', `Tailored-CV-${cvSlot?.companyName?.replace(/\s+/g, '-') || 'Export'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(fileURL);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to stream tailored PDF from backend. (Ensure the backend is online and database records match).');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'sans-serif', color: '#0ea5e9' }}>
        <h3>Loading your tailored CV preview...</h3>
      </div>
    );
  }

  const cvDetails = cvSlot?.cvData || {};

  return (
    <div style={{ padding: '40px', maxWidth: '850px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
        <Link to="/dashboard" style={{ color: '#0ea5e9', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.95rem' }}>
          &larr; Back to Dashboard
        </Link>
        <button 
          onClick={handleDownload} 
          style={{ padding: '10px 24px', backgroundColor: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(14, 165, 233, 0.2)' }}
        >
          Download Tailored PDF
        </button>
      </div>

      {error && (
        <div style={{ padding: '10px 15px', backgroundColor: '#fffbeb', color: '#b45309', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', border: '1px solid #fef3c7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>💡 {error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#b45309', cursor: 'pointer', fontWeight: 'bold' }}>&times;</button>
        </div>
      )}

      {cvSlot && (
        <div style={{ padding: '40px', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', backgroundColor: '#fff' }}>
          
          {/* AESTHETIC ATS TEMPLATE RENDERING */}
          
          {/* Header Info */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0ea5e9', paddingBottom: '20px', marginBottom: '25px' }}>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '2rem', color: '#1e293b', fontWeight: 'bold' }}>
              {fullName || '[Name - To Be Filled In]'}
            </h1>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', fontSize: '0.875rem', color: '#475569', fontWeight: '500' }}>
              <span>{phone}</span>
              <span>&bull;</span>
              <span>{email || '[Email - To Be Filled In]'}</span>
              <span>&bull;</span>
              <span>{location}</span>
            </div>
            <div style={{ margin: '15px auto 0 auto', maxWidth: '600px', backgroundColor: '#f0f9ff', padding: '6px 12px', borderRadius: '20px', display: 'inline-block', fontSize: '0.85rem', fontWeight: 'bold', color: '#0369a1', border: '1px solid #bae6fd' }}>
              Targeting: {cvSlot.jobTitle} at {cvSlot.companyName}
            </div>
          </div>

          {/* Why This Role / Summary Section */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#0ea5e9', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #cbd5e1', paddingBottom: '5px', margin: '0 0 12px 0', fontWeight: 'bold' }}>
              Professional Summary
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: '1.6', margin: 0, textAlign: 'justify' }}>
              {cvDetails.whyThisRole}
            </p>
          </div>

          {/* Core Skills Section */}
          {cvDetails.skills && cvDetails.skills.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ color: '#0ea5e9', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #cbd5e1', paddingBottom: '5px', margin: '0 0 12px 0', fontWeight: 'bold' }}>
                Core Skills
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {cvDetails.skills.map((skill, idx) => (
                  <span key={idx} style={{ padding: '4px 12px', backgroundColor: '#f1f5f9', color: '#334155', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600', border: '1px solid #e2e8f0' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience Section */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#0ea5e9', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #cbd5e1', paddingBottom: '5px', margin: '0 0 12px 0', fontWeight: 'bold' }}>
              Professional Experience
            </h3>
            {cvDetails.experience?.map((exp, idx) => {
              // Parse achievements into bullet points cleanly
              const bullets = exp.description 
                ? exp.description.split('\n').map(b => b.replace(/^[•\-\*\s]+/, '').trim()).filter(Boolean) 
                : [];

              return (
                <div key={idx} style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1rem', color: '#1e293b' }}>
                    <span>{exp.role}</span>
                    <span style={{ color: '#475569', fontSize: '0.9rem', fontWeight: '500' }}>
                      {exp.startDate} &mdash; {exp.endDate}
                    </span>
                  </div>
                  <div style={{ color: '#0ea5e9', fontSize: '0.9rem', fontWeight: 'bold', marginTop: '2px' }}>
                    {exp.company}
                  </div>
                  <ul style={{ paddingLeft: '20px', margin: '8px 0 0 0', fontSize: '0.9rem', color: '#334155', lineHeight: '1.6' }}>
                    {bullets.map((bullet, bulletIdx) => (
                      <li key={bulletIdx} style={{ marginBottom: '4px' }}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Education Section */}
          {cvDetails.education && cvDetails.education.length > 0 && (
            <div>
              <h3 style={{ color: '#0ea5e9', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #cbd5e1', paddingBottom: '5px', margin: '0 0 12px 0', fontWeight: 'bold' }}>
                Education
              </h3>
              {cvDetails.education.map((edu, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#334155', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{edu.degree}</span>
                    <span style={{ color: '#64748b' }}> &bull; {edu.school}</span>
                  </div>
                  <span style={{ color: '#475569', fontWeight: '500' }}>Graduated {edu.year}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
