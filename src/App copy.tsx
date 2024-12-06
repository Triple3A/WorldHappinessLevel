import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import WorldMap from './components/WorldMap';
import WorldMapNoTime from './components/WorldMapNoTime';
import Animation from './components/Animation';
import BarChart from './components/BarChart';
import TimeSlider from './components/TimeSlider';
import Top25Map from './components/Top25Map';
import AverageBarChart from './components/AverageBarChart';
import UserInputPage from './components/UserInputPage';
import { HappinessDataBase } from './types';

interface HappinessData extends HappinessDataBase {
  dystopia: number;
}

interface HappinessWithYear extends HappinessDataBase {
  year: number;
  positiveEffect: number;
  negativeEffect: number;
}
const downloadAllLocalStorage = () => {
  const keys = ['initialEvaluation', 'finalEvaluation'];
  const data = keys.reduce((acc, key) => {
    const value = localStorage.getItem(key);
    if (value) {
      acc[key] = JSON.parse(value);
    }
    return acc;
  }, {});

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'evaluationData.json';
  link.click();
};

const App: React.FC = () => {
  const empty = {} as HappinessData;
  empty.ladderScore = 0;
  const [data, setData] = useState<HappinessData[]>([]);
  const [dataWithYear, setDataWithYear] = useState<HappinessWithYear[]>([]);
  const [year, setYear] = useState(2023);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCountry, setCountry] = useState<HappinessData>(empty);
  const [userInputCompleted, setUserInputCompleted] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [userData, setUserData] = useState<{
    residingCountry: string;
    preferredCountries: string[];
    confidenceLevel: number;
  } | null>(null);

  const handleYearChange = (newYear: number) => setYear(newYear);
  const handleSelectedCountry = (country: HappinessData) => setCountry(country);

  // Save initial evaluation to local storage
  const handleUserInputSubmit = (data: {
    residingCountry: string;
    preferredCountries: string[];
    confidenceLevel: number;
  }) => {
    setUserData(data);
    localStorage.setItem('initialEvaluation', JSON.stringify(data)); // Save data to local storage
    setUserInputCompleted(true);
  };

  // Save final evaluation to local storage
  const handleFinalEvaluationSubmit = (data: {
    residingCountry: string;
    preferredCountries: string[];
    confidenceLevel: number;
  }) => {
    console.log('Final Evaluation Data:', data);
    localStorage.setItem('finalEvaluation', JSON.stringify(data)); // Save data to local storage
    setShowEvaluation(false);
  };

  // Load data from local storage on component mount
  useEffect(() => {
    const savedInitialEvaluation = localStorage.getItem('initialEvaluation');
    const savedFinalEvaluation = localStorage.getItem('finalEvaluation');

    if (savedInitialEvaluation) {
      console.log('Loaded Initial Evaluation from Local Storage:', JSON.parse(savedInitialEvaluation));
    }
    if (savedFinalEvaluation) {
      console.log('Loaded Final Evaluation from Local Storage:', JSON.parse(savedFinalEvaluation));
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const csvData = await d3.csv('../data/happinessLevel.csv', (d) => ({
          country: d['Country'],
          ladderScore: +d['Ladder score'],
          GDP: +d['Explained by: Log GDP per capita'],
          social_support: +d['Explained by: Social support'],
          healthy_life_expectency: +d['Explained by: Healthy life expectancy'],
          freedom: +d['Explained by: Freedom to make life choices'],
          generosity: +d['Explained by: Generosity'],
          corruption: +d['Explained by: Perceptions of corruption'],
          dystopia: +d['Dystopia + residual'],
        }));

        setData(csvData as HappinessData[]);
      } catch (error) {
        setLoadError('Failed to load happiness level data.');
        console.error(error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const loadDataWithYear = async () => {
      try {
        const csvData = await d3.csv('../data/DataForTable.csv', (d) => ({
          country: d['Country'],
          year: +d['year'],
          ladderScore: +d['Life Ladder'],
          GDP: +d['Log GDP per capita'],
          social_support: +d['Social support'],
          healthy_life_expectency: +d['Healthy life expectancy at birth'],
          freedom: +d['Freedom to make life choices'],
          generosity: +d['Generosity'],
          corruption: +d['Perceptions of corruption'],
          positiveEffect: +d['Positive affect'],
          negativeEffect: +d['Negative affect'],
        }));

        setDataWithYear(csvData as HappinessWithYear[]);
      } catch (error) {
        setLoadError('Failed to load data for year-specific table.');
        console.error(error);
      }
    };

    loadDataWithYear();
  }, []);

  const filteredData = dataWithYear.filter((d) => d.year === year);

  const countries = [...data.map((d) => d.country)].sort((a, b) => a.localeCompare(b));

  if (data.length === 0) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading happiness data...</p>
      </div>
    );
  }

  if (!userInputCompleted) {
    return (
      <UserInputPage
        onSubmit={handleUserInputSubmit}
        onSkip={() => setUserInputCompleted(true)}
        countries={countries}
      />
    );
  }

  if (showEvaluation) {
    return (
      <UserInputPage
        onSubmit={handleFinalEvaluationSubmit}
        onSkip={() => setShowEvaluation(false)}
        countries={countries}
      />
    );
  }

  return (
    <div
      id="main-container"
      style={{
        height: '100vh',
        overflowY: 'scroll',
        scrollSnapType: 'y mandatory',
      }}
    >
      <section style={{ height: '100vh', scrollSnapAlign: 'start', padding: '20px' }}>
        <h1>World Happiness Map</h1>
        <h2>Let's first take a glance at how happy people have been in the past three years!</h2>
        {loadError ? (
          <p style={{ color: 'red' }}>{loadError}</p>
        ) : data.length > 0 ? (
          <WorldMapNoTime data={data} />
        ) : (
          <p>Loading happiness data...</p>
        )}
      </section>

      <section style={{ height: '100vh', scrollSnapAlign: 'start', padding: '20px' }}>
        <h2>Top 25 Happiest Countries: Click on the legend</h2>
        {data.length > 0 ? (
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'space-between' }}>
            <Top25Map data={data} />
            <AverageBarChart data={data} />
          </div>
        ) : (
          <p>Loading bubble charts...</p>
        )}
      </section>

      <section style={{ height: '100vh', scrollSnapAlign: 'start', padding: '20px' }}>
        {dataWithYear.length > 0 ? (
          <>
            <Animation dataWithYear={dataWithYear} />
          </>
        ) : (
          <p>Loading year-specific data...</p>
        )}
      </section>

      <section style={{ height: '100vh', scrollSnapAlign: 'start', padding: '20px' }}>
        <h2 style={{ marginTop: '60px' }}>Selected Year: {year}</h2>
        <TimeSlider onYearChange={handleYearChange} newYear={year} />
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'space-between' }}>
          <WorldMap
            data={data}
            dataWithYear={filteredData}
            currentYear={year}
            onSelectCountry={handleSelectedCountry}
          />
          <BarChart data={data} selectedCountry={selectedCountry} />
        </div>
      </section>

      <section style={{ height: '100vh', scrollSnapAlign: 'start', padding: '20px', textAlign: 'center' }}>
        <button
          onClick={() => setShowEvaluation(true)}
          style={{
            backgroundColor: '#4a90e2',
            color: '#fff',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '20px',
          }}
        >
          Complete Final Evaluation
        </button>
        <button
          onClick={downloadAllLocalStorage}
          style={{
            backgroundColor: '#28a745',
            color: '#fff',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '20px',
            marginLeft: '10px',
          }}
        >
          Download Evaluation Data
        </button>
      </section>
    </div>
  );

};

export default App;
