"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import { Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
    return (
        <div className="flex min-h-screen bg-[#F8F9FD]">
            <Sidebar />
            <main className="flex-grow p-12">
                <header className="mb-12">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Profile Settings</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-2 underline decoration-primary/20">Manage your unified ClearCause account</p>
                </header>

                <div className="max-w-2xl bg-white p-12 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary">
                            <User className="w-12 h-12" />
                        </div>
                        <Button variant="outline" className="rounded-xl border-gray-100 font-bold">Change Photo</Button>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Display Name</label>
                                <input placeholder="Full Name" className="w-full h-14 rounded-2xl border border-gray-100 bg-gray-50/20 px-4 focus:outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Mobile</label>
                                <input placeholder="Mobile Number" className="w-full h-14 rounded-2xl border border-gray-100 bg-gray-50/20 px-4 focus:outline-none" />
                            </div>
                        </div>
                        <Button className="rounded-2xl h-14 w-full font-black text-lg">Save Settings</Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
