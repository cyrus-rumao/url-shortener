import { useState, type SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";

import { createShortUrl } from "@/services/url.service.js";

const Home = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const createdShortUrl = await createShortUrl({
        url,
        slug: slug.trim() ? slug : undefined,
      });
      navigate("/shortened", { state: { result: createdShortUrl } });
    } catch (serviceError) {
      console.log("Error creating short URL:", serviceError);
      setError(
        serviceError instanceof Error ? serviceError.message : "Failed to shorten URL",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-grey-400">
      <section className="mx-auto w-full max-w-2xl px-4 py-14 lg:items-center lg:py-20">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_-30px_rgba(37,99,235,0.35)]">
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
              Create link
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Shorten a URL
            </h2>
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">
                Long URL
              </span>
              <input
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                placeholder="https://example.com/very/long/link"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                required
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">
                Custom slug
              </span>
              <input
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                placeholder="my-link"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              {submitting ? "Shortening..." : "Shorten URL"}
            </button>
          </form>

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default Home;
