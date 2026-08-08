import { Star, ShieldCheck } from "lucide-react";
import { Review } from "@/types";
import { Card } from "@/components/ui/card";

export default function ReviewsSection({
  rating,
  reviewCount,
  reviews,
}: {
  rating: number;
  reviewCount: number;
  reviews: Review[];
}) {
  if (reviews.length === 0) return null;

  return (
    <div className="py-12 border-t border-pebble">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate">
            Guest Experience
          </span>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1.5 font-display text-3xl font-normal text-charcoal">
              <Star size={24} className="fill-amber-500 text-amber-500" />
              {rating.toFixed(2)}
            </div>
            <span className="text-slate text-sm font-medium">
              · {reviewCount} verified guest {reviewCount === 1 ? "review" : "reviews"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate bg-sandstone/80 border border-pebble px-3.5 py-2 rounded-xl self-start sm:self-auto">
          <ShieldCheck size={16} className="text-forest shrink-0" />
          <span>100% In-Person Verified Reviews</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {reviews.map((review) => (
          <Card key={review.id} className="p-6 border border-pebble/80 bg-card shadow-xs rounded-2xl flex flex-col justify-between">
            <p className="text-sm text-charcoal leading-relaxed font-normal">
              &ldquo;{review.text}&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-3 pt-4 border-t border-pebble/50">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-forest text-white text-sm font-semibold shrink-0">
                {review.author.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-charcoal">{review.author}</p>
                <p className="text-xs text-slate">{review.date}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

