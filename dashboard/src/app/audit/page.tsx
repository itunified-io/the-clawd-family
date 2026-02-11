"use client";

import { useEffect, useState, useCallback } from "react";

interface AuditEntry {
  id: string;
  timestamp: string;
  correlationId: string;
  jiraIssue: string;
  agentRole: string;
  actionType: string;
  resource: string;
  result: string;
  humanApproved: boolean;
  details?: string;
}

const ROLE_COLORS: Record<string, string> = {
  Requirements: "bg-blue-500/20 text-blue-400",
  Architecture: "bg-purple-500/20 text-purple-400",
  Planning: "bg-indigo-500/20 text-indigo-400",
  FE: "bg-cyan-500/20 text-cyan-400",
  BE: "bg-green-500/20 text-green-400",
  QA: "bg-orange-500/20 text-orange-400",
  Security: "bg-red-500/20 text-red-400",
  Documentation: "bg-yellow-500/20 text-yellow-400",
  DevOps: "bg-teal-500/20 text-teal-400",
  "Implementation Audit": "bg-pink-500/20 text-pink-400",
};

const AGENT_ROLES = [
  "Requirements",
  "Architecture",
  "Planning",
  "FE",
  "BE",
  "QA",
  "Security",
  "Documentation",
  "DevOps",
  "Implementation Audit",
];

const RESULT_COLORS: Record<string, string> = {
  success: "bg-emerald-500/20 text-emerald-400",
  failure: "bg-red-500/20 text-red-400",
  pending: "bg-yellow-500/20 text-yellow-400",
  skipped: "bg-gray-500/20 text-gray-400",
};

const PAGE_SIZE = 25;

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [agentRoleFilter, setAgentRoleFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAudit = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (agentRoleFilter) params.set("agentRole", agentRoleFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const queryString = params.toString();
      const url = `/api/audit${queryString ? `?${queryString}` : ""}`;
      const res = await fetch(url);

      if (!res.ok) throw new Error("Failed to fetch audit data");

      const data = await res.json();
      setEntries(Array.isArray(data) ? data : data.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to load audit data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [agentRoleFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchAudit();
  }, [fetchAudit]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [agentRoleFilter, dateFrom, dateTo, searchQuery]);

  // Client-side search filtering
  const filteredEntries = entries.filter((entry) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      entry.jiraIssue?.toLowerCase().includes(q) ||
      entry.correlationId?.toLowerCase().includes(q) ||
      entry.actionType?.toLowerCase().includes(q) ||
      entry.resource?.toLowerCase().includes(q) ||
      entry.agentRole?.toLowerCase().includes(q)
    );
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Audit Trail</h1>
        <p className="text-gray-400 mt-1">
          Complete history of agent actions and infrastructure changes
        </p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
          {error} -- Ensure the /api/audit endpoint is configured.
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 min-w-[240px]">
          <label className="block text-xs text-gray-500 mb-1.5 font-medium">Search</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by Jira issue, correlation ID, action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Agent Role Filter */}
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-medium">Agent Role</label>
          <select
            value={agentRoleFilter}
            onChange={(e) => setAgentRoleFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[180px]"
          >
            <option value="">All Roles</option>
            {AGENT_ROLES.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-medium">Date From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-medium">Date To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Clear filters */}
        {(agentRoleFilter || dateFrom || dateTo || searchQuery) && (
          <div className="flex items-end">
            <button
              onClick={() => {
                setAgentRoleFilter("");
                setDateFrom("");
                setDateTo("");
                setSearchQuery("");
              }}
              className="px-3 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {(currentPage - 1) * PAGE_SIZE + 1}--
          {Math.min(currentPage * PAGE_SIZE, filteredEntries.length)} of{" "}
          {filteredEntries.length} entr{filteredEntries.length !== 1 ? "ies" : "y"}
        </p>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading audit trail...</p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Timestamp</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Jira Issue</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Agent Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Action Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Resource</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Result</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Human Approved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30">
                {paginatedEntries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                      No audit entries found
                    </td>
                  </tr>
                ) : (
                  paginatedEntries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-gray-700/20 transition-colors"
                    >
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(entry.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-indigo-400">
                        {entry.jiraIssue}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            ROLE_COLORS[entry.agentRole] || "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {entry.agentRole}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-xs">{entry.actionType}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-300 max-w-[200px] truncate">
                        {entry.resource}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            RESULT_COLORS[entry.result?.toLowerCase()] ||
                            "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {entry.result}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {entry.humanApproved ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-500 text-xs">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            No
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700/50">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (currentPage <= 4) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = currentPage - 3 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? "bg-indigo-600 text-white"
                          : "text-gray-400 hover:bg-gray-700/50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
