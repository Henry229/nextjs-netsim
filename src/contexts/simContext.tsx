'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Sim {
  iccid: string;
  status: string;
  // 필요한 다른 필드들 추가
}

interface KoreSimTableDevice {
  iccid: string;
  subscription_id: string;
  state: string;
  msisdn: string;
  imsi: string;
  data_usage?: number;
  sms_usage?: number;
  voice_usage?: number;
  // Add other fields as needed
}

interface KoreDevice {
  simCards: KoreSimTableDevice[];
}

interface SimContextType {
  sims: Sim[];
  setSims: React.Dispatch<React.SetStateAction<Sim[]>>;
  koreDevices: KoreDevice | null;
  setKoreDevices: React.Dispatch<React.SetStateAction<KoreDevice | null>>;
}

const SimContext = createContext<SimContextType | undefined>(undefined);

export const SimProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [sims, setSims] = useState<Sim[]>([]);
  const [koreDevices, setKoreDevices] = useState<KoreDevice | null>(null);

  return (
    <SimContext.Provider value={{ sims, setSims, koreDevices, setKoreDevices }}>
      {children}
    </SimContext.Provider>
  );
};

export const useSimContext = () => {
  const context = useContext(SimContext);
  if (context === undefined) {
    throw new Error('useSimContext must be used within a SimProvider');
  }
  return context;
};
