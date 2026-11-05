export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Needs Human Review';

export type FindingCategory = 
  | 'Tone and Voice'
  | 'Terminology'
  | 'Facts and Claims'
  | 'Promotional Claims'
  | 'Visual Consistency'
  | 'Accessibility';

export type ContentType = 
  | 'Social Media'
  | 'Advertisement'
  | 'Email'
  | 'Press Release'
  | 'Blog'
  | 'Other';

export type ReviewStatus = 
  | 'Pending Review'
  | 'In Progress'
  | 'Changes Requested'
  | 'Approved'
  | 'Rejected'
  | 'Needs Revision';

export interface Finding {
  id: string;
  category: FindingCategory;
  severity: SeverityLevel;
  reason: string;
  evidence: string;
  highlightedText: string;
  sourceDocument: string;
  sourceSection: string;
  confidence: number; // 0 to 100
  suggestedFix: string;
  explanation: string;
  status: 'pending' | 'accepted' | 'rejected' | 'modified';
  userNote?: string;
}

export interface ReviewItem {
  id: string;
  title: string;
  contentType: ContentType;
  brandProfile: string;
  createdAt: string;
  updatedAt: string;
  author: {
    name: string;
    email: string;
    avatar: string;
    role: string;
  };
  overallScore: number;
  status: ReviewStatus;
  originalContent: string;
  suggestedContent: string;
  categoryScores: {
    [key in FindingCategory]: number;
  };
  findings: Finding[];
  reviewer?: {
    name: string;
    role: string;
    avatar: string;
  };
  revisionCount: number;
  filePath?: string;
  fileUrl?: string;
}

export interface KnowledgeItem {
  id: string;
  type: 'guideline' | 'fact' | 'terminology' | 'banned' | 'phrase' | 'disclaimer' | 'asset';
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  status: 'Active' | 'Under Review' | 'Archived';
  lastUpdated: string;
  updatedBy: string;
  fileSize?: string | number;
  fileFormat?: 'PDF' | 'DOCX' | 'TXT' | 'PNG' | 'JPG';
  thumbnailUrl?: string;
  replacement?: string; // For banned terms
  filePath?: string;
  fileUrl?: string;
}

export interface ApprovalItem {
  id: string;
  reviewId: string;
  title: string;
  submittedBy: {
    name: string;
    avatar: string;
    department: string;
  };
  contentType: ContentType;
  submittedDate: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Urgent';
  complianceScore: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Needs Revision';
  assignedReviewer: {
    name: string;
    avatar: string;
  };
  commentsCount: number;
  criticalIssuesCount: number;
}

export interface ApprovalComment {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  timestamp: string;
  text: string;
  resolved?: boolean;
}

export interface SensaCitation {
  title: string;
  document: string;
  section: string;
  confidence: number;
}

export interface SensaMessage {
  id: string;
  sender: 'user' | 'sensa';
  timestamp: string;
  content: string;
  severity?: SeverityLevel;
  category?: FindingCategory;
  citations?: SensaCitation[];
  suggestedFix?: string;
  confidence?: number;
  requiresHumanReview?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Creator' | 'Manager' | 'Reviewer';
  avatar: string;
  department: string;
  organisation: string;
  organizationId?: string;
}

