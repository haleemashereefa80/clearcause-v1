"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2, Lock } from "lucide-react";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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
                const userData = JSON.parse(userJson);
                if (userData.role !== "admin") {
                    setError("Access denied. Admin accounts only.");
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    localStorage.removeItem("user");
                    setLoading(false);
                    return;
                }
            }
            router.push("/admin/dashboard");
        } catch (err: any) {
            setError(err.response?.data?.error || "Invalid credentials.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
            <div className="w-full max-w-md space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex p-5 bg-gradient-to-br from-red-500 to-rose-600 rounded-3xl shadow-2xl shadow-red-500/30">
                        <ShieldCheck className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Admin Portal</h1>
                    <p className="text-slate-400 text-sm font-medium">Restricted access. Authorized administrators only.</p>
                </div>

                {/* Card */}
                <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-700/50 shadow-2xl">
                    {error && (
                        <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Admin Email</label>
                            <input
                                type="email"
                                placeholder="admin@clearcause.com"
                                required
                                className="w-full h-13 rounded-xl bg-slate-900/50 border border-slate-600/50 px-4 py-3.5 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-none transition-all text-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                required
                                className="w-full h-13 rounded-xl bg-slate-900/50 border border-slate-600/50 px-4 py-3.5 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-none transition-all text-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <Button
                            disabled={loading}
                            className="w-full h-13 py-3.5 rounded-xl text-base font-bold bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/25 transition-all"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <span className="flex items-center gap-2">
                                    <Lock className="w-4 h-4" /> Access Admin Panel
                                </span>
                            )}
                        </Button>
                    </form>
                </div>

                {/* Footer - no create account link */}
                <p className="text-center text-xs text-slate-600 font-medium">
                    ClearCause Admin Portal &bull; Secured Access
                </p>
            </div>
        </div>
    );
}
