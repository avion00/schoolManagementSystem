import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, Eye, EyeOff, Shield, Clapperboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/hermes/AuthProvider";
import { PROTOTYPE_MODE } from "@/lib/hermes-prototype";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Hermes" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { user, login, loginAs, hydrated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && user) {
      navigate({ to: user.role === "admin" ? "/" : "/my-work", replace: true });
    }
  }, [hydrated, user, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = login(email, password, remember);
    if (!res.ok) {
      setError(res.reason === "disabled"
        ? "This account is disabled. Ask your administrator to re-activate it."
        : "Email or password is incorrect.");
    }
  };

  return (
    <div className="min-h-screen w-full gradient-navy flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        <div className="text-sidebar-foreground max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="grid h-11 w-11 place-items-center rounded-lg gradient-ember">
              <Activity className="h-6 w-6 text-navy" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display font-bold text-2xl leading-none">Hermes</div>
              <div className="text-xs text-sidebar-foreground/60 mt-1">Organic Growth Intelligence</div>
            </div>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">
            Find viral patterns.<br />
            Produce originals.<br />
            <span className="text-ember">Grow without ads.</span>
          </h1>
          <p className="mt-4 text-sidebar-foreground/70 text-sm leading-relaxed">
            A daily operations platform for the humans behind the content. Sign in to your workspace to continue.
          </p>
          <div className="mt-6 text-[11px] text-sidebar-foreground/50">
            Prototype build · mock authentication only
          </div>
        </div>

        <Card className="card-elevated">
          <CardContent className="p-6 md:p-8">
            <div className="mb-5">
              <h2 className="font-display text-xl font-bold">Sign in</h2>
              <p className="text-sm text-muted-foreground mt-1">Use your Hermes email and password.</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoFocus />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pw" className="text-xs">Password</Label>
                <div className="relative">
                  <Input id="pw" type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} /> Remember me
                </label>
                <button type="button" onClick={() => setError("Password reset is not enabled in the prototype. Ask an administrator.")} className="text-xs text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
              {error && (
                <div className="rounded-md bg-rose/10 border border-rose/30 text-rose text-sm p-2.5">{error}</div>
              )}
              <Button type="submit" className="w-full gap-2 bg-ember text-navy hover:bg-ember/90 font-semibold">Sign in</Button>
            </form>

            {PROTOTYPE_MODE && (
              <div className="mt-6 pt-5 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-ember/15 text-ember border border-ember/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                    <Shield className="h-3 w-3" /> Prototype
                  </span>
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Demo logins — not for production</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => loginAs("u_mike")}>
                    <Shield className="h-3.5 w-3.5" /> Demo: Administrator
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => loginAs("u_anna")}>
                    <Clapperboard className="h-3.5 w-3.5" /> Demo: Creator
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  Admin: <code>mike@hermes.demo</code> / <code>admin</code> · Creator: <code>anna@hermes.demo</code> / <code>creator</code>
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-1.5">
                  These bypass buttons and the in-app role switcher are hidden in production builds.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
