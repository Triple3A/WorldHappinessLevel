import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

const WorldMap = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 500;

    // Projection and path setup
    const projection = d3.geoMercator().scale(100).translate([width / 2, height / 1.5]);
    const path = d3.geoPath(projection);

    // Load topojson and map data
    d3.json("/countries-110m.json").then((worldData) => {
      const countries = topojson.feature(worldData, worldData.objects.countries).features;

      // Scale for happiness levels
      const colorScale = d3
        .scaleSequential(d3.interpolateYlGnBu)
        .domain(d3.extent(data, (d) => d.HappinessLevel));

      // Draw the map
      svg.selectAll(".country")
        .data(countries)
        .join("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("fill", (d) => {
          const countryData = data.find((c) => c.Country === d.properties.name);
          return countryData ? colorScale(countryData.HappinessLevel) : "#ccc";
        })
        .attr("stroke", "#333");

      // Add legend
    //   const legend = svg.append("g").attr("transform", `translate(20, 20)`);
    //   const legendScale = d3.scaleLinear()
    //     .domain(d3.extent(data, (d) => d.HappinessLevel))
    //     .range([0, 300]);
    //   const legendAxis = d3.axisBottom(legendScale).ticks(6);

    //   legend.selectAll("rect")
    //     .data(d3.range(0, 1.01, 0.01))
    //     .join("rect")
    //     .attr("x", (d) => legendScale(d3.interpolate(d3.extent(data, d => d.HappinessLevel)[0], d)))
    //     .attr("width", 10)
    //     .attr("height", 20)
    //     .attr("fill", d => colorScale(d))

    //   legend.append("g").call(legendAxis);
    });
  }, [data]);

  return <svg ref={svgRef} width={800} height={500}></svg>;
};

export default WorldMap;
