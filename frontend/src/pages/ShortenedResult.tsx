import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Check, Copy } from "lucide-react";
import type { CreateShortUrlData } from "@/types/url.js";
import PageTitle from "@/services/PageTitle";

interface ResultLocationState {
  result?: CreateShortUrlData;
}

const ShortenedResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ResultLocationState | null;
  const result = state?.result;
  const [copyLabel, setCopyLabel] = useState("Copy");

  const createdAtLabel = useMemo(
    () => new Date().toLocaleString(),
    [],
  );

  const handleCopy = async () => {
    if (!result) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result.shortUrl);
      setCopyLabel("Copied");
    } catch {
      setCopyLabel("Copy failed");
    }
  };

  if (!result) {
    return (
      <section className="mx-auto w-full max-w-2xl px-4 py-14 lg:py-20">
        <PageTitle title="No shortened URL found" />
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-center shadow-[0_24px_80px_-30px_rgba(37,99,235,0.35)]">
          <h1 className="text-2xl font-semibold text-slate-900">No shortened URL found</h1>
          <p className="mt-2 text-sm text-slate-600">
            Create a new short URL first, then this page will show your result.
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Back to shortener
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative mx-auto flex w-full max-w-xl flex-1 items-center px-4 py-4">
      <PageTitle title="Shortened URL" />
      {/* Subtle ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-950/10 blur-[100px]"
        aria-hidden="true"
      />
      <div className="relative w-full rounded-2xl border border-white/[0.10] bg-black/80 p-4 shadow-[0_25px_80px_-35px_rgba(139,92,246,0.35)] backdrop-blur-xl sm:p-6">
        {/* Success */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.05]">
            <Check className="h-6 w-6 text-white" strokeWidth={2} />
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-[-0.03em] text-white sm:text-3xl">
            Link Shortened
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Your new link is ready to share
          </p>
        </div>

        {/* Short URL */}
        <div className="mt-6">
          <div className="flex min-h-[54px] items-center gap-3 rounded-xl border border-white/[0.10] bg-white/[0.035] px-4">
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 flex-1 break-all font-mono text-xs font-semibold text-zinc-300 transition hover:text-white sm:text-sm"
            >
              {result.shortUrl}
            </a>

            <button
              type="button"
              onClick={() => void handleCopy()}
              aria-label="Copy shortened URL"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/[0.08] hover:text-white"
            >
              <Copy className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-4 space-y-2.5">
          <div className="flex items-start justify-between gap-4 text-xs">
            <span className="shrink-0 text-zinc-600">Created</span>

            <span className="text-right text-zinc-400">{createdAtLabel}</span>
          </div>

          <div className="border-t border-white/[0.06]" />

          <div className="flex items-start justify-between gap-4 text-xs">
            <span className="shrink-0 text-zinc-600">Original URL</span>

            <span className="max-w-[70%] break-all text-right text-zinc-400">
              {result.originalUrl}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 grid gap-2.5">
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            <Copy className="h-4 w-4" strokeWidth={2} />
            {copyLabel}
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <Link
              to="/dashboard"
              className="flex h-11 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.025] px-3 text-xs font-medium text-zinc-400 transition hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-white sm:text-sm"
            >
              Open dashboard
            </Link>

            <Link
              to="/"
              className="flex h-11 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.025] px-3 text-xs font-medium text-zinc-400 transition hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-white sm:text-sm"
            >
              Shorten another
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShortenedResult;
