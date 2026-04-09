// src/app/admin/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "../../../../public/images/tata.png";
import {
  FiMail,
  FiLock,
  FiLogIn,
  FiEye,
  FiEyeOff,
  FiShield,
  FiAlertCircle,
  FiCheckCircle,
  FiMapPin,
  FiTruck, // Using FiTruck instead of FiBus (available in react-icons/fi)
  FiNavigation,
  FiCompass,
} from "react-icons/fi";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError("");

    await new Promise((resolve) => setTimeout(resolve, 800));

    if (email === "admin@kifiya.com" && password === "Admin@2026") {
      const token = "admin_token_" + Date.now();

      localStorage.setItem("adminToken", token);
      localStorage.setItem(
        "adminUser",
        JSON.stringify({
          email,
          name: "Administrator",
          role: "admin",
        }),
      );

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `adminToken=${token}; expires=${expires.toUTCString()}; path=/`;

      setShowSuccess(true);
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 1000);
    } else {
      setError(
        "Invalid admin credentials. Demo: admin@kifiya.com / Admin@2026",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#02404F] via-[#035b6e] to-[#02404F] p-4">
      {/* Transportation Pattern Background */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-10 left-10">
          <FiTruck className="w-16 h-16 text-white" />
        </div>
        <div className="absolute bottom-20 right-20">
          <FiNavigation className="w-24 h-24 text-white" />
        </div>
        <div className="absolute top-1/3 right-1/4">
          <FiCompass className="w-12 h-12 text-white" />
        </div>
        <div className="absolute bottom-1/3 left-1/4">
          <FiMapPin className="w-20 h-20 text-white" />
        </div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#EB7D23]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#EB7D23]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#EB7D23]/[0.03] rounded-full blur-3xl"></div>
      </div>

      {/* Login Card - Centered */}
      <div className="max-w-md w-full relative z-10">
        {/* Header Section with Kifiya Branding */}
        <div className="text-center animate-fade-down">
          <div className="inline-flex items-center justify-center mb-2">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
              <FiTruck className="w-6 h-6 text-[#EB7D23]" />
              <span className="text-white font-bold text-lg tracking-wide">
                የኔ-ጉዞ
              </span>
              <span className="text-white/50 text-sm">by</span>
              <span className="text-[#EB7D23] font-bold text-lg">Kifiya</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Admin Portal
          </h1>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 animate-fade-up relative">
          {/* Icon Header */}
          <div className="text-center mb-6 mt-2">
            <div className="w-24 h-24 bg-gradient-to-br from-[#02404F] to-[#035b6e] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg overflow-hidden">
              <img
                src="/images/tata.png"
                alt="Tata Motors"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Welcome Back
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Please enter your credentials
            </p>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 animate-fade-in">
              <FiCheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-700 text-sm font-medium">
                Login successful! Redirecting...
              </span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 animate-shake">
                <FiAlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#EB7D23] transition-colors">
                  <FiMail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kifiya.com"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EB7D23] focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#EB7D23] transition-colors">
                  <FiLock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EB7D23] focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <FiEyeOff className="w-5 h-5" />
                  ) : (
                    <FiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#EB7D23] rounded border-gray-300 focus:ring-[#EB7D23] focus:ring-offset-0"
                  disabled={loading}
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                  Remember me
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#EB7D23] to-[#f59e4c] hover:from-[#d96d1a] hover:to-[#EB7D23] text-white font-semibold py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <FiLogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Kifiya Transportation Company Info */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <FiNavigation className="w-3 h-3" />
              <span>የኔ-ጉዞ Staff's Attendance System</span>
              <FiCompass className="w-3 h-3" />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400 mt-2">
              © 2026 የኔ-ጉዞ by Kifiya. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fade-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }

        .animate-fade-down {
          animation: fade-down 0.5s ease-out;
        }
        .animate-fade-up {
          animation: fade-up 0.5s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-shake {
          animation: shake 0.3s ease-out;
        }
        .animate-pulse {
          animation: pulse 4s ease-in-out infinite;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
