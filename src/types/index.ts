export type UserRole = 'owner' | 'employee';

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'maintenance' | 'disabled';

export type RateType = 'hourly' | 'per_minute' | 'fixed_frame';

export type SessionStatus = 'active' | 'paused' | 'completed' | 'cancelled' | 'voided';

export type ParticipantRole = 'player' | 'viewer';

export type ParticipantType = 'member' | 'guest' | 'walkin';

export type TableChargeAssignment = 'loser_pays' | 'split_equally' | 'single_designated' | 'custom';

export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'other';

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
  club_id: string;
  name: string;
  rate_type: RateType;
  base_rate: number; // in currency units (e.g. PKR 600/hr)
  minimum_charge: number;
  peak_multiplier: number;
  is_default: boolean;
  is_active: boolean;
}

export interface PhysicalTable {
  id: string;
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
  assigned_participant_id?: string; // Who ordered it!
  assigned_name?: string; // Display name (e.g., Ahmed, Bilal, Usman)
  is_shared: boolean;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
  created_by_name: string;
}

export interface TableSession {
  id: string;
  club_id: string;
  table_id: string;
  table_name: string;
  table_number: string;
  rate_id: string;
  rate_name: string;
  rate_price: number;
  rate_type: RateType;
  opened_by_id: string;
  opened_by_name: string;
  status: SessionStatus;
  start_time: string; // ISO string
  end_time?: string;
  total_duration_minutes: number;
  frames_played: number;
  table_charge_assignment: TableChargeAssignment;
  assigned_loser_id?: string; // id of SessionParticipant
  assigned_loser_name?: string;
  table_charge_amount: number;
  fnb_charge_amount: number;
  discount_amount: number;
  final_amount: number;
  participants: SessionParticipant[];
  orders: OrderItem[];
  notes?: string;
}

export interface ProductCategory {
  id: string;
  club_id: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

export interface Product {
  id: string;
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
  item_type: 'table_time' | 'fnb_product' | 'membership_fee';
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
  club_id: string;
  invoice_number: string;
  session_id?: string;
  table_number?: string;
  customer_name?: string;
  status: InvoiceStatus;
  subtotal: number;
  table_revenue_subtotal: number;
  fnb_revenue_subtotal: number;
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

export interface Member {
  id: string;
  club_id: string;
  membership_number: string;
  full_name: string;
  phone: string;
  email: string;
  plan_name: string;
  discount_percentage: number;
  start_date: string;
  expiry_date: string;
  is_active: boolean;
  total_games_played: number;
}

export interface MembershipPlan {
  id: string;
  club_id: string;
  name: string;
  duration_days: number;
  price: number;
  table_discount_percentage: number;
  fnb_discount_percentage: number;
  is_active: boolean;
}

export interface Booking {
  id: string;
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
