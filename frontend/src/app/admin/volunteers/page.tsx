"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Loader2, ClipboardList, Eye, ShieldCheck, Plus, X, UserPlus, MapPin, Briefcase, Mail, Phone, Lock, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminVolunteers() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [volunteers, setVolunteers] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    
    // Create Volunteer Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        mobile: "",
        password: "",
        region: "",
        specialisation: "general"
    });

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "admin")) { router.push("/admin/login"); return; }
        if (!user) return;
        fetchData();
    }, [user, authLoading]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [vRes, aRes] = await Promise.all([
                api.get("/volunteers/"),
                api.get("/assignments/"),
            ]);
            setVolunteers(vRes.data?.results || vRes.data || []);
            setAssignments(aRes.data?.results || aRes.data || []);
        } catch { }
        setLoading(false);
    };

    const handleCreateVolunteer = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            await api.post("/volunteers/create_volunteer/", formData);
            toast.success("Volunteer created successfully!");
            setIsModalOpen(false);
            setFormData({ full_name: "", email: "", mobile: "", password: "", region: "", specialisation: "general" });
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to create volunteer");
        }
        setFormLoading(false);
    };

    const handleExpandAssignment = async (assignmentId: string) => {
        if (expandedAssignment === assignmentId) {
            setExpandedAssignment(null);
            return;
        }
        setExpandedAssignment(assignmentId);
        try {
            const res = await api.get(`/verification-documents/?assignment=${assignmentId}`);
            setDocuments(res.data?.results || res.data || []);
        } catch { setDocuments([]); }
    };

    const handleVerifyDoc = async (campaignId: string, docId: string) => {
        try {
            await api.post(`/admin/campaigns/${campaignId}/verify-document/${docId}/`);
            toast.success("Document verified!");
            // Re-fetch documents
            if (expandedAssignment) {
                const res = await api.get(`/verification-documents/?assignment=${expandedAssignment}`);
                setDocuments(res.data?.results || res.data || []);
            }
        } catch (e) { toast.error("Verification failed"); }
    };

    const getAvailStyle = (s: string) => {
        if (s === "available") return "bg-emerald-100 text-emerald-700";
        if (s === "busy") return "bg-amber-100 text-amber-700";
        return "bg-gray-100 text-gray-500";
    };

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <AdminSidebar />
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Volunteer Management</h1>
                        <p className="text-sm text-slate-500 font-medium mt-1">
                            {volunteers.length} active verification agents across {Array.from(new Set(volunteers.map(v => v.region))).length} regions
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3.5 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95"
                    >
                        <UserPlus className="w-5 h-5" />
                        Onboard Volunteer
                    </button>
                </header>

                {/* Volunteers Grid/Table */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden mb-10">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <h2 className="text-base font-black text-slate-900 uppercase tracking-widest">Active Fleet</h2>
                    </div>
                    {loading ? (
                        <div className="py-24 text-center">
                            <Loader2 className="w-10 h-10 animate-spin text-red-500 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold">Synchronizing agent data...</p>
                        </div>
                    ) : volunteers.length === 0 ? (
                        <div className="py-24 text-center">
                            <ClipboardList className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-500 font-bold text-xl">No volunteers onboarded yet</p>
                            <button onClick={() => setIsModalOpen(true)} className="text-red-500 font-bold hover:underline mt-2">Create the first agent</button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Agent</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Workload</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Region</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialisation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {volunteers.map((v: any) => (
                                        <tr 
                                            key={v.id} 
                                            onClick={() => router.push(`/admin/volunteers/${v.id}`)}
                                            className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-white group-hover:text-red-500 transition-colors border border-transparent group-hover:border-red-100">
                                                        {v.user_details?.full_name?.charAt(0) || "V"}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 group-hover:text-red-600 transition-colors uppercase tracking-tight">{v.user_details?.full_name}</p>
                                                        <p className="text-xs text-slate-400 font-medium">{v.user_details?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${getAvailStyle(v.availability_status)}`}>

                                                    {v.availability_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-black">
                                                        {v.active_assignments_count || 0} ACTIVE
                                                    </div>
                                                    {v.pending_reports_count > 0 && (
                                                        <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-black">
                                                            {v.pending_reports_count} PENDING
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-1.5 text-slate-600 font-bold text-sm">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                    {v.region}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-1.5 text-slate-600 font-bold text-sm">
                                                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                                    {v.specialisation}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Assignments with Document Review */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <h2 className="text-base font-black text-slate-900 uppercase tracking-widest">Active Verification Track</h2>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {assignments.map((a: any) => (
                            <div key={a.id} className="group">
                                <button onClick={() => handleExpandAssignment(a.id)} className="w-full p-6 flex items-center justify-between gap-4 hover:bg-red-50/30 text-left transition-colors">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-3 h-3 rounded-full ${a.status === 'report_submitted' ? 'bg-amber-500 animate-pulse' : 'bg-slate-200'}`} />
                                        <div>
                                            <p className="font-bold text-slate-900 group-hover:text-red-600 transition-colors uppercase tracking-tight">{a.campaign_title || "Campaign"}</p>
                                            <p className="text-xs text-slate-400 font-bold">
                                                <span className="text-slate-900">{a.volunteer_name}</span> • {a.status?.replace(/_/g, " ").toUpperCase()} • ASSIGNED {new Date(a.assigned_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {a.status === 'report_submitted' && (
                                            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-black rounded-lg uppercase tracking-tighter">Needs Review</span>
                                        )}
                                        <Eye className={`w-[18px] h-[18px] transition-transform ${expandedAssignment === a.id ? "text-red-500 rotate-90" : "text-slate-300 group-hover:text-slate-600"}`} />
                                    </div>
                                </button>

                                {expandedAssignment === a.id && (
                                    <div className="px-6 pb-8 ml-8 border-l-2 border-slate-100 space-y-6">
                                        {/* Report text */}
                                        {a.report_text && (
                                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 relative">
                                                <div className="absolute -left-3 top-6 w-6 h-6 bg-slate-50 border-2 border-slate-100 rounded-full flex items-center justify-center font-black text-slate-300 text-[10px]">!</div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Field Report Summary</p>
                                                <p className="text-sm text-slate-700 font-medium leading-relaxed italic">"{a.report_text}"</p>
                                            </div>
                                        )}

                                        {/* Documents uploaded by volunteer */}
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Evidence & Documentation</p>
                                            {documents.length === 0 ? (
                                                <div className="py-8 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
                                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">No files submitted yet</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {documents.map((doc: any) => (
                                                        <div key={doc.id} className="flex flex-col p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${doc.is_verified ? "bg-emerald-50 text-emerald-500" : "bg-slate-50 text-slate-400"}`}>
                                                                        <ShieldCheck className="w-5 h-5" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">{doc.document_type?.replace(/_/g, " ")}</p>
                                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Doc Verified: {doc.is_verified ? 'YES' : 'NO'}</p>
                                                                    </div>
                                                                </div>
                                                                <a href={doc.file} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white transition-all">
                                                                    <Eye className="w-4 h-4" />
                                                                </a>
                                                            </div>
                                                            <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                                                                <p className="text-[10px] text-slate-400 font-medium">Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                                                                {!doc.is_verified && (
                                                                    <button
                                                                        onClick={() => handleVerifyDoc(a.campaign, doc.id)}
                                                                        className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-lg hover:bg-emerald-600 transition-all"
                                                                    >
                                                                        Verify Doc
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Create Volunteer Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl shadow-slate-900/40 overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20">
                                        <UserPlus className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Onboard Agent</h2>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Initialize Verification Account</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-200/50 transition-colors text-slate-400">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleCreateVolunteer} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <div className="relative group">
                                            <input 
                                                type="text" required
                                                className="w-full h-14 bg-slate-50 border-2 border-transparent rounded-2xl px-5 text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:border-red-500/20 transition-all outline-none"
                                                placeholder="e.g. John Doe"
                                                value={formData.full_name}
                                                onChange={e => setFormData({...formData, full_name: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-red-500 transition-colors" />
                                            <input 
                                                type="email" required
                                                className="w-full h-14 bg-slate-50 border-2 border-transparent rounded-2xl pl-12 pr-5 text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:border-red-500/20 transition-all outline-none"
                                                placeholder="john@clearcause.com"
                                                value={formData.email}
                                                onChange={e => setFormData({...formData, email: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-red-500 transition-colors" />
                                            <input 
                                                type="text" required
                                                className="w-full h-14 bg-slate-50 border-2 border-transparent rounded-2xl pl-12 pr-5 text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:border-red-500/20 transition-all outline-none"
                                                placeholder="10-digit number"
                                                value={formData.mobile}
                                                onChange={e => setFormData({...formData, mobile: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Login Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-red-500 transition-colors" />
                                            <input 
                                                type="password" required
                                                className="w-full h-14 bg-slate-50 border-2 border-transparent rounded-2xl pl-12 pr-5 text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:border-red-500/20 transition-all outline-none"
                                                placeholder="Create credential"
                                                value={formData.password}
                                                onChange={e => setFormData({...formData, password: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Field Region</label>
                                        <div className="relative group">
                                            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-red-500 transition-colors" />
                                            <input 
                                                type="text" required
                                                className="w-full h-14 bg-slate-50 border-2 border-transparent rounded-2xl pl-12 pr-5 text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:border-red-500/20 transition-all outline-none"
                                                placeholder="e.g. Bangalore"
                                                value={formData.region}
                                                onChange={e => setFormData({...formData, region: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expertise Domain</label>
                                        <div className="relative group">
                                            <select 
                                                required
                                                className="w-full h-14 bg-slate-50 border-2 border-transparent rounded-2xl px-5 text-sm font-bold appearance-none transition-all outline-none focus:bg-white focus:border-red-500/20"
                                                value={formData.specialisation}
                                                onChange={e => setFormData({...formData, specialisation: e.target.value})}
                                            >
                                                <option value="general">General Verification</option>
                                                <option value="medical">Medical Review</option>
                                                <option value="education">Education Review</option>
                                                <option value="ngo">NGO Audit</option>
                                            </select>
                                            <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 rotate-90" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 h-14 border-2 border-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-50 transition-all"
                                    >
                                        CANCEL
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={formLoading}
                                        className="flex-[2] h-14 bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                    >
                                        {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                                        ONBOARD AGENT
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
