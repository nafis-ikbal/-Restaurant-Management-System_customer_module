"use server";

import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { revokeCurrentSession, setSessionCookie } from "@/lib/auth";

const normalizeEmail = (value) =>
  z.preprocess(
    (input) => (typeof input === "string" ? input.trim().toLowerCase() : input),
    z.email("Please enter a valid email address.")
  );

const signUpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Please enter your full name.")
      .max(100, "Full name cannot exceed 100 characters."),
    email: normalizeEmail("Please enter a valid email address."),
    phone: z
      .string("Please enter your phone number.")
      .trim()
      .min(7, "Please enter your phone number.")
      .max(30, "Phone number is too long.")
      .refine((value) => /^[+()\d][\d\s().-]{6,}$/.test(value), {
        message: "Please enter a valid phone number.",
      }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(72, "Password cannot exceed 72 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const logInSchema = z.object({
  email: normalizeEmail("Please enter a valid email address."),
  password: z.string().min(1, "Please enter your password."),
});

const firstIssue = (error) =>
  error.issues[0]?.message ?? "Please check your details and try again.";

const customerRole = () =>
  db.orm.public.Role.where({ name: "CUSTOMER" }).first();

export async function signUp(payload) {
  const parsed = signUpSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const { fullName, email, phone, password } = parsed.data;

  try {
    const existingUser = await db.orm.public.User.where({ email }).first();
    if (existingUser) {
      return { ok: false, error: "An account with this email already exists." };
    }

    const role = await customerRole();
    if (!role) {
      return { ok: false, error: "Customer registration is temporarily unavailable." };
    }

    const user = await db.orm.public.User.create({
      id: crypto.randomUUID(),
      fullName,
      email,
      phone,
      passwordHash: await bcrypt.hash(password, 12),
      approvalStatus: "APPROVED",
      accountStatus: "ACTIVE",
    });

    await db.orm.public.UserRole.create({
      userId: user.id,
      roleId: role.id,
    });
  } catch {
    return { ok: false, error: "We couldn't create your account right now. Please try again." };
  }

  redirect("/login");
}

export async function logIn(payload) {
  const parsed = logInSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const { email, password } = parsed.data;

  try {
    const user = await db.orm.public.User.where({ email }).first();

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return { ok: false, error: "Invalid email or password." };
    }
    if (user.approvalStatus !== "APPROVED") {
      return { ok: false, error: "This account has not been approved yet." };
    }
    if (user.accountStatus !== "ACTIVE") {
      return { ok: false, error: "This account is inactive or disabled." };
    }

    const role = await customerRole();
    const assignments = role
      ? await db.orm.public.UserRole.where({ userId: user.id }).all()
      : [];
    if (!role || !assignments.some((assignment) => assignment.roleId === role.id)) {
      return { ok: false, error: "This account cannot access the customer area." };
    }

    await setSessionCookie(user.id);
  } catch {
    return { ok: false, error: "We couldn't log you in right now. Please try again." };
  }

  redirect("/home");
}

export async function logOut() {
  await revokeCurrentSession();
  return { ok: true, message: "You have been logged out." };
}