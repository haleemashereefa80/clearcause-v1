"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { FileCheck, Loader2, CheckCircle2, XCircle, Eye, Clock, ShieldAlert, AlertCircle, ExternalLink } from "lucide-react";
import FilePreviewModal from "@/components/admin/FilePreviewModal";
import { getFullFileUrl } from "@/lib/file-utils";

export default function AdminKYC() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [kycs, setKycs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");

    // Preview state
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState({ url: "", type: "", name: "" });

    // Details/Action Modal state
    const [selectedKYC, setSelectedKYC] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "admin")) { router.push("/admin/login"); return; }
        if (!user) return;
        fetchKYCs();
    }, [user, authLoading, statusFilter]);

    const fetchKYCs = async () => {
        setLoading(true);
        try {
            const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
            const res = await api.get(`/admin/kyc/${params}`);
            setKycs(res.data?.results || res.data || []);
        } catch { setKycs([]); }
        setLoading(false);
    };

    const handleAction = async (id: string, action: string, data?: any) => {
        setActionLoading(true);
        try { 
            await api.post(`/admin/kyc/${id}/${action}/`, data || {}); 
            setIsDetailsOpen(false);
            fetchKYCs(); 
        } catch { }
        setActionLoading(false);
    };

    const openPreview = (url: string, name: string) => {
        const type = url.toLowerCase().endsWith(".pdf") ? "pdf" : "image";
        setPreviewData({ url, type, name });
        setPreviewOpen(true);
    };

    const statuses = ["all", "pending", "under_review", "approved", "rejected"];

    return (
        <div className="flex min-h-screen bg-[#F0F2F5]">
            <AdminSidebar />
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">KYC Review Queue</h1>
                    <p className="text-sm text-gray-400 font-medium mt-1">{kycs.length} KYC submissions</p>
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
                    ) : kycs.length === 0 ? (
                        <div className="py-20 text-center text-gray-400 font-medium">No KYC submissions.</div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {kycs.map((k: any) => (
                                <div key={k.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                                    <div className="space-y-1.5 flex-1">
                                        <p className="font-bold text-gray-900">{k.document_type || "Document"} — <span className="text-gray-500 text-sm">{k.target}</span></p>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">
                                            <span>ID: {k.document_number || "N/A"}</span>
                                            <span>•</span>
                                            <span className={`px-2 py-0.5 rounded font-black ${k.status === "approved" ? "bg-emerald-100 text-emerald-700" : k.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                                                {k.status}
                                            </span>
                                            <span>•</span>
                                            <span>{new Date(k.submitted_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex gap-4 mt-3">
                                            {k.document_front && (
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        onClick={() => openPreview(k.document_front, `${k.document_type} - Front`)}
                                                        className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-red-500 flex items-center gap-2 transition-colors"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" /> Preview Front
                                                    </button>
                                                    <a 
                                                        href={getFullFileUrl(k.document_front)} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-500 flex items-center gap-1.5 transition-colors"
                                                    >
                                                        <ExternalLink className="w-3 h-3" /> New Page
                                                    </a>
                                                </div>
                                            )}
                                            {k.document_back && (
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        onClick={() => openPreview(k.document_back, `${k.document_type} - Back`)}
                                                        className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-red-500 flex items-center gap-2 transition-colors"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" /> Preview Back
                                                    </button>
                                                    <a 
                                                        href={getFullFileUrl(k.document_back)} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-500 flex items-center gap-1.5 transition-colors"
                                                    >
                                                        <ExternalLink className="w-3 h-3" /> New Page
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <Button 
                                            onClick={() => {
                                                setSelectedKYC(k);
                                                setRejectionReason(k.rejection_reason || "");
                                                setIsDetailsOpen(true);
                                            }} 
                                            variant="outline"
                                            className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg h-9 px-4 text-xs font-bold"
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* File Preview Modal */}
                <FilePreviewModal 
                    isOpen={previewOpen}
                    onClose={() => setPreviewOpen(false)}
                    fileUrl={previewData.url}
                    fileType={previewData.type}
                    fileName={previewData.name}
                />

                {/* KYC Details & Action Modal */}
                {isDetailsOpen && selectedKYC && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsDetailsOpen(false)} />
                        
                        <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
                            {/* Modal Header */}
                            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">KYC Review</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {selectedKYC.id.split('-')[0]}</p>
                                </div>
                                <button 
                                    onClick={() => setIsDetailsOpen(false)}
                                    className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                {/* Metadata Grid */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Document Type</p>
                                        <p className="font-bold text-slate-900">{selectedKYC.document_type?.replace(/_/g, ' ') || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Role</p>
                                        <p className="font-bold text-slate-900 capitalize">{selectedKYC.target}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Document Number</p>
                                        <p className="font-mono font-bold text-slate-900 tracking-wider text-sm">{selectedKYC.document_number || 'Not Provided'}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Submitted At</p>
                                        <p className="font-bold text-slate-900">{new Date(selectedKYC.submitted_at).toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Current Status Info */}
                                <div className={`p-6 rounded-2xl border flex items-center gap-4 ${
                                    selectedKYC.status === 'approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                                    selectedKYC.status === 'rejected' ? 'bg-red-50 border-red-100 text-red-800' :
                                    selectedKYC.status === 'under_review' ? 'bg-blue-50 border-blue-100 text-blue-800' :
                                    'bg-amber-50 border-amber-100 text-amber-800'
                                }`}>
                                    <div className={`p-2 rounded-xl bg-white shadow-sm`}>
                                        {selectedKYC.status === 'approved' ? <CheckCircle2 className="w-5 h-5" /> : 
                                         selectedKYC.status === 'rejected' ? <ShieldAlert className="w-5 h-5" /> :
                                         <Clock className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</p>
                                        <p className="font-black uppercase text-sm">{selectedKYC.status.replace(/_/g, ' ')}</p>
                                    </div>
                                </div>

                                {/* Rejection Reason Display (if any) */}
                                {selectedKYC.status === 'rejected' && selectedKYC.rejection_reason && (
                                    <div className="p-6 bg-red-50/50 rounded-2xl border border-red-100/50">
                                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <AlertCircle className="w-3.5 h-3.5" /> Past Rejection Reason
                                        </p>
                                        <p className="text-sm font-medium text-red-900 leading-relaxed italic">"{selectedKYC.rejection_reason}"</p>
                                    </div>
                                )}

                                {/* Document Previews */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Submitted Documents</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {selectedKYC.document_front && (
                                            <div className="space-y-2">
                                                <div 
                                                    onClick={() => openPreview(selectedKYC.document_front, `${selectedKYC.document_type} - Front`)}
                                                    className="group cursor-pointer p-4 bg-white border border-slate-100 rounded-2xl hover:border-red-200 transition-all hover:shadow-xl hover:shadow-slate-200/50 flex flex-col items-center gap-3"
                                                >
                                                    <div className="w-full aspect-[4/3] bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center text-slate-300">
                                                        <Eye className="w-8 h-8 group-hover:scale-110 transition-transform group-hover:text-red-500" />
                                                    </div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-red-500 transition-colors">Front Page</p>
                                                </div>
                                                <a 
                                                    href={getFullFileUrl(selectedKYC.document_front)} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors py-2 bg-slate-50 rounded-xl hover:bg-slate-100"
                                                >
                                                    <ExternalLink className="w-3 h-3" /> Open in New Tab
                                                </a>
                                            </div>
                                        )}
                                        {selectedKYC.document_back && (
                                            <div className="space-y-2">
                                                <div 
                                                    onClick={() => openPreview(selectedKYC.document_back, `${selectedKYC.document_type} - Back`)}
                                                    className="group cursor-pointer p-4 bg-white border border-slate-100 rounded-2xl hover:border-red-200 transition-all hover:shadow-xl hover:shadow-slate-200/50 flex flex-col items-center gap-3"
                                                >
                                                    <div className="w-full aspect-[4/3] bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center text-slate-300">
                                                        <Eye className="w-8 h-8 group-hover:scale-110 transition-transform group-hover:text-red-500" />
                                                    </div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-red-500 transition-colors">Back Page</p>
                                                </div>
                                                <a 
                                                    href={getFullFileUrl(selectedKYC.document_back)} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors py-2 bg-slate-50 rounded-xl hover:bg-slate-100"
                                                >
                                                    <ExternalLink className="w-3 h-3" /> Open in New Tab
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Form */}
                                <div className="pt-4 border-t border-gray-100 space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Decision / Feedback (Required for Rejection)</label>
                                        <textarea 
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="Enter reason if rejecting or internal notes..."
                                            className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none min-h-[100px]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <Button 
                                            onClick={() => handleAction(selectedKYC.id, 'approve')}
                                            disabled={actionLoading}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-14 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-200 transition-all active:scale-95"
                                        >
                                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                            Approve
                                        </Button>
                                        <Button 
                                            onClick={() => handleAction(selectedKYC.id, 'under_review')}
                                            disabled={actionLoading}
                                            variant="outline"
                                            className="bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100 rounded-2xl h-14 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                                        >
                                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4 mr-2" />}
                                            Under Review
                                        </Button>
                                        <Button 
                                            onClick={() => {
                                                if (!rejectionReason) {
                                                    alert("Please provide a reason for rejection.");
                                                    return;
                                                }
                                                handleAction(selectedKYC.id, 'reject', { reason: rejectionReason });
                                            }}
                                            disabled={actionLoading}
                                            className="bg-red-500 hover:bg-red-600 text-white rounded-2xl h-14 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-200 transition-all active:scale-95"
                                        >
                                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
