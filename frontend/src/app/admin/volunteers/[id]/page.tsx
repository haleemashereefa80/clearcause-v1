"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { 
    Loader2, ArrowLeft, ShieldCheck, Mail, Phone, 
    MapPin, Briefcase, FileText, CheckCircle2, AlertCircle 
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminVolunteerDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [volunteer, setVolunteer] = useState<any>(null);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!user || (user.role !== "admin" && !user.is_staff))) {
            router.push("/login");
            return;
        }
        if (user) {
            fetchData();
        }
    }, [user, authLoading, id]);

    const fetchData = async () => {
        try {
            const [vRes, aRes] = await Promise.all([
                api.get(`/volunteers/${id}/`),
                api.get(`/assignments/?volunteer_id=${id}`)
            ]);
            setVolunteer(vRes.data);
            setAssignments(aRes.data?.results || aRes.data || []);
        } catch (err: any) {
            toast.error("Failed to load volunteer data");
        } finally {
            setLoading(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="flex min-h-screen bg-[#F8FAFC]">
                <AdminSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-red-600" />
                </div>
            </div>
        );
    }

    if (!volunteer) return null;

    const getAvailStyle = (status: string) => {
        switch(status) {
            case 'available': return 'bg-emerald-100 text-emerald-700';
            case 'busy': return 'bg-amber-100 text-amber-700';
            case 'on_leave': return 'bg-slate-200 text-slate-600';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <AdminSidebar />
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.push("/admin/volunteers")}
                        className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-100 shadow-sm transition-all"
                        title="Back to Volunteers"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            {volunteer.user_details?.full_name}
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getAvailStyle(volunteer.availability_status)}`}>
                                {volunteer.availability_status}
                            </span>
                        </h1>
                        <p className="text-sm text-slate-500 font-medium tracking-tight">Agent ID: AGT-{volunteer.id.slice(0,8).toUpperCase()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Details */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                            <div className="w-24 h-24 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck className="w-10 h-10" />
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                        <Mail className="w-3 h-3" /> Contact Email
                                    </p>
                                    <p className="font-bold text-slate-900">{volunteer.user_details?.email}</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                            <MapPin className="w-3 h-3" /> Region
                                        </p>
                                        <p className="font-bold text-slate-900 uppercase">{volunteer.region || "All"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                            <Briefcase className="w-3 h-3" /> Type
                                        </p>
                                        <p className="font-bold text-slate-900 uppercase">{volunteer.specialisation}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                                    <div className="bg-blue-50/50 rounded-2xl p-4 text-center border border-blue-100/50">
                                        <p className="text-3xl font-black text-blue-600">{volunteer.active_assignments_count || 0}</p>
                                        <p className="text-[10px] font-bold text-blue-800 uppercase tracking-widest mt-1">Active</p>
                                    </div>
                                    <div className="bg-emerald-50/50 rounded-2xl p-4 text-center border border-emerald-100/50">
                                        <p className="text-3xl font-black text-emerald-600">{volunteer.total_completed || 0}</p>
                                        <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mt-1">Completed</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Mission History */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-red-500" /> Mission Log
                            </h2>

                            {assignments.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                    <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="font-bold text-slate-900">No Assignments Yet</p>
                                    <p className="text-sm text-slate-500 mt-1">This agent hasn't been deployed on any missions.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {assignments.map((a: any) => (
                                        <div key={a.id} className="p-5 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-red-100 transition-colors">
                                            <div>
                                                <p className="font-bold text-slate-900 uppercase">{a.campaign_title}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-bold text-slate-400 tracking-wider">REF: {a.id.slice(0,8).toUpperCase()}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                    <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                                                        Risk: <span className={`uppercase ${
                                                            a.risk_rating === 'high' ? 'text-red-500' :
                                                            a.risk_rating === 'medium' ? 'text-amber-500' : 'text-emerald-500'
                                                        }`}>{a.risk_rating || "N/A"}</span>
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                a.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                a.status === 'report_submitted' ? 'bg-amber-100 text-amber-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                                {a.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
