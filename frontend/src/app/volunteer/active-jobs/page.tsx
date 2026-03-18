"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import VolunteerSidebar from "@/components/volunteer/VolunteerSidebar";
import { 
    Loader2, ClipboardList, Clock, MapPin, ArrowRight, Zap, ShieldCheck
} from "lucide-react";

export default function ActiveJobsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "volunteer")) {
            router.push("/volunteer/login");
            return;
        }
        if (user) {
            fetchAssignments();
        }
    }, [user, authLoading]);

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const res = await api.get("assignments/");
            setAssignments(res.data?.results || res.data || []);
        } catch (err) {
            console.error("Failed to fetch assignments", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="flex min-h-screen bg-[#F8FAFC]">
                <VolunteerSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 animate-spin text-red-600" />
                </div>
            </div>
        );
    }

    const activeJobs = assignments.filter(a => ['assigned', 'in_progress'].includes(a.status));

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <VolunteerSidebar />
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto max-w-7xl mx-auto space-y-8">
                <header className="mb-10">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase">Active Deployments</h1>
                    <p className="text-sm font-medium text-gray-400 mt-1">
                        Current field verification assignments requiring immediate action
                    </p>
                </header>

                <section className="space-y-6">
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
            </main>
        </div>
    );
}
