"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { getPendingCategories } from "@/services/criteria";
import { getPendingReviews } from "@/services/inspections";

type NotificationContextType = {
  pendingLabCount: number;
  refreshNotifications: () => Promise<void>;
};

const NotificationContext =
  createContext<NotificationContextType | null>(null);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pendingLabCount, setPendingLabCount] = useState(0);

  const refreshNotifications = async () => {
    try {
      const [pendingCats, pendingRev] = await Promise.all([
        getPendingCategories(),
        getPendingReviews(),
      ]);

      const counts: Record<number, number> = {};

      for (const cat of pendingCats) {
        if (cat.laboratory_id)
          counts[cat.laboratory_id] =
            (counts[cat.laboratory_id] || 0) + 1;
      }

      for (const rev of pendingRev) {
        if (rev.laboratory_id)
          counts[rev.laboratory_id] =
            (counts[rev.laboratory_id] || 0) + 1;
      }

      setPendingLabCount(Object.keys(counts).length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    refreshNotifications();

    const interval = setInterval(() => {
      refreshNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        pendingLabCount,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context)
    throw new Error("NotificationProvider belum dipasang");

  return context;
}