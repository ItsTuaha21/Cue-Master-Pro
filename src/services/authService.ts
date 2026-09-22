import {
  AuthSession,
  AuthResponse,
  ClubSignupInput,
  LoginCredentials,
  RolePermissions,
} from '../types';

const SESSION_TOKEN_KEY = 'cuedesk_session_token';

class AuthService {
  private inMemoryToken: string | null = null;

  constructor() {
    // Restore session token from sessionStorage if present for page refreshes
    try {
      this.inMemoryToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
    } catch {
      this.inMemoryToken = null;
    }
  }

  public getToken(): string | null {
    return this.inMemoryToken;
  }

  public setToken(token: string | null): void {
    this.inMemoryToken = token;
    try {
      if (token) {
        sessionStorage.setItem(SESSION_TOKEN_KEY, token);
      } else {
        sessionStorage.removeItem(SESSION_TOKEN_KEY);
      }
    } catch {
      // Ignore storage errors in restrictive iframe modes
    }
  }

  public async login(credentials: LoginCredentials & { email?: string }): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && data.success && data.session) {
        this.setToken(data.session.token);
        return {
          success: true,
          session: data.session,
          workspace_code: data.workspace_code,
          onboarding_status: data.onboarding_status,
        };
      }

      return {
        success: false,
        message: data.message || data.error || 'Authentication failed. Please verify credentials.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Network error during login. Please try again.',
      };
    }
  }

  public async signup(input: ClubSignupInput): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.session?.token) {
          this.setToken(data.session.token);
        }
        return {
          success: true,
          session: data.session,
          workspace_code: data.workspace_code,
          onboarding_status: data.onboarding_status,
          message: data.message,
        };
      }

      return {
        success: false,
        message: data.message || data.error || 'Club registration failed. Please check inputs.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Network error during signup. Please try again.',
      };
    }
  }

  public async getMe(): Promise<AuthResponse> {
    const token = this.getToken();
    if (!token) {
      return { success: false, message: 'No active session token.' };
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.setToken(null);
        return { success: false, message: 'Session expired.' };
      }

      const data = await response.json();
      const permissions: RolePermissions = data.permissions || {
        can_manage_club: data.user?.role === 'owner',
        can_manage_staff: data.user?.role === 'owner' || data.user?.role === 'manager',
        can_void_invoices: data.user?.role === 'owner' || data.user?.role === 'manager',
        can_approve_collections: data.user?.role === 'owner' || data.user?.role === 'manager',
        can_manage_settings: data.user?.role === 'owner',
        can_view_reports: data.user?.role === 'owner' || data.user?.role === 'manager',
        can_open_close_shifts: true,
        can_operate_pos: true,
        can_manage_tables: true,
      };

      return {
        success: true,
        session: {
          token,
          user: data.user,
          workspace: data.workspace,
          organization: data.organization,
          permissions,
          expires_at: data.session?.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        workspace_code: data.workspace?.workspace_code,
        onboarding_status: data.onboarding_status,
      };
    } catch (err: any) {
      this.setToken(null);
      return {
        success: false,
        message: err.message || 'Failed to authenticate session.',
      };
    }
  }

  public async logout(): Promise<void> {
    const token = this.getToken();
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {
        // Ignore logout network failures
      }
    }
    this.setToken(null);
  }

  public async requestPasswordReset(workspaceCode: string, email?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace_code: workspaceCode, email }),
      });
      const data = await response.json();
      return {
        success: data.success,
        message: data.message || 'Reset instructions processed.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to submit password recovery.',
      };
    }
  }
}

export const authService = new AuthService();
