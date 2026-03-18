"use client";

import { LucideIcon, Rocket } from "lucide-react";

interface ComingSoonProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
}

export default function ComingSoon({ 
    title, 
    description = "We're currently building this module to give you more control and insights. Stay tuned for updates!",
    icon: Icon = Rocket 
}: ComingSoonProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in zoom-in-95 duration-700">
            <div className="relative mb-8">
                <div className="w-24 h-24 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center relative z-10">
                    <Icon className="w-10 h-10 text-red-500" />
                </div>
                {/* Decorative background elements */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-rose-500/5 rounded-full blur-xl" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-red-500/10 rounded-full blur-2xl" />
            </div>
            
            <div className="max-w-md space-y-4">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">
                    {title} <span className="text-red-500">Coming Soon</span>
                </h2>
                <p className="text-slate-500 font-medium leading-relaxed">
                    {description}
                </p>
                
                <div className="pt-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            In Development
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
