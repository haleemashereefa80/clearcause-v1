import type { Metadata } from "next";
import { MapPin, Mail, Clock, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
    title: "Contact Us | ClearCause",
    description: "Get in touch with the ClearCause team for support, general inquiries, or to report a campaign.",
};

export default function ContactPage() {
    return (
        <div className="space-y-0 pb-24">
            {/* Hero */}
            <section className="py-24 bg-primary/5 text-center space-y-4">
                <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">Contact <span className="text-primary">ClearCause</span></h1>
                <p className="text-xl text-gray-600 max-w-xl mx-auto">If you have questions, need support, or want to report an issue, our team is here to help.</p>
            </section>

            <section className="container mx-auto px-4 py-20 max-w-5xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Address */}
                    <div className="bg-white rounded-3xl border border-primary/5 shadow-sm p-8 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Address</h2>
                        <address className="not-italic text-gray-600 leading-relaxed space-y-0.5">
                            <p className="font-semibold text-gray-800">ClearCause</p>
                            <p>Kapikar Road</p>
                            <p>Bejai, Lalbagh</p>
                            <p>Mangaluru – 575003</p>
                            <p>Karnataka, India</p>
                        </address>
                    </div>

                    {/* Email */}
                    <div className="bg-white rounded-3xl border border-primary/5 shadow-sm p-8 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                            <Mail className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Email Us</h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Support</p>
                                <a href="mailto:support@clearcause.org" className="text-primary font-semibold hover:underline">support@clearcause.org</a>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">General Inquiries</p>
                                <a href="mailto:hello@clearcause.org" className="text-primary font-semibold hover:underline">hello@clearcause.org</a>
                            </div>
                        </div>
                    </div>

                    {/* Support Hours */}
                    <div className="bg-white rounded-3xl border border-primary/5 shadow-sm p-8 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                            <Clock className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Support Hours</h2>
                        <div className="space-y-2">
                            <p className="font-semibold text-gray-800">Monday – Saturday</p>
                            <p className="text-gray-600">9:00 AM – 6:00 PM IST</p>
                            <p className="text-xs text-muted-foreground mt-2">We typically respond within 24 hours on business days.</p>
                        </div>
                    </div>

                    {/* Report a Campaign */}
                    <div className="bg-red-50 rounded-3xl border border-red-100 p-8 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Report a Campaign</h2>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            If you suspect a campaign is misleading or fraudulent, please contact us immediately. We take every report seriously.
                        </p>
                        <a href="mailto:report@clearcause.org" className="inline-block px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors">
                            report@clearcause.org
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
