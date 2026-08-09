import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.tsx'
import { BrowserRouter as Router } from "react-router-dom";
import Routers from './routes/app.route.tsx';
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <Routers />
    </Router>
  </StrictMode>,
);
