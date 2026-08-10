import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import type { CreateShortUrlData } from "@/types/url.js";

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
    <section className="mx-auto w-full max-w-2xl px-4 py-14 lg:py-20">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_-30px_rgba(37,99,235,0.35)]">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
          Success
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Your URL has been shortened
        </h1>
        <p className="mt-2 text-sm text-slate-500">Created at {createdAtLabel}</p>

        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-blue-700">Short URL</p>
          <a
            href={result.shortUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block break-all text-sm font-semibold text-blue-700 underline"
          >
            {result.shortUrl}
          </a>
        </div>

        <p className="mt-4 break-all text-sm text-slate-600">
          Original URL: <span className="font-medium text-slate-800">{result.originalUrl}</span>
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {copyLabel}
          </button>
          <Link
            to="/dashboard"
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Open dashboard
          </Link>
          <Link
            to="/"
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Shorten another
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ShortenedResult;
