"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Atom, Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRedirect = (path: string) => {
    router.push(path);
  };

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    } else {
      const timeout = setTimeout(() => {
        if (loading) {
          router.push("/login");
        }
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [user, loading, router]);

  // Enhanced timeout with better error handling
  useEffect(() => {
    if (mounted) {
      const timeout = setTimeout(() => {
        if (!user && !loading && !redirecting) {
          handleRedirect("/login");
        }
      }, 2000); // Reduced timeout for better UX

      return () => clearTimeout(timeout);
    }
  }, [user, loading, mounted, handleRedirect, redirecting]);
  if (!mounted || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
            <div className="relative bg-gradient-to-br from-primary via-purple-500 to-pink-500 p-6 rounded-2xl shadow-2xl">
              <Atom className="h-16 w-16 text-white quantum-pulse mx-auto" />
            </div>
          </div>
          <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            QuantumChain
          </h1>
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">
              Initializing platform...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}