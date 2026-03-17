"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Heart, Loader2, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        mobile: "",
        password: "",
        confirmPassword: "",
        role: "donor" // Default role
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const validateEmail = (email: string) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!formData.full_name || !formData.email || !formData.mobile || !formData.password || !formData.confirmPassword) {
            setError("All fields are required.");
            return;
        }

        if (!validateEmail(formData.email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            // Remove confirmPassword before sending to API
            const { confirmPassword, ...submitData } = formData;
            await register(submitData);
            router.push("/dashboard");
        } catch (err: any) {
            const data = err.response?.data;
            if (data) {
                if (typeof data === 'string') {
                    setError(data);
                } else if (data.error) {
                    setError(data.error);
                } else {
                    const firstKey = Object.keys(data)[0];
                    const firstError = data[firstKey];
                    const message = Array.isArray(firstError) ? firstError[0] : firstError;
                    setError(`${firstKey}: ${message}`);
                }
            } else {
                setError("Registration failed.");
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-lg space-y-8 bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-primary/10 border border-primary/5">
                <div className="text-center space-y-3">
                    <div className="inline-flex p-4 bg-primary/10 rounded-3xl text-primary">
                        <Heart className="w-10 h-10 fill-primary" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h1>
                    <p className="text-muted-foreground">Join ClearCause and start making an impact</p>
                </div>

                {error && <p className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium text-center border border-red-100">{error}</p>}

                <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Full Name <span className="text-red-500">*</span></label>
                        <input
                            type="text" placeholder="Your full name"
                            className="w-full h-14 rounded-2xl border border-primary/20 px-4 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Email Address <span className="text-red-500">*</span></label>
                        <input
                            type="email" placeholder="name@example.com"
                            className="w-full h-14 rounded-2xl border border-primary/20 px-4 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Mobile Number <span className="text-red-500">*</span></label>
                        <input
                            type="tel" placeholder="+91 98765 43210"
                            className="w-full h-14 rounded-2xl border border-primary/20 px-4 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                            value={formData.mobile}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Password <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"} placeholder="••••••••"
                                className="w-full h-14 rounded-2xl border border-primary/20 px-4 focus:ring-2 focus:ring-primary focus:outline-none transition-all pr-12"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Confirm Password <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"} placeholder="••••••••"
                                className="w-full h-14 rounded-2xl border border-primary/20 px-4 focus:ring-2 focus:ring-primary focus:outline-none transition-all pr-12"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="md:col-span-2 pt-2">
                        <Button disabled={loading} className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 mt-2">
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Create Account"}
                        </Button>
                    </div>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary font-bold hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
}
