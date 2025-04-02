// src/components/layout/DashboardLayout.tsx
import React, { ReactNode } from 'react';

import { User } from '@/app/types';

interface DashboardLayoutProps {
  children: ReactNode;
  user: User;
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50">
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
