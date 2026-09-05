import { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import {
  getDashboardStats,
  getAllComplaints,
  manageVendorStatus,
  createStationAdmin,
  approveVendor,
} from "../../api/admin.api";
import { getAllVendors } from "../../api/vendor.api";
import { updateComplaintStatus } from "../../api/complaint.api";
import {
  getStatusColor,
  getPriorityColor,
  getVendorStatusColor,
  formatDate,
} from "../../utils/helpers";
import {
  Users,
  AlertTriangle,
  ShieldOff,
  TrendingUp,
  RotateCcw,
  Clock,
  AlertCircle,
  Zap,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [pendingVendors, setPendingVendors] = useState<any[]>([]);
  const [tab, setTab] = useState<"complaints" | "vendors" | "pending">("complaints");
  const [loading, setLoading] = useState(true);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
    station_code: "",
  });
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      const [sRes, cRes, vRes] = await Promise.all([
        getDashboardStats(),
        getAllComplaints({}),
        getAllVendors({}),
      ]);
      const pRes = await getAllVendors({ status: "pending_approval" });
      setPendingVendors(pRes.data || []);
      setStats(sRes.data || null);
      setComplaints(cRes.data || []);
      setVendors(vRes.data || []);
    } catch {
      toast.error("Failed to load platform data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleCreateAdmin = async () => {
    if (!adminForm.name || !adminForm.email || !adminForm.password || !adminForm.station_code) {
      return toast.error("Fill all fields");
    }
    setCreatingAdmin(true);
    try {
      await createStationAdmin(adminForm);
      toast.success("Station admin created successfully");
      setShowCreateAdmin(false);
      setAdminForm({ name: "", email: "", password: "", station_code: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create admin");
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleVendorStatus = async (id: string, status: string) => {
    try {
      await manageVendorStatus(id, status);
      setVendors(vendors.map((v) => (v.id === id ? { ...v, status } : v)));
      toast.success(`Vendor status set to ${status}`);
    } catch {
      toast.error("Failed to update vendor status");
    }
  };

  const handleReopen = async (id: string) => {
    setUpdatingId(id);
    try {
      await updateComplaintStatus(id, {
        status: "submitted",
        note: "Re-opened by Super Admin due to insufficient or invalid station resolution.",
      });
      toast.success("Complaint re-opened");
      fetchAllData();
    } catch {
      toast.error("Failed to re-open complaint");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0B1F3A]">Super Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Full platform oversight, audit log tracking, and overrides</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total vendors", value: stats?.total_vendors || 0, icon: <Users size={16} className="text-blue-600" />, bg: "bg-blue-50", color: "text-[#0B1F3A]" },
            { label: "Total complaints", value: stats?.total_complaints || 0, icon: <AlertTriangle size={16} className="text-orange-600" />, bg: "bg-orange-50", color: "text-[#0B1F3A]" },
            { label: "Resolution rate", value: `${stats?.resolution_rate || 0}%`, icon: <TrendingUp size={16} className="text-green-600" />, bg: "bg-green-50", color: "text-green-600" },
            { label: "Blacklisted", value: stats?.blacklisted_vendors || 0, icon: <ShieldOff size={16} className="text-red-600" />, bg: "bg-red-50", color: "text-red-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className={`${s.bg} w-9 h-9 rounded-full flex items-center justify-center mb-3`}>{s.icon}</div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-400 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex gap-2">
            {(["complaints", "vendors", "pending"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-lg font-medium text-sm capitalize transition-colors ${tab === t ? "bg-[#0B1F3A] text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"}`}
              >
                {t === "pending" ? "Pending Approvals" : t}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCreateAdmin(true)}
            className="bg-[#F5A623] text-[#0B1F3A] px-4 py-2 rounded-lg text-sm hover:bg-amber-400 transition-colors font-semibold"
          >
            + Station Admin
          </button>
        </div>

        {/* Create Admin Modal */}
        {showCreateAdmin && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h2 className="font-bold text-[#0B1F3A] text-lg mb-5">Create Station Admin</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1.5 block">Full name</label>
                  <input
                    value={adminForm.name}
                    onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                    placeholder="Station Master Name"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A]"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1.5 block">Email</label>
                  <input
                    type="email"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                    placeholder="admin@station.com"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A]"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1.5 block">Password</label>
                  <input
                    type="password"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A]"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1.5 block">Station code</label>
                  <input
                    value={adminForm.station_code}
                    onChange={(e) => setAdminForm({ ...adminForm, station_code: e.target.value.toUpperCase() })}
                    placeholder="e.g. CSTM, NDLS, BCT"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A]"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateAdmin(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAdmin}
                  disabled={creatingAdmin}
                  className="flex-1 bg-[#0B1F3A] text-white py-2.5 rounded-xl font-medium hover:bg-blue-900 disabled:opacity-60"
                >
                  {creatingAdmin ? "Creating..." : "Create Admin"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Complaints Tab */}
        {tab === "complaints" && (
          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="bg-white rounded-xl p-16 text-center text-gray-400 border border-gray-100">Loading complaints...</div>
            ) : complaints.length === 0 ? (
              <div className="bg-white rounded-xl p-16 text-center text-gray-400 border border-gray-100">No complaints found</div>
            ) : (
              complaints.map((c) => {
                const isRefunded = c.charged_price && c.irctc_price && c.charged_price > c.irctc_price && c.payment_id;
                const refundAmount = isRefunded ? (c.charged_price - c.irctc_price).toFixed(2) : null;

                return (
                  <div
                    key={c.id}
                    className={`bg-white rounded-xl border shadow-sm p-5 ${c.priority === "high" ? "border-l-4 border-l-red-500 border-gray-100" : "border-gray-100"}`}
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="font-semibold text-[#0B1F3A] text-sm">{c.reference_id}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(c.status)}`}>{c.status}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(c.priority)}`}>{c.priority}</span>
                          {c.complaint_type === "cash_demand" && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">Cash demand</span>
                          )}

                          {/* Autonomous AI Refund Badge */}
                          {isRefunded && (
                            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <Zap size={12} className="fill-emerald-600 text-emerald-600" /> ₹{refundAmount} AI Refunded
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 text-sm">
                          <span className="font-medium">Train:</span> {c.train_number}
                          {c.coach_number && <> · <span className="font-medium">Coach:</span> {c.coach_number}</>}
                          {c.vendor_name && <> · <span className="font-medium">Vendor:</span> {c.vendor_name}</>}
                        </p>

                        {c.item_name && (
                          <p className="text-gray-500 text-sm mt-0.5">
                            {c.item_name} — IRCTC ₹{c.irctc_price || 'N/A'} · Charged ₹{c.charged_price || 'N/A'}
                          </p>
                        )}

                        {c.payment_id && (
                          <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1 font-mono">
                            <CreditCard size={12} /> Payment ID: <span className="bg-gray-100 text-gray-700 px-1 rounded">{c.payment_id}</span>
                          </p>
                        )}

                        {c.description && <p className="text-gray-500 text-sm mt-1 italic">"{c.description}"</p>}
                        <p className="text-gray-400 text-xs mt-2">Filed on: {formatDate(c.filed_at)}</p>

                        {/* Audit Log / Action Trail Section */}
                        {c.complaint_logs && c.complaint_logs.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-gray-100 bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                              <Clock size={13} /> Station Audit Trail & Notes:
                            </p>
                            <div className="space-y-1.5">
                              {c.complaint_logs.map((log: any, i: number) => {
                                const isShortNote = log.new_status === "resolved" && (!log.note || log.note.trim().length < 20);

                                return (
                                  <div key={i} className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-100">
                                    <div className="flex items-center justify-between font-medium text-gray-700">
                                      <span>→ {log.old_status || "submitted"} to <span className="font-semibold">{log.new_status}</span></span>
                                      <span className="text-gray-400 text-[11px]">{formatDate(log.updated_at)}</span>
                                    </div>
                                    {log.note ? (
                                      <p className={`mt-1 ${isShortNote ? "text-amber-700 font-medium" : "text-gray-500"}`}>
                                        Note: "{log.note}"
                                      </p>
                                    ) : (
                                      <p className="mt-1 text-gray-400 italic">No note provided</p>
                                    )}
                                    {isShortNote && (
                                      <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                                        <AlertCircle size={10} /> Suspicious or short resolution note detected.
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Super Admin Override Actions */}
                      <div className="flex flex-col gap-2 shrink-0">
                        {["resolved", "rejected"].includes(c.status) && (
                          <button
                            disabled={updatingId === c.id}
                            onClick={() => handleReopen(c.id)}
                            className="flex items-center justify-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-100 disabled:opacity-60 transition-colors"
                          >
                            <RotateCcw size={13} /> Re-open Complaint
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Pending Approvals Tab */}
        {tab === "pending" && (
          <div className="flex flex-col gap-4">
            {pendingVendors.length === 0 ? (
              <div className="bg-white rounded-xl p-16 text-center text-gray-400 border border-gray-100">No pending approvals</div>
            ) : (
              pendingVendors.map((v) => (
                <div key={v.id} className="bg-white rounded-xl border border-amber-200 shadow-sm p-5">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="font-semibold text-[#0B1F3A]">{v.full_name}</p>
                      <p className="text-gray-500 text-sm">License: {v.license_number} · {v.vendor_type?.replace("_", " ")}</p>
                      <p className="text-gray-400 text-xs mt-1">Train {v.train_number} · Zone: {v.zone}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          await approveVendor(v.user_id);
                          setPendingVendors(pendingVendors.filter((p) => p.id !== v.id));
                          toast.success("Vendor approved");
                        }}
                        className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleVendorStatus(v.id, "blacklisted")}
                        className="bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Vendors Tab */}
        {tab === "vendors" && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Vendor</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Train / Type</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Complaints</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-gray-400">Loading...</td>
                  </tr>
                ) : (
                  vendors.map((v) => (
                    <tr key={v.id} className="border-t border-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-[#0B1F3A]">{v.full_name}</p>
                        <p className="text-gray-400 text-xs">{v.vendor_code}</p>
                      </td>
                      <td className="px-4 py-4 text-gray-500">{v.train_number} · {v.vendor_type?.replace("_", " ")}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`font-medium ${v.complaint_count > 10 ? "text-red-600" : "text-gray-700"}`}>
                          {v.complaint_count || 0}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getVendorStatusColor(v.status)}`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {v.status !== "active" && (
                            <button
                              onClick={() => handleVendorStatus(v.id, "active")}
                              className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                            >
                              Activate
                            </button>
                          )}
                          {v.status !== "suspended" && (
                            <button
                              onClick={() => handleVendorStatus(v.id, "suspended")}
                              className="text-xs px-2 py-1 rounded bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors"
                            >
                              Suspend
                            </button>
                          )}
                          {v.status !== "blacklisted" && (
                            <button
                              onClick={() => handleVendorStatus(v.id, "blacklisted")}
                              className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                            >
                              Blacklist
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;