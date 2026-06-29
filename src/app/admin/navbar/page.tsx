"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NavbarRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect ke pages dengan scroll ke section navbar
    const timer = setTimeout(() => {
      router.push("/admin/pages/list#navbar");
    }, 100);
    
    return () => clearTimeout(timer);
  }, [router]);

  return null;
}
