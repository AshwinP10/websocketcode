// src/components/CameraFrame.js
import React from 'react';

const CameraFrame = ({ title, url, wsUrl, type, aspectRatio }) => {
  return (
    <div className="camera-frame">
      <h3>{title}</h3>
      {type === 'iframe' ? (
        <iframe
          src={url}
          title={title}
          allowFullScreen
          style={{ width: '100%', height: 'auto', aspectRatio: aspectRatio }}
        />
      ) : (
        <img
          src=""
          alt={title}
          style={{ width: '100%', height: 'auto', aspectRatio: aspectRatio }}
        />
      )}
    </div>
  );
};

export default CameraFrame;
