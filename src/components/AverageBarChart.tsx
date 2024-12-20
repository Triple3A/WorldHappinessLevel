import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface HappinessData {
  GDP: number;
  social_support: number;
  healthy_life_expectency: number;
  freedom: number;
  generosity: number;
  corruption: number;
}

interface AverageBarChartProps {
  data: HappinessData[];
}

const factors = [
  { key: 'GDP', label: 'GDP' },
  { key: 'social_support', label: 'Social Support' },
  { key: 'healthy_life_expectency', label: 'Healthy Life Expectancy' },
  { key: 'freedom', label: 'Freedom' },
  { key: 'generosity', label: 'Generosity' },
  { key: 'corruption', label: 'Corruption' },
];

const AverageBarChart: React.FC<AverageBarChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 500;
    const margin = { top: 20, right: 30, bottom: 50, left: 150 };

    // Clear previous contents
    svg.selectAll('*').remove();

    // Filter the top 25 happiest countries
    const top25Countries = [...data].slice(0, 25);

    // Calculate the average of each factor for top 25 countries
    const averagesTop25 = factors.map((factor) => ({
      key: factor.key,
      label: factor.label,
      value: d3.mean(top25Countries, (d) => d[factor.key]) || 0,
    }));

    // Calculate the average of each factor for all countries
    const averagesGlobal = factors.map((factor) => ({
      key: factor.key,
      label: factor.label,
      value: d3.mean(data, (d) => d[factor.key]) || 0,
    }));

    const maxValue = Math.max(
      d3.max(averagesTop25, (d) => d.value) || 1,
      d3.max(averagesGlobal, (d) => d.value) || 1
    );

    // Set up scales
    const xScale = d3
      .scaleLinear()
      .domain([0, maxValue])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleBand()
      .domain(averagesTop25.map((d) => d.label))
      .range([margin.top, height - margin.bottom])
      .padding(0.4); // Space between bars

    // Create axes
    const xAxis = (g: any) =>
      g
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickFormat((d) => `${((d as number) / maxValue * 100).toFixed(0)}%`))
        .append('text')
        .attr('x', width / 2)
        .attr('y', margin.bottom - 10)
        .attr('fill', 'black')
        .style('text-anchor', 'middle')
        .text('Effect on Happiness');

    const yAxis = (g: any) =>
      g
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));

    // Draw bars for top 25 averages
    svg
      .selectAll('.bar-top25')
      .data(averagesTop25)
      .join('rect')
      .attr('class', 'bar-top25')
      .attr('x', margin.left)
      .attr('y', (d) => yScale(d.label)!)
      .attr('width', (d) => xScale(d.value) - margin.left)
      .attr('height', yScale.bandwidth() / 2) // Half the height for better visibility
      .attr('fill', '#4CAF50'); // Green for top 25 averages

    // Draw bars for global averages
    svg
      .selectAll('.bar-global')
      .data(averagesGlobal)
      .join('rect')
      .attr('class', 'bar-global')
      .attr('x', margin.left)
      .attr('y', (d) => (yScale(d.label)! + yScale.bandwidth() / 2)) // Below the top 25 bar
      .attr('width', (d) => xScale(d.value) - margin.left)
      .attr('height', yScale.bandwidth() / 2) // Half the height for better visibility
      .attr('fill', '#2196F3'); // Blue for global averages

    // Add tooltips
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'white')
      .style('padding', '8px')
      .style('border', '1px solid #ccc')
      .style('border-radius', '4px')
      .style('pointer-events', 'none');

    svg
      .selectAll('rect')
      .on('mouseover', (event, d: any) => {
        tooltip
          .html(
            `<strong>${d.label}</strong><br>
            Average Value: ${d.value.toFixed(2)}`
          )
          .style('opacity', 1)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY + 10}px`);
      })
      .on('mousemove', (event) => {
        tooltip.style('left', `${event.pageX + 10}px`).style('top', `${event.pageY + 10}px`);
      })
      .on('mouseout', () => {
        tooltip.style('opacity', 0);
      });

    // Render axes
    svg.append('g').call(xAxis);
    svg.append('g').call(yAxis);

    return () => {
      tooltip.remove();
    };
  }, [data]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <h3>Average of Each Factor in Top 25 Countries vs Global Averages</h3>
      <svg ref={svgRef} width={800} height={500}></svg>
      <p style={{ marginTop: '10px' }}>
        <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>Top 25 Average</span> | 
        <span style={{ color: '#2196F3', fontWeight: 'bold' }}> Global Average</span>
      </p>
    </div>
  );
};

export default AverageBarChart;
