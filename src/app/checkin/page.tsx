// src/app/checkin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { googleSheetsService } from "@/services/googleSheets.service";

interface SavedUser {
  email: string;
  code: string;
  lastUsed: string;
}

// Valid check-in locations for frontend validation
const VALID_LOCATIONS = [
  {
    name: "Head Office - Addis Ababa",
    lat: 8.997144134,
    lng: 38.77233146,
    radius: 100,
  },
  {
    name: "Branch Office - Bole",
    lat: 8.9806,
    lng: 38.7998,
    radius: 100,
  },
  {
    name: "Branch Office - Kazanchis",
    lat: 9.0117,
    lng: 38.7669,
    radius: 100,
  },
];

export default function StaffCheckinPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    message: string;
    type: string;
  } | null>(null);
  const [locationData, setLocationData] = useState<{
    lat: number | null;
    lng: number | null;
  }>({ lat: null, lng: null });
  const [geoStatus, setGeoStatus] = useState("📍 Getting location...");
  const [ipAddress, setIpAddress] = useState("");
  const [savedUsers, setSavedUsers] = useState<SavedUser[]>([]);
  const [isLocationValid, setIsLocationValid] = useState<boolean | null>(null);
  const [validLocationName, setValidLocationName] = useState<string>("");
  const [todayCheckIn, setTodayCheckIn] = useState({
    hasCheckedIn: false,
    checkInTime: null as string | null,
    hasCheckedOut: false,
    checkOutTime: null as string | null,
  });

  const STORAGE_KEY = "attendance_user_data";
  const MAX_SAVED_USERS = 3;

  useEffect(() => {
    getIP();
    getLocation();
    loadSavedCredentials();
    loadTodayCheckInStatus();
    loadTodayStatusFromServer();
  }, []);

  const getIP = async () => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      setIpAddress(data.ip);
    } catch (e) {
      setIpAddress("Unavailable");
    }
  };

  const getDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const validateLocation = (
    lat: number,
    lng: number,
  ): { isValid: boolean; locationName: string } => {
    const validLocation = VALID_LOCATIONS.find((location) => {
      const distance = getDistance(lat, lng, location.lat, location.lng);
      return distance <= location.radius;
    });

    if (validLocation) {
      return { isValid: true, locationName: validLocation.name };
    }
    return { isValid: false, locationName: "Invalid Location" };
  };

  const loadTodayStatusFromServer = async () => {
    try {
      const response = await fetch("/api/google-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getAttendanceSummary" }),
      });
      const data = await response.json();

      const currentEmail = email || localStorage.getItem("staffEmail");

      if (currentEmail && Array.isArray(data)) {
        const userStatus = data.find(
          (s: any) => s.email?.toLowerCase() === currentEmail.toLowerCase(),
        );

        if (userStatus && userStatus.status === "Present") {
          setTodayCheckIn({
            hasCheckedIn: true,
            checkInTime: userStatus.checkIn,
            hasCheckedOut: false,
            checkOutTime: null,
          });
          const today = new Date().toLocaleDateString();
          localStorage.setItem(
            `checkin_${today}`,
            JSON.stringify({
              checkInTime: userStatus.checkIn,
              hasCheckedOut: false,
              checkOutTime: null,
            }),
          );
        }
      }
    } catch (error) {
      console.error("Error loading today status:", error);
    }
  };

  const loadTodayCheckInStatus = () => {
    const today = new Date().toLocaleDateString();
    const saved = localStorage.getItem(`checkin_${today}`);
    if (saved) {
      const data = JSON.parse(saved);
      setTodayCheckIn({
        hasCheckedIn: true,
        checkInTime: data.checkInTime,
        hasCheckedOut: data.hasCheckedOut || false,
        checkOutTime: data.checkOutTime || null,
      });
    }
  };

  const saveTodayCheckIn = (checkInTime: string) => {
    const today = new Date().toLocaleDateString();
    localStorage.setItem(
      `checkin_${today}`,
      JSON.stringify({ checkInTime, hasCheckedOut: false, checkOutTime: null }),
    );
    setTodayCheckIn({
      hasCheckedIn: true,
      checkInTime,
      hasCheckedOut: false,
      checkOutTime: null,
    });
  };

  const saveTodayCheckOut = (checkOutTime: string, workingHours: number) => {
    const today = new Date().toLocaleDateString();
    const saved = localStorage.getItem(`checkin_${today}`);
    if (saved) {
      const data = JSON.parse(saved);
      data.hasCheckedOut = true;
      data.checkOutTime = checkOutTime;
      data.workingHours = workingHours;
      localStorage.setItem(`checkin_${today}`, JSON.stringify(data));
    }
    setTodayCheckIn((prev) => ({
      ...prev,
      hasCheckedOut: true,
      checkOutTime,
    }));
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("❌ Geolocation not supported");
      setIsLocationValid(false);
      return;
    }

    setGeoStatus("📍 Getting location...");
    setIsLocationValid(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocationData({ lat, lng });

        const { isValid, locationName } = validateLocation(lat, lng);
        setIsLocationValid(isValid);

        if (isValid) {
          setValidLocationName(locationName);
          setGeoStatus(`✅ Verified: ${locationName}`);
        } else {
          setValidLocationName("");
          setGeoStatus("❌ Outside allowed area");
        }
      },
      (err) => {
        let msg = "❌ Location error";
        if (err.code === 1) msg = "❌ Allow location access";
        else if (err.code === 2) msg = "❌ Position unavailable";
        else if (err.code === 3) msg = "❌ Timeout - try again";
        setGeoStatus(msg);
        setIsLocationValid(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const loadSavedCredentials = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const userData = JSON.parse(saved);
        if (Array.isArray(userData) && userData.length > 0) {
          const mostRecent = userData[0];
          if (mostRecent?.email) {
            setEmail(mostRecent.email);
            setCode(mostRecent.code);
          }
          setSavedUsers(userData);
        } else if (userData?.email) {
          setEmail(userData.email);
          setCode(userData.code);
          setSavedUsers([userData]);
        }
      }
    } catch (e) {
      console.error("Error loading saved credentials:", e);
    }
  };

  const saveCredentials = (
    email: string,
    code: string,
    remember: boolean = true,
  ) => {
    if (!remember) return;

    try {
      let savedUsers: SavedUser[] = [];
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            savedUsers = parsed;
          } else if (parsed?.email) {
            savedUsers = [parsed];
          }
        } catch {
          savedUsers = [];
        }
      }

      savedUsers = savedUsers.filter((u) => u?.email !== email);
      savedUsers.unshift({ email, code, lastUsed: new Date().toISOString() });
      if (savedUsers.length > MAX_SAVED_USERS) {
        savedUsers = savedUsers.slice(0, MAX_SAVED_USERS);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedUsers));
      setSavedUsers(savedUsers);
    } catch (e) {
      console.error("Error saving credentials:", e);
    }
  };

  const quickLogin = (userEmail: string, userCode: string) => {
    setEmail(userEmail);
    setCode(userCode);
    showStatus("Credentials loaded", "info");
  };

  const clearSavedData = () => {
    if (confirm("Clear all saved credentials?")) {
      localStorage.removeItem(STORAGE_KEY);
      setEmail("");
      setCode("");
      setSavedUsers([]);
      showStatus("Credentials cleared", "success");
    }
  };

  const handleAction = async (action: "checkin" | "checkout") => {
    if (!email || !code) {
      showStatus("Please fill all fields", "error");
      return;
    }

    if (action === "checkin") {
      if (todayCheckIn.hasCheckedIn) {
        if (todayCheckIn.hasCheckedOut) {
          showStatus("Already checked in/out today", "error");
        } else {
          showStatus("Already checked in today", "error");
        }
        return;
      }
    }

    if (action === "checkout") {
      if (!todayCheckIn.hasCheckedIn) {
        showStatus("Haven't checked in today", "error");
        return;
      }
      if (todayCheckIn.hasCheckedOut) {
        showStatus("Already checked out today", "error");
        return;
      }
    }

    if (!locationData.lat || !locationData.lng) {
      showStatus("Waiting for location...", "error");
      return;
    }

    const { isValid, locationName } = validateLocation(
      locationData.lat,
      locationData.lng,
    );
    if (!isValid) {
      showStatus("Outside allowed check-in area", "error");
      return;
    }

    setLoading(true);
    showStatus("Processing...", "info");

    try {
      const result = await googleSheetsService.processAttendance(
        email,
        code,
        locationData.lat,
        locationData.lng,
        ipAddress,
        action,
      );

      if (result.success) {
        const now = new Date();
        const staffName = email.split("@")[0];

        if (action === "checkin") {
          saveTodayCheckIn(now.toISOString());
          if (rememberMe) {
            saveCredentials(email, code, true);
          }
          await loadTodayStatusFromServer();
          showStatus(
            `✅ ${staffName} checked in at ${now.toLocaleTimeString()}`,
            "success",
          );
        } else {
          let workingHours = 0;
          if (todayCheckIn.checkInTime) {
            const checkInTime = new Date(todayCheckIn.checkInTime);
            workingHours = parseFloat(
              (
                (now.getTime() - checkInTime.getTime()) /
                (1000 * 60 * 60)
              ).toFixed(2),
            );
          }
          saveTodayCheckOut(now.toISOString(), workingHours);
          showStatus(`✅ Checked out! ${workingHours} hours worked`, "success");

          setTimeout(() => {
            setEmail("");
            setCode("");
          }, 1500);
        }
      } else {
        showStatus(result.message, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showStatus("Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (message: string, type: string) => {
    setStatus({ message, type });
    if (type === "success") {
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const isCheckInDisabled =
    loading || todayCheckIn.hasCheckedIn || isLocationValid === false;
  const isCheckOutDisabled =
    loading || !todayCheckIn.hasCheckedIn || todayCheckIn.hasCheckedOut;

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-[#02404F] to-[#036b82] flex flex-col">
      {/* Main content - centered */}
      <div className="flex-1 flex items-center justify-center p-3">
        {/* Card - Narrower width, taller height */}
        <div className="w-[300px] sm:w-[340px] md:w-[360px] bg-white rounded-2xl shadow-xl p-5">
          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="text-[#02404F] text-lg sm:text-xl font-bold flex items-center justify-center gap-2">
              <span>📋</span>
              <span>Staff Attendance</span>
            </h2>
            <p className="text-gray-500 text-xs mt-1">Enter your credentials</p>
          </div>

          {/* Today's Status */}
          {todayCheckIn.hasCheckedIn && (
            <div
              className={`mb-4 p-2 rounded-xl text-center text-xs font-medium ${
                todayCheckIn.hasCheckedOut
                  ? "bg-gray-100 text-gray-600"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {todayCheckIn.hasCheckedOut ? (
                <>
                  ✅ Checked out at{" "}
                  {new Date(todayCheckIn.checkOutTime!).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </>
              ) : (
                <>
                  🟢 Checked in at{" "}
                  {new Date(todayCheckIn.checkInTime!).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </>
              )}
            </div>
          )}

          <form onSubmit={(e) => e.preventDefault()}>
            {/* Email */}
            <div className="mb-4">
              <label className="block mb-1.5 text-[#02404F] text-xs font-semibold uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@kifiya.com"
                className="w-full p-2.5 border-2 border-gray-200 rounded-xl text-sm outline-none bg-gray-50 focus:border-[#02404F] focus:bg-white"
                required
                disabled={loading || todayCheckIn.hasCheckedOut}
              />
            </div>

            {/* Code */}
            <div className="mb-4">
              <label className="block mb-1.5 text-[#02404F] text-xs font-semibold uppercase tracking-wide">
                Personal Code
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Your secret code"
                  className="w-full p-2.5 pr-9 border-2 border-gray-200 rounded-xl text-sm outline-none bg-gray-50 focus:border-[#02404F] focus:bg-white"
                  required
                  disabled={loading || todayCheckIn.hasCheckedOut}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  <span className="text-sm">{showPassword ? "🙈" : "👁️"}</span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#EB7D23] cursor-pointer"
                disabled={loading || todayCheckIn.hasCheckedOut}
              />
              <label
                htmlFor="rememberMe"
                className="text-xs text-gray-600 cursor-pointer"
              >
                Remember me on this device
              </label>
            </div>

            {/* Quick Login Buttons */}
            {savedUsers.length > 0 && !todayCheckIn.hasCheckedOut && (
              <div className="flex gap-2 mb-4 flex-wrap">
                {savedUsers.slice(0, 3).map((user, index) => {
                  let displayName =
                    user.email.split("@")[0] || `User ${index + 1}`;
                  if (displayName.length > 12)
                    displayName = displayName.substring(0, 10) + "..";
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => quickLogin(user.email, user.code)}
                      className="flex-1 bg-gray-100 text-[#02404F] border border-gray-300 px-2 py-1.5 text-[11px] font-semibold rounded-full hover:bg-[#EB7D23] hover:text-white transition-all"
                    >
                      {displayName}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => handleAction("checkin")}
                disabled={isCheckInDisabled}
                className={`flex-1 py-2.5 text-sm font-bold rounded-full uppercase tracking-wide shadow-md transition-all ${
                  isCheckInDisabled
                    ? "bg-gray-400"
                    : "bg-[#02404F] hover:bg-[#036b82]"
                } text-white`}
              >
                {loading ? "..." : "Check In"}
              </button>
              <button
                type="button"
                onClick={() => handleAction("checkout")}
                disabled={isCheckOutDisabled}
                className="flex-1 bg-[#EB7D23] text-white py-2.5 text-sm font-bold rounded-full uppercase tracking-wide shadow-md hover:bg-[#f08c3a] transition-all disabled:bg-gray-400"
              >
                {loading ? "..." : "Check Out"}
              </button>
            </div>
          </form>

          {/* Clear Credentials */}
          {!todayCheckIn.hasCheckedOut && savedUsers.length > 0 && (
            <div className="text-center mt-3">
              <button
                onClick={clearSavedData}
                className="text-gray-400 text-[10px] hover:text-red-600 transition-colors"
              >
                Clear saved credentials
              </button>
            </div>
          )}

          {/* Status Message */}
          {status && (
            <div
              className={`mt-4 p-2 rounded-full text-center font-semibold text-xs ${
                status.type === "success"
                  ? "bg-green-100 text-green-700"
                  : status.type === "error"
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
              }`}
            >
              {status.message}
            </div>
          )}

          {/* Location Status */}
          <div
            className={`mt-3 p-2 rounded-full text-[10px] text-center flex items-center justify-center gap-1.5 ${
              isLocationValid === false
                ? "bg-red-50 text-red-600"
                : isLocationValid === true
                  ? "bg-green-50 text-green-600"
                  : "bg-gray-50 text-gray-500"
            }`}
          >
            <span>📍</span>
            <span className="truncate">{geoStatus}</span>
          </div>
        </div>
      </div>

      {/* Footer - compact */}

      <footer className="bg-gradient-to-r from-[#EB7D23] to-[#f59e4c] py-2.5 flex-shrink-0">
        <div className="flex items-center justify-center gap-2">
          <img
            src="https://kifiya.com/wp-content/uploads/2022/12/Kifiya_Full-Color.svg"
            alt="Kifiya"
            className="w-9 h-auto brightness-0 invert"
          />
          <div className="w-px h-4 bg-white/30"></div>
          <div className="text-left">
            <p className="text-white text-[9px] font-semibold">
              የኔ-ጉዞ by Kifiya
            </p>
            <p className="text-white/80 text-[7px]">
              © 2026 All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
