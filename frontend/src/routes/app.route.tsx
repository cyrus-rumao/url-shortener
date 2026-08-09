import { Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import App from "../App";
const Routers = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};

export default Routers;
