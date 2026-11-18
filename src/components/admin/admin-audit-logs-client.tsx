"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  FileText,
  ShieldAlert,
  RefreshCw,
  Loader2,
  Calendar,
  User,
  ChevronDown,
  ChevronRight,
  Code,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { getAuditLogsAction } from "@/server/actions/admin-staff-actions";

interface AuditLogEntry {
  id: string;
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  before: any;
  after: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date | string;
  actor: {
    name: string | null;
    email: string | null;
    role: string;
  } | null;
}

export function AdminAuditLogsClient() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    const res = await getAuditLogsAction(100);
    if (res.success && res.logs) {
      setLogs(res.logs as AuditLogEntry[]);
    } else {
      toast.error(res.error || "Failed to load audit logs");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(term) ||
      log.entityType.toLowerCase().includes(term) ||
      (log.actorEmail && log.actorEmail.toLowerCase().includes(term)) ||
      (log.actor?.name && log.actor.name.toLowerCase().includes(term))
    );
  });

  const getActionBadge = (action: string) => {
    if (action.includes("DELETE") || action.includes("DEMOTE")) {
      return (
        <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-red-100 text-red-700">
          {action}
        </span>
      );
    }
    if (action.includes("CREATE") || action.includes("PROVISION")) {
      return (
        <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-green-100 text-green-700">
          {action}
        </span>
      );
    }
    if (action.includes("ROLE") || action.includes("SECURITY")) {
      return (
        <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-purple-100 text-purple-700">
          {action}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-blue-100 text-blue-700">
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl" data-testid="admin-audit-logs-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)] flex items-center gap-2.5">
            <ShieldAlert className="w-7 h-7 text-purple-600" />
            Security & System Audit Logs
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Super Admin restricted. Immutable event logs detailing administrative actions, role modifications, and critical updates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Logs
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by action, actor, or entity type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <span className="text-xs text-gray-500">
          Showing {filteredLogs.length} of {logs.length} logged events
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-600" />
            <p className="text-sm">Retrieving audit records...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium">No audit events match the filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-[var(--border)]">
                <tr>
                  <th className="py-3 px-4 w-8"></th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log) => {
                  const isExpanded = expandedId === log.id;
                  const hasDetails = log.before || log.after;

                  return (
                    <tbody key={log.id}>
                      <tr
                        className={`hover:bg-gray-50/80 transition-colors ${
                          isExpanded ? "bg-purple-50/20" : ""
                        }`}
                      >
                        <td className="py-3.5 px-3">
                          {hasDetails && (
                            <button
                              aria-label={isExpanded ? "Collapse log details" : "Expand log details"}
                              onClick={() =>
                                setExpandedId(isExpanded ? null : log.id)
                              }
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {new Date(log.createdAt).toLocaleString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {getActionBadge(log.action)}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-medium text-gray-900 text-xs flex items-center gap-1">
                            <User className="w-3 h-3 text-gray-400" />
                            {log.actor?.name || log.actorEmail || "System"}
                          </div>
                          {log.actor?.role && (
                            <span className="text-[10px] text-gray-500 uppercase">
                              [{log.actor.role}]
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-xs font-mono font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                            {log.entityType}
                          </span>
                          {log.entityId && (
                            <span className="text-xs text-gray-400 ml-1.5 font-mono">
                              #{log.entityId.slice(0, 8)}...
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {hasDetails ? (
                            <button
                              onClick={() =>
                                setExpandedId(isExpanded ? null : log.id)
                              }
                              className="text-xs font-semibold text-purple-600 hover:text-purple-800"
                            >
                              {isExpanded ? "Hide Diff" : "View Diff"}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      </tr>

                      {isExpanded && hasDetails && (
                        <tr className="bg-purple-50/30">
                          <td colSpan={6} className="py-3 px-6">
                            <div className="text-xs space-y-2">
                              <div className="font-semibold text-gray-700 flex items-center gap-1.5">
                                <Code className="w-3.5 h-3.5 text-purple-600" />
                                Snapshot State Modification:
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <span className="text-[11px] font-bold text-gray-500 uppercase">
                                    Before State
                                  </span>
                                  <pre className="mt-1 p-3 bg-gray-900 text-emerald-400 rounded-lg text-xs font-mono overflow-x-auto max-h-48">
                                    {log.before
                                      ? JSON.stringify(log.before, null, 2)
                                      : "null"}
                                  </pre>
                                </div>
                                <div>
                                  <span className="text-[11px] font-bold text-gray-500 uppercase">
                                    After State
                                  </span>
                                  <pre className="mt-1 p-3 bg-gray-900 text-emerald-400 rounded-lg text-xs font-mono overflow-x-auto max-h-48">
                                    {log.after
                                      ? JSON.stringify(log.after, null, 2)
                                      : "null"}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
