"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import api from "@/lib/api";
import {
    History,
    ArrowUpRight,
    Calendar,
    FileText,
    ExternalLink,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DonationsMade() {
    const [donations, setDonations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const res = await api.get("/donations/?donor=me");
                setDonations(res.data.results || res.data);
            } catch (err) {
                console.error("Failed to fetch user donations", err);
            }
            setLoading(false);
        };
        fetchDonations();
    }, []);

    const totalAmount = donations.reduce((sum, d) => sum + parseFloat(d.amount), 0);

    return (
        <div className="flex min-h-screen bg-[#F8F9FD]">
            <Sidebar />

            <main className="flex-grow p-6 lg:p-12 overflow-y-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Donations Made</h1>
                        <p className="text-gray-500 font-bold uppercase tracking-[0.1em] text-xs underline decoration-primary/30 underline-offset-4">
                            Track your kindness across ClearCause
                        </p>
                    </div>
                    <div className="bg-white px-8 py-4 rounded-3xl border border-primary/10 shadow-lg shadow-primary/5 text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lifetime Impact</p>
                        <p className="text-2xl font-black text-primary italic">₹{totalAmount.toLocaleString()}</p>
                    </div>
                </header>

                {loading ? (
                    <div className="py-20 text-center animate-pulse text-primary font-black uppercase tracking-widest">
                        Summarizing your contributions...
                    </div>
                ) : donations.length === 0 ? (
                    <div className="bg-white rounded-[3rem] border-2 border-dashed border-gray-100 p-20 text-center space-y-6">
                        <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-gray-200">
                            <History className="w-10 h-10" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl font-black text-gray-900 tracking-tight">Your impact starts here</p>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">You haven't made any donations yet.</p>
                        </div>
                        <Link href="/ fundraise">
                            <Button className="rounded-xl font-black px-8">Find a Cause</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Campaign Title</th>
                                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Amount</th>
                                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {donations.map((d) => (
                                    <tr key={d.id} className="group hover:bg-primary/[0.01] transition-colors">
                                        <td className="p-8">
                                            <div className="space-y-1">
                                                <p className="font-bold text-gray-900 group-hover:text-primary transition-colors italic">{d.campaign_title || d.campaign}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate max-w-[200px]">ID: {d.gateway_order_id || "TRX-N/A"}</p>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <p className="font-black text-gray-900">₹{parseFloat(d.amount).toLocaleString()}</p>
                                        </td>
                                        <td className="p-8 uppercase">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 tracking-widest">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                {new Date().toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${d.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                                                }`}>
                                                {d.status}
                                            </span>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center gap-2">
                                                <Link href={`/fundraisers/${d.campaign}`}>
                                                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl text-gray-400 hover:text-primary"><ExternalLink className="w-4 h-4" /></Button>
                                                </Link>
                                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl text-gray-400 hover:text-primary"><FileText className="w-4 h-4" /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
