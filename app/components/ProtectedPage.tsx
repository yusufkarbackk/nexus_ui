'use client';

import { ReactNode } from 'react';
import { ProtectedRoute } from '@/app/lib/auth';

interface ProtectedPageProps {
    children: ReactNode;
}

export function ProtectedPage({ children }: ProtectedPageProps) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
}
