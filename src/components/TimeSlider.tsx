import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface TimeSliderProps {
  onYearChange: (year: number) => void; // Callback for year change
  newYear: number;
}

const TimeSlider: React.FC<TimeSliderProps> = ({ onYearChange, newYear }) => {
  const sliderRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const width = 600;
    const height = 80;
    const margin = { left: 50, right: 50 };

    const svg = d3.select(sliderRef.current)
      .attr("width", width)
      .attr("height", height);

    const scale = d3.scaleLinear()
      .domain([2006, 2023])
      .range([margin.left, width - margin.right])
      .clamp(true);

    const axis = d3.axisBottom(scale)
      .tickFormat(d3.format("d"))
      .ticks(18);

    const g = svg.append("g")
      .attr("transform", `translate(0, ${height / 2})`);

    g.append("g").call(axis);

    // Initial circle position (scale at 2023)
    const handle = g.append("circle")
      .attr("cx", scale(newYear)) // Initial position at 2023
      .attr("cy", 0)
      .attr("r", 10)
      .attr("fill", "steelblue")
      .attr("cursor", "pointer");

    // Drag behavior for the circle
    const drag = d3.drag<SVGCircleElement, unknown>()
      .on("start", () => {
        handle.attr("fill", "orange"); // Visual feedback
      })
      .on("drag", (event) => {
        // Get bounding rectangle to calculate offset
        const svgRect = sliderRef.current?.getBoundingClientRect();
        if (!svgRect) return;

        // Adjust mouse position based on the SVG's offset
        let newX = event.x - svgRect.left;
        newX = Math.max(margin.left, Math.min(newX, width - margin.right)); // Constrain within slider range

        handle.attr("cx", event.x); // Update circle's position dynamically during drag

        newYear = Math.round(scale.invert(newX)); // Convert position to year
        onYearChange(newYear); // Notify parent of year change
      })
      .on("end", () => {
        handle.attr("fill", "steelblue"); // Reset visual feedback
        handle.attr('cx', scale(newYear));
      });

    handle.call(drag); // Attach drag behavior to the circle

    // Cleanup function to remove elements and listeners
    return () => {
      svg.selectAll("*").remove();
    };
  }, [onYearChange, newYear]);

  return <svg ref={sliderRef} style={{ display: "block", margin: "auto" }}></svg>;
};

export default TimeSlider;
