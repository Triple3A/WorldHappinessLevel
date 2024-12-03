import React, { useState } from "react";
import * as d3 from "d3";

const features = ["GDP", "support", "health", "freedom", "generosity", "corruption"] as const;
type Feature = typeof features[number];

const data = [
  { country: "Luxembourg", GDP: 1.2, support: 1.0, health: 0.9, freedom: 0.8, generosity: 0.7, corruption: 0.6 },
  { country: "Ireland", GDP: 1.1, support: 0.9, health: 0.8, freedom: 0.7, generosity: 0.6, corruption: 0.5 },
  { country: "Germany", GDP: 3.0, support: 0.8, health: 0.7, freedom: 0.6, generosity: 0.5, corruption: 0.4 },
  { country: "United Kingdom", GDP: 0.9, support: 0.7, health: 0.6, freedom: 0.5, generosity: 0.4, corruption: 0.3 },
  { country: "Belgium", GDP: 0.8, support: 0.6, health: 0.5, freedom: 0.4, generosity: 0.3, corruption: 0.2 },
  { country: "Chile", GDP: 0.7, support: 0.5, health: 0.4, freedom: 0.3, generosity: 0.2, corruption: 0.1 },
];

const BarChart: React.FC = () => {
  const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([...features]);

  const handleFeatureToggle = (feature: Feature) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  };

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
    .domain([0, 6]) // Fixed x-axis range to [0, 6]
    .range([0, width - margin.left - margin.right]);

  const yScale = d3
    .scaleBand()
    .domain(sortedData.map((d) => d.country))
    .range([0, height - margin.top - margin.bottom])
    .padding(0.2);

  const colors = {
    GDP: "blue",
    support: "orange",
    health: "green",
    freedom: "red",
    generosity: "purple",
    corruption: "brown",
  };

  return (
    <div>
      {/* Feature Toggle */}
      <div>
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
