import PageTitle from "@/services/PageTitle";
import { Link2, Home } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <section className="relative mx-auto flex w-full max-w-xl flex-col items-center px-4 py-12 text-center">
      {/* Ambient glow */}
      <PageTitle title="Not Found" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-950/15 blur-[100px]"
        aria-hidden="true"
      />

      <div className="relative w-full rounded-2xl border border-white/[0.10] bg-black/70 p-6 shadow-[0_25px_80px_-35px_rgba(139,92,246,0.35)] backdrop-blur-xl sm:p-8">
        {/* Icon */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.035]">
          <Link2
            className="h-5 w-5 rotate-45 text-zinc-400"
            strokeWidth={1.8}
          />
        </div>

        {/* 404 */}
        <h1 className="mt-5 bg-gradient-to-b from-white via-white to-zinc-600 bg-clip-text text-7xl font-bold tracking-[-0.06em] text-transparent sm:text-8xl">
          404
        </h1>

        {/* Heading */}
        <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white">
          This link doesn't exist.
        </h2>

        {/* Description */}
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
          The page you're looking for may have been moved, deleted, or never
          existed in the first place.
        </p>

        {/* Actions */}
        <div className="mt-6 flex justify-center">
          <Link
            to="/"
            className="flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-black transition-all duration-200 hover:bg-zinc-200 active:scale-[0.98]"
          >
            <Home className="h-4 w-4" strokeWidth={1.8} />
            Go Home
          </Link>
        </div>

        
      </div>
    </section>
  );
};

export default NotFound;
