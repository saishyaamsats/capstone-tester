"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Atom, Zap, Shield, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user) {
      setIsRedirecting(true);
      router.replace("/dashboard");
    }
  }, [mounted, user, router]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isLoading || isRedirecting) return;
    
    setIsLoading(true);
    setLoginError(null);
    
    try {
      if (!values.email || !values.password) {
        throw new Error("Please enter both email and password");
      }
      
      const authenticatedUser = await login(values);
      
      if (authenticatedUser) {
        setIsRedirecting(true);
        toast({
          title: "Welcome! 🚀",
          description: `Successfully logged in as ${authenticatedUser.name || authenticatedUser.email}`,
        });
        router.replace("/dashboard");
      } else {
        setLoginError("Invalid email or password. Please check your credentials and try again.");
        form.setFocus("email");
      }
    } catch (error: any) {
      const errorMessage = error.message || "Login failed. Please check your connection and try again.";
      setLoginError(errorMessage);
      
      form.setValue("password", "");
      form.setFocus("email");
    } finally {
      setIsLoading(false);
    }
  }

  const handleDemoLogin = (email: string, password: string) => {
    if (isLoading || isRedirecting) return;
    form.setValue("email", email);
    form.setValue("password", password);
    form.handleSubmit(onSubmit)();
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-primary/20 animate-ping" />
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            }}
            animate={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        <Card className="w-full max-w-md quantum-card shadow-2xl">
          <CardHeader className="text-center pb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
              className="mx-auto mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
                <div className="relative bg-gradient-to-br from-primary via-purple-500 to-pink-500 p-4 rounded-2xl shadow-2xl">
                  <Atom className="h-12 w-12 text-white quantum-pulse" />
                </div>
              </div>
            </motion.div>
            
            <CardTitle className="text-4xl font-headline font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent neon-text">
              QuantumChain
            </CardTitle>
            <CardDescription className="text-base mt-3 text-muted-foreground">
              Secure MegaETH-based quantum computing platform
            </CardDescription>
            
            <div className="flex justify-center gap-4 mt-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="h-4 w-4 text-blue-500" />
                <span>Quantum Computing</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4 text-green-500" />
                <span>MegaETH Security</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {loginError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Alert className="border-red-500/20 bg-red-500/5">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-foreground">
                    {loginError}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/5 to-blue-600/10 border border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-blue-400 mb-2">Demo Access Available</p>
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-2 text-xs text-blue-200 hover:bg-blue-500/10 w-full text-left"
                          onClick={() => handleDemoLogin("admin@example.com", "456")}
                          disabled={isLoading}
                        >
                          <div>
                            <div className="font-medium text-foreground">Admin Account</div>
                            <div className="text-blue-200/60">admin@example.com • 🔑 Full platform access</div>
                          </div>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-2 text-xs text-blue-200 hover:bg-blue-500/10 w-full text-left"
                          onClick={() => handleDemoLogin("p1@example.com", "123")}
                          disabled={isLoading}
                        >
                          <div>
                            <div className="font-medium text-foreground">User Account</div>
                            <div className="text-blue-200/60">p1@example.com • 👤 Standard user access</div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your email address" 
                          className="h-12 border-blue-500/20 focus:border-blue-500/50 text-foreground"
                          disabled={isLoading}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••••••" 
                          className="h-12 border-blue-500/20 focus:border-blue-500/50 text-foreground"
                          disabled={isLoading}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 font-semibold text-base" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Atom className="mr-2 h-5 w-5" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link 
                  href="/register" 
                  className="font-semibold text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors"
                >
                  Create one here
                </Link>
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/5 to-green-600/10 border border-green-500/20">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-green-400 mb-1">🛡️ Enterprise Security</p>
                  <p className="text-xs text-green-200/80">
                    Your quantum computations are protected with military-grade encryption and permanent MegaETH token verification.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}