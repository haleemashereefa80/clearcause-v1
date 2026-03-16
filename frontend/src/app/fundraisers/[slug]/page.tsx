"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { Share2, ShieldCheck, Heart, QrCode, ChevronDown, Award, MessageCircle } from "lucide-react";
import ShareModal from "@/components/campaigns/ShareModal";
import DonationModal from "@/components/campaigns/DonationModal";

export default function CampaignDetail() {
    const { slug } = useParams();
    const [campaign, setCampaign] = useState<any>(null);
    const [donors, setDonors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [shareOpen, setShareOpen] = useState(false);
    const [donateOpen, setDonateOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Story');
    const [isKnowMoreOpen, setIsKnowMoreOpen] = useState(false);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [campaignRes, donorsRes] = await Promise.all([
                    api.get(`/campaigns/${slug}/`),
                    api.get(`/campaigns/${slug}/donors/`)
                ]);
                setCampaign(campaignRes.data);
                setDonors(donorsRes.data);
            } catch (err) {
                console.error("Error fetching data", err);
            }
            setLoading(false);
        };
        fetchData();
    }, [slug]);

    if (loading) return (
        <div className="container mx-auto px-4 py-20 text-center text-primary animate-pulse font-bold text-2xl">
            Loading Campaign...
        </div>
    );
    if (!campaign) return (
        <div className="container mx-auto px-4 py-20 text-center">Campaign not found.</div>
    );

    const raisedAmount = Number(campaign.raised_amount) || 0;
    const goalAmount = Number(campaign.goal_amount) || 0;
    const progress = goalAmount > 0 ? Math.min((raisedAmount / goalAmount) * 100, 100) : 0;
    const campaignUrl =
        typeof window !== "undefined"
            ? `${window.location.origin}/fundraisers/${campaign.slug}`
            : `https://clearcause.org/fundraisers/${campaign.slug}`;
    const whatsappText = `Support ${campaign.beneficiary_name || "this cause"}\n\n${campaign.title}\n\nRaised Rs.${Math.round(raisedAmount).toLocaleString()} of Rs.${Math.round(goalAmount).toLocaleString()} (${Math.round(progress)}%)\n\nDonate and share:\n${campaignUrl}`;
    const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

    return (
        <>
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">{campaign.title}</h1>
                            <div className="flex items-center gap-4 text-sm font-medium">
                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full uppercase tracking-wider text-[10px]">
                                    {campaign.category}
                                </span>
                                {campaign.is_verified && (
                                    <span className="flex items-center gap-1 text-green-600">
                                        <ShieldCheck className="w-4 h-4" /> Verified
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="aspect-video rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/10">
                            <img
                                src={campaign.cover_image_url || "https://picsum.photos/seed/cause/1200/675"}
                                alt={campaign.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Progress, supporters and share below image */}
                        <div className="bg-white rounded-2xl border border-primary/10 p-4 sm:p-5 space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="relative w-[72px] h-[72px] shrink-0">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                            <path
                                                className="text-gray-200"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3.5"
                                            />
                                            <path
                                                className="text-primary transition-all duration-1000"
                                                strokeDasharray={`${progress}, 100`}
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3.5"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center font-semibold text-xs text-gray-800">
                                            {Math.round(progress)}%
                                        </div>
                                    </div>

                                    <div className="space-y-1 min-w-0">
                                        <p className="text-gray-500 text-sm font-medium">Raised</p>
                                        <p className="text-gray-900 leading-tight">
                                            <span className="font-bold text-lg text-primary">Rs.{Math.round(raisedAmount).toLocaleString()}</span>
                                            <span className="text-gray-500 text-sm"> of Rs.{Math.round(goalAmount).toLocaleString()}</span>
                                        </p>
                                    </div>
                                </div>

                                <span className="shrink-0 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                    {campaign.donor_count} supporters
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                    onClick={() => window.open(whatsappShareUrl, "_blank", "noopener,noreferrer")}
                                    className="h-12 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold text-base flex items-center justify-center gap-2 transition-colors"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    Share
                                </button>
                                <button
                                    onClick={() => setShareOpen(true)}
                                    className="h-12 rounded-full border border-primary text-primary hover:bg-primary/5 font-bold text-base flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Share2 className="w-5 h-5" />
                                    Share
                                </button>
                            </div>
                        </div>

                        {/* Know more before you donate */}
                        <div className="bg-primary/5 rounded-xl border border-primary/20 overflow-hidden">
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-primary/10 transition-colors"
                                onClick={() => setIsKnowMoreOpen(!isKnowMoreOpen)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                                        <Award className="w-5 h-5 text-primary" />
                                    </div>
                                    <span className="font-semibold text-gray-800">ClearCause team has done the following checks</span>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isKnowMoreOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {/* Dropdown Content */}
                            {isKnowMoreOpen && (
                                <div className="bg-white border-t border-primary/10 p-6 space-y-6">
                                    <div className="flex items-start gap-4">
                                        <ShieldCheck className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-800">Supporting documents: <span className="text-primary">Verified</span></p>
                                            <p className="text-sm text-gray-500 mt-1">Verified Bills, Diagnosis report, Estimation Letter of the beneficiary's treatment</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <ShieldCheck className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-800">Medical cause: <span className="text-primary">Verified</span></p>
                                            <p className="text-sm text-gray-500 mt-1">Verified with the Hospital or respective medical authority</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <ShieldCheck className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-800">KYC documents: <span className="text-primary">Verified</span></p>
                                            <p className="text-sm text-gray-500 mt-1">Verified Government ID proofs and bank details of the Organizer/Beneficiary</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <ShieldCheck className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-800">Fund utilisation: <span className="text-primary">Verified</span></p>
                                            <p className="text-sm text-gray-500 mt-1">Funds are tracked and transferred directly against valid Bills or Estimation Letters</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Organizer & Beneficiary Info Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-4 bg-white">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600 text-lg">
                                    {campaign.organizer?.full_name?.[0]?.toUpperCase() || "O"}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Created by</p>
                                    <p className="font-semibold text-gray-900">{campaign.organizer?.full_name || "Organizer"}</p>
                                </div>
                            </div>
                            <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-4 bg-white">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary text-lg">
                                    {campaign.beneficiary_name?.[0]?.toUpperCase() || "B"}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">This fundraiser will benefit</p>
                                    <p className="font-semibold text-gray-900">{campaign.beneficiary_name || "Beneficiary"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
                            {['Story', 'Documents', `Payouts (${campaign.payouts_count || 0})`, `Updates (${campaign.updates_count || 0})`].map((tab, idx) => {
                                const baseTab = tab.split(' ')[0];
                                const isActive = activeTab === baseTab;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveTab(baseTab)}
                                        className={`px-6 py-4 text-center font-bold text-sm transition-colors relative whitespace-nowrap ${isActive ? 'text-white bg-primary' : 'text-gray-500 hover:text-gray-700 bg-gray-50'}`}
                                    >
                                        {tab}
                                        {isActive && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary-dark"></div>}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tabs Content */}
                        <div className="pt-2">
                            {activeTab === 'Story' && (
                                <div
                                    className="prose max-w-none text-gray-800 leading-relaxed text-[15px]"
                                    dangerouslySetInnerHTML={{ __html: campaign.description }}
                                />
                            )}
                            {activeTab === 'Documents' && (
                                <div className="text-center py-12 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-gray-500 font-medium">No verified medical documents uploaded yet.</p>
                                </div>
                            )}
                            {activeTab === 'Payouts' && (
                                <div className="text-center py-12 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-gray-500 font-medium">No payouts requested or processed yet.</p>
                                </div>
                            )}
                            {activeTab === 'Updates' && (
                                <div className="text-center py-12 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-gray-500 font-medium">No announcements or updates posted yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Cost Breakup */}
                        <div className="space-y-6 pt-8 mt-8 border-t border-primary/10">
                            <div className="bg-white border border-primary/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
                                <div className="text-center space-y-1">
                                    <h3 className="text-xl font-bold text-primary">Cost Breakup</h3>
                                    <p className="text-sm text-gray-600">ClearCause is a free platform, no fees charged for fundraising</p>
                                </div>

                                <div className="h-px bg-primary w-full max-w-xl mx-auto opacity-20"></div>

                                <div className="space-y-4 max-w-2xl mx-auto">
                                    <div className="flex justify-between items-center bg-gray-50 border border-primary/10 p-4 rounded-xl">
                                        <span className="text-sm text-gray-600">Funds raised (A)</span>
                                        <span className="font-bold text-gray-900">₹{parseFloat(campaign.raised_amount).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-gray-50 border border-primary/10 p-4 rounded-xl">
                                        <span className="text-sm text-gray-600 flex items-center gap-2">
                                            Payment gateway fees (B)
                                            <div className="w-4 h-4 rounded-full border border-gray-400 text-gray-400 flex items-center justify-center text-[10px] cursor-help" title="Standard 2% + 18% GST charged by payment gateways">i</div>
                                        </span>
                                        <span className="font-bold text-gray-900">₹{(parseFloat(campaign.raised_amount) * 0.0236).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-green-50 border border-green-200 p-4 rounded-xl overflow-hidden relative">
                                        <span className="text-sm text-green-800 relative z-10 font-medium">Available for beneficiary (A - B)</span>
                                        <span className="font-bold text-green-900 relative z-10 text-lg">
                                            ₹{(parseFloat(campaign.raised_amount) * (1 - 0.0236)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </span>
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full blur-2xl -mr-16 -mt-16"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Supporters List */}
                        <div className="pt-8">
                            <div className="bg-white border border-primary/10 rounded-2xl p-6 md:p-8 shadow-sm">
                                <div className="flex flex-col items-center gap-2 pb-6">
                                    <h2 className="text-xl font-bold text-gray-800">Supporters</h2>
                                    <div className="flex items-center gap-2 w-48 opacity-70">
                                        <div className="h-px bg-gray-400 flex-1"></div>
                                        <div className="w-2 h-2 rotate-45 bg-primary"></div>
                                        <div className="w-3 h-3 rotate-45 bg-primary"></div>
                                        <div className="w-2 h-2 rotate-45 bg-primary"></div>
                                        <div className="h-px bg-gray-400 flex-1"></div>
                                    </div>
                                </div>

                                <div className="bg-primary/5 p-4 rounded-md text-sm text-gray-700 mb-6 font-medium">
                                    <span className="underline cursor-pointer text-primary">Click here</span> if you are not able to find your donation listed below.
                                </div>

                                {donors.length > 0 ? (
                                    <div className="space-y-0">
                                        {donors.map((d: any, idx: number) => (
                                            <div key={d.id} className={`flex items-start gap-4 py-4 ${idx !== donors.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-lg shrink-0">
                                                    {d.is_anonymous ? "A" : d.donor_name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-gray-600 font-medium text-sm">
                                                        {d.is_anonymous ? "Anonymous" : d.donor_name}
                                                    </p>
                                                    <p className="text-gray-900 font-bold">₹{parseFloat(d.amount).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="pt-6 text-center">
                                            <button className="text-primary font-bold underline hover:no-underline transition-all">
                                                View all supporters
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-muted-foreground">
                                        No supporters yet. Be the first to donate!
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Action Cards */}
                        <div className="space-y-4 pt-4">
                            {/* Refer to Us Card */}
                            <div className="bg-white rounded-2xl p-6 md:p-8 text-center border shadow-sm flex flex-col items-center justify-center gap-4">
                                <p className="text-gray-600 font-medium">Know someone in need of funds?</p>
                                <button className="px-8 py-2.5 rounded-full border-2 border-primary text-primary font-medium hover:bg-primary hover:text-white transition-colors">
                                    Refer to us
                                </button>
                            </div>

                            {/* Report Cause Card */}
                            <div className="bg-white rounded-2xl p-6 md:p-8 text-center border shadow-sm">
                                <p className="text-gray-600">If something isn't right, we will work with you to ensure no misuse occurs.</p>
                                <button className="text-primary font-medium underline hover:no-underline mt-2">
                                    Report this cause
                                </button>
                            </div>

                            {/* Contact Card */}
                            <div className="bg-white rounded-2xl p-6 md:p-8 text-center border shadow-sm">
                                <p className="text-gray-600">Have a question or need assistance?</p>
                                <button className="text-primary font-medium underline hover:no-underline mt-2">
                                    Contact Us
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-8 relative">
                        <div className="sticky top-24 p-6 lg:p-8 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-primary/5 space-y-6">

                            {/* Header: Donate & Supporters */}
                            <div className="flex items-center justify-between pb-2">
                                <div className="flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-gray-700" />
                                    <span className="font-medium text-gray-800 text-lg">Donate</span>
                                </div>
                                <span className="text-primary font-medium hover:underline cursor-pointer">
                                    {campaign.donor_count} supporters
                                </span>
                            </div>

                            {/* Circular Progress & amount */}
                            <div className="flex items-center gap-6 mt-4">
                                <div className="relative w-20 h-20 shrink-0">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                        {/* Background Circle */}
                                        <path
                                            className="text-gray-100"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3.5"
                                        />
                                        {/* Progress Circle (Lavender theme) */}
                                        <path
                                            className="text-primary transition-all duration-1000"
                                            strokeDasharray={`${progress}, 100`}
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3.5"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center font-bold text-sm text-gray-800">
                                        {Math.round(progress)}%
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-gray-500 text-sm font-medium">Raised</p>
                                    <p className="text-gray-900">
                                        <span className="font-bold text-lg text-primary">Rs.{Math.round(raisedAmount).toLocaleString()}</span>
                                        <span className="text-gray-500 text-sm"> of Rs.{Math.round(goalAmount).toLocaleString()}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-4 pt-2">
                                <button
                                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-full shadow-lg shadow-primary/20 transition-all"
                                    onClick={() => setDonateOpen(true)}
                                >
                                    Donate now
                                </button>

                                <p className="text-center text-gray-500 text-xs font-medium">Card, Netbanking, Cheque pickups</p>

                                <div className="flex items-center gap-4 py-2 opacity-60">
                                    <div className="h-px bg-gray-300 flex-1"></div>
                                    <span className="text-gray-500 text-xs font-medium whitespace-nowrap">Or <span className="text-primary">Donate using</span></span>
                                    <div className="h-px bg-gray-300 flex-1"></div>
                                </div>

                                {/* QR Placeholder Box */}
                                <div className="border border-gray-200 bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center gap-4 relative overflow-hidden group">
                                    <div className="opacity-20 flex items-center justify-center group-hover:blur-sm transition-all duration-300">
                                        <QrCode className="w-32 h-32 text-gray-800" />
                                    </div>
                                    <button
                                        onClick={() => setDonateOpen(true)}
                                        className="absolute z-10 px-6 py-2 bg-white border border-primary text-primary font-semibold rounded-full shadow-md hover:bg-primary/5 transition-colors"
                                    >
                                        Generate QR
                                    </button>
                                </div>

                                {/* Supported Apps */}
                                <div className="text-center space-y-4 pt-4 border-t border-gray-100">
                                    <p className="text-gray-500 text-xs font-medium">Scan & donate with any app</p>
                                    <div className="flex items-center justify-center gap-3 grayscale opacity-70">
                                        <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-[10px] font-bold">UPI</div>
                                        <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-[10px] font-bold">GPay</div>
                                        <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-[10px] font-bold">Paytm</div>
                                        <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-[10px] font-bold">PhonePe</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Share Modal */}
            <ShareModal
                isOpen={shareOpen}
                onClose={() => setShareOpen(false)}
                campaign={{
                    title: campaign.title,
                    slug: campaign.slug,
                    raised_amount: campaign.raised_amount,
                    goal_amount: campaign.goal_amount,
                    beneficiary_name: campaign.beneficiary_name,
                }}
            />

            {/* Donation Modal */}
            <DonationModal
                isOpen={donateOpen}
                onClose={() => setDonateOpen(false)}
                campaignId={campaign.id}
                campaignTitle={campaign.title}
            />
        </>
    );
}

