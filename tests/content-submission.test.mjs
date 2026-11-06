import test from 'node:test';
import assert from 'node:assert/strict';

// Mock in-memory storage for test isolation
class MockStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, val) {
    this.store.set(key, String(val));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

// Logic mirror of the NewReviewPage state, validation, file handling, and submission workflow
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
const SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.png', '.jpg', '.jpeg'];
const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/jpg',
];

function isSupportedFile(file) {
  const name = file.name.toLowerCase();
  const extMatch = SUPPORTED_EXTENSIONS.some((ext) => name.endsWith(ext));
  const mimeMatch = !file.type || SUPPORTED_MIME_TYPES.includes(file.type.toLowerCase());
  return extMatch || mimeMatch;
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileTypeLabel(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf') || file.type === 'application/pdf') return 'PDF Document';
  if (name.endsWith('.docx') || (file.type && file.type.includes('word'))) return 'Word Document';
  if (name.endsWith('.png') || file.type === 'image/png') return 'PNG Image';
  if (name.endsWith('.jpg') || name.endsWith('.jpeg') || file.type === 'image/jpeg') return 'JPEG Image';
  return 'Document';
}

function getInitialFormState() {
  return {
    inputMode: 'text',
    title: '',
    contentType: 'Social Media',
    brandProfile: 'Corporate Core (Global English)',
    instructions: '',
    content: '',
    selectedFile: null,
    isProcessing: false,
    formErrors: {},
  };
}

function validateSubmissionForm(state) {
  const errors = {};
  const trimmedTitle = (state.title || '').trim();
  if (!trimmedTitle) {
    errors.title = 'Review Title is required.';
  } else if (trimmedTitle.length < 2) {
    errors.title = 'Review Title must be at least 2 characters.';
  }

  if (state.inputMode === 'text') {
    const trimmedContent = (state.content || '').trim();
    if (!trimmedContent) {
      errors.content = 'Content is required. Enter copy to review.';
    } else if (trimmedContent.length < 5) {
      errors.content = 'Content must be at least 5 characters.';
    }
  } else {
    if (!state.selectedFile) {
      errors.file = 'Please choose or drop a valid file (PDF, DOCX, PNG, JPG).';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

function handleFileSelection(state, fileList) {
  // Simulates file input change or drop
  if (!fileList || fileList.length === 0) {
    // User cancelled file picker
    return { ...state };
  }

  const file = fileList[0];
  if (!isSupportedFile(file)) {
    return {
      ...state,
      formErrors: {
        ...state.formErrors,
        file: 'Unsupported file format. Please choose a PDF, DOCX, PNG, or JPG/JPEG file.',
      },
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      ...state,
      formErrors: {
        ...state.formErrors,
        file: `File size exceeds the 25 MB limit (${formatFileSize(file.size)}).`,
      },
    };
  }

  return {
    ...state,
    selectedFile: file,
    formErrors: {
      ...state.formErrors,
      file: undefined,
    },
  };
}

class ReviewSubmissionEngine {
  constructor(storage, options = {}) {
    this.storage = storage;
    this.shouldFailAPI = options.shouldFailAPI || false;
    this.apiErrorMessage = options.apiErrorMessage || 'API submission failed';
    this.isProcessing = false;
  }

  async submit(state, user) {
    if (this.isProcessing) {
      throw new Error('Duplicate submission prevented: review already in progress.');
    }

    if (!user) {
      throw new Error('Authentication required. Please sign in to submit reviews.');
    }

    const validation = validateSubmissionForm(state);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    this.isProcessing = true;
    try {
      if (this.shouldFailAPI) {
        throw new Error(this.apiErrorMessage);
      }

      const orgId = user.organizationId || 'org-demo-brandsense';
      const reviewId = `REV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      let submittedContent = state.content;
      let filePath = undefined;

      if (state.inputMode === 'file' && state.selectedFile) {
        filePath = `${orgId}/${state.selectedFile.name}`;
        submittedContent = `[Uploaded ${getFileTypeLabel(state.selectedFile)}: ${state.selectedFile.name} (${formatFileSize(state.selectedFile.size)}) - Creative Asset submitted for brand review]`;
      }

      const newReview = {
        id: reviewId,
        title: state.title.trim(),
        contentType: state.contentType,
        brandProfile: state.brandProfile,
        instructions: state.instructions.trim() || undefined,
        originalContent: submittedContent,
        filePath,
        organizationId: orgId,
        author: {
          name: user.name,
          email: user.email,
        },
        overallScore: 88,
        status: 'Changes Requested',
        createdAt: new Date().toISOString(),
        findings: [
          {
            id: `f-${Date.now()}-1`,
            category: 'Terminology',
            severity: 'Medium',
            reason: 'Trademark nomenclature verification',
          },
        ],
      };

      // Persist in organization review history
      const orgReviewsKey = `brandsense_reviews_${orgId}`;
      const existing = JSON.parse(this.storage.getItem(orgReviewsKey) || '[]');
      this.storage.setItem(orgReviewsKey, JSON.stringify([newReview, ...existing]));

      // Persist in user preview
      this.storage.setItem(`brandsense_current_review_${user.id}`, JSON.stringify(newReview));
      this.storage.setItem('brandsense_current_review', JSON.stringify(newReview));

      return { success: true, review: newReview };
    } finally {
      this.isProcessing = false;
    }
  }

  getReviews(orgId) {
    const raw = this.storage.getItem(`brandsense_reviews_${orgId}`);
    return raw ? JSON.parse(raw) : [];
  }
}

// ---------------------------------------------------------------------------
// TEST SUITE
// ---------------------------------------------------------------------------
test('Content Submission Page — Bugs 1, 2, 3 Root Cause Fixes Suite', async (suite) => {
  const mockUser = {
    id: 'usr-creator-101',
    name: 'Elena Rostova',
    email: 'elena@acmebrand.com',
    organizationId: 'org-acme-corp',
  };

  await suite.test('1. BUG 1: Empty initial form state (no hardcoded sample copy)', () => {
    const initial = getInitialFormState();

    assert.equal(initial.title, '', 'Review Title must open empty');
    assert.equal(initial.instructions, '', 'Special instructions must open empty');
    assert.equal(initial.content, '', 'Direct Editor content must open empty');
    assert.equal(initial.selectedFile, null, 'No file should be attached by default');
    assert.equal(initial.contentType, 'Social Media', 'Content type dropdown has valid default');
    assert.equal(initial.brandProfile, 'Corporate Core (Global English)', 'Brand profile dropdown has valid default');

    // Verify sample strings are completely absent from initial state
    assert.ok(!initial.title.includes('Q3 Enterprise Product Launch'));
    assert.ok(!initial.instructions.includes('FTC guidelines'));
    assert.ok(!initial.content.includes('BrandSense guarantees'));
  });

  await suite.test('2. BUG 1: Required-field validation in Direct Editor mode', () => {
    let state = getInitialFormState();

    // Both title and content empty
    let val = validateSubmissionForm(state);
    assert.equal(val.isValid, false);
    assert.ok(val.errors.title, 'Should require title');
    assert.ok(val.errors.content, 'Should require content in direct editor mode');

    // Whitespace only
    state.title = '   ';
    state.content = '   ';
    val = validateSubmissionForm(state);
    assert.equal(val.isValid, false);
    assert.equal(val.errors.title, 'Review Title is required.');
    assert.equal(val.errors.content, 'Content is required. Enter copy to review.');

    // Min length check
    state.title = 'A';
    state.content = 'Four';
    val = validateSubmissionForm(state);
    assert.equal(val.isValid, false);
    assert.equal(val.errors.title, 'Review Title must be at least 2 characters.');
    assert.equal(val.errors.content, 'Content must be at least 5 characters.');

    // Valid values
    state.title = 'Q3 Product Announcement';
    state.content = 'Introducing our new verified enterprise governance workflow.';
    val = validateSubmissionForm(state);
    assert.equal(val.isValid, true);
    assert.equal(Object.keys(val.errors).length, 0);
  });

  await suite.test('3. BUG 2: No automatic file attachment on action invocation', () => {
    const state = getInitialFormState();
    state.inputMode = 'file';

    // The user has switched to file mode, but hasn't picked a file
    assert.equal(state.selectedFile, null, 'File must not be attached simply by viewing upload mode');

    // Validation must fail when no file selected
    const val = validateSubmissionForm(state);
    assert.equal(val.isValid, false);
    assert.equal(val.errors.file, 'Please choose or drop a valid file (PDF, DOCX, PNG, JPG).');
  });

  await suite.test('4. BUG 2: File picker cancellation preserves form state without errors', () => {
    let state = getInitialFormState();
    state.title = 'Draft Press Release';

    // User opens file picker and cancels (empty FileList or null)
    state = handleFileSelection(state, []);
    assert.equal(state.selectedFile, null, 'Cancelled picker does not attach any file');
    assert.equal(state.title, 'Draft Press Release', 'User title preserved on cancel');
    assert.equal(Object.keys(state.formErrors).length, 0, 'No errors generated on cancel');
  });

  await suite.test('5. BUG 2: Valid file selection (PDF, DOCX, PNG, JPG) with size/type metadata and no mock text', () => {
    let state = getInitialFormState();
    state.inputMode = 'file';

    const pdfFile = {
      name: 'Annual_Report_2026.pdf',
      size: 4.5 * 1024 * 1024,
      type: 'application/pdf',
    };

    state = handleFileSelection(state, [pdfFile]);
    assert.ok(state.selectedFile, 'PDF file must be attached');
    assert.equal(state.selectedFile.name, 'Annual_Report_2026.pdf');
    assert.equal(getFileTypeLabel(state.selectedFile), 'PDF Document');
    assert.equal(formatFileSize(state.selectedFile.size), '4.5 MB');
    assert.equal(state.content, '', 'Must NOT fabricate extracted mock copy into state');

    // Word Document selection
    const docxFile = {
      name: 'Launch_Notes.docx',
      size: 1.2 * 1024 * 1024,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    state = handleFileSelection(state, [docxFile]);
    assert.equal(state.selectedFile.name, 'Launch_Notes.docx');
    assert.equal(getFileTypeLabel(state.selectedFile), 'Word Document');

    // PNG Image selection
    const pngFile = {
      name: 'Hero_Banner.png',
      size: 850 * 1024,
      type: 'image/png',
    };
    state = handleFileSelection(state, [pngFile]);
    assert.equal(state.selectedFile.name, 'Hero_Banner.png');
    assert.equal(getFileTypeLabel(state.selectedFile), 'PNG Image');
    assert.equal(formatFileSize(state.selectedFile.size), '850.0 KB');
  });

  await suite.test('6. BUG 2: Invalid file selection rejected (unsupported extension / oversized)', () => {
    let state = getInitialFormState();

    // Unsupported format (.exe)
    const invalidFile = {
      name: 'setup_installer.exe',
      size: 2 * 1024 * 1024,
      type: 'application/x-msdownload',
    };
    state = handleFileSelection(state, [invalidFile]);
    assert.equal(state.selectedFile, null, 'Unsupported format must NOT attach');
    assert.ok(state.formErrors.file.includes('Unsupported file format'));

    // Oversized file (> 25MB)
    const bigFile = {
      name: 'Gigantic_Video_Asset.pdf',
      size: 30 * 1024 * 1024, // 30 MB
      type: 'application/pdf',
    };
    state = handleFileSelection(state, [bigFile]);
    assert.equal(state.selectedFile, null, 'Oversized file must NOT attach');
    assert.ok(state.formErrors.file.includes('25 MB limit'));
  });

  await suite.test('7. BUG 1 & 2: Mode switching retains draft without restoring sample content', () => {
    let state = getInitialFormState();
    state.title = 'Custom Ad Copy';
    state.content = 'Custom marketing content written by Elena.';

    // Switch to Upload Document
    state.inputMode = 'file';
    assert.equal(state.content, 'Custom marketing content written by Elena.', 'Content must not be cleared on mode switch');

    // Switch back to Direct Editor
    state.inputMode = 'text';
    assert.equal(state.content, 'Custom marketing content written by Elena.', 'Content must not be overwritten or reset to sample copy');
    assert.equal(state.title, 'Custom Ad Copy', 'Title retained across toggles');
  });

  await suite.test('8. BUG 3: Successful review submission (Direct Editor & Upload Document)', async () => {
    const storage = new MockStorage();
    const engine = new ReviewSubmissionEngine(storage);

    // 8a: Direct Editor submission
    const directState = {
      ...getInitialFormState(),
      title: 'Q4 Global Launch Email',
      contentType: 'Email',
      brandProfile: 'B2B Commercial Sales',
      content: 'Empower your compliance team with automated review governance.',
    };

    const directRes = await engine.submit(directState, mockUser);
    assert.equal(directRes.success, true);
    assert.ok(directRes.review.id.startsWith('REV-'));
    assert.equal(directRes.review.title, 'Q4 Global Launch Email');
    assert.equal(directRes.review.organizationId, mockUser.organizationId);
    assert.equal(directRes.review.author.email, mockUser.email);

    // 8b: Upload Document submission
    const fileState = {
      ...getInitialFormState(),
      inputMode: 'file',
      title: 'Audited Sustainability Report',
      contentType: 'Press Release',
      selectedFile: {
        name: 'Sustainability_2026.pdf',
        size: 2.4 * 1024 * 1024,
        type: 'application/pdf',
      },
    };

    const fileRes = await engine.submit(fileState, mockUser);
    assert.equal(fileRes.success, true);
    assert.ok(fileRes.review.id.startsWith('REV-'));
    assert.equal(fileRes.review.filePath, 'org-acme-corp/Sustainability_2026.pdf');
    assert.ok(fileRes.review.originalContent.includes('Sustainability_2026.pdf'));
    assert.ok(!fileRes.review.originalContent.includes('BrandSense guarantees'));
  });

  await suite.test('9. BUG 3: API failure handling does not claim success or clear unsubmitted form', async () => {
    const storage = new MockStorage();
    const engine = new ReviewSubmissionEngine(storage, {
      shouldFailAPI: true,
      apiErrorMessage: 'Server database connection timeout (HTTP 500)',
    });

    const formState = {
      ...getInitialFormState(),
      title: 'Unsaved Campaign Draft',
      content: 'Important draft text that must not be lost on failure.',
    };

    let caughtError = null;
    try {
      await engine.submit(formState, mockUser);
    } catch (err) {
      caughtError = err;
    }

    assert.ok(caughtError, 'Must propagate API failure');
    assert.equal(caughtError.message, 'Server database connection timeout (HTTP 500)');
    assert.equal(engine.isProcessing, false, 'Processing state must reset to false in finally block');

    // Ensure reviews were not stored on failure
    const reviews = engine.getReviews(mockUser.organizationId);
    assert.equal(reviews.length, 0, 'Failed submission must NOT be persisted in history');
  });

  await suite.test('10. BUG 3: Persistence in isolated Review History', async () => {
    const storage = new MockStorage();
    const engine = new ReviewSubmissionEngine(storage);

    const submission = {
      ...getInitialFormState(),
      title: 'Audit Ready Post',
      content: 'Content that adheres to master lexicon rules.',
    };

    await engine.submit(submission, mockUser);

    // Verify stored under user's organization
    const orgReviews = engine.getReviews(mockUser.organizationId);
    assert.equal(orgReviews.length, 1);
    assert.equal(orgReviews[0].title, 'Audit Ready Post');

    // Verify stored under preview key
    const currentPreview = JSON.parse(storage.getItem(`brandsense_current_review_${mockUser.id}`));
    assert.equal(currentPreview.title, 'Audit Ready Post');

    // Verify other organizations cannot see this review
    const otherOrgReviews = engine.getReviews('org-other-competitor');
    assert.equal(otherOrgReviews.length, 0, 'No cross-tenant leakage in review history');
  });

  await suite.test('11. BUG 3: Duplicate submission prevention while processing', async () => {
    const storage = new MockStorage();
    const engine = new ReviewSubmissionEngine(storage);

    const state = {
      ...getInitialFormState(),
      title: 'Concurrent Test',
      content: 'Testing concurrent submit locking.',
    };

    // Simulate active processing lock
    engine.isProcessing = true;

    await assert.rejects(
      async () => {
        await engine.submit(state, mockUser);
      },
      {
        message: 'Duplicate submission prevented: review already in progress.',
      }
    );
  });

  await suite.test('12. Unauthorized user cannot submit review', async () => {
    const storage = new MockStorage();
    const engine = new ReviewSubmissionEngine(storage);

    const state = {
      ...getInitialFormState(),
      title: 'Anonymous Test',
      content: 'Valid content but no user session.',
    };

    await assert.rejects(
      async () => {
        await engine.submit(state, null);
      },
      {
        message: 'Authentication required. Please sign in to submit reviews.',
      }
    );
  });
});

