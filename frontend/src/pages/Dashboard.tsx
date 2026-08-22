import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { deleteShortUrl, getMyShortUrls } from "@/services/url.service.js";
import { useAuth } from "@/hooks/use-auth.js";
import type { UserShortUrl } from "@/types/url.js";
import { showError, showSuccess } from "@/utils/toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [urls, setUrls] = useState<UserShortUrl[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
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
        showError(fetchError instanceof Error ? fetchError.message : "Failed to load URLs");
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
      showError(deleteError instanceof Error ? deleteError.message : "Failed to delete URL");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading || fetching) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-14 lg:py-20">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-[0_24px_80px_-30px_rgba(37,99,235,0.35)]">
          Loading dashboard...
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14 lg:py-20">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_-30px_rgba(37,99,235,0.35)]">
        <h1 className="text-2xl font-semibold text-slate-900">My shortened URLs</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your links. Deletions are permanent.
        </p>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {urls.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
            No shortened URLs yet.
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Slug
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Original URL
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Short URL
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {urls.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-4 text-sm font-medium text-slate-900">{item.slug}</td>
                    <td className="max-w-sm px-4 py-4 text-sm text-slate-600">
                      <span className="block break-all">{item.originalUrl}</span>
                    </td>
                    <td className="max-w-sm px-4 py-4 text-sm">
                      <a
                        href={item.shortUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block break-all text-blue-700 underline"
                      >
                        {item.shortUrl}
                      </a>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <button
                        type="button"
                        onClick={() => void handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {deletingId === item.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
