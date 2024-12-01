import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import WorldMap from './components/WorldMap';
import { HappinessData } from './types';

const App: React.FC = () => {
  const [data, setData] = useState<HappinessData[]>([]);

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

  return (
    <div id="main-container">
      <h1>World Happiness Map</h1> {/* Title in black */}
      {data.length > 0 ? <WorldMap data={data} /> : <p>Loading data...</p>}
    </div>
  );
};

export default App;
