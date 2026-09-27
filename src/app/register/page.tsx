"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser, RegisterState } from "@/app/actions/auth";

const initialState: RegisterState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? "Creating account…" : "Create account"}
    </button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useFormState(registerUser, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.push("/login");
    }
  }, [state.success, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-card bg-primary text-primary-fg font-semibold">
            T
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Join your team</h1>
          <p className="mt-1 text-sm text-ink-muted">
            You'll need the invite code your team lead shared.
          </p>
        </div>

        <form action={formAction} className="card space-y-4 p-6">
          {state.error && (
            <p className="rounded-card bg-danger-light px-3 py-2 text-sm text-danger">
              {state.error}
            </p>
          )}
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink">
              Full name
            </label>
            <input id="name" name="name" type="text" required className="input-field" />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
              Email
            </label>
            <input id="email" name="email" type="email" required className="input-field" />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="inviteCode" className="mb-1 block text-sm font-medium text-ink">
              Team invite code
            </label>
            <input
              id="inviteCode"
              name="inviteCode"
              type="text"
              required
              className="input-field"
            />
          </div>
          <SubmitButton />
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-primary-ink hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
