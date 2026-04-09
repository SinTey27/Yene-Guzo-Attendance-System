// src/services/auth.service.ts

interface AuthUser {
  email: string;
  name: string;
  role: "admin" | "staff";
  token: string;
}

class AuthService {
  private readonly TOKEN_KEY = "adminToken";
  private readonly USER_KEY = "adminUser";

  login(email: string, password: string): boolean {
    // Demo credentials - replace with actual authentication
    if (email === "admin@kifiya.com" && password === "Admin@2026") {
      const token = "admin_token_" + Date.now();
      const user: AuthUser = {
        email,
        name: "Administrator",
        role: "admin",
        token,
      };
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));

      // Set cookie for middleware
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `adminToken=${token}; expires=${expires.toUTCString()}; path=/`;

      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem("rememberedEmail");
    document.cookie =
      "adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user = localStorage.getItem(this.USER_KEY);
    return !!(token && user);
  }

  getCurrentUser(): AuthUser | null {
    const user = localStorage.getItem(this.USER_KEY);
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}

export const authService = new AuthService();
