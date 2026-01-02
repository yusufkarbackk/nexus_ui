'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './auth';

// Pages that don't require authentication
const publicPaths = ['/login'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Don't do anything while loading
        if (isLoading) return;

        // Check if current path is public
        const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

        if (!isAuthenticated && !isPublicPath) {
            // Not authenticated and trying to access protected page
            router.push('/login');
        } else if (isAuthenticated && pathname === '/login') {
            // Already authenticated but on login page, redirect to home
            router.push('/');
        }
    }, [isAuthenticated, isLoading, pathname, router]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // If not authenticated and not on public path, don't render children (redirect is happening)
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
    if (!isAuthenticated && !isPublicPath) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return <>{children}</>;
}
