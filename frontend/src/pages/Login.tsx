import { useEffect, useState, type SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth.js";
import { getErrorMessage } from "@/utils/error";
import { showSuccess, showError } from "@/utils/toast";
const Login = () => {
  const navigate = useNavigate();
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [loading, navigate, user]);

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login({ email, password });
      showSuccess("Login successful");
      navigate("/");
    } catch (error) {
      showError(getErrorMessage(error, "Login failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-20">
      <div className="space-y-5">
        <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-sm font-medium text-blue-700">
          Welcome back
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
          Log in to manage your links.
        </h1>
        <p className="max-w-xl text-lg leading-8 text-slate-600">
          Access your short URLs, create new ones, and keep your account in one
          place.
        </p>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_-30px_rgba(37,99,235,0.35)]">
        <h2 className="text-2xl font-semibold text-slate-900">Login</h2>
        <p className="mt-1 text-sm text-slate-500">
          Use your registered email and password.
        </p>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <p className="mt-5 text-sm text-slate-500">
          Need an account?{" "}
          <Link
            className="font-medium text-blue-600 hover:text-blue-700"
            to="/signup"
          >
            Signup
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Login;
