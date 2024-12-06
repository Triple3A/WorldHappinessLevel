import React, { useState } from 'react';

interface UserInputProps {
  onSubmit: (userData: {
    residingCountry: string;
    preferredCountries: string[];
    confidenceLevel: number;
  }) => void;
  onSkip: () => void;
  countries: string[]; // List of country names passed from App
}

const UserInputPage: React.FC<UserInputProps> = ({ onSubmit, onSkip, countries }) => {
  const [residingCountry, setResidingCountry] = useState('');
  const [preferredCountries, setPreferredCountries] = useState<string[]>(['', '', '']);
  const [confidenceLevel, setConfidenceLevel] = useState(5);

  const handlePreferredCountryChange = (index: number, value: string) => {
    const updatedCountries = [...preferredCountries];
    updatedCountries[index] = value;
    setPreferredCountries(updatedCountries);
  };

  const handleSubmit = () => {
    if (residingCountry && preferredCountries.every((country) => country.trim())) {
      onSubmit({ residingCountry, preferredCountries, confidenceLevel });
    } else {
      alert('Please select all fields.');
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url('/data/happy.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          width: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          textAlign: 'center',
        }}
      >
        <h1 style={{ color: '#4a90e2', marginBottom: '10px' }}>Evaluation</h1>
        <p style={{ color: '#555', marginBottom: '20px', lineHeight: '1.5' }}>
          Please provide your country preferences based on the World Happiness Report.
        </p>

        {/* Residing Country */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            Your Current Country of Residence:
          </label>
          <select
            value={residingCountry}
            onChange={(e) => setResidingCountry(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
          >
            <option value="" disabled>
              Select your country
            </option>
            {countries.map((country, index) => (
              <option key={index} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {/* Preferred Countries */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            Three Countries You'd Like to Live In:
          </label>
          {preferredCountries.map((country, index) => (
            <select
              key={index}
              value={country}
              onChange={(e) => handlePreferredCountryChange(index, e.target.value)}
              style={{
                width: '100%',
                marginBottom: '10px',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px',
              }}
            >
              <option value="" disabled>
                Select a country
              </option>
              {countries.map((c, i) => (
                <option key={i} value={c}>
                  {c}
                </option>
              ))}
            </select>
          ))}
        </div>

        {/* Confidence Level */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            Confidence in Choosing These Countries (1-10):
          </label>
          <input
            type="number"
            value={confidenceLevel}
            onChange={(e) => setConfidenceLevel(Number(e.target.value))}
            min="1"
            max="10"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
          />
        </div>

        {/* Submit and Skip Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
          <button
            onClick={handleSubmit}
            style={{
              backgroundColor: '#4a90e2',
              color: '#fff',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#357ab8')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4a90e2')}
          >
            Submit
          </button>
          <button
            onClick={onSkip}
            style={{
              backgroundColor: '#ccc',
              color: '#333',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#bbb')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ccc')}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInputPage;
