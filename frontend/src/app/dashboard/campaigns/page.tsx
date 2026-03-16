"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import api from "@/lib/api";
import {
    Heart,
    Edit,
    Share2,
    Pause,
    XCircle,
    Eye,
    Plus,
    Loader2,
    Calendar,
    Target,
    ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MyCampaigns() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const res = await api.get("/campaigns/?organizer=me");
                setCampaigns(res.data.results || res.data);
            } catch (err) {
                console.error("Failed to fetch user campaigns", err);
            }
            setLoading(false);
        };
        fetchCampaigns();
    }, []);

    return (
        <div className="flex min-h-screen bg-[#F8F9FD]">
            <Sidebar />

            <main className="flex-grow p-6 lg:p-12 overflow-y-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">My Campaigns</h1>
                        <p className="text-gray-500 font-bold uppercase tracking-[0.1em] text-xs underline decoration-primary/30 underline-offset-4">
                            Manage your active fundraisers
                        </p>
                    </div>
                    <Link href="/start-fundraiser">
                        <Button className="rounded-2xl h-12 px-6 font-black bg-primary text-white shadow-xl shadow-primary/20">
                            <Plus className="w-4 h-4 mr-2 stroke-[3]" /> Launch New
                        </Button>
                    </Link>
                </header>

                {loading ? (
                    <div className="py-20 text-center animate-pulse text-primary font-black uppercase tracking-widest">
                        Fetching your impact...
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="bg-white rounded-[3rem] border-2 border-dashed border-gray-100 p-20 text-center space-y-6">
                        <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-gray-200">
                            <Heart className="w-10 h-10" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl font-black text-gray-900 tracking-tight">No campaigns yet</p>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Start your first fundraiser to make a difference</p>
                        </div>
                        <Link href="/start-fundraiser">
                            <Button className="rounded-xl font-black px-8">Start Now</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {campaigns.map((c) => {
                            const progress = Math.min((parseFloat(c.raised_amount) / parseFloat(c.goal_amount)) * 100, 100);
                            return (
                                <div key={c.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 transition-all hover:shadow-xl hover:shadow-primary/5 group relative overflow-hidden">
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-8 relative z-10">
                                        <div className="w-full lg:w-56 h-36 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                                            <img src={c.cover_image_url || "https://picsum.photos/seed/cause/400/300"} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                        </div>

                                        <div className="flex-grow space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <h3 className="text-xl font-black text-gray-900 tracking-tight group-hover:text-primary transition-colors">{c.title}</h3>
                                                    <div className="flex flex-wrap gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        <span className="flex items-center gap-1.5"><Target className="w-3 h-3" /> Goal: ₹{parseFloat(c.goal_amount).toLocaleString()}</span>
                                                        <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Ends: {c.end_date || "Continuous"}</span>
                                                    </div>
                                                </div>
                                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${c.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    c.status === 'pending_review' ? 'bg-orange-50 text-orange-700 border-orange-100 animate-pulse' :
                                                        'bg-gray-50 text-gray-500 border-gray-200'
                                                    }`}>
                                                    {c.status.replace('_', ' ')}
                                                </span>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-500">
                                                    <span>Raised: ₹{parseFloat(c.raised_amount).toLocaleString()}</span>
                                                    <span>{progress.toFixed(0)}%</span>
                                                </div>
                                                <div className="h-3 bg-gray-50 rounded-full border border-gray-100 overflow-hidden">
                                                    <div className="h-full bg-primary relative" style={{ width: `${progress}%` }}>
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-shimmer" style={{ backgroundSize: '1000px 100%', backgroundRepeat: 'no-repeat' }} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 pt-2">
                                                <Link href={`/fundraisers/${c.slug}`}>
                                                    <Button variant="outline" className="rounded-xl font-bold h-10 px-4 border-gray-100 text-gray-600 hover:text-primary hover:bg-primary/5"><Eye className="w-4 h-4 mr-2" /> View</Button>
                                                </Link>
                                                <Link href={`/dashboard/campaigns/${c.slug || c.id}`}>
                                                    <Button variant="outline" className="rounded-xl font-bold h-10 px-4 border-gray-100 text-gray-600 hover:text-primary hover:bg-primary/5"><Edit className="w-4 h-4 mr-2" /> Manage</Button>
                                                </Link>
                                                <Button variant="outline" className="rounded-xl font-bold h-10 px-4 border-gray-100 text-gray-600 hover:text-primary hover:bg-primary/5"><Share2 className="w-4 h-4 mr-2" /> Share</Button>
                                                <Button variant="outline" className="rounded-xl font-bold h-10 px-4 border-gray-100 text-gray-600 hover:text-red-500 hover:bg-red-50"><Pause className="w-4 h-4 mr-2" /> Pause</Button>
                                                {c.status === 'approved' && (
                                                    <Link href={`/dashboard/campaigns/${c.slug || c.id}/withdraw`}>
                                                        <Button variant="outline" className="rounded-xl font-bold h-10 px-4 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all">
                                                            <ArrowUpRight className="w-4 h-4 mr-2" /> Withdraw
                                                        </Button>
                                                    </Link>
                                                )}
                                                <Button variant="outline" className="rounded-xl font-bold h-10 px-4 border-red-50 text-red-400 hover:text-red-600 hover:bg-red-50/50 hover:border-red-200"><XCircle className="w-4 h-4 mr-2" /> Close</Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
