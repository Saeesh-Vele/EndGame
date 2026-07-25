"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { Villa, Destination, BookingRequest } from "@/types";
import { allVillas, sampleDestinations } from "@/lib/data/sample";
import { sampleBookings } from "@/lib/data/bookings";

interface AdminDataContextValue {
  villas: Villa[];
  destinations: Destination[];
  bookings: BookingRequest[];
  addVilla: (villa: Villa) => void;
  updateVilla: (id: string, updates: Partial<Villa>) => void;
  deleteVilla: (id: string) => void;
  addDestination: (destination: Destination) => void;
  updateDestination: (id: string, updates: Partial<Destination>) => void;
  deleteDestination: (id: string) => void;
  updateBooking: (id: string, updates: Partial<BookingRequest>) => void;
}

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

export function AdminDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [villas, setVillas] = useState<Villa[]>(allVillas);
  const [destinations, setDestinations] =
    useState<Destination[]>(sampleDestinations);
  const [bookings, setBookings] = useState<BookingRequest[]>(sampleBookings);

  const value = useMemo<AdminDataContextValue>(
    () => ({
      villas,
      destinations,
      bookings,
      addVilla: (villa) => setVillas((prev) => [villa, ...prev]),
      updateVilla: (id, updates) =>
        setVillas((prev) =>
          prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
        ),
      deleteVilla: (id) =>
        setVillas((prev) => prev.filter((v) => v.id !== id)),
      addDestination: (destination) =>
        setDestinations((prev) => [destination, ...prev]),
      updateDestination: (id, updates) =>
        setDestinations((prev) =>
          prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
        ),
      deleteDestination: (id) =>
        setDestinations((prev) => prev.filter((d) => d.id !== id)),
      updateBooking: (id, updates) =>
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
        ),
    }),
    [villas, destinations, bookings]
  );

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) {
    throw new Error("useAdminData must be used within AdminDataProvider");
  }
  return ctx;
}
