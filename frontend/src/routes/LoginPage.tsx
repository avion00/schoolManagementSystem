import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarCheck2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MessagesSquare,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { AppearanceToggle } from "@/components/AppearanceToggle";
import { Reveal } from "@/components/motion";
import { ErrorShake } from "@/components/motion/ErrorShake";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

const FEATURES = [
  { icon: CalendarCheck2, label: "Attendance & class routines, tracked in real time" },
  { icon: Wallet, label: "Fee collection and billing in one dashboard" },
  { icon: MessagesSquare, label: "Messaging built in for staff, students and guardians" },
];

const DEMO_ACCOUNTS = [
  { label: "Super Admin", email: "admin@platform.test", password: "Passw0rd!2024" },
  { label: "Principal", email: "principal@demo.school", password: "Passw0rd!2024" },
];

export function LoginPage() {
  const { user, login } = useAuth();
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [shakeCount, setShakeCount] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  if (user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await login(values.email, values.password);
      navigate("/dashboard", { replace: true });
    } catch {
      setServerError("Invalid email or password.");
      setShakeCount((c) => c + 1);
    }
  };

  const fillDemo = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setValue("email", account.email);
    setValue("password", account.password);
    setServerError(null);
    toast.info(`${account.label} credentials filled — click Sign in.`);
  };

  const logoSrc = resolvedTheme === "dark" ? "/logo-light.png" : "/logo-dark.png";

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <div className="fixed right-4 top-4 z-20 lg:right-6 lg:top-6">
        <AppearanceToggle />
      </div>

      {/* ── Left marketing panel ─────────────────────────────────────────── */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 lg:flex lg:flex-col lg:justify-between lg:p-12 dark:from-primary/90 dark:via-primary/70 dark:to-background">
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 translate-x-1/3 translate-y-1/4 rounded-full bg-white/10 blur-3xl" />

        <Reveal className="relative">
          <img src="/logo-light.png" alt="Online Dashboard" className="h-10 w-auto max-w-[220px] object-contain" />
        </Reveal>

        <Reveal delay={80} className="relative max-w-md space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold leading-tight text-white">
              Run your entire school from one dashboard.
            </h1>
            <p className="text-sm leading-relaxed text-white/80">
              Students, staff, exams, fees and communication — one platform, built for the way
              schools actually operate.
            </p>
          </div>
          <ul className="space-y-4">
            {FEATURES.map((f) => (
              <li key={f.label} className="flex items-start gap-3 text-sm text-white/90">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <f.icon className="h-3.5 w-3.5" />
                </span>
                {f.label}
              </li>
            ))}
          </ul>
        </Reveal>

        <p className="relative text-xs text-white/60">© {new Date().getFullYear()} Online Dashboard. All rights reserved.</p>
      </div>

      {/* ── Right form panel ─────────────────────────────────────────────── */}
      <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
        <Reveal className="w-full max-w-[400px]">
          <img
            src={logoSrc}
            alt="Online Dashboard"
            className="mx-auto mb-8 h-14 w-auto max-w-[240px] object-contain lg:hidden"
          />

          <ErrorShake trigger={shakeCount}>
            <PremiumCard className="rounded-3xl p-8 shadow-lg">
              <div className="space-y-1.5 text-center">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">Welcome back</h2>
                <p className="text-sm text-muted-foreground">Sign in to your dashboard to continue</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="username"
                      placeholder="you@school.com"
                      className="h-11 rounded-xl pl-10"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      className="text-xs font-medium text-primary hover:underline"
                      onClick={() =>
                        toast.info("Please contact your school administrator to reset your password.")
                      }
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="h-11 rounded-xl pl-10 pr-10"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>

                {serverError && (
                  <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{serverError}</p>
                )}

                <Button type="submit" className="h-11 w-full rounded-xl" loading={isSubmitting}>
                  {isSubmitting ? "Signing in…" : "Sign in"}
                </Button>
              </form>

              <div className="mt-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Demo access
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => fillDemo(account)}
                    className={cn(
                      "rounded-xl border border-neutral-200 bg-white px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-primary/5",
                      "dark:border-neutral-800 dark:bg-neutral-900",
                    )}
                  >
                    <p className="text-[12px] font-medium text-foreground">{account.label}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{account.email}</p>
                  </button>
                ))}
              </div>
            </PremiumCard>
          </ErrorShake>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> Secured session · encrypted sign-in
          </p>
        </Reveal>
      </div>
    </div>
  );
}
