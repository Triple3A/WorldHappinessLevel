import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

const WorldMap = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 500;

    // Set up projection and path
    const projection = d3.geoMercator().scale(120).translate([width / 2, height / 1.5]);
    const path = d3.geoPath(projection);

    // Load world map TopoJSON
    d3.json("/countries-110m.json").then((worldData) => {
      const countries = topojson.feature(worldData, worldData.objects.countries).features;

      // Create a color scale based on Ladder score
      const colorScale = d3
        .scaleSequential(d3.interpolateYlGnBu)
        .domain(d3.extent(data, (d) => d["Ladder score"]));

      // Draw countries on the map
      svg.selectAll(".country")
        .data(countries)
        .join("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("fill", (d) => {
          const countryData = data.find((c) => c.Country === d.properties.name);
          return countryData ? colorScale(countryData["Ladder score"]) : "#ccc"; // Default color if no data
        })
        .attr("stroke", "#fff");

      // Add a tooltip
      const tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

      svg.selectAll(".country")
        .on("mouseover", (event, d) => {
          const countryData = data.find((c) => c.Country === d.properties.name);
          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip
            .html(
              countryData
                ? `<strong>${countryData.Country}</strong><br>Ladder score: ${countryData["Ladder score"]}`
                : `<strong>${d.properties.name}</strong><br>No data`
            )
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 28}px`);
        })
        .on("mouseout", () => {
          tooltip.transition().duration(500).style("opacity", 0);
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
