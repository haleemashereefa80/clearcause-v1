import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | ClearCause",
    description: "Read how ClearCause collects, uses, and protects your personal information.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-primary pl-4">{title}</h2>
            <div className="text-gray-600 leading-relaxed space-y-3 pl-5">{children}</div>
        </div>
    );
}

function BulletList({ items }: { items: string[] }) {
    return (
        <ul className="space-y-2">
            {items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

export default function PrivacyPolicyPage() {
    return (
        <div className="space-y-0 pb-24">
            <section className="py-24 bg-primary/5 text-center space-y-4">
                <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">Privacy <span className="text-primary">Policy</span></h1>
                <p className="text-gray-500 max-w-xl mx-auto">Last updated: March 2026</p>
            </section>

            <section className="container mx-auto px-4 py-16 max-w-3xl">
                <div className="bg-white rounded-[2.5rem] border border-primary/5 shadow-sm p-10 md:p-14 space-y-12">
                    <p className="text-gray-600 leading-relaxed text-lg">
                        ClearCause respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
                    </p>

                    <Section title="Information We Collect">
                        <p>We may collect the following information:</p>
                        <BulletList items={["Name", "Email address", "Phone number", "Donation information", "KYC documents uploaded for verification", "Bank account details for withdrawals"]} />
                    </Section>

                    <Section title="How We Use Your Information">
                        <p>We use your information to:</p>
                        <BulletList items={["Process donations", "Verify fundraisers", "Provide customer support", "Improve platform security", "Send important notifications"]} />
                    </Section>

                    <Section title="Data Security">
                        <p>We use secure technologies and encryption practices to protect sensitive data such as:</p>
                        <BulletList items={["KYC documents", "Payment transactions", "User account information"]} />
                    </Section>

                    <Section title="Data Sharing">
                        <p>ClearCause does <strong>not sell or rent</strong> your personal data to third parties. Information may be shared only with trusted partners for:</p>
                        <BulletList items={["Payment processing", "Email notifications", "Fraud prevention"]} />
                    </Section>

                    <Section title="User Rights">
                        <p>Users may request:</p>
                        <BulletList items={["Access to their personal data", "Correction of inaccurate information", "Deletion of their account"]} />
                        <p>Requests can be sent to: <a href="mailto:privacy@clearcause.org" className="text-primary font-semibold hover:underline">privacy@clearcause.org</a></p>
                    </Section>

                    <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 text-sm text-gray-600">
                        By using ClearCause, you consent to the terms of this Privacy Policy. We may update this policy from time to time and will notify users of significant changes.
                    </div>
                </div>
            </section>
        </div>
    );
}
