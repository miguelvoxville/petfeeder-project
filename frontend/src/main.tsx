// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import MQTTProvider from "./assets/MQTTProvider";
import './index.css'   // ← aqui

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MQTTProvider>
      <App />
    </MQTTProvider>
  </React.StrictMode>
);