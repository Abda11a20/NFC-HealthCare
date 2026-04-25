import React from 'react';

// ============================================================================
// Public Layout — Minimal wrapper for auth pages (Login, Signup, Reset)
// The Login page handles its own full-screen split layout, so this wrapper
// simply passes children through without additional chrome.
// ============================================================================

export const PublicLayout = ({ children }) => {
    return (
        <>{children}</>
    );
};

export default PublicLayout;
