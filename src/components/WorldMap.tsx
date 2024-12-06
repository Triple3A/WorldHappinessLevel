import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { FeatureCollection } from 'geojson';
import { HappinessDataBase } from '../types';


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

interface WorldMapProps {
  data: HappinessData[];
  dataWithYear: HappinessWithYear[];
  currentYear: number;
  onSelectCountry: (country: HappinessData) => void;
  colorScale?: d3.ScaleSequential<string>; // Add colorScale prop
}

const WorldMap: React.FC<WorldMapProps> = ({
    data,
    dataWithYear,
    currentYear,
    onSelectCountry,
    colorScale = d3.scaleSequential(d3.interpolateYlGnBu).domain([1.721, 7.741]), // Default color scale
  }) => {



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
    d3.json('/countries-50m.json').then((worldData) => {
      const worldTopo = worldData as any;

      const countries = (topojson.feature(
        worldTopo,
        worldTopo.objects.countries
      ) as unknown as FeatureCollection).features;

      // Create a color scale based on Ladder score
      const colorScale = d3
      .scaleSequential((t) => d3.interpolateYlGnBu(1 - t)) // Reverse the gradient
      .domain([1.721, 7.741]); // High numbers are yellow, low numbers are blue


      // Draw countries on the map
      svg
        .selectAll<SVGPathElement, any>('.country')
        .data(countries)
        .join('path')
        .attr('class', 'country')
        .attr('d', path as any)
        .attr('fill', (d) => {
          const topoCountryName = (d.properties && d.properties.name) as string;
          const countryData = dataWithYear.find((c) => c.country === topoCountryName && c.year === currentYear);
          return countryData ? colorScale(countryData.ladderScore) : '#ccc';
        })
        .attr('stroke', (d) => {
          const topoCountryName = (d.properties && d.properties.name) as string;
          const countryData = dataWithYear.find((c) => c.country === topoCountryName && c.year === currentYear);
          return countryData ? '#000' : '#fff';
        });

      // Add a tooltip
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
      .style('pointer-events', 'none')

  
      svg
        .selectAll<SVGPathElement, any>('.country')
        .on('mouseover', (event, d) => {
          const topoCountryName = (d.properties && d.properties.name) as string;
          const countryData = dataWithYear.find((c) => c.country === topoCountryName && c.year === currentYear);

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
          tooltip.style('opacity', 0)
          .style('display', 'none'); // Ensure it's fully removed from view
        })
        .on('click', (event, d) => {
          const topoCountryName = (d.properties && d.properties.name) as string;
          const countryData = data.find((c) => c.country === topoCountryName);
          const empty = {} as HappinessData;
          empty.ladderScore = 0;
          onSelectCountry(countryData ? countryData : empty);
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
  }, [dataWithYear, currentYear]);

  return (
    <div>
      <svg ref={svgRef} width={800} height={550}></svg>
    </div>
  );
};

export default WorldMap;
