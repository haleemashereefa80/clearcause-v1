"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Link from "next/link";
import {
    Heart,
    Users,
    Wallet,
    FileCheck,
    TrendingUp,
    IndianRupee,
    AlertTriangle,
    ArrowUpRight,
    Loader2,
    ShieldCheck,
    Clock,
    Zap,
} from "lucide-react";

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "admin")) {
            router.push("/admin/login");
            return;
        }
        if (!user) return;

        const fetchStats = async () => {
            try {
                const res = await api.get("/admin/dashboard/");
                setStats(res.data);
            } catch (e) {
                console.error("Failed to load admin stats", e);
            }
            setLoading(false);
        };
        fetchStats();
    }, [user, authLoading, router]);

    if (authLoading || loading) {
        return (
            <div className="flex min-h-screen bg-[#F0F2F5]">
                <AdminSidebar />
                <main className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-red-500" />
                </main>
            </div>
        );
    }

    const metricCards = [
        { label: "Daily Donations", value: `₹${(stats?.daily_donations ?? 0).toLocaleString()}`, icon: IndianRupee, color: "from-emerald-500 to-green-600", bg: "bg-emerald-50" },
        { label: "Weekly Donations", value: `₹${(stats?.weekly_donations ?? 0).toLocaleString()}`, icon: TrendingUp, color: "from-blue-500 to-indigo-600", bg: "bg-blue-50" },
        { label: "Monthly Donations", value: `₹${(stats?.monthly_donations ?? 0).toLocaleString()}`, icon: Wallet, color: "from-violet-500 to-purple-600", bg: "bg-violet-50" },
        { label: "Active Campaigns", value: stats?.active_campaigns ?? 0, icon: Heart, color: "from-red-500 to-rose-600", bg: "bg-red-50" },
        { label: "New Users Today", value: stats?.new_users_today ?? 0, icon: Users, color: "from-sky-500 to-cyan-600", bg: "bg-sky-50" },
        { label: "Pending KYC", value: stats?.pending_kyc ?? 0, icon: FileCheck, color: "from-amber-500 to-orange-600", bg: "bg-amber-50" },
        { label: "Pending Withdrawals", value: stats?.pending_withdrawals ?? 0, icon: Clock, color: "from-slate-500 to-gray-600", bg: "bg-slate-100" },
        { label: "Platform Tips", value: `₹${(stats?.platform_tips ?? 0).toLocaleString()}`, icon: Zap, color: "from-pink-500 to-fuchsia-600", bg: "bg-pink-50" },
    ];

    const alertItems = [
        { label: "Flagged Campaigns", value: stats?.flagged_campaigns ?? 0, severity: "high" },
        { label: "Failed Payments", value: stats?.failed_payments ?? 0, severity: "medium" },
        { label: "Pending Review", value: stats?.pending_campaigns ?? 0, severity: "low" },
    ];

    const shortcuts = [
        { label: "Review Campaigns", href: "/admin/campaigns?status=pending_review", icon: Heart },
        { label: "Review Withdrawals", href: "/admin/withdrawals?status=pending", icon: Wallet },
        { label: "KYC Submissions", href: "/admin/kyc?status=pending", icon: FileCheck },
        { label: "Verify Volunteers", href: "/admin/volunteers", icon: ShieldCheck },
    ];

    return (
        <div className="flex min-h-screen bg-[#F0F2F5]">
            <AdminSidebar />

            <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                {/* Header */}
                <header className="mb-10">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Platform Overview</h1>
                    <p className="text-sm font-medium text-gray-400 mt-1">
                        Real-time metrics &bull; Last updated just now
                    </p>
                </header>

                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                    {metricCards.map((card, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-4`}>
                                <card.icon className={`w-5 h-5 bg-gradient-to-br ${card.color} bg-clip-text`} style={{ color: 'inherit' }} />
                            </div>
                            <p className="text-2xl font-black text-gray-900">{card.value}</p>
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mt-1">{card.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Alerts Section */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-5">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            <h2 className="text-lg font-black text-gray-900">System Alerts</h2>
                        </div>
                        <div className="space-y-3">
                            {alertItems.map((alert, i) => (
                                <div
                                    key={i}
                                    className={`flex items-center justify-between p-3.5 rounded-xl border ${
                                        alert.severity === "high"
                                            ? "bg-red-50/50 border-red-100"
                                            : alert.severity === "medium"
                                            ? "bg-amber-50/50 border-amber-100"
                                            : "bg-blue-50/50 border-blue-100"
                                    }`}
                                >
                                    <span className="text-sm font-semibold text-gray-700">{alert.label}</span>
                                    <span className={`text-lg font-black ${
                                        alert.severity === "high" ? "text-red-600" :
                                        alert.severity === "medium" ? "text-amber-600" : "text-blue-600"
                                    }`}>
                                        {alert.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Shortcuts */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm lg:col-span-2">
                        <h2 className="text-lg font-black text-gray-900 mb-5">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {shortcuts.map((s, i) => (
                                <Link
                                    key={i}
                                    href={s.href}
                                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-red-200 hover:bg-red-50/30 transition-all group"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-gray-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                                        <s.icon className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                                    </div>
                                    <span className="text-sm font-bold text-gray-700 group-hover:text-red-600 transition-colors flex-1">
                                        {s.label}
                                    </span>
                                    <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-red-400 transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Summary Row */}
                <div className="mt-8 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Total Platform Volume</p>
                            <p className="text-3xl font-black mt-1">₹{(stats?.total_donations_amount ?? 0).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-8">
                            <div>
                                <p className="text-xs font-bold text-slate-400">Total Campaigns</p>
                                <p className="text-xl font-black">{stats?.total_campaigns ?? 0}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400">Total Users</p>
                                <p className="text-xl font-black">{stats?.total_users ?? 0}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400">Total Donations</p>
                                <p className="text-xl font-black">{stats?.total_donations_count ?? 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
