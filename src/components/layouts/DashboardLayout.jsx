import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

// ============================================================================
// Dashboard Layout
// Wraps all protected pages with a persistent Sidebar + Navbar shell.
// ============================================================================

export const DashboardLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen w-full max-w-full">
                <Navbar />
                <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
