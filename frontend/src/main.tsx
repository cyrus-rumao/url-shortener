import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from './context/auth-provider';
import Routers from './routes/app.route.tsx';
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <Routers />
      </AuthProvider>
    </Router>
  </StrictMode>,
);
