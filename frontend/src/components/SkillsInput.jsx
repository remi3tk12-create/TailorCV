import React, { useState } from 'react';

export default function SkillsInput({ value = [], onChange }) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    // Check for Enter or Space keys
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); // Prevent accidental form submission
      
      const skill = inputValue.trim();
      if (skill && !value.includes(skill)) {
        const updatedSkills = [...value, skill];
        onChange(updatedSkills);
        setInputValue('');
      }
    }
  };

  const handleAddClick = (e) => {
    e.preventDefault();
    const skill = inputValue.trim();
    if (skill && !value.includes(skill)) {
      const updatedSkills = [...value, skill];
      onChange(updatedSkills);
      setInputValue('');
    }
  };

  const handleRemove = (skillToRemove) => {
    const updatedSkills = value.filter(s => s !== skillToRemove);
    onChange(updatedSkills);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type skill & press Enter/Space"
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            outline: 'none',
            fontFamily: 'sans-serif'
          }}
        />
        <button
          onClick={handleAddClick}
          type="button"
          style={{
            padding: '10px 16px',
            backgroundColor: '#0ea5e9',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Add
        </button>
      </div>

      {/* Skills Pills List */}
      {value.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
          {value.map((skill, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#e0f2fe',
                color: '#0369a1',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                border: '1px solid #bae6fd'
              }}
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleRemove(skill)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0ea5e9',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: '1'
                }}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
