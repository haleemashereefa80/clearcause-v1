"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import api from "@/lib/api";
import {
    ArrowLeft,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Building2,
    Receipt,
    ExternalLink,
    FileText,
    Loader2,
    ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WithdrawalDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [withdrawal, setWithdrawal] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWithdrawal = async () => {
            try {
                const res = await api.get(`/withdrawals/${id}/`);
                setWithdrawal(res.data);
            } catch (err) {
                console.error("Failed to fetch withdrawal details", err);
            }
            setLoading(false);
        };
        if (id) fetchWithdrawal();
    }, [id]);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-50 text-green-700 border-green-100';
            case 'approved': return 'bg-green-50 text-green-700 border-green-100';
            case 'rejected': return 'bg-red-50 text-red-700 border-red-100';
            case 'transfer_initiated': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'under_review': return 'bg-orange-50 text-orange-700 border-orange-100';
            case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="w-8 h-8 text-green-500" />;
            case 'rejected': return <XCircle className="w-8 h-8 text-red-500" />;
            default: return <Clock className="w-8 h-8 text-primary" />;
        }
    };

    if (loading) return (
        <div className="flex min-h-screen bg-[#F8F9FD]">
            <Sidebar />
            <main className="flex-grow flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </main>
        </div>
    );

    if (!withdrawal) return (
        <div className="flex min-h-screen bg-[#F8F9FD]">
            <Sidebar />
            <main className="flex-grow flex flex-col items-center justify-center space-y-4">
                <AlertCircle className="w-12 h-12 text-red-400" />
                <p className="font-black text-gray-900 uppercase">Withdrawal request not found</p>
                <Button onClick={() => router.push('/dashboard/withdrawals')} variant="ghost">Back to Withdrawals</Button>
            </main>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#F8F9FD]">
            <Sidebar />

            <main className="flex-grow p-6 lg:p-12 overflow-y-auto">
                <header className="mb-12">
                    <Button 
                        variant="ghost" 
                        onClick={() => router.push('/dashboard/withdrawals')}
                        className="mb-6 hover:bg-white rounded-xl font-bold text-gray-500 gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Status
                    </Button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Request Details</h1>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Reference ID: #{withdrawal.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <div className={`px-6 py-3 rounded-2xl border-2 flex items-center gap-4 ${getStatusStyle(withdrawal.status)}`}>
                            {getStatusIcon(withdrawal.status)}
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Status</span>
                                <span className="text-xl font-black uppercase tracking-tight">{withdrawal.status.replace('_', ' ')}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Core Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Highlights Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm flex flex-col justify-between h-48">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Withdrawal Amount</span>
                                <p className="text-5xl font-black text-gray-900 italic tracking-tighter">₹{parseFloat(withdrawal.amount).toLocaleString()}</p>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Inclusive of 2% audit fee</span>
                            </div>
                            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm flex flex-col justify-between h-48">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Campaign</span>
                                <p className="text-xl font-black text-gray-900 uppercase tracking-tight line-clamp-2">{withdrawal.campaign_title}</p>
                                <span className="text-[9px] font-bold text-primary uppercase tracking-widest underline decoration-2 underline-offset-4">View Campaign Analytics</span>
                            </div>
                        </div>

                        {/* Destination Details */}
                        <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm space-y-8">
                            <div className="flex items-center gap-4 pb-6 border-b border-gray-50">
                                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Transfer Destination</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account where funds will be credited</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {withdrawal.transfer_option === 'bank' ? (
                                    <>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Account Holder</p>
                                            <p className="font-black text-gray-900 uppercase tracking-tight text-lg">{withdrawal.bank_account_details?.account_holder_name}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Bank Details</p>
                                            <p className="font-bold text-gray-600">{withdrawal.bank_account_details?.account_number.replace(/.(?=.{4})/g, '•')}</p>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">IFSC: {withdrawal.bank_account_details?.ifsc_code}</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Destination Type</p>
                                            <p className="font-black text-primary uppercase tracking-tight text-lg italic">{withdrawal.transfer_option}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Account Name</p>
                                            <p className="font-black text-gray-900 uppercase tracking-tight text-lg">{withdrawal.destination_account_name || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Account Number</p>
                                            <p className="font-bold text-gray-600">{withdrawal.destination_account_number || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">IFSC Code</p>
                                            <p className="font-bold text-gray-600 uppercase">{withdrawal.destination_ifsc || 'N/A'}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {withdrawal.rejection_reason && (
                            <div className="bg-red-50 p-10 rounded-[3rem] border border-red-100 space-y-4">
                                <div className="flex items-center gap-3 text-red-600">
                                    <AlertCircle className="w-6 h-6" />
                                    <h3 className="font-black uppercase tracking-widest text-xs">Rejection Notice</h3>
                                </div>
                                <p className="font-bold text-red-900 leading-relaxed italic">"{withdrawal.rejection_reason}"</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Timeline & Docs */}
                    <div className="space-y-8">
                        {/* Timeline */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Audit Timeline</h3>
                            <div className="space-y-6 relative">
                                <div className="absolute left-[11px] top-6 bottom-6 w-px bg-gray-100" />
                                
                                <div className="flex gap-4 relative">
                                    <div className="w-6 h-6 rounded-full bg-green-500 border-4 border-white shadow-sm shrink-0 z-10 flex items-center justify-center">
                                        <CheckCircle2 className="w-3 h-3 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-900">Requested</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{new Date(withdrawal.requested_at).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 relative">
                                    <div className={`w-6 h-6 rounded-full border-4 border-white shadow-sm shrink-0 z-10 flex items-center justify-center ${
                                        withdrawal.status !== 'pending' ? 'bg-green-500' : 'bg-gray-100'
                                    }`}>
                                        {withdrawal.status !== 'pending' && <CheckCircle2 className="w-3 h-3 text-white" />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-900">Platform Audit</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                            {withdrawal.processed_at ? new Date(withdrawal.processed_at).toLocaleString() : 'In Progress'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 relative">
                                    <div className={`w-6 h-6 rounded-full border-4 border-white shadow-sm shrink-0 z-10 flex items-center justify-center ${
                                        withdrawal.status === 'completed' ? 'bg-green-500' : 'bg-gray-100'
                                    }`}>
                                        {withdrawal.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-white" />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-900">Funds Released</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                            {withdrawal.status === 'completed' ? 'Transaction Completed' : 'Pending Verification'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Documents */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Uploaded Proofs</h3>
                            {withdrawal.documents?.length > 0 ? (
                                <div className="space-y-3">
                                    {withdrawal.documents.map((doc: any) => (
                                        <a 
                                            key={doc.id} 
                                            href={doc.document} 
                                            target="_blank" 
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary/20 hover:bg-primary/[0.02] transition-all group"
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-8 h-8 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-tight text-gray-500 truncate">bill_proof.pdf</span>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-primary" />
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                                    <Receipt className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No Bills Attached</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
