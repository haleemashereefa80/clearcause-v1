"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { ChevronRight, ChevronLeft, Upload, CheckCircle2, Loader2, X, Plus, Eye, EyeOff } from "lucide-react";

const STEPS = ["Cause", "Basic Details", "Story", "Bank Details", "KYC Details", "Documents", "Preview"];

export default function StartFundraiser() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        category: "medical",
        other_category_reason: "",
        organizer_name: "",
        title: "",
        beneficiary_name: "",
        beneficiary_relationship: "self",
        goal_amount: "",
        description: "",
        // Bank Details
        account_holder_name: "",
        bank_name: "",
        branch_name: "",
        account_number: "",
        confirm_account_number: "",
        ifsc_code: "",
        // KYC Details
        aadhaar_number: "",
        pan_number: "",
    });
    const [showAccountNumber, setShowAccountNumber] = useState(false);
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [bankProof, setBankProof] = useState<File | null>(null);
    const [aadhaarFront, setAadhaarFront] = useState<File | null>(null);
    const [panCard, setPanCard] = useState<File | null>(null);
    const [selfie, setSelfie] = useState<File | null>(null);
    const [extraMedia, setExtraMedia] = useState<{ file: File | null, type: 'image' | 'video' }[]>(
        Array(4).fill(null).map(() => ({ file: null, type: 'image' }))
    );
    const [supportDocs, setSupportDocs] = useState<File[]>([]);

    const router = useRouter();

    const handleNext = () => {
        // Step 0: Cause
        if (currentStep === 0) {
            if (formData.category === "others" && !formData.other_category_reason) {
                alert("Please specify the cause.");
                return;
            }
        }
        // Step 1: Basic Details
        if (currentStep === 1) {
            if (!formData.title || !formData.beneficiary_name || !formData.organizer_name || !formData.goal_amount || !coverImage) {
                alert("Please fill all mandatory basic details and upload a cover image.");
                return;
            }
        }
        // Step 2: Story
        if (currentStep === 2) {
            if (!formData.description) {
                alert("Please write your fundraiser story.");
                return;
            }
        }
        // Step 3: Bank Details
        if (currentStep === 3) {
            if (formData.account_number !== formData.confirm_account_number) {
                alert("Account numbers do not match!");
                return;
            }
            if (!formData.account_holder_name || !formData.bank_name || !formData.branch_name || !formData.account_number || !formData.ifsc_code || !bankProof) {
                alert("Please fill all mandatory bank details and upload passbook.");
                return;
            }
        }
        // Step 4: KYC Details
        if (currentStep === 4) {
            if (!formData.aadhaar_number || !formData.pan_number || !aadhaarFront || !panCard || !selfie) {
                alert("Please fill all mandatory KYC details and upload pictures.");
                return;
            }
        }
        // Step 5: Media & Documents
        if (currentStep === 5) {
            const hasExtraImage = extraMedia.some(m => m.file && m.type === 'image');
            if (!hasExtraImage) {
                alert("At least 2 mandatory images are required. You have uploaded the cover, please upload at least one more image in the gallery.");
                return;
            }
        }
        setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    };

    const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'docs' | 'bank' | 'aadhaar' | 'pan' | 'selfie' | 'gallery', index?: number) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (type === 'cover') setCoverImage(file);
            else if (type === 'bank') setBankProof(file);
            else if (type === 'aadhaar') setAadhaarFront(file);
            else if (type === 'pan') setPanCard(file);
            else if (type === 'selfie') setSelfie(file);
            else if (type === 'gallery' && index !== undefined) {
                const newMedia = [...extraMedia];
                newMedia[index] = { ...newMedia[index], file };
                setExtraMedia(newMedia);
            }
            else if (type === 'docs') setSupportDocs([...supportDocs, ...Array.from(e.target.files)]);
        }
    };

    const handleMediaTypeChange = (index: number, type: 'image' | 'video') => {
        const newMedia = [...extraMedia];
        newMedia[index] = { ...newMedia[index], type };
        setExtraMedia(newMedia);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // 1. Create Campaign
            const campaignData = new FormData();
            campaignData.append('category', formData.category);
            campaignData.append('organizer_name', formData.organizer_name);
            campaignData.append('title', formData.title);
            campaignData.append('beneficiary_name', formData.beneficiary_name);
            campaignData.append('beneficiary_relationship', formData.beneficiary_relationship);
            campaignData.append('goal_amount', formData.goal_amount);
            
            let finalDescription = formData.description;
            if (formData.category === "others" && formData.other_category_reason) {
                finalDescription += `\n\n[Category: ${formData.other_category_reason}]`;
            }
            campaignData.append('description', finalDescription);

            if (formData.category === "others" && formData.other_category_reason) {
                campaignData.append('other_category_reason', formData.other_category_reason);
            }

            if (coverImage) campaignData.append('cover_image', coverImage);

            const res = await api.post('/campaigns/', campaignData);
            const campaignId = res.data.id;

            // 2. Upload Gallery Media
            for (const item of extraMedia) {
                if (item.file) {
                    const mediaData = new FormData();
                    mediaData.append('campaign', campaignId);
                    mediaData.append('file', item.file);
                    mediaData.append('media_type', item.type);
                    await api.post('/campaign-media/', mediaData);
                }
            }

            // 3. Create Bank Account
            const bankData = new FormData();
            bankData.append('campaign', campaignId);
            bankData.append('account_holder_name', formData.account_holder_name);
            bankData.append('bank_name', formData.bank_name);
            bankData.append('branch_name', formData.branch_name);
            bankData.append('account_number', formData.account_number);
            bankData.append('ifsc_code', formData.ifsc_code);
            if (bankProof) bankData.append('bank_proof', bankProof);
            await api.post('/bank-accounts/', bankData);

            // 4. Upload KYC Documents
            const kycDocs = [
                { type: 'aadhaar', number: formData.aadhaar_number, file: aadhaarFront },
                { type: 'pan', number: formData.pan_number, file: panCard },
                { type: 'selfie', number: 'N/A', file: selfie }
            ];

            for (const kyc of kycDocs) {
                if (kyc.file) {
                    const kycData = new FormData();
                    kycData.append('campaign', campaignId);
                    kycData.append('document_type', kyc.type);
                    kycData.append('document_number', kyc.number);
                    kycData.append('document_front', kyc.file);
                    await api.post('/kyc-documents/', kycData);
                }
            }

            // 5. Upload Campaign Support Docs
            for (const doc of supportDocs) {
                const docData = new FormData();
                docData.append('campaign', campaignId);
                docData.append('document', doc);
                docData.append('document_type', 'other');
                docData.append('file_name', doc.name);
                await api.post('/campaign-documents/', docData);
            }

            // 6. Final Submission to change status to pending_review
            await api.post(`/campaigns/${campaignId}/submit/`);

            alert("Fundraiser submitted for review successfully!");
            router.push("/dashboard");
        } catch (err: any) {
            console.error("Failed to create campaign", err);
            const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
            alert(`Failed to create campaign: ${errorMsg}`);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="space-y-12">
                {/* Stepper */}
                <div className="flex justify-between relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary/10 -translate-y-1/2 z-0" />
                    {STEPS.map((step, i) => (
                        <div key={i} className="relative z-10 flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${i <= currentStep ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white border border-primary/10 text-gray-400"
                                }`}>
                                {i < currentStep ? <CheckCircle2 className="w-6 h-6" /> : i + 1}
                            </div>
                            <span className={`text-[10px] uppercase font-bold tracking-widest ${i <= currentStep ? "text-primary" : "text-gray-400"}`}>{step}</span>
                        </div>
                    ))}
                </div>

                <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-primary/10 border border-primary/5 min-h-[500px] flex flex-col justify-between">
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {currentStep === 0 && (
                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold">What are you raising funds for?</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {["Medical", "Education", "Disaster", "Animals", "Community", "Environment", "Others"].map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setFormData({ ...formData, category: cat.toLowerCase() })}
                                            className={`p-6 rounded-2xl border-2 transition-all font-bold ${formData.category === cat.toLowerCase() ? "border-primary bg-primary/5 text-primary" : "border-primary/5 hover:border-primary/20"
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                                {formData.category === "others" && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">What are you raising for? <span className="text-red-500">*</span></label>
                                        <input
                                            className="w-full h-14 rounded-xl border border-primary/10 px-4 focus:ring-2 focus:ring-primary focus:outline-none"
                                            placeholder="Specify the cause"
                                            value={formData.other_category_reason}
                                            onChange={(e) => setFormData({ ...formData, other_category_reason: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold">Beneficiary Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 pl-1">Campaign Title <span className="text-red-500">*</span></label>
                                        <input className="w-full h-14 rounded-xl border border-primary/10 px-4 focus:ring-2 focus:ring-primary focus:outline-none"
                                            placeholder="e.g. Help Arjun's Heart Surgery"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 pl-1">Beneficiary Name <span className="text-red-500">*</span></label>
                                        <input className="w-full h-14 rounded-xl border border-primary/10 px-4 focus:ring-2 focus:ring-primary focus:outline-none"
                                            value={formData.beneficiary_name}
                                            onChange={(e) => setFormData({ ...formData, beneficiary_name: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 pl-1">Organizer Name <span className="text-red-500">*</span></label>
                                        <input className="w-full h-14 rounded-xl border border-primary/10 px-4 focus:ring-2 focus:ring-primary focus:outline-none"
                                            value={formData.organizer_name}
                                            onChange={(e) => setFormData({ ...formData, organizer_name: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Relationship</label>
                                        <select
                                            className="w-full h-14 rounded-xl border border-primary/10 px-4 focus:ring-2 focus:ring-primary focus:outline-none appearance-none"
                                            value={formData.beneficiary_relationship}
                                            onChange={(e) => setFormData({ ...formData, beneficiary_relationship: e.target.value })}
                                        >
                                            <option value="self">Self</option>
                                            <option value="child">Child</option>
                                            <option value="parent">Parent</option>
                                            <option value="spouse">Spouse</option>
                                            <option value="friend">Friend</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 pl-1">Goal Amount (₹) <span className="text-red-500">*</span></label>
                                        <input
                                            className="w-full h-14 rounded-xl border border-primary/10 px-4 focus:ring-2 focus:ring-primary focus:outline-none"
                                            type="number"
                                            value={formData.goal_amount}
                                            onChange={(e) => setFormData({ ...formData, goal_amount: e.target.value })} />
                                    </div>
                                    <div className="space-y-2 col-span-1 md:col-span-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 pl-1">Cover Image <span className="text-red-500">*</span></label>
                                        <div className="flex items-center gap-4">
                                            {coverImage && (
                                                <div className="w-20 h-20 rounded-xl overflow-hidden border border-primary/10 relative group">
                                                    <img src={URL.createObjectURL(coverImage)} alt="Cover" className="w-full h-full object-cover" />
                                                    <button onClick={() => setCoverImage(null)} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                            <label className={`flex-1 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:bg-primary/5 ${coverImage ? 'border-primary/20 bg-primary/5' : 'border-primary/10'}`}>
                                                <Upload className="w-5 h-5 text-primary/40" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Upload Cover Photo</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold">The Story</h2>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 pl-1">Describe the requirement <span className="text-red-500">*</span></label>
                                    <textarea
                                        className="w-full min-h-[200px] rounded-2xl border border-primary/10 p-6 focus:ring-2 focus:ring-primary focus:outline-none leading-relaxed"
                                        placeholder="Tell our donors why this fundraiser is important..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold">Bank Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 pl-1">Account Holder Name<span className="text-red-500">*</span></label>
                                        <input className="w-full h-14 rounded-xl border border-primary/10 px-4 focus:ring-2 focus:ring-primary focus:outline-none"
                                            value={formData.account_holder_name}
                                            onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 pl-1">Bank Name<span className="text-red-500">*</span></label>
                                        <input className="w-full h-14 rounded-xl border border-primary/10 px-4 focus:ring-2 focus:ring-primary focus:outline-none"
                                            value={formData.bank_name}
                                            onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 pl-1">Branch Name<span className="text-red-500">*</span></label>
                                        <input className="w-full h-14 rounded-xl border border-primary/10 px-4 focus:ring-2 focus:ring-primary focus:outline-none"
                                            value={formData.branch_name}
                                            onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 pl-1">IFSC Code<span className="text-red-500">*</span></label>
                                        <input className="w-full h-14 rounded-xl border border-primary/10 px-4 focus:ring-2 focus:ring-primary focus:outline-none"
                                            placeholder="HDFC0000123"
                                            value={formData.ifsc_code}
                                            onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 pl-1">Account Number<span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <input
                                                type={showAccountNumber ? "text" : "password"}
                                                className="w-full h-14 rounded-xl border border-primary/10 px-4 focus:ring-2 focus:ring-primary focus:outline-none pr-12"
                                                value={formData.account_number}
                                                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })} />
                                            <button
                                                type="button"
                                                onClick={() => setShowAccountNumber(!showAccountNumber)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                                            >
                                                {showAccountNumber ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 pl-1">Confirm Account Number<span className="text-red-500">*</span></label>
                                        <input
                                            type="password"
                                            className={`w-full h-14 rounded-xl border px-4 focus:ring-2 focus:outline-none transition-all ${formData.confirm_account_number && formData.account_number !== formData.confirm_account_number ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-primary/10 focus:ring-primary"}`}
                                            value={formData.confirm_account_number}
                                            onChange={(e) => setFormData({ ...formData, confirm_account_number: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 pl-1">First Page of Passbook<span className="text-red-500">*</span></label>
                                    <div
                                        onClick={() => document.getElementById('bank-upload')?.click()}
                                        className={`p-10 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center space-y-4 transition-all cursor-pointer ${bankProof ? "border-green-200 bg-green-50 text-green-600" : "border-primary/10 hover:border-primary/30 text-gray-400"}`}
                                    >
                                        <input
                                            id="bank-upload"
                                            type="file"
                                            className="hidden"
                                            accept="image/*,.pdf"
                                            onChange={(e) => handleFileChange(e, 'bank')}
                                        />
                                        {bankProof ? (
                                            <div className="text-center">
                                                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                                                <p className="font-bold text-sm">{bankProof.name}</p>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="w-12 h-12 text-primary/40" />
                                                <p className="font-bold">Upload Passbook Copy</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="space-y-8">
                                <h2 className="text-3xl font-bold">KYC Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 pl-1">Aadhaar Number<span className="text-red-500">*</span></label>
                                        <input className="w-full h-14 rounded-xl border border-primary/10 px-4 focus:ring-2 focus:ring-primary focus:outline-none"
                                            placeholder="12 digit number"
                                            value={formData.aadhaar_number}
                                            onChange={(e) => setFormData({ ...formData, aadhaar_number: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 pl-1">PAN Card Number<span className="text-red-500">*</span></label>
                                        <input className="w-full h-14 rounded-xl border border-primary/10 px-4 focus:ring-2 focus:ring-primary focus:outline-none"
                                            placeholder="ABCDE1234F"
                                            value={formData.pan_number}
                                            onChange={(e) => setFormData({ ...formData, pan_number: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 pl-1 text-center block">Aadhaar Front<span className="text-red-500">*</span></label>
                                        <div
                                            onClick={() => document.getElementById('aadhaar-upload')?.click()}
                                            className={`aspect-video border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${aadhaarFront ? "border-green-200 bg-green-50 text-green-600" : "border-primary/10 hover:border-primary/30"}`}
                                        >
                                            <input id="aadhaar-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'aadhaar')} />
                                            {aadhaarFront ? <CheckCircle2 className="w-8 h-8" /> : <Upload className="w-8 h-8 text-primary/40" />}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 pl-1 text-center block">PAN Card<span className="text-red-500">*</span></label>
                                        <div
                                            onClick={() => document.getElementById('pan-upload')?.click()}
                                            className={`aspect-video border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${panCard ? "border-green-200 bg-green-50 text-green-600" : "border-primary/10 hover:border-primary/30"}`}
                                        >
                                            <input id="pan-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'pan')} />
                                            {panCard ? <CheckCircle2 className="w-8 h-8" /> : <Upload className="w-8 h-8 text-primary/40" />}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 pl-1 text-center block">Selfie with ID<span className="text-red-500">*</span></label>
                                        <div
                                            onClick={() => document.getElementById('selfie-upload')?.click()}
                                            className={`aspect-video border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${selfie ? "border-green-200 bg-green-50 text-green-600" : "border-primary/10 hover:border-primary/30"}`}
                                        >
                                            <input id="selfie-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'selfie')} />
                                            {selfie ? <CheckCircle2 className="w-8 h-8" /> : <Upload className="w-8 h-8 text-primary/40" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 5 && (
                            <div className="space-y-8 text-slate-900">
                                <div>
                                    <h2 className="text-3xl font-bold">Campaign Gallery</h2>
                                    <p className="text-slate-500 text-sm mt-2">Upload up to 4 more photos or videos. <span className="text-primary font-bold">At least one more image is mandatory.</span></p>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {extraMedia.map((m, idx) => (
                                        <div key={idx} className="space-y-3">
                                            <div className="flex justify-between items-center px-1">
                                                <span className="text-[10px] font-black uppercase text-slate-400">Media {idx + 2}</span>
                                                <select 
                                                    className="text-[10px] font-bold text-primary bg-primary/5 rounded px-1 transition-colors hover:bg-primary/10 border-none outline-none"
                                                    value={m.type}
                                                    onChange={(e) => handleMediaTypeChange(idx, e.target.value as 'image' | 'video')}
                                                >
                                                    <option value="image">Image</option>
                                                    <option value="video">Video</option>
                                                </select>
                                            </div>
                                            <div
                                                onClick={() => document.getElementById(`gallery-upload-${idx}`)?.click()}
                                                className={`aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ${m.file ? "border-primary bg-primary/5 text-primary" : "border-primary/5 hover:border-primary/20 bg-slate-50/50"}`}
                                            >
                                                <input id={`gallery-upload-${idx}`} type="file" className="hidden" accept={m.type === 'image' ? "image/*" : "video/*"} onChange={(e) => handleFileChange(e, 'gallery', idx)} />
                                                {m.file ? (
                                                    <div className="absolute inset-0">
                                                        {m.type === 'image' ? (
                                                            <img src={URL.createObjectURL(m.file)} className="w-full h-full object-cover" alt="Gallery" />
                                                        ) : (
                                                            <div className="w-full h-full flex flex-col items-center justify-center bg-primary/5 p-2">
                                                                <CheckCircle2 className="w-6 h-6 mb-1" />
                                                                <span className="text-[8px] font-bold truncate max-w-full italic">{m.file.name}</span>
                                                            </div>
                                                        )}
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const next = [...extraMedia];
                                                                next[idx] = { ...next[idx], file: null };
                                                                setExtraMedia(next);
                                                            }}
                                                            className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="text-center group">
                                                        <Upload className="w-6 h-6 mx-auto mb-1 text-primary/30 group-hover:text-primary/60 transition-colors" />
                                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Choose {m.type}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-8 border-t border-primary/5">
                                    <h2 className="text-xl font-bold mb-4">Support Documents</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div
                                            onClick={() => document.getElementById('docs-upload')?.click()}
                                            className="h-32 border-2 border-dashed border-primary/5 rounded-3xl flex flex-col items-center justify-center space-y-2 hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer text-slate-400"
                                        >
                                            <input id="docs-upload" type="file" multiple className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'docs')} />
                                            <Plus className="w-8 h-8 opacity-40" />
                                            <p className="font-bold text-xs uppercase tracking-widest">Add more docs</p>
                                        </div>

                                        <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                            {supportDocs.map((doc, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-primary/5">
                                                    <span className="text-[10px] font-bold text-slate-500 truncate">{doc.name}</span>
                                                    <button onClick={() => setSupportDocs(supportDocs.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-500 transition-colors">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            {supportDocs.length === 0 && (
                                                <div className="h-full flex items-center justify-center">
                                                    <p className="text-[10px] font-bold text-slate-300 uppercase italic">No documents uploaded yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 6 && (
                            <div className="text-center space-y-8">
                                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto">
                                    <CheckCircle2 className="w-12 h-12" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold text-gray-900">All set to launch?</h2>
                                    <p className="text-muted-foreground">Review your details and submit for verification.</p>
                                </div>
                                <div className="bg-primary/5 p-6 rounded-2xl text-left space-y-3 border border-primary/10 text-sm">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Campaign Title</p>
                                            <p className="font-bold text-slate-900">{formData.title || "Untitled"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Goal Amount</p>
                                            <p className="font-bold text-primary">₹{parseInt(formData.goal_amount)?.toLocaleString() || "0"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Holder</p>
                                            <p className="font-bold text-slate-900">{formData.account_holder_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">KYC Status</p>
                                            <p className="font-bold text-green-600">Documents Attached</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center pt-10 mt-10 border-t border-primary/5">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            className="rounded-xl border-primary/10"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                        {currentStep === STEPS.length - 1 ? (
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="rounded-xl min-w-[150px]"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Submit Fundraiser
                            </Button>
                        ) : (
                            <Button onClick={handleNext} className="rounded-xl">
                                Continue <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
