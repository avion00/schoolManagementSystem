// Static, backend-ready supplements to the real account/user data.
// Fields already served by the API (name, email, org, roles, permissions, users,
// roles, permissions, audit logs) are NOT duplicated here — see lib/auth.tsx,
// lib/admin.ts, and lib/audit.ts for those. This file only covers profile/security/
// session fields the backend does not expose yet. Theme/density preferences live
// under Settings → Appearance; notification channel config under Settings → Notifications.

export interface ProfileExtras {
  phone: string;
  department: string;
  designation: string;
  timezone: string;
  language: string;
  createdDate: string;
  lastUpdated: string;
  lastLogin: string;
}

export const PROFILE_EXTRAS: ProfileExtras = {
  phone: "+977 9800000000",
  department: "Platform Administration",
  designation: "Super Administrator",
  timezone: "Asia/Kathmandu (UTC+05:45)",
  language: "English",
  createdDate: "2026-01-12",
  lastUpdated: "2026-07-01",
  lastLogin: "Today, 9:14 AM",
};

export interface SecuritySettings {
  passwordStatus: "Strong" | "Needs update" | "Weak";
  lastPasswordChange: string;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  loginAlertsEnabled: boolean;
  trustedDeviceCount: number;
  failedLoginCount: number;
}

export const SECURITY_SETTINGS: SecuritySettings = {
  passwordStatus: "Strong",
  lastPasswordChange: "2026-05-14",
  twoFactorEnabled: false,
  emailVerified: true,
  phoneVerified: false,
  loginAlertsEnabled: true,
  trustedDeviceCount: 2,
  failedLoginCount: 4,
};

export type SessionStatus = "Active" | "Expired";

export interface AccountSession {
  id: number;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  status: SessionStatus;
  isCurrent: boolean;
}

export const ACCOUNT_SESSIONS: AccountSession[] = [
  { id: 1, device: "Windows 11 · Desktop", browser: "Chrome 126",  location: "Kathmandu, Nepal", ipAddress: "103.42.11.8",   lastActive: "Just now",   status: "Active", isCurrent: true },
  { id: 2, device: "macOS · Laptop",       browser: "Safari 17",   location: "Kathmandu, Nepal", ipAddress: "103.42.11.51",  lastActive: "2h ago",     status: "Active", isCurrent: false },
  { id: 3, device: "iPhone 15",            browser: "Mobile Safari", location: "Pokhara, Nepal", ipAddress: "110.44.2.19",   lastActive: "1d ago",     status: "Active", isCurrent: false },
  { id: 4, device: "Windows 10 · Desktop", browser: "Edge 124",    location: "Biratnagar, Nepal", ipAddress: "202.51.3.77",  lastActive: "6d ago",     status: "Expired", isCurrent: false },
];
