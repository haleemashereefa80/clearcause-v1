"use client";

import { useState } from "react";
import { X, Copy, Check, MessageCircle, Link2 } from "lucide-react";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaign: {
        title: string;
        slug: string;
        raised_amount: number;
        goal_amount: number;
        beneficiary_name?: string;
    };
}

function FacebookIcon() {
    return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
    );
}

function TwitterIcon() {
    return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

function LinkedInIcon() {
    return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
    );
}

export default function ShareModal({ isOpen, onClose, campaign }: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const campaignUrl =
        typeof window !== "undefined"
            ? `${window.location.origin}/fundraisers/${campaign.slug}`
            : `https://clearcause.org/fundraisers/${campaign.slug}`;

    const raisedPercent = Math.round((campaign.raised_amount / campaign.goal_amount) * 100);

    const whatsappMessage = `Support ${campaign.beneficiary_name || "this cause"}! 🙏\n\n*${campaign.title}*\n\nRaised ₹${Number(campaign.raised_amount).toLocaleString()} out of ₹${Number(campaign.goal_amount).toLocaleString()} (${raisedPercent}%)\n\nEvery rupee counts. Please donate and share:\n${campaignUrl}`;

    const twitterMessage = `Support "${campaign.title}" on ClearCause. ${raisedPercent}% funded — help us reach the goal! 🙏 ${campaignUrl} #ClearCause #Fundraiser`;

    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(campaignUrl)}&quote=${encodeURIComponent(`Support "${campaign.title}" — ${raisedPercent}% funded!`)}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterMessage)}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(campaignUrl)}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(campaignUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            // fallback: select input
        }
    };

    const shareOptions = [
        {
            label: "WhatsApp",
            href: whatsappUrl,
            icon: <MessageCircle className="w-5 h-5" />,
            color: "bg-green-500 hover:bg-green-600 text-white",
            desc: "Share with a personal message",
        },
        {
            label: "Facebook",
            href: facebookUrl,
            icon: <FacebookIcon />,
            color: "bg-blue-600 hover:bg-blue-700 text-white",
            desc: "Post to your Facebook",
        },
        {
            label: "Twitter / X",
            href: twitterUrl,
            icon: <TwitterIcon />,
            color: "bg-black hover:bg-gray-900 text-white",
            desc: "Tweet to your followers",
        },
        {
            label: "LinkedIn",
            href: linkedInUrl,
            icon: <LinkedInIcon />,
            color: "bg-[#0A66C2] hover:bg-[#005fa3] text-white",
            desc: "Share on LinkedIn",
        },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl shadow-black/20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-primary/5">
                    <div>
                        <h2 className="text-xl font-extrabold text-gray-900">Share this Fundraiser</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">Help spread the word and multiply the impact</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-600" />
                    </button>
                </div>

                {/* Campaign preview banner */}
                <div className="mx-6 mt-5 p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-1">
                    <p className="font-bold text-gray-900 text-sm line-clamp-2">{campaign.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-bold text-primary">₹{Number(campaign.raised_amount).toLocaleString()}</span>
                        <span>raised</span>
                        <span>·</span>
                        <span>{raisedPercent}% funded</span>
                    </div>
                </div>

                {/* Share buttons */}
                <div className="p-6 space-y-3">
                    {shareOptions.map(({ label, href, icon, color, desc }) => (
                        <a
                            key={label}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 ${color}`}
                        >
                            <span className="flex-shrink-0">{icon}</span>
                            <div className="text-left">
                                <p className="font-bold">{label}</p>
                                <p className="text-xs opacity-80 font-normal">{desc}</p>
                            </div>
                        </a>
                    ))}

                    {/* Copy link */}
                    <div className="mt-2 flex items-center gap-2 p-2 rounded-2xl bg-gray-50 border border-gray-100">
                        <div className="flex-grow px-3 py-2 text-xs text-gray-500 font-mono truncate">{campaignUrl}</div>
                        <button
                            onClick={handleCopy}
                            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${copied ? "bg-green-500 text-white" : "bg-primary text-white hover:bg-primary/90"}`}
                        >
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? "Copied!" : "Copy Link"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
