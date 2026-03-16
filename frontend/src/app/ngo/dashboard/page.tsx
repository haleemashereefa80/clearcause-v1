"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    Building2,
    Heart,
    Plus,
    Users,
    TrendingUp,
    Bell,
    Settings,
    LayoutDashboard,
    ChevronRight,
    ArrowUpRight,
    FileText,
    ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function NGODashboard() {
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNGOData = async () => {
            try {
                // In a real app, use a filtered endpoint for the NGO
                const res = await api.get("/campaigns/");
                setCampaigns(res.data.results || res.data);
            } catch (err) {
                console.error("NGO data fetch failed", err);
            }
            setLoading(false);
        };
        fetchNGOData();
    }, []);

    return (
        <div className="flex min-h-screen bg-[#FDFDFD]">
            {/* NGO Sidebar */}
            <aside className="w-72 bg-white border-r border-blue-100 hidden lg:block p-8 space-y-12 shrink-0">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-black text-gray-900 tracking-tighter">NGO Hub</span>
                </div>

                <nav className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-3 mb-4">Organization</p>
                    <Link href="/ngo/dashboard" className="flex items-center gap-3 p-3.5 bg-blue-50 text-blue-700 rounded-2xl font-bold transition-all shadow-sm">
                        <LayoutDashboard className="w-5 h-5" /> Overview
                    </Link>
                    <Link href="/ngo/campaigns" className="flex items-center gap-3 p-3.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-2xl transition-all font-bold">
                        <Heart className="w-5 h-5" /> NGO Campaigns
                    </Link>
                    <Link href="/ngo/reports" className="flex items-center gap-3 p-3.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-2xl transition-all font-bold">
                        <FileText className="w-5 h-5" /> Impact Reports
                    </Link>
                    <Link href="/ngo/settings" className="flex items-center gap-3 p-3.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-2xl transition-all font-bold">
                        <Settings className="w-5 h-5" /> Settings
                    </Link>
                </nav>

                <div className="p-6 bg-blue-600 rounded-[2rem] text-white space-y-4 shadow-xl shadow-blue-200">
                    <ShieldCheck className="w-8 h-8 opacity-50" />
                    <p className="text-sm font-bold leading-tight">Your NGO is 80G Certified.</p>
                    <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest">Trust Rating: AAA</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow p-6 lg:p-12 overflow-y-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">{user?.ngo_profile?.org_name || "Organization Hub"}</h1>
                        <p className="text-gray-500 font-bold uppercase tracking-[0.1em] text-xs">Official Partner of ClearCause</p>
                    </div>
                    <Link href="/start-fundraiser">
                        <Button className="rounded-2xl h-12 px-8 font-black bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200">
                            <Plus className="w-5 h-5 mr-2" /> Launch NGO Program
                        </Button>
                    </Link>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {[
                        { label: "Total Program Fund", value: "₹18.4L", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
                        { label: "Beneficiaries Helped", value: "1,240+", icon: Users, color: "text-green-600", bg: "bg-green-50" },
                        { label: "Live Programs", value: campaigns.length.toString(), icon: Heart, color: "text-red-500", bg: "bg-red-50" },
                    ].map((s, i) => (
                        <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-sm transition-all hover:shadow-xl hover:shadow-blue-100/50">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.bg} ${s.color} mb-6`}>
                                <s.icon className="w-7 h-7" />
                            </div>
                            <p className="text-4xl font-black text-gray-900 tracking-tighter">{s.value}</p>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mt-2">{s.label}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-[3rem] border border-blue-50 shadow-sm overflow-hidden p-10">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Current NGO Programs</h2>
                        <Button variant="ghost" className="text-blue-600 font-black">Manage All <ChevronRight className="w-4 h-4 ml-1" /></Button>
                    </div>

                    {loading ? (
                        <div className="py-20 text-center animate-pulse text-blue-300 font-black uppercase tracking-widest">Analyzing data...</div>
                    ) : (
                        <div className="space-y-4">
                            {campaigns.slice(0, 3).map((c: any) => (
                                <div key={c.id} className="group p-6 bg-gray-50/50 rounded-3xl border border-transparent hover:border-blue-200 hover:bg-white transition-all flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-200">
                                            <img src={c.cover_image_url || "https://picsum.photos/seed/ngo/200"} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{c.title}</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <span>Goal: ₹{parseFloat(c.goal_amount).toLocaleString()}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                <span className="text-blue-500 italic">Official Program</span>
                                            </p>
                                        </div>
                                    </div>
                                    <Link href={`/dashboard/campaigns/${c.id}`}>
                                        <Button variant="outline" className="rounded-xl font-bold border-blue-100 text-blue-600 hover:bg-blue-50">View Impact</Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
