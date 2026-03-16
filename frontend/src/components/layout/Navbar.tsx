"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Heart, User, Menu } from "lucide-react";

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-primary/10">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Heart className="w-8 h-8 text-primary fill-primary" />
                    <span className="text-xl font-bold text-primary tracking-tight">ClearCause</span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
                    <Link href="/fundraisers" className="text-sm font-medium hover:text-primary transition-colors">Browse Fundraisers</Link>
                    <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing Calculator</Link>
                </div>

                <div className="flex items-center gap-4">

                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="text-sm font-medium hover:text-primary">Dashboard</Link>
                            <Button onClick={logout} variant="outline" size="sm">Logout</Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">Login</Button>
                            </Link>
                            <Link href="/start-fundraiser">
                                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">Start Fundraiser</Button>
                            </Link>
                        </div>
                    )}

                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="w-6 h-6" />
                    </Button>
                </div>
            </div>
        </nav>
    );
}
