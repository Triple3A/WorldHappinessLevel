import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { FeatureCollection } from 'geojson';
import { HappinessDataBase } from '../types';

interface HappinessData extends HappinessDataBase {
  upperwhisker: number;
  lowerwhisker: number;
  dystopia: number;
}

interface WorldMapProps {
  data: HappinessData[];
}

const WorldMapNoTime: React.FC<WorldMapProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [showTop10, setShowTop10] = useState(false);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 500;

    d3.select(svgRef.current).selectAll('*').remove();
    d3.select('body').selectAll('.tooltip').remove();

    const projection = d3
      .geoMercator()
      .scale(120)
      .translate([width / 2, height / 1.5]);
    const path = d3.geoPath().projection(projection);

    d3.json('/countries-50m.json').then((worldData) => {
      const worldTopo = worldData as any;
      const countries = (topojson.feature(
        worldTopo,
        worldTopo.objects.countries
      ) as unknown as FeatureCollection).features;

      const colorScale = d3
        .scaleSequential((t) => d3.interpolateYlGnBu(1 - t))
        .domain([1.721, 7.741]);

      // Find the top 10 happiest countries
      const top10Countries = [...data]
        .sort((a, b) => b.ladderScore - a.ladderScore)
        .slice(0, 10);

      const top10CountryNames = top10Countries.map((d) => d.country);

      // Function to apply continuous blinking
      const applyBlinking = (selection: d3.Selection<SVGPathElement, any, any, any>) => {
        selection
          .transition()
          .duration(1000)
          .attr('fill', 'gold') // Blink to gold
          .transition()
          .duration(1000)
          .attr('fill', (d) => {
            const topoCountryName = (d.properties && d.properties.name) as string;
            const countryData = data.find((c) => c.country === topoCountryName);
            return countryData ? colorScale(countryData.ladderScore) : '#ccc';
          })
          .on('end', () => applyBlinking(selection));
      };

      svg
        .selectAll<SVGPathElement, any>('.country')
        .data(countries)
        .join('path')
        .attr('class', 'country')
        .attr('d', path as any)
        .attr('fill', (d) => {
          const topoCountryName = (d.properties && d.properties.name) as string;
          const countryData = data.find((c) => c.country === topoCountryName);
          return countryData ? colorScale(countryData.ladderScore) : '#ccc';
        })
        .attr('stroke', (d) => {
          const topoCountryName = (d.properties && d.properties.name) as string;
          const countryData = data.find((c) => c.country === topoCountryName);
          return countryData ? '#000' : '#fff';
        })
        .each(function (d) {
          const topoCountryName = (d.properties && d.properties.name) as string;
          if (top10CountryNames.includes(topoCountryName)) {
            applyBlinking(d3.select(this));
          }
        });

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
        .selectAll<SVGPathElement, any>('.country')
        .on('mouseover', (event, d) => {
          const topoCountryName = (d.properties && d.properties.name) as string;
          const countryData = data.find((c) => c.country === topoCountryName);

          tooltip
            .html(
              countryData
                ? `<strong>${countryData.country}</strong><br>Ladder score: ${countryData.ladderScore}`
                : `<strong>${topoCountryName}</strong><br>No data`
            )
            .style('display', 'block')
            .style('opacity', 1);
        })
        .on('mousemove', (event) => {
          tooltip
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY + 10}px`);
        })
        .on('mouseout', () => {
          tooltip.style('opacity', 0).style('display', 'none');
        });
        
      // Add a legend below the map
      const legendWidth = 200;
      const legendHeight = 10;
      const legendX = ((width - legendWidth) / 2) - 250; // Center the legend
      const legendY = height + 10; // Below the map, with margin

      const legendScale = d3
        .scaleLinear()
        .domain(colorScale.domain() as [number, number])
        .range([0, legendWidth]);

      const legendAxis = d3
        .axisBottom(legendScale)
        .tickValues([1.721, 7.741])
        .tickSize(-legendHeight);

      const legend = svg
        .append('g')
        .attr('transform', `translate(${legendX}, ${legendY})`);
    // Add a title to the legend
    svg
      .append('text')
      .attr('x', legendX + legendWidth / 2) // Center the title over the legend
      .attr('y', legendY - 10) // Position the title slightly above the legend
      .attr('text-anchor', 'middle') // Center-align the text
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Ladder Score');

      // Create the gradient for the legend
      const gradient = svg
        .append('defs')
        .append('linearGradient')
        .attr('id', 'legend-gradient')
        .attr('x1', '0%')
        .attr('x2', '100%')
        .attr('y1', '0%')
        .attr('y2', '0%');

      const colorRange = d3.range(0, 1.01, 0.01).map((t) =>
        colorScale(
          t * (colorScale.domain()[1] - colorScale.domain()[0]) +
            colorScale.domain()[0]
        )
      );

      colorRange.forEach((color, i) => {
        gradient
          .append('stop')
          .attr('offset', `${(i / (colorRange.length - 1)) * 100}%`)
          .attr('stop-color', color as string);
      });

      legend
        .append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', 'url(#legend-gradient)');

      legend.append('g').attr('transform', `translate(0, ${legendHeight})`).call(legendAxis);
    });

  }, [data]);

  const top10Countries = [...data]
    .sort((a, b) => b.ladderScore - a.ladderScore)
    .slice(0, 10);

  return (
      <div style={{ position: 'relative', width: '100%' }}>
        {/* Center the map */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <svg ref={svgRef} width={800} height={550}></svg>
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '20px', height: '20px', background: '#ccc', border: '1px solid #000' }}></div>
            <span>No data</span>
            {/* Add other color indicators as needed */}
          </div>
        </div>
        {/* Position the sidebar on the right */}
        <div style={{ position: 'absolute', top: '50px', right: '20px' }}>
          <button onClick={() => setShowTop10(!showTop10)}>
            {showTop10 ? 'Hide Top 10 Countries' : 'Reveal Top 10 Countries'}
          </button>
          {showTop10 && (
            <div className="top-10-list" style={{ marginTop: '10px', background: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <h3>Top 10 Happiest Countries</h3>
              <ol>
                {top10Countries.map((c) => (
                  <li key={c.country}>{c.country}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
  );
    
};

export default WorldMapNoTime;
