"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { getLabs } from "@/services/labs";
import { getUser } from "@/services/auth";
import { getMyCriteria } from "@/services/criteria";
import {
  getMyPendingInspections,
  getInspectionByItemId,
} from "@/services/inspections";

type KalabNotificationContextType = {
  pendingLabCount: number;
  refreshNotifications: () => Promise<void>;
};

const KalabNotificationContext =
  createContext<KalabNotificationContextType | null>(null);

export function KalabNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pendingLabCount, setPendingLabCount] = useState(0);

  const refreshNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const user = getUser();

      const [labsData, myCriteria, myReviews] = await Promise.all([
        getLabs(),
        getMyCriteria(),
        getMyPendingInspections(),
      ]);

      const myLabs = user?.id
        ? labsData.filter((lab) => lab.kalab_id === user.id)
        : [];

      const itemToLab: Record<number, number> = {};

      for (const lab of myLabs) {
        for (const item of lab.items ?? []) {
          itemToLab[item.id] = lab.id;
        }
      }

      // Yang dihitung adalah jumlah LAB
      const labMap: Record<number, boolean> = {};

      // Category REJECTED
      for (const cat of myCriteria) {
        if (cat.status === "REJECTED" && cat.item_id) {
          const labId = itemToLab[cat.item_id];
          if (labId) labMap[labId] = true;
        }
      }

      // Review REJECTED
      for (const review of myReviews) {
        if (
          review.review_status === "REJECTED" &&
          review.laboratory_id
        ) {
          labMap[review.laboratory_id] = true;
        }
      }

      // Inspection belum selesai
      const itemsToCheck = myLabs.flatMap((lab) =>
        (lab.items || []).map((item) => ({
          labId: lab.id,
          itemId: item.id,
        }))
      );

      if (itemsToCheck.length > 0) {
        const inspections = await Promise.all(
          itemsToCheck.map(({ itemId }) =>
            getInspectionByItemId(itemId)
          )
        );

        for (let i = 0; i < inspections.length; i++) {
          const insp = inspections[i];
          const { labId } = itemsToCheck[i];

          if (
            insp.exists &&
            insp.review_status === "APPROVED" &&
            insp.filled_months < 6
          ) {
            labMap[labId] = true;
          }
        }
      }

      setPendingLabCount(Object.keys(labMap).length);
    } catch (err) {
      console.error("Gagal memuat notifikasi kalab", err);
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
    <KalabNotificationContext.Provider
      value={{
        pendingLabCount,
        refreshNotifications,
      }}
    >
      {children}
    </KalabNotificationContext.Provider>
  );
}

export function useKalabNotification() {
  const context = useContext(KalabNotificationContext);

  if (!context) {
    throw new Error("KalabNotificationProvider belum dipasang");
  }

  return context;
}