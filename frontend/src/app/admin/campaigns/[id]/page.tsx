"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { 
    ArrowLeft, CheckCircle2, XCircle, UserPlus, 
    Loader2, Download, FileText, ImageIcon, ExternalLink,
    Calendar, User, Heart, AlertCircle, Eye, Pause, ShieldCheck
} from "lucide-react";
import Link from "next/link";
import FilePreviewModal from "@/components/admin/FilePreviewModal";

export default function CampaignReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [campaign, setCampaign] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [volunteers, setVolunteers] = useState<any[]>([]);
    const [assignModal, setAssignModal] = useState(false);

    // Preview state
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState({ url: "", type: "", name: "" });

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "admin")) {
            router.push("/admin/login");
            return;
        }
        if (user) {
            fetchCampaignDetails();
            fetchVolunteers();
        }
    }, [user, authLoading, id]);

    const fetchCampaignDetails = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/campaigns/${id}/`);
            setCampaign(res.data);
        } catch (err) {
            console.error("Failed to fetch campaign details", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchVolunteers = async () => {
        try {
            const res = await api.get("/volunteers/");
            setVolunteers(res.data?.results || res.data || []);
        } catch (err) {
            console.error("Failed to fetch volunteers", err);
        }
    };

    const handleAction = async (action: string, data?: any) => {
        setActionLoading(true);
        try {
            await api.post(`/admin/campaigns/${id}/${action}/`, data || {});
            fetchCampaignDetails();
        } catch (err) {
            console.error(`Failed to perform action: ${action}`, err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleAssign = async (volunteerId: string) => {
        await handleAction("assign-volunteer", { volunteer_id: volunteerId });
        setAssignModal(false);
    };

    const openPreview = (url: string, name: string) => {
        const type = url.toLowerCase().endsWith(".pdf") ? "pdf" : "image";
        setPreviewData({ url, type, name });
        setPreviewOpen(true);
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

    if (!campaign) {
        return (
            <div className="flex min-h-screen bg-[#F8FAFC]">
                <AdminSidebar />
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <AlertCircle className="w-16 h-16 text-gray-300" />
                    <h2 className="text-xl font-bold text-gray-900">Campaign Not Found</h2>
                    <Button onClick={() => router.push("/admin/campaigns")} variant="outline">
                        Back to Campaigns
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <AdminSidebar />
            <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            className="rounded-full h-10 w-10 p-0" 
                            onClick={() => router.push("/admin/campaigns")}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Review Campaign</h1>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                    campaign.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                                    campaign.status === "pending_review" ? "bg-amber-100 text-amber-700" :
                                    "bg-gray-100 text-gray-700"
                                }`}>
                                    {campaign.status?.replace(/_/g, " ")}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">ID: {campaign.id}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {(campaign.status === "pending_review" || campaign.status === "volunteer_assigned" || campaign.status === "verification_in_progress" || campaign.status === "report_submitted") && (
                            <>
                                <Button 
                                    onClick={() => handleAction("approve")} 
                                    disabled={actionLoading}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-emerald-500/20"
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-2" /> Approve</>}
                                </Button>
                                <Button 
                                    onClick={() => handleAction("reject", { reason: "Does not meet criteria." })} 
                                    disabled={actionLoading}
                                    variant="outline" 
                                    className="text-red-600 border-red-200 hover:bg-red-50 rounded-xl h-11 px-6 font-bold"
                                >
                                    <XCircle className="w-4 h-4 mr-2" /> Reject
                                </Button>
                                <Button 
                                    onClick={() => setAssignModal(true)} 
                                    variant="outline" 
                                    className="text-blue-600 border-blue-200 hover:bg-blue-50 rounded-xl h-11 px-6 font-bold"
                                >
                                    <UserPlus className="w-4 h-4 mr-2" /> {campaign.status === "pending_review" ? "Assign Volunteer" : "Re-assign Volunteer"}
                                </Button>
                            </>
                        )}
                        {campaign.status === "approved" && (
                            <Button 
                                onClick={() => handleAction("suspend")} 
                                disabled={actionLoading}
                                variant="outline" 
                                className="text-gray-600 border-gray-200 hover:bg-gray-50 rounded-xl h-11 px-6 font-bold"
                            >
                                <Pause className="w-4 h-4 mr-2" /> Suspend
                            </Button>
                        )}
                        <Link href={`/fundraisers/${campaign.slug}`} target="_blank">
                            <Button variant="outline" className="rounded-xl h-11 px-4 text-gray-600 font-bold">
                                <ExternalLink className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Story & Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Summary Card */}
                        <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm space-y-6">
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-4">Basic Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Campaign Title</p>
                                    <p className="font-bold text-gray-900 text-lg">{campaign.title}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Category</p>
                                    <p className="font-bold text-gray-900 text-lg capitalize">{campaign.category}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Goal Amount</p>
                                    <p className="font-bold text-gray-900 text-lg">₹{parseFloat(campaign.goal_amount).toLocaleString()}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Beneficiary Relation</p>
                                    <p className="font-bold text-gray-900 text-lg capitalize">{campaign.beneficiary_relationship?.replace(/_/g, " ")}</p>
                                </div>
                            </div>
                        </div>

                        {/* Story Card */}
                        <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm space-y-6">
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-4">Campaign Story</h2>
                            <div className="prose prose-sm max-w-none text-gray-600 font-medium leading-relaxed">
                                {campaign.description?.split('\n').map((para: string, idx: number) => (
                                    <p key={idx} className="mb-4">{para}</p>
                                ))}
                            </div>
                        </div>

                        {/* Images Section */}
                        <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm space-y-6">
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-4">Campaign Images</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {campaign.cover_image && (
                                    <div 
                                        className="aspect-video bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 relative group cursor-pointer"
                                        onClick={() => openPreview(campaign.cover_image, "Cover Image")}
                                    >
                                        <img src={campaign.cover_image} alt="Cover" className="w-full h-full object-cover" />
                                        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-center">
                                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Cover Image</span>
                                        </div>
                                    </div>
                                )}
                                {campaign.images?.map((img: any, idx: number) => (
                                    <div 
                                        key={idx} 
                                        className="aspect-video bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 relative group cursor-pointer"
                                        onClick={() => openPreview(img.image, `Gallery Image ${idx + 1}`)}
                                    >
                                        <img src={img.image} alt={`Campaign ${idx}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        <div className="absolute top-2 right-2">
                                            <div className="bg-white/80 backdrop-blur p-1.5 rounded-lg text-gray-600 hover:text-red-500 transition-colors">
                                                <ImageIcon className="w-3.5 h-3.5" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!campaign.cover_image && (!campaign.images || campaign.images.length === 0)) && (
                                    <p className="col-span-full py-8 text-center text-gray-400 font-medium italic">No images uploaded.</p>
                                )}
                            </div>
                        </div>

                        {/* Volunteer Verification Reports */}
                        {campaign.verifications && campaign.verifications.length > 0 && (
                            <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm space-y-6">
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-4 flex items-center justify-between">
                                    Volunteer Verification Reports
                                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                </h2>
                                <div className="space-y-8">
                                    {campaign.verifications.map((v: any) => (
                                        <div key={v.id} className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                                            {/* Report Summary */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Agent</p>
                                                    <p className="font-bold text-slate-900 truncate">{v.volunteer_name}</p>
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                                    <p className="font-bold text-slate-900 uppercase text-xs">{v.status?.replace(/_/g, " ")}</p>
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Submitted On</p>
                                                    <p className="font-bold text-slate-900">{v.submitted_at ? new Date(v.submitted_at).toLocaleDateString() : 'Pending'}</p>
                                                </div>
                                            </div>

                                            {/* Checklist */}
                                            {(v.status === 'report_submitted' || v.status === 'completed') && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {[
                                                        { label: "Beneficiary Verified", value: v.beneficiary_verified },
                                                        { label: "Site Visit Conducted", value: v.site_visit_conducted },
                                                        { label: "Story Accuracy", value: v.story_accuracy },
                                                        { label: "Documents Authentic", value: v.documents_authentic },
                                                    ].map((item, i) => (
                                                        <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
                                                            <span className="text-xs font-bold text-slate-600 tracking-tight">{item.label}</span>
                                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${
                                                                item.value === 'yes' || item.value === true ? 'bg-emerald-100 text-emerald-700' :
                                                                item.value === 'no' || item.value === false ? 'bg-red-100 text-red-700' :
                                                                'bg-amber-100 text-amber-700'
                                                            }`}>
                                                                {typeof item.value === 'boolean' 
                                                                    ? (item.value ? 'YES' : 'NO') 
                                                                    : (item.value?.toString().toUpperCase() || 'N/A')}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Comments */}
                                            {v.report_text && (
                                                <div className="bg-red-50/30 rounded-2xl p-6 border border-red-100/50">
                                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                        <FileText className="w-3 h-3" /> Field Comments
                                                    </p>
                                                    <p className="text-sm text-slate-700 font-medium leading-relaxed italic">"{v.report_text}"</p>
                                                </div>
                                            )}

                                            {/* Volunteer Uploaded Documents */}
                                            {v.documents && v.documents.length > 0 && (
                                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                                                        <FileText className="w-3 h-3" /> Uploaded Field Documents
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {v.documents.map((doc: any) => (
                                                            <div 
                                                                key={doc.id} 
                                                                className="group relative aspect-video bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:border-red-200 transition-all shadow-sm"
                                                                onClick={() => openPreview(doc.file, doc.document_type || "Verification Document")}
                                                            >
                                                                <img src={doc.file} alt={doc.document_type} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                                <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform">
                                                                    <p className="text-[10px] font-bold text-white uppercase tracking-widest truncate">{doc.document_type?.replace(/_/g, " ")}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Verdict */}
                                            {v.recommendation && (
                                                <div className="p-5 bg-slate-900 rounded-2xl shadow-xl shadow-slate-900/10">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Agent Verdict</p>
                                                        <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                                                            v.risk_rating === 'low' ? 'bg-emerald-500 text-white' :
                                                            v.risk_rating === 'medium' ? 'bg-amber-500 text-white' :
                                                            'bg-red-500 text-white'
                                                        }`}>
                                                            {v.risk_rating} Risk
                                                        </div>
                                                    </div>
                                                    <p className="text-white font-black text-lg uppercase tracking-tight">{v.recommendation?.replace(/_/g, " ")}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Organizer & Documents */}
                    <div className="space-y-8">
                        {/* Organizer Card */}
                        <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm space-y-6">
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-4 flex items-center gap-2">
                                <User className="w-5 h-5" /> Organizer Details
                            </h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Name</p>
                                    <p className="font-bold text-slate-900 underline decoration-red-500/30 underline-offset-4">{campaign.organizer_name}</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm py-1 border-b border-gray-50">
                                        <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" /> Created At
                                        </span>
                                        <span className="font-bold text-gray-900">{new Date(campaign.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm py-1 border-b border-gray-50">
                                        <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-1.5">
                                            <Heart className="w-3.5 h-3.5" /> Donor Count
                                        </span>
                                        <span className="font-bold text-gray-900">{campaign.donor_count}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Documents Card */}
                        <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm space-y-6">
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5" /> Documents
                            </h2>
                            <div className="space-y-3">
                                {campaign.documents?.length === 0 ? (
                                    <div className="text-center py-8">
                                        <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                        <p className="text-gray-400 text-sm italic font-medium">No documents uploaded for review.</p>
                                    </div>
                                ) : campaign.documents?.map((doc: any) => (
                                    <div key={doc.id} className="group p-4 bg-slate-50 hover:bg-red-50/30 rounded-2xl border border-slate-100 hover:border-red-100 transition-all">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest truncate mb-0.5">{doc.document_type?.replace(/_/g, " ")}</p>
                                                <p className="text-sm font-bold text-gray-700 truncate">{doc.file_name || "Verification Document"}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => openPreview(doc.document, doc.file_name || "Verification Document")}
                                                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm group-hover:shadow-md"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <a href={doc.document} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-500 hover:border-blue-200 transition-all shadow-sm group-hover:shadow-md">
                                                    <Download className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Volunteer Assignment Modal */}
                {assignModal && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setAssignModal(false)}>
                        <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl space-y-6" onClick={(e) => e.stopPropagation()}>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Assign Volunteer</h3>
                                <p className="text-sm text-gray-500 font-medium">Select a volunteer to perform high-stakes verification for this campaign.</p>
                            </div>
                            
                            <div className="space-y-3 max-h-[24rem] overflow-y-auto pr-2 custom-scrollbar">
                                {volunteers.length === 0 ? (
                                    <div className="py-12 text-center text-gray-400 font-medium bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                                        No volunteers registered in the system.
                                    </div>
                                ) : volunteers.map((v: any) => (
                                    <button
                                        key={v.id}
                                        onClick={() => handleAssign(v.id)}
                                        disabled={v.availability_status !== "available"}
                                        className={`w-full group flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                                            v.availability_status === "available"
                                                ? "border-slate-100 hover:border-red-100 hover:bg-red-50/20 cursor-pointer"
                                                : "border-slate-50 bg-slate-50/50 opacity-60 cursor-not-allowed"
                                        }`}
                                    >
                                        <div className="text-left space-y-1">
                                            <p className="font-bold text-base text-gray-900 group-hover:text-red-600 transition-colors uppercase tracking-tight">{v.user_details?.full_name || "Volunteer"}</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                {v.specialisation} &bull; {v.region}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                                                v.availability_status === "available" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                                            }`}>
                                                {v.availability_status}
                                            </span>
                                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-red-500 group-hover:border-red-100 transition-all">
                                                <UserPlus className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            
                            <Button onClick={() => setAssignModal(false)} variant="ghost" className="w-full h-12 rounded-2xl font-bold text-gray-400 hover:text-gray-900">
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
                {/* File Preview Modal */}
                <FilePreviewModal 
                    isOpen={previewOpen}
                    onClose={() => setPreviewOpen(false)}
                    fileUrl={previewData.url}
                    fileType={previewData.type}
                    fileName={previewData.name}
                />
            </main>
        </div>
    );
}
