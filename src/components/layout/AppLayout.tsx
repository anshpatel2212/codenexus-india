'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  RotateCcw,
} from 'lucide-react';
import { BrandSenseLogo } from '@/components/ui/BrandSenseLogo';
import { Button } from '@/components/ui/Button';
import { currentUser, sampleOrganizations } from '@/data/mock-data';
import { SensaChatDrawer } from '@/components/assistant/SensaChatDrawer';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { authClient } from '@/services/auth-client';
import { apiClient } from '@/services/api-client';
import { ApprovalItem } from '@/types';
import { TeamCredit } from '@/components/ui/TeamCredit';

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
  const [selectedOrg, setSelectedOrg] = useState<{ id: string; name: string; tier: string; reviewsThisMonth: number; logo?: string }>(() => ({
    id: user?.organizationId || 'org-user',
    name: user?.organisation || 'BrandSense Workspace',
    tier: `${user?.role || 'Brand Manager'} Workspace`,
    reviewsThisMonth: 0,
    logo: (user?.organisation || 'BrandSense').charAt(0).toUpperCase(),
  }));
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  useEffect(() => {
    if (user?.organizationId) {
      apiClient.getApprovals(user.organizationId).then((approvals: ApprovalItem[]) => {
        const pending = (approvals || []).filter((a: ApprovalItem) => a.status === 'Pending').length;
        setPendingApprovalsCount(pending);
      });
    }
  }, [user?.organizationId]);

  useEffect(() => {
    if (user?.organisation) {
      setSelectedOrg({
        id: user.organizationId || 'org-user',
        name: user.organisation,
        tier: user.role === 'Admin' ? 'Enterprise Governance' : `${user.role || 'Member'} Workspace`,
        reviewsThisMonth: 0,
        logo: user.organisation.charAt(0).toUpperCase(),
      });
    }
  }, [user?.organisation, user?.organizationId, user?.role]);
  const { toast } = useToast();

  const orgDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const logoutDialogRef = useRef<HTMLDivElement>(null);

  const accountUser = user ?? currentUser;
  const accountInitials = accountUser.name
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Close menus on outside click or Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (logoutConfirmOpen) {
          setLogoutConfirmOpen(false);
        } else if (sensaOpen) {
          setSensaOpen(false);
        } else if (orgDropdownOpen) {
          setOrgDropdownOpen(false);
        } else if (notifDropdownOpen) {
          setNotifDropdownOpen(false);
        } else if (profileMenuOpen) {
          setProfileMenuOpen(false);
        } else if (sidebarOpen) {
          setSidebarOpen(false);
        }
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (orgDropdownRef.current && !orgDropdownRef.current.contains(target)) {
        setOrgDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(target)) {
        setNotifDropdownOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [logoutConfirmOpen, sensaOpen, orgDropdownOpen, notifDropdownOpen, profileMenuOpen, sidebarOpen]);

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
    { name: 'Approvals', href: '/approvals', icon: CheckSquare, badgeCount: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined },
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
      <div className="bs-app-shell min-h-screen text-[#20364A] flex flex-col font-sans antialiased">
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
              fixed lg:sticky lg:top-0 inset-y-0 left-0 z-40 w-64 h-screen bg-white/90 backdrop-blur-[18px] border-r border-[#C4D5E0] flex flex-col justify-between transition-transform duration-200 ease-in-out
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}
            aria-label="Application sidebar"
          >
            <div className="flex flex-col flex-1 overflow-y-auto">
              <div className="h-[72px] px-5 flex items-center justify-between border-b border-[#C4D5E0]">
                <BrandSenseLogo />
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-2 text-[#4F6576] hover:text-[#20364A] rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89]"
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Org switcher */}
              <div className="px-3 py-3 border-b border-[#C4D5E0] relative" ref={orgDropdownRef}>
                <button
                  type="button"
                  onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#F4F8FA] hover:bg-[#EDF3F6] text-left border border-[#C4D5E0] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89]"
                  aria-expanded={orgDropdownOpen}
                  aria-haspopup="listbox"
                  aria-label={`Current workspace: ${selectedOrg.name}. Click to change workspace`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-7 h-7 rounded-md bg-[#20364A] text-white flex items-center justify-center font-heading font-extrabold text-xs flex-shrink-0" aria-hidden="true">
                      {selectedOrg.name.charAt(0)}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-[#20364A] truncate">{selectedOrg.name}</p>
                      <p className="text-xs text-[#315C74] font-semibold">{selectedOrg.tier}</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#4F6576] flex-shrink-0 ml-1 transition-transform ${orgDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>

                {orgDropdownOpen && (
                  <div
                    className="absolute top-16 left-3 right-3 bg-white rounded-xl shadow-dropdown border border-[#C4D5E0] py-1.5 z-50 animate-in zoom-in-95"
                    role="listbox"
                    aria-label="Workspaces"
                  >
                    <div className="px-3 py-1 text-xs font-bold uppercase text-[#4F6576] tracking-wider">
                      Select Workspace
                    </div>
                    {(user?.organisation && user.organizationId !== 'org-1'
                      ? [
                          {
                            id: user.organizationId || 'org-user',
                            name: user.organisation,
                            tier: `${user.role || 'Member'} Workspace`,
                            reviewsThisMonth: 0,
                            logo: user.organisation.charAt(0).toUpperCase(),
                          },
                          ...sampleOrganizations,
                        ]
                      : sampleOrganizations
                    ).map((org) => (
                      <button
                        key={org.id}
                        type="button"
                        role="option"
                        aria-selected={selectedOrg.id === org.id}
                        onClick={() => {
                          setSelectedOrg(org);
                          setOrgDropdownOpen(false);
                          toast(`Switched workspace to ${org.name}`);
                        }}
                        className="w-full px-3 py-2 text-left text-xs hover:bg-[#EDF3F6] flex items-center justify-between focus:outline-none focus-visible:bg-[#EDF3F6]"
                      >
                        <span className={selectedOrg.id === org.id ? 'font-bold text-[#416F89]' : 'text-[#20364A]'}>
                          {org.name}
                        </span>
                        {selectedOrg.id === org.id && <span className="w-2 h-2 rounded-full bg-[#416F89]" aria-hidden="true" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <nav className="p-3 space-y-0.5" aria-label="Main navigation">
                <div className="px-3 pt-2 pb-2 text-xs font-bold uppercase tracking-wider text-[#4F6576]">
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
                        group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors duration-150 border-l-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89]
                        ${isActive
                          ? 'bg-[#D5E3EC]/70 text-[#20364A] border-[#416F89] font-bold'
                          : 'border-transparent text-[#4F6576] hover:text-[#20364A] hover:bg-[#F4F8FA]'
                        }
                        ${item.highlight && !isActive ? 'text-[#315C74] font-bold' : ''}
                      `}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#416F89]' : item.highlight ? 'text-[#416F89]' : 'text-[#4F6576] group-hover:text-[#20364A]'}`} aria-hidden="true" />
                        <span>{item.name}</span>
                      </div>

                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-[#416F89] text-white rounded">
                          {item.badge}
                        </span>
                      )}

                      {item.badgeCount && (
                        <span className="min-w-[20px] px-1.5 py-0.5 text-xs font-bold bg-[#F4D77B] text-[#20364A] rounded-full text-center">
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
              <div className="p-4 m-3 bg-[#20364A] text-white rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-4 h-4 text-[#F4D77B]" aria-hidden="true" />
                  <span className="text-xs font-heading font-extrabold text-white">SENSA Co-Pilot</span>
                </div>
                <p className="text-xs text-[#D5E3EC] leading-relaxed mb-3">
                  Instant claim and voice verification against active brand guidelines.
                </p>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setSensaOpen(true)}
                  className="w-full"
                >
                  Ask SENSA
                </Button>
              </div>
            )}

            {/* Account */}
            <div className="p-3 border-t border-[#C4D5E0]" ref={profileMenuRef}>
              <div className="relative">
                {profileMenuOpen && (
                  <div
                    className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-dropdown border border-[#C4D5E0] py-1.5 z-50 animate-in zoom-in-95"
                    role="menu"
                    aria-label="User account actions"
                  >
                    <div className="px-3 py-2 border-b border-[#C4D5E0]">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-[#20364A] truncate">{accountUser.name}</p>
                        {accountUser.isDemo && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F4D77B]/40 text-[#9A682D] border border-[#B77938]/30">
                            Demo Sandbox
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#4F6576] truncate">{accountUser.email}</p>
                    </div>
                    <Link
                      href="/settings"
                      role="menuitem"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#20364A] hover:bg-[#F4F8FA] transition-colors focus:outline-none focus-visible:bg-[#F4F8FA]"
                    >
                      <Settings className="w-4 h-4 text-[#4F6576]" aria-hidden="true" />
                      Account settings
                    </Link>
                    {accountUser.isDemo && (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          authClient.resetDemoData();
                          toast('Demo sandbox reset to initial seed state.');
                          setTimeout(() => window.location.reload(), 300);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#B77938] hover:bg-[#F4D77B]/20 transition-colors focus:outline-none focus-visible:bg-[#F4D77B]/20"
                      >
                        <RotateCcw className="w-4 h-4" aria-hidden="true" />
                        Reset Demo Data
                      </button>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setLogoutConfirmOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#A94842] hover:bg-[#A94842]/10 transition-colors focus:outline-none focus-visible:bg-[#A94842]/10"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" />
                      Log out
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((open) => !open)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#F4F8FA] transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89]"
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="menu"
                  aria-label="Open profile menu"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {accountUser.avatar ? (
                      <img
                        src={accountUser.avatar}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border border-[#C4D5E0]"
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-[#20364A] text-white text-xs font-extrabold flex items-center justify-center border border-[#C4D5E0] flex-shrink-0" aria-hidden="true">
                        {accountInitials}
                      </span>
                    )}
                    <div className="truncate">
                      <p className="text-xs font-bold text-[#20364A] truncate">{accountUser.name}</p>
                      <p className="text-xs text-[#4F6576] truncate">{accountUser.role}</p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#4F6576] flex-shrink-0 ml-1 transition-transform ${
                      profileMenuOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-[72px] bg-[#EDF3F6]/90 backdrop-blur-[22px] border-b border-[#C4D5E0] px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-[#4F6576] hover:text-[#20364A] rounded-lg hover:bg-[#F4F8FA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89]"
                  aria-label="Open navigation"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <nav aria-label="Breadcrumb" className="min-w-0">
                  <ol className="flex items-center gap-2 text-xs min-w-0">
                    <li className="text-[#4F6576] hidden sm:inline">BrandSense</li>
                    <li aria-hidden="true" className="text-[#C4D5E0] hidden sm:inline">
                      <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                    </li>
                    <li className="font-semibold text-[#20364A] truncate" aria-current="page">
                      {getBreadcrumb()}
                    </li>
                  </ol>
                </nav>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative hidden md:block">
                  <Search className="w-3.5 h-3.5 text-[#4F6576] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    type="search"
                    placeholder="Search rules, reviews..."
                    aria-label="Search rules and reviews"
                    className="pl-8 pr-12 py-2 bg-[#F4F8FA] border border-[#C4D5E0] rounded-lg text-xs w-56 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#416F89]/25 focus:border-[#416F89] text-[#20364A]"
                  />
                  <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono bg-white border border-[#C4D5E0] text-[#4F6576] px-1.5 py-0.5 rounded shadow-sm">
                    ⌘K
                  </kbd>
                </div>

                <div className="relative" ref={notifDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="p-2 text-[#4F6576] hover:text-[#20364A] hover:bg-[#F4F8FA] rounded-lg relative transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89]"
                    aria-label="Notifications (2 unread)"
                    aria-expanded={notifDropdownOpen}
                  >
                    <Bell className="w-4 h-4" />
                    <span className="w-2 h-2 rounded-full bg-[#9A682D] absolute top-2 right-2 ring-2 ring-white" aria-hidden="true" />
                  </button>

                  {notifDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-dropdown border border-[#C4D5E0] py-2 z-50 animate-in zoom-in-95"
                      role="region"
                      aria-label="Governance Alerts"
                    >
                      <div className="px-4 py-2 border-b border-[#C4D5E0] flex items-center justify-between">
                        <span className="text-xs font-bold text-[#20364A]">Governance Alerts</span>
                        <span className="text-xs font-bold text-[#315C74] bg-[#D5E3EC] px-2 py-0.5 rounded">2 New</span>
                      </div>
                      <div className="divide-y divide-[#C4D5E0]/70 max-h-64 overflow-y-auto">
                        <div className="px-4 py-3 hover:bg-[#F4F8FA] text-xs">
                          <p className="font-bold text-[#20364A]">Critical Finding on Q3 Campaign</p>
                          <p className="text-[#4F6576] text-xs mt-0.5">Unverified ROI claim flagged by the rule engine.</p>
                          <span className="text-xs text-[#4F6576] mt-1 block">15 mins ago</span>
                        </div>
                        <div className="px-4 py-3 hover:bg-[#F4F8FA] text-xs">
                          <p className="font-bold text-[#20364A]">Review Approved by Legal</p>
                          <p className="text-[#4F6576] text-xs mt-0.5">Julian Thorne signed off on ESG Annual Disclosure.</p>
                          <span className="text-xs text-[#4F6576] mt-1 block">1 hour ago</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href="/review/new"
                  className="hidden sm:inline-flex items-center gap-1.5 min-h-[36px] px-3.5 py-1.5 bg-[#416F89] hover:bg-[#315C74] text-white rounded-lg text-xs font-bold transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] focus-visible:ring-offset-2"
                >
                  <FilePlus2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Submit Review</span>
                </Link>
              </div>
            </header>

            <main id="main-content" className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto flex flex-col justify-between" tabIndex={-1}>
              <div className="flex-1">
                {children}
              </div>
              <div className="pt-8 pb-4 border-t border-[#D5E3EC]/60 mt-10">
                <TeamCredit />
              </div>
            </main>
          </div>
        </div>

        {pathname !== '/assistant' && (
          <div className="fixed bottom-6 right-6 z-40">
            <button
              type="button"
              onClick={() => setSensaOpen(!sensaOpen)}
              className="group flex items-center gap-2.5 px-4 py-3 bg-[#20364A] hover:bg-[#315C74] text-white rounded-full shadow-elevated transition-colors active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] focus-visible:ring-offset-2"
              aria-label="Open SENSA Brand Intelligence Assistant"
            >
              <Sparkles className="w-4 h-4 text-[#F4D77B] flex-shrink-0" aria-hidden="true" />
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
            ref={logoutDialogRef}
          >
            <div
              className="absolute inset-0 bg-[#20364A]/45 animate-in"
              onClick={() => setLogoutConfirmOpen(false)}
              aria-hidden="true"
            />
            <div className="relative w-full max-w-sm bg-white rounded-xl border border-[#C4D5E0] shadow-elevated p-6 animate-in zoom-in-95">
              <div className="w-10 h-10 rounded-xl bg-[#A94842]/10 text-[#A94842] flex items-center justify-center" aria-hidden="true">
                <LogOut className="w-5 h-5" />
              </div>
              <h2
                id="logout-dialog-title"
                className="mt-4 font-heading text-base font-extrabold text-[#20364A]"
              >
                Sign out of BrandSense?
              </h2>
              <p className="mt-1.5 text-xs text-[#4F6576] leading-relaxed">
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
                  variant="destructive"
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
