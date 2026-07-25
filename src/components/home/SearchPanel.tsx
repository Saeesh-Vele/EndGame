import { MapPin, Calendar, Users, Search } from "lucide-react";

export default function SearchPanel() {
  return (
    <div className="relative z-10 -mt-20 sm:-mt-12 max-w-5xl mx-auto px-5 sm:px-8">
      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-3">
        <form className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0">
          <label className="flex-1 flex items-center gap-3 px-3 py-2 sm:px-5">
            <MapPin size={18} className="text-slate shrink-0" />
            <span className="flex flex-col w-full">
              <span className="text-xs text-slate">Where</span>
              <input
                type="text"
                placeholder="Search destinations"
                className="text-sm text-charcoal placeholder:text-slate/70 bg-transparent outline-none w-full"
              />
            </span>
          </label>

          <div className="hidden sm:block w-px h-10 bg-pebble" />

          <label className="flex-1 flex items-center gap-3 px-3 py-2 sm:px-5">
            <Calendar size={18} className="text-slate shrink-0" />
            <span className="flex flex-col w-full">
              <span className="text-xs text-slate">Check in</span>
              <input
                type="date"
                className="text-sm text-charcoal bg-transparent outline-none w-full cursor-pointer"
              />
            </span>
          </label>

          <div className="hidden sm:block w-px h-10 bg-pebble" />

          <label className="flex-1 flex items-center gap-3 px-3 py-2 sm:px-5">
            <Calendar size={18} className="text-slate shrink-0" />
            <span className="flex flex-col w-full">
              <span className="text-xs text-slate">Check out</span>
              <input
                type="date"
                className="text-sm text-charcoal bg-transparent outline-none w-full cursor-pointer"
              />
            </span>
          </label>

          <div className="hidden sm:block w-px h-10 bg-pebble" />

          <label className="flex-1 flex items-center gap-3 px-3 py-2 sm:px-5">
            <Users size={18} className="text-slate shrink-0" />
            <span className="flex flex-col w-full">
              <span className="text-xs text-slate">Guests</span>
              <input
                type="number"
                min={1}
                placeholder="Add guests"
                className="text-sm text-charcoal placeholder:text-slate/70 bg-transparent outline-none w-full"
              />
            </span>
          </label>

          <button
            type="submit"
            className="cursor-pointer shrink-0 flex items-center justify-center gap-2 rounded-xl bg-forest hover:bg-forest-light active:bg-forest-dark text-white text-sm font-medium px-6 py-3.5 sm:py-3 transition-colors duration-200"
          >
            <Search size={17} />
            <span className="sm:hidden">Search</span>
          </button>
        </form>
      </div>
    </div>
  );
}
