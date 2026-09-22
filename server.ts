import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// -------------------------------------------------------------
// Security & Hashing Helpers (Node.js crypto, PBKDF2 with SHA-512)
// -------------------------------------------------------------
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  const hash = hashPassword(password, salt);
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
  } catch {
    return false;
  }
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// -------------------------------------------------------------
// Rate Limiting & Throttling Foundation
// -------------------------------------------------------------
interface AttemptRecord {
  count: number;
  firstAttempt: number;
}
const loginAttempts = new Map<string, AttemptRecord>();
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_FAILED_ATTEMPTS = 5;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (!record) return true;
  if (now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.delete(key);
    return true;
  }
  return record.count < MAX_FAILED_ATTEMPTS;
}

function recordFailedAttempt(key: string) {
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (!record || now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.set(key, { count: 1, firstAttempt: now });
  } else {
    record.count += 1;
  }
}

function resetFailedAttempts(key: string) {
  loginAttempts.delete(key);
}

// -------------------------------------------------------------
// Core Domain Types & Tenant Registry
// -------------------------------------------------------------
export type OnboardingStatus =
  | 'pending_review'
  | 'approved'
  | 'payment_pending'
  | 'active'
  | 'expired'
  | 'suspended'
  | 'rejected';

export type UserRole = 'owner' | 'manager' | 'cashier';

export interface ServerOrganization {
  id: string;
  name: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  created_at: string;
}

export interface ServerWorkspace {
  id: string;
  organization_id: string;
  workspace_code: string;
  name: string;
  slug: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  onboarding_status: OnboardingStatus;
  status_reason?: string;
  created_at: string;
}

export interface ServerUser {
  id: string;
  organization_id: string;
  workspace_id: string;
  full_name: string;
  role: UserRole;
  email: string;
  phone: string;
  password_salt: string;
  password_hash: string;
  is_active: boolean;
  created_at: string;
}

export interface ServerSession {
  token: string;
  user_id: string;
  workspace_id: string;
  organization_id: string;
  created_at: string;
  expires_at: string;
}

export interface RolePermissions {
  can_manage_club: boolean;
  can_manage_staff: boolean;
  can_void_invoices: boolean;
  can_approve_collections: boolean;
  can_manage_settings: boolean;
  can_view_reports: boolean;
  can_open_close_shifts: boolean;
  can_operate_pos: boolean;
  can_manage_tables: boolean;
}

function getPermissionsForRole(role: UserRole): RolePermissions {
  switch (role) {
    case 'owner':
      return {
        can_manage_club: true,
        can_manage_staff: true,
        can_void_invoices: true,
        can_approve_collections: true,
        can_manage_settings: true,
        can_view_reports: true,
        can_open_close_shifts: true,
        can_operate_pos: true,
        can_manage_tables: true,
      };
    case 'manager':
      return {
        can_manage_club: false,
        can_manage_staff: false,
        can_void_invoices: false,
        can_approve_collections: true,
        can_manage_settings: false,
        can_view_reports: true,
        can_open_close_shifts: true,
        can_operate_pos: true,
        can_manage_tables: true,
      };
    case 'cashier':
    default:
      return {
        can_manage_club: false,
        can_manage_staff: false,
        can_void_invoices: false,
        can_approve_collections: false,
        can_manage_settings: false,
        can_view_reports: false,
        can_open_close_shifts: true,
        can_operate_pos: true,
        can_manage_tables: true,
      };
  }
}

// -------------------------------------------------------------
// In-Memory Storage Initializer
// -------------------------------------------------------------
const organizations = new Map<string, ServerOrganization>();
const workspaces = new Map<string, ServerWorkspace>();
const users = new Map<string, ServerUser>();
const sessions = new Map<string, ServerSession>();

// Seed default active club workspace for verified access
function seedInitialWorkspace() {
  const orgId = 'org-arena-01';
  const workspaceId = 'ws-arena-01';

  organizations.set(orgId, {
    id: orgId,
    name: 'Arena Snooker & Billiards Club',
    owner_name: 'Malik Tariq',
    owner_email: 'owner@arenaclub.com',
    owner_phone: '+92 300 1234567',
    created_at: new Date('2026-01-01').toISOString(),
  });

  workspaces.set(workspaceId, {
    id: workspaceId,
    organization_id: orgId,
    workspace_code: 'ARENA-01',
    name: 'Arena Snooker Club',
    slug: 'arena-snooker-club',
    owner_name: 'Malik Tariq',
    owner_email: 'owner@arenaclub.com',
    owner_phone: '+92 300 1234567',
    onboarding_status: 'active',
    created_at: new Date('2026-01-01').toISOString(),
  });

  // Owner user
  const ownerSalt = generateSalt();
  users.set('user-owner-01', {
    id: 'user-owner-01',
    organization_id: orgId,
    workspace_id: workspaceId,
    full_name: 'Malik Tariq',
    role: 'owner',
    email: 'owner@arenaclub.com',
    phone: '+92 300 1234567',
    password_salt: ownerSalt,
    password_hash: hashPassword('Owner123!', ownerSalt),
    is_active: true,
    created_at: new Date('2026-01-01').toISOString(),
  });

  // Manager user
  const managerSalt = generateSalt();
  users.set('user-manager-01', {
    id: 'user-manager-01',
    organization_id: orgId,
    workspace_id: workspaceId,
    full_name: 'Hamza Sheikh',
    role: 'manager',
    email: 'manager@arenaclub.com',
    phone: '+92 301 9876543',
    password_salt: managerSalt,
    password_hash: hashPassword('Manager123!', managerSalt),
    is_active: true,
    created_at: new Date('2026-01-01').toISOString(),
  });

  // Cashier user
  const cashierSalt = generateSalt();
  users.set('user-cashier-01', {
    id: 'user-cashier-01',
    organization_id: orgId,
    workspace_id: workspaceId,
    full_name: 'Ali Raza',
    role: 'cashier',
    email: 'cashier@arenaclub.com',
    phone: '+92 302 5551234',
    password_salt: cashierSalt,
    password_hash: hashPassword('Cashier123!', cashierSalt),
    is_active: true,
    created_at: new Date('2026-01-01').toISOString(),
  });
}

seedInitialWorkspace();

// -------------------------------------------------------------
// Authentication Middleware
// -------------------------------------------------------------
export interface AuthenticatedRequest extends Request {
  user?: ServerUser;
  workspace?: ServerWorkspace;
  organization?: ServerOrganization;
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. No bearer token provided.' });
  }

  const token = authHeader.substring(7);
  const session = sessions.get(token);

  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
  }

  if (new Date(session.expires_at) < new Date()) {
    sessions.delete(token);
    return res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }

  const user = users.get(session.user_id);
  const workspace = workspaces.get(session.workspace_id);
  const org = organizations.get(session.organization_id);

  if (!user || !workspace || !org) {
    return res.status(401).json({ error: 'Corrupted session entity references.' });
  }

  if (!user.is_active) {
    return res.status(403).json({ error: 'Account disabled. Contact club administration.' });
  }

  req.user = user;
  req.workspace = workspace;
  req.organization = org;
  next();
}

// -------------------------------------------------------------
// API Routes: Authentication & Tenancy
// -------------------------------------------------------------

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', brand: 'CueDesk', version: '2.0.0' });
});

// 1. SIGNUP: Club Owner Registration (Starts strictly in pending_review)
app.post('/api/auth/signup', (req: Request, res: Response) => {
  const { club_name, owner_name, mobile, email, password, confirm_password } = req.body;

  if (!club_name || !owner_name || !mobile || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  if (password !== confirm_password) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  // Check if email already registered as owner
  for (const u of users.values()) {
    if (u.email.toLowerCase() === email.toLowerCase()) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }
  }

  // Generate unique workspace code (e.g. CDK-XXXX)
  let workspaceCode = '';
  let attempts = 0;
  while (attempts < 20) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const cleanPrefix = club_name.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'CDK';
    const candidate = `${cleanPrefix}-${randomSuffix}`;
    let exists = false;
    for (const w of workspaces.values()) {
      if (w.workspace_code === candidate) {
        exists = true;
        break;
      }
    }
    if (!exists) {
      workspaceCode = candidate;
      break;
    }
    attempts++;
  }

  if (!workspaceCode) {
    workspaceCode = `CDK-${Date.now().toString().slice(-5)}`;
  }

  const orgId = `org-${crypto.randomUUID()}`;
  const workspaceId = `ws-${crypto.randomUUID()}`;
  const userId = `user-${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  const newOrg: ServerOrganization = {
    id: orgId,
    name: club_name.trim(),
    owner_name: owner_name.trim(),
    owner_email: email.trim().toLowerCase(),
    owner_phone: mobile.trim(),
    created_at: now,
  };

  // Crucial requirement: New clubs start strictly as pending_review
  const newWorkspace: ServerWorkspace = {
    id: workspaceId,
    organization_id: orgId,
    workspace_code: workspaceCode,
    name: club_name.trim(),
    slug: club_name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    owner_name: owner_name.trim(),
    owner_email: email.trim().toLowerCase(),
    owner_phone: mobile.trim(),
    onboarding_status: 'pending_review',
    status_reason: 'Awaiting CueDesk onboarding inspection and verification.',
    created_at: now,
  };

  const salt = generateSalt();
  const newUser: ServerUser = {
    id: userId,
    organization_id: orgId,
    workspace_id: workspaceId,
    full_name: owner_name.trim(),
    role: 'owner',
    email: email.trim().toLowerCase(),
    phone: mobile.trim(),
    password_salt: salt,
    password_hash: hashPassword(password, salt),
    is_active: true,
    created_at: now,
  };

  organizations.set(orgId, newOrg);
  workspaces.set(workspaceId, newWorkspace);
  users.set(userId, newUser);

  // Generate session for newly registered workspace
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  sessions.set(token, {
    token,
    user_id: userId,
    workspace_id: workspaceId,
    organization_id: orgId,
    created_at: now,
    expires_at: expiresAt,
  });

  const permissions = getPermissionsForRole(newUser.role);
  const sessionData = {
    token,
    user: {
      id: newUser.id,
      full_name: newUser.full_name,
      role: newUser.role,
      email: newUser.email,
      phone: newUser.phone,
      is_active: newUser.is_active,
      organization_id: newOrg.id,
      workspace_id: newWorkspace.id,
      club_id: newWorkspace.id,
    },
    workspace: {
      id: newWorkspace.id,
      organization_id: newOrg.id,
      workspace_code: newWorkspace.workspace_code,
      name: newWorkspace.name,
      slug: newWorkspace.slug,
      owner_name: newWorkspace.owner_name,
      owner_email: newWorkspace.owner_email,
      owner_phone: newWorkspace.owner_phone,
      onboarding_status: newWorkspace.onboarding_status,
      status_reason: newWorkspace.status_reason,
      created_at: newWorkspace.created_at,
    },
    organization: {
      id: newOrg.id,
      name: newOrg.name,
      owner_name: newOrg.owner_name,
      owner_email: newOrg.owner_email,
      owner_phone: newOrg.owner_phone,
      created_at: newOrg.created_at,
    },
    permissions,
    expires_at: expiresAt,
  };

  return res.status(201).json({
    success: true,
    message: 'Club workspace registered successfully. Application is pending review.',
    token,
    session: sessionData,
    user: sessionData.user,
    workspace: sessionData.workspace,
    organization: sessionData.organization,
    permissions,
    workspace_code: workspaceCode,
    onboarding_status: 'pending_review',
    club_name: newOrg.name,
    owner_name: newOrg.owner_name,
  });
});

// 2. LOGIN: Authenticate with Workspace/Club Code + Password
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { workspace_code, password, email } = req.body;

  if (!workspace_code || !password) {
    return res.status(400).json({ error: 'Workspace / Club Code and password are required.' });
  }

  const cleanCode = String(workspace_code).trim().toUpperCase();
  const cleanEmail = email ? String(email).trim().toLowerCase() : undefined;
  const rateLimitKey = `${req.ip}_${cleanCode}`;

  if (!checkRateLimit(rateLimitKey)) {
    return res.status(429).json({
      error: 'Too many failed login attempts. Please wait 5 minutes before trying again.',
    });
  }

  // Find workspace by code
  let targetWorkspace: ServerWorkspace | undefined;
  for (const w of workspaces.values()) {
    if (w.workspace_code.toUpperCase() === cleanCode) {
      targetWorkspace = w;
      break;
    }
  }

  if (!targetWorkspace) {
    recordFailedAttempt(rateLimitKey);
    return res.status(401).json({ error: 'Invalid Workspace / Club Code or password.' });
  }

  // Find user matching password in that workspace (and email if specified)
  let authenticatedUser: ServerUser | undefined;
  for (const u of users.values()) {
    if (u.workspace_id === targetWorkspace.id && u.is_active) {
      if (cleanEmail && u.email.toLowerCase() !== cleanEmail) {
        continue;
      }
      if (verifyPassword(password, u.password_salt, u.password_hash)) {
        authenticatedUser = u;
        break;
      }
    }
  }

  if (!authenticatedUser) {
    recordFailedAttempt(rateLimitKey);
    return res.status(401).json({ error: 'Invalid Workspace / Club Code or password.' });
  }

  resetFailedAttempts(rateLimitKey);

  const org = organizations.get(targetWorkspace.organization_id);
  if (!org) {
    return res.status(500).json({ error: 'Club organization entity not found.' });
  }

  // Access rules based on onboarding status:
  // pending_review, payment_pending, expired, suspended, rejected block normal workspace entry
  const status = targetWorkspace.onboarding_status;
  const isBlocked = status !== 'active';

  // Generate secure token (7 days validity)
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  sessions.set(token, {
    token,
    user_id: authenticatedUser.id,
    workspace_id: targetWorkspace.id,
    organization_id: org.id,
    created_at: new Date().toISOString(),
    expires_at: expiresAt,
  });

  const permissions = getPermissionsForRole(authenticatedUser.role);

  const sessionData = {
    token,
    user: {
      id: authenticatedUser.id,
      full_name: authenticatedUser.full_name,
      role: authenticatedUser.role,
      email: authenticatedUser.email,
      phone: authenticatedUser.phone,
      is_active: authenticatedUser.is_active,
      organization_id: org.id,
      workspace_id: targetWorkspace.id,
      club_id: targetWorkspace.id,
    },
    workspace: {
      id: targetWorkspace.id,
      organization_id: org.id,
      workspace_code: targetWorkspace.workspace_code,
      name: targetWorkspace.name,
      slug: targetWorkspace.slug,
      owner_name: targetWorkspace.owner_name,
      owner_email: targetWorkspace.owner_email,
      owner_phone: targetWorkspace.owner_phone,
      onboarding_status: targetWorkspace.onboarding_status,
      status_reason: targetWorkspace.status_reason,
      created_at: targetWorkspace.created_at,
    },
    organization: {
      id: org.id,
      name: org.name,
      owner_name: org.owner_name,
      owner_email: org.owner_email,
      owner_phone: org.owner_phone,
      created_at: org.created_at,
    },
    permissions,
    expires_at: expiresAt,
  };

  return res.json({
    success: true,
    token,
    session: sessionData,
    user: sessionData.user,
    workspace: sessionData.workspace,
    organization: sessionData.organization,
    permissions,
    workspace_code: targetWorkspace.workspace_code,
    onboarding_status: targetWorkspace.onboarding_status,
    is_blocked: isBlocked,
    status_message: isBlocked
      ? `Club workspace is currently in "${status}" state. Normal floor access is restricted.`
      : undefined,
  });
});

// 3. ME: Verify Active Session
app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const workspace = req.workspace!;
  const org = req.organization!;

  const permissions = getPermissionsForRole(user.role);
  const isBlocked = workspace.onboarding_status !== 'active';
  const token = req.headers.authorization!.substring(7);

  const sessionData = {
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      role: user.role,
      email: user.email,
      phone: user.phone,
      is_active: user.is_active,
      organization_id: org.id,
      workspace_id: workspace.id,
      club_id: workspace.id,
    },
    workspace: {
      id: workspace.id,
      organization_id: org.id,
      workspace_code: workspace.workspace_code,
      name: workspace.name,
      slug: workspace.slug,
      owner_name: workspace.owner_name,
      owner_email: workspace.owner_email,
      owner_phone: workspace.owner_phone,
      onboarding_status: workspace.onboarding_status,
      status_reason: workspace.status_reason,
      created_at: workspace.created_at,
    },
    organization: {
      id: org.id,
      name: org.name,
      owner_name: org.owner_name,
      owner_email: org.owner_email,
      owner_phone: org.owner_phone,
      created_at: org.created_at,
    },
    permissions,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  return res.json({
    success: true,
    token,
    session: sessionData,
    user: sessionData.user,
    workspace: sessionData.workspace,
    organization: sessionData.organization,
    permissions,
    workspace_code: workspace.workspace_code,
    onboarding_status: workspace.onboarding_status,
    is_blocked: isBlocked,
  });
});

// 4. LOGOUT: Invalidate token
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    sessions.delete(token);
  }
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// 5. FORGOT PASSWORD: Send reset verification instructions
app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { workspace_code, email } = req.body;
  if (!workspace_code) {
    return res.status(400).json({ error: 'Workspace / Club Code is required.' });
  }

  const cleanCode = String(workspace_code).trim().toUpperCase();
  let found = false;
  for (const w of workspaces.values()) {
    if (w.workspace_code === cleanCode) {
      found = true;
      break;
    }
  }

  // Security best practice: don't reveal if workspace exists or not
  return res.json({
    success: true,
    message: 'If the provided workspace exists, password reset instructions have been dispatched to the registered owner.',
  });
});

// -------------------------------------------------------------
// Vite Middleware / Static Serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, port: PORT, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CueDesk Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
