"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import api from "@/lib/api";
import {
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Building2,
    ShieldCheck,
    Receipt,
    Send,
    Loader2,
    Plus,
    FileText,
    AlertCircle,
    User,
    Users,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WithdrawalWizard() {
    const { id } = useParams();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [campaign, setCampaign] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);

    // Form States
    const [bankForm, setBankForm] = useState({
        account_holder_name: '',
        account_number: '',
        ifsc_code: '',
        account_type: 'savings',
    });
    const [kycDocs, setKycDocs] = useState<any[]>([]);
    const [bankProof, setBankProof] = useState<File | null>(null);
    const [utilizationBills, setUtilizationBills] = useState<File[]>([]);
    const [selectedBank, setSelectedBank] = useState("");
    const [withdrawalAmount, setWithdrawalAmount] = useState("");
    const [transferOption, setTransferOption] = useState("bank");
    const [isCreatingBank, setIsCreatingBank] = useState(false);
    const [transactionId, setTransactionId] = useState("");
    const [destinationDetails, setDestinationDetails] = useState({
        account_name: '',
        account_number: '',
        ifsc: '',
        bank_name: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [campRes, bankRes, userRes, kycRes] = await Promise.all([
                    api.get(`/campaigns/${id}/`),
                    api.get('/bank-accounts/'),
                    api.get('/auth/me/'),
                    api.get('/kyc/status/')
                ]);
                setCampaign(campRes.data);
                setBankAccounts(bankRes.data.results || bankRes.data);
                setUser(userRes.data);
                setKycDocs(Array.isArray(kycRes.data) ? kycRes.data : [kycRes.data]);
            } catch (err) {
                console.error("Failed to fetch data for withdrawal", err);
            }
            setLoading(false);
        };
        if (id) fetchData();
    }, [id]);

    const handleCreateBank = async () => {
        if (!bankProof) {
            alert("Please upload bank proof (cheque/passbook).");
            return;
        }
        try {
            const data = new FormData();
            data.append('account_holder_name', bankForm.account_holder_name);
            data.append('account_number', bankForm.account_number);
            data.append('ifsc_code', bankForm.ifsc_code);
            data.append('account_type', bankForm.account_type);
            data.append('bank_proof', bankProof);

            const res = await api.post('/bank-accounts/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setBankAccounts([...bankAccounts, res.data]);
            setSelectedBank(res.data.id);
            setIsCreatingBank(false);
            setBankProof(null);
        } catch (err) {
            alert("Failed to add bank account.");
        }
    };

    const handleWithdrawalSubmit = async () => {
        setLoading(true);
        try {
            // Sequential: 1. Create Withdrawal, 2. Upload Documents
            const res = await api.post('/withdrawals/', {
                campaign: campaign.id,
                bank_account: selectedBank,
                amount: withdrawalAmount,
                transfer_option: transferOption,
                destination_account_name: transferOption !== 'bank' ? destinationDetails.account_name : '',
                destination_account_number: transferOption !== 'bank' ? destinationDetails.account_number : '',
                destination_ifsc: transferOption !== 'bank' ? destinationDetails.ifsc : '',
                destination_bank_name: transferOption !== 'bank' ? destinationDetails.bank_name : '',
            });

            const withdrawalId = res.data.id;
            setTransactionId(withdrawalId.slice(0, 8).toUpperCase());

            // Upload bills if any
            for (const bill of utilizationBills) {
                const docData = new FormData();
                docData.append('withdrawal', withdrawalId);
                docData.append('document_type', 'utilization_bill');
                docData.append('document', bill);
                await api.post('/withdrawal-documents/', docData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            setStep(5); // Success step
        } catch (err: any) {
            console.error("Withdrawal failed", err);
            alert(err.response?.data?.detail || "Failed to submit withdrawal request.");
        }
        setLoading(false);
    };

    if (loading && step !== 5) return (
        <div className="flex min-h-screen bg-[#F8F9FD]">
            <Sidebar />
            <main className="flex-grow flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </main>
        </div>
    );

    const steps = [
        { title: "Bank Account", icon: Building2 },
        { title: "KYC Check", icon: ShieldCheck },
        { title: "Bills & Proof", icon: Receipt },
        { title: "Request", icon: Send },
    ];

    return (
        <div className="flex min-h-screen bg-[#F8F9FD]">
            <Sidebar />

            <main className="flex-grow p-6 lg:p-12 overflow-y-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic mb-8">Funds Withdrawal</h1>

                    {/* Stepper */}
                    <div className="flex items-center justify-between max-w-4xl mx-auto mb-12 relative">
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
                        {steps.map((s, i) => (
                            <div key={i} className="relative z-10 flex flex-col items-center gap-3">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border-4 border-[#F8F9FD] ${step > i + 1 ? "bg-green-500 text-white shadow-lg shadow-green-200" :
                                    step === i + 1 ? "bg-primary text-white shadow-xl shadow-primary/20 scale-110" :
                                        "bg-white text-gray-300 border-gray-100"
                                    }`}>
                                    {step > i + 1 ? <CheckCircle2 className="w-6 h-6" /> : <s.icon className="w-6 h-6" />}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${step === i + 1 ? "text-primary" : "text-gray-400"}`}>
                                    {s.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </header>

                <div className="max-w-3xl mx-auto bg-white rounded-[3rem] border border-gray-100 shadow-sm p-12 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {step === 1 && (
                        <div className="space-y-8">
                            <div className="flex justify-between items-center">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight italic">Beneficiary Bank</h2>
                                    <p className="text-gray-400 font-medium">Where should we send the funds?</p>
                                </div>
                                {!isCreatingBank && (
                                    <Button onClick={() => setIsCreatingBank(true)} variant="outline" className="rounded-xl border-primary/20 text-primary font-black">
                                        <Plus className="w-4 h-4 mr-2" /> Add New
                                    </Button>
                                )}
                            </div>

                            {isCreatingBank ? (
                                <div className="bg-gray-50/50 p-10 rounded-[2.5rem] border border-gray-100 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Holder Name</label>
                                            <input className="w-full h-14 rounded-2xl border border-gray-100 bg-white px-6 font-bold" value={bankForm.account_holder_name} onChange={e => setBankForm({ ...bankForm, account_holder_name: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">IFSC Code</label>
                                            <input className="w-full h-14 rounded-2xl border border-gray-100 bg-white px-6 font-bold" value={bankForm.ifsc_code} onChange={e => setBankForm({ ...bankForm, ifsc_code: e.target.value })} />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Account Number</label>
                                            <input className="w-full h-14 rounded-2xl border border-gray-100 bg-white px-6 font-bold" value={bankForm.account_number} onChange={e => setBankForm({ ...bankForm, account_number: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Account Type</label>
                                            <select className="w-full h-14 rounded-2xl border border-gray-100 bg-white px-6 font-bold" value={bankForm.account_type} onChange={e => setBankForm({ ...bankForm, account_type: e.target.value })}>
                                                <option value="savings">Savings</option>
                                                <option value="current">Current</option>
                                                <option value="hospital">Hospital</option>
                                                <option value="ngo">NGO</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Bank Proof</label>
                                            <div
                                                onClick={() => document.getElementById('bank-proof-input')?.click()}
                                                className={`h-14 rounded-2xl border-2 border-dashed flex items-center justify-center font-bold text-[8px] uppercase tracking-widest px-4 text-center cursor-pointer transition-all ${bankProof ? "border-green-200 bg-green-50 text-green-600" : "border-gray-200 bg-white text-gray-300 hover:border-primary/40 hover:text-primary"
                                                    }`}
                                            >
                                                <input
                                                    id="bank-proof-input"
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*,application/pdf"
                                                    onChange={(e) => e.target.files?.[0] && setBankProof(e.target.files[0])}
                                                />
                                                {bankProof ? bankProof.name : "Upload Cheque / Passbook"}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <Button onClick={handleCreateBank} className="flex-grow h-14 rounded-2xl font-black">Save Account</Button>
                                        <Button onClick={() => setIsCreatingBank(false)} variant="ghost" className="h-14 rounded-2xl font-black text-gray-400">Cancel</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {bankAccounts.map(acc => (
                                        <label key={acc.id} className={`p-8 rounded-[2rem] border-2 transition-all cursor-pointer flex items-center justify-between group ${selectedBank === acc.id ? "border-primary bg-primary/[0.02]" : "border-gray-50 hover:border-primary/20"
                                            }`}>
                                            <div className="flex items-center gap-6">
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedBank === acc.id ? "border-primary" : "border-gray-200"
                                                    }`}>
                                                    {selectedBank === acc.id && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                                                </div>
                                                <input type="radio" name="bank" className="hidden" onChange={() => setSelectedBank(acc.id)} checked={selectedBank === acc.id} />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-black text-gray-900 text-lg leading-tight uppercase tracking-tight">{acc.account_holder_name}</p>
                                                        {acc.is_verified ? (
                                                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" title="Verified" />
                                                        ) : (
                                                            <div className="h-2 w-2 rounded-full bg-orange-500" title="Pending Verification" />
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">{acc.account_number.replace(/.(?=.{4})/g, '•')} | {acc.ifsc_code}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="px-3 py-1 bg-gray-50 text-[8px] font-black uppercase tracking-widest rounded-lg text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">{acc.account_type}</span>
                                                <span className={`text-[8px] font-bold uppercase tracking-widest ${acc.is_verified ? 'text-green-500' : 'text-orange-400'}`}>
                                                    {acc.is_verified ? 'Verified' : 'Verification Pending'}
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-10">
                            <div className="space-y-3">
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight italic">Identity Verification</h2>
                                <p className="text-gray-400 font-medium text-sm">Verification of the beneficiary's identity is mandatory for fund security.</p>
                            </div>

                            <div className="space-y-4">
                                {(() => {
                                    const isVerified = kycDocs.some(d => d.status === 'approved');
                                    const isPending = kycDocs.some(d => d.status === 'pending');
                                    const isRejected = kycDocs.some(d => d.status === 'rejected');

                                    return (
                                        <div className={`flex items-center justify-between p-8 rounded-[2.5rem] border-2 transition-all ${isVerified ? 'bg-green-50/30 border-green-100' : 'bg-gray-50/50 border-gray-100'}`}>
                                            <div className="flex items-center gap-6">
                                                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all ${isVerified ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-gray-200 text-gray-400'}`}>
                                                    <ShieldCheck className="w-8 h-8" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 uppercase tracking-tight text-lg italic">Verification Status</p>
                                                    <p className={`text-[10px] font-black uppercase tracking-widest ${isVerified ? 'text-green-600' : isPending ? 'text-orange-500' : 'text-gray-400'}`}>
                                                        {isVerified ? 'Approved & Ready' : isPending ? 'Under Review' : isRejected ? 'Verification Failed' : 'Action Required'}
                                                    </p>
                                                </div>
                                            </div>
                                            {isVerified ? (
                                                <div className="flex items-center gap-2 text-green-500 bg-green-50 px-4 py-2 rounded-xl border border-green-100">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => router.push('/dashboard/kyc')}
                                                    className="h-12 px-8 rounded-2xl font-black text-xs uppercase tracking-widest border-primary/20 text-primary hover:bg-primary hover:text-white shadow-lg shadow-primary/5 transition-all active:scale-95"
                                                >
                                                    {kycDocs.length > 0 ? 'Check Status' : 'Upload Documents'}
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>

                            {!kycDocs.some(d => d.status === 'approved') && (
                                <div className="bg-amber-50 p-8 rounded-[2rem] border-2 border-amber-100/50 flex items-start gap-6">
                                    <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                                    <div className="space-y-2">
                                        <p className="text-xs font-black text-amber-900 uppercase tracking-tight italic">Withdrawal Restricted</p>
                                        <p className="text-[10px] font-bold text-amber-800/70 uppercase tracking-tight leading-relaxed">
                                            Funds can only be released after identity verification (KYC) is approved by our audit team. Please ensure a valid government ID is uploaded.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-10">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight italic">Submit Utilization Bills</h2>
                                <p className="text-gray-400 font-medium">Upload medical invoices to justify fund usage.</p>
                            </div>

                            <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10 flex items-start gap-4">
                                <AlertCircle className="w-6 h-6 text-primary shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-primary uppercase tracking-tight">Documentation Requirement</p>
                                    <p className="text-xs font-medium text-primary/70">Please upload all relevant hospital bills, pharmacy receipts, or treatment estimates (not older than 6 months).</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div
                                    onClick={() => document.getElementById('bill-upload')?.click()}
                                    className="h-44 rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300 hover:text-primary hover:border-primary/20 hover:bg-primary/[0.01] transition-all cursor-pointer group relative overflow-hidden"
                                >
                                    <input
                                        id="bill-upload"
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                setUtilizationBills([...utilizationBills, ...Array.from(e.target.files)]);
                                            }
                                        }}
                                    />
                                    <Plus className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Upload Invoices / Receipts</span>
                                </div>

                                {utilizationBills.length > 0 && (
                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        {utilizationBills.map((bill, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <FileText className="w-4 h-4 text-primary shrink-0" />
                                                    <span className="text-[10px] font-bold text-gray-500 truncate">{bill.name}</span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-500"
                                                    onClick={() => setUtilizationBills(utilizationBills.filter((_, i) => i !== idx))}
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-10">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight italic">Final Request</h2>
                                <p className="text-gray-400 font-medium">Specify transfer amount and destination.</p>
                            </div>

                            <div className="bg-gray-50 rounded-[3rem] p-10 space-y-8">
                                <div className="flex justify-between items-center pb-8 border-b border-gray-200/50">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Campaign Balance</span>
                                    <span className="text-4xl font-black text-gray-900 italic tracking-tighter">₹{parseFloat(campaign?.raised_amount).toLocaleString()}</span>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Transfer Destination</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { id: 'bank', label: 'Beneficiary Bank' },
                                                { id: 'hospital', label: 'Direct Hospital' },
                                                { id: 'ngo', label: 'NGO Account' },
                                                { id: 'vendor', label: 'Pharmacy/Vendor' }
                                            ].map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setTransferOption(opt.id)}
                                                    className={`h-14 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${transferOption === opt.id ? "border-primary bg-primary text-white shadow-lg shadow-primary/20" : "border-gray-100 text-gray-400 hover:border-primary/30"
                                                        }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Withdrawal Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-gray-300 italic">₹</span>
                                            <input
                                                type="number"
                                                className="w-full h-20 rounded-[2rem] border border-gray-200 px-12 text-3xl font-black text-primary focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                                                value={withdrawalAmount}
                                                onChange={(e) => setWithdrawalAmount(e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">A flat 2% processing fee may apply</p>
                                    </div>

                                    {transferOption !== 'bank' && (
                                        <div className="pt-8 border-t border-gray-200/50 space-y-6 animate-in slide-in-from-top-4 duration-500">
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">Destination Bank Details</h4>
                                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Enter the bank details for the {transferOption}</p>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Account Holder Name</label>
                                                    <input 
                                                        className="w-full h-12 rounded-xl border border-gray-100 bg-white px-5 font-bold text-sm" 
                                                        placeholder="e.g. Apollo Hospital"
                                                        value={destinationDetails.account_name}
                                                        onChange={e => setDestinationDetails({...destinationDetails, account_name: e.target.value})}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">IFSC Code</label>
                                                    <input 
                                                        className="w-full h-12 rounded-xl border border-gray-100 bg-white px-5 font-bold text-sm uppercase" 
                                                        placeholder="HDFC0001234"
                                                        value={destinationDetails.ifsc}
                                                        onChange={e => setDestinationDetails({...destinationDetails, ifsc: e.target.value})}
                                                    />
                                                </div>
                                                <div className="space-y-1.5 md:col-span-2">
                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Account Number</label>
                                                    <input 
                                                        className="w-full h-12 rounded-xl border border-gray-100 bg-white px-5 font-bold text-sm" 
                                                        placeholder="Enter account number"
                                                        value={destinationDetails.account_number}
                                                        onChange={e => setDestinationDetails({...destinationDetails, account_number: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success Page */}
                    {step === 5 && (
                        <div className="text-center space-y-10 py-10 animate-in zoom-in-95 duration-500">
                            <div className="w-32 h-32 bg-green-500 text-white rounded-[3.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-green-100 ring-8 ring-green-50">
                                <CheckCircle2 className="w-16 h-16" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Request Logged</h2>
                                <p className="text-gray-500 font-medium max-w-sm mx-auto text-lg leading-relaxed">
                                    Transfer ID: <span className="font-black text-primary bg-primary/5 px-2 py-0.5 rounded-lg">#{transactionId}</span>
                                </p>
                                <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 max-w-xs mx-auto space-y-2">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expected Processing Time</p>
                                    <p className="text-xl font-black text-gray-900 tracking-tight underline decoration-primary/20 underline-offset-4 decoration-2 italic">24–48 Hours</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-4 pt-6">
                                <Button onClick={() => router.push('/dashboard/withdrawals')} className="rounded-[1.5rem] h-16 px-12 font-black text-xl bg-primary shadow-2xl shadow-primary/30">Track Status</Button>
                                <Button onClick={() => router.push('/dashboard')} variant="ghost" className="font-black text-gray-400 uppercase tracking-widest text-xs">Return Overview</Button>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    {step < 5 && (
                        <div className="flex items-center justify-between pt-12 border-t border-gray-50 bg-white sticky bottom-0 mt-8">
                            <Button
                                variant="ghost"
                                disabled={step === 1}
                                onClick={() => setStep(step - 1)}
                                className="h-12 px-6 rounded-xl font-black text-gray-400 hover:text-primary transition-all flex items-center gap-2"
                            >
                                <ChevronLeft className="w-5 h-5" /> Previous
                            </Button>

                            {step < 4 ? (
                                <Button
                                    onClick={() => setStep(step + 1)}
                                    disabled={
                                        (step === 1 && !selectedBank) ||
                                        (step === 2 && !kycDocs.some(d => d.status === 'approved')) ||
                                        (step === 3 && utilizationBills.length === 0)
                                    }
                                    className="h-14 px-10 rounded-2xl font-black bg-primary text-white shadow-xl shadow-primary/20 flex items-center gap-3 transition-all active:scale-95"
                                >
                                    Continue <ChevronRight className="w-5 h-5" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleWithdrawalSubmit}
                                    disabled={
                                        !withdrawalAmount || 
                                        parseFloat(withdrawalAmount) <= 0 ||
                                        (transferOption !== 'bank' && (!destinationDetails.account_name || !destinationDetails.account_number || !destinationDetails.ifsc))
                                    }
                                    className="h-14 px-12 rounded-2xl font-black bg-primary text-white shadow-xl shadow-primary/20 flex items-center gap-3 transition-all active:scale-95"
                                >
                                    Confirm Transfer <Send className="w-5 h-5" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                <div className="max-w-3xl mx-auto flex items-center justify-center gap-6 mt-12 pb-12 grayscale opacity-40">
                    <div className="h-px bg-gray-200 flex-grow" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Secure Audit Protocol v2.4</span>
                    <div className="h-px bg-gray-200 flex-grow" />
                </div>
            </main>
        </div>
    );
}
