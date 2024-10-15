import React from 'react';
import './App.css';
import CameraFrame from './components/CameraFrame';
import DataGraph from './components/DataGraph';
import WebSocketWidget from './components/WebSocketWidget';

// Global IP addresses
const RASPI_IP = "2ccf67506665.dynamic.utexas.edu";
const STEAMDECK_IP = "e88da6afd212.dynamic.utexas.edu";

function App() {
  // State for C20 and H2S gas sensor data
  const [c20Data, setC20Data] = React.useState(Array(100).fill(0));  // Initialize with 100 elements
  const [h2sData, setH2sData] = React.useState(Array(100).fill(0));  // Initialize with 100 elements

  // Function to simulate C20 gas sensor data
  const generateC20Data = () => {
    const newData = [...c20Data];
    const min = 7;  // Example lower range for C20 ppm
    const max = 15; // Example upper range for C20 ppm
    const newValue = (Math.random() * (max - min) + min).toFixed(2);
    newData.push(parseFloat(newValue));
    newData.shift();  // Remove the first value to keep array at 100 elements
    setC20Data(newData);
  };

  // Function to simulate H2S gas sensor data
  const generateH2SData = () => {
    const newData = [...h2sData];
    const min = 0.00011;  // Lower range for H2S in ppm
    const max = 0.00033;  // Upper range for H2S in ppm
    const newValue = (Math.random() * (max - min) + min).toFixed(6);
    newData.push(parseFloat(newValue));
    newData.shift();  // Remove the first value to keep array at 100 elements
    setH2sData(newData);
  };

  // Generate new data every 2 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      generateC20Data();
      generateH2SData();
    }, 2000);

    return () => clearInterval(interval);
  }, [c20Data, h2sData]);

  // Function to switch to the dashboard.html
  const switchToDashboardHTML = () => {
    window.location.href = '/dashboard.html'; // Redirect to dashboard.html
  };

  return (
    <div className="App">
      <h1>Dashboard</h1>
      <div className="grid-container">
        {/* Camera Feeds */}
        <div className="grid-item">
          <CameraFrame
            title="Optical Camera 1"
            url={`http://${RASPI_IP}:8889/cam0`}
            type="iframe"
            aspectRatio="12:9"
          />
        </div>
        <div className="grid-item">
          <CameraFrame
            title="Optical Camera 2"
            url={`http://${RASPI_IP}:8889/cam1`}
            type="iframe"
            aspectRatio="12:9"
          />
        </div>
        <div className="grid-item">
          <CameraFrame
            title="Thermal Camera 1"
            wsUrl={`ws://${RASPI_IP}:8720`}
            type="ws"
            aspectRatio="1:1"
          />
        </div>
        <div className="grid-item">
          <CameraFrame
            title="Thermal Camera 2"
            wsUrl={`ws://${RASPI_IP}:8620`}
            type="ws"
            aspectRatio="1:1"
          />
        </div>

        {/* Gas Sensor Graphs */}
        <div className="grid-item">
          <DataGraph title="C20 Gas Sensor" data={c20Data} />
        </div>
        <div className="grid-item">
          <DataGraph title="H2S Gas Sensor" data={h2sData} />
        </div>

        {/* New WebSocket Widget for Voltage, Current, Power */}
        <div className="grid-item">
          <WebSocketWidget wsUrl={`ws://${RASPI_IP}:8805`} title="Voltage, Current, Power" />
        </div>

        {/* Other Widgets (if needed) */}
        <div className="grid-item">
          <WebSocketWidget wsUrl={`ws://${RASPI_IP}:8806`} title="Thermistor Usage (Port 8806)" />
        </div>
      </div>

      {/* Button Panel in Bottom-right Corner */}
      <div className="button-panel">
        <button onClick={switchToDashboardHTML}>Switch to Dashboard HTML</button>
        <button disabled>Enable/Disable</button> {/* Placeholder for future buttons */}
      </div>
    </div>
  );
}

export default App;

