"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import { FileText, FolderOpen } from "lucide-react";

export default function DocumentsPage() {
    return (
        <div className="flex min-h-screen bg-[#F8F9FD]">
            <Sidebar />
            <main className="flex-grow p-12">
                <header className="mb-12">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Document Vault</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-2 underline decoration-primary/20">All your fundraiser and tax documents</p>
                </header>

                <div className="max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['Tax Receipts', 'Identity Proofs', 'Medical Invoices'].map((doc, i) => (
                        <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group cursor-pointer">
                            <div className="w-12 h-12 bg-gray-50 group-hover:bg-primary/10 text-gray-400 group-hover:text-primary rounded-2xl flex items-center justify-center mb-6 transition-colors">
                                <FileText className="w-6 h-6" />
                            </div>
                            <p className="font-black text-gray-900">{doc}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">0 Files</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
