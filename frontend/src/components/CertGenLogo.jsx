import React from 'react';

export const CertGenLogo = ({ className = "w-10 h-10" }) => (
  <svg 
    viewBox="0 0 64 64" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} flex-shrink-0 transition-transform duration-200 group-hover:scale-105 select-none`}
  >
    {/* High contrast deep navy tile background with subtle primary border */}
    <rect x="2" y="2" width="60" height="60" rx="14" fill="#0F172A" />
    <rect x="2" y="2" width="60" height="60" rx="14" fill="none" stroke="#2563EB" strokeWidth="1.5" />
    
    {/* Certificate Parchment Document */}
    <rect x="11" y="9" width="42" height="46" rx="4" fill="#FFFFFF" />
    <rect x="14" y="12" width="36" height="40" rx="2" fill="none" stroke="#CBD5E1" strokeWidth="1.2" />
    
    {/* Certificate Header Bar */}
    <rect x="18" y="17" width="28" height="4" rx="2" fill="#2563EB" />
    
    {/* Certificate Content Lines */}
    <rect x="21" y="24" width="22" height="2.5" rx="1" fill="#475569" />
    <rect x="18" y="29.5" width="28" height="2" rx="1" fill="#94A3B8" />
    <rect x="18" y="34" width="18" height="2" rx="1" fill="#CBD5E1" />
    
    {/* Gold Seal Ribbon Tails */}
    <path d="M 36,44 L 38,57 L 42,54 L 46,57 L 44,44 Z" fill="#D97706" />
    <path d="M 37.5,44 L 39,55 L 42,53 L 44.5,55 L 43,44 Z" fill="#B45309" />

    {/* Gold Seal Medallion Disc */}
    <circle cx="41" cy="41.5" r="9.5" fill="#F59E0B" stroke="#B45309" strokeWidth="1.2" />
    <circle cx="41" cy="41.5" r="7.5" fill="#FEF08A" stroke="#D97706" strokeWidth="0.8" strokeDasharray="2,1.2" />
    
    {/* Official Verified Authenticity Checkmark */}
    <path d="M 38 41.5 L 40.2 43.8 L 44.5 39" fill="none" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default CertGenLogo;
