"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import api from "@/lib/api";
import {
    ShieldCheck,
    User,
    Users,
    FileUp,
    CheckCircle2,
    Clock,
    AlertCircle,
    Loader2,
    Plus,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function KYCManagement() {
    const [kycs, setKycs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        target: 'beneficiary',
        document_type: 'aadhaar',
        document_number: '',
    });
    const [files, setFiles] = useState<{ front: File | null, back: File | null }>({
        front: null,
        back: null
    });

    useEffect(() => {
        fetchKYC();
    }, []);

    const fetchKYC = async () => {
        try {
            const res = await api.get('/kyc/status/');
            // Backend now returns an array of documents
            setKycs(Array.isArray(res.data) ? res.data : (res.data.status === 'not_submitted' ? [] : [res.data]));
        } catch (err) {
            console.error("Failed to fetch KYC", err);
        }
        setLoading(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
        if (e.target.files && e.target.files[0]) {
            setFiles(prev => ({ ...prev, [side]: e.target.files![0] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!files.front) {
            alert("Please upload at least the front side of the document.");
            return;
        }

        setIsUploading(true);
        try {
            const data = new FormData();
            data.append('target', formData.target);
            data.append('document_type', formData.document_type);
            data.append('document_number', formData.document_number);
            data.append('document_front', files.front);
            if (files.back) {
                data.append('document_back', files.back);
            }

            await api.post('kyc-documents/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchKYC();
            setFiles({ front: null, back: null });
            alert("KYC Submitted successfully!");
        } catch (err) {
            console.error("KYC Submission failed", err);
            alert("Submission failed. Please check your details.");
        }
        setIsUploading(false);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle2 className="w-6 h-6 text-green-500" />;
            case 'rejected': return <X className="w-6 h-6 text-red-500" />;
            default: return <Clock className="w-6 h-6 text-orange-500" />;
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F8F9FD]">
            <Sidebar />

            <main className="flex-grow p-6 lg:p-12 overflow-y-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic mb-2">Trust & Verification</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs underline decoration-primary/20 underline-offset-4">
                        Manage Identity Verification for Withdrawals
                    </p>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                    {/* Status List */}
                    <div className="xl:col-span-2 space-y-8">
                        {kycs.length > 0 ? (
                            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-10 border-b border-gray-50 bg-gray-50/30">
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Verification History</h3>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {kycs.map((kyc) => (
                                        <div key={kyc.id} className="p-10 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center">
                                                    {kyc.target === 'organizer' ? <User className="w-7 h-7" /> : <Users className="w-7 h-7" />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 uppercase tracking-tight">
                                                        {kyc.document_type.replace('_', ' ')}
                                                    </p>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        Number: {kyc.document_number || 'Pending'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${kyc.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                                                        kyc.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                            'bg-orange-50 text-orange-700 border-orange-100'
                                                        }`}>
                                                        {kyc.status}
                                                    </span>
                                                </div>
                                                {getStatusIcon(kyc.status)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[3rem] border-2 border-dashed border-gray-100 p-20 text-center space-y-6">
                                <ShieldCheck className="w-20 h-20 text-gray-100 mx-auto" />
                                <div className="space-y-2">
                                    <p className="text-xl font-black text-gray-900 tracking-tight">No Documents Submitted</p>
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Complete your KYC to unlock full withdrawal capabilities.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Upload Form */}
                    <div className="space-y-8">
                        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-primary/5 space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <FileUp className="w-32 h-32" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight relative z-10 italic">Upload Document</h3>

                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Target Person</label>
                                    <select
                                        className="w-full h-14 rounded-2xl border border-gray-100 bg-gray-50/30 px-6 font-bold text-gray-700 appearance-none focus:ring-2 focus:ring-primary/20"
                                        value={formData.target}
                                        onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                                    >
                                        <option value="beneficiary">Beneficiary</option>
                                        <option value="organizer">Organizer</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Document Type</label>
                                    <select
                                        className="w-full h-14 rounded-2xl border border-gray-100 bg-gray-50/30 px-6 font-bold text-gray-700 appearance-none focus:ring-2 focus:ring-primary/20"
                                        value={formData.document_type}
                                        onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                                    >
                                        <option value="aadhaar">Aadhaar Card</option>
                                        <option value="pan">PAN Card</option>
                                        <option value="voter_id">Voter ID</option>
                                        <option value="passport">Passport</option>
                                        <option value="driving_license">Driving License</option>
                                        <option value="relationship_proof">Relationship Proof</option>
                                        <option value="gst_cert">GST Certificate</option>
                                        <option value="80g_cert">80G Certificate</option>
                                        <option value="fcra_cert">FCRA Certificate</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">ID Number</label>
                                    <input
                                        className="w-full h-14 rounded-2xl border border-gray-100 bg-gray-50/30 px-6 font-bold text-gray-700 focus:ring-2 focus:ring-primary/20"
                                        placeholder="Enter number (if applicable)"
                                        value={formData.document_number}
                                        onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div
                                        onClick={() => document.getElementById('front-input')?.click()}
                                        className={`h-32 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer group p-4 text-center overflow-hidden relative ${files.front ? "border-green-200 bg-green-50/30 text-green-600" : "border-gray-100 bg-white text-gray-300 hover:text-primary hover:border-primary/20 hover:bg-primary/[0.01]"
                                            }`}
                                    >
                                        <input
                                            id="front-input"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'front')}
                                        />
                                        {files.front ? (
                                            <div className="space-y-1">
                                                <CheckCircle2 className="w-6 h-6 mx-auto" />
                                                <span className="text-[8px] font-black uppercase tracking-widest block truncate max-w-full italic">{files.front.name}</span>
                                            </div>
                                        ) : (
                                            <>
                                                <Plus className="w-6 h-6 mb-2" />
                                                <span className="text-[8px] font-black uppercase tracking-widest">Front Side</span>
                                            </>
                                        )}
                                    </div>

                                    <div
                                        onClick={() => document.getElementById('back-input')?.click()}
                                        className={`h-32 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer group p-4 text-center overflow-hidden relative ${files.back ? "border-green-200 bg-green-50/30 text-green-600" : "border-gray-100 bg-white text-gray-300 hover:text-primary hover:border-primary/20 hover:bg-primary/[0.01]"
                                            }`}
                                    >
                                        <input
                                            id="back-input"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'back')}
                                        />
                                        {files.back ? (
                                            <div className="space-y-1">
                                                <CheckCircle2 className="w-6 h-6 mx-auto" />
                                                <span className="text-[8px] font-black uppercase tracking-widest block truncate max-w-full italic">{files.back.name}</span>
                                            </div>
                                        ) : (
                                            <>
                                                <Plus className="w-6 h-6 mb-2" />
                                                <span className="text-[8px] font-black uppercase tracking-widest">Back Side</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-14 rounded-2xl font-black text-lg bg-primary text-white shadow-xl shadow-primary/20"
                                    disabled={isUploading}
                                >
                                    {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Submit for Verification"}
                                </Button>
                            </form>
                        </div>

                        <div className="bg-amber-50 rounded-[2.5rem] border border-amber-100 p-8 space-y-4">
                            <div className="flex items-center gap-3 text-amber-600">
                                <AlertCircle className="w-6 h-6" />
                                <h4 className="font-black uppercase tracking-widest text-xs">KYC Requirements</h4>
                            </div>
                            <ul className="space-y-2 text-[10px] font-bold text-amber-800/70 uppercase tracking-wider leading-relaxed">
                                <li>• Valid Government ID is mandatory</li>
                                <li>• Aadhaar, PAN, Voter ID, or Passport</li>
                                <li>• Image specs: Clear, readable, Max 5MB</li>
                                <li>• Verification takes 24-48 hours</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
