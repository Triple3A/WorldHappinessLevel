import React, { useState } from "react";
import * as d3 from "d3";
import { HappinessDataBase } from "../types";

const features = ["GDP", "support", "health", "freedom", "generosity", "corruption", "dystopia"] as const;
type Feature = typeof features[number];

const data = [
  { country: "Finland", GDP: 1.844, support: 1.572, health: 0.695, freedom: 0.859, generosity: 0.142, corruption: 0.546, dystopia: 2.082 },
  { country: "Denmark", GDP: 1.908, support: 1.520, health: 0.699, freedom: 0.823, generosity: 0.204, corruption: 0.548, dystopia: 1.881},
  { country: "Iceland", GDP: 1.881, support: 1.617, health: 0.718, freedom: 0.819, generosity: 0.258, corruption: 0.182, dystopia: 2.050},
  { country: "Sweden", GDP: 1.878, support: 1.501, health: 0.724, freedom: 0.838, generosity: 0.221, corruption: 0.524, dystopia: 1.658 },
  { country: "Israel", GDP: 1.803, support: 1.513, health: 0.740, freedom: 0.641, generosity: 0.153, corruption: 0.193, dystopia: 2.298 },
  { country: "United States", GDP: 1.939, support: 1.392, health: 0.542, freedom: 0.586, generosity: 0.223, corruption: 0.169, dystopia: 1.873 },
];

interface HappinessWithYear extends HappinessDataBase {
  year: number;
  positiveEffect: number;
  negativeEffect: number;
}

interface WorldMapProps {
  dataWithYear: HappinessWithYear[];
  currentYear: number;
}

const getTopCountries = (
  dataWithTime: HappinessWithYear[],
  currentYear: number
): { country: string; ladderScore: number }[] => {
  return dataWithTime
    .filter((entry) => entry.year === currentYear) // Filter data for the current year
    .sort((a, b) => b.ladderScore - a.ladderScore) // Sort in descending order of ladderScore
    .slice(0, 5) // Take the top 5 entries
};

const BarChart: React.FC<WorldMapProps> = ({ dataWithYear, currentYear }) => {
  const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([...features]);

  const handleFeatureToggle = (feature: Feature) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  };

  // Example usage:
  const topCountries = getTopCountries(dataWithYear, currentYear);
  console.log(topCountries);
  
  const usaData = dataWithYear.find(
    (c) => c.country === 'United States of America' && c.year === currentYear
  );

  console.log(usaData);

  // const data = topCountries.concat(usaData);

  // Dynamically calculate scores based on selected features
  const sortedData = data
    .map((d) => ({
      ...d,
      total: selectedFeatures.reduce((sum, feature) => sum + d[feature], 0),
    }))
    .sort((a, b) => b.total - a.total);

  // Set chart dimensions and scales
  const width = 800;
  const height = 400;
  const margin = { top: 50, right: 100, bottom: 50, left: 150 };

  const xScale = d3
    .scaleLinear()
    .domain([0, 8]) // Fixed x-axis range to [0, 6]
    .range([0, width - margin.left - margin.right]);

  const yScale = d3
    .scaleBand()
    .domain(sortedData.map((d) => d.country))
    .range([0, height - margin.top - margin.bottom])
    .padding(0.2);

  const colors = {
    GDP: "blue",
    support: "brown",
    health: "green",
    freedom: "orange",
    generosity: "l-green",
    corruption: "red",
    dystopia: "purple"
  };

  return (
    <div>
      {/* Feature Toggle */}
      <div>
        <h2>Feature Analysis</h2>
        {features.map((feature) => (
          <label key={feature} style={{ marginRight: "10px" }}>
            <input
              type="checkbox"
              checked={selectedFeatures.includes(feature)}
              onChange={() => handleFeatureToggle(feature)}
            />
            <span style={{ color: colors[feature] }}>{feature}</span>
          </label>
        ))}
      </div>

      {/* SVG Chart */}
      <svg width={width} height={height}>
        {/* Axes */}
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {yScale.domain().map((country, i) => (
            <text
              key={country}
              x={-10}
              y={(yScale(country) || 0) + yScale.bandwidth() / 2}
              textAnchor="end"
              alignmentBaseline="middle"
              fontSize="12"
            >
              {country}
            </text>
          ))}
          <line x1={0} y1={0} x2={0} y2={height - margin.top - margin.bottom} stroke="black" />
        </g>

        {/* Bars */}
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {sortedData.map((d) => {
            let cumulativeX = 0;
            return (
              <g key={d.country}>
                {selectedFeatures.map((feature) => {
                  const barWidth = xScale(d[feature]);
                  const bar = (
                    <rect
                      key={feature}
                      x={cumulativeX}
                      y={yScale(d.country)!}
                      width={barWidth}
                      height={yScale.bandwidth()}
                      fill={colors[feature]}
                    />
                  );
                  cumulativeX += barWidth;
                  return bar;
                })}
                {/* Show Total */}
                <text
                  x={cumulativeX + 5}
                  y={(yScale(d.country) || 0) + yScale.bandwidth() / 2}
                  alignmentBaseline="middle"
                  fontSize="12"
                >
                  {d.total.toFixed(2)}
                </text>
              </g>
            );
          })}
        </g>

        {/* X-axis */}
        <g transform={`translate(${margin.left}, ${height - margin.bottom})`}>
          <line x1={0} y1={0} x2={width - margin.left - margin.right} y2={0} stroke="black" />
          {xScale.ticks(5).map((tick) => (
            <text
              key={tick}
              x={xScale(tick)}
              y={15}
              textAnchor="middle"
              fontSize="12"
              fill="black"
            >
              {tick}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default BarChart;
