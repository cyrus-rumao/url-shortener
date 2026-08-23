import { useState, type SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Link2, Lock } from "lucide-react";
import { createShortUrl } from "@/services/url.service.js";
import { showError, showSuccess } from "@/utils/toast";
import PageTitle from "@/services/PageTitle";

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
      showSuccess("URL shortened successfully");
    } catch (serviceError) {
      console.log("Error creating short URL:", serviceError);
      showError(
        serviceError instanceof Error
          ? serviceError.message
          : "Failed to shorten URL",
      );
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="relative w-full">
      <PageTitle title="Home" />

      <main className="relative z-10 flex w-full flex-col items-center px-4">
        {/* Shorten form */}
        <section className="relative mt-8 w-full max-w-xl">
          {/* Purple glow */}
          <div
            className="pointer-events-none absolute -inset-5 rounded-[1.5rem] bg-purple-950/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative rounded-2xl border border-white/[0.10] bg-black/80 p-4 shadow-[0_25px_80px_-35px_rgba(139,92,246,0.35)] backdrop-blur-xl sm:p-6">
            <form className="grid gap-3" onSubmit={handleSubmit}>
              {/* Long URL */}
              <label className="relative block">
                <span className="sr-only">Long URL</span>

                <Link2
                  className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-500"
                  strokeWidth={1.8}
                />

                <input
                  className="h-14 w-full rounded-xl border border-white/[0.10] bg-white/[0.035] pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-500 hover:border-white/[0.15] focus:border-purple-500/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-purple-500/10"
                  placeholder="https://your-long-url.com..."
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  required
                />
              </label>

              {/* Custom slug */}
              <label className="block">
                <span className="sr-only">Custom slug</span>

                <input
                  className="h-14 w-full rounded-xl border border-white/[0.10] bg-white/[0.035] px-4 text-sm text-white outline-none transition placeholder:text-zinc-500 hover:border-white/[0.15] focus:border-purple-500/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-purple-500/10"
                  placeholder="Custom slug (optional)"
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                />
              </label>

              {/* Secure link */}
              <div className="mt-1 flex min-h-[68px] items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] px-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.035]">
                    <Lock className="h-4 w-4 text-zinc-400" strokeWidth={1.8} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-zinc-100">
                      Secure Link
                    </p>

                    <p className="mt-0.5 text-[11px] text-zinc-500">
                      Require a password to access
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Toggle secure link"
                  className="relative h-6 w-11 rounded-full border border-white/10 bg-black transition-colors"
                >
                  <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-zinc-400 transition-transform" />
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="mt-1 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{submitting ? "Shortening..." : "Shorten URL"}</span>

                {!submitting && (
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                )}
              </button>
            </form>

            {/* Error */}
            {error ? (
              <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3 py-2.5 text-xs text-red-400">
                {error}
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
