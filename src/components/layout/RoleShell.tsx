'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  Cpu,
  Activity,
  FileText,
  Settings,
  Bell,
  Search,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Sparkles,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  Languages,
  FolderKanban,
  CheckSquare,
  BarChart3,
  FilePlus2,
  History,
  Clock,
  AlertTriangle,
  User,
  Shield,
  Layers,
} from 'lucide-react';
import { BrandSenseLogo } from '@/components/ui/BrandSenseLogo';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { authClient, getDashboardRouteForRole } from '@/services/auth-client';
import { SensaChatDrawer } from '@/components/assistant/SensaChatDrawer';

export type UserRoleType = 'Super Admin' | 'Admin' | 'Creator' | 'Reviewer' | 'Manager';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeCount?: number;
  highlight?: boolean;
}

interface RoleShellProps {
  role: 'Super Admin' | 'Admin' | 'Creator' | 'Reviewer';
  title?: string;
  children: React.ReactNode;
}

export const RoleShell: React.FC<RoleShellProps> = ({ role, title, children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { toast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sensaOpen, setSensaOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // Strict Role RBAC Guard: Verify authorized role access
  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      // Redirect to role-specific login
      const loginRoute = 
        role === 'Super Admin' ? '/super-admin/login' :
        role === 'Admin' ? '/admin/login' :
        role === 'Creator' ? '/creator/login' : '/reviewer/login';
      router.replace(loginRoute);
      return;
    }

    const currentRole = user.role as string;
    // Super Admin can access everything
    if (currentRole === 'Super Admin') return;

    // Organization Admin guard
    if (role === 'Admin' && currentRole !== 'Admin') {
      toast(`Access restricted: your account is '${currentRole}'`, 'error');
      redirectToRoleDashboard(currentRole);
    }
    // Creator guard
    else if (role === 'Creator' && currentRole !== 'Creator') {
      toast(`Access restricted: your account is '${currentRole}'`, 'error');
      redirectToRoleDashboard(currentRole);
    }
    // Reviewer guard (Reviewer & Manager can access Reviewer portal)
    else if (role === 'Reviewer' && !['Reviewer', 'Manager'].includes(currentRole)) {
      toast(`Access restricted: your account is '${currentRole}'`, 'error');
      redirectToRoleDashboard(currentRole);
    }
    // Super Admin guard
    else if (role === 'Super Admin' && currentRole !== 'Super Admin') {
      toast("Access denied: Operation requires platform 'Super Admin' authorization.", 'error');
      redirectToRoleDashboard(currentRole);
    }
  }, [user, isLoading, role, router]);

  const redirectToRoleDashboard = (userRole: string) => {
    router.replace(getDashboardRouteForRole(userRole));
  };

  // Close menus on outside click or escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setProfileMenuOpen(false);
        setNotifDropdownOpen(false);
        setSidebarOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setProfileMenuOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Ensure drawers and menus automatically close on route navigation
  useEffect(() => {
    setSidebarOpen(false);
    setProfileMenuOpen(false);
    setNotifDropdownOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setLogoutConfirmOpen(false);
    toast('You have been signed out.', 'success');
    const exitRoute = 
      role === 'Super Admin' ? '/super-admin/login' :
      role === 'Admin' ? '/admin/login' :
      role === 'Creator' ? '/creator/login' : '/reviewer/login';
    router.replace(exitRoute);
  };

  const handleDemoSwitch = async (roleSlug: string) => {
    setProfileMenuOpen(false);
    try {
      const res = await authClient.loginAsDemo(roleSlug);
      if (res.success && res.user) {
        toast(`Switched persona to: ${res.user.name} (${res.user.role})`, 'success');
        const dest = 
          roleSlug === 'creator' ? '/creator/dashboard' :
          roleSlug === 'reviewer' || roleSlug === 'manager' ? '/reviewer/dashboard' :
          roleSlug === 'admin' ? '/admin/dashboard' :
          roleSlug === 'super-admin' ? '/super-admin/dashboard' : '/dashboard';
        window.location.href = dest;
      }
    } catch (err: any) {
      toast(err?.message || 'Failed to switch demo persona', 'error');
    }
  };

  // Role Navigation Schemas
  const navigationConfig: Record<string, NavItem[]> = {
    'Super Admin': [
      { name: 'Platform Overview', href: '/super-admin/dashboard', icon: LayoutDashboard },
      { name: 'Organisations', href: '/super-admin/organisations', icon: Building2 },
      { name: 'User Directory', href: '/super-admin/users', icon: Users },
      { name: 'AI Engine Config', href: '/super-admin/ai-config', icon: Cpu },
      { name: 'System Health', href: '/super-admin/system', icon: Activity },
      { name: 'Activity Audit Logs', href: '/super-admin/activity-logs', icon: FileText },
      { name: 'Platform Settings', href: '/super-admin/settings', icon: Settings },
    ],
    'Admin': [
      { name: 'Governance Center', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Brand Guidelines', href: '/admin/brand-guidelines', icon: BookOpen },
      { name: 'Approved Facts', href: '/admin/approved-facts', icon: CheckCircle2 },
      { name: 'Terminology & Rules', href: '/admin/terminology', icon: Languages },
      { name: 'Brand Assets', href: '/admin/brand-assets', icon: FolderKanban },
      { name: 'Users & Access', href: '/admin/team', icon: Users },
      { name: 'Content Library', href: '/admin/content', icon: FileText },
      { name: 'Reviews & Approvals', href: '/admin/reviews', icon: CheckSquare },
      { name: 'Governance Analytics', href: '/admin/analytics', icon: BarChart3 },
      { name: 'Notifications', href: '/admin/notifications', icon: Bell },
      { name: 'Organisation Settings', href: '/admin/settings', icon: Settings },
    ],
    'Creator': [
      { name: 'Creator Dashboard', href: '/creator/dashboard', icon: LayoutDashboard },
      { name: 'New AI Review', href: '/creator/new-review', icon: FilePlus2, badge: 'Run AI' },
      { name: 'My Content Drafts', href: '/creator/my-content', icon: FileText },
      { name: 'Review History', href: '/creator/history', icon: History },
      { name: 'Ask SENSA AI', href: '/assistant', icon: Sparkles, highlight: true },
      { name: 'Notifications', href: '/creator/notifications', icon: Bell },
      { name: 'My Profile', href: '/creator/profile', icon: User },
      { name: 'Creator Settings', href: '/creator/settings', icon: Settings },
    ],
    'Reviewer': [
      { name: 'Review Dashboard', href: '/reviewer/dashboard', icon: LayoutDashboard },
      { name: 'Assigned Queue', href: '/reviewer/assigned', icon: Clock },
      { name: 'Approved Content', href: '/reviewer/approved', icon: CheckCircle2 },
      { name: 'Rejected & Revisions', href: '/reviewer/rejected', icon: AlertTriangle },
      { name: 'Decision History', href: '/reviewer/history', icon: History },
      { name: 'SENSA Copilot', href: '/assistant', icon: Sparkles, highlight: true },
      { name: 'Notifications', href: '/reviewer/notifications', icon: Bell },
      { name: 'Reviewer Profile', href: '/reviewer/profile', icon: User },
      { name: 'Reviewer Settings', href: '/reviewer/settings', icon: Settings },
    ],
  };

  const navItems = navigationConfig[role] || navigationConfig['Admin'];

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'BS';

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#EDF3F6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#416F89] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-[#4F6576]">Authenticating session...</p>
        </div>
      </div>
    );
  }

  const currentRole = user.role as string;
  const isAuthorized =
    currentRole === 'Super Admin' ||
    (role === 'Admin' && currentRole === 'Admin') ||
    (role === 'Creator' && currentRole === 'Creator') ||
    (role === 'Reviewer' && ['Reviewer', 'Manager'].includes(currentRole));

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#EDF3F6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#416F89] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-[#4F6576]">Redirecting to authorized workspace...</p>
        </div>
      </div>
    );
  }

  // Derive display styling from the authenticated user's actual role, not the route prop
  const roleStyles = {
    'Super Admin': {
      pillBg: 'bg-purple-100 text-purple-800 border-purple-200',
      pillLabel: 'SUPER ADMIN ROOT',
      workspaceLabel: 'Global Platform Control',
      actionBtnText: 'System Health',
      actionBtnHref: '/super-admin/system',
    },
    'Admin': {
      pillBg: 'bg-blue-100 text-blue-800 border-blue-200',
      pillLabel: 'ORGANISATION ADMIN',
      workspaceLabel: user.organisation || 'Organisation Workspace',
      actionBtnText: 'Submit Content',
      actionBtnHref: '/creator/new-review',
    },
    'Creator': {
      pillBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      pillLabel: 'CONTENT CREATOR',
      workspaceLabel: 'Creator Studio',
      actionBtnText: 'Run AI Review',
      actionBtnHref: '/creator/new-review',
    },
    'Reviewer': {
      pillBg: 'bg-amber-100 text-amber-800 border-amber-200',
      pillLabel: 'REVIEWER & COMPLIANCE',
      workspaceLabel: 'Governance Queue',
      actionBtnText: 'View Queue',
      actionBtnHref: '/reviewer/assigned',
    },
    'Manager': {
      pillBg: 'bg-amber-100 text-amber-800 border-amber-200',
      pillLabel: 'REVIEWER & COMPLIANCE',
      workspaceLabel: 'Governance Queue',
      actionBtnText: 'View Queue',
      actionBtnHref: '/reviewer/assigned',
    },
  }[currentRole] || {
    pillBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    pillLabel: 'CONTENT CREATOR',
    workspaceLabel: 'Creator Studio',
    actionBtnText: 'Run AI Review',
    actionBtnHref: '/creator/new-review',
  };

  return (
    <div className="bs-app-shell min-h-screen text-[#20364A] flex flex-col font-sans antialiased bg-[#EDF3F6]">
      <div className="flex flex-1 min-h-screen">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-[#20364A]/45 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Role-Specific Isolated Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#C4D5E0] flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Brand Logo & Role Pill */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-[#C4D5E0]">
            <div className="flex items-center gap-2">
              <BrandSenseLogo />
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-[#4F6576] hover:bg-[#F4F8FA]"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role Portal Indicator Badge */}
          <div className="px-4 py-3 bg-[#F4F8FA] border-b border-[#C4D5E0]">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${roleStyles.pillBg}`}>
                {roleStyles.pillLabel}
              </span>
              {user?.isDemo && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  Demo Sandbox
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-[#20364A] truncate mt-1">
              {roleStyles.workspaceLabel}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-[#416F89] text-white shadow-sm'
                      : item.highlight
                      ? 'text-[#20364A] bg-[#F4D77B]/20 hover:bg-[#F4D77B]/30'
                      : 'text-[#4F6576] hover:text-[#20364A] hover:bg-[#F4F8FA]'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-[#B77938]' : 'text-[#4F6576]'}`} />
                    <span className="truncate">{item.name}</span>
                  </div>

                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-[#F4D77B] text-[#20364A]">
                      {item.badge}
                    </span>
                  )}
                  {item.badgeCount !== undefined && item.badgeCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#A94842] text-white">
                      {item.badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Footer */}
          <div className="p-3 border-t border-[#C4D5E0] relative" ref={profileMenuRef}>
            {profileMenuOpen && (
              <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-xl shadow-dropdown border border-[#C4D5E0] py-1.5 z-50 animate-in zoom-in-95">
                <div className="px-3 py-2 border-b border-[#C4D5E0]">
                  <p className="text-xs font-bold text-[#20364A] truncate">{user?.name}</p>
                  <p className="text-[11px] text-[#4F6576] truncate">{user?.email}</p>
                  <p className="text-[10px] font-semibold text-[#416F89] mt-0.5">Role: {user?.role}</p>
                </div>

                <Link
                  href={currentRole === 'Super Admin' ? '/super-admin/settings' : currentRole === 'Admin' ? '/admin/settings' : currentRole === 'Creator' ? '/creator/profile' : '/reviewer/profile'}
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#20364A] hover:bg-[#F4F8FA]"
                >
                  <Settings className="w-4 h-4 text-[#4F6576]" />
                  Settings & Profile
                </Link>

                {user?.isDemo && (
                  <>
                    <div className="px-3 py-1.5 text-[10px] font-bold text-[#718494] uppercase tracking-wider border-t border-[#C4D5E0] bg-[#F4F8FA]">
                      Switch Demo Persona
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDemoSwitch('creator')}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-[#EDF3F6] transition-colors ${role === 'Creator' ? 'text-[#1F7560] font-bold bg-emerald-50/50' : 'text-[#20364A] font-medium'}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Creator (Marcus)
                      </span>
                      {role === 'Creator' && <span className="text-[10px] text-emerald-700 font-bold">Active</span>}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoSwitch('reviewer')}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-[#EDF3F6] transition-colors ${role === 'Reviewer' ? 'text-[#9A682D] font-bold bg-amber-50/50' : 'text-[#20364A] font-medium'}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Reviewer (Sarah Chen)
                      </span>
                      {role === 'Reviewer' && <span className="text-[10px] text-amber-700 font-bold">Active</span>}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoSwitch('admin')}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-[#EDF3F6] transition-colors ${role === 'Admin' ? 'text-[#315C74] font-bold bg-blue-50/50' : 'text-[#20364A] font-medium'}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Admin (Julian)
                      </span>
                      {role === 'Admin' && <span className="text-[10px] text-blue-700 font-bold">Active</span>}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoSwitch('super-admin')}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-[#EDF3F6] transition-colors ${role === 'Super Admin' ? 'text-purple-700 font-bold bg-purple-50/50' : 'text-[#20364A] font-medium'}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        Super Admin (Alex)
                      </span>
                      {role === 'Super Admin' && <span className="text-[10px] text-purple-700 font-bold">Active</span>}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        authClient.resetDemoData();
                        toast('Demo sandbox reset to initial seeds.');
                        setTimeout(() => window.location.reload(), 300);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#B77938] hover:bg-amber-50 border-t border-[#C4D5E0]"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset Demo State
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    setLogoutConfirmOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#A94842] hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#F4F8FA] transition-colors text-left"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-[#C4D5E0] flex-shrink-0"
                  />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-[#20364A] text-white text-xs font-extrabold flex items-center justify-center border border-[#C4D5E0] flex-shrink-0">
                    {initials}
                  </span>
                )}
                <div className="truncate">
                  <p className="text-xs font-bold text-[#20364A] truncate">{user?.name || 'User'}</p>
                  <p className="text-[11px] text-[#4F6576] truncate">{user?.role}</p>
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-[#4F6576] transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header Bar */}
          <header className="h-16 bg-white border-b border-[#C4D5E0] flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 shadow-subtle">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-[#4F6576] hover:bg-[#F4F8FA]"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-heading text-sm sm:text-base font-bold text-[#20364A] truncate">
                  {title || roleStyles.workspaceLabel}
                </h1>
                <p className="text-[11px] text-[#4F6576] hidden sm:block">
                  BrandSense AI Governance Platform
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notification Alerts */}
              <div className="relative" ref={notifDropdownRef}>
                <button
                  type="button"
                  onClick={() => setNotifDropdownOpen((prev) => !prev)}
                  className="p-2 rounded-lg text-[#4F6576] hover:text-[#20364A] hover:bg-[#F4F8FA] transition-colors relative"
                  aria-label="View notifications"
                >
                  <Bell className="w-4 h-4" />
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-dropdown border border-[#C4D5E0] py-2 z-50">
                    <div className="px-4 py-2 border-b border-[#C4D5E0] flex items-center justify-between">
                      <span className="text-xs font-bold text-[#20364A]">Governance Notifications</span>
                      <span className="text-[10px] font-bold text-[#4F6576] bg-[#EDF3F6] px-2 py-0.5 rounded">0 Unread</span>
                    </div>
                    <div className="px-4 py-8 text-center text-xs">
                      <Bell className="w-6 h-6 mx-auto mb-2 text-[#C4D5E0]" />
                      <p className="font-bold text-[#20364A]">No New Notifications</p>
                      <p className="text-[#4F6576] text-[11px] mt-1">You're all caught up! New alerts will appear here when content is submitted or reviewed.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <Link
                href={roleStyles.actionBtnHref}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#416F89] hover:bg-[#315C74] text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                <span>{roleStyles.actionBtnText}</span>
              </Link>
            </div>
          </header>

          {/* Child Page Content */}
          <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto flex flex-col justify-between">
            <div className="flex-1">
              {children}
            </div>
            <div className="pt-8 pb-4 border-t border-[#D5E3EC]/60 mt-10">
              <p className="text-center text-[11px] font-medium text-[#718494]">
                © 2026 BrandSense. All rights reserved.
              </p>
            </div>
          </main>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {logoutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#20364A]/50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-elevated border border-[#C4D5E0] space-y-4">
            <h3 className="font-heading font-bold text-base text-[#20364A]">Confirm Sign Out</h3>
            <p className="text-xs text-[#4F6576]">Are you sure you want to end your current session?</p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setLogoutConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
