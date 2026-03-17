import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

interface FundraiserCardProps {
    campaign: {
        id: string;
        title: string;
        slug: string;
        cover_image_url: string;
        beneficiary_name: string;
        raised_amount: number;
        goal_amount: number;
        donor_count: number;
        category: string;
        is_verified?: boolean;
        end_date?: string;
    };
}

export default function FundraiserCard({ campaign }: FundraiserCardProps) {
    const progress = Math.min((campaign.raised_amount / campaign.goal_amount) * 100, 100);

    const getDaysLeft = (dateStr?: string) => {
        if (!dateStr) return null;
        const end = new Date(dateStr);
        const now = new Date();
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const daysLeft = getDaysLeft(campaign.end_date);

    return (
        <div className="bg-white rounded-2xl border border-primary/5 overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all">
            <Link href={`/fundraisers/${campaign.slug}`} className="block relative aspect-video overflow-hidden">
                <img
                    src={campaign.cover_image_url || "https://picsum.photos/seed/cause/800/450"}
                    alt={campaign.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur rounded-md text-[10px] font-bold uppercase tracking-wider text-primary">
                    {campaign.category}
                </div>
            </Link>

            <div className="p-5 space-y-4">
                <div className="space-y-1 relative">
                    <Link href={`/fundraisers/${campaign.slug}`} className="flex items-start justify-between gap-1 group/title">
                        <h3 className="font-bold text-gray-900 line-clamp-2 group-hover/title:text-primary transition-colors leading-snug pr-2">
                            {campaign.title}
                        </h3>
                        {campaign.is_verified && (
                            <div title="Verified Fundraiser" className="shrink-0 mt-0.5">
                                <ShieldCheck className="w-5 h-5 text-green-500" />
                            </div>
                        )}
                    </Link>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                        by <span className="font-medium text-gray-700">{campaign.beneficiary_name}</span>
                    </p>
                </div>

                <div className="space-y-2">
                    <div className="h-2 w-full bg-primary/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-sm">
                        <p><span className="font-bold">₹{campaign.raised_amount.toLocaleString()}</span> raised</p>
                        <p className="text-muted-foreground">of ₹{campaign.goal_amount.toLocaleString()}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-primary/5">
                    <div className="flex flex-col">
                        <p className="text-xs text-muted-foreground"><span className="font-bold text-gray-900">{campaign.donor_count}</span> Donors</p>
                        {daysLeft !== null && (
                            <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{daysLeft} Days Left</p>
                        )}
                    </div>
                    <Link href={`/fundraisers/${campaign.slug}`}>
                        <Button size="sm" variant="outline" className="text-xs h-8 px-4">See Details</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
