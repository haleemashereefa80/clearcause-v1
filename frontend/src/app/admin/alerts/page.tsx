"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import ComingSoon from "@/components/ComingSoon";
import { Bell } from "lucide-react";

export default function AlertsPage() {
    return (
        <div className="flex min-h-screen bg-[#F0F2F5]">
            <AdminSidebar />

            <main className="flex-1 lg:p-10 p-6 flex flex-col items-center justify-center">
                <ComingSoon 
                    title="Platform Alerts" 
                    icon={Bell}
                    description="Automated system alerts, fraud detection notifications, and high-priority campaign flags are being integrated into this centralized hub."
                />
            </main>
        </div>
    );
}
