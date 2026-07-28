// Mock authentication for Hermes prototype.
// Real auth will be wired up by Codex later.

import type { ProjectId } from "./hermes-data";

export type Role = "admin" | "creator";

export type HermesUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  password: string; // mock only
  active: boolean;
  projects: ProjectId[] | "all";
  lastLogin?: string;
  avatarInitials: string;
};

export const demoUsers: HermesUser[] = [
  {
    id: "u_mike",
    name: "Mike Reyes",
    email: "mike@hermes.demo",
    role: "admin",
    password: "admin",
    active: true,
    projects: "all",
    lastLogin: "Today · 08:14",
    avatarInitials: "MR",
  },
  {
    id: "u_sara",
    name: "Sara Vinci",
    email: "sara@hermes.demo",
    role: "admin",
    password: "admin",
    active: true,
    projects: "all",
    lastLogin: "Yesterday · 18:42",
    avatarInitials: "SV",
  },
  {
    id: "u_anna",
    name: "Anna R.",
    email: "anna@hermes.demo",
    role: "creator",
    password: "creator",
    active: true,
    projects: ["hartley", "flottahub"],
    lastLogin: "Today · 09:22",
    avatarInitials: "AR",
  },
  {
    id: "u_tom",
    name: "Tom H.",
    email: "tom@hermes.demo",
    role: "creator",
    password: "creator",
    active: true,
    projects: ["apex"],
    lastLogin: "Today · 07:03",
    avatarInitials: "TH",
  },
  {
    id: "u_marco",
    name: "Marco G.",
    email: "marco@hermes.demo",
    role: "creator",
    password: "creator",
    active: true,
    projects: ["flottahub"],
    lastLogin: "2 days ago",
    avatarInitials: "MG",
  },
  {
    id: "u_liv",
    name: "Liv D.",
    email: "liv@hermes.demo",
    role: "creator",
    password: "creator",
    active: false,
    projects: ["hartley"],
    lastLogin: "3 weeks ago",
    avatarInitials: "LD",
  },
];

export function findUserByEmail(email: string) {
  return demoUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export const SESSION_KEY = "hermes.session.v1";
