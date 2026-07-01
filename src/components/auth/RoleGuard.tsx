"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getToken, getUser } from "@/services/auth";

interface RoleGuardProps {
  roles: string[];
  children: React.ReactNode;
}

export default function RoleGuard({
  roles,
  children,
}: RoleGuardProps) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = getToken();
    const user = getUser();

    if (!token || !user || !roles.includes(user.role)) {
      router.replace("/admin");
      return;
    }

    setChecked(true);
  }, [router, roles]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return <>{children}</>;
}