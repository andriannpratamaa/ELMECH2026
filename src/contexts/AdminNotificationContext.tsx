"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { getPendingCategories } from "@/services/criteria";
import { getPendingReviews } from "@/services/inspections";
import { getCalibrationAlerts } from "@/services/items";

type AdminNotificationContextType = {
  pendingLabCount: number;
  refreshNotifications: () => Promise<void>;
};

const AdminNotificationContext =
  createContext<AdminNotificationContextType | null>(null);

export function AdminNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pendingLabCount, setPendingLabCount] = useState(0);

  const refreshNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const [pendingCats, pendingReviews, calibrationAlerts] =
        await Promise.all([
          getPendingCategories(),
          getPendingReviews(),
          getCalibrationAlerts(),
        ]);

      // Yang dihitung adalah jumlah LAB
      const labMap: Record<number, boolean> = {};

      for (const cat of pendingCats) {
        if (cat.laboratory_id) {
          labMap[cat.laboratory_id] = true;
        }
      }

      for (const review of pendingReviews) {
        if (review.laboratory_id) {
          labMap[review.laboratory_id] = true;
        }
      }

      for (const item of calibrationAlerts) {
        if (item.laboratory_id) {
          labMap[item.laboratory_id] = true;
        }
      }

      setPendingLabCount(Object.keys(labMap).length);
    } catch (err) {
      console.error("Gagal memuat notifikasi admin", err);
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
    <AdminNotificationContext.Provider
      value={{
        pendingLabCount,
        refreshNotifications,
      }}
    >
      {children}
    </AdminNotificationContext.Provider>
  );
}

export function useAdminNotification() {
  const context = useContext(AdminNotificationContext);

  if (!context) {
    throw new Error("AdminNotificationProvider belum dipasang");
  }

  return context;
}