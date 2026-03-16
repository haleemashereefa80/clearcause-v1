"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { X, Loader2, QrCode, CreditCard, ChevronDown } from "lucide-react";

interface DonationModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaignId: string;
    campaignTitle: string;
}

export default function DonationModal({ isOpen, onClose, campaignId, campaignTitle }: DonationModalProps) {
    const [amountInput, setAmountInput] = useState<string>("2500");
    const [tipPercentage, setTipPercentage] = useState<number>(16);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [donorName, setDonorName] = useState("");
    const [donorEmailMobile, setDonorEmailMobile] = useState("");
    const [panNumber, setPanNumber] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"card" | "qr">("card");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const baseAmount = parseInt(amountInput) || 0;
    const tipAmount = Math.round((baseAmount * tipPercentage) / 100);
    const totalAmount = baseAmount + tipAmount;
    const requiresPan = totalAmount > 10000;

    useEffect(() => {
        const fetchUser = async () => {
            if (localStorage.getItem("access_token")) {
                try {
                    const res = await api.get("/auth/me/");
                    setDonorName(res.data.full_name || "");
                    setDonorEmailMobile(res.data.email || res.data.mobile || "");
                } catch (e) { }
            }
        };
        if (isOpen) {
            document.body.style.overflow = "hidden";
            fetchUser();
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            document.body.appendChild(script);
        } else {
            document.body.style.overflow = "unset";
            setAmountInput("2500");
            setTipPercentage(16);
            setPanNumber("");
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleDonate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (baseAmount < 100) {
            setError("Minimum donation amount is ₹100");
            return;
        }
        if (requiresPan && !panNumber.trim()) {
            setError("PAN card is mandatory for total amounts above ₹10,000.");
            return;
        }
        if (!donorName.trim() && !isAnonymous) {
            setError("Name is required unless donating anonymously."); return;
        }
        if (!donorEmailMobile.trim()) { setError("Mobile number or Email ID is mandatory."); return; }

        setLoading(true);
        setError("");

        // Very basic check to separate email from mobile mapping for the backend
        const isEmail = donorEmailMobile.includes("@");
        const emailData = isEmail ? donorEmailMobile : "";
        const mobileData = !isEmail ? donorEmailMobile : "";

        try {
            const { data: orderData } = await api.post("/donations/create-order/", {
                campaign_id: campaignId,
                amount: totalAmount, // Pass total including tip to Razorpay
                donor_name: isAnonymous ? "Anonymous" : donorName,
                donor_email: emailData,
                donor_mobile: mobileData,
                pan_number: panNumber,
                is_anonymous: isAnonymous
            });

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "ClearCause",
                description: `Donation + Tip for ${campaignTitle}`,
                order_id: orderData.order_id,
                handler: async function (response: any) {
                    try {
                        await api.post("/donations/confirm/", {
                            donation_id: orderData.donation_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        alert("Payment successful! Thank you for your donation.");
                        onClose();
                        window.location.reload();
                    } catch (err) {
                        alert("Error confirming payment. Please contact support.");
                    }
                },
                prefill: {
                    name: isAnonymous ? "Anonymous" : donorName,
                    email: emailData,
                    contact: mobileData,
                },
                theme: {
                    color: "#8B5CF6", // Lavender theme color
                },
                ...(paymentMethod === "qr" && {
                    config: {
                        display: {
                            blocks: { upi: { name: "Scan to Pay", instruments: [{ method: "upi" }] } },
                            sequence: ["block.upi"]
                        }
                    }
                })
            };

            const razorpayInstance = new (window as any).Razorpay(options);
            razorpayInstance.on('payment.failed', function (response: any) {
                alert(response.error.description);
            });
            razorpayInstance.open();

        } catch (err: any) {
            setError(err.response?.data?.error || "Error initializing payment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h2 className="text-[22px] text-gray-700 font-medium">Make a secure donation</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto w-full pb-4">
                    <div className="p-5 space-y-6">
                        {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-100">{error}</div>}

                        {/* Top Accent Box */}
                        <div className="bg-primary text-white p-5 rounded-md flex gap-4 shadow-md shadow-primary/20">
                            <div className="flex-1 space-y-1">
                                <label className="text-xs font-semibold text-white/80">Currency</label>
                                <div className="relative border-b border-white/40 pb-1 flex items-center">
                                    <span className="text-lg">₹ INR</span>
                                    <ChevronDown className="w-4 h-4 ml-auto opacity-70" />
                                </div>
                            </div>
                            <div className="flex-[2] space-y-1">
                                <label className="text-xs font-semibold text-white/80">Amount</label>
                                <div className="border-b border-white/70 pb-1">
                                    <input
                                        type="number"
                                        value={amountInput}
                                        onChange={(e) => setAmountInput(e.target.value)}
                                        className="w-full bg-transparent text-lg font-medium outline-none placeholder:text-white/50"
                                        placeholder="Enter Amount"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tip Section */}
                        <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-600 space-y-4 border border-gray-100/50">
                            <p className="leading-relaxed">
                                ClearCause charges NO fees. We rely on donors like you to cover for our expenses. Kindly consider a tip. Thank you 🙏
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-700">Include a tip of</span>
                                <select
                                    value={tipPercentage}
                                    onChange={(e) => setTipPercentage(Number(e.target.value))}
                                    className="bg-transparent border-b border-gray-300 pb-1 pr-6 font-medium text-gray-800 outline-none cursor-pointer appearance-none text-right"
                                    style={{ background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right center` }}
                                >
                                    <option value={0}>0% (₹ 0)</option>
                                    <option value={10}>10% (₹ {Math.round(baseAmount * 0.10)})</option>
                                    <option value={12}>12% (₹ {Math.round(baseAmount * 0.12)})</option>
                                    <option value={16}>16% (₹ {Math.round(baseAmount * 0.16)})</option>
                                    <option value={20}>20% (₹ {Math.round(baseAmount * 0.20)})</option>
                                </select>
                            </div>
                        </div>

                        {/* Donate Using */}
                        <div className="space-y-3">
                            <label className="text-gray-600 font-medium">Donate using</label>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setPaymentMethod("card")}
                                    className={`w-full flex items-center gap-3 p-4 rounded-md border text-left transition-colors ${paymentMethod === "card" ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-700 hover:border-gray-300"}`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === "card" ? "border-primary" : "border-gray-300"}`}>
                                        {paymentMethod === "card" && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                                    </div>
                                    <span className="font-semibold text-[15px]">Netbanking, Credit/Debit Cards & more</span>
                                </button>

                                <button
                                    onClick={() => setPaymentMethod("qr")}
                                    className={`w-full flex items-center gap-3 p-4 rounded-md border text-left transition-colors ${paymentMethod === "qr" ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-700 hover:border-gray-300"}`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === "qr" ? "border-primary" : "border-gray-300"}`}>
                                        {paymentMethod === "qr" && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                                    </div>
                                    <span className="font-semibold text-[15px]">Scan and pay via QR code</span>
                                </button>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <form id="donation-form" onSubmit={handleDonate} className="space-y-6 pt-2">
                            <div className="space-y-5">
                                <input
                                    type="text" required={!isAnonymous} placeholder="Name"
                                    disabled={isAnonymous}
                                    value={isAnonymous ? "Anonymous" : donorName}
                                    onChange={(e) => setDonorName(e.target.value)}
                                    className="w-full border-b border-gray-300 pb-2 bg-transparent outline-none focus:border-primary transition-colors text-gray-800 placeholder:text-gray-400 disabled:text-gray-400 disabled:opacity-60"
                                />

                                <input
                                    type="text" required placeholder="Mobile number/Email ID"
                                    value={donorEmailMobile} onChange={(e) => setDonorEmailMobile(e.target.value)}
                                    className="w-full border-b border-gray-300 pb-2 bg-transparent outline-none focus:border-primary transition-colors text-gray-800 placeholder:text-gray-400"
                                />

                                {requiresPan && (
                                    <input
                                        type="text" required placeholder="PAN Card Number (Required for > ₹10,000)"
                                        value={panNumber} onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                                        className="w-full border-b border-red-300 pb-2 bg-transparent outline-none focus:border-red-600 transition-colors text-gray-800 placeholder:text-red-400 uppercase"
                                    />
                                )}

                                <div className="flex items-center gap-3 pt-2">
                                    <span className="text-gray-700">Keep my details private</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
                                        <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                            </div>
                        </form>

                        <div className="pt-4">
                            <button
                                type="submit"
                                form="donation-form"
                                disabled={loading || baseAmount < 10}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 rounded-full transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Continue to pay ₹{totalAmount.toLocaleString()}</span>}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
