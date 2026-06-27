import api from "@/lib/api";

export const getAdminNotifications = async () => {
  const { data } = await api.get(
    "/inspections/results/status?approval_status=PENDING"
  );

  return data.data || [];
};