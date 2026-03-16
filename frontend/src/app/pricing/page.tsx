"use client";

import { useState } from "react";
import {
    Users,
    ShieldCheck,
    HeadphonesIcon,
    HeartHandshake,
    Smartphone,
    LineChart
} from "lucide-react";

export default function PricingPage() {
    const [goalAmount, setGoalAmount] = useState<number>(100000);

    // Calculations based on the screenshot logic
    const platformFee = 0;
    const paymentGatewayFee = goalAmount * 0.0236; // Assuming standard 2% + 18% GST = ~2.36%
    const totalSetupGoal = goalAmount + paymentGatewayFee;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Top Banner Area */}
            <div className="bg-primary text-white py-16 md:py-24 relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-sm md:text-base font-bold tracking-widest uppercase mb-4 opacity-90">
                        Free Fundraising for all!
                    </h1>
                    <h2 className="text-4xl md:text-5xl font-black mb-6">
                        0% Platform Fees
                    </h2>
                    <p className="text-lg md:text-xl font-medium opacity-90 max-w-2xl mx-auto mb-8">
                        RAISE MAXIMUM FUNDS FOR THE CAUSE YOU CARE ABOUT
                    </p>
                    <button className="bg-white text-primary px-8 py-3 rounded-full font-bold shadow-lg hover:bg-gray-100 transition-colors">
                        Start a fundraiser
                    </button>
                </div>
                {/* Decorative Elements */}
                <div className="absolute left-0 bottom-0 opacity-20 pointer-events-none">
                    <svg width="400" height="200" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 200V0C80 0 150 50 200 100C250 150 320 200 400 200H0Z" fill="currentColor" />
                    </svg>
                </div>
            </div>

            {/* Calculator Section */}
            <div className="container mx-auto px-4 py-16 -mt-8">
                <div className="bg-white rounded-2xl shadow-xl max-w-4xl mx-auto overflow-hidden">
                    <div className="p-8 md:p-12 text-center border-b border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Fundraiser goal calculator</h2>
                        <p className="text-gray-500 mb-8">A smart way to plan and achieve your fundraiser goal</p>

                        <div className="max-w-md mx-auto space-y-6">
                            <div className="text-left">
                                <label className="text-sm font-semibold text-gray-600 block mb-2">I want to raise</label>
                                <div className="flex items-center text-3xl font-black text-primary border-b-2 border-primary/20 pb-2">
                                    <span className="mr-2">₹</span>
                                    <input
                                        type="number"
                                        value={goalAmount}
                                        onChange={(e) => setGoalAmount(Number(e.target.value))}
                                        className="w-full bg-transparent outline-none"
                                        min={100}
                                    />
                                </div>
                            </div>

                            <input
                                type="range"
                                min={1000}
                                max={10000000}
                                value={goalAmount}
                                onChange={(e) => setGoalAmount(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                    </div>

                    {/* Cost Breakup Logic Area */}
                    <div className="bg-primary/5 p-8 md:p-12">
                        <div className="grid md:grid-cols-2 gap-12 items-center">

                            <div className="space-y-4">
                                <p className="text-gray-600 text-lg">Consider setting a goal of approx.</p>
                                <h3 className="text-4xl md:text-5xl font-black text-primary">
                                    ₹{totalSetupGoal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </h3>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Disclaimer: This goal is approximately calculated so you should consider setting this as a goal to meet your minimum funds requirement. This is considering you get donations from India via Cards/Netbanking/UPI.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <h4 className="font-bold text-gray-800 border-b border-gray-200 pb-2">Fee breakup</h4>

                                <div className="space-y-3 font-medium">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Want to raise (A) <span className="text-gray-400 text-xs">(₹)</span></span>
                                        <span className="text-gray-900">₹{goalAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>ClearCause platform fees <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full ml-2">FREE</span></span>
                                        <span className="text-green-600">₹0</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span className="flex items-center gap-1">
                                            Payment gateway charges (B) <span className="text-gray-400 text-xs">(~2.36%)</span>
                                        </span>
                                        <span className="text-red-500">₹{paymentGatewayFee.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                    </div>

                                    <div className="h-px bg-gray-200 my-4"></div>

                                    <div className="flex justify-between font-bold text-lg">
                                        <span className="text-primary">Total goal (A+B)</span>
                                        <span className="text-primary">₹{totalSetupGoal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Banner */}
            <div className="bg-primary/10 py-16 mt-8">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-primary mb-12">Why choose ClearCause?</h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary/5 flex items-start gap-4 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                <HeartHandshake className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 mb-1">Dedicated relationship manager</h4>
                                <p className="text-sm text-gray-500">Dedicated relationship manager to address all your fundraising needs.</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary/5 flex items-start gap-4 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                <Smartphone className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 mb-1">Simple setup</h4>
                                <p className="text-sm text-gray-500">Set up your fundraiser effortlessly in 3 simple steps.</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary/5 flex items-start gap-4 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                <LineChart className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 mb-1">Smart dashboard</h4>
                                <p className="text-sm text-gray-500">Manage all your fundraiser details, withdrawals, donations in one dashboard.</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary/5 flex items-start gap-4 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 mb-1">Easy fund withdrawal</h4>
                                <p className="text-sm text-gray-500">Provide bank details and request transfer with seamless funds safety.</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary/5 flex items-start gap-4 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 mb-1">Safety and security</h4>
                                <p className="text-sm text-gray-500">The most secure encryption technology to keep your funds safe.</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary/5 flex items-start gap-4 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                <HeadphonesIcon className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 mb-1">24x7 Expert support</h4>
                                <p className="text-sm text-gray-500">Expert support at your service, whenever you need it.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Footer Action */}
            <div className="py-16 text-center">
                <button className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-primary/20 transition-all text-lg">
                    Start a fundraiser
                </button>
            </div>

        </div>
    );
}
