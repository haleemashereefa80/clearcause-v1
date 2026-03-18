"use client";

import VolunteerSidebar from "@/components/volunteer/VolunteerSidebar";
import ComingSoon from "@/components/ComingSoon";
import { User } from "lucide-react";

export default function ProfilePage() {
    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <VolunteerSidebar />

            <main className="flex-1 lg:p-10 p-6 flex flex-col items-center justify-center">
                <ComingSoon 
                    title="Agent Profile" 
                    icon={User}
                    description="We're currently building the profile management system. Soon you'll be able to manage your field credentials, regions, and performance stats here."
                />
            </main>
        </div>
    );
}
