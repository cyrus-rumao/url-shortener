import { useState, type FormEvent } from "react";

const Home = () => {
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [result, setResult] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult(
      `Prepared to shorten ${url}${slug ? ` with the custom slug "${slug}"` : ""}.`,
    );
  };

  return (
    <div className="bg-[radial-gradient(circle_at_top,#eff6ff_0%,#f8fafc_45%,#ffffff_100%)]">
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
        <div className="max-w-2xl space-y-6">
          <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-sm font-medium text-blue-700">
            Fast, clean URL shortening
          </span>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-6xl">
              Shorten links with a modern, focused workflow.
            </h1>
            <p className="text-lg leading-8 text-slate-600">
              Paste a long URL, choose a custom slug if you want, and keep your
              links organized in one place.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Secure auth", "Cookie-based sessions"],
              ["Custom slugs", "Make links memorable"],
              ["Simple UI", "Built for speed"],
            ].map(([title, description]) => (
              <div
                key={title}
                className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="font-semibold text-slate-900">{title}</p>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </div>

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
              <span className="text-sm font-medium text-slate-700">Long URL</span>
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
              className="rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Shorten URL
            </button>
          </form>

          {result ? (
            <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              {result}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default Home;
