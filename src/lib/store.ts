
"use client";

import { create } from 'react';

export interface BindCode {
  id: string;
  code: string;
  description: string;
  expirationDate?: string;
  status: 'active' | 'used' | 'expired';
  createdAt: string;
}

export interface Nucleus {
  id: string;
  name: string;
  description: string;
  tags: string[];
}

export interface BindHistory {
  id: string;
  nucleusId: string;
  bindCode: string;
  timestamp: string;
  status: 'pending' | 'sent' | 'confirmed' | 'failed';
}

interface BindNexusStore {
  bindCodes: BindCode[];
  nuclei: Nucleus[];
  history: BindHistory[];
  addBindCode: (code: Omit<BindCode, 'id' | 'createdAt' | 'status'>) => void;
  addNucleus: (nucleus: Nucleus) => void;
  updateNucleus: (id: string, nucleus: Partial<Nucleus>) => void;
  addHistory: (entry: Omit<BindHistory, 'id' | 'timestamp'>) => void;
}

// In a real app, this would be an API or Firebase
export const useStore = () => {
  // Use simple local state for this demo.
  // In a real Next.js app we'd use Server Actions and a DB.
  return {
    bindCodes: [
      { id: '1', code: 'XJ49', description: 'System Admin Access', status: 'active', createdAt: new Date().toISOString() },
      { id: '2', code: 'PK22', description: 'Temporary User Link', status: 'expired', createdAt: new Date().toISOString() },
    ] as BindCode[],
    nuclei: [
      { id: 'n1', name: 'Core Engine', description: 'Primary processing unit for the Nexus network.', tags: ['core', 'engine'] },
      { id: 'n2', name: 'Relay Alpha', description: 'Edge computing relay for low latency communication.', tags: ['relay', 'edge'] },
    ] as Nucleus[],
    history: [
      { id: 'h1', nucleusId: 'n1', bindCode: 'XJ49', timestamp: new Date().toISOString(), status: 'confirmed' },
      { id: 'h2', nucleusId: 'n2', bindCode: 'PK22', timestamp: new Date().toISOString(), status: 'failed' },
    ] as BindHistory[],
  };
};
