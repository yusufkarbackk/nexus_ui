'use client';

import { ReactNode } from 'react';
import { AuthProvider } from './lib/auth';
import { AuthGuard } from './lib/AuthGuard';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <AuthGuard>
                {children}
            </AuthGuard>
        </AuthProvider>
    );
}
