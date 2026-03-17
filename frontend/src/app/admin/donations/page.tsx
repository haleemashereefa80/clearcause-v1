"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { 
    Loader2, 
    History, 
    Search, 
    Filter, 
    Download, 
    ExternalLink, 
    Mail, 
    Phone, 
    Calendar,
    IndianRupee,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    RefreshCcw,
    Smartphone,
    CreditCard,
    QrCode
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminDonationsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [donations, setDonations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "admin")) {
            router.push("/admin/login");
            return;
        }
        if (user) fetchData();
    }, [user, authLoading]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get("admin/donations/");
            setDonations(res.data?.results || res.data || []);
        } catch (err) {
            toast.error("Failed to fetch donations");
        }
        setLoading(false);
    };

    const handleSync = async (id: string) => {
        const loadingToast = toast.loading("Syncing with Razorpay...");
        try {
            const res = await api.post(`admin/donations/${id}/sync-status/`);
            if (res.data?.new_status === 'completed') {
                toast.success("Payment Reconciled: Successfully verified and completed!", { id: loadingToast });
                fetchData();
            } else {
                toast.error(res.data?.status || "No successful payment found for this order.", { id: loadingToast });
            }
        } catch (err) {
            toast.error("Failed to sync status. Check console for details.", { id: loadingToast });
            console.error(err);
        }
    };

    const filteredDonations = donations.filter(d => {
        const matchesSearch = 
            d.donor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.donor_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.campaign_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.gateway_payment_id?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === "all" || d.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'failed': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const StatusIcon = ({ status }: { status: string }) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="w-3 h-3" />;
            case 'pending': return <Clock className="w-3 h-3" />;
            case 'failed': return <XCircle className="w-3 h-3" />;
            default: return null;
        }
    };
    const getPaymentMethod = (method: string) => {
        if (!method) return { label: 'Razorpay', icon: < IndianRupee className="w-3 h-3 text-slate-400" /> };
        
        switch (method.toLowerCase()) {
            case 'upi': return { label: 'UPI', icon: <Smartphone className="w-3 h-3 text-indigo-500" /> };
            case 'card': return { label: 'Card', icon: <CreditCard className="w-3 h-3 text-blue-500" /> };
            case 'netbanking': return { label: 'Netbanking', icon: <History className="w-3 h-3 text-cyan-500" /> };
            case 'wallet': return { label: 'Wallet', icon: <IndianRupee className="w-3 h-3 text-purple-500" /> };
            case 'emi': return { label: 'EMI', icon: <Calendar className="w-3 h-3 text-amber-500" /> };
            default: return { label: method.toUpperCase(), icon: <IndianRupee className="w-3 h-3 text-slate-400" /> };
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex min-h-screen bg-[#F8FAFC]">
                <AdminSidebar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-10 h-10 animate-spin text-red-500 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold">Loading donation records...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <AdminSidebar />
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Donations</h1>
                        <p className="text-sm text-slate-500 font-medium mt-1">
                            Tracking {donations.length} total contributions across all campaigns
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => fetchData()}
                            className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <History className="w-5 h-5" />
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                            <Download className="w-5 h-5" />
                            Export CSV
                        </button>
                    </div>
                </header>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="relative col-span-2">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text"
                            placeholder="Search by donor, email, or campaign..."
                            className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-12 pr-5 text-sm font-bold placeholder:text-slate-300 focus:border-red-500/20 transition-all outline-none shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select 
                            className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-12 pr-10 text-sm font-bold appearance-none outline-none focus:border-red-500/20 transition-all shadow-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Date & Info</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Donor Details</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Campaign</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Amount</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">Gateway</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-left">Failure Reason</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredDonations.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <History className="w-12 h-12 text-slate-200" />
                                                <p className="text-slate-400 font-bold">No donation records found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDonations.map((d) => (
                                        <tr key={d.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-900 font-black">
                                                        <Calendar className="w-3 h-3 text-slate-400" />
                                                        {new Date(d.created_at).toLocaleDateString()}
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight truncate w-24">
                                                        #{d.gateway_payment_id || d.gateway_order_id?.slice(-8)}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                                                        <User className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{d.donor_name || "Anonymous"}</p>
                                                        <div className="flex flex-col gap-0.5 mt-0.5">
                                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                                                                <Mail className="w-3 h-3" />
                                                                {d.donor_email}
                                                            </div>
                                                            {d.donor_mobile && (
                                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                                                                    <Phone className="w-3 h-3" />
                                                                    {d.donor_mobile}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <Link 
                                                    href={`/fundraisers/${d.campaign_slug}`} 
                                                    target="_blank"
                                                    className="flex items-center gap-2 group/link"
                                                >
                                                    <p className="text-sm font-bold text-slate-600 group-hover/link:text-red-600 transition-colors truncate max-w-[200px]">
                                                        {d.campaign_title}
                                                    </p>
                                                    <ExternalLink className="w-3 h-3 text-slate-300 group-hover/link:text-red-400" />
                                                </Link>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex flex-col items-end">
                                                    <div className="flex items-center gap-0.5 text-base font-black text-slate-900">
                                                        <IndianRupee className="w-3.5 h-3.5" />
                                                        {parseFloat(d.amount).toLocaleString()}
                                                    </div>
                                                    {parseFloat(d.tip_amount) > 0 && (
                                                        <p className="text-[10px] text-emerald-500 font-bold uppercase truncate">
                                                            + ₹{parseFloat(d.tip_amount).toLocaleString()} TIP
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 min-w-[100px]">
                                                    {getPaymentMethod(d.payment_method || '').icon}
                                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                                        {getPaymentMethod(d.payment_method || '').label}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider ${getStatusStyle(d.status)}`}>
                                                        <StatusIcon status={d.status} />
                                                        {d.status}
                                                    </div>
                                                    {d.status === 'pending' && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleSync(d.id); }}
                                                            className="flex items-center gap-1 text-[9px] font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
                                                            title="Check Razorpay for status"
                                                        >
                                                            <RefreshCcw className="w-2.5 h-2.5" />
                                                            Sync
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                {d.status === 'failed' ? (
                                                    <p className="text-[11px] text-red-500 font-bold max-w-[200px] leading-tight">
                                                        {d.failure_reason || "Unknown error"}
                                                    </p>
                                                ) : (
                                                    <span className="text-slate-300">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
