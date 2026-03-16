"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Download, Heart } from "lucide-react";

export default function DonationHistory() {
    const [donations, setDonations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get("/donations/");
                setDonations(res.data.results || res.data);
            } catch (e) { }
            setLoading(false);
        };
        fetch();
    }, []);

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl space-y-10">
            <div className="space-y-1">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Donations</h1>
                <p className="text-muted-foreground font-medium">Your full donation history and downloadable receipts.</p>
            </div>

            {loading ? (
                <div className="text-center py-20 text-primary font-bold animate-pulse">Loading your donations...</div>
            ) : donations.length === 0 ? (
                <div className="text-center py-24 space-y-4">
                    <Heart className="w-14 h-14 text-primary/30 mx-auto" />
                    <p className="text-lg font-bold text-gray-500">You haven't made any donations yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-primary/5 shadow-sm overflow-hidden">
                    <div className="divide-y divide-primary/5">
                        {donations.map((d: any) => (
                            <div key={d.id} className="px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <p className="font-bold text-gray-900">{d.campaign?.title || "Fundraiser"}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()} · Txn: {d.gateway_payment_id || "—"}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${d.status === "completed" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                                        {d.status}
                                    </span>
                                    <p className="text-xl font-black text-gray-900">₹{parseFloat(d.amount).toLocaleString()}</p>
                                    <button className="p-2 rounded-xl border border-primary/10 hover:bg-primary/5 transition-colors" title="Download Receipt">
                                        <Download className="w-4 h-4 text-primary" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-6 border-t border-primary/5 bg-gray-50/50 flex justify-between font-bold">
                        <span className="text-gray-600">Total Donated</span>
                        <span className="text-primary">₹{donations.filter(d => d.status === "completed").reduce((s, d) => s + parseFloat(d.amount), 0).toLocaleString()}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
