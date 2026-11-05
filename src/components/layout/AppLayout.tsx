'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FilePlus2,
  History,
  BookMarked,
  CheckSquare,
  BarChart3,
  Sparkles,
  Settings,
  Bell,
  Search,
  ChevronDown,
  Menu,
  X,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { BrandSenseLogo } from '@/components/ui/BrandSenseLogo';
import { Button } from '@/components/ui/Button';
import { currentUser, sampleOrganizations } from '@/data/mock-data';
import { SensaChatDrawer } from '@/components/assistant/SensaChatDrawer';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { RequireAuth } from '@/components/auth/RequireAuth';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sensaOpen, setSensaOpen] = useState(false);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(sampleOrganizations[0]);
  const { toast } = useToast();

  const accountUser = user ?? currentUser;
  const accountInitials = accountUser.name
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    logout();
    setLogoutConfirmOpen(false);
    setProfileMenuOpen(false);
    toast('You have been signed out.', 'success');
    router.replace('/login');
  };

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'New Review', href: '/review/new', icon: FilePlus2, badge: 'New' },
    { name: 'Review History', href: '/history', icon: History },
    { name: 'Brand Knowledge', href: '/knowledge', icon: BookMarked },
    { name: 'Approvals', href: '/approvals', icon: CheckSquare, badgeCount: 3 },
    { name: 'Insights', href: '/insights', icon: BarChart3 },
    { name: 'SENSA AI', href: '/assistant', icon: Sparkles, highlight: true },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const getBreadcrumb = () => {
    if (pathname === '/dashboard') return 'Dashboard Overview';
    if (pathname === '/review/new') return 'New Content Submission';
    if (pathname.startsWith('/review') && pathname.includes('rewrite')) return 'AI Rewrite Studio';
    if (pathname.startsWith('/review')) return 'Review Analysis & Findings';
    if (pathname === '/knowledge') return 'Brand Governance Knowledge Base';
    if (pathname === '/approvals') return 'Publication Approvals';
    if (pathname === '/insights') return 'Governance & Compliance Insights';
    if (pathname === '/history') return 'Revisions & Audit History';
    if (pathname === '/assistant') return 'SENSA Brand Intelligence';
    if (pathname === '/settings') return 'Enterprise Settings';
    return 'Brand Governance';
  };

  return (
    <RequireAuth>
    <div className="bs-app-shell min-h-screen text-[#263B4D] flex flex-col font-sans antialiased">
      <div className="flex flex-1 min-h-screen">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-[#20364A]/45 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky lg:top-0 inset-y-0 left-0 z-40 w-64 h-screen bg-white/80 backdrop-blur-[18px] border-r border-white/80 flex flex-col justify-between transition-transform duration-200 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="flex flex-col flex-1 overflow-y-auto">
            <div className="h-[72px] px-5 flex items-center justify-between border-b border-[#C4D5E0]">
              <BrandSenseLogo />
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 text-[#718494] hover:text-[#20364A] rounded-md"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Org switcher */}
            <div className="px-3 py-3 border-b border-[#C4D5E0] relative">
              <button
                onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#F4F8FA] hover:bg-[#EDF3F6] text-left border border-[#C4D5E0] transition-colors"
                aria-expanded={orgDropdownOpen}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-7 h-7 rounded-md bg-[#20364A] text-white flex items-center justify-center font-heading font-extrabold text-xs flex-shrink-0">
                    {selectedOrg.name.charAt(0)}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-[#20364A] truncate">{selectedOrg.name}</p>
                    <p className="text-[10px] text-[#416F89] font-semibold">{selectedOrg.tier}</p>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#718494] flex-shrink-0 ml-1" />
              </button>

              {orgDropdownOpen && (
                <div className="absolute top-16 left-3 right-3 bg-white rounded-xl shadow-dropdown border border-[#C4D5E0] py-1.5 z-50 animate-in zoom-in-95">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase text-[#718494] tracking-wider">
                    Select Workspace
                  </div>
                  {sampleOrganizations.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => {
                        setSelectedOrg(org);
                        setOrgDropdownOpen(false);
                        toast(`Switched workspace to ${org.name}`);
                      }}
                      className="w-full px-3 py-2 text-left text-xs hover:bg-[#EDF3F6] flex items-center justify-between"
                    >
                      <span className={selectedOrg.id === org.id ? 'font-bold text-[#416F89]' : 'text-[#263B4D]'}>
                        {org.name}
                      </span>
                      {selectedOrg.id === org.id && <span className="w-1.5 h-1.5 rounded-full bg-[#416F89]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <nav className="p-3 space-y-0.5" aria-label="Main navigation">
              <div className="px-3 pt-2 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-[#718494]">
                Brand Platform
              </div>
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`
                      group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors duration-150 border-l-2
                      ${isActive
                        ? 'bg-[#D5E3EC]/60 text-[#20364A] border-[#416F89]'
                        : 'border-transparent text-[#526B7C] hover:text-[#20364A] hover:bg-[#F4F8FA]'
                      }
                      ${item.highlight && !isActive ? 'text-[#416F89]' : ''}
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#416F89]' : item.highlight ? 'text-[#416F89]' : 'text-[#718494] group-hover:text-[#20364A]'}`} />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-[#416F89] text-white rounded">
                        {item.badge}
                      </span>
                    )}

                    {item.badgeCount && (
                      <span className="min-w-[18px] px-1.5 py-0.5 text-[10px] font-bold bg-[#F4D77B] text-[#20364A] rounded-pill text-center">
                        {item.badgeCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* SENSA callout */}
          {pathname !== '/assistant' && (
            <div className="p-4 m-3 bg-[#20364A] text-white rounded-xl">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F4D77B]" />
                <span className="text-xs font-heading font-extrabold text-white">SENSA Co-Pilot</span>
              </div>
              <p className="text-[11px] text-[#C0D0D9] leading-relaxed mb-3">
                Instant claim and voice verification against active brand guidelines.
              </p>
              <button
                onClick={() => setSensaOpen(true)}
                className="w-full py-2 px-3 bg-[#416F89] hover:bg-[#315C74] text-white text-xs font-bold rounded-lg transition-colors"
              >
                Ask SENSA
              </button>
            </div>
          )}

          {/* Account */}
          <div className="p-3 border-t border-[#C4D5E0]">
            <div className="relative">
              {profileMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-dropdown border border-[#C4D5E0] py-1.5 z-50 animate-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-[#C4D5E0]">
                    <p className="text-xs font-bold text-[#20364A] truncate">{accountUser.name}</p>
                    <p className="text-[10px] text-[#718494] truncate">{accountUser.email}</p>
                  </div>
                  <Link
                    href="/settings"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#263B4D] hover:bg-[#F4F8FA] transition-colors"
                  >
                    <Settings className="w-4 h-4 text-[#718494]" />
                    Account settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setLogoutConfirmOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#A94842] hover:bg-[#C65E57]/8 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setProfileMenuOpen((open) => !open)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#F4F8FA] transition-colors text-left"
                aria-expanded={profileMenuOpen}
                aria-haspopup="menu"
                aria-label="Open profile menu"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  {accountUser.avatar ? (
                    <img
                      src={accountUser.avatar}
                      alt={accountUser.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#C4D5E0]"
                    />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-[#20364A] text-white text-[10px] font-extrabold flex items-center justify-center border border-[#C4D5E0] flex-shrink-0">
                      {accountInitials}
                    </span>
                  )}
                  <div className="truncate">
                    <p className="text-xs font-bold text-[#20364A] truncate">{accountUser.name}</p>
                    <p className="text-[10px] text-[#718494] truncate">{accountUser.role}</p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#718494] flex-shrink-0 ml-1 transition-transform ${
                    profileMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-[72px] bg-[#EDF3F6]/80 backdrop-blur-[22px] border-b border-[rgba(196,213,224,.65)] px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-[#718494] hover:text-[#20364A] rounded-lg hover:bg-[#F4F8FA]"
                aria-label="Open navigation"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs min-w-0">
                <span className="text-[#718494] hidden sm:inline">BrandSense</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#C4D5E0] hidden sm:inline flex-shrink-0" />
                <span className="font-semibold text-[#20364A] truncate">{getBreadcrumb()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative hidden md:block">
                <Search className="w-3.5 h-3.5 text-[#718494] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search rules, reviews..."
                  aria-label="Search rules and reviews"
                  className="pl-8 pr-12 py-2 bg-[#F4F8FA] border border-[#C4D5E0] rounded-lg text-xs w-56 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#416F89]/20 focus:border-[#416F89] text-[#263B4D]"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono bg-white border border-[#C4D5E0] text-[#526B7C] px-1.5 py-0.5 rounded">
                  ⌘K
                </span>
              </div>

              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="p-2 text-[#526B7C] hover:text-[#20364A] hover:bg-[#F4F8FA] rounded-lg relative transition-colors"
                  aria-label="Notifications"
                  aria-expanded={notifDropdownOpen}
                >
                  <Bell className="w-4 h-4" />
                  <span className="w-2 h-2 rounded-full bg-[#B77938] absolute top-2 right-2 ring-2 ring-white" />
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-dropdown border border-[#C4D5E0] py-2 z-50 animate-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-[#C4D5E0] flex items-center justify-between">
                      <span className="text-xs font-bold text-[#20364A]">Governance Alerts</span>
                      <span className="text-[10px] font-extrabold text-[#315C74] bg-[#D5E3EC] px-1.5 py-0.5 rounded">2 New</span>
                    </div>
                    <div className="divide-y divide-[#C4D5E0]/70 max-h-64 overflow-y-auto">
                      <div className="px-4 py-3 hover:bg-[#F4F8FA] text-xs">
                        <p className="font-bold text-[#20364A]">Critical Finding on Q3 Campaign</p>
                        <p className="text-[#718494] text-[11px] mt-0.5">Unverified ROI claim flagged by the rule engine.</p>
                        <span className="text-[10px] text-[#718494] mt-1 block">15 mins ago</span>
                      </div>
                      <div className="px-4 py-3 hover:bg-[#F4F8FA] text-xs">
                        <p className="font-bold text-[#20364A]">Review Approved by Legal</p>
                        <p className="text-[#718494] text-[11px] mt-0.5">Julian Thorne signed off on ESG Annual Disclosure.</p>
                        <span className="text-[10px] text-[#718494] mt-1 block">1 hour ago</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/review/new"
                className="hidden sm:inline-flex items-center gap-1.5 min-h-[36px] px-3.5 py-1.5 bg-[#416F89] hover:bg-[#315C74] text-white rounded-lg text-xs font-bold transition-colors"
              >
                <FilePlus2 className="w-3.5 h-3.5" />
                <span>Submit Review</span>
              </Link>
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>

      {pathname !== '/assistant' && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setSensaOpen(!sensaOpen)}
            className="group flex items-center gap-2.5 px-4 py-3 bg-[#20364A] hover:bg-[#315C74] text-white rounded-full shadow-elevated transition-colors active:scale-95"
            aria-label="Open SENSA Brand Intelligence Assistant"
          >
            <Sparkles className="w-4 h-4 text-[#F4D77B] flex-shrink-0" />
            <span className="text-xs font-bold tracking-tight">Ask SENSA</span>
          </button>
        </div>
      )}

      <SensaChatDrawer isOpen={sensaOpen} onClose={() => setSensaOpen(false)} />

      {logoutConfirmOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-dialog-title"
        >
          <div
            className="absolute inset-0 bg-[#20364A]/45 animate-in"
            onClick={() => setLogoutConfirmOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-sm bg-white rounded-xl border border-[#C4D5E0] shadow-elevated p-6 animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-xl bg-[#C65E57]/10 text-[#A94842] flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <h2
              id="logout-dialog-title"
              className="mt-4 font-heading text-base font-extrabold text-[#20364A]"
            >
              Sign out of BrandSense?
            </h2>
            <p className="mt-1.5 text-xs text-[#718494] leading-relaxed">
              You will need to sign in again to access your workspace and reviews.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setLogoutConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                leftIcon={<LogOut className="w-3.5 h-3.5" />}
                onClick={handleLogout}
              >
                Log out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
    </RequireAuth>
  );
};
