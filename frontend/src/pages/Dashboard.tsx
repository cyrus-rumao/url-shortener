import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteShortUrl, getMyShortUrls } from "@/services/url.service.js";
import { useAuth } from "@/hooks/use-auth.js";
import type { UserShortUrl } from "@/types/url.js";
import { showError, showSuccess } from "@/utils/toast";
import { ExternalLink, Link2, Trash2 } from "lucide-react";
import PageTitle from "@/services/PageTitle";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [urls, setUrls] = useState<UserShortUrl[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      // showError("You must be logged in to access the dashboard");
      navigate("/", { replace: true });
    }
  }, [loading, navigate, user]);

  useEffect(() => {
    if (!user) {
      // setFetching(false);
      return;
    }

    let cancelled = false;

    const fetchUrls = async () => {
      setFetching(true);
      setError("");
      try {
        const data = await getMyShortUrls();
        if (!cancelled) {
          setUrls(data);
        }
      } catch (fetchError) {
        showError(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load URLs",
        );
        if (!cancelled) {
          setError("");
        }
      } finally {
        if (!cancelled) {
          setFetching(false);
        }
      }
    };

    void fetchUrls();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError("");

    try {
      await deleteShortUrl(id);
      setUrls((current) => current.filter((item) => item.id !== id));
      showSuccess("URL deleted successfully");
    } catch (deleteError) {
      showError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete URL",
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading || fetching) {
    return (
      <section className="mx-auto w-full max-w-4xl px-4 py-12">
        <PageTitle title="Dashboard" />
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.10] bg-black/80 p-4 shadow-[0_25px_80px_-35px_rgba(139,92,246,0.3)] backdrop-blur-xl sm:p-6">
          {/* Subtle loading glow */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-950/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative flex min-h-[120px] flex-col items-center justify-center">
            {/* Spinner */}
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/[0.08] border-t-white/70" />

            <p className="mt-4 text-sm font-medium text-zinc-400">
              Loading dashboard...
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              Fetching your shortened links
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative mx-auto w-full max-w-4xl px-4 py-12">
      <PageTitle title="Dashboard" />
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-950/10 blur-[110px]"
        aria-hidden="true"
      />

      <div className="relative rounded-2xl border border-white/[0.10] bg-black/80 p-4 shadow-[0_25px_80px_-35px_rgba(139,92,246,0.3)] backdrop-blur-xl sm:p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.03em] text-white sm:text-3xl">
            My shortened URLs
          </h1>

          <p className="mt-1.5 text-sm text-zinc-500">
            Manage your links. Deletions are permanent.
          </p>
        </div>

        {/* Error */}
        {error ? (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3 py-2.5 text-xs text-red-400 sm:text-sm">
            {error}
          </div>
        ) : null}

        {/* Empty state */}
        {urls.length === 0 ? (
          <div className="mt-6 flex min-h-[150px] items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 py-8 text-center">
            <div>
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
                <Link2 className="h-4 w-4 text-zinc-500" strokeWidth={1.8} />
              </div>

              <p className="mt-3 text-sm font-medium text-zinc-300">
                No shortened URLs yet.
              </p>

              <p className="mt-1 text-xs text-zinc-600">
                Your shortened links will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border border-white/[0.08]">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-white/[0.08] bg-white/[0.025]">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
                      Slug
                    </th>

                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
                      Original URL
                    </th>

                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
                      Short URL
                    </th>

                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/[0.06]">
                  {urls.map((item) => (
                    <tr
                      key={item.id}
                      className="bg-black/40 transition-colors hover:bg-white/[0.025]"
                    >
                      {/* Slug */}
                      <td className="px-4 py-4 align-top">
                        <span className="inline-flex rounded-lg border border-white/[0.08] bg-white/[0.035] px-2 py-1 font-mono text-[11px] text-zinc-300">
                          {item.slug}
                        </span>
                      </td>

                      {/* Original URL */}
                      <td className="max-w-xs px-4 py-4 align-top">
                        <span className="block break-all text-xs leading-5 text-zinc-500">
                          {item.originalUrl}
                        </span>
                      </td>

                      {/* Short URL */}
                      <td className="max-w-xs px-4 py-4 align-top">
                        <a
                          href={item.shortUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="group flex items-start gap-1.5 break-all text-xs font-medium text-zinc-300 transition-colors hover:text-white"
                        >
                          <span>{item.shortUrl}</span>

                          <ExternalLink
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600 transition-colors group-hover:text-zinc-300"
                            strokeWidth={1.8}
                          />
                        </a>
                      </td>

                      {/* Delete */}
                      <td className="px-4 py-4 align-top">
                        <button
                          type="button"
                          onClick={() => void handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/15 bg-red-500/[0.05] px-2.5 py-1.5 text-[11px] font-semibold text-red-400 transition-colors hover:border-red-500/25 hover:bg-red-500/[0.10] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-3 w-3" strokeWidth={1.8} />

                          {deletingId === item.id ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
