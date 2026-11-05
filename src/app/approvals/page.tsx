'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { ScoreMeter } from '@/components/ui/ScoreMeter';
import { 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  Send, 
  Check, 
  X, 
  FileText
} from 'lucide-react';
import { sampleApprovals, currentUser } from '@/data/mock-data';
import { ApprovalItem, ApprovalComment } from '@/types';
import { apiClient } from '@/services/api-client';
import { useToast } from '@/components/ui/Toast';
<<<<<<< HEAD
import { useAuth } from '@/components/auth/AuthProvider';

export default function ApprovalsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
=======

export default function ApprovalsPage() {
  const { toast } = useToast();
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
  const [approvals, setApprovals] = useState<ApprovalItem[]>(sampleApprovals);
  const [activeTab, setActiveTab] = useState<'Pending' | 'Approved' | 'Rejected' | 'Needs Revision'>('Pending');
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem>(sampleApprovals[0]);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<ApprovalComment[]>([
    {
      id: 'comm-1',
      author: {
        name: 'Sarah Chen, Esq.',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
        role: 'Legal Counsel',
      },
      timestamp: 'Nov 03, 10:45 AM',
      text: 'Marcus, please confirm the ROI cohort footnote is tied to the 2025 audited sample before I provide formal sign-off.',
    },
    {
      id: 'comm-2',
      author: {
        name: 'Marcus Vance',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        role: 'Copywriter',
      },
      timestamp: 'Nov 03, 11:10 AM',
      text: 'Thanks Sarah. We swapped out the unverified 100% promise with the compliant wording from Rewrite Studio.',
    },
  ]);

  useEffect(() => {
<<<<<<< HEAD
    let active = true;
    apiClient.getApprovals(user?.organizationId).then((data) => {
      if (active && data.length > 0) {
        setApprovals(data);
        setSelectedApproval(data[0]);
      }
    });
    return () => {
      active = false;
    };
  }, [user?.organizationId]);

  useEffect(() => {
    if (selectedApproval?.id) {
      apiClient.getApprovalComments(selectedApproval.id).then((loadedComments) => {
        if (loadedComments && loadedComments.length > 0) {
          setComments(loadedComments);
        }
      });
    }
  }, [selectedApproval?.id]);

  const handleDecision = async (id: string, status: 'Approved' | 'Rejected' | 'Needs Revision') => {
    if (user?.role === 'Creator') {
      toast('Sign-off decisions require Reviewer, Manager, or Admin authorization.', 'error');
      return;
    }

    await apiClient.updateApprovalStatus(id, status, selectedApproval.reviewId);
=======
    apiClient.getApprovals().then(setApprovals);
  }, []);

  const handleDecision = async (id: string, status: 'Approved' | 'Rejected' | 'Needs Revision') => {
    await apiClient.updateApprovalStatus(id, status);
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    setSelectedApproval(prev => prev.id === id ? { ...prev, status } : prev);
    toast(`Content status updated: ${status}`);
  };

<<<<<<< HEAD
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const authorName = user?.name || currentUser.name;
    const authorAvatar = user?.avatar || currentUser.avatar;
    const authorRole = user?.role || currentUser.role;

    const newComment: ApprovalComment = {
      id: `comm-${Date.now()}`,
      author: {
        name: authorName,
        avatar: authorAvatar,
        role: authorRole,
=======
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: ApprovalComment = {
      id: `comm-${Date.now()}`,
      author: {
        name: currentUser.name,
        avatar: currentUser.avatar,
        role: currentUser.role,
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
      },
      timestamp: 'Just now',
      text: commentText,
    };

    setComments(prev => [...prev, newComment]);
<<<<<<< HEAD
    await apiClient.addApprovalComment(
      selectedApproval.id, 
      commentText, 
      user?.id, 
      user?.organizationId
    );
=======
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
    setCommentText('');
    toast('Feedback posted to review discussion audit log');
  };

  const filteredApprovals = approvals.filter(a => a.status === activeTab);

  const counts = {
    Pending: approvals.filter(a => a.status === 'Pending').length,
    Approved: approvals.filter(a => a.status === 'Approved').length,
    Rejected: approvals.filter(a => a.status === 'Rejected').length,
    'Needs Revision': approvals.filter(a => a.status === 'Needs Revision').length,
  };

  return (
    <AppLayout>
      <div className="space-y-6 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <div>
            <span className="bs-eyebrow block mb-1.5">Approvals</span>
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-[#20364A] tracking-tight">
              Pre-Publication Approval Workspace
            </h1>
<<<<<<< HEAD
            <p className="mt-1 text-xs sm:text-sm text-[#718494]">
=======
            <p className="mt-1 text-xs sm:text-sm text-[#4F6576]">
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
              Authorized sign-off and audit trail. Content is never published automatically without human review.
            </p>
          </div>

          <div className="flex items-center gap-3">
<<<<<<< HEAD
            <span className="text-xs text-[#718494] font-bold hidden sm:inline">
=======
            <span className="text-xs text-[#4F6576] font-bold hidden sm:inline">
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
              Clearance Level: <strong className="text-[#20364A]">Tier 3 (Authorised Signer)</strong>
            </span>
          </div>
        </div>

        {/* Status Tabs */}
<<<<<<< HEAD
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {(['Pending', 'Approved', 'Needs Revision', 'Rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-[#20364A] text-white shadow-sm'
                  : 'bg-white text-[#526B7C] hover:text-[#20364A] border border-[#C4D5E0]'
              }`}
            >
              <span>{tab}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === tab ? 'bg-white/20 text-white' : 'bg-[#D5E3EC] text-[#31566D]'
=======
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="toolbar" aria-label="Filter approvals by review status">
          {(['Pending', 'Approved', 'Needs Revision', 'Rejected'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              aria-pressed={activeTab === tab}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] ${
                activeTab === tab
                  ? 'bg-[#20364A] text-white shadow-sm'
                  : 'bg-white text-[#4F6576] hover:text-[#20364A] border border-[#C4D5E0]'
              }`}
            >
              <span>{tab}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-mono ${
                activeTab === tab ? 'bg-white/20 text-white' : 'bg-[#D5E3EC] text-[#20364A]'
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
              }`}>
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Master-Detail Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Queue list */}
          <div className="lg:col-span-5 space-y-3">
<<<<<<< HEAD
            {filteredApprovals.map((item) => {
              const isSelected = selectedApproval?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedApproval(item)}
                  className={`p-5 rounded-xl border transition-all cursor-pointer bg-white ${
=======
            <h2 className="sr-only">Submissions Queue</h2>
            {filteredApprovals.map((item) => {
              const isSelected = selectedApproval?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedApproval(item)}
                  className={`w-full text-left p-5 rounded-xl border transition-all bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] ${
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                    isSelected
                      ? 'border-[#416F89] ring-2 ring-[#416F89]/20 shadow-[0_15px_45px_rgba(32,54,74,.09)]'
                      : 'border-[#C4D5E0] hover:border-[#416F89]/40 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
<<<<<<< HEAD
                    <span className="text-[10px] font-mono font-bold text-[#718494]">{item.id}</span>
                    <StatusBadge status={item.status} size="sm" />
                  </div>

                  <h3 className="font-heading text-sm font-bold text-[#20364A] leading-snug line-clamp-1">
                    {item.title}
                  </h3>

                  <div className="mt-3 flex items-center justify-between text-xs text-[#718494]">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.submittedBy.avatar}
                        alt={item.submittedBy.name}
=======
                    <span className="text-xs font-mono font-bold text-[#4F6576]">{item.id}</span>
                    <StatusBadge status={item.status} size="sm" />
                  </div>

                  <h3 className="font-heading text-xs sm:text-sm font-bold text-[#20364A] leading-snug line-clamp-1">
                    {item.title}
                  </h3>

                  <div className="mt-3 flex items-center justify-between text-xs text-[#4F6576]">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.submittedBy.avatar}
                        alt=""
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                        className="w-5 h-5 rounded-full object-cover border border-[#C4D5E0]"
                      />
                      <span className="truncate max-w-[130px] font-semibold text-[#20364A]">
                        {item.submittedBy.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-[#20364A]">{item.complianceScore} pts</span>
<<<<<<< HEAD
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        item.urgency === 'Urgent' ? 'bg-[#C65E57]/15 text-[#C65E57]' :
                        item.urgency === 'High' ? 'bg-[rgba(244,215,123,.4)] text-[#9A682D]' : 'bg-[#D5E3EC] text-[#31566D]'
=======
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        item.urgency === 'Urgent' ? 'bg-[#A94842]/15 text-[#A94842]' :
                        item.urgency === 'High' ? 'bg-[#F4D77B]/40 text-[#9A682D]' : 'bg-[#D5E3EC] text-[#20364A]'
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                      }`}>
                        {item.urgency}
                      </span>
                    </div>
                  </div>
<<<<<<< HEAD
                </div>
=======
                </button>
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
              );
            })}

            {filteredApprovals.length === 0 && (
              <div className="p-12 text-center bg-white rounded-xl border border-[#C4D5E0]">
<<<<<<< HEAD
                <CheckCircle2 className="w-10 h-10 text-[#258A70] mx-auto mb-2" />
                <h4 className="font-heading text-sm font-bold text-[#20364A]">No items in queue</h4>
                <p className="text-xs text-[#718494] mt-1">All submissions have been addressed.</p>
=======
                <CheckCircle2 className="w-10 h-10 text-[#1F7560] mx-auto mb-2" aria-hidden="true" />
                <h3 className="font-heading text-sm font-bold text-[#20364A]">No items in queue</h3>
                <p className="text-xs text-[#4F6576] mt-1">All submissions have been addressed.</p>
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
              </div>
            )}
          </div>

          {/* Right Column: Detail & Sign-Off */}
          {selectedApproval && (
            <div className="lg:col-span-7 bg-white rounded-xl border border-[#C4D5E0] shadow-subtle p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#C4D5E0]">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
<<<<<<< HEAD
                      <span className="text-xs font-mono font-bold text-[#718494]">
=======
                      <span className="text-xs font-mono font-bold text-[#4F6576]">
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                        {selectedApproval.id} • {selectedApproval.contentType}
                      </span>
                      <StatusBadge status={selectedApproval.status} size="sm" />
                    </div>
                    <h2 className="font-heading text-lg sm:text-xl font-extrabold text-[#20364A] tracking-tight">
                      {selectedApproval.title}
                    </h2>
                  </div>

                  <ScoreMeter score={selectedApproval.complianceScore} size="md" />
                </div>

                {/* Submitter & Reviewer Meta */}
                <div className="my-5 p-4 rounded-lg bg-[#EDF3F6]/70 border border-[#C4D5E0] grid grid-cols-2 gap-4 text-xs">
                  <div>
<<<<<<< HEAD
                    <span className="text-[#718494] text-[11px] block">Submitted By:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <img
                        src={selectedApproval.submittedBy.avatar}
                        alt={selectedApproval.submittedBy.name}
                        className="w-6 h-6 rounded-full object-cover border border-[#C4D5E0]"
                      />
                      <div>
                        <p className="font-bold text-[#20364A]">{selectedApproval.submittedBy.name}</p>
                        <p className="text-[10px] text-[#718494]">{selectedApproval.submittedBy.department}</p>
=======
                    <span className="text-[#4F6576] text-xs block font-bold">Submitted By:</span>
                    <div className="flex items-center gap-2 mt-1.5">
                      <img
                        src={selectedApproval.submittedBy.avatar}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover border border-[#C4D5E0]"
                      />
                      <div>
                        <p className="font-bold text-[#20364A]">{selectedApproval.submittedBy.name}</p>
                        <p className="text-xs text-[#4F6576]">{selectedApproval.submittedBy.department}</p>
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                      </div>
                    </div>
                  </div>

                  <div>
<<<<<<< HEAD
                    <span className="text-[#718494] text-[11px] block">Assigned Legal Signer:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <img
                        src={selectedApproval.assignedReviewer.avatar}
                        alt={selectedApproval.assignedReviewer.name}
                        className="w-6 h-6 rounded-full object-cover border border-[#C4D5E0]"
                      />
                      <div>
                        <p className="font-bold text-[#20364A]">{selectedApproval.assignedReviewer.name}</p>
                        <p className="text-[10px] text-[#718494]">Authorized Reviewer</p>
=======
                    <span className="text-[#4F6576] text-xs block font-bold">Assigned Legal Signer:</span>
                    <div className="flex items-center gap-2 mt-1.5">
                      <img
                        src={selectedApproval.assignedReviewer.avatar}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover border border-[#C4D5E0]"
                      />
                      <div>
                        <p className="font-bold text-[#20364A]">{selectedApproval.assignedReviewer.name}</p>
                        <p className="text-xs text-[#4F6576]">Authorized Reviewer</p>
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sign-Off Action Bar */}
                <div className="p-4 rounded-lg bg-[#20364A] text-white flex flex-wrap items-center justify-between gap-3 shadow-md">
                  <div>
                    <p className="text-xs font-heading font-bold text-white">Official Sign-Off Decision</p>
<<<<<<< HEAD
                    <p className="text-[11px] text-[#B7C9D2]">Logged with timestamp to immutable audit history.</p>
=======
                    <p className="text-xs text-[#D5E3EC]">Logged with timestamp to immutable audit history.</p>
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="primary"
<<<<<<< HEAD
                      leftIcon={<Check className="w-3.5 h-3.5" />}
=======
                      leftIcon={<Check className="w-3.5 h-3.5" aria-hidden="true" />}
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                      onClick={() => handleDecision(selectedApproval.id, 'Approved')}
                    >
                      Approve for Publishing
                    </Button>
                    <Button
                      size="sm"
                      variant="yellow"
<<<<<<< HEAD
                      leftIcon={<AlertTriangle className="w-3.5 h-3.5" />}
=======
                      leftIcon={<AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />}
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                      onClick={() => handleDecision(selectedApproval.id, 'Needs Revision')}
                    >
                      Request Revision
                    </Button>
                    <Button
                      size="sm"
<<<<<<< HEAD
                      variant="danger"
                      leftIcon={<X className="w-3.5 h-3.5" />}
=======
                      variant="destructive"
                      leftIcon={<X className="w-3.5 h-3.5" aria-hidden="true" />}
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                      onClick={() => handleDecision(selectedApproval.id, 'Rejected')}
                    >
                      Reject
                    </Button>
                  </div>
                </div>

                {/* Discussion Thread */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-heading text-xs font-bold text-[#20364A] uppercase tracking-wider flex items-center gap-1.5">
<<<<<<< HEAD
                      <MessageSquare className="w-4 h-4 text-[#416F89]" />
                      Editorial & Legal Discussion Log
                    </h3>
                    <span className="text-[10px] text-[#718494] font-mono font-bold">
=======
                      <MessageSquare className="w-4 h-4 text-[#416F89]" aria-hidden="true" />
                      Editorial &amp; Legal Discussion Log
                    </h3>
                    <span className="text-xs text-[#4F6576] font-mono font-bold">
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                      {comments.length} comments recorded
                    </span>
                  </div>

                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {comments.map((comm) => (
                      <div key={comm.id} className="p-3 bg-white rounded-lg border border-[#C4D5E0] text-xs">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <img
                              src={comm.author.avatar}
<<<<<<< HEAD
                              alt={comm.author.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="font-bold text-[#20364A]">{comm.author.name}</span>
                            <span className="text-[10px] text-[#718494]">({comm.author.role})</span>
                          </div>
                          <span className="text-[10px] text-[#718494]">{comm.timestamp}</span>
                        </div>
                        <p className="text-[#263B4D] leading-relaxed pl-7">{comm.text}</p>
=======
                              alt=""
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="font-bold text-[#20364A]">{comm.author.name}</span>
                            <span className="text-xs text-[#4F6576]">({comm.author.role})</span>
                          </div>
                          <span className="text-xs text-[#4F6576]">{comm.timestamp}</span>
                        </div>
                        <p className="text-[#20364A] leading-relaxed pl-7">{comm.text}</p>
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddComment} className="mt-3 flex gap-2">
<<<<<<< HEAD
                    <input
=======
                    <label htmlFor="feedback-comment-input" className="sr-only">
                      Add compliance feedback or required revision notes
                    </label>
                    <input
                      id="feedback-comment-input"
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add compliance feedback or required revision notes..."
<<<<<<< HEAD
                      className="flex-1 px-3 py-2 text-xs bg-white border border-[#C4D5E0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#416F89] text-[#263B4D]"
                    />
                    <Button type="submit" size="sm" variant="primary">
                      <Send className="w-3.5 h-3.5" />
=======
                      className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white border border-[#C4D5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#416F89]/25 focus:border-[#416F89] text-[#20364A]"
                    />
                    <Button type="submit" size="sm" variant="primary" aria-label="Send feedback comment">
                      <Send className="w-3.5 h-3.5" aria-hidden="true" />
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                    </Button>
                  </form>
                </div>
              </div>

<<<<<<< HEAD
              <div className="pt-4 border-t border-[#C4D5E0] flex items-center justify-between text-xs text-[#718494]">
                <Link
                  href="/review/results"
                  className="font-bold text-[#416F89] hover:text-[#315C74] flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
=======
              <div className="pt-4 border-t border-[#C4D5E0] flex items-center justify-between text-xs text-[#4F6576]">
                <Link
                  href="/review/results"
                  className="font-bold text-[#416F89] hover:text-[#315C74] flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] rounded"
                >
                  <FileText className="w-3.5 h-3.5" aria-hidden="true" />
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                  Inspect full scan findings
                </Link>
                <span>Audit Stamp: SHA-256 Validated</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
