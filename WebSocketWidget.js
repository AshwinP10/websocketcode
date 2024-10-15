import React, { useState, useEffect } from 'react';

const WebSocketWidget = ({ wsUrl, title }) => {
  const [current, setCurrent] = useState(0);
  const [voltage, setVoltage] = useState(0);
  const [power, setPower] = useState(0);

  useEffect(() => {
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      // Assume the server sends a comma-separated string like "current,voltage,power"
      const [receivedCurrent, receivedVoltage, receivedPower] = event.data.split(",").map(Number);

      setCurrent(receivedCurrent);
      setVoltage(receivedVoltage);
      setPower(receivedPower);
    };

    return () => ws.close(); // Clean up WebSocket on component unmount
  }, [wsUrl]);

  return (
    <div className="websocket-widget">
      <h3>{title}</h3>
      <p><strong>Current:</strong> {current.toFixed(2)} A</p>
      <p><strong>Voltage:</strong> {voltage.toFixed(2)} V</p>
      <p><strong>Power:</strong> {power.toFixed(2)} W</p>
    </div>
  );
};

export default WebSocketWidget;
