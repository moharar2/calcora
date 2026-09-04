import { useEffect } from "react";
import { useLocation } from "wouter";

export function InitialSeoRuntime() {
  const [location] = useLocation();

  useEffect(() => {
    window.MoneyCalciInitialSEO?.apply();
  }, [location]);

  return null;
}
