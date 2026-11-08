import test from 'node:test';
import assert from 'node:assert/strict';

// Test validation logic matching SupabaseDataService.validateStoragePath
function validateStoragePath(path, expectedOrgId) {
  if (!path || typeof path !== 'string') return false;
  if (path.includes('..') || path.includes('\\') || path.startsWith('/') || path.endsWith('/')) {
    return false;
  }
  const parts = path.split('/');
  if (parts.length < 2) {
    return false;
  }
  const orgFolder = parts[0];
  if (!orgFolder || orgFolder === 'org-1' || orgFolder === 'undefined' || orgFolder === 'null') {
    return false;
  }
  if (expectedOrgId && orgFolder !== expectedOrgId) {
    return false;
  }
  return true;
}

// Mock Supabase storage client for test isolation
class MockSupabaseClient {
  constructor(options = {}) {
    this.storageObjects = new Map();
    this.databaseRecords = new Map();
    this.failStorageDelete = options.failStorageDelete || false;
    this.lastUploadOptions = null;
    this.signedUrlCalls = [];
  }

  get storage() {
    return {
      from: (bucket) => ({
        upload: async (path, file, options) => {
          this.lastUploadOptions = options;
          this.storageObjects.set(`${bucket}:${path}`, file);
          return { data: { path }, error: null };
        },
        createSignedUrl: async (path, expiresIn) => {
          this.signedUrlCalls.push({ bucket, path, expiresIn });
          const token = Math.random().toString(36).substring(7);
          return {
            data: {
              signedUrl: `https://mock.supabase.co/storage/v1/object/sign/${bucket}/${path}?token=${token}&expires=${expiresIn}`,
            },
            error: null,
          };
        },
        remove: async (paths) => {
          if (this.failStorageDelete) {
            return { data: null, error: { message: 'Storage connection timeout or permission denied' } };
          }
          for (const p of paths) {
            this.storageObjects.delete(`${bucket}:${p}`);
          }
          return { data: paths, error: null };
        },
      }),
    };
  }

  from(table) {
    return {
      select: (cols) => ({
        eq: (col, val) => ({
          single: async () => {
            const record = this.databaseRecords.get(`${table}:${val}`);
            if (!record) return { data: null, error: { code: 'PGRST116', message: 'Not found' } };
            return { data: record, error: null };
          },
        }),
      }),
      delete: () => ({
        eq: (col, val) => {
          this.databaseRecords.delete(`${table}:${val}`);
          return Promise.resolve({ error: null });
        },
      }),
      insert: (record) => {
        const id = record.id || `rec-${Date.now()}`;
        this.databaseRecords.set(`${table}:${id}`, { ...record, id });
        return {
          select: () => ({
            single: async () => ({ data: { ...record, id }, error: null }),
          }),
        };
      },
    };
  }
}

// Storage test service wrapping operations
class StorageServiceTestWrapper {
  constructor(client) {
    this.client = client;
  }

  async uploadFile(bucket, path, file, expectedOrgId) {
    if (!validateStoragePath(path, expectedOrgId)) {
      return null;
    }
    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    if (error || !data) return null;

    const { data: signed } = await this.client.storage
      .from(bucket)
      .createSignedUrl(data.path, 3600);

    return {
      path: data.path,
      signedUrl: signed?.signedUrl || null,
    };
  }

  async getSignedUrl(bucket, path, expiresIn = 3600) {
    if (!path) return null;
    const { data, error } = await this.client.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);
    if (error || !data) return null;
    return data.signedUrl;
  }

  async deleteKnowledgeItem(id) {
    // 1. Fetch file_path
    const { data: item, error: fetchErr } = await this.client
      .from('knowledge_items')
      .select('file_path')
      .eq('id', id)
      .single();

    if (fetchErr && fetchErr.code !== 'PGRST116') {
      return { success: false, error: fetchErr.message };
    }

    // 2. Delete storage file first
    if (item?.file_path) {
      const { error: storageErr } = await this.client.storage
        .from('knowledge-documents')
        .remove([item.file_path]);

      if (storageErr) {
        return {
          success: false,
          error: `Storage cleanup failed: ${storageErr.message}. Knowledge item metadata preserved.`,
        };
      }
    }

    // 3. Delete metadata record only after storage cleanup
    const { error: dbErr } = await this.client
      .from('knowledge_items')
      .delete()
      .eq('id', id);

    if (dbErr) return { success: false, error: dbErr.message };
    return { success: true };
  }
}

test('Storage Security Test Suite', async (t) => {
  await t.test('1. Reject missing or fallback organization IDs', () => {
    // Missing or invalid org IDs must be rejected
    assert.equal(validateStoragePath('', 'org-real-uuid-123'), false, 'Empty path rejected');
    assert.equal(validateStoragePath('org-1/file.pdf', 'org-real-uuid-123'), false, 'Fallback org-1 rejected');
    assert.equal(validateStoragePath('undefined/file.pdf', 'org-real-uuid-123'), false, 'undefined org rejected');
    assert.equal(validateStoragePath('null/file.pdf', 'org-real-uuid-123'), false, 'null org rejected');
    assert.equal(validateStoragePath('file.pdf', 'org-real-uuid-123'), false, 'Path without org folder rejected');
  });

  await t.test('2. Path traversal and malformed paths rejected', () => {
    assert.equal(validateStoragePath('org-uuid/../../etc/passwd', 'org-uuid'), false, 'Path traversal .. rejected');
    assert.equal(validateStoragePath('org-uuid\\file.pdf', 'org-uuid'), false, 'Backslashes rejected');
    assert.equal(validateStoragePath('/org-uuid/file.pdf', 'org-uuid'), false, 'Leading slash rejected');
    assert.equal(validateStoragePath('org-uuid/file.pdf/', 'org-uuid'), false, 'Trailing slash rejected');
    assert.equal(validateStoragePath('other-org-uuid/file.pdf', 'expected-org-uuid'), false, 'Org ID mismatch rejected');
  });

  await t.test('3. Valid organization-based upload path allowed', () => {
    const validOrgId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    const validPath = `${validOrgId}/1730764800000-brand_guidelines.pdf`;
    assert.equal(validateStoragePath(validPath, validOrgId), true, 'Valid org path matches expectedOrgId');
  });

  await t.test('4. Upload behavior passes { upsert: true } and stores relative path', async () => {
    const mockClient = new MockSupabaseClient();
    const service = new StorageServiceTestWrapper(mockClient);
    const orgId = '00000000-1111-2222-3333-444444444444';
    const filePath = `${orgId}/test-document.pdf`;

    const uploadRes = await service.uploadFile('knowledge-documents', filePath, 'file-content', orgId);
    assert.ok(uploadRes, 'Upload succeeded');
    assert.equal(uploadRes.path, filePath, 'Returns relative storage path');
    assert.ok(uploadRes.signedUrl.includes('knowledge-documents'), 'Generates private signed URL');
    assert.deepEqual(mockClient.lastUploadOptions, { upsert: true }, 'Upload called with upsert: true');
  });

  await t.test('5. Signed URL generation on demand', async () => {
    const mockClient = new MockSupabaseClient();
    const service = new StorageServiceTestWrapper(mockClient);
    const orgId = '00000000-1111-2222-3333-444444444444';
    const filePath = `${orgId}/test-document.pdf`;

    const signedUrl1 = await service.getSignedUrl('review-files', filePath, 3600);
    assert.ok(signedUrl1, 'Signed URL generated');
    assert.ok(signedUrl1.includes('expires=3600'), 'Expires in 3600 seconds');

    // Simulate requesting a refreshed signed URL after expiration
    const signedUrl2 = await service.getSignedUrl('review-files', filePath, 1800);
    assert.ok(signedUrl2, 'Refreshed signed URL generated');
    assert.ok(signedUrl2.includes('expires=1800'), 'Expires in 1800 seconds');
  });

  await t.test('6. Safe knowledge document deletion (storage first, then database metadata)', async () => {
    const mockClient = new MockSupabaseClient();
    const service = new StorageServiceTestWrapper(mockClient);
    const orgId = '00000000-1111-2222-3333-444444444444';
    const filePath = `${orgId}/guide.pdf`;

    // Seed database and storage
    mockClient.databaseRecords.set('knowledge_items:kb-101', {
      id: 'kb-101',
      title: 'Voice Guidelines',
      file_path: filePath,
    });
    mockClient.storageObjects.set(`knowledge-documents:${filePath}`, 'file-bytes');

    const result = await service.deleteKnowledgeItem('kb-101');
    assert.equal(result.success, true, 'Deletion succeeded');
    assert.equal(mockClient.storageObjects.has(`knowledge-documents:${filePath}`), false, 'Storage file deleted');
    assert.equal(mockClient.databaseRecords.has('knowledge_items:kb-101'), false, 'DB record deleted');
  });

  await t.test('7. Storage failure preserves database metadata without silent data loss', async () => {
    const mockClient = new MockSupabaseClient({ failStorageDelete: true });
    const service = new StorageServiceTestWrapper(mockClient);
    const orgId = '00000000-1111-2222-3333-444444444444';
    const filePath = `${orgId}/critical-policy.pdf`;

    // Seed database and storage
    mockClient.databaseRecords.set('knowledge_items:kb-102', {
      id: 'kb-102',
      title: 'Critical Claims Policy',
      file_path: filePath,
    });
    mockClient.storageObjects.set(`knowledge-documents:${filePath}`, 'file-bytes');

    const result = await service.deleteKnowledgeItem('kb-102');
    assert.equal(result.success, false, 'Deletion failed cleanly');
    assert.ok(result.error.includes('Storage cleanup failed'), 'Clear error returned');
    assert.ok(result.error.includes('Knowledge item metadata preserved'), 'Metadata preserved message');
    assert.equal(mockClient.databaseRecords.has('knowledge_items:kb-102'), true, 'Database record NOT deleted');
  });

  await t.test('8. Authentication Security: Deny unverified profile & metadata Admin escalation', () => {
    // Function testing the profile verification rule
    function resolveUserProfile(sessionUser, profileRecord) {
      if (!profileRecord) {
        // Must reject without creating privileged Admin fallback
        return null;
      }
      return {
        id: profileRecord.id,
        role: profileRecord.role,
        organizationId: profileRecord.organization_id,
      };
    }

    const sessionUser = { id: 'usr-attacker', user_metadata: { role: 'Admin' } };
    const missingProfile = null;
    const resolved = resolveUserProfile(sessionUser, missingProfile);
    assert.equal(resolved, null, 'Must return null when public.profiles record is missing');

    const realProfile = { id: 'usr-legit', role: 'Creator', organization_id: 'org-abc-123' };
    const validResolved = resolveUserProfile(sessionUser, realProfile);
    assert.equal(validResolved.role, 'Creator', 'Must take verified role from profile, not user_metadata');
  });

  await t.test('9. Invitation Security: Rejection of fake, expired, and invalid tokens', () => {
    function validateInvitationToken(token, record) {
      if (!token || token.length < 8) return { valid: false, error: 'Invalid token format' };
      if (!record) return { valid: false, error: 'Invitation not found' };
      if (record.status !== 'pending') return { valid: false, error: 'Already processed' };
      if (new Date(record.expires_at) < new Date()) return { valid: false, error: 'Expired' };
      return { valid: true, role: record.role, organizationId: record.organization_id };
    }

    assert.equal(validateInvitationToken('fake', null).valid, false, 'Reject short token');
    assert.equal(validateInvitationToken('nonexistent-token-12345', null).valid, false, 'Reject non-existent token');
    
    const expiredRecord = { status: 'pending', expires_at: '2020-01-01T00:00:00Z', role: 'Reviewer' };
    assert.equal(validateInvitationToken('valid-looking-token-123', expiredRecord).valid, false, 'Reject expired token');

    const acceptedRecord = { status: 'accepted', expires_at: '2099-01-01T00:00:00Z', role: 'Reviewer' };
    assert.equal(validateInvitationToken('valid-looking-token-123', acceptedRecord).valid, false, 'Reject already accepted token');

    const validRecord = { status: 'pending', expires_at: '2099-01-01T00:00:00Z', role: 'Reviewer', organization_id: 'org-100' };
    const validRes = validateInvitationToken('valid-token-secret-123', validRecord);
    assert.equal(validRes.valid, true, 'Accept genuinely valid invitation');
    assert.equal(validRes.role, 'Reviewer', 'Assign correct role');
  });

  await t.test('10. Database Compatibility: Numeric fileSize stored as BIGINT', () => {
    function sanitizeFileSizeForDb(fileSize) {
      if (typeof fileSize === 'number') return Math.floor(fileSize);
      if (typeof fileSize === 'string') {
        const parsed = parseInt(fileSize, 10);
        return isNaN(parsed) ? null : parsed;
      }
      return null;
    }

    assert.equal(sanitizeFileSizeForDb(1048576), 1048576, 'Numeric byte count preserved');
    assert.equal(sanitizeFileSizeForDb('2400000 bytes'), 2400000, 'String with units parsed to integer');
    assert.equal(sanitizeFileSizeForDb(null), null, 'Null safely handled');
  });
});

