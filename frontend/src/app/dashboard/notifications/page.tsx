"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import { Bell, CheckCircle2 } from "lucide-react";

export default function NotificationsPage() {
    return (
        <div className="flex min-h-screen bg-[#F8F9FD]">
            <Sidebar />
            <main className="flex-grow p-12">
                <header className="mb-12">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Notifications</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-2 underline decoration-primary/20">Stay updated with your impact</p>
                </header>

                <div className="max-w-4xl space-y-4">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                            <Bell className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-black text-gray-900">Welcome to your new Unified Dashboard!</p>
                            <p className="text-sm text-gray-500 font-medium">You can now manage both your donations and fundraisers from this single account.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
