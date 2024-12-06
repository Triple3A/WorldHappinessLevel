import React, { useState } from "react";
import * as d3 from "d3";
import { HappinessDataBase } from "../types";

const features = ["GDP", "social_support", "healthy_life_expectency", "freedom", "generosity", "corruption", "dystopia"] as const;
type Feature = typeof features[number];


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

interface BarChartProps {
  data: HappinessData[];
  selectedCountry: HappinessData;
  // dataWithYear: HappinessWithYear[];
  // currentYear: number;
}

const BarChart: React.FC<BarChartProps> = ({ data, selectedCountry }) => {
  const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([...features]);

  const handleFeatureToggle = (feature: Feature) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  };

  const getTopCountries = (
    data: HappinessData[],
    // currentYear: number
  ): HappinessData[] => {
    return data
      .filter((entry) => entry.ladderScore >= selectedCountry.ladderScore)
      // .filter((entry) => entry.year === currentYear) // Filter data for the current year
      .sort((a, b) => b.ladderScore - a.ladderScore) // Sort in descending order of ladderScore
      .slice(0, 20) // Take the top 5 entries
      .map((entry) => ({
        country: entry.country,
        ladderScore: entry.ladderScore,
        GDP: entry.GDP, 
        social_support: entry.social_support, 
        healthy_life_expectency: entry.healthy_life_expectency, 
        freedom: entry.freedom, 
        generosity: entry.generosity, 
        corruption: entry.corruption, 
        dystopia: entry.dystopia,
      })); // Extract relevant details
  };
  
  // Example usage:
  const topCountries = getTopCountries(data);
  console.log(topCountries);
  

  // Dynamically calculate scores based on selected features
  const sortedData = topCountries
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
    social_support: "brown",
    healthy_life_expectency: "green",
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
        <h3>Selected Country is: {selectedCountry.country}</h3>
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
