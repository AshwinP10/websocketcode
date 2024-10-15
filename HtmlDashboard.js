// src/components/HtmlDashboard.js
// src/components/HtmlDashboard.js
import React from 'react';

const HtmlDashboard = () => {
  return (
    <div className="html-dashboard">
      <iframe
        src="/dashboard.html"  // Ensure this is the correct path
        title="Original HTML Dashboard"
        style={{ width: '100%', height: '100vh', border: 'none' }}
      />
    </div>
  );
};

export default HtmlDashboard;
