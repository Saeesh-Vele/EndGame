import Link from "next/link";

export default function CTASection() {
  return (
    <section className="bg-forest">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-24 text-center">
        <h2 className="font-display font-normal text-3xl sm:text-4xl text-white">
          Own a villa?
        </h2>
        <p className="mt-3 text-white/80 max-w-lg mx-auto leading-relaxed">
          List your property on StayVilla and reach guests looking for a
          private stay, not a room in a hotel. No listing fees, no
          middlemen — just direct bookings.
        </p>
        <Link
          href="/list-your-villa"
          className="cursor-pointer inline-block mt-8 rounded-xl bg-white text-forest text-sm font-medium px-7 py-3.5 transition-colors duration-200 hover:bg-linen"
        >
          List your villa
        </Link>
      </div>
    </section>
  );
}
