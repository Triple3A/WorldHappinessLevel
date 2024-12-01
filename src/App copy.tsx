// src/App.tsx
import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import WorldMap from './components/WorldMap';

interface HappinessData {
  Country: string;
  'Ladder score': number;
  [key: string]: any; // For any additional properties
}

const App: React.FC = () => {
  const [data, setData] = useState<HappinessData[]>([]);

  useEffect(() => {
    // Load CSV file
    d3.csv('/happiness.csv', d3.autoType).then((csvData) => {
      const typedData = csvData as HappinessData[];
      setData(typedData);
    });
    console.log(data);
  }, []);

  return (
    <div>
      <h1>World Happiness Map</h1>
      {data.length > 0 ? <WorldMap data={data} /> : <p>Loading data...</p>}
    </div>
  );
};

export default App;
