"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import VolunteerSidebar from "@/components/volunteer/VolunteerSidebar";
import { 
    Loader2, History, ArrowRight
} from "lucide-react";

export default function HistoryPage() {
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

    const completedJobs = assignments.filter(a => ['report_submitted', 'completed'].includes(a.status));

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <VolunteerSidebar />
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto max-w-7xl mx-auto space-y-8">
                <header className="mb-10">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase">Verified History</h1>
                    <p className="text-sm font-medium text-gray-400 mt-1">
                        Historical record of all successful field verification operations
                    </p>
                </header>

                <section>
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider flex items-center gap-3">
                                <History className="w-6 h-6 text-slate-400" />
                                Operation Logs
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
