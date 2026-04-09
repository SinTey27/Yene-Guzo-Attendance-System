// src/context/DataContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface StaffMember {
  email: string;
  code: string;
  name: string;
  position: string;
  terminalID: string;
  status: string;
}

interface Terminal {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
}

interface DataContextType {
  staff: StaffMember[];
  terminals: Terminal[];
  loadingStaff: boolean;
  loadingTerminals: boolean;
  loadStaff: () => Promise<void>;
  loadTerminals: () => Promise<void>;
  refreshStaff: () => Promise<void>;
  refreshTerminals: () => Promise<void>;
  clearCache: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [loadingTerminals, setLoadingTerminals] = useState(false);
  const [staffLoaded, setStaffLoaded] = useState(false);
  const [terminalsLoaded, setTerminalsLoaded] = useState(false);

  const loadStaff = async () => {
    if (staffLoaded && staff.length > 0) return;
    setLoadingStaff(true);
    try {
      const { googleSheetsService } =
        await import("@/services/googleSheets.service");
      const result = await googleSheetsService.getStaffList();
      setStaff(result || []);
      setStaffLoaded(true);
    } catch (error) {
      console.error("Error loading staff:", error);
    } finally {
      setLoadingStaff(false);
    }
  };

  const loadTerminals = async () => {
    if (terminalsLoaded && terminals.length > 0) return;
    setLoadingTerminals(true);
    try {
      const { googleSheetsService } =
        await import("@/services/googleSheets.service");
      const result = await googleSheetsService.getTerminals();
      setTerminals(result || []);
      setTerminalsLoaded(true);
    } catch (error) {
      console.error("Error loading terminals:", error);
    } finally {
      setLoadingTerminals(false);
    }
  };

  const refreshStaff = async () => {
    setLoadingStaff(true);
    try {
      const { googleSheetsService } =
        await import("@/services/googleSheets.service");
      const result = await googleSheetsService.getStaffList();
      setStaff(result || []);
      setStaffLoaded(true);
    } catch (error) {
      console.error("Error refreshing staff:", error);
    } finally {
      setLoadingStaff(false);
    }
  };

  const refreshTerminals = async () => {
    setLoadingTerminals(true);
    try {
      const { googleSheetsService } =
        await import("@/services/googleSheets.service");
      const result = await googleSheetsService.getTerminals();
      setTerminals(result || []);
      setTerminalsLoaded(true);
    } catch (error) {
      console.error("Error refreshing terminals:", error);
    } finally {
      setLoadingTerminals(false);
    }
  };

  const clearCache = () => {
    setStaffLoaded(false);
    setTerminalsLoaded(false);
    setStaff([]);
    setTerminals([]);
  };

  return (
    <DataContext.Provider
      value={{
        staff,
        terminals,
        loadingStaff,
        loadingTerminals,
        loadStaff,
        loadTerminals,
        refreshStaff,
        refreshTerminals,
        clearCache,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
