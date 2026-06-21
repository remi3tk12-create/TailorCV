import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import SkillsInput from '../components/SkillsInput';
import ExperienceForm from '../components/ExperienceForm';

export default function CreateCVPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');

  // Form Fields
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyWebsiteUrl, setCompanyWebsiteUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  
  // Custom personal info inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [usePlaceholders, setUsePlaceholders] = useState(false);

  // Dynamic Lists
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([
    {
      role: '',
      company: '',
      startDate: '',
      endDate: '',
      description: ''
    }
  ]);
  const [education, setEducation] = useState([
    {
      degree: '',
      school: '',
      year: ''
    }
  ]);

  // Loading steps to show progress engagingly
  const loadingSteps = [
    "Scanning the company's website for brand mission & keywords...",
    "Analyzing target job description for critical candidate criteria...",
    "Tailoring your professional summary to align with the role...",
    "Refining experience bullet points with impact-driven action verbs...",
    "Formatting resume elements to strict single-column ATS specifications...",
    "Finalizing document structures for high fidelity PDF output..."
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
      }, 3000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Handle dynamic education changes
  const handleEduChange = (index, field, value) => {
    const updatedEdu = education.map((edu, idx) => {
      if (idx === index) {
        return { ...edu, [field]: value };
      }
      return edu;
    });
    setEducation(updatedEdu);
  };

  const handleAddEdu = () => {
    setEducation([...education, { degree: '', school: '', year: '' }]);
  };

  const handleRemoveEdu = (index) => {
    setEducation(education.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (skills.length === 0) {
      setError('Please add at least one core skill.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setError('');

    // If using placeholders, pass empty values so backend defaults to [NAME/EMAIL TO BE FILLED IN]
    const finalName = usePlaceholders ? '' : name;
    const finalEmail = usePlaceholders ? '' : email;

    const payload = {
      jobTitle,
      companyName,
      companyWebsiteUrl,
      jobDescription,
      skills,
      experience: experiences,
      education,
      name: finalName,
      email: finalEmail
    };

    try {
      const response = await client.post('/cv/generate', payload);

      if (response.data && response.data.cvId) {
        setLoading(false);
        navigate(`/preview/${response.data.cvId}`);
      } else {
        throw new Error('No CV ID returned from server.');
      }
    } catch (err) {
      console.error('CV Generation failed:', err);
      
      const serverMessage = err.response?.data?.message || err.response?.data?.error;
      const displayError = serverMessage 
        ? `${serverMessage}` 
        : 'Failed to communicate with the tailoring engine. Redirecting to mock CV preview fallback in 4 seconds...';
      
      setError(displayError);
      setLoading(false);

      // Scroll to error
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // On failure: show error message, fallback to mock data after timeout
      setTimeout(() => {
        navigate('/preview/mock-cv');
      }, 4000);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '30px' }}>
        <Link to="/dashboard" style={{ color: '#0ea5e9', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.95rem' }}>
          &larr; Back to Dashboard
        </Link>
        <h2 style={{ color: '#0f172a', marginTop: '15px', fontSize: '1.875rem', fontWeight: 'bold' }}>Tailor a New CV</h2>
        <p style={{ color: '#64748b', marginTop: '5px', fontSize: '0.95rem' }}>
          Customize your resume perfectly for your next target position.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
          {/* Animated Spinner */}
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #e2e8f0',
            borderTop: '5px solid #0ea5e9',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <h3 style={{ color: '#0ea5e9', fontSize: '1.25rem', fontWeight: 'bold', margin: '10px 0 0 0' }}>
            Adapting and Restructuring...
          </h3>
          <p style={{ color: '#475569', fontSize: '1rem', maxWidth: '500px', lineHeight: '1.5', minHeight: '3em' }}>
            {loadingSteps[loadingStep]}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {error && (
            <div style={{ padding: '15px', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '8px', fontSize: '0.95rem', border: '1px solid #fee2e2', fontWeight: 'bold', lineHeight: '1.5' }}>
              {error}
            </div>
          )}

          {/* SECTION 1: Target Position Details */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '25px' }}>
            <h3 style={{ color: '#0ea5e9', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              1. Target Position details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#475569' }}>Target Job Title *</label>
                  <input 
                    type="text" 
                    value={jobTitle} 
                    onChange={(e) => setJobTitle(e.target.value)} 
                    required 
                    placeholder="e.g. Senior Frontend Engineer" 
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#475569' }}>Target Company Name *</label>
                  <input 
                    type="text" 
                    value={companyName} 
                    onChange={(e) => setCompanyName(e.target.value)} 
                    required 
                    placeholder="e.g. Stripe" 
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#475569' }}>Company Website URL (for web scraping context)</label>
                <input 
                  type="url" 
                  value={companyWebsiteUrl} 
                  onChange={(e) => setCompanyWebsiteUrl(e.target.value)} 
                  placeholder="e.g. https://stripe.com" 
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Target Job Description */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '25px' }}>
            <h3 style={{ color: '#0ea5e9', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              2. Target Job Description
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#475569' }}>Paste Target Job Description *</label>
              <textarea 
                rows={6} 
                value={jobDescription} 
                onChange={(e) => setJobDescription(e.target.value)} 
                required 
                placeholder="Paste the full job offer description here. The AI will scan it to optimize keywords and tailor your achievements..." 
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'sans-serif', resize: 'vertical' }}
              />
            </div>
          </div>

          {/* SECTION 3: Core Skills */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '25px' }}>
            <h3 style={{ color: '#0ea5e9', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              3. Core Skills
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '-10px 0 15px 0' }}>
              Add critical keywords and technologies (press enter, space, or click add). At least one skill is required.
            </p>
            <SkillsInput value={skills} onChange={setSkills} />
          </div>

          {/* SECTION 4: Professional Experiences */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '25px' }}>
            <h3 style={{ color: '#0ea5e9', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              4. Professional Experiences
            </h3>
            <ExperienceForm value={experiences} onChange={setExperiences} />
          </div>

          {/* SECTION 5: Education History */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '25px' }}>
            <h3 style={{ color: '#0ea5e9', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              5. Education History
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {education.map((edu, index) => (
                <div key={index} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#1e293b' }}>Education Entry #{index + 1}</span>
                    <button type="button" onClick={() => handleRemoveEdu(index)} style={{ padding: '2px 8px', backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>
                      Remove
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '10px' }}>
                    <input 
                      type="text" 
                      placeholder="Degree (e.g. B.S. CS)" 
                      value={edu.degree} 
                      onChange={(e) => handleEduChange(index, 'degree', e.target.value)} 
                      required 
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} 
                    />
                    <input 
                      type="text" 
                      placeholder="School Name" 
                      value={edu.school} 
                      onChange={(e) => handleEduChange(index, 'school', e.target.value)} 
                      required 
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} 
                    />
                    <input 
                      type="text" 
                      placeholder="Year" 
                      value={edu.year} 
                      onChange={(e) => handleEduChange(index, 'year', e.target.value)} 
                      required 
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} 
                    />
                  </div>
                </div>
              ))}
              <button onClick={handleAddEdu} type="button" style={{ alignSelf: 'flex-start', padding: '8px 16px', backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 'bold' }}>
                + Add Education History
              </button>
            </div>
          </div>

          {/* SECTION 6: Personal Info & Privacy Options */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '30px' }}>
            <h3 style={{ color: '#0ea5e9', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              6. Personal info / Privacy Options
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {/* Checkbox Toggle for placeholders */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', color: '#334155', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={usePlaceholders} 
                  onChange={(e) => setUsePlaceholders(e.target.checked)} 
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 'bold' }}>Keep my contact details blank (uses placeholders)</span>
              </label>
              
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '-5px 0 5px 0' }}>
                Checking this protects your privacy by printing placeholders (e.g. "[NAME - TO BE FILLED IN]") inside the generated PDF so you can manually write them later.
              </p>

              {!usePlaceholders && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', animation: 'fadeIn 0.2s ease' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#475569' }}>Candidate Full Name *</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required 
                      placeholder="e.g. John Doe" 
                      style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#475569' }}>Candidate Contact Email *</label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      placeholder="e.g. john.doe@email.com" 
                      style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <button 
            type="submit" 
            style={{ 
              padding: '16px', 
              backgroundColor: '#0ea5e9', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              cursor: 'pointer', 
              fontSize: '1.05rem', 
              boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.3)',
              transition: 'background-color 0.2s'
            }}
          >
            Adapt & Restructure My CV
          </button>
        </form>
      )}
    </div>
  );
}
