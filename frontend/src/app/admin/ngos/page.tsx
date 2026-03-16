"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { 
    Building2, 
    Loader2, 
    CheckCircle2, 
    XCircle, 
    Eye, 
    FileCheck,
    Search,
    Filter,
    ExternalLink
} from "lucide-react";
import FilePreviewModal from "@/components/admin/FilePreviewModal";
import { getFullFileUrl } from "@/lib/file-utils";

export default function AdminNGOs() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [ngos, setNgos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Preview state
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState({ url: "", type: "", name: "" });

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "admin")) {
            router.push("/admin/login");
            return;
        }
        if (!user) return;
        fetchNGOs();
    }, [user, authLoading, statusFilter]);

    const fetchNGOs = async () => {
        setLoading(true);
        try {
            const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
            const res = await api.get(`/admin/ngos/${params}`);
            setNgos(res.data?.results || res.data || []);
        } catch (error) {
            console.error("Error fetching NGOs:", error);
            setNgos([]);
        }
        setLoading(false);
    };

    const handleAction = async (id: string, action: string, data?: any) => {
        try {
            await api.post(`/admin/ngos/${id}/${action}/`, data || {});
            fetchNGOs();
        } catch (error) {
            console.error(`Error performing action ${action} on NGO ${id}:`, error);
        }
    };

    const openPreview = (url: string, name: string) => {
        const type = url.toLowerCase().endsWith(".pdf") ? "pdf" : "image";
        setPreviewData({ url, type, name });
        setPreviewOpen(true);
    };

    const filteredNGOs = ngos.filter(ngo => 
        ngo.org_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ngo.registration_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const statuses = ["all", "pending", "approved"];

    const getStatusBadge = (isApproved: boolean) => {
        if (isApproved) {
            return (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                    <CheckCircle2 className="w-3 h-3" /> Approved
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-100">
                <FileCheck className="w-3 h-3" /> Pending Review
            </span>
        );
    };

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <AdminSidebar />
            
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <Building2 className="w-10 h-10 text-red-500" />
                            NGO Management
                        </h1>
                        <p className="text-slate-500 font-medium mt-2">Verify and manage non-profit organizations on the platform.</p>
                    </div>
                </header>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm mb-8 space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                            {statuses.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all whitespace-nowrap ${
                                        statusFilter === s
                                            ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                                            : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name or reg number..."
                                className="w-full bg-slate-50 border-none rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-red-500/20 transition-all outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="py-32 flex flex-col items-center justify-center space-y-4">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-red-100 rounded-full animate-pulse"></div>
                            <Loader2 className="w-16 h-16 animate-spin text-red-500 absolute top-0 left-0" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Accessing registries...</p>
                    </div>
                ) : filteredNGOs.length === 0 ? (
                    <div className="py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-center space-y-4">
                        <Building2 className="w-16 h-16 text-slate-200 mx-auto" />
                        <div className="space-y-1">
                            <p className="text-xl font-black text-slate-900">No organizations found</p>
                            <p className="text-slate-400 font-medium">Try adjusting your filters or search query.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredNGOs.map((ngo: any) => (
                            <div key={ngo.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 hover:shadow-xl hover:shadow-slate-200/40 transition-all group overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8">
                                    {getStatusBadge(ngo.is_approved)}
                                </div>

                                <div className="flex flex-col lg:flex-row gap-8 items-start">
                                    <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100">
                                        <Building2 className="w-10 h-10 text-slate-300" />
                                    </div>

                                    <div className="flex-1 space-y-6">
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-red-500 transition-colors">
                                                {ngo.org_name}
                                            </h3>
                                            <div className="flex flex-wrap gap-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                                                <span>Reg: {ngo.registration_number}</span>
                                                <span>•</span>
                                                <span>Tax Status: {ngo.is_80g_eligible ? "80G Eligible" : "Standard"}</span>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-50">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Mission Statement</p>
                                            <p className="text-slate-600 font-medium leading-relaxed italic">
                                                "{ngo.mission || "No mission statement provided."}"
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-4 items-center">
                                            <div className="flex gap-2">
                                                {!ngo.is_approved && (
                                                    <>
                                                        <Button 
                                                            onClick={() => handleAction(ngo.id, "approve")}
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 px-6 font-bold shadow-lg shadow-emerald-100"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4 mr-2" /> Approve NGO
                                                        </Button>
                                                        <Button 
                                                            onClick={() => handleAction(ngo.id, "reject", { reason: "Registration details invalid." })}
                                                            variant="outline"
                                                            className="text-red-500 border-red-100 hover:bg-red-50 rounded-xl h-12 px-6 font-bold"
                                                        >
                                                            <XCircle className="w-4 h-4 mr-2" /> Reject
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex-1"></div>
                                            <div className="flex gap-4">
                                                {ngo.certificate_80g_url ? (
                                                    <div className="flex items-center gap-4">
                                                        <button 
                                                            onClick={() => openPreview(ngo.certificate_80g_url, `80G Certificate - ${ngo.org_name}`)}
                                                            className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
                                                        >
                                                            <Eye className="w-4 h-4" /> Preview 80G
                                                        </button>
                                                        <a 
                                                            href={getFullFileUrl(ngo.certificate_80g_url)} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-widest"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" /> New Page
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Certificate</span>
                                                )}
                                                <button className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest">
                                                    <Search className="absolute invisible" /> Contact Rep
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* File Preview Modal */}
            <FilePreviewModal 
                isOpen={previewOpen}
                onClose={() => setPreviewOpen(false)}
                fileUrl={previewData.url}
                fileType={previewData.type}
                fileName={previewData.name}
            />
        </div>
    );
}
