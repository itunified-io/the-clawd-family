"use client";

import { useEffect, useState, useCallback } from "react";

interface VersionInfo {
  version: string | null;
  updatedAt: string;
  chunkCount: number;
  embeddingCount: number;
}

interface Section {
  id: string;
  section: string;
  headingLevel: number;
  sectionIndex: number;
  version: string;
  rolesAffected: string[];
  gateType: string | null;
  hasEmbedding: boolean;
}

interface SearchResult {
  id: string;
  section: string;
  content: string;
  version: string;
  headingLevel: number;
  rolesAffected: string[];
  gateType: string | null;
  similarity: number;
  score?: number;
}

interface SearchResponse {
  results: SearchResult[];
  searchMode: "vector" | "keyword";
  count: number;
}

const ROLE_OPTIONS = [
  "ALL",
  "REQUIREMENTS",
  "ARCHITECTURE",
  "PLANNING",
  "FRONTEND",
  "BACKEND",
  "QA",
  "SECURITY",
  "DOCUMENTATION",
  "DEVOPS",
];

export default function GovernancePage() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchRole, setSearchRole] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [searching, setSearching] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [versionRes, sectionsRes] = await Promise.all([
        fetch("/api/governance/version"),
        fetch("/api/governance/sections"),
      ]);

      if (versionRes.ok) {
        const v = await versionRes.json();
        setVersionInfo(v);
      } else {
        setVersionInfo(null);
      }

      if (sectionsRes.ok) {
        const s = await sectionsRes.json();
        setSections(s.sections || []);
      }

      setError(null);
    } catch (err) {
      setError("Failed to load governance data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await fetch("/api/governance/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          role: searchRole || undefined,
          limit: 10,
        }),
      });

      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error(err);
      setSearchResults(null);
    } finally {
      setSearching(false);
    }
  };

  const embeddingPercent =
    versionInfo && versionInfo.chunkCount > 0
      ? Math.round((versionInfo.embeddingCount / versionInfo.chunkCount) * 100)
      : 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Governance</h1>
        <p className="text-gray-400 mt-1">
          RAG-based governance policy management and search
        </p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading governance data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <OverviewCard
              label="Version"
              value={versionInfo?.version ?? "Not ingested"}
              sub={
                versionInfo?.updatedAt
                  ? `Updated ${new Date(versionInfo.updatedAt).toLocaleDateString()}`
                  : undefined
              }
            />
            <OverviewCard
              label="Chunks"
              value={versionInfo?.chunkCount?.toString() ?? "0"}
              sub="Governance sections"
            />
            <OverviewCard
              label="Embeddings"
              value={
                versionInfo
                  ? `${versionInfo.embeddingCount} / ${versionInfo.chunkCount}`
                  : "0 / 0"
              }
              sub={`${embeddingPercent}% coverage`}
              status={
                embeddingPercent === 100
                  ? "success"
                  : embeddingPercent > 0
                  ? "warning"
                  : "inactive"
              }
            />
            <OverviewCard
              label="Search Mode"
              value={embeddingPercent > 0 ? "Vector" : "Keyword"}
              sub={
                embeddingPercent > 0
                  ? "Cosine similarity"
                  : "Fallback scoring"
              }
              status={embeddingPercent > 0 ? "success" : "warning"}
            />
          </div>

          {/* Search Tester */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">
              Search Tester
            </h2>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex-1 min-w-[240px]">
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">
                  Query
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="e.g. What are the QA gates?"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">
                  Role Filter
                </label>
                <select
                  value={searchRole}
                  onChange={(e) => setSearchRole(e.target.value)}
                  className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[160px]"
                >
                  <option value="">All Roles</option>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  disabled={searching || !searchQuery.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {searching ? "Searching..." : "Search"}
                </button>
              </div>
            </div>

            {searchResults && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm text-gray-400">
                    {searchResults.count} result
                    {searchResults.count !== 1 ? "s" : ""}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      searchResults.searchMode === "vector"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    }`}
                  >
                    {searchResults.searchMode}
                  </span>
                </div>
                <div className="space-y-3">
                  {searchResults.results.map((result) => (
                    <div
                      key={result.id}
                      className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-sm font-medium text-white">
                          {result.section}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {searchResults.searchMode === "vector"
                            ? `${(result.similarity * 100).toFixed(1)}% match`
                            : `score: ${result.score ?? result.similarity}`}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-3">
                        {result.content.slice(0, 300)}
                        {result.content.length > 300 ? "..." : ""}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {result.rolesAffected.map((role) => (
                          <span
                            key={role}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-700/50 text-gray-400"
                          >
                            {role}
                          </span>
                        ))}
                        {result.gateType && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-indigo-500/20 text-indigo-400">
                            {result.gateType}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sections Table */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700/50">
              <h2 className="text-lg font-semibold text-white">
                Governance Sections
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {sections.length} section{sections.length !== 1 ? "s" : ""} ingested
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      #
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Section
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Roles
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Gate
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Embedding
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30">
                  {sections.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-gray-500"
                      >
                        No governance sections found. Ingest AGENT.md via POST
                        /api/governance.
                      </td>
                    </tr>
                  ) : (
                    sections.map((section) => (
                      <tr
                        key={section.id}
                        className="hover:bg-gray-700/20 transition-colors"
                      >
                        <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                          {section.sectionIndex}
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          <span
                            style={{
                              paddingLeft: `${(section.headingLevel - 1) * 16}px`,
                            }}
                          >
                            {section.section}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                          {"#".repeat(section.headingLevel)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {section.rolesAffected.slice(0, 3).map((role) => (
                              <span
                                key={role}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-700/50 text-gray-400"
                              >
                                {role}
                              </span>
                            ))}
                            {section.rolesAffected.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{section.rolesAffected.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {section.gateType && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                              {section.gateType}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${
                              section.hasEmbedding
                                ? "bg-emerald-500"
                                : "bg-gray-600"
                            }`}
                            title={
                              section.hasEmbedding
                                ? "Embedding generated"
                                : "No embedding"
                            }
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function OverviewCard({
  label,
  value,
  sub,
  status,
}: {
  label: string;
  value: string;
  sub?: string;
  status?: "success" | "warning" | "inactive";
}) {
  const statusDot = status
    ? {
        success: "bg-emerald-500",
        warning: "bg-yellow-500",
        inactive: "bg-gray-600",
      }[status]
    : null;

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {label}
        </span>
        {statusDot && (
          <div className={`w-2 h-2 rounded-full ${statusDot}`} />
        )}
      </div>
      <p className="text-xl font-semibold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}
