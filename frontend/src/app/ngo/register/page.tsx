"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Building2, Loader2 } from "lucide-react";

export default function NGORegister() {
    const [formData, setFormData] = useState({
        full_name: "", email: "", phone: "", ngo_name: "", registration_number: "", mission: ""
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError("");
        try {
            await api.post("/auth/register/", { ...formData, role: "ngo" });
            setSubmitted(true);
        } catch (err: any) {
            setError(err.response?.data?.error || "Registration failed. Please try again.");
        }
        setLoading(false);
    };

    if (submitted) {
        return (
            <div className="min-h-[85vh] flex items-center justify-center px-4">
                <div className="w-full max-w-md text-center space-y-6 bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-primary/10 border border-primary/5">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto">
                        <Building2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Registration Submitted!</h2>
                    <p className="text-muted-foreground">Your NGO registration is under review. Our team will verify your details within 2-3 business days and notify you via email.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg space-y-8 bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-primary/10 border border-primary/5">
                <div className="text-center space-y-3">
                    <div className="inline-flex p-4 bg-primary/10 rounded-3xl text-primary">
                        <Building2 className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Register Your NGO</h1>
                    <p className="text-muted-foreground text-sm">Subject to admin approval. Create multiple campaigns after approval.</p>
                </div>

                {error && <p className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {[
                        { label: "Contact Person Name", key: "full_name", type: "text", placeholder: "Full name" },
                        { label: "Official Email", key: "email", type: "email", placeholder: "ngo@organisation.org" },
                        { label: "Phone", key: "phone", type: "tel", placeholder: "+91 98765 43210" },
                        { label: "NGO / Organisation Name", key: "ngo_name", type: "text", placeholder: "Hope Foundation" },
                        { label: "Registration Number", key: "registration_number", type: "text", placeholder: "12A / 80G / FCRA" },
                    ].map(f => (
                        <div key={f.key} className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{f.label}</label>
                            <input
                                type={f.type} required placeholder={f.placeholder}
                                className="w-full h-14 rounded-2xl border border-primary/20 px-4 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                                value={(formData as any)[f.key]}
                                onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                            />
                        </div>
                    ))}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mission Statement</label>
                        <textarea rows={3} placeholder="Briefly describe your organisation's mission..."
                            className="w-full rounded-2xl border border-primary/20 px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm leading-relaxed"
                            value={formData.mission}
                            onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                        />
                    </div>
                    <Button disabled={loading} className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20">
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Submit for Approval"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
