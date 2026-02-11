"use client";

import { useEffect, useState, useCallback } from "react";

interface InfraResource {
  id: string;
  subRepo: string;
  provider: string;
  resourceType: string;
  environment: string;
  name: string;
  lifecycle: string;
  ocTask: string;
  provisionedDate: string;
}

const LIFECYCLE_COLORS: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  deprecated: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  decommissioned: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function InfrastructurePage() {
  const [resources, setResources] = useState<InfraResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [providerFilter, setProviderFilter] = useState("");
  const [environmentFilter, setEnvironmentFilter] = useState("");
  const [lifecycleFilter, setLifecycleFilter] = useState("");

  const fetchResources = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (providerFilter) params.set("provider", providerFilter);
      if (environmentFilter) params.set("environment", environmentFilter);
      if (lifecycleFilter) params.set("lifecycle", lifecycleFilter);

      const queryString = params.toString();
      const url = `/api/infrastructure${queryString ? `?${queryString}` : ""}`;
      const res = await fetch(url);

      if (!res.ok) throw new Error("Failed to fetch infrastructure data");

      const data = await res.json();
      setResources(Array.isArray(data) ? data : data.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to load infrastructure data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [providerFilter, environmentFilter, lifecycleFilter]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Extract unique values for filter dropdowns
  const providers = [...new Set(resources.map((r) => r.provider))].filter(Boolean).sort();
  const environments = [...new Set(resources.map((r) => r.environment))].filter(Boolean).sort();
  const lifecycles = [...new Set(resources.map((r) => r.lifecycle))].filter(Boolean).sort();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Infrastructure</h1>
        <p className="text-gray-400 mt-1">
          All provisioned infrastructure resources across sub-repositories
        </p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
          {error} -- Ensure the /api/infrastructure endpoint is configured.
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-medium">Provider</label>
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[160px]"
          >
            <option value="">All Providers</option>
            {providers.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-medium">Environment</label>
          <select
            value={environmentFilter}
            onChange={(e) => setEnvironmentFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[160px]"
          >
            <option value="">All Environments</option>
            {environments.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-medium">Lifecycle</label>
          <select
            value={lifecycleFilter}
            onChange={(e) => setLifecycleFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[160px]"
          >
            <option value="">All Lifecycles</option>
            {lifecycles.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        {(providerFilter || environmentFilter || lifecycleFilter) && (
          <div className="flex items-end">
            <button
              onClick={() => {
                setProviderFilter("");
                setEnvironmentFilter("");
                setLifecycleFilter("");
              }}
              className="px-3 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="mb-4">
        <p className="text-sm text-gray-500">
          Showing {resources.length} resource{resources.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading infrastructure...</p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Sub-Repo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Provider</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Environment</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Lifecycle</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">OC Task</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Provisioned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30">
                {resources.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                      No infrastructure resources found
                    </td>
                  </tr>
                ) : (
                  resources.map((resource) => (
                    <tr
                      key={resource.id}
                      className="hover:bg-gray-700/20 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-300">{resource.subRepo}</td>
                      <td className="px-4 py-3 text-gray-300">{resource.provider}</td>
                      <td className="px-4 py-3 text-gray-300">{resource.resourceType}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-700/50 text-gray-300">
                          {resource.environment}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-300">{resource.name}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            LIFECYCLE_COLORS[resource.lifecycle?.toLowerCase()] ||
                            "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          }`}
                        >
                          {resource.lifecycle}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-indigo-400">{resource.ocTask}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {resource.provisionedDate
                          ? new Date(resource.provisionedDate).toLocaleDateString()
                          : "--"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
