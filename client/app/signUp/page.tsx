"use client"

import Link from "next/link";
import { registerUser } from "../actions/auth";
import { useActionState, useEffect } from "react";
import { RegisterState } from "@/types";
import { useRouter } from "next/navigation";

const initialState: RegisterState = {
  success: false
};

const Page = () => {
  const router = useRouter();
  const [state, formAction] = useActionState(registerUser, initialState);

  useEffect(() => {
    if (state.success) {
      router.push("/");
    }
  }, [state.success, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-violet-100 to-white">

      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 border border-violet-100">

        <h2 className="text-3xl font-semibold text-violet-600 text-center mb-1">
          Create Account
        </h2>

        <p className="text-slate-500 text-center text-sm mb-7">
          Welcome to Chat App
        </p>

        <form className="space-y-5" action={formAction}>

          {/* Email */}
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Email
            </label>

            <input
              name="email"
              type="email"
              autoComplete="off"
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200
              focus:outline-none focus:ring-2 focus:ring-violet-500
              focus:border-violet-500 transition"
            />

            {state.error?.email && (
              <p className="text-red-500 text-sm mt-1">{state.error.email}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Username
            </label>

            <input
              name="username"
              type="text"
              autoComplete="off"
              placeholder="username"
              className="w-full px-4 py-3 rounded-xl border border-slate-200
              focus:outline-none focus:ring-2 focus:ring-violet-500
              focus:border-violet-500 transition"
            />

            {state.error?.username && (
              <p className="text-red-500 text-sm mt-1">{state.error.username}</p>
            )}
          </div>

          {/* User ID */}
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              User ID
            </label>

            <input
              name="userId"
              type="text"
              placeholder="your id"
              className="w-full px-4 py-3 rounded-xl border border-slate-200
              focus:outline-none focus:ring-2 focus:ring-violet-500
              focus:border-violet-500 transition"
            />

            {state.error?.userId && (
              <p className="text-red-500 text-sm mt-1">{state.error.userId}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Password
            </label>

            <input
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-200
              focus:outline-none focus:ring-2 focus:ring-violet-500
              focus:border-violet-500 transition"
            />

            {state.error?.password && (
              <p className="text-red-500 text-sm mt-1">{state.error.password}</p>
            )}
          </div>

          {/* General error */}
          {state.error?.general && (
            <p className="text-red-500 text-sm text-center">
              {state.error.general}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-violet-600 text-white
            font-medium hover:bg-violet-700 active:scale-[0.98]
            transition shadow-lg shadow-violet-600/30"
          >
            Sign Up
          </button>

        </form>

        <p className="text-slate-500 text-sm text-center mt-6">
          Already have an account?
          <Link
            href="/login"
            className="text-violet-600 hover:text-violet-700 ml-1 font-medium"
          >
            Login
          </Link>
        </p>

      </div>

    </div>
  );
};

export default Page;
