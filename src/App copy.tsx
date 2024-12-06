import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import WorldMap from './components/WorldMap';
import WorldMapNoTime from './components/WorldMapNoTime';
import Animation from './components/Animation';
import BarChart from './components/BarChart';
import TimeSlider from './components/TimeSlider';
import { HappinessDataBase } from './types';

interface HappinessData extends HappinessDataBase {
  // upperwhisker: number;
  // lowerwhisker: number;
  dystopia: number;
}

interface HappinessWithYear extends HappinessDataBase {
  year: number;
  positiveEffect: number;
  negativeEffect: number;
}

const App: React.FC = () => {
  const empty = {} as HappinessData;
  empty.ladderScore = 0;
  const [data, setData] = useState<HappinessData[]>([]);
  const [dataWithYear, setDataWithYear] = useState<HappinessWithYear[]>([]);
  const [year, setYear] = useState(2023); // Default year
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCountry, setCountry] = useState<HappinessData>(empty);

  const handleYearChange = (newYear: number) => {
    setYear(newYear); // Update the state with the selected year
  };

  const handleSelectedCountry = (country: HappinessData) => {
    setCountry(country);
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const csvData = await d3.csv('../data/happinessLevel.csv', d => ({
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
        const csvData = await d3.csv('../data/DataForTable.csv', d => ({
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

  // Filter data by the selected year
  const filteredData = dataWithYear.filter(d => d.year === year);

  return (
    <div id="main-container" style={{ padding: '20px' }}>
      <h1>World Happiness Map</h1>
      <h2>Let's first take a glance at how happy people have been in the past three years!</h2>
      {loadError ? (
        <p style={{ color: 'red' }}>{loadError}</p>
      ) : data.length > 0 ? (
        <WorldMapNoTime data={data} />
      ) : (
        <p>Loading happiness data...</p>
      )}
      <br/>
      <br/>
      <br/>
      <br/>
      {/* <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/> */}
      {dataWithYear.length > 0 ? (
        <>
          <Animation dataWithYear={dataWithYear} />
          <h2 style={{ marginTop: '60px' }}>Selected Year: {year}</h2>
          <TimeSlider onYearChange={handleYearChange} newYear={year} />
          <WorldMap data={data} dataWithYear={filteredData} currentYear={year} onSelectCountry={handleSelectedCountry}/>
        </>
      ) : (
        <p>Loading year-specific data...</p>
      )}

      <BarChart data={data} selectedCountry={selectedCountry}/>
    </div>
  );
};

export default App;