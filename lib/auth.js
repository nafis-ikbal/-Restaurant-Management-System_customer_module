import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "tawa_session";

const hashSessionToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const customerRoleId = async () => {
  const role = await db.orm.public.Role.where({ name: "CUSTOMER" }).first();
  return role?.id ?? null;
};

export async function getCurrentCustomer() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.orm.public.AuthSession.where({
    sessionTokenHash: hashSessionToken(token),
  }).first();
  if (!session || session.revokedAt) return null;
  if (new Date(String(session.expiresAt)).getTime() <= Date.now()) return null;

  const customerRole = await customerRoleId();
  if (!customerRole) return null;

  const assignments = await db.orm.public.UserRole.where({ userId: session.userId }).all();
  if (!assignments.some((assignment) => assignment.roleId === customerRole)) return null;

  const user = await db.orm.public.User.where({ id: session.userId }).first();
  if (!user || user.approvalStatus !== "APPROVED" || user.accountStatus !== "ACTIVE") {
    return null;
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    approvalStatus: user.approvalStatus,
    accountStatus: user.accountStatus,
  };
}

export async function requireCustomer() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login");
  return customer;
}

export async function setSessionCookie(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  await db.orm.public.AuthSession.create({
    id: crypto.randomUUID(),
    userId,
    sessionTokenHash: hashSessionToken(token),
    expiresAt: expiresAt.toISOString(),
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function revokeCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    const session = await db.orm.public.AuthSession.where({
      sessionTokenHash: hashSessionToken(token),
    }).first();
    if (session && !session.revokedAt) {
      await db.orm.public.AuthSession.where({ id: session.id }).update({
        revokedAt: new Date().toISOString(),
      });
    }
  }

  cookieStore.delete(SESSION_COOKIE);
}