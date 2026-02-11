"use client";

import { useEffect, useState, useCallback } from "react";

interface Agent {
  id: string;
  subRepo: string;
  agentRole: string;
  jiraIssue: string;
  status: string;
  startedAt: string;
  description: string;
  model: string;
  worktree?: string;
  branch?: string;
}

const ROLE_CONFIG: Record<string, { color: string; bgColor: string; borderColor: string; icon: string }> = {
  Requirements: {
    color: "text-blue-400",
    bgColor: "bg-blue-500/15",
    borderColor: "border-blue-500/30",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  Architecture: {
    color: "text-purple-400",
    bgColor: "bg-purple-500/15",
    borderColor: "border-purple-500/30",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  },
  Planning: {
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/15",
    borderColor: "border-indigo-500/30",
    icon: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  },
  FE: {
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/15",
    borderColor: "border-cyan-500/30",
    icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
  },
  BE: {
    color: "text-green-400",
    bgColor: "bg-green-500/15",
    borderColor: "border-green-500/30",
    icon: "M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01",
  },
  QA: {
    color: "text-orange-400",
    bgColor: "bg-orange-500/15",
    borderColor: "border-orange-500/30",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  Security: {
    color: "text-red-400",
    bgColor: "bg-red-500/15",
    borderColor: "border-red-500/30",
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  },
  Documentation: {
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/15",
    borderColor: "border-yellow-500/30",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  },
  DevOps: {
    color: "text-teal-400",
    bgColor: "bg-teal-500/15",
    borderColor: "border-teal-500/30",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  },
  "Implementation Audit": {
    color: "text-pink-400",
    bgColor: "bg-pink-500/15",
    borderColor: "border-pink-500/30",
    icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  },
};

function getElapsedTime(startedAt: string): string {
  const start = new Date(startedAt).getTime();
  const now = Date.now();
  const diffMs = now - start;

  if (diffMs < 0) return "just started";

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch("/api/agents?status=active");
      if (!res.ok) throw new Error("Failed to fetch agents");
      const data = await res.json();
      setAgents(Array.isArray(data) ? data : data.data || []);
      setError(null);
      setLastRefresh(new Date());
    } catch (err) {
      setError("Failed to load agent data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchAgents, 10000);
    return () => clearInterval(interval);
  }, [fetchAgents]);

  // Force re-render every second to update elapsed times
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Group agents by sub-repo
  const groupedByRepo: Record<string, Agent[]> = {};
  agents.forEach((agent) => {
    const repo = agent.subRepo || "unknown";
    if (!groupedByRepo[repo]) groupedByRepo[repo] = [];
    groupedByRepo[repo].push(agent);
  });

  const sortedRepos = Object.keys(groupedByRepo).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading active agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Active Agents</h1>
          <p className="text-gray-400 mt-1">
            Real-time view of Claude agents working across repositories
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Auto-refreshing every 10s
          </div>
          <span className="text-xs text-gray-600">
            Last: {lastRefresh.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
          {error} -- Ensure the /api/agents endpoint is configured.
        </div>
      )}

      {/* Role Legend */}
      <div className="mb-6 bg-gray-800/30 border border-gray-700/30 rounded-xl p-4">
        <p className="text-xs text-gray-500 font-medium mb-3 uppercase tracking-wider">Agent Roles</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(ROLE_CONFIG).map(([role, config]) => (
            <span
              key={role}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${config.bgColor} ${config.color} border ${config.borderColor}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
              </svg>
              {role}
            </span>
          ))}
        </div>
      </div>

      {/* Agent Count Summary */}
      <div className="mb-6 flex items-center gap-4">
        <span className="text-sm text-gray-400">
          <span className="text-white font-semibold">{agents.length}</span> active agent{agents.length !== 1 ? "s" : ""} across{" "}
          <span className="text-white font-semibold">{sortedRepos.length}</span> repositor{sortedRepos.length !== 1 ? "ies" : "y"}
        </span>
      </div>

      {/* No active agents state */}
      {agents.length === 0 ? (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-12 text-center">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No Active Agents</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            There are no Claude agents currently running. Agents will appear here when they are
            assigned to work on Jira issues in sub-repositories.
          </p>
        </div>
      ) : (
        /* Grouped by sub-repo */
        <div className="space-y-8">
          {sortedRepos.map((repoName) => {
            const repoAgents = groupedByRepo[repoName];
            return (
              <div key={repoName}>
                {/* Repo header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <h2 className="text-lg font-semibold text-white font-mono">{repoName}</h2>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                    {repoAgents.length} agent{repoAgents.length !== 1 ? "s" : ""}
                  </span>
                  {/* Show which roles are active on this repo */}
                  <div className="flex gap-1.5 ml-auto">
                    {repoAgents.map((agent) => {
                      const config = ROLE_CONFIG[agent.agentRole] || {
                        color: "text-gray-400",
                        bgColor: "bg-gray-500/15",
                        borderColor: "border-gray-500/30",
                        icon: "M13 10V3L4 14h7v7l9-11h-7z",
                      };
                      return (
                        <span
                          key={agent.id}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.bgColor} ${config.color} border ${config.borderColor}`}
                          title={`${agent.agentRole} - ${agent.jiraIssue}`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
                          </svg>
                          {agent.agentRole}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Agent cards for this repo */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {repoAgents.map((agent) => {
                    const config = ROLE_CONFIG[agent.agentRole] || {
                      color: "text-gray-400",
                      bgColor: "bg-gray-500/15",
                      borderColor: "border-gray-500/30",
                      icon: "M13 10V3L4 14h7v7l9-11h-7z",
                    };

                    return (
                      <div
                        key={agent.id}
                        className={`bg-gray-800/50 border rounded-xl p-5 hover:bg-gray-800/70 transition-colors ${config.borderColor}`}
                      >
                        {/* Card header: Role badge + status */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${config.bgColor}`}>
                              <svg className={`w-5 h-5 ${config.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
                              </svg>
                            </div>
                            <div>
                              <span className={`text-sm font-semibold ${config.color}`}>
                                {agent.agentRole}
                              </span>
                              <p className="text-xs text-gray-500 font-mono">{agent.jiraIssue}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs text-emerald-400 font-medium">Active</span>
                          </div>
                        </div>

                        {/* Description */}
                        {agent.description && (
                          <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                            {agent.description}
                          </p>
                        )}

                        {/* Meta details */}
                        <div className="space-y-2 pt-3 border-t border-gray-700/30">
                          {/* Duration */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Duration</span>
                            <span className="text-gray-300 font-mono">
                              {getElapsedTime(agent.startedAt)}
                            </span>
                          </div>
                          {/* Model */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Model</span>
                            <span className="text-gray-300 font-mono">{agent.model || "--"}</span>
                          </div>
                          {/* Started */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Started</span>
                            <span className="text-gray-400">
                              {new Date(agent.startedAt).toLocaleString()}
                            </span>
                          </div>
                          {/* Branch */}
                          {agent.branch && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Branch</span>
                              <span className="text-gray-300 font-mono truncate max-w-[180px]">
                                {agent.branch}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
