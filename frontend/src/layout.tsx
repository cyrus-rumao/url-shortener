import { Outlet } from "react-router-dom";
import Navbar from "./components/layout/Navbar";

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
