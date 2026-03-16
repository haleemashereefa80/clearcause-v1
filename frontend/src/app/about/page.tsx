import type { Metadata } from "next";
import { Heart, Shield, Users, Globe } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
    title: "About Us | ClearCause",
    description: "Learn about ClearCause — a transparent crowdfunding platform helping individuals and organizations raise funds for meaningful causes.",
};

export default function AboutPage() {
    return (
        <div className="space-y-24 pb-24">
            {/* Hero */}
            <section className="relative py-28 bg-primary/5 overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20" />
                <div className="container mx-auto px-4 relative z-10 text-center space-y-6 max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold uppercase tracking-widest">
                        <Heart className="w-4 h-4 fill-primary" /> Our Story
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
                        About <span className="text-primary">ClearCause</span>
                    </h1>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        ClearCause is a transparent crowdfunding platform designed to help individuals, families, and organizations raise funds for meaningful causes.
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section className="container mx-auto px-4 max-w-4xl space-y-8">
                <div className="bg-white rounded-[2.5rem] border border-primary/5 shadow-lg shadow-primary/5 p-10 md:p-16 space-y-6">
                    <h2 className="text-3xl font-extrabold text-gray-900">Our Mission</h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        Our mission is to create a <strong className="text-primary">trust-driven fundraising ecosystem</strong> where people in need can connect with compassionate donors across the world.
                    </p>
                    <p className="text-gray-600 leading-relaxed">ClearCause enables fundraisers for:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {["Medical Emergencies", "Education Support", "Disaster Relief", "Animal Welfare", "Social Causes", "Community Initiatives"].map((cause) => (
                            <div key={cause} className="flex items-center gap-2 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                                <span className="font-semibold text-gray-700 text-sm">{cause}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-gray-600 italic text-lg border-l-4 border-primary pl-6">
                        "We believe that every genuine cause deserves visibility and support."
                    </p>
                </div>
            </section>

            {/* Vision */}
            <section className="bg-primary py-20">
                <div className="container mx-auto px-4 max-w-4xl text-center space-y-6 text-white">
                    <h2 className="text-4xl font-extrabold">Our Vision</h2>
                    <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
                        To build a transparent and trusted crowdfunding platform where donors can confidently support verified campaigns and fundraisers can receive timely help during critical moments.
                    </p>
                </div>
            </section>

            {/* Values */}
            <section className="container mx-auto px-4 max-w-5xl space-y-12">
                <div className="text-center space-y-3">
                    <h2 className="text-4xl font-extrabold text-gray-900">Our Values</h2>
                    <p className="text-muted-foreground">The principles that guide everything we do</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { title: "Transparency", icon: Globe, desc: "All campaigns go through verification before going live. We have nothing to hide.", color: "text-blue-600 bg-blue-50" },
                        { title: "Trust", icon: Shield, desc: "Volunteer verification and admin approval ensure only genuine fundraisers go live.", color: "text-primary bg-primary/5" },
                        { title: "Community Impact", icon: Users, desc: "We empower communities to support one another in times of need and crisis.", color: "text-orange-600 bg-orange-50" },
                    ].map((v) => (
                        <div key={v.title} className="bg-white rounded-3xl border border-primary/5 shadow-sm p-8 space-y-5 hover:shadow-lg hover:shadow-primary/5 transition-all">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${v.color}`}>
                                <v.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{v.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{v.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How it Works */}
            <section className="bg-white py-20 border-y border-primary/5">
                <div className="container mx-auto px-4 max-w-4xl space-y-12">
                    <div className="text-center space-y-3">
                        <h2 className="text-4xl font-extrabold text-gray-900">How ClearCause Works</h2>
                    </div>
                    <div className="space-y-4">
                        {[
                            { step: "1", label: "Create a Fundraiser", desc: "Share your cause details, beneficiary info, and goal amount." },
                            { step: "2", label: "Verification by Volunteers & Admin", desc: "Our trained volunteers verify the story and admin reviews for approval." },
                            { step: "3", label: "Campaign Goes Live", desc: "Your verified campaign is published and visible to thousands of donors." },
                            { step: "4", label: "Donors Contribute Securely", desc: "Donors make secure payments using Razorpay — UPI, card, net banking." },
                            { step: "5", label: "Funds are Withdrawn after Approval", desc: "After KYC and admin approval, funds are transferred to your bank account." },
                        ].map((s, i) => (
                            <div key={i} className="flex items-start gap-6 p-6 rounded-2xl hover:bg-primary/5 transition-colors group">
                                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                                    {s.step}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-gray-900 text-lg">{s.label}</h3>
                                    <p className="text-muted-foreground">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Headquarters */}
            <section className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white rounded-[2.5rem] border border-primary/5 shadow-sm p-10 flex flex-col md:flex-row gap-10 items-start">
                    <div className="space-y-4 flex-grow">
                        <h2 className="text-3xl font-extrabold text-gray-900">Headquarters</h2>
                        <address className="not-italic text-gray-600 space-y-1 leading-relaxed text-lg">
                            <p className="font-bold text-gray-900">ClearCause</p>
                            <p>Kapikar Road, Bejai</p>
                            <p>Lalbagh</p>
                            <p>Mangaluru – 575003</p>
                            <p>Karnataka, India</p>
                        </address>
                    </div>
                    <div className="space-y-4">
                        <Link href="/contact" className="block px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all text-center shadow-lg shadow-primary/20">
                            Contact Us
                        </Link>
                        <Link href="/start-fundraiser" className="block px-8 py-4 border border-primary/20 text-primary rounded-2xl font-bold hover:bg-primary/5 transition-all text-center">
                            Start a Fundraiser
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
