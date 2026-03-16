"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import VolunteerSidebar from "@/components/volunteer/VolunteerSidebar";
import { 
    Loader2, ClipboardList, CheckCircle2, AlertCircle, 
    Clock, MapPin, ArrowRight, User, ShieldCheck, 
    History, Zap
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function VolunteerDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "volunteer")) {
            router.push("/volunteer/login");
            return;
        }
        if (user) {
            fetchData();
        }
    }, [user, authLoading]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pRes, aRes] = await Promise.all([
                api.get("/volunteers/me/"),
                api.get("/assignments/"),
            ]);
            setProfile(pRes.data);
            setAssignments(aRes.data?.results || aRes.data || []);
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleAvailability = async (newStatus: string) => {
        if (!profile) return;
        setUpdatingStatus(true);
        try {
            await api.post(`/volunteers/${profile.id}/update_availability/`, { status: newStatus });
            setProfile({ ...profile, availability_status: newStatus });
            toast.success(`Status updated to ${newStatus}`);
        } catch (err) {
            toast.error("Failed to update status");
        } finally {
            setUpdatingStatus(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="flex min-h-screen bg-[#F8FAFC]">
                <VolunteerSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Decrypting Field Data...</p>
                    </div>
                </div>
            </div>
        );
    }

    const activeJobs = assignments.filter(a => ['assigned', 'in_progress'].includes(a.status));
    const completedJobs = assignments.filter(a => ['report_submitted', 'completed'].includes(a.status));

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <VolunteerSidebar />
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto max-w-7xl mx-auto space-y-8">
                {/* Header & Status Toggle */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Agent Dashboard</h1>
                            <div className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest">Live</div>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">
                            Welcome back, <span className="text-slate-900 font-bold">{user?.full_name}</span>. You have {activeJobs.length} tasks requiring immediate deployment.
                        </p>
                    </div>

                    <div className="bg-white p-2 rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-1">
                        {['available', 'busy', 'on_leave'].map((s) => (
                            <button
                                key={s}
                                onClick={() => toggleAvailability(s)}
                                disabled={updatingStatus}
                                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    profile?.availability_status === s
                                        ? s === 'available' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                          : s === 'busy' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                                          : 'bg-slate-500 text-white shadow-lg shadow-slate-500/20'
                                        : 'text-slate-400 hover:bg-slate-50'
                                }`}
                            >
                                {s.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm group hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                <Zap className="w-6 h-6" />
                            </div>
                            <span className="text-2xl font-black text-slate-900">{activeJobs.length}</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Deployments</p>
                    </div>
                    <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm group hover:shadow-xl hover:shadow-emerald-500/5 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <span className="text-2xl font-black text-slate-900">{profile?.total_completed || 0}</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Campaigns</p>
                    </div>
                    <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm group hover:shadow-xl hover:shadow-red-500/5 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight truncate max-w-[120px]">{profile?.region}</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Sector</p>
                    </div>
                </div>

                {/* Active Assignments List */}
                <section id="active" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider flex items-center gap-3">
                            <ClipboardList className="w-6 h-6 text-red-600" />
                            Target Verification Track
                        </h2>
                        <span className="text-xs font-bold text-slate-400 italic">Sorted by Recency</span>
                    </div>

                    {activeJobs.length === 0 ? (
                        <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck className="w-10 h-10 text-slate-200" />
                            </div>
                            <h3 className="text-slate-400 font-bold text-xl uppercase tracking-tight">System Idle</h3>
                            <p className="text-slate-400 text-sm font-medium mt-1">No pending verification assignments found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {activeJobs.map((job) => (
                                <div key={job.id} className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all group">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                        <div className="flex items-start gap-6">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-red-50 group-hover:border-red-100 transition-colors">
                                                <Zap className="w-8 h-8 text-slate-300 group-hover:text-red-500" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-red-600 transition-colors">{job.campaign_title}</h3>
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                        <Clock className="w-3.5 h-3.5" /> Assigned {new Date(job.assigned_at).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                        <MapPin className="w-3.5 h-3.5" /> Field Visit Required
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${
                                                        job.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                                                    }`}>
                                                        {job.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => router.push(`/volunteer/assignments/${job.id}`)}
                                            className="h-14 px-8 bg-slate-900 text-white font-black rounded-2xl hover:bg-red-600 transition-all flex items-center justify-center gap-3 group/btn"
                                        >
                                            INFILTRATE & VERIFY
                                            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* History Section */}
                <section id="history" className="pt-8">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider flex items-center gap-3">
                                <History className="w-6 h-6 text-slate-400" />
                                Verified Logs
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Campaign Reference</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Submission Date</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Verdict</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {completedJobs.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-bold italic">No successfully verified campaigns in history.</td>
                                        </tr>
                                    ) : completedJobs.map((job) => (
                                        <tr key={job.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <p className="font-bold text-slate-900 uppercase tracking-tight truncate max-w-[300px]">{job.campaign_title}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-sm text-slate-500 font-bold">{new Date(job.submitted_at || job.assigned_at).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-lg uppercase tracking-tighter">Verified</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button 
                                                    onClick={() => router.push(`/volunteer/assignments/${job.id}`)}
                                                    className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                                >
                                                    <ArrowRight className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
