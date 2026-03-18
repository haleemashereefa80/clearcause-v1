"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import ComingSoon from "@/components/ComingSoon";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
    return (
        <div className="flex min-h-screen bg-[#F0F2F5]">
            <AdminSidebar />

            <main className="flex-1 lg:p-10 p-6 flex flex-col items-center justify-center">
                <ComingSoon 
                    title="System Reports" 
                    icon={BarChart3}
                    description="Advanced analytics, settlement reports, and donor retention metrics are currently in development to help you track platform performance."
                />
            </main>
        </div>
    );
}
