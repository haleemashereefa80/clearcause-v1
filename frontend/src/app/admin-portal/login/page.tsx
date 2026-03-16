"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError("");
        try {
            const res = await api.post("/auth/login/", { email, password });
            localStorage.setItem("access_token", res.data.access);
            localStorage.setItem("refresh_token", res.data.refresh);
            router.push("/admin-portal");
        } catch (err: any) {
            setError(err.response?.data?.error || "Invalid credentials.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4">
            <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-primary/10 border border-primary/5">
                <div className="text-center space-y-3">
                    <div className="inline-flex p-4 bg-primary/10 rounded-3xl text-primary">
                        <ShieldCheck className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Admin Portal</h1>
                    <p className="text-muted-foreground text-sm">Restricted access. Superuser accounts only.</p>
                </div>

                {error && <p className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium text-center">{error}</p>}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Admin Email</label>
                        <input type="email" required className="w-full h-14 rounded-2xl border border-primary/20 px-4 focus:ring-2 focus:ring-primary focus:outline-none"
                            value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Password</label>
                        <input type="password" required className="w-full h-14 rounded-2xl border border-primary/20 px-4 focus:ring-2 focus:ring-primary focus:outline-none"
                            value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <Button disabled={loading} className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20">
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Access Admin Portal"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
