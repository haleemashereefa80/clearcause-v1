"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import ComingSoon from "@/components/ComingSoon";
import { FileText } from "lucide-react";

export default function ContentPage() {
    return (
        <div className="flex min-h-screen bg-[#F0F2F5]">
            <AdminSidebar />

            <main className="flex-1 lg:p-10 p-6 flex flex-col items-center justify-center">
                <ComingSoon 
                    title="Content Management" 
                    icon={FileText}
                    description="Our team is finalizing the CMS tools to allow you to edit platform copy, manage banners, and update informational pages directly."
                />
            </main>
        </div>
    );
}
