import React, { useEffect, useRef } from 'react';
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
        .slice(0, 10)
        .map((d) => d.country);

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
            return countryData ? colorScale(countryData.ladderScore) : '#ccc'; // Back to original color
          })
          .on('end', () => applyBlinking(selection)); // Recursive call for continuous blinking
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
          if (top10Countries.includes(topoCountryName)) {
            applyBlinking(d3.select(this)); // Apply blinking to the happiest countries
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
    });
  }, [data]);

  return (
    <div>
      <svg ref={svgRef} width={800} height={550}></svg>
    </div>
  );
};

export default WorldMapNoTime;
