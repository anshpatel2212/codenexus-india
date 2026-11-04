'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { 
  User, 
  Building2, 
  Users, 
  Shield, 
  Bell, 
  Eye, 
  Lock, 
  Save, 
  ShieldCheck
} from 'lucide-react';
import { currentUser } from '@/data/mock-data';
import { useToast } from '@/components/ui/Toast';

type SettingsSection = 
  | 'profile' 
  | 'organization' 
  | 'team' 
  | 'roles' 
  | 'notifications' 
  | 'transparency' 
  | 'security';

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [orgName, setOrgName] = useState('Acme Enterprise Holdings');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(true);

  const teamMembers = [
    { name: 'Elena Rostova', email: 'elena.rostova@acmebrand.com', role: 'Manager', dept: 'Brand & Global Marketing', status: 'Active' },
    { name: 'Sarah Chen, Esq.', email: 's.chen@acmebrand.com', role: 'Reviewer', dept: 'Legal & Regulatory', status: 'Active' },
    { name: 'Julian Thorne', email: 'j.thorne@acmebrand.com', role: 'Admin', dept: 'Executive Governance', status: 'Active' },
    { name: 'Marcus Vance', email: 'm.vance@acmebrand.com', role: 'Creator', dept: 'Growth Copywriting', status: 'Active' },
    { name: 'David Miller', email: 'd.miller@acmebrand.com', role: 'Creator', dept: 'Partner Marketing', status: 'Active' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Settings successfully updated');
  };

  const navItems = [
    { id: 'profile', label: 'Personal Profile', icon: User },
    { id: 'organization', label: 'Organisation Settings', icon: Building2 },
    { id: 'team', label: 'Team Members', icon: Users, badge: '5' },
    { id: 'roles', label: 'Roles & Permissions', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'transparency', label: 'AI Transparency', icon: Eye },
    { id: 'security', label: 'Privacy & Security', icon: Lock },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <div>
            <span className="bs-eyebrow block mb-1.5">Settings</span>
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-[#20364A] tracking-tight">
              Enterprise Governance Settings
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#4F6576]">
              Manage personal credentials, team authorizations, AI transparency policies, and security guardrails.
            </p>
          </div>

          <Button variant="primary" size="sm" leftIcon={<Save className="w-3.5 h-3.5" aria-hidden="true" />} onClick={handleSave}>
            Save All Changes
          </Button>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <nav aria-label="Settings sections" className="lg:col-span-4 bg-white p-4 rounded-xl border border-[#C4D5E0] shadow-subtle space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4F6576] px-3 py-1 block">
              Preferences &amp; Configuration
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id as SettingsSection)}
                  aria-pressed={isActive}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] ${
                    isActive
                      ? 'bg-[#416F89]/15 text-[#20364A] border border-[#416F89]/30 shadow-sm'
                      : 'text-[#4F6576] hover:text-[#20364A] hover:bg-[#F4F8FA]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#315C74]' : 'text-[#4F6576]'}`} aria-hidden="true" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-[#D5E3EC] text-[#20364A]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-xl border border-[#C4D5E0] shadow-subtle">
            {/* 1. Profile */}
            {activeSection === 'profile' && (
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <h2 className="font-heading text-base font-bold text-[#20364A]">Personal Profile</h2>
                  <p className="text-xs text-[#4F6576] mt-0.5">Manage your credentials and governance role.</p>
                </div>

                <div className="flex items-center gap-4 pb-4 border-b border-[#C4D5E0]">
                  <img
                    src={currentUser.avatar}
                    alt=""
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#416F89]"
                  />
                  <div>
                    <Button size="sm" variant="outline" type="button" onClick={() => toast('Avatar update dialog')}>
                      Change Photo
                    </Button>
                    <p className="text-xs text-[#4F6576] mt-1">JPG, GIF or PNG. Max size 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="profile-name" className="block text-xs font-bold text-[#20364A] mb-1">Full Name</label>
                    <input
                      type="text"
                      id="profile-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-[#EDF3F6]/50 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#416F89]/25 focus:border-[#416F89] text-[#20364A]"
                    />
                  </div>

                  <div>
                    <label htmlFor="profile-email" className="block text-xs font-bold text-[#20364A] mb-1">Work Email</label>
                    <input
                      type="email"
                      id="profile-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-[#EDF3F6]/50 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#416F89]/25 focus:border-[#416F89] text-[#20364A]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#C4D5E0] flex justify-end">
                  <Button type="submit" variant="primary" size="sm">
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            )}

            {/* 2. Organisation */}
            {activeSection === 'organization' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading text-base font-bold text-[#20364A]">Organisation Settings</h2>
                  <p className="text-xs text-[#4F6576] mt-0.5">Configure company-wide workspace parameters.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="org-name" className="block text-xs font-bold text-[#20364A] mb-1">Organisation Name</label>
                    <input
                      type="text"
                      id="org-name"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-[#EDF3F6]/50 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#416F89]/25 focus:border-[#416F89] text-[#20364A]"
                    />
                  </div>

                  <div className="p-4 bg-[#EDF3F6]/60 rounded-lg border border-[#C4D5E0] text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#4F6576]">Subscription Tier:</span>
                      <span className="font-bold text-[#1F7560]">Enterprise Unlimited Plan</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#4F6576]">Reviews Processed (MTD):</span>
                      <span className="font-mono font-bold text-[#20364A]">1,420 / Unlimited</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#4F6576]">Active Brand Policies:</span>
                      <span className="font-mono font-bold text-[#20364A]">5 Active Profiles</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Team */}
            {activeSection === 'team' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-heading text-base font-bold text-[#20364A]">Team Members</h2>
                    <p className="text-xs text-[#4F6576] mt-0.5">Authorised creators, managers, and legal reviewers.</p>
                  </div>
                  <Button size="sm" variant="primary" onClick={() => toast('Invite team member modal')}>
                    Invite Member
                  </Button>
                </div>

                <div className="overflow-x-auto border border-[#C4D5E0] rounded-lg">
                  <table className="w-full text-left text-xs" aria-label="Team members table">
                    <thead className="bg-[#D5E3EC]/40 text-[#4F6576] uppercase tracking-wider text-xs font-bold border-b border-[#C4D5E0]">
                      <tr>
                        <th scope="col" className="px-4 py-3">Member</th>
                        <th scope="col" className="px-4 py-3">Role</th>
                        <th scope="col" className="px-4 py-3">Department</th>
                        <th scope="col" className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C4D5E0] text-[#263B4D]">
                      {teamMembers.map((m, idx) => (
                        <tr key={idx} className="hover:bg-[#F4F8FA]/60">
                          <td className="px-4 py-3">
                            <p className="font-bold text-[#20364A]">{m.name}</p>
                            <p className="text-xs text-[#4F6576]">{m.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2.5 py-0.5 rounded font-bold text-xs bg-[#D5E3EC]/80 text-[#20364A]">
                              {m.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#4F6576]">{m.dept}</td>
                          <td className="px-4 py-3">
                            <span className="text-[#1F7560] font-bold flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#1F7560]" aria-hidden="true" />
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. Roles */}
            {activeSection === 'roles' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading text-base font-bold text-[#20364A]">Roles &amp; Permissions</h2>
                  <p className="text-xs text-[#4F6576] mt-0.5">Enforce separation of duties for brand integrity.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-lg border border-[#C4D5E0] bg-[#EDF3F6]/50">
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#20364A] text-white">Admin</span>
                    <h3 className="font-heading font-bold text-[#20364A] mt-2 text-sm">Administrator</h3>
                    <p className="text-[#4F6576] mt-1 leading-relaxed">Full control over billing, brand guideline uploads, SSO, and user provisioning.</p>
                  </div>

                  <div className="p-4 rounded-lg border border-[#C4D5E0] bg-[#EDF3F6]/50">
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#416F89] text-white">Reviewer</span>
                    <h3 className="font-heading font-bold text-[#20364A] mt-2 text-sm">Legal Reviewer</h3>
                    <p className="text-[#4F6576] mt-1 leading-relaxed">Exclusive sign-off authority for high-stakes external publications and disclaimers.</p>
                  </div>

                  <div className="p-4 rounded-lg border border-[#C4D5E0] bg-[#EDF3F6]/50">
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#F4D77B] text-[#20364A]">Manager</span>
                    <h3 className="font-heading font-bold text-[#20364A] mt-2 text-sm">Brand Manager</h3>
                    <p className="text-[#4F6576] mt-1 leading-relaxed">Reviews tone, terminology, and accepts intent-preserving rewrites.</p>
                  </div>

                  <div className="p-4 rounded-lg border border-[#C4D5E0] bg-[#EDF3F6]/50">
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#D5E3EC] text-[#20364A]">Creator</span>
                    <h3 className="font-heading font-bold text-[#20364A] mt-2 text-sm">Content Creator</h3>
                    <p className="text-[#4F6576] mt-1 leading-relaxed">Submits drafts for AI pre-scan and adopts approved fixes before publishing.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Notifications */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading text-base font-bold text-[#20364A]">Notifications</h2>
                  <p className="text-xs text-[#4F6576] mt-0.5">Control automated warnings when critical claims are flagged.</p>
                </div>

                <div className="space-y-3 text-xs">
                  <label htmlFor="email-notifs-checkbox" className="flex items-center justify-between p-4 bg-[#EDF3F6]/50 rounded-lg border border-[#C4D5E0] cursor-pointer">
                    <div>
                      <p className="font-bold text-[#20364A]">Email Alerts on Critical Findings</p>
                      <p className="text-[#4F6576]">Send instant notification when unverified ROI claims are detected.</p>
                    </div>
                    <input
                      id="email-notifs-checkbox"
                      type="checkbox"
                      checked={emailNotifs}
                      onChange={(e) => setEmailNotifs(e.target.checked)}
                      className="rounded border-[#C4D5E0] text-[#416F89] focus:ring-[#416F89]"
                    />
                  </label>

                  <label htmlFor="slack-alerts-checkbox" className="flex items-center justify-between p-4 bg-[#EDF3F6]/50 rounded-lg border border-[#C4D5E0] cursor-pointer">
                    <div>
                      <p className="font-bold text-[#20364A]">Slack Governance Bot Integration</p>
                      <p className="text-[#4F6576]">Push review status changes to #brand-approvals channel.</p>
                    </div>
                    <input
                      id="slack-alerts-checkbox"
                      type="checkbox"
                      checked={slackAlerts}
                      onChange={(e) => setSlackAlerts(e.target.checked)}
                      className="rounded border-[#C4D5E0] text-[#416F89] focus:ring-[#416F89]"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* 6. AI Transparency */}
            {activeSection === 'transparency' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading text-base font-bold text-[#20364A]">AI Transparency Policy</h2>
                  <p className="text-xs text-[#4F6576] mt-0.5">Explainability, evidence grounding, and human decision protocols.</p>
                </div>

                <div className="p-4 bg-[#416F89]/10 rounded-lg border border-[#416F89]/25 text-xs text-[#20364A] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#20364A]">
                    <ShieldCheck className="w-4 h-4 text-[#416F89]" aria-hidden="true" />
                    <span>Human-in-the-Loop Protocol Enforced</span>
                  </div>
                  <p className="leading-relaxed text-[#4F6576]">
                    BrandSense will never automatically approve, reject, or broadcast content without explicit human confirmation from an authorized reviewer.
                  </p>
                </div>
              </div>
            )}

            {/* 7. Security */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading text-base font-bold text-[#20364A]">Privacy &amp; IP Isolation</h2>
                  <p className="text-xs text-[#4F6576] mt-0.5">Guarantee of zero public training and enterprise confidentiality.</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-[#EDF3F6]/50 rounded-lg border border-[#C4D5E0] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#20364A]">Customer IP Isolation</span>
                      <span className="text-[#1F7560] font-bold">Active &amp; Certified</span>
                    </div>
                    <p className="text-[#4F6576] leading-relaxed">
                      Your unpublished press releases, proprietary trademarks, and marketing copy are encrypted in transit and at rest. Content is never retained for public model training.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
