"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import api from "@/lib/api";
import {
    Wallet,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ArrowUpRight,
    Loader2,
    Plus
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WithdrawalStatusPage() {
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWithdrawals = async () => {
            try {
                const res = await api.get("/withdrawals/");
                setWithdrawals(res.data.results || res.data);
            } catch (err) {
                console.error("Failed to fetch withdrawals", err);
            }
            setLoading(false);
        };
        fetchWithdrawals();
    }, []);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-50 text-green-700 border-green-100';
            case 'approved': return 'bg-green-50 text-green-700 border-green-100';
            case 'rejected': return 'bg-red-50 text-red-700 border-red-100';
            case 'transfer_initiated': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'under_review': return 'bg-orange-50 text-orange-700 border-orange-100';
            case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F8F9FD]">
            <Sidebar />

            <main className="flex-grow p-6 lg:p-12 overflow-y-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic mb-2">Withdrawal Requests</h1>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs underline decoration-primary/20 underline-offset-4">
                            Track your fund transfers and status
                        </p>
                    </div>
                    <Link href="/dashboard/campaigns">
                        <Button className="rounded-2xl h-12 px-6 font-black bg-primary text-white shadow-xl shadow-primary/20">
                            <Plus className="w-4 h-4 mr-2 stroke-[3]" /> New Withdrawal
                        </Button>
                    </Link>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                        <p className="font-black text-primary uppercase tracking-widest text-xs font-bold">Synchronizing Transfer Data...</p>
                    </div>
                ) : withdrawals.length === 0 ? (
                    <div className="bg-white rounded-[3rem] border border-gray-100 p-20 text-center space-y-6 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-gray-200">
                            <Wallet className="w-10 h-10" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl font-black text-gray-900 tracking-tight">No requests found</p>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">When you initiate a withdrawal, it will appear here.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {withdrawals.map((w) => (
                            <div key={w.id} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${w.status === 'completed' ? 'bg-green-50 text-green-500' : 'bg-primary/5 text-primary'
                                            }`}>
                                            <ArrowUpRight className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">₹{parseFloat(w.amount).toLocaleString()}</h3>
                                                <span className={`px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(w.status)}`}>
                                                    {w.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                To: {w.transfer_option || 'Bank Account'} • {new Date(w.requested_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {w.transfer_reference && (
                                            <div className="text-right hidden md:block">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ref ID</p>
                                                <p className="font-bold text-gray-900">{w.transfer_reference}</p>
                                            </div>
                                        )}
                                        <Button variant="outline" className="rounded-xl font-black border-gray-100 text-gray-500 hover:text-primary transition-all">
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                                {w.rejection_reason && (
                                    <div className="mt-6 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                        <p className="text-sm font-medium text-red-800">
                                            <span className="font-black uppercase text-[10px] block mb-1">Rejection Reason:</span>
                                            {w.rejection_reason}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
