"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Building2, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NGOLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { login } = useAuth();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError("");
        try {
            await login(email, password);
            const userJson = localStorage.getItem("user");
            if (userJson) {
                const user = JSON.parse(userJson);
                if (user.role === "ngo") {
                    router.push("/ngo/dashboard");
                } else {
                    setError("Unauthorized. You do not have an NGO account.");
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "Invalid credentials.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
            <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-[2.5rem] shadow-2xl border border-primary/5">
                <div className="text-center space-y-3">
                    <div className="inline-flex p-4 bg-blue-100 rounded-3xl text-blue-600">
                        <Building2 className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter">NGO Portal</h1>
                    <p className="text-muted-foreground font-medium text-sm">Create and manage your organization's impact</p>
                </div>

                {error && <p className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-semibold text-center border border-red-100">{error}</p>}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Organization Email</label>
                        <input
                            type="email" required
                            className="w-full h-14 rounded-2xl border border-gray-200 px-5 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                            placeholder="partners@ngo.org"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Password</label>
                        <input
                            type="password" required
                            className="w-full h-14 rounded-2xl border border-gray-200 px-5 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                            placeholder="••••••••"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Button disabled={loading} className="w-full h-14 rounded-2xl text-lg font-extrabold shadow-xl shadow-primary/10 transition-all hover:scale-[1.02] active:scale-95 bg-blue-600 hover:bg-blue-700">
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Sign In to Portal"}
                    </Button>
                </form>

                <div className="text-center space-y-4 pt-4">
                    <p className="text-sm font-medium text-gray-500">
                        New organization? <Link href="/register" className="text-blue-600 font-black hover:underline">Apply for NGO Account</Link>
                    </p>
                    <Link href="/login" className="block text-sm font-bold text-gray-400 hover:text-primary transition-colors">Return to standard login</Link>
                </div>
            </div>
        </div>
    );
}
