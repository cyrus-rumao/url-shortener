import { Route, Routes } from "react-router-dom";
import Login from "@/pages/Login.tsx";
import Home from "@/pages/Home.tsx";
import Signup from "@/pages/Signup.tsx";
import ShortenedResult from "@/pages/ShortenedResult.tsx";
import Dashboard from "@/pages/Dashboard.tsx";
import Layout from "@/layout.tsx";
import NotFound from "@/pages/NotFound.tsx";
const Routers = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shortened" element={<ShortenedResult />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default Routers;
