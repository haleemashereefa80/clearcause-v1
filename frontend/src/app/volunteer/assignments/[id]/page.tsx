"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import VolunteerSidebar from "@/components/volunteer/VolunteerSidebar";
import { 
    Loader2, ArrowLeft, CheckCircle2, ShieldCheck, 
    Upload, FileText, AlertCircle, Info, Camera,
    Search, MapPin, ExternalLink, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export default function AssignmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [assignment, setAssignment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [documents, setDocuments] = useState<any[]>([]);
    
    // Form State
    const [formData, setFormData] = useState({
        report_text: "",
        identity_verified: "yes",
        beneficiary_verified: "yes",
        documents_authentic: "yes",
        site_visit_conducted: true,
        story_accuracy: "accurate",
        risk_rating: "low",
        recommendation: "approve"
    });

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "volunteer")) {
            router.push("/volunteer/login");
            return;
        }
        if (user) {
            fetchData();
        }
    }, [user, authLoading, id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [aRes, dRes] = await Promise.all([
                api.get(`/assignments/${id}/`),
                api.get(`/verification-documents/?assignment=${id}`)
            ]);
            setAssignment(aRes.data);
            setDocuments(dRes.data?.results || dRes.data || []);
            
            // Pre-fill form if report exists
            if (aRes.data.status === 'report_submitted' || aRes.data.status === 'completed') {
                setFormData({
                    report_text: aRes.data.report_text || "",
                    identity_verified: aRes.data.identity_verified || "yes",
                    beneficiary_verified: aRes.data.beneficiary_verified || "yes",
                    documents_authentic: aRes.data.documents_authentic || "yes",
                    site_visit_conducted: aRes.data.site_visit_conducted ?? true,
                    story_accuracy: aRes.data.story_accuracy || "accurate",
                    risk_rating: aRes.data.risk_rating || "low",
                    recommendation: aRes.data.recommendation || "approve"
                });
            }
        } catch (err: any) {
            toast.error("Failed to load assignment data");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('document_type', type);

        try {
            toast.loading(`Uploading ${type}...`, { id: 'upload' });
            await api.post(`/assignments/${id}/upload-document/`, uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Document uploaded successfully", { id: 'upload' });
            // Refresh documents
            const dRes = await api.get(`/verification-documents/?assignment=${id}`);
            setDocuments(dRes.data?.results || dRes.data || []);
        } catch (err) {
            toast.error("Upload failed", { id: 'upload' });
        }
    };

    const handleSubmitReport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.report_text.length < 50) {
            toast.error("Report must be at least 50 characters long.");
            return;
        }
        setSubmitting(true);
        try {
            await api.post(`/assignments/${id}/report/`, formData);
            toast.success("Assignment report submitted for review!");
            router.push("/volunteer/dashboard");
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to submit report");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="flex min-h-screen bg-[#F8FAFC]">
                <VolunteerSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-red-600" />
                </div>
            </div>
        );
    }

    const isReadOnly = ['report_submitted', 'completed'].includes(assignment.status);

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <VolunteerSidebar />
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => router.push("/volunteer/dashboard")}
                            className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-100 shadow-sm transition-all"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Deployment Detail</h1>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                    assignment.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                                    assignment.status === "report_submitted" ? "bg-amber-100 text-amber-700" :
                                    "bg-blue-100 text-blue-700"
                                }`}>
                                    {assignment.status?.replace(/_/g, " ")}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1 font-bold">Ref: <span className="text-slate-900">VER-{assignment.id.slice(0,8).toUpperCase()}</span></p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Target Information */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Target Summary */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-8">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider flex items-center gap-3">
                                <Search className="w-6 h-6 text-red-600" />
                                Target Operation
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Campaign Title</p>
                                    <p className="font-bold text-slate-900 text-lg leading-tight uppercase">{assignment.campaign_title}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Sector</p>
                                    <p className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-red-500" /> {assignment.campaign_region || "Field Visit"}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic flex items-center gap-2">
                                    <Info className="w-3.5 h-3.5" /> Intelligence Memo
                                </p>
                                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                    You are tasked with verifying the beneficiary's identity and the accuracy of the story presented. 
                                    Conduct a physical site visit if possible and cross-verify with local community members or documentation.
                                </p>
                            </div>
                        </div>

                        {/* Submission Form */}
                        <form onSubmit={handleSubmitReport} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/40 space-y-8">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-4">Verification Intelligence Report</h2>
                            
                            {/* Structured Checkbox/Selects */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity Match</label>
                                    <select 
                                        disabled={isReadOnly}
                                        className="w-full h-14 bg-slate-50 border-2 border-transparent rounded-2xl px-5 text-sm font-bold transition-all outline-none focus:bg-white focus:border-red-500/20"
                                        value={formData.identity_verified}
                                        onChange={e => setFormData({...formData, identity_verified: e.target.value})}
                                    >
                                        <option value="yes">YES - Matches Documents</option>
                                        <option value="no">NO - Discrepancy Found</option>
                                        <option value="partial">PARTIAL - Needs More Info</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Beneficiary Status</label>
                                    <select 
                                        disabled={isReadOnly}
                                        className="w-full h-14 bg-slate-50 border-2 border-transparent rounded-2xl px-5 text-sm font-bold transition-all outline-none focus:bg-white focus:border-red-500/20"
                                        value={formData.beneficiary_verified}
                                        onChange={e => setFormData({...formData, beneficiary_verified: e.target.value})}
                                    >
                                        <option value="yes">YES - Case is Real</option>
                                        <option value="no">NO - Suspicious Activity</option>
                                        <option value="na">NOT APPLICABLE</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Story Accuracy</label>
                                    <select 
                                        disabled={isReadOnly}
                                        className="w-full h-14 bg-slate-50 border-2 border-transparent rounded-2xl px-5 text-sm font-bold transition-all outline-none focus:bg-white focus:border-red-500/20"
                                        value={formData.story_accuracy}
                                        onChange={e => setFormData({...formData, story_accuracy: e.target.value})}
                                    >
                                        <option value="accurate">FULLY ACCURATE</option>
                                        <option value="partial">PARTIALLY ACCURATE</option>
                                        <option value="inaccurate">INACCURATE / EMBELLISHED</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Assessment</label>
                                    <select 
                                        disabled={isReadOnly}
                                        className={`w-full h-14 border-2 border-transparent rounded-2xl px-5 text-sm font-bold transition-all outline-none ${
                                            formData.risk_rating === 'low' ? 'bg-emerald-50 focus:bg-white focus:border-emerald-500/20' :
                                            formData.risk_rating === 'medium' ? 'bg-amber-50 focus:bg-white focus:border-amber-500/20' :
                                            'bg-red-50 focus:bg-white focus:border-red-500/20'
                                        }`}
                                        value={formData.risk_rating}
                                        onChange={e => setFormData({...formData, risk_rating: e.target.value})}
                                    >
                                        <option value="low">LOW RISK</option>
                                        <option value="medium">MEDIUM RISK</option>
                                        <option value="high">HIGH RISK</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        disabled={isReadOnly}
                                        checked={formData.site_visit_conducted}
                                        onChange={e => setFormData({...formData, site_visit_conducted: e.target.checked})}
                                        className="w-5 h-5 rounded-md border-slate-200 text-red-600 focus:ring-red-500"
                                    />
                                    <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">I have conducted a physical site visit</span>
                                </label>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Field Observation & Testimony (Min 50 chars)</label>
                                    <textarea 
                                        required
                                        disabled={isReadOnly}
                                        placeholder="Describe your findings in detail. Include interaction with locals, proof of medical/educational state..."
                                        className="w-full min-h-[160px] bg-slate-50 border-2 border-transparent rounded-[1.5rem] p-6 text-sm font-medium leading-relaxed transition-all outline-none focus:bg-white focus:border-red-500/20"
                                        value={formData.report_text}
                                        onChange={e => setFormData({...formData, report_text: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Final Recommendation</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {['approve', 'reject', 'needs_more_info'].map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            disabled={isReadOnly}
                                            onClick={() => setFormData({...formData, recommendation: r})}
                                            className={`h-14 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${
                                                formData.recommendation === r
                                                    ? r === 'approve' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                                      : r === 'reject' ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20'
                                                      : 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20'
                                                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                                            }`}
                                        >
                                            {r.replace(/_/g, " ")}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {!isReadOnly && (
                                <div className="pt-6 border-t border-slate-50">
                                    <Button 
                                        type="submit" 
                                        disabled={submitting}
                                        className="w-full h-16 bg-slate-900 hover:bg-red-600 text-white rounded-[1.5rem] text-lg font-black shadow-xl shadow-slate-900/10 active:scale-[0.98] transition-all"
                                    >
                                        {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><ShieldCheck className="w-6 h-6 mr-2" /> SUBMIT VERIFICATION REPORT</>}
                                    </Button>
                                    <p className="text-[10px] text-slate-400 font-bold text-center mt-4 tracking-widest">THIS ACTION CANNOT BE UNDONE once reviewed by Admin.</p>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Right Column: Evidence & Source Docs */}
                    <div className="space-y-8">
                        {/* Evidence Uploads */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-6">
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <Camera className="w-5 h-5 text-red-500" /> Evidence Logs
                            </h2>
                            <p className="text-[10px] text-slate-400 font-bold italic leading-tight">Upload live photos of site visits, medical reports, or ID cross-checks.</p>
                            
                            <div className="space-y-4">
                                {['site_photo', 'id_verification', 'other'].map((type) => (
                                    <div key={type} className="group relative">
                                        <input 
                                            type="file" 
                                            disabled={isReadOnly}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                                            onChange={(e) => handleFileUpload(e, type)}
                                        />
                                        <div className="p-5 border-2 border-dashed border-slate-100 rounded-2xl group-hover:bg-red-50/30 group-hover:border-red-100 transition-all flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-red-500 transition-colors">
                                                    <Upload className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{type.replace('_', ' ')}</p>
                                                    <p className="text-[9px] font-bold text-slate-400">JPG/PNG/PDF MAX 5MB</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Submitted Evidence List */}
                            {documents.length > 0 && (
                                <div className="space-y-3 pt-4 border-t border-slate-50">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uploaded Evidence ({documents.length})</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {documents.map((doc: any) => (
                                            <div key={doc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="w-4 h-4 text-slate-400" />
                                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{doc.document_type}</span>
                                                </div>
                                                <a href={doc.file} target="_blank" className="p-1.5 hover:text-red-500 transition-colors">
                                                    <Eye className="w-4 h-4" />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Protocol Card */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                            <h2 className="text-lg font-black uppercase tracking-[0.2em] flex items-center gap-3">
                                <ShieldCheck className="w-6 h-6 text-emerald-500" /> Zero Trust Protocol
                            </h2>
                            <ul className="space-y-4">
                                {[
                                    "Confirm Beneficiary Presence",
                                    "Cross-verify Documents with Originals",
                                    "Consult Local Authorities/Neighbors",
                                    "Flag Any Political/Commercial Influence"
                                ].map((step, i) => (
                                    <li key={i} className="flex gap-4">
                                        <span className="w-5 h-5 bg-white/10 rounded-md flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</span>
                                        <p className="text-xs font-medium text-slate-300 leading-relaxed">{step}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
