import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import WorldMap from './components/WorldMap';
import { HappinessDataBase } from './types';
import TimeSlider from './components/TimeSlider';

interface HappinessData extends HappinessDataBase {
  upperwhisker: number;
  lowerwhisker: number;
  dystopia: number;
}

interface HappinessWithYear extends HappinessDataBase {
  year: number;
  positiveEffect: number;
  negativeEffect: number;
}


const App: React.FC = () => {
  const [data, setData] = useState<HappinessData[]>([]);
  const [dataWithYear, setDataWithYear] = useState<HappinessWithYear[]>([]);
  const [year, setYear] = useState(2023); // Default year

  const handleYearChange = (newYear: number) => {
    setYear(newYear); // Update the state with the selected year
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const csvData = await d3.csv('../data/happinessLevel.csv', d => ({
          country: d['Country'],
          ladderScore: +d['Ladder score'],
          upperwhisker: +d['upperwhisker'],
          lowerwhisker: +d['lowerwhisker'],
          gdp: +d['Explained by: Log GDP per capita'],
          socialSupport: +d['Explained by: Social support'],
          lifeExpectency: +d['Explained by: Healthy life expectancy'],
          freedom: +d['Explained by: Freedom to make life choices'],
          generosity: +d['Explained by: Generosity'],
          corruption:	+d['Explained by: Perceptions of corruption'],
          dystopia:	+d['Dystopia + residual']
        }));

        setData(csvData);
      } catch (error) {
        console.error('Error loading CSV file:', error);
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
          gdp: +d['Log GDP per capita'],
          socialSupport: +d['Social support'],
          lifeExpectency: +d['Healthy life expectancy at birth'],
          freedom: +d['Freedom to make life choices'],
          generosity: +d['Generosity'],
          corruption:	+d['Perceptions of corruption'],
          positiveEffect:	+d['Positive affect'],
          negativeEffect: +d['Negative affect']
        }));
        
        setDataWithYear(csvData);
      } catch (error) {
        console.error('Error loading CSV file:', error);
      }
    };

    loadDataWithYear();
  }, []);

  return (
    <div id="main-container">
      <h1>World Happiness Map</h1> {/* Title in black */}
      <h2>Selected Year: {year}</h2>
      <TimeSlider onYearChange={handleYearChange} newYear={year} />
      {data.length > 0 ? <WorldMap data={data} dataWithYear={dataWithYear} currentYear={year} /> : <p>Loading data...</p>}
    </div>
  );
};

export default App;
