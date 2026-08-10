import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth.js";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20">
            U
          </span>
          <div className="leading-tight">
            <p className="font-semibold text-slate-900">URL Shortener</p>
            <p className="text-xs text-slate-500">Short links, fast</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-2 md:flex">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              Shorten
            </NavLink>
          </nav>

          <div className="md:hidden">
            <NavLink
              to="/dashboard"
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Dashboard
            </NavLink>
          </div>

          {loading ? (
            <div className="h-9 w-32 animate-pulse rounded-full bg-slate-200" />
          ) : user ? (
            <>
              <div className="hidden sm:block text-right">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Signed in
                </p>
                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink
                to="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Signup
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
