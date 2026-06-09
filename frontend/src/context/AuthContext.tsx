"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Experience, PrivacyLevel } from "@/types";
import { INITIAL_EXPERIENCES } from "@/lib/mockData";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  experiences: Experience[];
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addExperience: (title: string, content: string, tags: string[], privacy: PrivacyLevel) => Promise<Experience>;
  updateExperience: (id: string, title: string, content: string, tags: string[], privacy: PrivacyLevel) => Promise<Experience>;
  deleteExperience: (id: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("veilory_user");
    const storedExps = localStorage.getItem("veilory_experiences");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Auto-log in a mock user initially to make review easy, or leave it to guest?
      // Let's seed a default logged in user so the dashboard isn't empty, but let the user log out.
      const defaultUser: User = {
        id: "user-alpha",
        email: "founder@veilory.com",
        name: "Alex Rivera",
        created_at: new Date().toISOString()
      };
      setUser(defaultUser);
      localStorage.setItem("veilory_user", JSON.stringify(defaultUser));
    }

    if (storedExps) {
      setExperiences(JSON.parse(storedExps));
    } else {
      setExperiences(INITIAL_EXPERIENCES);
      localStorage.setItem("veilory_experiences", JSON.stringify(INITIAL_EXPERIENCES));
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simple mock check
    if (email && password.length >= 8) {
      const mockUser: User = {
        id: "user-alpha",
        email: email,
        name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
        created_at: new Date().toISOString()
      };
      setUser(mockUser);
      localStorage.setItem("veilory_user", JSON.stringify(mockUser));
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    throw new Error("Invalid email or password. Password must be at least 8 characters.");
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (name && email && password.length >= 8) {
      const mockUser: User = {
        id: `user-${Math.random().toString(36).substr(2, 9)}`,
        email: email,
        name: name,
        created_at: new Date().toISOString()
      };
      setUser(mockUser);
      localStorage.setItem("veilory_user", JSON.stringify(mockUser));
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    throw new Error("Signup failed. Password must be at least 8 characters.");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("veilory_user");
  };

  const addExperience = async (
    title: string,
    content: string,
    tags: string[],
    privacy: PrivacyLevel
  ): Promise<Experience> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!user) throw new Error("Authentication required.");

    const newExp: Experience = {
      id: `exp-${Math.random().toString(36).substr(2, 9)}`,
      title,
      content,
      emotion_tags: tags.map(t => t.trim().toLowerCase()).filter(Boolean),
      privacy,
      user_id: user.id,
      author_name: privacy === "Anonymous" ? null : user.name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updated = [newExp, ...experiences];
    setExperiences(updated);
    localStorage.setItem("veilory_experiences", JSON.stringify(updated));
    return newExp;
  };

  const updateExperience = async (
    id: string,
    title: string,
    content: string,
    tags: string[],
    privacy: PrivacyLevel
  ): Promise<Experience> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!user) throw new Error("Authentication required.");

    const index = experiences.findIndex((e) => e.id === id);
    if (index === -1) throw new Error("Experience not found.");
    if (experiences[index].user_id !== user.id) throw new Error("Permission denied.");

    const updatedExp: Experience = {
      ...experiences[index],
      title,
      content,
      emotion_tags: tags.map(t => t.trim().toLowerCase()).filter(Boolean),
      privacy,
      author_name: privacy === "Anonymous" ? null : user.name,
      updated_at: new Date().toISOString()
    };

    const updated = [...experiences];
    updated[index] = updatedExp;
    setExperiences(updated);
    localStorage.setItem("veilory_experiences", JSON.stringify(updated));
    return updatedExp;
  };

  const deleteExperience = async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!user) throw new Error("Authentication required.");

    const exp = experiences.find((e) => e.id === id);
    if (!exp) throw new Error("Experience not found.");
    if (exp.user_id !== user.id) throw new Error("Permission denied.");

    const updated = experiences.filter((e) => e.id !== id);
    setExperiences(updated);
    localStorage.setItem("veilory_experiences", JSON.stringify(updated));
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        experiences,
        login,
        signup,
        logout,
        addExperience,
        updateExperience,
        deleteExperience
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
