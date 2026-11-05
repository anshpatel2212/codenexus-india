'use client';

import React, { useEffect, useState } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  Upload,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/services/api-client';
import { KnowledgeItem } from '@/types';

export default function AdminBrandAssetsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assets, setAssets] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const fetchAssets = async () => {
    if (!user?.organizationId) return;
    setLoading(true);
    try {
      const items = await apiClient.getKnowledgeBase(user.organizationId);
      const filtered = (items || []).filter((i: KnowledgeItem) => i.type === 'asset');
      setAssets(filtered);
    } catch {
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [user?.organizationId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user?.organizationId) return;

    try {
      await apiClient.createKnowledgeItem(user.organizationId, {
        type: 'asset',
        title: title.trim(),
        content: content.trim() || 'Official vector brand asset specification',
        category: 'Logo & Typography',
        status: 'Active',
        updatedBy: user.name,
      });
      toast(`Brand asset specification '${title}' recorded.`);
      setTitle('');
      setContent('');
      setShowModal(false);
      fetchAssets();
    } catch {
      toast('Failed to record brand asset.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.organizationId) return;
    try {
      await apiClient.deleteKnowledgeItem(user.organizationId, id);
      toast('Brand asset removed.');
      fetchAssets();
    } catch {
      toast('Failed to delete asset.', 'error');
    }
  };

  return (
    <RoleShell role="Admin" title="Approved Brand Assets &amp; Visual Guidelines">
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <div>
            <h2 className="font-heading font-extrabold text-sm text-[#20364A]">
              Visual Brand Assets &amp; Badges
            </h2>
            <p className="text-xs text-[#4F6576] mt-0.5">
              Approved color palettes, official typography, lockups, and clearspace rules.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Brand Asset Spec
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 py-12 text-center text-xs text-[#4F6576]">
              Loading brand asset library...
            </div>
          ) : assets.length === 0 ? (
            <div className="col-span-3 p-12 text-center text-xs text-[#4F6576] bg-white rounded-xl border border-[#C4D5E0]">
              <FolderKanban className="w-8 h-8 text-[#416F89]/40 mx-auto mb-2" />
              <p className="font-bold text-[#20364A]">No Brand Asset Specifications Added</p>
              <p className="text-[11px] mt-1 max-w-xs mx-auto">
                Store logo usage rules, minimum clearspace boundaries, and RGB/HEX hex codes for visual compliance checks.
              </p>
            </div>
          ) : (
            assets.map((item) => (
              <div key={item.id} className="p-5 bg-white rounded-xl border border-[#C4D5E0] shadow-subtle flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                      {item.category || 'Visual Spec'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="text-[#4F6576] hover:text-[#A94842] p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-heading font-bold text-sm text-[#20364A] mt-2">{item.title}</h3>
                  <p className="text-xs text-[#4F6576] mt-2 whitespace-pre-wrap">{item.content}</p>
                </div>
                <div className="pt-3 border-t border-[#C4D5E0]/60 text-[11px] text-[#1F7560] font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Visual Consistency Rule Active
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#20364A]/50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-elevated border border-[#C4D5E0] space-y-4">
              <h3 className="font-heading font-bold text-base text-[#20364A]">Record Brand Asset Spec</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#20364A] block mb-1">Asset Name</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Primary Dark Logo Lockup (SVG)"
                    className="w-full px-3 py-2 border border-[#C4D5E0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#20364A] block mb-1">Clearspace &amp; Minimum Size Spec</label>
                  <textarea
                    rows={3}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Must maintain 24px padding on all sides. Do not rotate, skew, or recolor..."
                    className="w-full px-3 py-2 border border-[#C4D5E0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Save Specification
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleShell>
  );
}

