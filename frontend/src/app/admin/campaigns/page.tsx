"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import {
    Heart, CheckCircle2, XCircle, Pause, Star, UserPlus,
    Search, Loader2, ArrowUpRight, Filter, Eye, ShieldCheck,
} from "lucide-react";
import Link from "next/link";

type StatusFilter = "all" | "pending_review" | "approved" | "rejected" | "suspended" | "volunteer_assigned";

export default function AdminCampaigns() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [volunteers, setVolunteers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [search, setSearch] = useState("");
    const [assignModal, setAssignModal] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "admin")) { router.push("/admin/login"); return; }
        if (!user) return;
        fetchCampaigns();
        fetchVolunteers();
    }, [user, authLoading, statusFilter]);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
            const res = await api.get(`/admin/campaigns/${params}`);
            setCampaigns(res.data?.results || res.data || []);
        } catch { setCampaigns([]); }
        setLoading(false);
    };

    const fetchVolunteers = async () => {
        try {
            const res = await api.get("/volunteers/");
            setVolunteers(res.data?.results || res.data || []);
        } catch { }
    };

    const handleAction = async (id: string, action: string, data?: any) => {
        try {
            await api.post(`/admin/campaigns/${id}/${action}/`, data || {});
            fetchCampaigns();
        } catch (e) { console.error(e); }
    };

    const handleAssign = async (campaignId: string, volunteerId: string) => {
        await handleAction(campaignId, "assign-volunteer", { volunteer_id: volunteerId });
        setAssignModal(null);
    };

    const statusTabs: { key: StatusFilter; label: string }[] = [
        { key: "all", label: "All" },
        { key: "pending_review", label: "Pending" },
        { key: "approved", label: "Verified" },
        { key: "volunteer_assigned", label: "Assigned" },
        { key: "suspended", label: "Suspended" },
        { key: "rejected", label: "Rejected" },
    ];

    const filtered = campaigns.filter((c) =>
        c.title?.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusStyle = (s: string) => {
        if (s === "approved") return "bg-emerald-100 text-emerald-700";
        if (s === "rejected") return "bg-red-100 text-red-700";
        if (s === "suspended") return "bg-gray-200 text-gray-700";
        if (s === "volunteer_assigned" || s === "verification_in_progress") return "bg-blue-100 text-blue-700";
        return "bg-amber-100 text-amber-700";
    };

    return (
        <div className="flex min-h-screen bg-[#F0F2F5]">
            <AdminSidebar />
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Campaign Management</h1>
                        <p className="text-sm text-gray-400 font-medium mt-1">{campaigns.length} campaigns found</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 w-full md:w-80">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            type="text" placeholder="Search campaigns..."
                            value={search} onChange={(e) => setSearch(e.target.value)}
                            className="text-sm font-medium outline-none bg-transparent w-full"
                        />
                    </div>
                </header>

                {/* Status Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setStatusFilter(tab.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                                statusFilter === tab.key
                                    ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                                    : "bg-white text-gray-500 border border-gray-200 hover:border-red-200"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Campaign List */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto" /></div>
                    ) : filtered.length === 0 ? (
                        <div className="py-20 text-center text-gray-400 font-medium">No campaigns found.</div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {filtered.map((c: any) => (
                                <div key={c.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                                    <div className="space-y-1.5 flex-1">
                                        <p className="font-bold text-gray-900">{c.title}</p>
                                        <div className="flex items-center gap-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">
                                            <span className="bg-gray-50 border border-gray-100 px-2 py-0.5 rounded">{c.category}</span>
                                            <span>•</span>
                                            <span>Goal: ₹{parseFloat(c.goal_amount).toLocaleString()}</span>
                                            <span>•</span>
                                            <span>Raised: ₹{parseFloat(c.raised_amount || 0).toLocaleString()}</span>
                                            <span>•</span>
                                            <span className={`px-2 py-0.5 rounded font-black ${getStatusStyle(c.status)}`}>{c.status?.replace(/_/g, " ")}</span>
                                        </div>
                                        <p className="text-xs text-gray-400">by {c.organizer_name || "Unknown"}</p>
                                    </div>
                                    <div className="flex gap-2 shrink-0 flex-wrap">
                                        {(c.status === "pending_review" || c.status === "volunteer_assigned" || c.status === "verification_in_progress" || c.status === "report_submitted") && (
                                            <>
                                                <Button onClick={() => handleAction(c.id, "approve")} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 px-4 text-xs font-bold">
                                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                                                </Button>
                                                <Button onClick={() => handleAction(c.id, "reject", { reason: "Does not meet criteria." })} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 rounded-lg h-9 px-4 text-xs font-bold">
                                                    <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                                                </Button>
                                                <Button onClick={() => setAssignModal(c.id)} variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 rounded-lg h-9 px-4 text-xs font-bold">
                                                    <UserPlus className="w-3.5 h-3.5 mr-1" /> {c.status === "pending_review" ? "Assign" : "Re-assign"}
                                                </Button>
                                            </>
                                        )}
                                        {c.status === "approved" && (
                                            <>
                                                <Button onClick={() => handleAction(c.id, "feature")} variant="outline" className="rounded-lg h-9 px-4 text-xs font-bold">
                                                    <Star className="w-3.5 h-3.5 mr-1" /> {c.is_featured ? "Unfeature" : "Feature"}
                                                </Button>
                                                <Button onClick={() => handleAction(c.id, "suspend")} variant="outline" className="text-gray-600 border-gray-200 rounded-lg h-9 px-4 text-xs font-bold">
                                                    <Pause className="w-3.5 h-3.5 mr-1" /> Suspend
                                                </Button>
                                            </>
                                        )}
                                        <Link href={`/admin/campaigns/${c.id}`}>
                                            <Button variant="ghost" className="rounded-lg h-9 w-9 p-0 text-gray-400 hover:text-red-500 bg-slate-100 hover:bg-slate-200">
                                                <ArrowUpRight className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Volunteer Assignment Modal */}
                {assignModal && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setAssignModal(null)}>
                        <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-lg font-black text-gray-900 mb-4">Assign Volunteer</h3>
                            <p className="text-sm text-gray-500 mb-4">Select an available volunteer for verification:</p>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {volunteers.length === 0 ? (
                                    <p className="text-gray-400 text-sm text-center py-4">No volunteers available</p>
                                ) : volunteers.map((v: any) => (
                                    <button
                                        key={v.id}
                                        onClick={() => handleAssign(assignModal, v.id)}
                                        disabled={v.availability_status !== "available"}
                                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                                            v.availability_status === "available"
                                                ? "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer"
                                                : "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                                        }`}
                                    >
                                        <div className="text-left">
                                            <p className="font-bold text-sm text-gray-900">{v.user_details?.full_name || "Volunteer"}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                {v.specialisation} • {v.region} • {v.total_completed} completed
                                            </p>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                            v.availability_status === "available" ? "bg-emerald-100 text-emerald-700" :
                                            v.availability_status === "busy" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"
                                        }`}>
                                            {v.availability_status}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setAssignModal(null)} className="mt-4 w-full py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
