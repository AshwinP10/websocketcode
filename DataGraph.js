// src/components/DataGraph.js
import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

const DataGraph = ({ title, data }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: data.length }, (_, i) => i + 1),
        datasets: [{
          label: title,
          data: data,
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          fill: false,
        }],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Time'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Value'
            }
          }
        },
      },
    });

    return () => chart.destroy(); // Cleanup on component unmount
  }, [data, title]);

  return (
    <div className="data-graph">
      <h3>{title}</h3>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default DataGraph;
