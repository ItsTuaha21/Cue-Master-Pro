export type UserRole = 'owner' | 'manager' | 'cashier';

export const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'Club Owner',
  manager: 'Manager',
  cashier: 'Employee / Cashier',
};

// SaaS Tenancy & Onboarding Status
export type OnboardingStatus =
  | 'pending_review'
  | 'approved'
  | 'payment_pending'
  | 'active'
  | 'expired'
  | 'suspended'
  | 'rejected';

export interface Organization {
  id: string;
  name: string;
  legal_name?: string;
  contact_email: string;
  contact_phone: string;
  created_at: string;
  status: 'active' | 'pending' | 'suspended';
}

export interface WorkspaceTenant {
  id: string;
  organization_id: string;
  workspace_code: string; // e.g. 'ARENA-01'
  name: string;
  slug: string;
  owner_name: string;
  owner_email: string;
  owner_phone?: string;
  onboarding_status: OnboardingStatus;
  subscription_tier?: 'starter' | 'pro' | 'enterprise';
  payment_status?: 'paid' | 'pending' | 'overdue';
  created_at: string;
  active_until?: string;
  max_tables?: number;
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

export interface AuthSession {
  token: string;
  user: UserProfile;
  workspace: WorkspaceTenant;
  organization: Organization;
  permissions: RolePermissions;
  expires_at: string;
}

export interface LoginCredentials {
  workspace_code: string;
  password: string;
}

export interface ClubSignupInput {
  club_name: string;
  owner_name: string;
  phone: string;
  email: string;
  password: string;
  confirm_password?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  session?: AuthSession;
  workspace_code?: string;
  onboarding_status?: OnboardingStatus;
}

// Table & Match Types
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'maintenance' | 'disabled';

export type RateType = 'hourly' | 'per_minute' | 'fixed_frame';

export type SessionStatus = 'active' | 'paused' | 'completed' | 'cancelled' | 'voided';

export type ParticipantRole = 'player' | 'viewer';

export type ParticipantType = 'member' | 'guest' | 'walkin';

export type TableChargeAssignment = 'loser_pays' | 'split_equally' | 'single_designated' | 'custom';

export type MatchType = '1v1' | '3_rotation' | '4_rotation' | '2v2_team' | 'custom';

export const MATCH_TYPE_LABELS: Record<MatchType, string> = {
  '1v1': '1 vs 1 Match',
  '3_rotation': '3 Player Rotation',
  '4_rotation': '4 Player Rotation',
  '2v2_team': '2 vs 2 Team Match',
  'custom': 'Custom / Open Players',
};

// Payment Foundations
export type PaymentMethod =
  | 'cash'
  | 'jazzcash'
  | 'easypaisa'
  | 'bank_transfer'
  | 'debit_card'
  | 'credit_card'
  | 'card'
  | 'other';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash Drawer',
  jazzcash: 'JazzCash Wallet',
  easypaisa: 'EasyPaisa Wallet',
  bank_transfer: 'Direct Bank Transfer',
  debit_card: 'Debit Card (POS)',
  credit_card: 'Credit Card (POS)',
  card: 'Card (Legacy POS)',
  other: 'Other Method',
};

// Cue Management Types
export type CueStatus = 'available' | 'rented' | 'sold' | 'maintenance' | 'damaged';

export type CueCondition = 'brand_new' | 'excellent' | 'good' | 'fair' | 'needs_repair';

export type CueCategory =
  | 'snooker_cue'
  | 'pool_cue'
  | 'break_cue'
  | 'jump_cue'
  | 'custom_cue'
  | 'house_cue';

export interface CueAsset {
  id: string;
  organization_id?: string;
  workspace_id?: string;
  club_id: string;
  cue_code: string; // e.g. 'CUE-001'
  name: string; // model / specs
  category: CueCategory;
  condition: CueCondition;
  purchase_cost: number;
  sale_price: number;
  rental_price: number;
  status: CueStatus;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CueRental {
  id: string;
  organization_id?: string;
  workspace_id?: string;
  club_id: string;
  cue_id: string;
  cue_code: string;
  session_id?: string;
  customer_name: string;
  rented_at: string;
  returned_at?: string;
  rental_fee: number;
  deposit_amount?: number;
  status: 'active' | 'returned' | 'overdue' | 'lost';
  assigned_participant_id?: string;
}

export interface CueSale {
  id: string;
  organization_id?: string;
  workspace_id?: string;
  club_id: string;
  cue_id: string;
  cue_code: string;
  customer_name: string;
  sale_price: number;
  payment_method: PaymentMethod;
  sold_at: string;
  invoice_id?: string;
  receipt_number?: string;
}

// Membership Foundations
export type MembershipTier = 'basic' | 'silver' | 'gold' | 'vip' | 'custom';

export const MEMBERSHIP_TIER_LABELS: Record<MembershipTier, string> = {
  basic: 'Basic / Regular',
  silver: 'Silver',
  gold: 'Gold',
  vip: 'VIP',
  custom: 'Custom',
};

export type MembershipStatus = 'active' | 'expired' | 'suspended';

export interface MembershipPlan {
  id: string;
  organization_id?: string;
  workspace_id?: string;
  club_id: string;
  tier: MembershipTier;
  name: string;
  description?: string;
  duration_days: number;
  price: number;
  monthly_price?: number;
  three_month_price?: number;
  six_month_price?: number;
  yearly_price?: number;
  table_discount_percentage: number;
  fnb_discount_percentage: number;
  cue_discount_percentage?: number;
  free_minutes_allocated?: number;
  booking_benefits?: string[];
  renewal_rules?: string;
  status?: MembershipStatus;
  is_active: boolean;
}

export interface Member {
  id: string;
  organization_id?: string;
  workspace_id?: string;
  club_id: string;
  membership_number: string;
  full_name: string;
  phone: string;
  email: string;
  plan_name: string;
  tier?: MembershipTier;
  discount_percentage: number;
  start_date: string;
  expiry_date: string;
  is_active: boolean;
  total_games_played: number;
}

// Invoice & Financials
export type InvoiceStatus = 'draft' | 'open' | 'partially_paid' | 'paid' | 'voided' | 'refunded';

export type ShiftStatus = 'open' | 'closed' | 'collection_pending' | 'reconciled';

export type ApprovalType =
  | 'cash_collection'
  | 'invoice_void'
  | 'refund'
  | 'large_discount'
  | 'expense_approval'
  | 'inventory_adjustment'
  | 'cash_difference';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  id: string;
  organization_id?: string;
  workspace_id?: string;
  club_id: string;
  full_name: string;
  role: UserRole;
  phone: string;
  email: string;
  avatar_url?: string;
  is_active: boolean;
}

export interface TableRate {
  id: string;
  organization_id?: string;
  workspace_id?: string;
  club_id: string;
  name: string;
  rate_type: RateType;
  base_rate: number;
  minimum_charge: number;
  peak_multiplier: number;
  is_default: boolean;
  is_active: boolean;
}

export interface PhysicalTable {
  id: string;
  organization_id?: string;
  workspace_id?: string;
  club_id: string;
  table_number: string;
  name: string;
  table_type: 'English Snooker 12ft' | 'Star Tournament 12ft' | 'American Pool 9ft' | 'Russian Pyramid';
  status: TableStatus;
  current_session_id?: string;
  maintenance_notes?: string;
  rate_id: string;
}

export interface SessionParticipant {
  id: string;
  session_id: string;
  participant_role: ParticipantRole;
  participant_type: ParticipantType;
  member_id?: string;
  display_name: string;
  joined_at: string;
  left_at?: string;
  is_active: boolean;
  is_loser?: boolean;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  assigned_participant_id?: string;
  assigned_name?: string;
  is_shared: boolean;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
  created_by_name: string;
}

export interface TableSession {
  id: string;
  organization_id?: string;
  workspace_id?: string;
  club_id: string;
  table_id: string;
  table_name: string;
  table_number: string;
  rate_id: string;
  rate_name: string;
  rate_price: number;
  rate_type: RateType;
  match_type?: MatchType;
  opened_by_id: string;
  opened_by_name: string;
  status: SessionStatus;
  start_time: string;
  end_time?: string;
  total_duration_minutes: number;
  frames_played: number;
  table_charge_assignment: TableChargeAssignment;
  assigned_loser_id?: string;
  assigned_loser_name?: string;
  table_charge_amount: number;
  fnb_charge_amount: number;
  cue_charge_amount?: number;
  discount_amount: number;
  final_amount: number;
  participants: SessionParticipant[];
  orders: OrderItem[];
  notes?: string;
}

export interface ProductCategory {
  id: string;
  organization_id?: string;
  workspace_id?: string;
  club_id: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  organization_id?: string;
  workspace_id?: string;
  club_id: string;
  category_id: string;
  category_name: string;
  name: string;
  sku: string;
  selling_price: number;
  cost_price: number;
  current_stock: number;
  low_stock_threshold: number;
  unit: string;
  image_url?: string;
  is_active: boolean;
}

export interface InventoryTransaction {
  id: string;
  organization_id?: string;
  workspace_id?: string;
  club_id: string;
  product_id: string;
  product_name: string;
  performed_by_name: string;
  transaction_type: 'purchase' | 'sale' | 'stock_in' | 'stock_out' | 'adjustment' | 'damage' | 'return';
  quantity_change: number;
  balance_after: number;
  unit_cost: number;
  notes?: string;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  item_type: 'table_time' | 'fnb_product' | 'cue_rental' | 'cue_sale' | 'membership_fee';
  description: string;
  assigned_to_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface PaymentRecord {
  id: string;
  invoice_id: string;
  payer_name: string;
  payment_method: PaymentMethod;
  amount: number;
  transaction_reference?: string;
  received_by_name: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  organization_id?: string;
  workspace_id?: string;
  club_id: string;
  invoice_number: string;
  session_id?: string;
  table_number?: string;
  customer_name?: string;
  status: InvoiceStatus;
  subtotal: number;
  table_revenue_subtotal: number;
  fnb_revenue_subtotal: number;
  cue_revenue_subtotal?: number;
  discount_amount: number;
  tax_amount: number;
  grand_total: number;
  paid_amount: number;
  balance_due: number;
  items: InvoiceItem[];
  payments: PaymentRecord[];
  created_by_name: string;
  created_at: string;
  void_reason?: string;
}

export interface EmployeeShift {
  id: string;
  organization_id?: string;
  workspace_id?: string;
  club_id: string;
  employee_id: string;
  employee_name: string;
  shift_name: string;
  start_time: string;
  end_time?: string;
  status: ShiftStatus;
  opening_float: number;
  cash_sales_collected: number;
  cash_expenses_paid: number;
  expected_cash: number;
  actual_cash?: number;
  cash_difference?: number;
  difference_reason?: string;
  collection_status?: ApprovalStatus;
  collection_id?: string;
  notes?: string;
}

export interface CashCollection {
  id: string;
  organization_id?: string;
  workspace_id?: string;
  club_id: string;
  collection_number: string;
  shift_id: string;
  employee_name: string;
  amount: number;
  expected_amount: number;
  status: ApprovalStatus;
  collected_by_name?: string;
  approved_at?: string;
  rejection_reason?: string;
  notes?: string;
  created_at: string;
}

export interface ApprovalRequest {
  id: string;
  organization_id?: string;
  workspace_id?: string;
  club_id: string;
  request_type: ApprovalType;
  requested_by_name: string;
  entity_name: string;
  entity_id: string;
  amount?: number;
  reason: string;
  status: ApprovalStatus;
  reviewed_by_name?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  organization_id?: string;
  workspace_id?: string;
  club_id: string;
  expense_number: string;
  recorded_by_name: string;
  category: 'Electricity' | 'Rent' | 'Maintenance' | 'Cleaning' | 'Supplies' | 'Salaries' | 'Other';
  amount: number;
  payment_method: PaymentMethod;
  is_cash_drawer_deduction: boolean;
  recipient_name: string;
  description: string;
  status: ApprovalStatus;
  created_at: string;
}

export interface Booking {
  id: string;
  organization_id?: string;
  workspace_id?: string;
  club_id: string;
  table_id: string;
  table_name: string;
  customer_name: string;
  phone: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  deposit_amount: number;
  status: 'confirmed' | 'checked_in' | 'cancelled' | 'no_show';
  notes?: string;
}

export interface AuditLog {
  id: string;
  organization_id?: string;
  workspace_id?: string;
  club_id: string;
  actor_name: string;
  actor_role: UserRole;
  action: string;
  entity_name: string;
  entity_id?: string;
  details: string;
  created_at: string;
}

export interface ClubSettings {
  organization_id?: string;
  workspace_id?: string;
  club_name: string;
  currency: string;
  currency_symbol: string;
  grace_period_minutes: number;
  cash_difference_tolerance: number;
  discount_approval_threshold: number;
  tax_enabled: boolean;
  tax_percentage: number;
  address: string;
  phone: string;
}
