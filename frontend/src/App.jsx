import React from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './App.css';

function App() {
  return (
    <div className="App">
      {/* Root App Routes defined in index.js */}
      <SpeedInsights />
    </div>
  );
}

export default App;
