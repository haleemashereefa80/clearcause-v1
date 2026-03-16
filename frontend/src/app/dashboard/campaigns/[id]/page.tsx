"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import api from "@/lib/api";
import {
    LayoutDashboard,
    Users,
    LineChart,
    Share2,
    XCircle,
    Pause,
    Play,
    Edit3,
    Image as ImageIcon,
    FileText,
    Mail,
    Plus,
    Loader2,
    CheckCircle2,
    Copy,
    Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CampaignManagement() {
    const { id } = useParams();
    const router = useRouter();
    const [campaign, setCampaign] = useState<any>(null);
    const [donors, setDonors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [isUpdating, setIsUpdating] = useState(false);

    // Editing states
    const [editData, setEditData] = useState({ title: "", description: "" });
    const [newUpdate, setNewUpdate] = useState({ content: "", image: null as File | null });
    const [newDoc, setNewDoc] = useState({ type: "other", file: null as File | null });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [campRes, donorRes] = await Promise.all([
                    api.get(`/campaigns/${id}/`),
                    api.get(`/campaigns/${id}/donors/`)
                ]);
                setCampaign(campRes.data);
                setDonors(donorRes.data);
                setEditData({ title: campRes.data.title, description: campRes.data.description });
            } catch (err) {
                console.error("Failed to fetch campaign details", err);
            }
            setLoading(false);
        };
        if (id) fetchData();
    }, [id]);

    const handleUpdateCampaign = async () => {
        setIsUpdating(true);
        try {
            await api.patch(`/campaigns/${id}/`, editData);
            setCampaign({ ...campaign, ...editData });
            alert("Campaign updated!");
        } catch (err) {
            alert("Update failed.");
        }
        setIsUpdating(false);
    };

    const handleAddImage = async (file: File) => {
        const formData = new FormData();
        formData.append('campaign', campaign.id);
        formData.append('image', file);
        try {
            await api.post('/campaign-images/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            // Refresh
            const res = await api.get(`/campaigns/${id}/`);
            setCampaign(res.data);
        } catch (err) {
            alert("Image upload failed.");
        }
    };

    const handlePostUpdate = async () => {
        const formData = new FormData();
        formData.append('campaign', campaign.id);
        formData.append('content', newUpdate.content);
        if (newUpdate.image) formData.append('image', newUpdate.image);
        try {
            await api.post('/campaign-updates/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setNewUpdate({ content: "", image: null });
            alert("Update posted!");
        } catch (err) {
            alert("Post failed.");
        }
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/fundraisers/${campaign.slug}`;
        navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
    };

    if (loading) return (
        <div className="flex min-h-screen bg-[#F8F9FD]">
            <Sidebar />
            <main className="flex-grow flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </main>
        </div>
    );

    if (!campaign) return <div>Campaign not found.</div>;

    const tabs = [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "donors", label: `Donors (${donors.length})`, icon: Users },
        { id: "analytics", label: "Analytics", icon: LineChart },
        { id: "updates", label: "Updates", icon: Edit3 },
        { id: "documents", label: "Documents", icon: FileText },
    ];

    return (
        <div className="flex min-h-screen bg-[#F8F9FD]">
            <Sidebar />

            <main className="flex-grow p-6 lg:p-12 overflow-y-auto">
                <header className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${campaign.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                    {campaign.status.replace('_', ' ')}
                                </span>
                                <span className="text-gray-400 font-bold text-xs">ID: {campaign.id.substring(0, 8)}</span>
                            </div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic">{campaign.title}</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button onClick={() => router.push(`/dashboard/campaigns/${id}/withdraw`)} className="rounded-2xl h-12 px-8 font-black bg-primary text-white shadow-xl shadow-primary/20">
                                Withdraw Funds
                            </Button>
                            <Button variant="outline" className="rounded-2xl h-12 px-6 border-gray-200">
                                <Share2 className="w-4 h-4 mr-2" /> Share
                            </Button>
                        </div>
                    </div>

                    <nav className="flex items-center gap-8 border-b border-gray-100 overflow-x-auto pb-0 h-14 no-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-1 h-full font-black text-xs uppercase tracking-widest transition-all relative shrink-0 ${activeTab === tab.id ? "text-primary" : "text-gray-400 hover:text-gray-600"
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full shadow-[0_-2px_6px_rgba(102,93,232,0.3)]" />
                                )}
                            </button>
                        ))}
                    </nav>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        {activeTab === "overview" && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Story Editor Mock */}
                                <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                        <Edit3 className="w-6 h-6 text-primary" /> Fundraiser Details
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Campaign Title</label>
                                            <input
                                                value={editData.title}
                                                onChange={e => setEditData({ ...editData, title: e.target.value })}
                                                className="w-full h-14 rounded-2xl border border-gray-100 bg-gray-50/30 px-6 font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Story / Description</label>
                                            <textarea
                                                rows={8}
                                                value={editData.description}
                                                onChange={e => setEditData({ ...editData, description: e.target.value })}
                                                className="w-full rounded-3xl border border-gray-100 bg-gray-50/30 p-6 font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleUpdateCampaign}
                                            disabled={isUpdating}
                                            className="rounded-xl font-black px-10"
                                        >
                                            {isUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                            Save Changes
                                        </Button>
                                    </div>
                                </section>

                                {/* Images Section */}
                                <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                        <ImageIcon className="w-6 h-6 text-primary" /> Media Gallery
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div
                                            onClick={() => document.getElementById('image-upload-input')?.click()}
                                            className="aspect-video rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300 hover:text-primary hover:border-primary/20 hover:bg-primary/[0.02] transition-all cursor-pointer group"
                                        >
                                            <input
                                                id="image-upload-input"
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => e.target.files?.[0] && handleAddImage(e.target.files[0])}
                                            />
                                            <Plus className="w-8 h-8 mb-2 stroke-[3] group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Add Image</span>
                                        </div>
                                        {campaign.images?.map((img: any) => (
                                            <div key={img.id} className="aspect-video rounded-2xl overflow-hidden relative group">
                                                <img src={img.image} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <Button variant="ghost" size="sm" className="h-10 w-10 p-0 bg-red-500/80 text-white rounded-xl backdrop-blur-sm"><XCircle className="w-4 h-4" /></Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === "donors" && (
                            <section className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-10 border-b border-gray-50 flex items-center justify-between">
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Full Donor List</h3>
                                    <Button variant="outline" className="rounded-xl border-gray-100"><Mail className="w-4 h-4 mr-2" /> Thank All Donors</Button>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {donors.map((d: any) => (
                                        <div key={d.id} className="p-10 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center font-black text-xl">
                                                    {d.donor_name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900">{d.donor_name}</p>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(d.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-gray-900">₹{parseFloat(d.amount).toLocaleString()}</p>
                                                <Button variant="ghost" size="sm" className="text-xs h-auto p-0 font-bold text-primary">Send Thank You</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {activeTab === "updates" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Post New Update</h3>
                                    <div className="space-y-6">
                                        <textarea
                                            placeholder="What's happening? (e.g. Surgery scheduled for Monday...)"
                                            rows={4}
                                            value={newUpdate.content}
                                            onChange={e => setNewUpdate({ ...newUpdate, content: e.target.value })}
                                            className="w-full rounded-2xl border border-gray-100 bg-gray-50/30 p-6 font-medium focus:ring-2 focus:ring-primary/20"
                                        />
                                        <div className="flex items-center gap-4">
                                            <Button
                                                variant="outline"
                                                onClick={() => document.getElementById('update-img')?.click()}
                                                className="rounded-xl border-dashed border-2 h-14 px-6 text-gray-400 font-bold text-[10px] uppercase tracking-widest"
                                            >
                                                <input id="update-img" type="file" className="hidden" onChange={e => e.target.files?.[0] && setNewUpdate({ ...newUpdate, image: e.target.files[0] })} />
                                                {newUpdate.image ? newUpdate.image.name : "+ Add Photo"}
                                            </Button>
                                            <Button onClick={handlePostUpdate} disabled={!newUpdate.content} className="rounded-xl h-14 px-10 font-bold text-sm bg-primary text-white">Post Update</Button>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === "documents" && (
                            <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Campaign Documents</h3>
                                    <Button className="rounded-xl font-bold text-[10px] uppercase tracking-widest">+ Upload New</Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {campaign.documents?.map((doc: any) => (
                                        <div key={doc.id} className="p-6 border border-gray-50 rounded-2xl flex items-center justify-between group hover:bg-gray-50 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 text-xs">{doc.file_name}</p>
                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{doc.document_type}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100"><Copy className="w-4 h-4" /></Button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    <div className="space-y-8">
                        {/* Status Card */}
                        <div className="bg-primary text-white p-10 rounded-[3rem] shadow-2xl shadow-primary/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <ShieldCheck className="w-32 h-32" />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] opacity-80 mb-6">Campaign Status</h3>
                            <div className="space-y-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                                        {campaign.status === 'approved' ? <Play className="w-6 h-6 fill-white" /> : <Pause className="w-6 h-6 fill-white" />}
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black italic">{campaign.status === 'approved' ? 'Active' : 'Paused'}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Visibility: Public</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-4">
                                    <Button className="rounded-xl h-12 bg-white text-primary font-black shadow-lg">Toggle Status</Button>
                                    <Button variant="ghost" className="rounded-xl h-12 border border-white/20 text-white font-black">Close Campaign</Button>
                                </div>
                            </div>
                        </div>

                        {/* Link Sharing */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Quick Sharing</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between group">
                                    <p className="text-xs font-bold text-gray-500 truncate mr-2">clearcause.com/fundraisers/{campaign.slug}</p>
                                    <Button onClick={handleCopyLink} variant="ghost" size="sm" className="shrink-0 h-10 w-10 p-0 text-gray-400 hover:text-primary"><Copy className="w-4 h-4" /></Button>
                                </div>
                                <Button className="w-full h-14 rounded-2xl font-black border-2 border-primary/10 bg-white text-primary hover:bg-primary/5 transition-all">
                                    <Globe className="w-5 h-5 mr-3" /> Embed Code
                                </Button>
                            </div>
                        </div>

                        {/* Recent Analytics Mini */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Latest Impact</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-500">Raised Today</span>
                                    <span className="text-lg font-black text-gray-900">₹0</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-500">Total Views</span>
                                    <span className="text-lg font-black text-gray-900">1.2k</span>
                                </div>
                                <div className="h-24 bg-primary/[0.02] rounded-2xl flex items-end gap-1 p-4 overflow-hidden border border-primary/5">
                                    {[30, 45, 25, 60, 40, 70, 50].map((h, i) => (
                                        <div key={i} className="flex-grow bg-primary/20 rounded-t-md hover:bg-primary transition-colors" style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function ShieldCheck({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
    )
}
