export interface UserData {
  access_token: string;
  refresh_token?: string;
  email: string;
  name: string;
  role: "admin" | "super_admin";
}

// Store auth data
export const setAuthData = (data: UserData, rememberMe: boolean = false) => {
  const storage = rememberMe ? localStorage : sessionStorage;

  storage.setItem("adminToken", data.access_token);
  storage.setItem(
    "adminUser",
    JSON.stringify({
      email: data.email,
      name: data.name,
      role: data.role,
    }),
  );

  if (data.refresh_token) {
    storage.setItem("refreshToken", data.refresh_token);
  }

  // Set a flag for authentication
  storage.setItem("isAuthenticated", "true");
};

// Get auth token
export const getToken = (): string | null => {
  return (
    localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken")
  );
};

// Get user data
export const getUser = (): {
  email: string;
  name: string;
  role: string;
} | null => {
  const userStr =
    localStorage.getItem("adminUser") || sessionStorage.getItem("adminUser");
  return userStr ? JSON.parse(userStr) : null;
};

// Check if authenticated
export const isAuthenticated = (): boolean => {
  return !!(
    localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken")
  );
};

// Logout
export const logout = (): void => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("rememberedEmail");

  sessionStorage.removeItem("adminToken");
  sessionStorage.removeItem("adminUser");
  sessionStorage.removeItem("refreshToken");
  sessionStorage.removeItem("isAuthenticated");
};

// Remember me
export const getRememberedEmail = (): string | null => {
  return localStorage.getItem("rememberedEmail");
};

export const setRememberedEmail = (email: string): void => {
  localStorage.setItem("rememberedEmail", email);
};
