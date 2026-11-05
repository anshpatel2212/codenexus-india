'use client';

import React, { useState, useRef } from 'react';
import { User, Mail, Shield, Save } from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/Toast';

export default function ReviewerProfilePage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || 'Legal & Regulatory Compliance');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast('Please upload an image file (PNG, JPG, WebP)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setAvatar(dataUrl);
      if (updateUser) {
        await updateUser({ avatar: dataUrl });
      }
      toast('Profile photo updated successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    setAvatar('');
    if (updateUser) {
      await updateUser({ avatar: '' });
    }
    toast('Profile photo removed.');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    if (updateUser) {
      await updateUser({ name, department });
    }
    setIsSaving(false);
    toast('Reviewer credentials updated successfully.');
  };

  const initials = name
    ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'RV';

  return (
    <RoleShell role="Reviewer" title="Reviewer Profile &amp; Avatar">
      <div className="max-w-2xl space-y-6">
        <div className="bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-[#C4D5E0]">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#416F89] shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#20364A] text-white font-extrabold text-xl flex items-center justify-center border-2 border-[#416F89] shadow-sm flex-shrink-0">
                {initials}
              </div>
            )}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatar ? 'Change Photo' : 'Upload Photo'}
                </Button>
                {avatar && (
                  <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-[#A94842] hover:bg-red-50"
                  >
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-[#4F6576] mt-1">PNG, JPG, or WebP up to 2MB</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-[#20364A] block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-[#C4D5E0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89]"
              />
            </div>

            <div>
              <label className="font-bold text-[#20364A] block mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 border border-[#C4D5E0] rounded-lg text-xs bg-[#F4F8FA] text-[#4F6576]"
              />
            </div>

            <div>
              <label className="font-bold text-[#20364A] block mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-[#C4D5E0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89]"
              />
            </div>

            <div>
              <label className="font-bold text-[#20364A] block mb-1">Decision Authority</label>
              <div className="p-3 bg-[#F4F8FA] rounded-lg border border-[#C4D5E0] flex items-center justify-between">
                <span className="font-bold text-[#20364A]">Reviewer &amp; Compliance Sign-Off Authority</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  Authorized Signer
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
                Save Reviewer Profile
              </Button>
            </div>
          </form>
        </div>
      </div>
    </RoleShell>
  );
}

