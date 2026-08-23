import { useEffect, useState, type SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth.js";
import { showError, showSuccess } from "@/utils/toast";
import { getErrorMessage } from "@/utils/error";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import PageTitle from "@/services/PageTitle";

const Signup = () => {
  const navigate = useNavigate();
  const { user, loading, signup } = useAuth();
  const [name, setName] = useState("");
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
      await signup({ name, email, password });
      navigate("/login");
      showSuccess("Signup successful");
    } catch (error) {
      showError(getErrorMessage(error, "Signup failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 px-4 backdrop-blur-[3px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <PageTitle title="Signup" />
      <motion.section
        className="relative w-full max-w-md"
        initial={{
          opacity: 0,
          y: 18,
          scale: 0.96,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          y: 10,
          scale: 0.97,
        }}
        transition={{
          duration: 0.28,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {/* Modal glow */}
        <div
          className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-purple-950/15 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative rounded-2xl border border-white/[0.12] bg-black/70 p-6 shadow-[0_30px_100px_-35px_rgba(139,92,246,0.45)] backdrop-blur-2xl sm:p-7">
          {/* Close */}
          <motion.button
            type="button"
            onClick={() => navigate("/")}
            aria-label="Close signup"
            whileHover={{
              scale: 1.5,
              backgroundColor: "rgba(255,255,255,0.06)",
            }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500"
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </motion.button>

          {/* Header */}
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.025em] text-white">
              Create an account
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Get started with your own short links.
            </p>
          </div>

          {/* Form */}
          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
            {/* Name */}
            <label className="grid gap-2">
              <span className="text-sm font-medium text-zinc-400">Name</span>

              <input
                className="h-13 rounded-xl border border-white/[0.10] bg-white/[0.035] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 hover:border-white/[0.15] focus:border-purple-500/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-purple-500/10"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>

            {/* Email */}
            <label className="grid gap-2">
              <span className="text-sm font-medium text-zinc-400">Email</span>

              <input
                className="h-13 rounded-xl border border-white/[0.10] bg-white/[0.035] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 hover:border-white/[0.15] focus:border-purple-500/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-purple-500/10"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            {/* Password */}
            <label className="grid gap-2">
              <span className="text-sm font-medium text-zinc-400">
                Password
              </span>

              <input
                className="h-13 rounded-xl border border-white/[0.10] bg-white/[0.035] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 hover:border-white/[0.15] focus:border-purple-500/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-purple-500/10"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={!submitting ? { scale: 1.01 } : undefined}
              whileTap={!submitting ? { scale: 0.985 } : undefined}
              transition={{ duration: 0.15 }}
              className="mt-1 flex h-13 w-full items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              <AnimatePresence mode="wait" initial={false}>
                {submitting ? (
                  <motion.span
                    key="loading"
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                    Creating account...
                  </motion.span>
                ) : (
                  <motion.span
                    key="signup"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    Sign Up
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          {/* Error */}
          <AnimatePresence initial={false}>
            {error && (
              <motion.div
                initial={{
                  opacity: 0,
                  height: 0,
                  y: -5,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  y: -5,
                }}
                transition={{ duration: 0.2 }}
                className="mt-4 overflow-hidden rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-400"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login */}
          <p className="mt-6 text-center text-sm text-zinc-600">
            Already have an account?{" "}
            <Link
              className="font-medium text-zinc-300 transition-colors hover:text-white"
              to="/login"
            >
              Log In
            </Link>
          </p>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default Signup;
