// src/app/checkin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { googleSheetsService } from "@/services/googleSheets.service";

interface SavedUser {
  email: string;
  code: string;
  lastUsed: string;
}

// Valid check-in locations for frontend validation (optional - backend will also validate)
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
    loadTodayStatusFromServer(); // Add this to check server status
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

  // Fixed: Load today's status from server
  const loadTodayStatusFromServer = async () => {
    try {
      const response = await fetch("/api/google-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getAttendanceSummary" }),
      });
      const data = await response.json();

      // Get current user email (from input or localStorage)
      const currentEmail = email || localStorage.getItem("staffEmail");

      if (currentEmail) {
        const userStatus = data.find(
          (s: any) => s.email?.toLowerCase() === currentEmail.toLowerCase(),
        );

        if (userStatus && userStatus.status === "Present") {
          // Update todayCheckIn state based on server data
          setTodayCheckIn({
            hasCheckedIn: true,
            checkInTime: userStatus.checkIn,
            hasCheckedOut: false,
            checkOutTime: null,
          });
          // Also save to localStorage for consistency
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
      console.error("Error loading today status from server:", error);
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
          setGeoStatus(`✅ Location verified: ${locationName}`);
        } else {
          setValidLocationName("");
          setGeoStatus("❌ You are outside the allowed check-in area");
        }
      },
      (err) => {
        let msg = "❌ Location error";
        if (err.code === 1)
          msg = "❌ Permission denied - Please enable location access";
        else if (err.code === 2) msg = "❌ Position unavailable";
        else if (err.code === 3) msg = "❌ Location timeout - Please try again";
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
    showStatus("Credentials loaded. Click Check In or Check Out.", "info");
  };

  const clearSavedData = () => {
    if (confirm("Are you sure you want to clear all saved credentials?")) {
      localStorage.removeItem(STORAGE_KEY);
      setEmail("");
      setCode("");
      setSavedUsers([]);
      showStatus("Saved credentials cleared", "success");
    }
  };

  const handleAction = async (action: "checkin" | "checkout") => {
    // Validate inputs
    if (!email || !code) {
      showStatus("Please fill all fields.", "error");
      return;
    }

    // Check today's status (frontend validation for better UX)
    if (action === "checkin") {
      if (todayCheckIn.hasCheckedIn) {
        if (todayCheckIn.hasCheckedOut) {
          showStatus(
            "❌ You have already checked in and out today. You can only check in once per day.",
            "error",
          );
        } else {
          showStatus(
            "❌ You are already checked in today. Please check out before leaving.",
            "error",
          );
        }
        return;
      }
    }

    if (action === "checkout") {
      if (!todayCheckIn.hasCheckedIn) {
        showStatus(
          "❌ You haven't checked in today. Please check in first.",
          "error",
        );
        return;
      }
      if (todayCheckIn.hasCheckedOut) {
        showStatus("❌ You have already checked out today.", "error");
        return;
      }
    }

    // Frontend location validation (optional - backend will also validate)
    if (!locationData.lat || !locationData.lng) {
      showStatus("Please wait for location detection...", "error");
      return;
    }

    const { isValid, locationName } = validateLocation(
      locationData.lat,
      locationData.lng,
    );
    if (!isValid) {
      showStatus(
        "❌ You are outside the allowed check-in area. Please move to a valid location.",
        "error",
      );
      return;
    }

    setLoading(true);
    showStatus("Processing...", "info");

    try {
      // Call Google Sheets backend for validation and storage
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
          // Reload server status after check-in
          await loadTodayStatusFromServer();
          showStatus(
            `✅ Check-in successful! ${staffName} checked in at ${now.toLocaleTimeString()} from ${locationName}`,
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
          showStatus(
            `✅ Check-out successful! You worked ${workingHours} hours today.`,
            "success",
          );

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
      showStatus("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (message: string, type: string) => {
    setStatus({ message, type });
    if (type === "success") {
      setTimeout(() => setStatus(null), 4000);
    }
  };

  const isCheckInDisabled =
    loading || todayCheckIn.hasCheckedIn || isLocationValid === false;
  const isCheckOutDisabled =
    loading || !todayCheckIn.hasCheckedIn || todayCheckIn.hasCheckedOut;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#02404F] to-[#036b82]">
      <div className="flex-1 flex flex-col items-center justify-center p-5">
        <div className="max-w-[420px] w-full bg-white rounded-[28px] p-[30px_25px] shadow-2xl">
          <h2 className="text-center text-[#02404F] text-3xl font-bold mb-2.5 flex items-center justify-center gap-2.5">
            📋 Staff Attendance
          </h2>
          <p className="text-center text-gray-600 mb-6 text-[15px] leading-relaxed">
            Enter your credentials. We'll verify your location.
          </p>

          {/* Today's Status Display */}
          {todayCheckIn.hasCheckedIn && (
            <div
              className={`mb-4 p-3 rounded-xl text-center ${todayCheckIn.hasCheckedOut ? "bg-gray-100" : "bg-green-50"}`}
            >
              <p
                className={`text-sm font-medium ${todayCheckIn.hasCheckedOut ? "text-gray-600" : "text-green-700"}`}
              >
                {todayCheckIn.hasCheckedOut ? (
                  <>
                    ✅ Today's attendance complete. Checked out at{" "}
                    {new Date(todayCheckIn.checkOutTime!).toLocaleTimeString()}
                  </>
                ) : (
                  <>
                    🟢 Checked in at{" "}
                    {new Date(todayCheckIn.checkInTime!).toLocaleTimeString()}
                  </>
                )}
              </p>
            </div>
          )}

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-5">
              <label className="font-semibold block mb-2 text-[#02404F] text-sm uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@kifiya.com"
                className="w-full p-4 border-2 border-gray-200 rounded-2xl text-base outline-none bg-gray-50 focus:border-[#02404F] focus:bg-white"
                required
                disabled={loading || todayCheckIn.hasCheckedOut}
              />
            </div>

            <div className="mb-5">
              <label className="font-semibold block mb-2 text-[#02404F] text-sm uppercase tracking-wide">
                Personal Code
              </label>
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Your secret code"
                  className="w-full p-4 pr-12 border-2 border-gray-200 rounded-2xl text-base outline-none bg-gray-50 focus:border-[#02404F] focus:bg-white"
                  required
                  disabled={loading || todayCheckIn.hasCheckedOut}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-[#02404F]"
                >
                  {showPassword ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5 my-4">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-[18px] h-[18px] accent-[#EB7D23] cursor-pointer"
                disabled={loading || todayCheckIn.hasCheckedOut}
              />
              <label
                htmlFor="rememberMe"
                className="text-sm font-normal text-gray-600 cursor-pointer"
              >
                Remember me on this device
              </label>
            </div>

            {/* Quick Login Buttons */}
            {savedUsers.length > 0 && !todayCheckIn.hasCheckedOut && (
              <div className="flex gap-2.5 mt-2.5 mb-2.5 flex-wrap">
                {savedUsers.map((user, index) => {
                  let displayName =
                    user.email.split("@")[0] || `User ${index + 1}`;
                  if (displayName.length > 12)
                    displayName = displayName.substring(0, 10) + "..";
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => quickLogin(user.email, user.code)}
                      className="flex-1 min-w-[80px] bg-gray-100 text-[#02404F] border border-gray-300 px-3 py-2.5 text-[13px] font-semibold rounded-[30px] cursor-pointer transition-all hover:bg-[#EB7D23] hover:text-white"
                    >
                      {displayName}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex gap-4 mt-6 flex-col sm:flex-row">
              <button
                type="button"
                onClick={() => handleAction("checkin")}
                disabled={isCheckInDisabled}
                className={`flex-1 py-4 px-5 text-base font-bold rounded-[30px] cursor-pointer transition-all uppercase tracking-wide shadow-md hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-70 ${
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
                className="flex-1 bg-[#EB7D23] text-white py-4 px-5 text-base font-bold rounded-[30px] cursor-pointer transition-all uppercase tracking-wide shadow-md hover:bg-[#f08c3a] hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "..." : "Check Out"}
              </button>
            </div>
          </form>

          {!todayCheckIn.hasCheckedOut && (
            <div className="text-center mt-4">
              <button
                onClick={clearSavedData}
                className="bg-transparent text-gray-400 border border-gray-200 px-3 py-2 text-xs rounded-[30px] cursor-pointer transition-all hover:bg-red-100 hover:text-red-700"
              >
                Clear saved credentials
              </button>
            </div>
          )}

          {status && (
            <div
              className={`mt-5 p-4 rounded-[30px] text-center font-semibold text-sm ${
                status.type === "success"
                  ? "bg-green-100 text-green-800"
                  : status.type === "error"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
              }`}
            >
              {status.message}
            </div>
          )}

          <div
            className={`text-xs text-center mt-5 p-2.5 rounded-[30px] flex items-center justify-center gap-2 ${
              isLocationValid === false
                ? "bg-red-50 text-red-600"
                : isLocationValid === true
                  ? "bg-green-50 text-green-600"
                  : "bg-gray-50 text-gray-500"
            }`}
          >
            <i className="not-italic animate-pulse">📍</i> {geoStatus}
          </div>
        </div>
      </div>

      <footer className="w-full bg-gradient-to-r from-[#EB7D23] to-[#f59e4c] py-4 px-5 flex-shrink-0">
        <div className="max-w-[420px] mx-auto flex items-center justify-center gap-5">
          <img
            src="https://kifiya.com/wp-content/uploads/2022/12/Kifiya_Full-Color.svg"
            alt="Kifiya"
            className="max-w-[90px] h-auto brightness-0 invert"
          />
          <div className="w-px h-[35px] bg-gradient-to-b from-transparent via-white to-transparent"></div>
          <div className="text-left">
            <p className="text-white text-sm font-semibold">የኔ-ጉዞ by Kifiya</p>
            <small className="text-white/90 text-[11px] block">
              &copy; 2026 All rights reserved
            </small>
          </div>
        </div>
      </footer>
    </div>
  );
}
