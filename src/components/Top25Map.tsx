import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { HappinessDataBase } from '../types';

interface HappinessData extends HappinessDataBase {
  GDP: number;
  social_support: number;
  healthy_life_expectency: number;
  freedom: number;
  generosity: number;
  corruption: number;
}

interface BubbleChartProps {
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

const Top25Map: React.FC<BubbleChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [currentFactor, setCurrentFactor] = useState(factors[0].key); // Default to GDP

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 500;

    // Clear previous contents
    svg.selectAll('*').remove();

    // Filter the top 25 happiest countries
    const top25Countries = [...data]
      .sort((a, b) => b.ladderScore - a.ladderScore)
      .slice(0, 25);

    // Set up scales
    const sizeScale = d3
      .scaleSqrt()
      .domain(
        d3.extent(top25Countries, (d) => d[currentFactor]) as [number, number]
      )
      .range([10, 80]);

    const colorScale = d3
      .scaleSequential(d3.interpolateYlGn)
      .domain(d3.extent(top25Countries, (d) => d[currentFactor]) as [number, number]);

    // Create a simulation for packed bubble layout
    const pack = d3.pack()
      .size([width, height])
      .padding(2);

    const root = d3
      .hierarchy({ children: top25Countries })
      .sum((d: any) => sizeScale(d[currentFactor]));

    const nodes = pack(root).leaves();

    // Draw circles
    svg
      .selectAll('.bubble')
      .data(nodes)
      .join('circle')
      .attr('class', 'bubble')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', (d) => d.r)
      .attr('fill', (d) => colorScale((d.data as HappinessData)[currentFactor]))
      .attr('stroke', '#000');

    // Add country names inside circles
    svg
      .selectAll('.label')
      .data(nodes)
      .join('foreignObject')
      .attr('class', 'label')
      .attr('x', (d) => d.x - d.r * 0.8)
      .attr('y', (d) => d.y - d.r * 0.8)
      .attr('width', (d) => d.r * 1.6)
      .attr('height', (d) => d.r * 1.6)
      .append('xhtml:div')
      .style('width', '100%')
      .style('height', '100%')
      .style('display', 'flex')
      .style('justify-content', 'center')
      .style('align-items', 'center')
      .style('text-align', 'center')
      .style('font-size', '10px')
      .style('color', 'black')
      .style('overflow', 'hidden')
      .text((d) => (d.data as HappinessData).country);

    // Tooltip
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
      .selectAll('.bubble')
      .on('mouseover', (event, d) => {
        const data = d.data as HappinessData;
        tooltip
          .html(
            `<strong>${data.country}</strong><br>
            ${factors.find((f) => f.key === currentFactor)?.label}: ${data[currentFactor].toFixed(
              2
            )}`
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

    // Add legend
    const legendWidth = 200;
    const legendHeight = 20;
    const legendX = width - legendWidth - 50;
    const legendY = height - 50;

    const defs = svg.append('defs');
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'legend-gradient')
      .attr('x1', '0%')
      .attr('x2', '100%')
      .attr('y1', '0%')
      .attr('y2', '0%');

    const colorRange = d3.range(0, 1.01, 0.1).map((t) =>
      colorScale(
        t * (colorScale.domain()[1] - colorScale.domain()[0]) +
          colorScale.domain()[0]
      )
    );

    colorRange.forEach((color, i) => {
      gradient
        .append('stop')
        .attr('offset', `${(i / (colorRange.length - 1)) * 100}%`)
        .attr('stop-color', color);
    });

    svg
      .append('rect')
      .attr('x', legendX)
      .attr('y', legendY)
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#legend-gradient)')
      .on('click', () => {
        // Switch to the next factor on click
        setCurrentFactor((prev) => {
          const currentIndex = factors.findIndex((f) => f.key === prev);
          return factors[(currentIndex + 1) % factors.length].key;
        });
      });

    svg
      .append('text')
      .attr('x', legendX + legendWidth / 2)
      .attr('y', legendY - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text(`${factors.find((f) => f.key === currentFactor)?.label}`);

    return () => {
      tooltip.remove();
    };
  }, [data, currentFactor]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <h3>Factor: {factors.find((f) => f.key === currentFactor)?.label}</h3>
      <svg ref={svgRef} width={800} height={500}></svg>
    </div>
  );
};

export default Top25Map;
