"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface InfraResource {
  id: string;
  subRepo: string;
  provider: string;
  resourceType: string;
  environment: string;
  name: string;
  lifecycle: string;
}

interface Agent {
  id: string;
  subRepo: string;
  agentRole: string;
  jiraIssue: string;
  status: string;
  startedAt: string;
  description: string;
  model: string;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  jiraIssue: string;
  agentRole: string;
  actionType: string;
  resource: string;
  result: string;
}

interface Gap {
  id: string;
  subRepo: string;
  gapType: string;
  severity: string;
  resolved: boolean;
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

export default function DashboardPage() {
  const [resources, setResources] = useState<InfraResource[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [infraRes, agentsRes, auditRes, gapsRes] = await Promise.allSettled([
          fetch("/api/infrastructure"),
          fetch("/api/agents"),
          fetch("/api/audit"),
          fetch("/api/gaps"),
        ]);

        if (infraRes.status === "fulfilled" && infraRes.value.ok) {
          const data = await infraRes.value.json();
          setResources(Array.isArray(data) ? data : data.data || []);
        }
        if (agentsRes.status === "fulfilled" && agentsRes.value.ok) {
          const data = await agentsRes.value.json();
          setAgents(Array.isArray(data) ? data : data.data || []);
        }
        if (auditRes.status === "fulfilled" && auditRes.value.ok) {
          const data = await auditRes.value.json();
          setAuditEntries(Array.isArray(data) ? data : data.data || []);
        }
        if (gapsRes.status === "fulfilled" && gapsRes.value.ok) {
          const data = await gapsRes.value.json();
          setGaps(Array.isArray(data) ? data : data.data || []);
        }
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const activeAgents = agents.filter((a) => a.status === "active");
  const openGaps = gaps.filter((g) => !g.resolved);
  const recentAudit = auditEntries.slice(0, 5);

  // Group active agents by role for the role breakdown
  const roleBreakdown: Record<string, number> = {};
  activeAgents.forEach((a) => {
    roleBreakdown[a.agentRole] = (roleBreakdown[a.agentRole] || 0) + 1;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Infrastructure orchestration overview</p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
          {error} -- Showing available data. Ensure API routes are configured.
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Resources */}
        <Link href="/infrastructure" className="block">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 hover:border-gray-600 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{resources.length}</p>
            <p className="text-sm text-gray-400 mt-1">Total Resources</p>
          </div>
        </Link>

        {/* Active Agents */}
        <Link href="/agents" className="block">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 hover:border-gray-600 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{activeAgents.length}</p>
            <p className="text-sm text-gray-400 mt-1">Active Agents</p>
            {/* Role breakdown */}
            {Object.keys(roleBreakdown).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {Object.entries(roleBreakdown).map(([role, count]) => (
                  <span
                    key={role}
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      ROLE_COLORS[role] || "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {role}: {count}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Link>

        {/* Open Gaps */}
        <Link href="/gaps" className="block">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 hover:border-gray-600 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{openGaps.length}</p>
            <p className="text-sm text-gray-400 mt-1">Open Gaps</p>
          </div>
        </Link>

        {/* Recent Audit */}
        <Link href="/audit" className="block">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 hover:border-gray-600 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{auditEntries.length}</p>
            <p className="text-sm text-gray-400 mt-1">Audit Entries</p>
          </div>
        </Link>
      </div>

      {/* Bottom Section: Recent Audit + Active Agents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Audit Trail */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Audit Trail</h2>
            <Link href="/audit" className="text-sm text-indigo-400 hover:text-indigo-300">
              View all
            </Link>
          </div>
          {recentAudit.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">No audit entries found</p>
          ) : (
            <div className="space-y-3">
              {recentAudit.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-900/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          ROLE_COLORS[entry.agentRole] || "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {entry.agentRole}
                      </span>
                      <span className="text-xs text-gray-500">
                        {entry.jiraIssue}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 truncate">
                      {entry.actionType} - {entry.resource}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      entry.result === "success"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : entry.result === "failure"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {entry.result}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Agents Summary */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Active Agents</h2>
            <Link href="/agents" className="text-sm text-indigo-400 hover:text-indigo-300">
              View all
            </Link>
          </div>
          {activeAgents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <svg className="w-12 h-12 text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 text-sm">No active agents</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeAgents.slice(0, 5).map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-900/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          ROLE_COLORS[agent.agentRole] || "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {agent.agentRole}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        {agent.subRepo}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 truncate">
                      {agent.description || agent.jiraIssue}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {agent.model} -- Started{" "}
                      {new Date(agent.startedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-emerald-400">Running</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
