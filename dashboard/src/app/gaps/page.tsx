"use client";

import { useEffect, useState, useCallback } from "react";

interface Gap {
  id: string;
  subRepo: string;
  gapType: string;
  provider: string;
  description: string;
  severity: string;
  ocTask: string;
  resolved: boolean;
  detectedAt?: string;
  resolvedAt?: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  LOW: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  HIGH: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  CRITICAL: "bg-red-500/20 text-red-400 border-red-500/30",
};

const SEVERITY_DOT: Record<string, string> = {
  LOW: "bg-gray-400",
  MEDIUM: "bg-yellow-400",
  HIGH: "bg-orange-400",
  CRITICAL: "bg-red-400",
};

export default function GapsPage() {
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [resolvedFilter, setResolvedFilter] = useState<string>("false");
  const [gapTypeFilter, setGapTypeFilter] = useState("");
  const [subRepoFilter, setSubRepoFilter] = useState("");

  const fetchGaps = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (resolvedFilter) params.set("resolved", resolvedFilter);
      if (gapTypeFilter) params.set("gapType", gapTypeFilter);
      if (subRepoFilter) params.set("subRepo", subRepoFilter);

      const queryString = params.toString();
      const url = `/api/gaps${queryString ? `?${queryString}` : ""}`;
      const res = await fetch(url);

      if (!res.ok) throw new Error("Failed to fetch gap data");

      const data = await res.json();
      setGaps(Array.isArray(data) ? data : data.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to load gap data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [resolvedFilter, gapTypeFilter, subRepoFilter]);

  useEffect(() => {
    fetchGaps();
  }, [fetchGaps]);

  // Extract unique values for filters
  const gapTypes = [...new Set(gaps.map((g) => g.gapType))].filter(Boolean).sort();
  const subRepos = [...new Set(gaps.map((g) => g.subRepo))].filter(Boolean).sort();

  // Summary counts
  const criticalCount = gaps.filter((g) => g.severity === "CRITICAL" && !g.resolved).length;
  const highCount = gaps.filter((g) => g.severity === "HIGH" && !g.resolved).length;
  const mediumCount = gaps.filter((g) => g.severity === "MEDIUM" && !g.resolved).length;
  const lowCount = gaps.filter((g) => g.severity === "LOW" && !g.resolved).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Gap Detection</h1>
        <p className="text-gray-400 mt-1">
          Infrastructure gaps and compliance alerts across sub-repositories
        </p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
          {error} -- Ensure the /api/gaps endpoint is configured.
        </div>
      )}

      {/* Severity Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="text-xs font-medium text-red-400 uppercase">Critical</span>
          </div>
          <p className="text-2xl font-bold text-white">{criticalCount}</p>
        </div>
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
            <span className="text-xs font-medium text-orange-400 uppercase">High</span>
          </div>
          <p className="text-2xl font-bold text-white">{highCount}</p>
        </div>
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span className="text-xs font-medium text-yellow-400 uppercase">Medium</span>
          </div>
          <p className="text-2xl font-bold text-white">{mediumCount}</p>
        </div>
        <div className="bg-gray-500/5 border border-gray-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
            <span className="text-xs font-medium text-gray-400 uppercase">Low</span>
          </div>
          <p className="text-2xl font-bold text-white">{lowCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-medium">Status</label>
          <select
            value={resolvedFilter}
            onChange={(e) => setResolvedFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[160px]"
          >
            <option value="">All</option>
            <option value="false">Unresolved</option>
            <option value="true">Resolved</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-medium">Gap Type</label>
          <select
            value={gapTypeFilter}
            onChange={(e) => setGapTypeFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[160px]"
          >
            <option value="">All Types</option>
            {gapTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-medium">Sub-Repo</label>
          <select
            value={subRepoFilter}
            onChange={(e) => setSubRepoFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[160px]"
          >
            <option value="">All Repos</option>
            {subRepos.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        {(resolvedFilter !== "false" || gapTypeFilter || subRepoFilter) && (
          <div className="flex items-end">
            <button
              onClick={() => {
                setResolvedFilter("false");
                setGapTypeFilter("");
                setSubRepoFilter("");
              }}
              className="px-3 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="mb-4">
        <p className="text-sm text-gray-500">
          Showing {gaps.length} gap{gaps.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Gap List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading gaps...</p>
          </div>
        </div>
      ) : gaps.length === 0 ? (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-12 text-center">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No Gaps Found</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            No infrastructure gaps detected with the current filters.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {gaps.map((gap) => {
            const severityKey = gap.severity?.toUpperCase() || "LOW";
            return (
              <div
                key={gap.id}
                className={`bg-gray-800/50 border rounded-xl p-5 hover:bg-gray-800/70 transition-colors ${
                  gap.resolved ? "border-gray-700/30 opacity-60" : "border-gray-700/50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left side */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {/* Severity badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          SEVERITY_COLORS[severityKey] || SEVERITY_COLORS.LOW
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${SEVERITY_DOT[severityKey] || SEVERITY_DOT.LOW}`} />
                        {gap.severity}
                      </span>

                      {/* Gap type */}
                      <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-0.5 rounded font-medium">
                        {gap.gapType}
                      </span>

                      {/* Resolved badge */}
                      {gap.resolved ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Resolved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                          </svg>
                          Open
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-200 mb-2">{gap.description}</p>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <span className="font-mono">{gap.subRepo}</span>
                      </span>

                      {gap.provider && (
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                          </svg>
                          {gap.provider}
                        </span>
                      )}

                      {gap.ocTask && (
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                          <span className="text-indigo-400 font-mono">{gap.ocTask}</span>
                        </span>
                      )}

                      {gap.detectedAt && (
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Detected: {new Date(gap.detectedAt).toLocaleDateString()}
                        </span>
                      )}

                      {gap.resolvedAt && (
                        <span className="flex items-center gap-1.5 text-emerald-500">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Resolved: {new Date(gap.resolvedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
