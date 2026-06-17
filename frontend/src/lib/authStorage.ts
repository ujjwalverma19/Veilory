/**
 * TokenStorage abstraction wrapper.
 * Backed by localStorage for now; designed to allow drop-in replacement
 * with HttpOnly cookie handling in the future without major changes to
 * the frontend API client or component tree.
 */
export const TokenStorage = {
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("veilory_jwt");
  },
  
  setToken: (token: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem("veilory_jwt", token);
    }
  },
  
  clearToken: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("veilory_jwt");
    }
  }
};
