"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Wallet, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function AdminWithdrawals() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "admin")) { router.push("/admin/login"); return; }
        if (!user) return;
        fetchWithdrawals();
    }, [user, authLoading, statusFilter]);

    const fetchWithdrawals = async () => {
        setLoading(true);
        try {
            const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
            const res = await api.get(`/admin/withdrawals/${params}`);
            setWithdrawals(res.data?.results || res.data || []);
        } catch { setWithdrawals([]); }
        setLoading(false);
    };

    const handleAction = async (id: string, action: string, data?: any) => {
        try { await api.post(`/admin/withdrawals/${id}/${action}/`, data || {}); fetchWithdrawals(); } catch { }
    };

    const statuses = ["all", "pending", "under_review", "approved", "completed", "rejected"];

    const getStatusStyle = (s: string) => {
        if (s === "completed" || s === "approved") return "bg-emerald-100 text-emerald-700";
        if (s === "rejected") return "bg-red-100 text-red-700";
        if (s === "under_review") return "bg-blue-100 text-blue-700";
        return "bg-amber-100 text-amber-700";
    };

    return (
        <div className="flex min-h-screen bg-[#F0F2F5]">
            <AdminSidebar />
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Withdrawal Management</h1>
                    <p className="text-sm text-gray-400 font-medium mt-1">{withdrawals.length} withdrawal requests</p>
                </header>

                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {statuses.map((s) => (
                        <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all ${statusFilter === s ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-white text-gray-500 border border-gray-200"}`}>
                            {s.replace(/_/g, " ")}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto" /></div>
                    ) : withdrawals.length === 0 ? (
                        <div className="py-20 text-center text-gray-400 font-medium">No withdrawals found.</div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {withdrawals.map((w: any) => (
                                <div key={w.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center gap-3">
                                            <p className="text-2xl font-black text-gray-900 tracking-tight">₹{parseFloat(w.amount).toLocaleString()}</p>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusStyle(w.status)}`}>
                                                {w.status?.replace(/_/g, " ")}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                                                {w.campaign_title || "Direct Withdrawal"}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                <span className="flex items-center gap-1">
                                                    Requested by: <span className="text-gray-600">{w.organizer_name}</span>
                                                </span>
                                                <span>•</span>
                                                <span className={`px-2 py-0.5 rounded ${w.organizer_kyc_status === 'verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                    KYC: {w.organizer_kyc_status || 'Pending'}
                                                </span>
                                                <span>•</span>
                                                <span>{w.transfer_option || "Bank"}</span>
                                                <span>•</span>
                                                <span>{new Date(w.requested_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 shrink-0">
                                        <Button 
                                            onClick={() => router.push(`/admin/withdrawals/${w.id}`)}
                                            variant="outline"
                                            className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl h-12 px-6 font-bold"
                                        >
                                            View Details
                                        </Button>
                                        {w.status === "pending" && (
                                            <>
                                                <Button 
                                                    onClick={() => handleAction(w.id, "review")} 
                                                    variant="outline"
                                                    className="bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100 rounded-xl h-12 px-6 font-bold"
                                                >
                                                    <Clock className="w-4 h-4 mr-2" /> Review
                                                </Button>
                                                <Button 
                                                    onClick={() => handleAction(w.id, "approve")} 
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 px-6 font-bold shadow-lg shadow-emerald-100"
                                                >
                                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Transfer
                                                </Button>
                                                <Button 
                                                    onClick={() => handleAction(w.id, "reject", { reason: "Insufficient documentation." })} 
                                                    variant="outline" 
                                                    className="text-red-500 border-red-100 hover:bg-red-50 rounded-xl h-12 px-6 font-bold"
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" /> Reject
                                                </Button>
                                            </>
                                        )}
                                        {w.status === "under_review" && (
                                            <Button 
                                                onClick={() => handleAction(w.id, "approve")} 
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 px-6 font-bold"
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Completed
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
