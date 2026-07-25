import { Star } from "lucide-react";
import { Review } from "@/types";

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
    <div className="py-8 border-t border-pebble">
      <div className="flex items-center gap-2.5 mb-6">
        <Star size={20} className="fill-driftwood text-driftwood" />
        <h2 className="text-lg text-charcoal">
          {rating.toFixed(2)} · {reviewCount} reviews
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-full bg-sandstone text-charcoal text-sm font-medium">
                {review.author.charAt(0)}
              </div>
              <div>
                <p className="text-sm text-charcoal">{review.author}</p>
                <p className="text-xs text-slate">{review.date}</p>
              </div>
            </div>
            <p className="text-sm text-charcoal leading-relaxed">
              {review.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
