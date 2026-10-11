import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Award, Layers, Briefcase, FileText, Plus } from 'lucide-react';
import CertGenLogo from './CertGenLogo';

const Layout = ({ children }) => {
  const location = useLocation();

  const navLinks = [
    {
      to: '/',
      label: 'Studio',
      icon: Layers,
      match: location.pathname === '/'
    },
    {
      to: '/jobs',
      label: 'Jobs & Batches',
      icon: Briefcase,
      match: location.pathname.startsWith('/jobs')
    },
    {
      to: '/certificates',
      label: 'Certificates',
      icon: Award,
      match: location.pathname.startsWith('/certificates')
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar - Clean Professional Light Theme */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3 group cursor-pointer">
                <CertGenLogo className="w-10 h-10 drop-shadow-xs" />
                <div>
                  <h1 className="font-bold text-lg tracking-tight text-slate-900 leading-tight">
                    CertGen Studio
                  </h1>
                  <p className="text-[11px] text-slate-500 hidden sm:block">
                    Bulk Certificate Generator
                  </p>
                </div>
              </Link>

              {/* Main Navigation Tabs */}
              <nav className="hidden md:flex items-center gap-1.5">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.match;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                      }`}
                    >
                      <Icon size={15} className={isActive ? 'text-blue-600' : 'text-slate-500'} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Side: Status Badge & Quick Action */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-slate-600">Local Engine:</span>
                <span className="text-emerald-700 font-semibold font-mono">Active (FastAPI + Worker)</span>
              </div>

              {location.pathname !== '/' && (
                <Link
                  to="/"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  <Plus size={14} />
                  <span>New Batch</span>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Navigation Tabs */}
          <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = item.match;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 mt-auto">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-2">
            <CertGenLogo className="w-4 h-4" />
            <span>Bulk Certificate Generator &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 text-xs">
            <span>A4 Landscape Output</span>
            <span>&bull;</span>
            <span>Asynchronous Batch Worker</span>
            <span>&bull;</span>
            <span>ZIP Archives</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
