// src/App.js
import React, { useState } from 'react';
import GridLayout from 'react-grid-layout';
import './App.css';
import CameraFrame from './components/CameraFrame';
import DataGraph from './components/DataGraph';
import WebSocketWidget from './components/WebSocketWidget';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

function App() {
  // Global IP variables
  const raspi_ip = "2ccf67506665.dynamic.utexas.edu";  // IP or domain for Raspberry Pi
  const steamdeck_ip = "e88da6afd212.dynamic.utexas.edu";  // IP or domain for Steam Deck

  const [isReactDashboard, setIsReactDashboard] = useState(true); // Toggle between React and HTML dashboards

  const layout = [
    { i: 'camera1', x: 0, y: 0, w: 7, h: 3.3 }, // Optical camera (wider)
    { i: 'camera2', x: 7.2, y: 0, w: 7, h: 3.3 }, // Optical camera (wider)
    { i: 'camera3', x: 0, y: 2.5, w: 7, h: 3.5 }, // Thermal camera (square)
    { i: 'camera4', x: 7.2, y: 2.5, w: 7, h: 3.5 }, // Thermal camera (square)
    { i: 'graph1', x: 18.5, y: 0, w: 7.3, h: 3.5 },  // Graph (wider)
    { i: 'graph2', x: 11, y: 5.7, w: 7.3, h: 3.5 },  // Another graph
    { i: 'widget1', x: 14.2, y: 0, w: 6.2, h: 1.2 }, // WebSocket widget (small)
    { i: 'widget2', x: 14.2, y: 2.3, w: 6.2, h: 1.2 }, // WebSocket widget (small)
  ];

  // Function to toggle between dashboards or open the HTML dashboard in a new tab
  const openHtmlDashboard = () => {
    window.open('/dashboard.html', '_blank'); // Open the HTML file in a new tab
  };

  return (
    <div className="App">
      <button onClick={openHtmlDashboard}>
        Open HTML Dashboard
      </button>

      <GridLayout
        className="layout"
        layout={layout}
        cols={30}
        rowHeight={100}
        width={1200}
        isResizable={true}
        isDraggable={true}
      >
        <div key="camera1">
          <CameraFrame
            title="Optical Camera 1"
            url={`http://${raspi_ip}:8889/cam0`} // Using raspi_ip for Optical Camera 1
            type="iframe"
            aspectRatio="12:9"
          />
        </div>
        <div key="camera2">
          <CameraFrame
            title="Optical Camera 2"
            url={`http://${raspi_ip}:8889/cam1`} // Using raspi_ip for Optical Camera 2
            type="iframe"
            aspectRatio="12:9"
          />
        </div>
        <div key="camera3">
          <CameraFrame
            title="Thermal Camera 1"
            wsUrl={`ws://${steamdeck_ip}:8720`} // Using steamdeck_ip for Thermal Camera 1
            type="ws"
            aspectRatio="1:1"
          />
        </div>
        <div key="camera4">
          <CameraFrame
            title="Thermal Camera 2"
            wsUrl={`ws://${steamdeck_ip}:8620`} // Using steamdeck_ip for Thermal Camera 2
            type="ws"
            aspectRatio="1:1"
          />
        </div>
        <div key="graph1">
          <DataGraph title="Battery Status" data={[50, 60, 70, 80]} />
        </div>
        <div key="graph2">
          <DataGraph title="Network Status" data={[10, 20, 30, 40]} />
        </div>
        <div key="widget1">
          <WebSocketWidget wsUrl={`ws://${raspi_ip}:8765`} title="Voltage Usage (Port 8765)" />
        </div>
        <div key="widget2">
          <WebSocketWidget wsUrl={`ws://${raspi_ip}:8766`} title="Thermistor Usage (Port 8766)" />
        </div>
      </GridLayout>
    </div>
  );
}

export default App;
