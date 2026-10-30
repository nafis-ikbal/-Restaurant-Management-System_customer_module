"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import { logIn, signUp } from "@/app/auth/actions";

export default function AuthForm({ signup = false }) {
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const submit = (event) => {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      const result = signup ? await signUp(form) : await logIn(form);
      if (result && !result.ok) setError(result.error);
    });
  };

  return (
    <main className="bg-[#fafafa] px-4 py-10">
      <div
        className={`mx-auto w-full max-w-105 rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,.07)] sm:p-8`}
      >
        <div className="text-center">
          <div className="text-[24px] font-extrabold text-[#a73a05]">
            Tawa &amp; Taste
          </div>
          <p className="mt-2 text-sm text-[#58423a]">
            Elevated Dining. Delivered to Your Doorstep.
          </p>
        </div>

        {/* login & sign up button */}
        <div className="mt-8 grid grid-cols-2 border-b border-[#eee]">
          <Link
            href="/login"
            className={`border-b-2 py-3 text-center text-sm font-semibold ${!signup ? "border-[#ff7a45] text-[#a73a05]" : "border-transparent text-[#6b7280]"}`}
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className={`border-b-2 py-3 text-center text-sm font-semibold ${signup ? "border-[#ff7a45] text-[#a73a05]" : "border-transparent text-[#6b7280]"}`}
          >
            Sign Up
          </Link>
        </div>

        {/* login, sign up form */}
        <form className="mt-8 space-y-4" onSubmit={submit}>
          {signup && (
            <Field
              label="Full Name"
              placeholder="Your full name"
              value={form.fullName}
              onChange={updateField("fullName")}
            />
          )}

          <Field
            label="Email Address"
            placeholder="e.g. chef@tawa.com"
            type="email"
            value={form.email}
            onChange={updateField("email")}
          />

          <Field
            label="Phone Number"
            placeholder="+1 (555) 000-0000"
            hidden={!signup}
            value={form.phone}
            onChange={updateField("phone")}
          />

          <div>
            <div className="flex justify-between text-sm font-medium">
              <label>Password</label>
              {!signup && (
                <span className="text-[#6b7280]">Forgot password?</span>
              )}
            </div>

            <div className="mt-2 flex h-11 items-center rounded-lg border border-[#dfe3e8] px-3">
              <input
                className="min-w-0 flex-1 outline-none"
                type={show ? "text" : "password"}
                placeholder={signup ? "Create Password" : "••••••••"}
                value={form.password}
                onChange={updateField("password")}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="text-[#6b7280]"
                aria-label={show ? "Hide password" : "Show password"}
                title={show ? "Hide password" : "Show password"}
              >
                {show ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
              </button>
            </div>
          </div>

          {signup && (
            <div>
              <div className="flex justify-between text-sm font-medium">
                <label>Confirm Password</label>
              </div>

              <div className="mt-2 flex h-11 items-center rounded-lg border border-[#dfe3e8] px-3">
                <input
                  className="min-w-0 flex-1 outline-none"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm password"
                  value={form.confirmPassword}
                  onChange={updateField("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="text-[#6b7280]"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  title={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-[#fde9ea] p-4 text-sm leading-5 text-[#a73a05]" role="alert">
              {error}
            </div>
          )}


          {/* form submit button for login & sign up */}
          {signup ? (
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-[#ff7a45] py-3 font-semibold text-white disabled:opacity-60"
            >
              {isPending ? "Creating Account..." : "Create Account"}
            </button>
          ) : (
            <button
              type="submit"
              disabled={isPending}
              className="block w-full rounded-lg bg-[#ff7a45] py-3 text-center font-semibold text-white disabled:opacity-60"
            >
              {isPending ? "Logging In..." : "Log In"}
            </button>
          )}


          {!signup && (
            <p className="pt-2 text-center text-sm text-[#6b7280]">
              Don't have an account?{" "}
              <Link href="/signup" className="font-semibold text-[#a73a05]">
                Sign up
              </Link>
            </p>
          )}
        </form>
      </div>
    </main>
  );
}


// input field with label
function Field({
  label,
  placeholder,
  type = "text",
  hidden = false,
  value,
  onChange,
}) {
  if (hidden) return null;

  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="mt-2 h-11 w-full rounded-lg border border-[#dfe3e8] px-3 outline-none focus:border-[#ff7a45]"
      />
    </div>
  );
}
