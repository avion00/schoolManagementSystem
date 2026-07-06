import { useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { KeyRound, Loader2, Plus, Search, Settings2, X } from "lucide-react";
import { toast } from "sonner";

import { SuccessCheck } from "@/components/motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type AdminUser,
  activateUser,
  assignRole,
  createUser,
  deactivateUser,
  listRoles,
  listUsers,
  resetUserPassword,
} from "@/lib/admin";

const PAGE_SIZE = 25;
const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length ? (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase() : "U";
}

export function UsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [managing, setManaging] = useState<AdminUser | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["users", search, page],
    queryFn: () => listUsers({ search: search || undefined, page }),
    placeholderData: keepPreviousData,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.count / PAGE_SIZE)) : 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data ? `${data.count} user accounts` : "Loading…"}
        </p>
        <Button onClick={() => setCreating(true)} size="sm">
          <Plus className="h-4 w-4" />
          New user
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9 pr-9"
          placeholder="Search by email or name…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setPage(1);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              [0, 1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell>
                </TableRow>
              ))}
            {data?.results.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{initialsOf(u.full_name || u.email)}</AvatarFallback>
                    </Avatar>
                    <div className="leading-tight">
                      <p className="text-sm font-medium">{u.full_name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {u.roles.length ? (
                      u.roles.map((r) => <Badge key={r}>{r}</Badge>)
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={u.is_active ? "success" : "secondary"}>
                    {u.is_active ? "active" : "inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => setManaging(u)}>
                    <Settings2 className="h-4 w-4" />
                    Manage
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {data && data.count > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-end gap-2">
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}

      <CreateUserDialog open={creating} onOpenChange={setCreating} />
      {managing && <ManageUserDialog user={managing} onClose={() => setManaging(null)} />}
    </div>
  );
}

function CreateUserDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ email: "", full_name: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: () => createUser(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDone(true);
      window.setTimeout(() => {
        toast.success("User created");
        onOpenChange(false);
        setDone(false);
        setForm({ email: "", full_name: "", password: "" });
      }, 1100);
    },
    onError: (err) =>
      setError(isAxiosError(err) && err.response ? JSON.stringify(err.response.data) : "Failed to create user."),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {done ? (
          <div className="grid place-items-center py-10">
            <SuccessCheck label="User created" />
          </div>
        ) : (
        <>
        <DialogHeader>
          <DialogTitle>New user</DialogTitle>
          <DialogDescription>Creates a login in your organization. Assign a role after creating.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            mutation.mutate();
          }}
        >
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Temporary password</Label>
            <Input type="text" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
          </div>
          {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!form.email || !form.password || mutation.isPending}>
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
        </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ManageUserDialog({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const queryClient = useQueryClient();
  const roles = useQuery({ queryKey: ["roles"], queryFn: listRoles });
  const [roleId, setRoleId] = useState("");
  const [tempPw, setTempPw] = useState<string | null>(null);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["users"] });

  const assign = useMutation({
    mutationFn: () => assignRole(user.id, roleId),
    onSuccess: () => { invalidate(); toast.success("Role assigned"); onClose(); },
    onError: () => toast.error("Could not assign role"),
  });
  const reset = useMutation({
    mutationFn: () => resetUserPassword(user.id),
    onSuccess: (d) => { setTempPw(d.temporary_password); toast.success("Password reset"); },
  });
  const toggle = useMutation({
    mutationFn: () => (user.is_active ? deactivateUser(user.id) : activateUser(user.id)),
    onSuccess: () => { invalidate(); toast.success(user.is_active ? "User deactivated" : "User activated"); onClose(); },
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user.email}</DialogTitle>
          <DialogDescription>Roles: {user.roles.join(", ") || "none"}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Assign a role</Label>
            <div className="flex gap-2">
              <select className={selectClass} value={roleId} onChange={(e) => setRoleId(e.target.value)}>
                <option value="">Select role…</option>
                {roles.data?.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <Button disabled={!roleId || assign.isPending} onClick={() => assign.mutate()}>Assign</Button>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => reset.mutate()} disabled={reset.isPending}>
              <KeyRound className="h-4 w-4" />
              Reset password
            </Button>
            <Button
              variant={user.is_active ? "destructive" : "default"}
              onClick={() => toggle.mutate()}
              disabled={toggle.isPending}
            >
              {user.is_active ? "Deactivate" : "Activate"}
            </Button>
          </div>

          {tempPw && (
            <p className="rounded-md bg-muted px-3 py-2 text-sm">
              Temporary password: <span className="font-mono font-semibold">{tempPw}</span>
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
