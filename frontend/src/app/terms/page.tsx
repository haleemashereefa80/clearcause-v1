import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms & Conditions | ClearCause",
    description: "Read the terms and conditions for using the ClearCause crowdfunding platform.",
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

export default function TermsPage() {
    return (
        <div className="space-y-0 pb-24">
            <section className="py-24 bg-primary/5 text-center space-y-4">
                <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">Terms & <span className="text-primary">Conditions</span></h1>
                <p className="text-gray-500 max-w-xl mx-auto">Last updated: March 2026</p>
            </section>

            <section className="container mx-auto px-4 py-16 max-w-3xl">
                <div className="bg-white rounded-[2.5rem] border border-primary/5 shadow-sm p-10 md:p-14 space-y-12">
                    <p className="text-gray-600 leading-relaxed text-lg">
                        By using the ClearCause platform, you agree to the following terms. Please read them carefully before using our services.
                    </p>

                    <Section title="Platform Role">
                        <BulletList items={[
                            "ClearCause acts as a technology platform connecting fundraisers with donors.",
                            "We do not guarantee the success of any campaign.",
                            "ClearCause is not responsible for how funds are used once transferred.",
                        ]} />
                    </Section>

                    <Section title="Campaign Approval">
                        <p>All campaigns must go through:</p>
                        <BulletList items={["Admin review", "Volunteer verification"]} />
                        <p>ClearCause reserves the right to reject or remove any campaign that violates our policies at any time and without prior notice.</p>
                    </Section>

                    <Section title="Donations">
                        <BulletList items={[
                            "Donations made through ClearCause are voluntary.",
                            "Donors should review campaign details before contributing.",
                            "ClearCause is not liable for campaigns that turn out to be inaccurate.",
                        ]} />
                    </Section>

                    <Section title="Fund Withdrawals">
                        <p>Funds raised through campaigns can be withdrawn only after:</p>
                        <BulletList items={["KYC verification", "Admin approval", "Supporting document validation"]} />
                    </Section>

                    <Section title="Prohibited Activities">
                        <p>The following activities are strictly prohibited on ClearCause:</p>
                        <BulletList items={[
                            "Fraudulent fundraising",
                            "Misleading campaign information",
                            "Illegal activities of any kind",
                            "Use of funds for purposes other than stated in the campaign",
                        ]} />
                        <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-sm text-red-700 font-medium">
                            Accounts violating these rules may be permanently suspended and reported to appropriate authorities.
                        </div>
                    </Section>

                    <Section title="Changes to Terms">
                        <p>ClearCause reserves the right to update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
                        <p>For questions about these terms, contact: <a href="mailto:hello@clearcause.org" className="text-primary font-semibold hover:underline">hello@clearcause.org</a></p>
                    </Section>
                </div>
            </section>
        </div>
    );
}
