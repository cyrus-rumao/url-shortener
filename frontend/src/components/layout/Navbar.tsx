import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth.js";
import { showError, showSuccess } from "@/utils/toast";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  const handleLogout = async () => {
    try{

      await logout();
      showSuccess("Logged out successfully");
    }catch (error) {
      showError("Logout failed. Please try again.");
      console.error("Logout failed:", error);
    }
    navigate("/", { replace: true });
  };

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-20 w-full items-center justify-between px-5 sm:px-7">
        {/* Compact logo */}
        <NavLink to="/" className="group flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.04] shadow-[0_0_25px_rgba(139,92,246,0.08)] transition-all duration-200 group-hover:border-white/[0.2] group-hover:bg-white/[0.07]">
            <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/[0.08] to-transparent" />

            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="relative h-4.5 w-4.5 text-white"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.07.07l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15" />
              <path d="M14 11a5 5 0 0 0-7.07-.07l-2 2A5 5 0 0 0 12 20l1.15-1.15" />
            </svg>
          </div>

          <span className="hidden text-sm font-semibold tracking-tight text-zinc-300 sm:block">
            ReDirect<span className="text-zinc-600">.ly</span>
          </span>
        </NavLink>

        {/* Navigation */}
        {loading ? (
          <div className="h-9 w-24 animate-pulse rounded-full bg-white/[0.06]" />
        ) : user ? (
          <div className="flex items-center gap-2">
            {/* Dashboard */}
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `group flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white/[0.07] text-white"
                    : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
                }`
              }
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>

              <span>Dashboard</span>
            </NavLink>

            {/* User menu */}
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] py-1 pl-1 pr-1.5">
              {/* Avatar */}
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-300 to-zinc-600 text-[11px] font-bold text-black">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              {/* User name */}
              <span className="hidden max-w-[120px] truncate px-1 text-xs font-medium text-zinc-300 sm:block">
                {user.name}
              </span>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 transition-all duration-200 hover:bg-white/[0.06] hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          /* Logged out */
          <div className="flex items-center gap-1.5">
            <NavLink
              to="/login"
              className="rounded-xl px-3.5 py-2 text-sm font-medium text-zinc-500 transition-all duration-200 hover:bg-white/[0.04] hover:text-white"
            >
              Log In
            </NavLink>

            <NavLink
              to="/signup"
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition-all duration-200 hover:bg-zinc-200"
            >
              Sign Up
            </NavLink>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
