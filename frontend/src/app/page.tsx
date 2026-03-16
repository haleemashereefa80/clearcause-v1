"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, Users, Globe, ArrowRight, ShieldCheck, Share2, Wallet } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden bg-[#7C6BC4]/5">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900">
            Support the causes <br />
            <span className="text-primary italic">that matter most.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Transparent, secure, and community-driven crowdfunding for medical emergencies,
            education, and social impact.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/start-fundraiser">
              <Button size="lg" className="w-full sm:w-auto">Start a Fundraiser</Button>
            </Link>
            <Link href="/fundraisers">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">Donate Now</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 md:p-12 bg-white rounded-3xl shadow-xl shadow-primary/5 border border-primary/5">
          {[
            { label: "Funds Raised", value: "₹45Cr+", icon: Heart },
            { label: "Active Campaigns", value: "1,200+", icon: Globe },
            { label: "Total Donors", value: "50,000+", icon: Users },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary mb-2">
                <stat.icon className="w-8 h-8" />
              </div>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-muted-foreground font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cause Categories */}
      <section className="container mx-auto px-4 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold underline decoration-primary/30 underline-offset-8 decoration-4">Browse by Cause</h2>
          <Link href="/fundraisers" className="text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {[
            "Medical", "Education", "Disaster", "Animals", "Children", "Elderly", "NGO"
          ].map((cat, i) => (
            <Link key={i} href={`/fundraisers?category=${cat.toLowerCase()}`}
              className="p-6 bg-white rounded-2xl border border-primary/5 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all text-center">
              <p className="font-semibold text-gray-700">{cat}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-24 border-y border-primary/5">
        <div className="container mx-auto px-4 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">How it works</h2>
            <p className="text-muted-foreground">Start making an impact in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Create Fundraiser", desc: "Upload details and documents in 5 minutes.", icon: ShieldCheck },
              { title: "Share Campaign", desc: "Share on WhatsApp and reach thousands.", icon: Share2 },
              { title: "Receive Donations", desc: "Get funds directly to hospital or beneficiary.", icon: Wallet },
            ].map((step, i) => (
              <div key={i} className="relative text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-white rotate-12 hover:rotate-0 transition-transform duration-500">
                  <step.icon className="w-10 h-10 -rotate-12 hover:rotate-0 transition-transform duration-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4">
        <div className="bg-primary rounded-[3rem] p-12 md:p-20 text-center space-y-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
          <h2 className="text-4xl md:text-5xl font-bold relative z-10">
            Ready to save a life?
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto relative z-10">
            Start a fundraiser for free and join or community of change-makers today.
          </p>
          <div className="relative z-10">
            <Link href="/start-fundraiser">
              <Button size="lg" variant="accent" className="bg-white text-primary hover:bg-white/90">
                Start My Fundraiser
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
