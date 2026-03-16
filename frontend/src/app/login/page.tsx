"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Heart, Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
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

            // Fetch the user from localStorage or state and redirect
            const userJson = localStorage.getItem("user");
            if (userJson) {
                const user = JSON.parse(userJson);
                if (user.role === "admin") router.push("/admin/dashboard");
                else if (user.role === "volunteer") router.push("/volunteer/dashboard");
                else if (user.role === "ngo") router.push("/ngo/dashboard");
                else router.push("/dashboard");
            } else {
                router.push("/dashboard");
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "Invalid email or password.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-primary/10 border border-primary/5">
                <div className="text-center space-y-4">
                    <div className="inline-flex p-4 bg-primary/10 rounded-3xl text-primary">
                        <Heart className="w-10 h-10 fill-primary" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Welcome Back</h1>
                    <p className="text-muted-foreground">Sign in to your account</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {error && <p className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium text-center border border-red-100">{error}</p>}

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600 uppercase tracking-widest pl-1">Email Address <span className="text-red-500">*</span></label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            className="w-full h-14 rounded-2xl border border-primary/20 px-4 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-sm font-bold text-gray-600 uppercase tracking-widest pl-1">Password <span className="text-red-500">*</span></label>
                            <Link href="/forgot-password" className="text-xs font-bold text-primary hover:underline">Forgot?</Link>
                        </div>
                        <div className="relative group">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full h-14 rounded-2xl border border-primary/20 px-4 pr-12 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-primary transition-colors focus:outline-none"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5 animate-in zoom-in duration-300" />
                                ) : (
                                    <Eye className="w-5 h-5 animate-in zoom-in duration-300" />
                                )}
                            </button>
                        </div>
                    </div>

                    <Button
                        disabled={loading}
                        className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Sign In"}
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    New to ClearCause? <Link href="/register" className="text-primary font-bold hover:underline">Create Account</Link>
                </p>
            </div>
        </div>
    );
}
