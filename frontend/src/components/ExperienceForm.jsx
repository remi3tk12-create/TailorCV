import React from 'react';

export default function ExperienceForm({ value = [], onChange }) {
  
  const handleFieldChange = (index, field, fieldValue) => {
    const updatedExperiences = value.map((exp, idx) => {
      if (idx === index) {
        return { ...exp, [field]: fieldValue };
      }
      return exp;
    });
    onChange(updatedExperiences);
  };

  const handleAddExperience = (e) => {
    e.preventDefault();
    const newExperience = {
      role: '',
      company: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    onChange([...value, newExperience]);
  };

  const handleRemoveExperience = (index, e) => {
    e.preventDefault();
    const updatedExperiences = value.filter((_, idx) => idx !== index);
    onChange(updatedExperiences);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {value.map((exp, index) => (
        <div 
          key={index} 
          style={{ 
            padding: '20px', 
            border: '1px solid #cbd5e1', 
            borderRadius: '8px', 
            backgroundColor: '#f8fafc',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {/* Card Title & Remove Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1rem', fontWeight: 'bold' }}>
              Experience #{index + 1}
            </h4>
            <button
              onClick={(e) => handleRemoveExperience(index, e)}
              type="button"
              style={{
                padding: '4px 10px',
                backgroundColor: '#fee2e2',
                color: '#ef4444',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Remove
            </button>
          </div>

          {/* Job Title & Company Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569' }}>Job Title *</label>
              <input
                type="text"
                value={exp.role}
                onChange={(e) => handleFieldChange(index, 'role', e.target.value)}
                required
                placeholder="e.g. Senior Software Engineer"
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569' }}>Company *</label>
              <input
                type="text"
                value={exp.company}
                onChange={(e) => handleFieldChange(index, 'company', e.target.value)}
                required
                placeholder="e.g. Google"
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          {/* Dates Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569' }}>Start Date *</label>
              <input
                type="text"
                value={exp.startDate}
                onChange={(e) => handleFieldChange(index, 'startDate', e.target.value)}
                required
                placeholder="e.g. Jan 2023 or 2023-01"
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569' }}>End Date *</label>
              <input
                type="text"
                value={exp.endDate}
                onChange={(e) => handleFieldChange(index, 'endDate', e.target.value)}
                required
                placeholder="e.g. Present or Dec 2024"
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          {/* Description Textarea */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569' }}>Description / Achievements *</label>
            <textarea
              rows={4}
              value={exp.description}
              onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
              required
              placeholder="Describe your role and key accomplishments (use action verbs or bullet points)..."
              style={{ 
                padding: '10px', 
                borderRadius: '6px', 
                border: '1px solid #cbd5e1', 
                fontSize: '0.9rem',
                fontFamily: 'sans-serif',
                resize: 'vertical'
              }}
            />
          </div>
        </div>
      ))}

      {/* Add Experience Button */}
      <button
        onClick={handleAddExperience}
        type="button"
        style={{
          padding: '10px 16px',
          backgroundColor: '#f1f5f9',
          color: '#0f172a',
          border: '1px dashed #cbd5e1',
          borderRadius: '8px',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: '0.9rem',
          textAlign: 'center',
          transition: 'background-color 0.2s'
        }}
      >
        + Add Experience Entry
      </button>
    </div>
  );
}
