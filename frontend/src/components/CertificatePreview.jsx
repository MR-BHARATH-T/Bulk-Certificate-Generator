import React, { useState } from 'react';
import { 
  Award, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  Printer, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  ShieldCheck, 
  Building
} from 'lucide-react';

export const THEMES = {
  royal_gold: {
    id: 'royal_gold',
    name: 'Classic Navy & Gold',
    bg: '#FCFCFA',
    outerBorder: '#0F172A',
    innerBorder: '#D4AF37',
    cornerAccent: '#D4AF37',
    primaryText: '#0F172A',
    accentText: '#B45309',
    nameColor: '#1E3A8A',
    sealBg: '#0F172A',
    sealRing: '#FEF3C7',
    sealRibbon: '#B45309',
    badgeText: 'VERIFIED CREDENTIAL'
  },
  emerald_prestige: {
    id: 'emerald_prestige',
    name: 'Emerald Prestige',
    bg: '#F8FAF8',
    outerBorder: '#064E3B',
    innerBorder: '#10B981',
    cornerAccent: '#059669',
    primaryText: '#064E3B',
    accentText: '#047857',
    nameColor: '#065F46',
    sealBg: '#064E3B',
    sealRing: '#D1FAE5',
    sealRibbon: '#065F46',
    badgeText: 'HONOR OF EXCELLENCE'
  },
  crimson_honor: {
    id: 'crimson_honor',
    name: 'Crimson & Burgundy',
    bg: '#FFFDFD',
    outerBorder: '#881337',
    innerBorder: '#E11D48',
    cornerAccent: '#BE123C',
    primaryText: '#881337',
    accentText: '#BE123C',
    nameColor: '#9F1239',
    sealBg: '#881337',
    sealRing: '#FFE4E6',
    sealRibbon: '#881337',
    badgeText: 'OFFICIAL MERIT'
  },
  sapphire_elite: {
    id: 'sapphire_elite',
    name: 'Sapphire & Steel',
    bg: '#F8FAFC',
    outerBorder: '#1E293B',
    innerBorder: '#3B82F6',
    cornerAccent: '#2563EB',
    primaryText: '#0F172A',
    accentText: '#2563EB',
    nameColor: '#1D4ED8',
    sealBg: '#1E293B',
    sealRing: '#DBEAFE',
    sealRibbon: '#1E3A8A',
    badgeText: 'AUTHENTICATED'
  },
  monochrome_luxe: {
    id: 'monochrome_luxe',
    name: 'Monochrome Slate',
    bg: '#FAFBFD',
    outerBorder: '#1E293B',
    innerBorder: '#64748B',
    cornerAccent: '#475569',
    primaryText: '#0F172A',
    accentText: '#475569',
    nameColor: '#0F172A',
    sealBg: '#1E293B',
    sealRing: '#F1F5F9',
    sealRibbon: '#1E293B',
    badgeText: 'DISTINGUISHED'
  }
};

export const BORDER_STYLES = {
  classic_prestige: {
    id: 'classic_prestige',
    name: 'Classic Heritage',
    desc: '4-side perimeter frame with ornate Victorian corner filigrees'
  },
  executive_frame: {
    id: 'executive_frame',
    name: 'Executive Dual-Line',
    desc: 'Crisp 4-side perimeter frame with modern corner accents'
  },
  architectural_gold: {
    id: 'architectural_gold',
    name: 'Architectural Gold',
    desc: 'Top-bottom gold horizontal rules with geometric corner stars'
  },
  royal_flourish: {
    id: 'royal_flourish',
    name: 'Royal Heraldic',
    desc: 'Triple fluted perimeter with heraldic corner brackets'
  },
  clean_minimal: {
    id: 'clean_minimal',
    name: 'Clean Minimalist',
    desc: 'Open parchment with subtle top & bottom hairlines'
  }
};

// Executive Certification Medallion modeled after Google Cloud, AWS, Harvard, and Stanford seals
const ReputedCertificateSeal = ({ theme }) => (
  <div className="relative flex flex-col items-center justify-center select-none group">
    <svg 
      viewBox="0 0 120 120" 
      className="w-[104px] h-[104px] drop-shadow-md transition-transform duration-300 group-hover:scale-105"
    >
      <defs>
        <path id="seal-text-arc-top" d="M 23,60 A 37,37 0 1,1 97,60" fill="none" />
        <path id="seal-text-arc-bottom" d="M 97,60 A 37,37 0 0,1 23,60" fill="none" />
      </defs>

      {/* 36-Point Scalloped Gold Medallion Rosette */}
      <path 
        d="M 60.0,3.0 L 64.58,7.7 L 69.9,3.87 L 73.59,9.29 L 79.5,6.44 L 82.19,12.42 L 88.5,10.64 L 90.11,16.99 L 96.64,16.34 L 97.12,22.88 L 103.66,23.36 L 103.01,29.89 L 109.36,31.5 L 107.58,37.81 L 113.56,40.5 L 110.71,46.41 L 116.13,50.1 L 112.3,55.42 L 117.0,60.0 L 112.3,64.58 L 116.13,69.9 L 110.71,73.59 L 113.56,79.5 L 107.58,82.19 L 109.36,88.5 L 103.01,90.11 L 103.66,96.64 L 97.12,97.12 L 96.64,103.66 L 90.11,103.01 L 88.5,109.36 L 82.19,107.58 L 79.5,113.56 L 73.59,110.71 L 69.9,116.13 L 64.58,112.3 L 60.0,117.0 L 55.42,112.3 L 50.1,116.13 L 46.41,110.71 L 40.5,113.56 L 37.81,107.58 L 31.5,109.36 L 29.89,103.01 L 23.36,103.66 L 22.88,97.12 L 16.34,96.64 L 16.99,90.11 L 10.64,88.5 L 12.42,82.19 L 6.44,79.5 L 9.29,73.59 L 3.87,69.9 L 7.7,64.58 L 3.0,60.0 L 7.7,55.42 L 3.87,50.1 L 9.29,46.41 L 6.44,40.5 L 12.42,37.81 L 10.64,31.5 L 16.99,29.89 L 16.34,23.36 L 22.88,22.88 L 23.36,16.34 L 29.89,16.99 L 31.5,10.64 L 37.81,12.42 L 40.5,6.44 L 46.41,9.29 L 50.1,3.87 L 55.42,7.7 Z" 
        fill={theme.innerBorder}
        stroke={theme.cornerAccent} 
        strokeWidth="1.2" 
        strokeLinejoin="round"
      />

      {/* Outer Contrast Rim */}
      <circle cx="60" cy="60" r="49" fill={theme.primaryText} stroke="#FEF3C7" strokeWidth="1.2" />

      {/* Concentric Beaded Gold Ring */}
      <circle cx="60" cy="60" r="45.5" fill="none" stroke="#FEF3C7" strokeWidth="1" strokeDasharray="3,2.5" />

      {/* Arched Serif Inscription Along Path */}
      <text fill="#FEF3C7" fontSize="5.6" fontWeight="800" fontFamily="'Cinzel', Georgia, serif" letterSpacing="1.8">
        <textPath href="#seal-text-arc-top" startOffset="50%" textAnchor="middle">
          ★ OFFICIAL EXCELLENCE ★
        </textPath>
      </text>

      <text fill="#FEF3C7" fontSize="4.8" fontWeight="700" fontFamily="'Cinzel', Georgia, serif" letterSpacing="1.6">
        <textPath href="#seal-text-arc-bottom" startOffset="50%" textAnchor="middle">
          AUTHENTIC CREDENTIAL
        </textPath>
      </text>

      {/* Inner Metallic Disc */}
      <circle cx="60" cy="60" r="33" fill="#0B132B" stroke="#D4AF37" strokeWidth="1.4" />
      <circle cx="60" cy="60" r="30" fill="none" stroke="#D4AF37" strokeWidth="0.8" strokeDasharray="2,2" />

      {/* Heraldic Laurel Leaves flanking center */}
      <path d="M 39,58 C 37,50 41,42 47,38 M 38,54 C 35,52 37,49 41,51 M 40,47 C 37,45 39,42 43,45 M 43,41 C 40,38 43,36 46,40" fill="none" stroke="#FEF3C7" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M 81,58 C 83,50 79,42 73,38 M 82,54 C 85,52 83,49 79,51 M 80,47 C 83,45 81,42 77,45 M 77,41 C 80,38 77,36 74,40" fill="none" stroke="#FEF3C7" strokeWidth="1.4" strokeLinecap="round" />

      {/* 3D Faceted 8-Point Compass Star in Center */}
      <polygon points="60,37 60,52 64,48" fill="#FFFBEB" />
      <polygon points="75,52 60,52 71,56" fill="#FFFBEB" />
      <polygon points="60,67 60,52 56,56" fill="#FFFBEB" />
      <polygon points="45,52 60,52 49,48" fill="#FFFBEB" />
      <polygon points="60,37 60,52 56,48" fill="#D97706" />
      <polygon points="75,52 60,52 71,48" fill="#D97706" />
      <polygon points="60,67 60,52 64,56" fill="#D97706" />
      <polygon points="45,52 60,52 49,56" fill="#D97706" />

      <polygon points="71,41 60,52 65,47" fill="#FDE047" />
      <polygon points="71,63 60,52 67,58" fill="#FDE047" />
      <polygon points="49,63 60,52 55,57" fill="#FDE047" />
      <polygon points="49,41 60,52 53,46" fill="#FDE047" />
      <polygon points="71,41 60,52 67,46" fill="#B45309" />
      <polygon points="71,63 60,52 65,57" fill="#B45309" />
      <polygon points="49,63 60,52 53,58" fill="#B45309" />
      <polygon points="49,41 60,52 55,47" fill="#B45309" />

      {/* Elegant Lower Ribbon Banner with Flanking Tails */}
      {/* Left Ribbon Tail */}
      <polygon points="26,73 35,70 35,84 26,81 29,77" fill="#92400E" stroke="#78350F" strokeWidth="0.6" />
      {/* Right Ribbon Tail */}
      <polygon points="94,73 85,70 85,84 94,81 91,77" fill="#92400E" stroke="#78350F" strokeWidth="0.6" />
      {/* Central Ribbon Banner */}
      <polygon points="33,69 87,69 84,84 36,84" fill="#F59E0B" stroke="#78350F" strokeWidth="0.9" />
      {/* Banner Top Gold Highlight */}
      <line x1="36" y1="71" x2="84" y2="71" stroke="#FEF3C7" strokeWidth="0.7" />
      {/* Prominently visible and unclipped VERIFIED text */}
      <text 
        x="60" 
        y="79.5" 
        textAnchor="middle" 
        fill="#0F172A" 
        fontSize="6.2" 
        fontWeight="900" 
        fontFamily="'Cinzel', Georgia, serif" 
        letterSpacing="1.2"
      >
        VERIFIED
      </text>
    </svg>
  </div>
);

const CertificatePreview = ({ 
  certificateData, 
  currentRecipientIndex, 
  onRecipientChange, 
  recipientsList = [],
  themeKey = 'royal_gold',
  borderStyle = null
}) => {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const theme = THEMES[themeKey] || THEMES.royal_gold;
  const activeBorderStyle = borderStyle || certificateData.border_style || 'classic_prestige';
  
  const hasRecipients = Boolean(recipientsList && recipientsList.length > 0);
  const activeRecipient = hasRecipients ? recipientsList[currentRecipientIndex] : null;
  const rawRecipientName = activeRecipient?.full_name?.trim();
  const isRecipientNameEmpty = !rawRecipientName;
  const displayedRecipientName = isRecipientNameEmpty ? 'Enter the Recipient Name' : rawRecipientName;

  const certificateId = hasRecipients
    ? `CERT-2026-${String(currentRecipientIndex + 1).padStart(4, '0')}`
    : 'CERT-2026-0001';

  const formattedDate = certificateData.issue_date 
    ? new Date(certificateData.issue_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : 'October 15, 2026';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}>
      {/* Top Preview Controls Toolbar - Clean Light Theme */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-200 text-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold tracking-wide uppercase text-slate-800">Live Preview</span>
          </div>
          <span className="text-xs text-slate-300 hidden sm:inline">|</span>
          <span className="text-xs text-slate-500 hidden sm:inline">
            A4 Landscape
          </span>
        </div>

        {/* Recipient Navigator */}
        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
          <button 
            type="button"
            onClick={() => onRecipientChange(Math.max(0, currentRecipientIndex - 1))}
            disabled={currentRecipientIndex <= 0}
            className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Previous Recipient"
          >
            <ChevronLeft size={16} />
          </button>
          
          <div className="text-xs font-semibold text-slate-700 px-1 min-w-[110px] text-center">
            {hasRecipients ? (
              <span>Recipient {currentRecipientIndex + 1} of {recipientsList.length}</span>
            ) : (
              <span className="text-slate-400 font-normal">0 Recipients</span>
            )}
          </div>

          <button 
            type="button"
            onClick={() => onRecipientChange(Math.min(recipientsList.length - 1, currentRecipientIndex + 1))}
            disabled={recipientsList.length <= 1 || currentRecipientIndex >= recipientsList.length - 1}
            className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Next Recipient"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Zoom & Screen Actions */}
        <div className="flex items-center gap-1.5">
          <button 
            type="button"
            onClick={() => setZoom(Math.max(60, zoom - 10))}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs font-mono text-slate-600 w-10 text-center">{zoom}%</span>
          <button 
            type="button"
            onClick={() => setZoom(Math.min(130, zoom + 10))}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button 
            type="button"
            onClick={handlePrint}
            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors ml-1 cursor-pointer"
            title="Print Current Certificate"
          >
            <Printer size={16} />
          </button>
          <button 
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Preview"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Certificate Viewport */}
      <div className="overflow-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center bg-slate-100 custom-scrollbar">
        <div 
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center', transition: 'transform 0.15s ease-out' }}
          className="transition-all duration-200"
        >
          {/* Certificate Canvas Container */}
          <div 
            id="certificate-preview-canvas"
            style={{ 
              backgroundColor: theme.bg
            }}
            className="relative w-[780px] h-[550px] p-8 text-slate-900 shadow-2xl rounded-md select-none border-0 flex flex-col justify-between overflow-hidden"
          >
            {/* DYNAMIC TOP-BOTTOM-RIGHT-LEFT BORDER FRAME TEMPLATES */}
            {activeBorderStyle === 'classic_prestige' && (
              <>
                <div style={{ borderColor: theme.innerBorder }} className="absolute inset-3 border border-opacity-40 pointer-events-none" />
                <div style={{ borderColor: theme.innerBorder }} className="absolute inset-5 border-2 border-double border-opacity-70 pointer-events-none" />
                {/* Victorian Ornate Corner Filigrees */}
                <svg className="absolute top-5 left-5 w-8 h-8 pointer-events-none" style={{ color: theme.cornerAccent }} viewBox="0 0 32 32" fill="none">
                  <path d="M 2,16 C 2,8 8,2 16,2 M 2,24 C 2,12 12,2 24,2 M 2,30 C 2,16 16,2 30,2 M 2,2 L 8,8" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                <svg className="absolute top-5 right-5 w-8 h-8 pointer-events-none rotate-90" style={{ color: theme.cornerAccent }} viewBox="0 0 32 32" fill="none">
                  <path d="M 2,16 C 2,8 8,2 16,2 M 2,24 C 2,12 12,2 24,2 M 2,30 C 2,16 16,2 30,2 M 2,2 L 8,8" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                <svg className="absolute bottom-5 left-5 w-8 h-8 pointer-events-none -rotate-90" style={{ color: theme.cornerAccent }} viewBox="0 0 32 32" fill="none">
                  <path d="M 2,16 C 2,8 8,2 16,2 M 2,24 C 2,12 12,2 24,2 M 2,30 C 2,16 16,2 30,2 M 2,2 L 8,8" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                <svg className="absolute bottom-5 right-5 w-8 h-8 pointer-events-none rotate-180" style={{ color: theme.cornerAccent }} viewBox="0 0 32 32" fill="none">
                  <path d="M 2,16 C 2,8 8,2 16,2 M 2,24 C 2,12 12,2 24,2 M 2,30 C 2,16 16,2 30,2 M 2,2 L 8,8" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </>
            )}

            {activeBorderStyle === 'executive_frame' && (
              <>
                <div style={{ borderColor: theme.outerBorder }} className="absolute inset-3 border opacity-30 pointer-events-none" />
                <div style={{ borderColor: theme.innerBorder }} className="absolute inset-5 border border-opacity-60 pointer-events-none" />
                <div style={{ borderColor: theme.innerBorder }} className="absolute inset-6 border border-dashed opacity-40 pointer-events-none" />
                {/* Modern Corner Square Knots */}
                <div style={{ backgroundColor: theme.innerBorder }} className="absolute top-5 left-5 w-2 h-2 pointer-events-none" />
                <div style={{ backgroundColor: theme.innerBorder }} className="absolute top-5 right-5 w-2 h-2 pointer-events-none" />
                <div style={{ backgroundColor: theme.innerBorder }} className="absolute bottom-5 left-5 w-2 h-2 pointer-events-none" />
                <div style={{ backgroundColor: theme.innerBorder }} className="absolute bottom-5 right-5 w-2 h-2 pointer-events-none" />
              </>
            )}

            {activeBorderStyle === 'architectural_gold' && (
              <>
                <div style={{ backgroundColor: theme.innerBorder }} className="absolute top-5 left-10 right-10 h-[2px] opacity-70 pointer-events-none" />
                <div style={{ backgroundColor: theme.innerBorder }} className="absolute bottom-5 left-10 right-10 h-[1.5px] opacity-60 pointer-events-none" />
                <div style={{ backgroundColor: theme.innerBorder }} className="absolute left-6 top-10 bottom-10 w-[1px] opacity-30 pointer-events-none" />
                <div style={{ backgroundColor: theme.innerBorder }} className="absolute right-6 top-10 bottom-10 w-[1px] opacity-30 pointer-events-none" />
                {/* 4 Corner Geometric Stars */}
                <svg className="absolute top-4 left-5 w-5 h-5 pointer-events-none" style={{ color: theme.cornerAccent }} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L14 9L21 12L14 15L12 22L10 15L3 12L10 9Z" />
                </svg>
                <svg className="absolute top-4 right-5 w-5 h-5 pointer-events-none" style={{ color: theme.cornerAccent }} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L14 9L21 12L14 15L12 22L10 15L3 12L10 9Z" />
                </svg>
                <svg className="absolute bottom-4 left-5 w-5 h-5 pointer-events-none" style={{ color: theme.cornerAccent }} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L14 9L21 12L14 15L12 22L10 15L3 12L10 9Z" />
                </svg>
                <svg className="absolute bottom-4 right-5 w-5 h-5 pointer-events-none" style={{ color: theme.cornerAccent }} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L14 9L21 12L14 15L12 22L10 15L3 12L10 9Z" />
                </svg>
              </>
            )}

            {activeBorderStyle === 'royal_flourish' && (
              <>
                <div style={{ borderColor: theme.innerBorder }} className="absolute inset-4 border-2 border-opacity-60 pointer-events-none" />
                <div style={{ borderColor: theme.innerBorder }} className="absolute inset-6 border border-dashed opacity-50 pointer-events-none" />
                {/* Classical Corner Laurel Knots */}
                <svg className="absolute top-4 left-4 w-9 h-9 pointer-events-none opacity-80" style={{ color: theme.cornerAccent }} viewBox="0 0 36 36" fill="none">
                  <path d="M 4,4 H 22 M 4,4 V 22 M 4,4 L 14,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="4" cy="4" r="2" fill="currentColor" />
                </svg>
                <svg className="absolute top-4 right-4 w-9 h-9 pointer-events-none opacity-80 rotate-90" style={{ color: theme.cornerAccent }} viewBox="0 0 36 36" fill="none">
                  <path d="M 4,4 H 22 M 4,4 V 22 M 4,4 L 14,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="4" cy="4" r="2" fill="currentColor" />
                </svg>
                <svg className="absolute bottom-4 left-4 w-9 h-9 pointer-events-none opacity-80 -rotate-90" style={{ color: theme.cornerAccent }} viewBox="0 0 36 36" fill="none">
                  <path d="M 4,4 H 22 M 4,4 V 22 M 4,4 L 14,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="4" cy="4" r="2" fill="currentColor" />
                </svg>
                <svg className="absolute bottom-4 right-4 w-9 h-9 pointer-events-none opacity-80 rotate-180" style={{ color: theme.cornerAccent }} viewBox="0 0 36 36" fill="none">
                  <path d="M 4,4 H 22 M 4,4 V 22 M 4,4 L 14,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="4" cy="4" r="2" fill="currentColor" />
                </svg>
              </>
            )}

            {activeBorderStyle === 'clean_minimal' && (
              <>
                <div style={{ backgroundColor: theme.innerBorder }} className="absolute top-5 left-16 right-16 h-[1.5px] opacity-40 pointer-events-none" />
                <div style={{ backgroundColor: theme.innerBorder }} className="absolute bottom-5 left-16 right-16 h-[1px] opacity-30 pointer-events-none" />
              </>
            )}

            {/* TOP HEADER: Logo & Organization Name */}
            <div className="relative text-center pt-2">
              {/* Optional Uploaded or Preset Organization Logo */}
              {certificateData.logo_url ? (
                <div className="flex justify-center mb-1.5">
                  <img 
                    src={certificateData.logo_url} 
                    alt="Organization Logo" 
                    className="h-10 w-auto max-w-[140px] object-contain drop-shadow-xs" 
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Award size={18} style={{ color: theme.cornerAccent }} />
                  <span 
                    style={{ color: theme.accentText }} 
                    className="font-bold tracking-widest text-xs uppercase font-cinzel"
                  >
                    {certificateData.organization_name || 'ACADEMIC & PROFESSIONAL CREDENTIAL'}
                  </span>
                  <Award size={18} style={{ color: theme.cornerAccent }} />
                </div>
              )}

              {certificateData.logo_url && (
                <div className="text-center mb-1">
                  <span 
                    style={{ color: theme.accentText }} 
                    className="font-bold tracking-widest text-xs uppercase font-cinzel"
                  >
                    {certificateData.organization_name || 'ORGANIZATION NAME'}
                  </span>
                </div>
              )}

              <div 
                style={{ backgroundColor: theme.innerBorder }} 
                className="h-[1px] w-48 mx-auto opacity-50"
              />
            </div>

            {/* CERTIFICATE TITLE & PRESENTATION SECTION */}
            <div className="relative text-center my-auto space-y-2">
              <h1 
                style={{ color: theme.primaryText }}
                className="font-cinzel text-3xl font-extrabold tracking-wider uppercase drop-shadow-xs"
              >
                {certificateData.certificate_title || 'Certificate of Completion'}
              </h1>

              <div className="flex items-center justify-center gap-3">
                <div style={{ backgroundColor: theme.innerBorder }} className="h-[1px] w-12 opacity-60"></div>
                <p className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase font-sans">
                  This is proudly presented to
                </p>
                <div style={{ backgroundColor: theme.innerBorder }} className="h-[1px] w-12 opacity-60"></div>
              </div>

              {/* RECIPIENT NAME DISPLAY - DYNAMIC UNDERLINE WIDTH MATCHING TEXT WIDTH */}
              <div className="py-0.5">
                <div className="inline-block mx-auto text-center">
                  <span 
                    style={{ 
                      color: isRecipientNameEmpty ? '#94A3B8' : theme.nameColor 
                    }}
                    className={`font-playfair text-3xl font-bold tracking-normal italic block px-3 transition-transform ${
                      isRecipientNameEmpty ? 'opacity-75 select-none' : 'hover:scale-105'
                    }`}
                  >
                    {displayedRecipientName}
                  </span>
                  <div 
                    style={{ borderColor: isRecipientNameEmpty ? '#CBD5E1' : theme.innerBorder }}
                    className={`w-full border-b-2 mt-1 ${isRecipientNameEmpty ? 'border-dashed opacity-50' : 'opacity-80'}`}
                  />
                </div>
              </div>

              <p className="text-xs text-slate-600 max-w-lg mx-auto font-sans leading-relaxed">
                {certificateData.presentation_text || 'for outstanding dedication, active participation, and successfully mastering'}
              </p>

              {/* Event / Course Name - Unboxed, Prestigious Heading with Uniform Lining Numbers */}
              <div className="py-1">
                <span 
                  style={{ 
                    color: theme.primaryText,
                    fontVariantNumeric: 'lining-nums tabular-nums',
                    WebkitFontFeatureSettings: '"lnum" 1, "tnum" 1',
                    MozFontFeatureSettings: '"lnum" 1, "tnum" 1',
                    fontFeatureSettings: '"lnum" 1, "tnum" 1'
                  }}
                  className="font-playfair text-xl sm:text-2xl font-bold tracking-wide block leading-snug lining-nums"
                >
                  {certificateData.event_name || 'Mastery Certification Program 2026'}
                </span>
              </div>

              {/* CITATION / ACHIEVEMENT NOTE - Clean, Unboxed Natural Narrative */}
              {certificateData.description && (
                <div className="max-w-2xl mx-auto px-4 mt-1">
                  <p className="text-xs sm:text-sm text-slate-600 font-sans italic leading-relaxed text-center font-normal">
                    &ldquo;{certificateData.description}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* BOTTOM FOOTER SECTION: Date (Left), Official Signature (Center), Reputed Seal Medallion (Right) */}
            <div className="relative pt-2 pb-1 flex items-end justify-between px-6 gap-2">
              {/* Left Column: Date of Issue */}
              <div className="text-left shrink-0">
                <div className="text-xs font-semibold text-slate-800 whitespace-nowrap">{formattedDate}</div>
                <div className="w-32 h-[1.5px] bg-slate-300 mt-1 mb-0.5"></div>
                <div className="text-[10px] tracking-wider uppercase text-slate-400 font-medium whitespace-nowrap">
                  Date of Issuance
                </div>
                <div className="text-[9px] font-mono text-slate-400 mt-1 whitespace-nowrap">
                  {certificateId}
                </div>
              </div>

              {/* Center Column: Official Signatory - STRICT SINGLE LINE WITH DYNAMIC UNDERLINE MATCHING FULL NAME */}
              <div className="flex-1 flex flex-col items-center justify-end px-2">
                <div className="inline-flex flex-col items-center max-w-full">
                  <div className="font-signature text-2xl text-slate-800 leading-tight px-3 whitespace-nowrap select-none">
                    {certificateData.signatory_name || 'Dr. Arthur Pendelton'}
                  </div>
                  <div 
                    style={{ backgroundColor: theme.innerBorder }} 
                    className="w-full min-w-full h-[1.5px] mt-1 mb-1 opacity-80"
                  />
                  <div className="text-xs font-bold text-slate-800 tracking-wide px-1 whitespace-nowrap">
                    {certificateData.signatory_name || 'Dr. Arthur Pendelton'}
                  </div>
                  <div className="text-[9px] tracking-wider uppercase text-slate-400 font-medium whitespace-nowrap">
                    {certificateData.signatory_title || 'Authorized Program Director'}
                  </div>
                </div>
              </div>

              {/* Right Column: Reputed Official Seal Medallion (Modeled after Google, AWS, Ivy League) */}
              <div className="flex justify-end items-end shrink-0 pl-1">
                <ReputedCertificateSeal theme={theme} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePreview;
