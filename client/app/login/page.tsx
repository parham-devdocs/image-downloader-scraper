"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "../axios";
import { loginSchema } from "../validators";
import { LoginResponse } from "@/types";

type LoginErrors = {
  username?: string[];
  password?: string[];
  general?: string;
};

const LoginPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    // optional: clear field error on typing
    setErrors((prev) => ({
      ...prev,
      [e.target.name]: undefined,
      general: undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const validatedFields = loginSchema.safeParse(formData);

    if (!validatedFields.success) {
      setErrors(validatedFields.error.flatten().fieldErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.post<LoginResponse>("/auth/login", formData);
localStorage.setItem("user",JSON.stringify(response.data.user))
      console.log(response.data);
// ✅ Correct way to store an object

      router.push("/");
    } catch (error: any) {
      console.log(error.response?.data?.message);

      setErrors({
        general: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-violet-100 to-white">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 border border-violet-100">
        <h2 className="text-3xl font-semibold text-violet-600 text-center mb-1">
          Welcome Back
        </h2>

        <p className="text-slate-500 text-center text-sm mb-7">
          Log in to your account
        </p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Username
            </label>
            <input
              name="username"
              type="text"
              autoComplete="username"
              placeholder="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>
            )}
          </div>

          {errors.general && (
            <p className="text-red-500 text-sm text-center">
              {errors.general}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 active:scale-[0.98] transition shadow-lg shadow-violet-600/30 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-slate-500 text-sm text-center mt-6">
          Don't have an account?
          <Link
            href="/register"
            className="text-violet-600 hover:text-violet-700 ml-1 font-medium"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
