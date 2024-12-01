// src/components/WorldMap.tsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import stringSimilarity from 'string-similarity';

interface HappinessData {
  Country: string;
  'Ladder score': number;
  [key: string]: any;
}

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
      // Type assertion for worldData
      const worldTopo = worldData as any;

      const countries = topojson.feature(
        worldTopo,
        worldTopo.objects.countries
      ).features as GeoJSON.FeatureCollection<GeoJSON.GeometryObject>['features'];

      // Create a color scale based on Ladder score
      const colorScale = d3
        .scaleSequential(d3.interpolateYlGnBu)
        .domain(d3.extent(data, (d) => d['Ladder score']) as [number, number]);

      // Prepare valid country names from the CSV
      const validCountryNames = data.map((d) => d.Country);

      // Draw countries on the map
      svg
        .selectAll<SVGPathElement, any>('.country')
        .data(countries)
        .join('path')
        .attr('class', 'country')
        .attr('d', path as any)
        .attr('fill', (d) => {
          const topoCountryName = (d.properties && d.properties.name) as string;

          if (!topoCountryName || typeof topoCountryName !== 'string') {
            return '#ccc'; // Default color for invalid/missing country names
          }

          // Attempt exact match
          const countryData = data.find((c) => c.Country === topoCountryName);

          if (countryData) {
            return colorScale(countryData['Ladder score']);
          }

          // If no exact match, use fuzzy matching
          const bestMatch = stringSimilarity.findBestMatch(
            topoCountryName,
            validCountryNames
          );
          const matchedCountry =
            bestMatch.bestMatch.rating > 0.8 ? bestMatch.bestMatch.target : null;

          if (matchedCountry) {
            const fuzzyMatchedData = data.find((c) => c.Country === matchedCountry);
            return fuzzyMatchedData
              ? colorScale(fuzzyMatchedData['Ladder score'])
              : '#ccc';
          }

          return '#ccc'; // Default color for unmatched countries
        })
        .attr('stroke', '#fff');

      // Add a tooltip
      const tooltip = d3
        .select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

      svg
        .selectAll<SVGPathElement, any>('.country')
        .on('mouseover', (event, d) => {
          const topoCountryName = (d.properties && d.properties.name) as string;

          if (!topoCountryName || typeof topoCountryName !== 'string') {
            tooltip.transition().duration(200).style('opacity', 0.9);
            tooltip
              .html(`<strong>Unknown Country</strong><br>No data`)
              .style('left', `${event.pageX + 10}px`)
              .style('top', `${event.pageY - 28}px`);
            return;
          }

          // Attempt exact match
          let countryData = data.find((c) => c.Country === topoCountryName);

          // If no exact match, use fuzzy matching
          if (!countryData) {
            const bestMatch = stringSimilarity.findBestMatch(
              topoCountryName,
              validCountryNames
            );
            const matchedCountry =
              bestMatch.bestMatch.rating > 0.8 ? bestMatch.bestMatch.target : null;

            if (matchedCountry) {
              countryData = data.find((c) => c.Country === matchedCountry);
            }
          }

          tooltip.transition().duration(200).style('opacity', 0.9);
          tooltip
            .html(
              countryData
                ? `<strong>${countryData.Country}</strong><br>Ladder score: ${countryData['Ladder score']}`
                : `<strong>${topoCountryName}</strong><br>No data`
            )
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 28}px`);
        })
        .on('mouseout', () => {
          tooltip.transition().duration(500).style('opacity', 0);
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
