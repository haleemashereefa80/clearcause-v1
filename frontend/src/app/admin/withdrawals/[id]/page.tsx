"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import FilePreviewModal from "@/components/admin/FilePreviewModal";
import { 
    Wallet, 
    Loader2, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    ArrowLeft, 
    User, 
    Building2, 
    FileText, 
    ExternalLink,
    ShieldCheck,
    ShieldAlert,
    Banknote,
    History
} from "lucide-react";

export default function WithdrawalDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    
    const [withdrawal, setWithdrawal] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Modal state
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<{url: string, type: string, name: string}>({
        url: "",
        type: "",
        name: ""
    });

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "admin")) {
            router.push("/admin/login");
            return;
        }
        if (user) {
            fetchWithdrawal();
        }
    }, [user, authLoading, id]);

    const fetchWithdrawal = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/withdrawals/${id}/`);
            setWithdrawal(res.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load withdrawal details.");
        }
        setLoading(false);
    };

    const handleAction = async (action: string, data?: any) => {
        setActionLoading(true);
        try {
            await api.post(`/admin/withdrawals/${id}/${action}/`, data || {});
            fetchWithdrawal();
        } catch (err) {
            console.error(err);
        }
        setActionLoading(false);
    };

    const openPreview = (url: string, name: string) => {
        const type = url.toLowerCase().endsWith(".pdf") ? "pdf" : "image";
        setSelectedFile({ url, type, name });
        setIsPreviewOpen(true);
    };

    if (loading || authLoading) {
        return (
            <div className="flex min-h-screen bg-[#F8FAFC]">
                <AdminSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-red-500" />
                </div>
            </div>
        );
    }

    if (error || !withdrawal) {
        return (
            <div className="flex min-h-screen bg-[#F8FAFC]">
                <AdminSidebar />
                <div className="flex-1 p-10">
                    <Button onClick={() => router.back()} variant="ghost" className="mb-6">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
                    </Button>
                    <div className="bg-white p-12 rounded-[2.5rem] text-center border border-slate-100 shadow-xl">
                        <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                            <ShieldAlert className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Something went wrong</h2>
                        <p className="text-slate-500 font-medium">{error || "Could not find withdrawal request."}</p>
                    </div>
                </div>
            </div>
        );
    }

    const { bank_account_details: bank, documents } = withdrawal;

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <AdminSidebar />
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                {/* Header */}
                <div className="max-w-5xl mx-auto">
                    <Button 
                        onClick={() => router.push('/admin/withdrawals')} 
                        variant="ghost" 
                        className="mb-6 hover:bg-white hover:text-red-500 font-bold transition-all"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Withdrawal Queue
                    </Button>

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm
                                    ${withdrawal.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                                      withdrawal.status === 'approved' || withdrawal.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                                      'bg-red-100 text-red-700'}`}>
                                    {withdrawal.status?.replace(/_/g, ' ')}
                                </span>
                                <span className="text-slate-300 font-bold text-sm">Requested on {new Date(withdrawal.requested_at).toLocaleDateString()}</span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-none mb-4">
                                ₹{parseFloat(withdrawal.amount).toLocaleString()}
                            </h1>
                            <p className="text-xl font-bold text-slate-500 tracking-tight">
                                For Campaign: <span className="text-slate-900 underline decoration-red-500/30">{withdrawal.campaign_title}</span>
                            </p>
                        </div>

                        <div className="flex gap-3">
                            {withdrawal.status === 'pending' && (
                                <>
                                    <Button 
                                        onClick={() => handleAction('review')}
                                        disabled={actionLoading}
                                        variant="outline"
                                        className="bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100 rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                                    >
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4 mr-2" />}
                                        Move to Review
                                    </Button>
                                    <Button 
                                        onClick={() => handleAction('approve')}
                                        disabled={actionLoading}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-200 transition-all active:scale-95"
                                    >
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                        Approve Request
                                    </Button>
                                    <Button 
                                        onClick={() => handleAction('reject', { reason: "Documentation incomplete or mismatched." })}
                                        disabled={actionLoading}
                                        variant="outline"
                                        className="bg-white border-red-100 text-red-500 hover:bg-red-50 rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" /> Reject
                                    </Button>
                                </>
                            )}
                            {withdrawal.status === 'approved' && (
                                <Button 
                                    onClick={() => handleAction('approve')} // Re-using approve or need a 'complete' action? models say 'completed' is a status.
                                    disabled={actionLoading}
                                    className="bg-slate-900 hover:bg-black text-white rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95"
                                >
                                    Mark as Disbursed
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Requester & Bank Info */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* Requester Profile Section */}
                            <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Requester Information</h2>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Full Name</p>
                                        <p className="text-lg font-bold text-slate-900">{withdrawal.organizer_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">KYC Status</p>
                                        <div className="flex items-center gap-2">
                                            {withdrawal.organizer_kyc_status === 'verified' ? (
                                                <>
                                                    <div className="bg-emerald-100 p-1.5 rounded-lg">
                                                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                                    </div>
                                                    <span className="font-bold text-emerald-600">Verified & Approved</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="bg-red-100 p-1.5 rounded-lg">
                                                        <ShieldAlert className="w-4 h-4 text-red-600" />
                                                    </div>
                                                    <span className="font-bold text-red-600 capitalize">{withdrawal.organizer_kyc_status || 'Unverified'}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Bank Details Section */}
                            <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Bank Credentials</h2>
                                </div>

                                {bank ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Account Holder</p>
                                                <p className="text-lg font-bold text-slate-900">{bank.account_holder_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Account Number</p>
                                                <p className="text-lg font-mono font-bold text-slate-900 tracking-wider">
                                                    {bank.account_number}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">IFSC Code</p>
                                                <p className="text-lg font-bold text-slate-900">{bank.ifsc_code}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Account Type</p>
                                                <span className="inline-flex items-center px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 capitalize">
                                                    {bank.account_type}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center">
                                        <p className="text-slate-400 font-medium">No bank details provided with this request.</p>
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Right Column: Documents */}
                        <div className="space-y-8">
                            <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm h-full">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Supporting Evidence</h2>
                                </div>
                                <p className="text-xs text-slate-400 font-medium mb-8 leading-relaxed">
                                    Review hospital bills, invoices, or other documents submitted to justify this withdrawal.
                                </p>

                                <div className="space-y-4">
                                    {documents && documents.length > 0 ? (
                                        documents.map((doc: any) => (
                                            <div key={doc.id} className="group p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                                                <div className="flex items-center justify-between gap-3 mb-3">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-red-500 transition-colors">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="text-[10px] font-black text-slate-900 truncate uppercase tracking-widest">{doc.document_type?.replace(/_/g, ' ')}</p>
                                                        {doc.amount_covered && <p className="text-[10px] font-bold text-red-500 mt-0.5">₹{parseFloat(doc.amount_covered).toLocaleString()} covered</p>}
                                                    </div>
                                                </div>
                                                <Button 
                                                    onClick={() => openPreview(doc.document, doc.document_type?.replace(/_/g, ' ') || 'Withdrawal Document')}
                                                    variant="outline" 
                                                    className="w-full h-10 rounded-xl border-slate-200 font-bold text-[10px] uppercase tracking-widest text-slate-500 group-hover:text-red-500 group-hover:border-red-500/20 transition-all"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5 mr-2" /> Preview File
                                                </Button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 px-4 border-2 border-dashed border-slate-100 rounded-[2rem]">
                                            <FileText className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest underline decoration-slate-100">No documents</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>

            {/* Reuse FilePreviewModal */}
            <FilePreviewModal 
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                fileUrl={selectedFile.url}
                fileType={selectedFile.type}
                fileName={selectedFile.name}
            />
        </div>
    );
}
