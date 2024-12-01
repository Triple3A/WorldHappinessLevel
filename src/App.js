import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import WorldMap from "./components/WorldMap";

const App = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Load happiness data
    d3.csv("/happiness.csv", d3.autoType).then((csvData) => {
      setData(csvData);
    });
  }, []);

  return (
    <div>
      <h1>World Happiness Map</h1>
      {data.length > 0 ? <WorldMap data={data} /> : <p>Loading data...</p>}
    </div>
  );
};

export default App;
