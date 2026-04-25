import React from 'react';

// Skeletons are a great UX pattern when loading data.
// We use these extensively with React Query's `isLoading` state.

// ---------------------------------------------------------
// Card Skeleton - For generic statistic cards or simple data 
// ---------------------------------------------------------
export const CardSkeleton = () => (
  <div className="glass-card p-4 animate-pulse flex flex-col gap-4">
    <div className="h-6 bg-slate-200 rounded w-1/3"></div>
    <div className="h-10 bg-slate-200 rounded w-1/2"></div>
    <div className="flex justify-between items-center mt-2">
      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
      <div className="h-4 bg-slate-200 rounded w-8"></div>
    </div>
  </div>
);

// ---------------------------------------------------------
// Table Skeleton - For listing patients, doctors, records
// ---------------------------------------------------------
export const TableSkeleton = ({ rows = 5 }) => (
  <div className="w-full h-full flex flex-col gap-4 animate-pulse mt-4">
    {/* Table Header mock */}
    <div className="flex gap-4 border-b border-slate-200 pb-2">
      <div className="h-4 bg-slate-300 rounded w-1/4"></div>
      <div className="h-4 bg-slate-300 rounded w-1/4"></div>
      <div className="h-4 bg-slate-300 rounded w-1/4"></div>
      <div className="h-4 bg-slate-300 rounded w-1/4"></div>
    </div>
    {/* Table Rows mock */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 pt-2">
        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
      </div>
    ))}
  </div>
);

// ---------------------------------------------------------
// Profile Skeleton - For viewing user or patient details
// ---------------------------------------------------------
export const ProfileSkeleton = () => (
  <div className="glass-card p-6 w-full animate-pulse flex flex-col gap-6">
    <div className="flex items-center gap-4">
      <div className="w-20 h-20 bg-slate-200 rounded-full"></div>
      <div className="flex flex-col gap-2 w-full">
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="h-10 bg-slate-200 rounded w-full"></div>
      <div className="h-10 bg-slate-200 rounded w-full"></div>
      <div className="h-10 bg-slate-200 rounded w-full"></div>
      <div className="h-10 bg-slate-200 rounded w-full"></div>
    </div>
  </div>
);
