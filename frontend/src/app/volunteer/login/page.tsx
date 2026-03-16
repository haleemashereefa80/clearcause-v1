"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2, Eye, EyeOff, Lock, Mail } from "lucide-react";

export default function VolunteerLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { login } = useAuth();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await login(email, password);
            const userJson = localStorage.getItem("user");
            if (userJson) {
                const user = JSON.parse(userJson);
                if (user.role === "volunteer") router.push("/volunteer/dashboard");
                else {
                    setError("Unauthorized: Access restricted to verification agents.");
                    // Optional: logout if role is wrong
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "Invalid credentials or account locked.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
            <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-slate-100 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 opacity-50" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-50 rounded-full -ml-12 -mb-12 opacity-50" />

                <div className="text-center space-y-4 relative">
                    <div className="inline-flex p-5 bg-red-600 rounded-[2rem] text-white shadow-xl shadow-red-600/20 rotate-3 animate-in zoom-in-50 duration-500">
                        <ShieldCheck className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Agent Portal</h1>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Verification & Trust Fleet</p>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-6 relative">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold text-center border border-red-100 animate-in shake duration-300">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Agent Identity (Email)</label>
                        <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-red-500 transition-colors" />
                            <input
                                type="email"
                                required
                                placeholder="name@clearcause.com"
                                className="w-full h-14 bg-slate-50 border-2 border-transparent rounded-2xl pl-12 pr-5 text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:border-red-500/20 transition-all outline-none"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Key (Password)</label>
                        <div className="relative group">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-red-500 transition-colors" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="••••••••"
                                className="w-full h-14 bg-slate-50 border-2 border-transparent rounded-2xl pl-12 pr-14 text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:border-red-500/20 transition-all outline-none"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <Button
                        disabled={loading}
                        className="w-full h-16 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-base font-black shadow-xl shadow-red-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "AUTHENTICATE AGENT"}
                    </Button>
                </form>

                <div className="pt-6 border-t border-slate-50 text-center">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-relaxed">
                        Authorized Personnel Only.<br />
                        Access is monitored and audited.
                    </p>
                </div>
            </div>
        </div>
    );
}
