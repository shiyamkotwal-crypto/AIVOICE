import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Mic,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  MessageSquare,
  History,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  Sparkles,
  Shield,
  GraduationCap,
  Globe,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAudio } from '../context/AudioContext';
import { useLanguage } from '../context/LanguageContext';
import AudioWaveVisualizer from './AudioWaveVisualizer';
import PresentationModal from './PresentationModal';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { isSpeaking, isMuted, toggleMute, stopSpeech } = useAudio();
  const langCtx = useLanguage();
  const selectedLanguage = langCtx?.selectedLanguage || 'en-US';
  const setLanguage = langCtx?.setLanguage || (() => {});
  const currentLanguageMeta = langCtx?.currentLanguageMeta || {
    code: 'en-US',
    name: 'English (US)',
    native: 'English',
    flag: '🇺🇸',
    short: 'EN',
  };
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [presentationModalOpen, setPresentationModalOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/', icon: Sparkles },
    ...(isAuthenticated
      ? [
          { name: 'Voice Assistant', path: '/dashboard', icon: MessageSquare },
          { name: 'History & Logs', path: '/history', icon: History },
          { name: 'Settings', path: '/settings', icon: Settings },
        ]
      : []),
  ];

  const handleLogout = () => {
    stopSpeech();
    logout();
    navigate('/login');
  };

  const handleLaunchScenario = (scenario) => {
    setLanguage(scenario.language);
    localStorage.setItem('voicebridge_pref_domain', scenario.domain);
    localStorage.setItem('voicebridge_pending_prompt', scenario.prompt);
    navigate('/dashboard');
  };

  return (
    <>
      <header className="sticky top-0 z-[100] w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-emerald-500 to-teal-400 p-0.5 shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Mic className="w-5 h-5 text-brand-400 animate-pulse-subtle" />
              </div>
              {isSpeaking && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent tracking-tight">
                  VoiceBridge
                </span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide hidden sm:block">
                Multilingual Voice Intelligence
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-500' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Global Controls & Auth Actions */}
          <div className="flex items-center space-x-2">
            {/* Active Language Badge */}
            <div
              title={`Active Spoken & AI Language: ${currentLanguageMeta?.name || 'English'}`}
              className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs"
            >
              <Globe className="w-3.5 h-3.5 text-brand-500 shrink-0" />
              <span>{currentLanguageMeta?.short || 'EN'}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-400 font-normal hidden lg:inline">
                ({currentLanguageMeta?.native || 'English'})
              </span>
            </div>

            {/* Professor Presentation Button */}
            <button
              onClick={() => setPresentationModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-teal-500 text-white font-semibold text-xs shadow-sm hover:scale-[1.02] transition-transform"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Professor Deck</span>
            </button>

            {/* Active Speaking Indicator */}
            {isSpeaking && (
              <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-500/30 text-xs text-brand-600 dark:text-brand-400">
                <AudioWaveVisualizer isPlaying={true} count={4} />
                <span className="font-medium">Speaking</span>
              </div>
            )}

            {/* Mute/Unmute Toggle */}
            <button
              onClick={toggleMute}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              className={`p-2 rounded-lg transition-colors ${
                isMuted
                  ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* User Profile / Auth State */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-500 to-teal-400 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                    {user.full_name ? user.full_name.charAt(0) : 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                      {user.full_name?.split(' ')[0]}
                    </p>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                      {user.role || 'User'}
                    </span>
                  </div>
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <div
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 py-2 shadow-2xl ring-1 ring-black/10 dark:ring-white/10 z-[110] animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Signed in as</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">{user.email}</p>
                      <div className="mt-1.5 flex items-center space-x-1.5 text-[11px] text-brand-600 dark:text-brand-400 font-medium">
                        <Shield className="w-3 h-3" />
                        <span className="capitalize">Role: {user.role || 'Student'}</span>
                      </div>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span>Workspace Assistant</span>
                    </Link>

                    <Link
                      to="/history"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      <span>Conversations & Logs</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Audio & Preferences</span>
                    </Link>

                    <div className="border-t border-slate-200 dark:border-slate-800 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 rounded-lg shadow-sm shadow-brand-500/20 transition-all hover:shadow"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg px-4 pt-2 pb-4 space-y-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setPresentationModalOpen(true);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Professor Presentation Deck</span>
            </button>

            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
            {isAuthenticated && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        )}

        {/* Living Multi-Color Spectrum Wave Line running Left to Right */}
        <div className="absolute bottom-0 inset-x-0 h-[2.5px] overflow-hidden pointer-events-none">
          <div className="w-full h-full rainbow-wave-gradient opacity-90 shadow-sm" />
        </div>
      </header>

      {/* Presentation Modal */}
      <PresentationModal
        isOpen={presentationModalOpen}
        onClose={() => setPresentationModalOpen(false)}
        onLaunchScenario={handleLaunchScenario}
      />
    </>
  );
}
