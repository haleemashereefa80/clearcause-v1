"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Users, Search, Loader2, Ban, CheckCircle2 } from "lucide-react";

export default function AdminUsers() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "admin")) { router.push("/admin/login"); return; }
        if (!user) return;
        fetchUsers();
    }, [user, authLoading, roleFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (roleFilter !== "all") params.set("role", roleFilter);
            if (search) params.set("search", search);
            const res = await api.get(`/admin/users/?${params.toString()}`);
            setUsers(res.data?.results || res.data || []);
        } catch { setUsers([]); }
        setLoading(false);
    };

    useEffect(() => {
        if (!user) return;
        const timeout = setTimeout(fetchUsers, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    const handleSuspend = async (id: string) => {
        try { await api.post(`/admin/users/${id}/suspend/`); fetchUsers(); } catch { }
    };

    const handleActivate = async (id: string) => {
        try { await api.post(`/admin/users/${id}/activate/`); fetchUsers(); } catch { }
    };

    const roles = ["all", "organizer", "donor", "volunteer", "ngo", "admin"];

    const getKYCBadge = (status: string) => {
        if (status === "verified") return "bg-emerald-100 text-emerald-700";
        if (status === "pending") return "bg-amber-100 text-amber-700";
        if (status === "rejected") return "bg-red-100 text-red-700";
        return "bg-gray-100 text-gray-500";
    };

    return (
        <div className="flex min-h-screen bg-[#F0F2F5]">
            <AdminSidebar />
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">User Management</h1>
                        <p className="text-sm text-gray-400 font-medium mt-1">{users.length} users found</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 w-full md:w-80">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Search by name, email, mobile..." value={search} onChange={(e) => setSearch(e.target.value)} className="text-sm font-medium outline-none bg-transparent w-full" />
                    </div>
                </header>

                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {roles.map((r) => (
                        <button key={r} onClick={() => setRoleFilter(r)} className={`px-4 py-2 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all ${roleFilter === r ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-white text-gray-500 border border-gray-200 hover:border-red-200"}`}>
                            {r}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto" /></div>
                    ) : users.length === 0 ? (
                        <div className="py-20 text-center text-gray-400 font-medium">No users found.</div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {users.map((u: any) => (
                                <div key={u.id} className="p-5 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                                            <Users className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{u.full_name}</p>
                                            <p className="text-xs text-gray-400">{u.email} {u.mobile && `• ${u.mobile}`}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-700">{u.role}</span>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${getKYCBadge(u.kyc_status)}`}>{u.kyc_status}</span>
                                        {u.is_active !== false ? (
                                            <Button onClick={() => handleSuspend(u.id)} variant="outline" className="text-red-600 border-red-200 rounded-lg h-8 px-3 text-xs font-bold">
                                                <Ban className="w-3 h-3 mr-1" /> Suspend
                                            </Button>
                                        ) : (
                                            <Button onClick={() => handleActivate(u.id)} className="bg-emerald-600 text-white rounded-lg h-8 px-3 text-xs font-bold">
                                                <CheckCircle2 className="w-3 h-3 mr-1" /> Activate
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
