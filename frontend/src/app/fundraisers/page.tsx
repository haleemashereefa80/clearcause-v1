"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import FundraiserCard from "@/components/campaigns/FundraiserCard";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BrowseFundraisers() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");

    useEffect(() => {
        const fetchCampaigns = async () => {
            setLoading(true);
            try {
                const res = await api.get("/campaigns/", {
                    params: { search, category, status: 'approved' }
                });
                setCampaigns(res.data.results || res.data);
            } catch (err) {
                console.error("Error fetching campaigns", err);
            }
            setLoading(false);
        };
        fetchCampaigns();
    }, [search, category]);

    return (
        <div className="container mx-auto px-4 py-12 space-y-12">
            <div className="space-y-4">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Browse Fundraisers</h1>
                <p className="text-muted-foreground">Support verified causes and help change lives.</p>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by title, beneficiary, or location..."
                        className="w-full pl-12 pr-4 h-12 rounded-xl border border-primary/20 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        className="h-12 px-6 rounded-xl border border-primary/20 bg-white focus:outline-none font-medium appearance-none cursor-pointer"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        <option value="medical">Medical</option>
                        <option value="education">Education</option>
                        <option value="disaster">Disaster Relief</option>
                        <option value="animal">Animal Welfare</option>
                        <option value="ngo">NGO</option>
                    </select>
                    <Button variant="outline" className="h-12 px-6 rounded-xl border-primary/20">
                        <SlidersHorizontal className="w-5 h-5 mr-2" />
                        Filters
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="h-[400px] bg-white rounded-2xl animate-pulse border border-primary/5" />
                    ))}
                </div>
            ) : (
                <>
                    {campaigns.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {campaigns.map((campaign: any) => (
                                <FundraiserCard key={campaign.id} campaign={campaign} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 space-y-4">
                            <p className="text-xl font-medium text-muted-foreground">No fundraisers found matching your search.</p>
                            <Button variant="ghost" onClick={() => { setSearch(""); setCategory(""); }}>Clear all filters</Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
