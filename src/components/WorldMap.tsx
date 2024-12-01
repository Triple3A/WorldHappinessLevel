import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { FeatureCollection } from 'geojson';
import { HappinessData } from '../types';

interface WorldMapProps {
  data: HappinessData[];
}

const WorldMap: React.FC<WorldMapProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 500;

    // Set up projection and path
    const projection = d3
      .geoMercator()
      .scale(120)
      .translate([width / 2, height / 1.5]);
    const path = d3.geoPath().projection(projection);

    // Load world map TopoJSON
    d3.json('/countries-110m.json').then((worldData) => {
      const worldTopo = worldData as any;

      const countries = (topojson.feature(
        worldTopo,
        worldTopo.objects.countries
      ) as unknown as FeatureCollection).features;

      // Create a color scale based on Ladder score
      const colorScale = d3
        .scaleSequential(d3.interpolateYlGnBu)
        .domain(d3.extent(data, (d) => d.ladderScore) as [number, number]);

      // Draw countries on the map
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
        .attr('stroke', '#fff');

      // Add a tooltip
      const tooltip = d3
        .select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute') // Allow tooltip to move freely
        .style('background', 'white')
        .style('padding', '8px')
        .style('border', '1px solid #ccc')
        .style('border-radius', '4px')
        .style('pointer-events', 'none'); // Prevent tooltip from interfering with mouse events

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
            .style('opacity', 1);
        })
        .on('mousemove', (event) => {
          tooltip
            .style('left', `${event.clientX + 10}px`) // Position tooltip near the cursor
            .style('top', `${event.clientY + 10}px`); // Add offset for better usability
        })
        .on('mouseout', () => {
          tooltip.style('opacity', 0); // Hide tooltip on mouse out
        });
    });
  }, [data]);

  return (
    <div>
      <svg ref={svgRef} width={800} height={500}></svg>
    </div>
  );
};

export default WorldMap;
