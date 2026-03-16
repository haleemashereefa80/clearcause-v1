"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import api from "@/lib/api";
import {
    Heart,
    Wallet,
    TrendingUp,
    History,
    ArrowUpRight,
    ArrowDownLeft,
    Clock,
    Plus,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function UnifiedDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        const fetchSummary = async () => {
            if (!user) return;
            try {
                const res = await api.get("/dashboard/summary/");
                setSummary(res.data);
            } catch (err) {
                console.error("Failed to fetch dashboard summary", err);
            }
            setLoading(false);
        };
        fetchSummary();
    }, [user, authLoading, router]);

    if (authLoading || (loading && user)) {
        return (
            <div className="flex min-h-screen bg-[#F8F9FD]">
                <Sidebar />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Synchronizing your dashboard...</p>
                    </div>
                </main>
            </div>
        );
    }

    const { organizer, donor, user: summaryUser } = summary || {};

    return (
        <div className="flex min-h-screen bg-[#F8F9FD]">
            <Sidebar />

            <main className="flex-grow p-6 lg:p-12 overflow-y-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
                            Welcome back, {user?.full_name?.split(' ')[0]}!
                        </h1>
                        <p className="text-gray-500 font-bold uppercase tracking-[0.1em] text-xs underline decoration-primary/30 underline-offset-4">
                            Your impact at a glance {summaryUser?.kyc_status === 'verified' && "• Verified Organizer"}
                        </p>
                    </div>
                    <Link href="/start-fundraiser">
                        <Button className="rounded-2xl h-14 px-8 font-black bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">
                            <Plus className="w-5 h-5 mr-2 stroke-[3]" /> Start a Fundraiser
                        </Button>
                    </Link>
                </header>

                <div className="space-y-12">
                    {/* Organizer Metrics */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-8 bg-primary rounded-full" />
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Organizer Overview</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: "Total Raised", value: `₹${parseFloat(organizer?.total_raised).toLocaleString()}`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
                                { label: "Campaigns Created", value: organizer?.campaign_count, icon: Heart, color: "text-primary", bg: "bg-primary/5" },
                                { label: "Pending Withdrawals", value: organizer?.pending_withdrawals, icon: Wallet, color: "text-orange-600", bg: "bg-orange-50" },
                                { label: "Received (24h)", value: "₹0", icon: ArrowDownLeft, color: "text-blue-600", bg: "bg-blue-50" },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} mb-6`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Donor Metrics */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-8 bg-primary rounded-full opacity-30" />
                            <h2 className="text-xl font-black text-gray-400 uppercase tracking-tight">Donor Overview</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: "Total Donated Amount", value: `₹${parseFloat(donor?.total_donated).toLocaleString()}`, icon: Wallet, color: "text-indigo-600", bg: "bg-indigo-50" },
                                { label: "Campaigns Supported", value: donor?.donated_campaign_count, icon: Heart, color: "text-rose-600", bg: "bg-rose-50" },
                                { label: "Historical Contribution", value: "Level 1", icon: History, color: "text-amber-600", bg: "bg-amber-50" },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center ${stat.bg} ${stat.color} shrink-0`}>
                                        <stat.icon className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Activity Feeds */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Feed 1: Received */}
                        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-primary/2">
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Recent Donations Received</h3>
                                <Link href="/dashboard/campaigns" className="text-xs font-bold text-primary hover:underline">View All</Link>
                            </div>
                            <div className="flex-grow p-8 space-y-6">
                                {organizer?.recent_donations?.length > 0 ? (
                                    organizer.recent_donations.map((d: any) => (
                                        <div key={d.id} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center font-black">
                                                    {d.donor_name?.[0] || "?"}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">{d.donor_name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic truncate max-w-[150px]">
                                                        "{d.message || "No message"}"
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-gray-900 underline decoration-green-200 underline-offset-4">₹{parseFloat(d.amount).toLocaleString()}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Received</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center py-10 opacity-30 italic font-bold">
                                        No donations received yet.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Feed 2: Made */}
                        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Recent Donations Made</h3>
                                <Link href="/dashboard/donations" className="text-xs font-bold text-primary hover:underline">View All</Link>
                            </div>
                            <div className="flex-grow p-8 space-y-6">
                                {donor?.recent_donations?.length > 0 ? (
                                    donor.recent_donations.map((d: any) => (
                                        <div key={d.id} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                                    <ArrowUpRight className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 group-hover:text-primary transition-colors truncate max-w-[200px]">
                                                        {d.campaign_title || "ClearCause Campaign"}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {new Date().toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-gray-900 italic underline decoration-indigo-200 underline-offset-4">₹{parseFloat(d.amount).toLocaleString()}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Donated</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center py-10 opacity-30 italic font-bold">
                                        No donations made yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
