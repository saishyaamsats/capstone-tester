"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Loader2, Atom } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/header";
import { Toaster } from "@/components/ui/toaster";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [redirecting, setRedirecting] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (mounted && !loading && !user) {
      setRedirecting(true);
      router.replace("/login");
    }
  }, [user, loading, router, mounted]);

  // Enhanced timeout for loading state with better error handling
  React.useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        if (!user && mounted && !redirecting) {
          setRedirecting(true);
          router.replace("/login");
        }
      }, 3000); // Reduced timeout for better UX

      return () => clearTimeout(timeout);
    }
  }, [loading, user, mounted, router, redirecting]);

  // Additional safety check for authentication
  React.useEffect(() => {
    if (mounted && !loading && !user) {
      const authCheck = setTimeout(() => {
        if (!user && !redirecting) {
          setRedirecting(true);
          router.replace("/login");
        }
      }, 1000);

      return () => clearTimeout(authCheck);
    }
  }, [mounted, loading, user, redirecting, router]);
  if (!mounted || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
            <div className="relative bg-gradient-to-br from-primary via-purple-500 to-pink-500 p-4 rounded-2xl shadow-2xl">
              <Atom className="h-12 w-12 text-white animate-pulse mx-auto" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">
              Loading platform...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex-1">{children}</main>
      <Toaster />
    </div>
  );
}