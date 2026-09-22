import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  PhysicalTable,
  TableRate,
  TableSession,
  OrderItem,
  InvoiceItem,
  Product,
  ProductCategory,
  InventoryTransaction,
  Invoice,
  PaymentRecord,
  EmployeeShift,
  CashCollection,
  ApprovalRequest,
  Expense,
  Member,
  MembershipPlan,
  Booking,
  AuditLog,
  ClubSettings,
  UserRole,
  PaymentMethod,
  TableChargeAssignment,
  WorkspaceTenant,
  Organization,
  OnboardingStatus,
  AuthResponse,
  ClubSignupInput,
  LoginCredentials,
} from '../types';
import { authService } from '../services/authService';

interface AppContextType {
  currentUser: UserProfile;
  currentWorkspace: WorkspaceTenant | null;
  currentOrganization: Organization | null;
  isAuthenticated: boolean;
  onboardingStatus: OnboardingStatus | null;
  isAuthLoading: boolean;
  login: (credentials: LoginCredentials & { email?: string }) => Promise<AuthResponse>;
  signup: (input: ClubSignupInput) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  checkAuth: () => Promise<void>;
  switchUserRole: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  setRole: (role: UserRole) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  selectedTableForModal: PhysicalTable | null;
  setSelectedTableForModal: (table: PhysicalTable | null) => void;

  // Domain Entities
  settings: ClubSettings;
  updateSettings: (newSettings: Partial<ClubSettings>) => void;
  tables: PhysicalTable[];
  rates: TableRate[];
  sessions: TableSession[];
  categories: ProductCategory[];
  products: Product[];
  inventoryTransactions: InventoryTransaction[];
  invoices: Invoice[];
  shifts: EmployeeShift[];
  activeShift: EmployeeShift | null;
  collections: CashCollection[];
  approvalRequests: ApprovalRequest[];
  expenses: Expense[];
  members: Member[];
  membershipPlans: MembershipPlan[];
  bookings: Booking[];
  auditLogs: AuditLog[];
  employees: UserProfile[];

  // Operational Actions
  openTable: (tableId: string, rateId: string, playerNames: string[], viewerNames: string[]) => void;
  pauseSession: (sessionId: string) => void;
  resumeSession: (sessionId: string) => void;
  addParticipantToSession: (sessionId: string, name: string, role: 'player' | 'viewer') => void;
  removeParticipantFromSession: (sessionId: string, participantId: string) => void;
  assignSessionLoser: (sessionId: string, participantId: string) => void;
  setChargeAssignmentMode: (sessionId: string, mode: TableChargeAssignment) => void;
  addOrderToSession: (sessionId: string, productId: string, participantId?: string, isShared?: boolean, quantity?: number) => void;
  removeOrderItemFromSession: (sessionId: string, itemId: string) => void;
  closeTableSession: (sessionId: string) => string; // returns created invoice ID
  settleInvoice: (invoiceId: string, tenders: { payerName: string; method: PaymentMethod; amount: number }[]) => void;
  createWalkInSale: (items: { productId: string; quantity: number }[], paymentMethod: PaymentMethod, customerName: string) => string;
  
  // Shift & Cash Actions
  startEmployeeShift: (openingFloat: number) => void;
  closeEmployeeShift: (actualCash: number, reason?: string) => void;
  closeShift: (actualCash: number, reason?: string) => void;
  submitShiftCollection: (shiftId: string) => void;
  requestCashCollection: (shiftId: string, amount?: number, notes?: string) => void;
  approveCollection: (collectionId: string) => void;
  approveCashCollection: (collectionId: string) => void;
  rejectCollection: (collectionId: string, reason: string) => void;

  // Governance Actions
  requestInvoiceVoid: (invoiceId: string, reason: string) => void;
  approveRequest: (requestId: string) => void;
  rejectRequest: (requestId: string, reason: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'expense_number' | 'created_at' | 'status' | 'recorded_by_name'>) => void;
  recordExpense: (title: string, category: string, amount: number, paymentMethod: PaymentMethod, notes?: string) => void;
  
  // Product & Inventory Actions
  updateProductStock: (productId: string, quantityChange: number, type: 'purchase' | 'adjustment' | 'damage', notes?: string) => void;
  recordStockMovement: (productId: string, type: 'purchase' | 'adjustment' | 'damage', quantity: number, unitCost?: number, notes?: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'current_stock'>, initialStock: number) => void;
  updateProductDetails: (productId: string, updates: Partial<Product>) => void;

  // Member & Booking Actions
  addMember: (member: Omit<Member, 'id' | 'membership_number' | 'total_games_played'>) => void;
  addBooking: (booking: Omit<Booking, 'id'>) => void;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  checkInBooking: (bookingId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Users
const OWNER_PROFILE: UserProfile = {
  id: 'user-owner-1',
  club_id: 'club-main',
  organization_id: 'org-cuedesk-01',
  workspace_id: 'cuedesk-main',
  full_name: 'Club Owner',
  role: 'owner',
  phone: '+92 300 1234567',
  email: 'owner@cuedesk.club',
  is_active: true,
};

const MANAGER_PROFILE: UserProfile = {
  id: 'user-mgr-1',
  club_id: 'club-main',
  organization_id: 'org-cuedesk-01',
  workspace_id: 'cuedesk-main',
  full_name: 'Floor Manager',
  role: 'manager',
  phone: '+92 311 9876543',
  email: 'manager@cuedesk.club',
  is_active: true,
};

const EMPLOYEE_PROFILE: UserProfile = {
  id: 'user-emp-1',
  club_id: 'club-main',
  organization_id: 'org-cuedesk-01',
  workspace_id: 'cuedesk-main',
  full_name: 'Cashier Staff',
  role: 'cashier',
  phone: '+92 321 7654321',
  email: 'cashier@cuedesk.club',
  is_active: true,
};

// Initial Rates
const INITIAL_RATES: TableRate[] = [
  {
    id: 'rate-1',
    club_id: 'club-main',
    name: 'Standard Hourly Rate',
    rate_type: 'hourly',
    base_rate: 600, // PKR 600 per hour (Rs 10/min)
    minimum_charge: 150,
    peak_multiplier: 1.0,
    is_default: true,
    is_active: true,
  },
  {
    id: 'rate-2',
    club_id: 'club-main',
    name: 'Peak Night Rate (8PM - 2AM)',
    rate_type: 'hourly',
    base_rate: 900, // PKR 900 per hour
    minimum_charge: 200,
    peak_multiplier: 1.5,
    is_default: false,
    is_active: true,
  },
  {
    id: 'rate-3',
    club_id: 'club-main',
    name: 'Fixed Frame Charge',
    rate_type: 'fixed_frame',
    base_rate: 400, // PKR 400 per frame
    minimum_charge: 400,
    peak_multiplier: 1.0,
    is_default: false,
    is_active: true,
  },
];

// Initial Categories
const INITIAL_CATEGORIES: ProductCategory[] = [
  { id: 'cat-1', club_id: 'club-main', name: 'Soft Drinks', display_order: 1, is_active: true },
  { id: 'cat-2', club_id: 'club-main', name: 'Energy Drinks', display_order: 2, is_active: true },
  { id: 'cat-3', club_id: 'club-main', name: 'Juices & Water', display_order: 3, is_active: true },
  { id: 'cat-4', club_id: 'club-main', name: 'Chips & Crisps', display_order: 4, is_active: true },
  { id: 'cat-5', club_id: 'club-main', name: 'Chocolates & Candies', display_order: 5, is_active: true },
  { id: 'cat-6', club_id: 'club-main', name: 'Cigarettes & Accessories', display_order: 6, is_active: true },
];

// Initial Products
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    club_id: 'club-main',
    category_id: 'cat-1',
    category_name: 'Soft Drinks',
    name: 'Pepsi 500ml',
    sku: 'BEV-PEP-500',
    selling_price: 200,
    cost_price: 130,
    current_stock: 36,
    low_stock_threshold: 10,
    unit: 'Bottle',
    is_active: true,
  },
  {
    id: 'prod-2',
    club_id: 'club-main',
    category_id: 'cat-2',
    category_name: 'Energy Drinks',
    name: 'Sting Berry 500ml',
    sku: 'BEV-STG-500',
    selling_price: 200,
    cost_price: 135,
    current_stock: 42,
    low_stock_threshold: 10,
    unit: 'Bottle',
    is_active: true,
  },
  {
    id: 'prod-3',
    club_id: 'club-main',
    category_id: 'cat-4',
    category_name: 'Chips & Crisps',
    name: 'Lays Classic Masala',
    sku: 'SNK-LAY-MAS',
    selling_price: 120,
    cost_price: 85,
    current_stock: 28,
    low_stock_threshold: 8,
    unit: 'Pack',
    is_active: true,
  },
  {
    id: 'prod-4',
    club_id: 'club-main',
    category_id: 'cat-2',
    category_name: 'Energy Drinks',
    name: 'Red Bull 250ml',
    sku: 'BEV-RBL-250',
    selling_price: 550,
    cost_price: 420,
    current_stock: 4, // Low stock alert!
    low_stock_threshold: 6,
    unit: 'Can',
    is_active: true,
  },
  {
    id: 'prod-5',
    club_id: 'club-main',
    category_id: 'cat-5',
    category_name: 'Chocolates & Candies',
    name: 'KitKat 4-Finger',
    sku: 'SNK-KIT-004',
    selling_price: 150,
    cost_price: 105,
    current_stock: 19,
    low_stock_threshold: 5,
    unit: 'Bar',
    is_active: true,
  },
  {
    id: 'prod-6',
    club_id: 'club-main',
    category_id: 'cat-3',
    category_name: 'Juices & Water',
    name: 'Aquafina Water 500ml',
    sku: 'BEV-AQU-500',
    selling_price: 90,
    cost_price: 50,
    current_stock: 50,
    low_stock_threshold: 12,
    unit: 'Bottle',
    is_active: true,
  },
];

// Seed Table 4 Session matching user requirement:
// Table 4: Players: Ahmed, Bilal, Hamza, Ali; Viewers: Usman, Saad; Loser: Bilal; Game charge: PKR 1,200; Products: 1,040; Grand total: 2,240
const SEED_TABLE_4_SESSION: TableSession = {
  id: 'sess-table-4',
  club_id: 'club-main',
  table_id: 'tbl-4',
  table_name: 'Championship Match Table',
  table_number: 'Table 4',
  rate_id: 'rate-1',
  rate_name: 'Standard Hourly Rate (Rs 600/hr)',
  rate_price: 600,
  rate_type: 'hourly',
  opened_by_id: 'user-emp-1',
  opened_by_name: 'Ali Raza',
  status: 'active',
  start_time: new Date(Date.now() - 120 * 60000).toISOString(), // 2 hours ago (120 mins = Rs 1,200)
  total_duration_minutes: 120,
  frames_played: 1,
  table_charge_assignment: 'loser_pays',
  assigned_loser_id: 'p-bilal',
  assigned_loser_name: 'Bilal',
  table_charge_amount: 1200,
  fnb_charge_amount: 1040,
  discount_amount: 0,
  final_amount: 2240,
  participants: [
    {
      id: 'p-ahmed',
      session_id: 'sess-table-4',
      participant_role: 'player',
      participant_type: 'member',
      member_id: 'mem-1',
      display_name: 'Ahmed',
      joined_at: new Date(Date.now() - 120 * 60000).toISOString(),
      is_active: true,
      is_loser: false,
    },
    {
      id: 'p-bilal',
      session_id: 'sess-table-4',
      participant_role: 'player',
      participant_type: 'guest',
      display_name: 'Bilal',
      joined_at: new Date(Date.now() - 120 * 60000).toISOString(),
      is_active: true,
      is_loser: true, // LOSER of the frame!
    },
    {
      id: 'p-hamza',
      session_id: 'sess-table-4',
      participant_role: 'player',
      participant_type: 'guest',
      display_name: 'Hamza',
      joined_at: new Date(Date.now() - 120 * 60000).toISOString(),
      is_active: true,
      is_loser: false,
    },
    {
      id: 'p-ali',
      session_id: 'sess-table-4',
      participant_role: 'player',
      participant_type: 'member',
      member_id: 'mem-2',
      display_name: 'Ali',
      joined_at: new Date(Date.now() - 120 * 60000).toISOString(),
      is_active: true,
      is_loser: false,
    },
    {
      id: 'v-usman',
      session_id: 'sess-table-4',
      participant_role: 'viewer',
      participant_type: 'guest',
      display_name: 'Usman (Viewer)',
      joined_at: new Date(Date.now() - 100 * 60000).toISOString(),
      is_active: true,
      is_loser: false,
    },
    {
      id: 'v-saad',
      session_id: 'sess-table-4',
      participant_role: 'viewer',
      participant_type: 'guest',
      display_name: 'Saad (Viewer)',
      joined_at: new Date(Date.now() - 90 * 60000).toISOString(),
      is_active: true,
      is_loser: false,
    },
  ],
  orders: [
    {
      id: 'ord-1',
      order_id: 'o-401',
      product_id: 'prod-1',
      product_name: 'Pepsi 500ml',
      assigned_participant_id: 'p-ahmed',
      assigned_name: 'Ahmed',
      is_shared: false,
      quantity: 1,
      unit_price: 200,
      subtotal: 200,
      created_at: new Date(Date.now() - 110 * 60000).toISOString(),
      created_by_name: 'Ali Raza',
    },
    {
      id: 'ord-2',
      order_id: 'o-401',
      product_id: 'prod-2',
      product_name: 'Sting Berry 500ml',
      assigned_participant_id: 'p-bilal',
      assigned_name: 'Bilal',
      is_shared: false,
      quantity: 1,
      unit_price: 200,
      subtotal: 200,
      created_at: new Date(Date.now() - 110 * 60000).toISOString(),
      created_by_name: 'Ali Raza',
    },
    {
      id: 'ord-3',
      order_id: 'o-401',
      product_id: 'prod-3',
      product_name: 'Lays Classic Masala',
      assigned_participant_id: 'p-hamza',
      assigned_name: 'Hamza',
      is_shared: false,
      quantity: 1,
      unit_price: 120,
      subtotal: 120,
      created_at: new Date(Date.now() - 95 * 60000).toISOString(),
      created_by_name: 'Ali Raza',
    },
    {
      id: 'ord-4',
      order_id: 'o-401',
      product_id: 'prod-1',
      product_name: 'Pepsi 500ml',
      assigned_participant_id: 'p-ali',
      assigned_name: 'Ali',
      is_shared: false,
      quantity: 1,
      unit_price: 200,
      subtotal: 200,
      created_at: new Date(Date.now() - 90 * 60000).toISOString(),
      created_by_name: 'Ali Raza',
    },
    {
      id: 'ord-5',
      order_id: 'o-401',
      product_id: 'prod-3',
      product_name: 'Lays Classic Masala',
      assigned_participant_id: 'v-usman',
      assigned_name: 'Usman (Viewer)',
      is_shared: false,
      quantity: 1,
      unit_price: 120,
      subtotal: 120,
      created_at: new Date(Date.now() - 80 * 60000).toISOString(),
      created_by_name: 'Ali Raza',
    },
    {
      id: 'ord-6',
      order_id: 'o-401',
      product_id: 'prod-2',
      product_name: 'Sting Berry 500ml',
      assigned_participant_id: 'v-saad',
      assigned_name: 'Saad (Viewer)',
      is_shared: false,
      quantity: 1,
      unit_price: 200,
      subtotal: 200,
      created_at: new Date(Date.now() - 75 * 60000).toISOString(),
      created_by_name: 'Ali Raza',
    },
  ],
};

// Seed Table 2 Session (A 2-player game)
const SEED_TABLE_2_SESSION: TableSession = {
  id: 'sess-table-2',
  club_id: 'club-main',
  table_id: 'tbl-2',
  table_name: 'Star Tournament Arena',
  table_number: 'Table 2',
  rate_id: 'rate-1',
  rate_name: 'Standard Hourly Rate (Rs 600/hr)',
  rate_price: 600,
  rate_type: 'hourly',
  opened_by_id: 'user-emp-1',
  opened_by_name: 'Ali Raza',
  status: 'active',
  start_time: new Date(Date.now() - 45 * 60000).toISOString(), // 45 mins ago (Rs 450)
  total_duration_minutes: 45,
  frames_played: 1,
  table_charge_assignment: 'split_equally',
  table_charge_amount: 450,
  fnb_charge_amount: 350,
  discount_amount: 0,
  final_amount: 800,
  participants: [
    {
      id: 'p-kashif',
      session_id: 'sess-table-2',
      participant_role: 'player',
      participant_type: 'member',
      display_name: 'Kashif Mehmood',
      joined_at: new Date(Date.now() - 45 * 60000).toISOString(),
      is_active: true,
      is_loser: false,
    },
    {
      id: 'p-zain',
      session_id: 'sess-table-2',
      participant_role: 'player',
      participant_type: 'guest',
      display_name: 'Zain Ul Abideen',
      joined_at: new Date(Date.now() - 45 * 60000).toISOString(),
      is_active: true,
      is_loser: false,
    },
  ],
  orders: [
    {
      id: 'ord-t2-1',
      order_id: 'o-201',
      product_id: 'prod-1',
      product_name: 'Pepsi 500ml',
      assigned_participant_id: 'p-kashif',
      assigned_name: 'Kashif Mehmood',
      is_shared: false,
      quantity: 1,
      unit_price: 200,
      subtotal: 200,
      created_at: new Date(Date.now() - 30 * 60000).toISOString(),
      created_by_name: 'Ali Raza',
    },
    {
      id: 'ord-t2-2',
      order_id: 'o-201',
      product_id: 'prod-5',
      product_name: 'KitKat 4-Finger',
      assigned_participant_id: 'p-zain',
      assigned_name: 'Zain Ul Abideen',
      is_shared: false,
      quantity: 1,
      unit_price: 150,
      subtotal: 150,
      created_at: new Date(Date.now() - 20 * 60000).toISOString(),
      created_by_name: 'Ali Raza',
    },
  ],
};

// Initial Tables
const INITIAL_TABLES: PhysicalTable[] = [
  {
    id: 'tbl-1',
    club_id: 'club-main',
    table_number: 'Table 1',
    name: 'Riley Aristocrat Match Table',
    table_type: 'English Snooker 12ft',
    status: 'available',
    rate_id: 'rate-1',
  },
  {
    id: 'tbl-2',
    club_id: 'club-main',
    table_number: 'Table 2',
    name: 'Star Tournament Arena',
    table_type: 'Star Tournament 12ft',
    status: 'occupied',
    current_session_id: 'sess-table-2',
    rate_id: 'rate-1',
  },
  {
    id: 'tbl-3',
    club_id: 'club-main',
    table_number: 'Table 3',
    name: 'Wiraka 9-Ball Pool Table',
    table_type: 'American Pool 9ft',
    status: 'available',
    rate_id: 'rate-1',
  },
  {
    id: 'tbl-4',
    club_id: 'club-main',
    table_number: 'Table 4',
    name: 'Championship Match Table',
    table_type: 'English Snooker 12ft',
    status: 'occupied',
    current_session_id: 'sess-table-4',
    rate_id: 'rate-1',
  },
  {
    id: 'tbl-5',
    club_id: 'club-main',
    table_number: 'Table 5',
    name: 'Strachan Gold Snooker',
    table_type: 'English Snooker 12ft',
    status: 'reserved',
    maintenance_notes: 'Reserved for 8:00 PM Match (Farhan vs. Kamran)',
    rate_id: 'rate-1',
  },
  {
    id: 'tbl-6',
    club_id: 'club-main',
    table_number: 'Table 6',
    name: 'Billiards Master Table',
    table_type: 'English Snooker 12ft',
    status: 'maintenance',
    maintenance_notes: 'Under Re-clothing (Strachan No. 10 cloth)',
    rate_id: 'rate-1',
  },
];

// Initial Shift (Active shift for employee Ali Raza)
const INITIAL_SHIFTS: EmployeeShift[] = [
  {
    id: 'shift-101',
    club_id: 'club-main',
    employee_id: 'user-emp-1',
    employee_name: 'Ali Raza',
    shift_name: 'Evening Floor Shift',
    start_time: new Date(Date.now() - 240 * 60000).toISOString(),
    status: 'open',
    opening_float: 10000, // PKR 10,000 float
    cash_sales_collected: 18500, // Cash sales so far
    cash_expenses_paid: 1500, // Floor expenses paid in cash
    expected_cash: 27000, // 10000 + 18500 - 1500
    actual_cash: undefined,
    cash_difference: 0,
    notes: 'Shift running smoothly. Floats checked at 6:00 PM.',
  },
  {
    id: 'shift-100',
    club_id: 'club-main',
    employee_id: 'user-emp-1',
    employee_name: 'Ali Raza',
    shift_name: 'Morning Shift Yesterday',
    start_time: new Date(Date.now() - 1700 * 60000).toISOString(),
    end_time: new Date(Date.now() - 1200 * 60000).toISOString(),
    status: 'reconciled',
    opening_float: 10000,
    cash_sales_collected: 15400,
    cash_expenses_paid: 2000,
    expected_cash: 23400,
    actual_cash: 23400,
    cash_difference: 0,
    collection_status: 'approved',
    collection_id: 'col-99',
    notes: 'Shift reconciled cleanly with Owner.',
  },
];

// Initial Invoices
const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-8819',
    club_id: 'club-main',
    invoice_number: 'INV-2026-0819',
    customer_name: 'Waqas Bhatti',
    status: 'paid',
    subtotal: 1800,
    table_revenue_subtotal: 1200,
    fnb_revenue_subtotal: 600,
    discount_amount: 0,
    tax_amount: 0,
    grand_total: 1800,
    paid_amount: 1800,
    balance_due: 0,
    items: [
      { id: 'i-1', item_type: 'table_time', description: 'Table 1 Snooker (120 mins)', quantity: 1, unit_price: 1200, total_price: 1200 },
      { id: 'i-2', item_type: 'fnb_product', description: 'Sting Berry x2', quantity: 2, unit_price: 200, total_price: 400 },
      { id: 'i-3', item_type: 'fnb_product', description: 'Pepsi 500ml', quantity: 1, unit_price: 200, total_price: 200 },
    ],
    payments: [
      {
        id: 'pay-1',
        invoice_id: 'inv-8819',
        payer_name: 'Waqas Bhatti',
        payment_method: 'cash',
        amount: 1800,
        received_by_name: 'Ali Raza',
        created_at: new Date(Date.now() - 180 * 60000).toISOString(),
      },
    ],
    created_by_name: 'Ali Raza',
    created_at: new Date(Date.now() - 180 * 60000).toISOString(),
  },
  {
    id: 'inv-8820',
    club_id: 'club-main',
    invoice_number: 'INV-2026-0820',
    customer_name: 'Walk-in Retail',
    status: 'paid',
    subtotal: 670,
    table_revenue_subtotal: 0,
    fnb_revenue_subtotal: 670,
    discount_amount: 0,
    tax_amount: 0,
    grand_total: 670,
    paid_amount: 670,
    balance_due: 0,
    items: [
      { id: 'i-4', item_type: 'fnb_product', description: 'Pepsi 500ml x2', quantity: 2, unit_price: 200, total_price: 400 },
      { id: 'i-5', item_type: 'fnb_product', description: 'Lays Classic Masala', quantity: 1, unit_price: 120, total_price: 120 },
      { id: 'i-6', item_type: 'fnb_product', description: 'KitKat 4-Finger', quantity: 1, unit_price: 150, total_price: 150 },
    ],
    payments: [
      {
        id: 'pay-2',
        invoice_id: 'inv-8820',
        payer_name: 'Walk-in Customer',
        payment_method: 'cash',
        amount: 670,
        received_by_name: 'Ali Raza',
        created_at: new Date(Date.now() - 150 * 60000).toISOString(),
      },
    ],
    created_by_name: 'Ali Raza',
    created_at: new Date(Date.now() - 150 * 60000).toISOString(),
  },
];

// Initial Approval Requests (For Owner Review)
const INITIAL_APPROVALS: ApprovalRequest[] = [
  {
    id: 'appr-1',
    club_id: 'club-main',
    request_type: 'large_discount',
    requested_by_name: 'Ali Raza',
    entity_name: 'Invoice #INV-2026-0818',
    entity_id: 'inv-8818',
    amount: 350,
    reason: 'Member appreciation 15% discount for tournament finalist',
    status: 'pending',
    created_at: new Date(Date.now() - 130 * 60000).toISOString(),
  },
  {
    id: 'appr-2',
    club_id: 'club-main',
    request_type: 'cash_difference',
    requested_by_name: 'Ali Raza',
    entity_name: 'Shift #100',
    entity_id: 'shift-100',
    amount: 150,
    reason: 'Coinage shortage variance during change dispensing',
    status: 'approved',
    reviewed_by_name: 'Taha Khan',
    reviewed_at: new Date(Date.now() - 600 * 60000).toISOString(),
    created_at: new Date(Date.now() - 1190 * 60000).toISOString(),
  },
];

// Initial Collections
const INITIAL_COLLECTIONS: CashCollection[] = [
  {
    id: 'col-99',
    club_id: 'club-main',
    collection_number: 'COL-2026-0099',
    shift_id: 'shift-100',
    employee_name: 'Ali Raza',
    amount: 23400,
    expected_amount: 23400,
    status: 'approved',
    collected_by_name: 'Taha Khan',
    approved_at: new Date(Date.now() - 1100 * 60000).toISOString(),
    notes: 'Collected in full, cash safely placed in vault.',
    created_at: new Date(Date.now() - 1200 * 60000).toISOString(),
  },
];

// Initial Expenses
const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    club_id: 'club-main',
    expense_number: 'EXP-2026-0041',
    recorded_by_name: 'Ali Raza',
    category: 'Cleaning',
    amount: 1500,
    payment_method: 'cash',
    is_cash_drawer_deduction: true,
    recipient_name: 'Babu Cleaners',
    description: 'Floor sweeping, table cloth vacuuming supplies, trash bags',
    status: 'approved',
    created_at: new Date(Date.now() - 200 * 60000).toISOString(),
  },
  {
    id: 'exp-2',
    club_id: 'club-main',
    expense_number: 'EXP-2026-0042',
    recorded_by_name: 'Taha Khan',
    category: 'Maintenance',
    amount: 6500,
    payment_method: 'bank_transfer',
    is_cash_drawer_deduction: false,
    recipient_name: 'Riley Cue Sports Pakistan',
    description: 'Imported Triangle green chalk box + Master tips 10mm pack',
    status: 'approved',
    created_at: new Date(Date.now() - 1400 * 60000).toISOString(),
  },
];

// Initial Members
const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mem-1',
    club_id: 'club-main',
    membership_number: 'CMP-001',
    full_name: 'Ahmed Mansoor',
    phone: '+92 300 5551234',
    email: 'ahmed.m@gmail.com',
    plan_name: 'Platinum Tier',
    discount_percentage: 20,
    start_date: '2026-01-01',
    expiry_date: '2026-12-31',
    is_active: true,
    total_games_played: 64,
  },
  {
    id: 'mem-2',
    club_id: 'club-main',
    membership_number: 'CMP-002',
    full_name: 'Ali Nawaz',
    phone: '+92 321 8889900',
    email: 'ali.nawaz@yahoo.com',
    plan_name: 'Gold Tier',
    discount_percentage: 10,
    start_date: '2026-03-01',
    expiry_date: '2026-09-30',
    is_active: true,
    total_games_played: 38,
  },
];

// Initial Bookings
const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk-1',
    club_id: 'club-main',
    table_id: 'tbl-5',
    table_name: 'Table 5 - Strachan Gold',
    customer_name: 'Farhan Zaidi',
    phone: '+92 333 4445566',
    booking_date: '2026-09-20',
    start_time: '20:00',
    end_time: '22:00',
    deposit_amount: 500,
    status: 'confirmed',
    notes: 'Challenge match against Kamran. Needs match balls & new chalk.',
  },
  {
    id: 'bk-2',
    club_id: 'club-main',
    table_id: 'tbl-1',
    table_name: 'Table 1 - Riley Aristocrat',
    customer_name: 'Suleman Shah',
    phone: '+92 301 9991122',
    booking_date: '2026-09-20',
    start_time: '22:30',
    end_time: '00:30',
    deposit_amount: 1000,
    status: 'confirmed',
    notes: 'Advance deposit received via Bank Transfer.',
  },
];

// Initial Audit Logs
const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    club_id: 'club-main',
    organization_id: 'org-cuedesk-01',
    workspace_id: 'cuedesk-main',
    actor_name: 'Cashier Staff',
    actor_role: 'cashier',
    action: 'SESSION_OPENED',
    entity_name: 'Table 4',
    entity_id: 'tbl-4',
    details: 'Opened Championship table session for 4 players (Ahmed, Bilal, Hamza, Ali) and 2 viewers',
    created_at: new Date(Date.now() - 120 * 60000).toISOString(),
  },
  {
    id: 'aud-2',
    club_id: 'club-main',
    organization_id: 'org-cuedesk-01',
    workspace_id: 'cuedesk-main',
    actor_name: 'Cashier Staff',
    actor_role: 'cashier',
    action: 'ORDER_ADDED',
    entity_name: 'Order #o-401',
    entity_id: 'ord-2',
    details: 'Added Sting Berry 500ml assigned to Bilal (Player)',
    created_at: new Date(Date.now() - 110 * 60000).toISOString(),
  },
  {
    id: 'aud-3',
    club_id: 'club-main',
    organization_id: 'org-cuedesk-01',
    workspace_id: 'cuedesk-main',
    actor_name: 'Cashier Staff',
    actor_role: 'cashier',
    action: 'LOSER_ASSIGNED',
    entity_name: 'Table 4 Session',
    entity_id: 'sess-table-4',
    details: 'Assigned game/table charge liability (Rs 1,200) to loser: Bilal',
    created_at: new Date(Date.now() - 10 * 60000).toISOString(),
  },
];

const ANONYMOUS_PROFILE: UserProfile = {
  id: '',
  club_id: '',
  full_name: 'Unauthenticated Staff',
  role: 'cashier',
  phone: '',
  email: '',
  is_active: false,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(ANONYMOUS_PROFILE);
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceTenant | null>(null);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedTableForModal, setSelectedTableForModal] = useState<PhysicalTable | null>(null);

  const [settings, setSettings] = useState<ClubSettings>({
    organization_id: 'org-cuedesk-01',
    workspace_id: 'cuedesk-main',
    club_name: 'CueDesk Arena & Lounge',
    currency: 'PKR',
    currency_symbol: 'Rs',
    grace_period_minutes: 5,
    cash_difference_tolerance: 100,
    discount_approval_threshold: 10,
    tax_enabled: false,
    tax_percentage: 0,
    address: 'Commercial Avenue, DHA Phase 5',
    phone: '+92 42 35741234',
  });

  const [tables, setTables] = useState<PhysicalTable[]>(INITIAL_TABLES);
  const [rates] = useState<TableRate[]>(INITIAL_RATES);
  const [sessions, setSessions] = useState<TableSession[]>([SEED_TABLE_4_SESSION, SEED_TABLE_2_SESSION]);
  const [categories] = useState<ProductCategory[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [shifts, setShifts] = useState<EmployeeShift[]>(INITIAL_SHIFTS);
  const [collections, setCollections] = useState<CashCollection[]>(INITIAL_COLLECTIONS);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>(INITIAL_APPROVALS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [membershipPlans] = useState<MembershipPlan[]>([
    { id: 'plan-1', tier: 'basic', club_id: 'club-main', name: 'Regular Club Tier', duration_days: 30, price: 2500, table_discount_percentage: 5, fnb_discount_percentage: 0, is_active: true },
    { id: 'plan-2', tier: 'gold', club_id: 'club-main', name: 'Gold Tier', duration_days: 90, price: 6500, table_discount_percentage: 10, fnb_discount_percentage: 5, is_active: true },
    { id: 'plan-3', tier: 'vip', club_id: 'club-main', name: 'Platinum VIP Tier', duration_days: 365, price: 22000, table_discount_percentage: 20, fnb_discount_percentage: 10, is_active: true },
  ]);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Authenticate and synchronize session with server
  const refreshAuth = async () => {
    setIsAuthLoading(true);
    try {
      const res = await authService.getMe();
      if (res.success && res.session) {
        setCurrentUser(res.session.user);
        setCurrentWorkspace(res.session.workspace);
        setCurrentOrganization(res.session.organization);
        setIsAuthenticated(true);
        setOnboardingStatus(res.session.workspace.onboarding_status);
        if (res.session.workspace.name) {
          setSettings(prev => ({
            ...prev,
            organization_id: res.session!.workspace.organization_id,
            workspace_id: res.session!.workspace.id,
            club_name: res.session!.workspace.name,
          }));
        }
      if (res.session.workspace.onboarding_status === 'active') {
        if (activeView === 'login' || activeView === 'signup' || activeView === 'onboarding_status') {
          setActiveView('dashboard');
        }
      } else {
        setActiveView('onboarding_status');
      }
    } else {
      setCurrentUser(ANONYMOUS_PROFILE);
      setCurrentWorkspace(null);
      setCurrentOrganization(null);
      setIsAuthenticated(false);
      setOnboardingStatus(null);
    }
  } catch {
    setCurrentUser(ANONYMOUS_PROFILE);
    setCurrentWorkspace(null);
    setCurrentOrganization(null);
    setIsAuthenticated(false);
    setOnboardingStatus(null);
  } finally {
    setIsAuthLoading(false);
  }
};

useEffect(() => {
  refreshAuth();
}, []);

const login = async (credentials: LoginCredentials & { email?: string }): Promise<AuthResponse> => {
  const res = await authService.login(credentials);
  if (res.success && res.session) {
    setCurrentUser(res.session.user);
    setCurrentWorkspace(res.session.workspace);
    setCurrentOrganization(res.session.organization);
    setIsAuthenticated(true);
    setOnboardingStatus(res.session.workspace.onboarding_status);
    setSettings(prev => ({
      ...prev,
      organization_id: res.session!.workspace.organization_id,
      workspace_id: res.session!.workspace.id,
      club_name: res.session!.workspace.name,
    }));
    if (res.session.workspace.onboarding_status === 'active') {
      setActiveView('dashboard');
    } else {
      setActiveView('onboarding_status');
    }
  }
  return res;
};

const signup = async (input: ClubSignupInput): Promise<AuthResponse> => {
  const res = await authService.signup(input);
  if (res.success && res.session) {
    setCurrentUser(res.session.user);
    setCurrentWorkspace(res.session.workspace);
    setCurrentOrganization(res.session.organization);
    setIsAuthenticated(true);
    setOnboardingStatus('pending_review');
    setSettings(prev => ({
      ...prev,
      organization_id: res.session!.workspace.organization_id,
      workspace_id: res.session!.workspace.id,
      club_name: res.session!.workspace.name,
    }));
    setActiveView('onboarding_status');
  }
  return res;
};

  const logout = async () => {
    await authService.logout();
    setCurrentUser(ANONYMOUS_PROFILE);
    setCurrentWorkspace(null);
    setCurrentOrganization(null);
    setIsAuthenticated(false);
    setOnboardingStatus(null);
    setActiveView('login');
  };

  // Active Shift for Employee / Cashier
  const activeShift = shifts.find(s => s.status === 'open' && currentUser.id && s.employee_id === currentUser.id) || 
                      shifts.find(s => s.status === 'open') || null;

  // Prohibit client-side role tampering
  const switchUserRole = (_role: UserRole) => {
    console.warn('[CueDesk Security] Role tampering blocked. Roles are strictly server-authoritative.');
  };

  const logAudit = (action: string, entity_name: string, entity_id?: string, details: string = '') => {
    const log: AuditLog = {
      id: 'aud-' + Date.now(),
      club_id: 'club-main',
      actor_name: currentUser.full_name,
      actor_role: currentUser.role,
      action,
      entity_name,
      entity_id,
      details,
      created_at: new Date().toISOString(),
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const updateSettings = (newSettings: Partial<ClubSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    logAudit('SETTINGS_UPDATED', 'Club Settings', undefined, 'Club operational settings modified');
  };

  // 1. Open Table Session
  const openTable = (tableId: string, rateId: string, playerNames: string[], viewerNames: string[]) => {
    const table = tables.find(t => t.id === tableId);
    const rate = rates.find(r => r.id === rateId) || rates[0];
    if (!table) return;

    const sessionId = 'sess-' + Date.now();
    const participants = [
      ...playerNames.map((name, idx) => ({
        id: `p-${sessionId}-${idx}`,
        session_id: sessionId,
        participant_role: 'player' as const,
        participant_type: 'guest' as const,
        display_name: name,
        joined_at: new Date().toISOString(),
        is_active: true,
        is_loser: false,
      })),
      ...viewerNames.map((name, idx) => ({
        id: `v-${sessionId}-${idx}`,
        session_id: sessionId,
        participant_role: 'viewer' as const,
        participant_type: 'guest' as const,
        display_name: name.trim() || `Viewer ${idx + 1}`,
        joined_at: new Date().toISOString(),
        is_active: true,
        is_loser: false,
      })),
    ];

    const newSession: TableSession = {
      id: sessionId,
      club_id: 'club-main',
      table_id: table.id,
      table_name: table.name,
      table_number: table.table_number,
      rate_id: rate.id,
      rate_name: rate.name,
      rate_price: rate.base_rate,
      rate_type: rate.rate_type,
      opened_by_id: currentUser.id,
      opened_by_name: currentUser.full_name,
      status: 'active',
      start_time: new Date().toISOString(),
      total_duration_minutes: 0,
      frames_played: 1,
      table_charge_assignment: 'loser_pays',
      table_charge_amount: 0,
      fnb_charge_amount: 0,
      discount_amount: 0,
      final_amount: 0,
      participants,
      orders: [],
    };

    setSessions(prev => [newSession, ...prev]);
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: 'occupied', current_session_id: sessionId } : t));
    logAudit('SESSION_OPENED', table.table_number, sessionId, `Opened table for ${playerNames.length} players and ${viewerNames.length} viewers`);
  };

  // 2. Pause & Resume Session
  const pauseSession = (sessionId: string) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'paused' } : s));
    logAudit('SESSION_PAUSED', 'Table Session', sessionId, 'Session paused');
  };

  const resumeSession = (sessionId: string) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'active' } : s));
    logAudit('SESSION_RESUMED', 'Table Session', sessionId, 'Session resumed');
  };

  // 3. Participants
  const addParticipantToSession = (sessionId: string, name: string, role: 'player' | 'viewer') => {
    setSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      const newPart = {
        id: `${role[0]}-${Date.now()}`,
        session_id: sessionId,
        participant_role: role,
        participant_type: 'guest' as const,
        display_name: name,
        joined_at: new Date().toISOString(),
        is_active: true,
        is_loser: false,
      };
      return { ...s, participants: [...s.participants, newPart] };
    }));
    logAudit('PARTICIPANT_ADDED', 'Table Session', sessionId, `Added ${role}: ${name}`);
  };

  const removeParticipantFromSession = (sessionId: string, participantId: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      return {
        ...s,
        participants: s.participants.map(p => p.id === participantId ? { ...p, is_active: false, left_at: new Date().toISOString() } : p),
      };
    }));
    logAudit('PARTICIPANT_REMOVED', 'Table Session', sessionId, `Participant marked as left: ${participantId}`);
  };

  // 4. Assign Loser
  const assignSessionLoser = (sessionId: string, participantId: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      const loser = s.participants.find(p => p.id === participantId);
      return {
        ...s,
        table_charge_assignment: 'loser_pays',
        assigned_loser_id: participantId,
        assigned_loser_name: loser ? loser.display_name : undefined,
        participants: s.participants.map(p => ({
          ...p,
          is_loser: p.id === participantId,
        })),
      };
    }));
    logAudit('LOSER_ASSIGNED', 'Table Session', sessionId, `Assigned game liability to loser: ${participantId}`);
  };

  const setChargeAssignmentMode = (sessionId: string, mode: TableChargeAssignment) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      return {
        ...s,
        table_charge_assignment: mode,
        assigned_loser_id: mode === 'loser_pays' ? s.assigned_loser_id : undefined,
        assigned_loser_name: mode === 'loser_pays' ? s.assigned_loser_name : undefined,
      };
    }));
  };

  // 5. Add Orders to Session
  const addOrderToSession = (sessionId: string, productId: string, participantId?: string, isShared: boolean = false, quantity: number = 1) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.current_stock < quantity) {
      alert(`Warning: Insufficient stock for ${product.name}. Remaining: ${product.current_stock}`);
      return;
    }

    setSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      const part = s.participants.find(p => p.id === participantId);
      const newOrderItem: OrderItem = {
        id: 'ord-' + Date.now(),
        order_id: 'o-' + sessionId,
        product_id: product.id,
        product_name: product.name,
        assigned_participant_id: isShared ? undefined : participantId,
        assigned_name: isShared ? 'Shared / Table' : (part ? part.display_name : 'Unknown Guest'),
        is_shared: isShared,
        quantity,
        unit_price: product.selling_price,
        subtotal: product.selling_price * quantity,
        created_at: new Date().toISOString(),
        created_by_name: currentUser.full_name,
      };
      const updatedOrders = [...s.orders, newOrderItem];
      const newFnb = updatedOrders.reduce((sum, o) => sum + o.subtotal, 0);
      return {
        ...s,
        orders: updatedOrders,
        fnb_charge_amount: newFnb,
        final_amount: s.table_charge_amount + newFnb - s.discount_amount,
      };
    }));

    // Decrement stock
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, current_stock: Math.max(0, p.current_stock - quantity) } : p));
    
    // Record inventory transaction
    const invTx: InventoryTransaction = {
      id: 'tx-' + Date.now(),
      club_id: 'club-main',
      product_id: product.id,
      product_name: product.name,
      performed_by_name: currentUser.full_name,
      transaction_type: 'sale',
      quantity_change: -quantity,
      balance_after: product.current_stock - quantity,
      unit_cost: product.cost_price,
      notes: `Ordered on session ${sessionId}`,
      created_at: new Date().toISOString(),
    };
    setInventoryTransactions(prev => [invTx, ...prev]);

    logAudit('ORDER_ADDED', product.name, sessionId, `Added ${quantity}x ${product.name} (Rs ${product.selling_price * quantity})`);
  };

  const removeOrderItemFromSession = (sessionId: string, itemId: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      const itemToRemove = s.orders.find(o => o.id === itemId);
      if (!itemToRemove) return s;

      // Restock
      setProducts(prodPrev => prodPrev.map(p => p.id === itemToRemove.product_id ? { ...p, current_stock: p.current_stock + itemToRemove.quantity } : p));
      
      const updatedOrders = s.orders.filter(o => o.id !== itemId);
      const newFnb = updatedOrders.reduce((sum, o) => sum + o.subtotal, 0);
      return {
        ...s,
        orders: updatedOrders,
        fnb_charge_amount: newFnb,
        final_amount: s.table_charge_amount + newFnb - s.discount_amount,
      };
    }));
    logAudit('ORDER_REMOVED', 'Table Session', sessionId, `Removed order item ${itemId}`);
  };

  // 6. Close Session & Generate Combined Invoice
  const closeTableSession = (sessionId: string): string => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return '';

    const invoiceId = 'inv-' + Date.now();
    const invoiceNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const items: InvoiceItem[] = [
      {
        id: 'ii-table-' + sessionId,
        item_type: 'table_time',
        description: `${session.table_number} Game Charge (${session.total_duration_minutes || 60} mins)`,
        assigned_to_name: session.table_charge_assignment === 'loser_pays' 
          ? (session.assigned_loser_name ? `${session.assigned_loser_name} (Loser)` : 'Loser')
          : (session.table_charge_assignment === 'split_equally' ? 'Split across players' : 'Designated'),
        quantity: 1,
        unit_price: session.table_charge_amount,
        total_price: session.table_charge_amount,
      },
      ...session.orders.map(o => ({
        id: 'ii-' + o.id,
        item_type: 'fnb_product' as const,
        description: `${o.product_name} (${o.quantity}x)`,
        assigned_to_name: o.assigned_name,
        quantity: o.quantity,
        unit_price: o.unit_price,
        total_price: o.subtotal,
      })),
    ];

    const grandTotal = session.table_charge_amount + session.fnb_charge_amount - session.discount_amount;

    const newInvoice: Invoice = {
      id: invoiceId,
      club_id: 'club-main',
      invoice_number: invoiceNumber,
      session_id: sessionId,
      table_number: session.table_number,
      customer_name: session.assigned_loser_name || session.participants[0]?.display_name || 'Floor Guest',
      status: 'open',
      subtotal: session.table_charge_amount + session.fnb_charge_amount,
      table_revenue_subtotal: session.table_charge_amount,
      fnb_revenue_subtotal: session.fnb_charge_amount,
      discount_amount: session.discount_amount,
      tax_amount: 0,
      grand_total: grandTotal,
      paid_amount: 0,
      balance_due: grandTotal,
      items,
      payments: [],
      created_by_name: currentUser.full_name,
      created_at: new Date().toISOString(),
    };

    setInvoices(prev => [newInvoice, ...prev]);

    // Mark session as completed
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'completed', end_time: new Date().toISOString() } : s));

    // Release table
    setTables(prev => prev.map(t => t.id === session.table_id ? { ...t, status: 'available', current_session_id: undefined } : t));

    logAudit('SESSION_CLOSED', session.table_number, sessionId, `Closed session. Generated ${invoiceNumber} for Rs ${grandTotal}`);
    return invoiceId;
  };

  // 7. Settle Invoice with Multiple Tenders / Split Payment
  const settleInvoice = (invoiceId: string, tenders: { payerName: string; method: PaymentMethod; amount: number }[]) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;

    const totalTendered = tenders.reduce((sum, t) => sum + t.amount, 0);
    const newPayments: PaymentRecord[] = tenders.map((t, idx) => ({
      id: `pay-${invoiceId}-${idx}-${Date.now()}`,
      invoice_id: invoiceId,
      payer_name: t.payerName,
      payment_method: t.method,
      amount: t.amount,
      received_by_name: currentUser.full_name,
      created_at: new Date().toISOString(),
    }));

    const updatedPaid = invoice.paid_amount + totalTendered;
    const newBalance = Math.max(0, invoice.grand_total - updatedPaid);
    const newStatus = newBalance === 0 ? 'paid' : 'partially_paid';

    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invoiceId) return inv;
      return {
        ...inv,
        paid_amount: updatedPaid,
        balance_due: newBalance,
        status: newStatus,
        payments: [...inv.payments, ...newPayments],
      };
    }));

    // Update active employee shift cash drawer if cash tendered
    const cashPortion = tenders.filter(t => t.method === 'cash').reduce((sum, t) => sum + t.amount, 0);
    if (cashPortion > 0 && activeShift) {
      setShifts(prev => prev.map(s => {
        if (s.id !== activeShift.id) return s;
        const newSales = s.cash_sales_collected + cashPortion;
        const newExpected = s.opening_float + newSales - s.cash_expenses_paid;
        return {
          ...s,
          cash_sales_collected: newSales,
          expected_cash: newExpected,
        };
      }));
    }

    logAudit('PAYMENT_PROCESSED', invoice.invoice_number, invoiceId, `Processed ${tenders.length} payment tender(s) totalling Rs ${totalTendered}`);
  };

  // 8. Walk-in Retail Sale
  const createWalkInSale = (items: { productId: string; quantity: number }[], paymentMethod: PaymentMethod, customerName: string): string => {
    let subtotal = 0;
    const invoiceItems: InvoiceItem[] = [];

    items.forEach((item, idx) => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        const lineTotal = prod.selling_price * item.quantity;
        subtotal += lineTotal;
        invoiceItems.push({
          id: `wii-${idx}-${Date.now()}`,
          item_type: 'fnb_product',
          description: `${prod.name} (${item.quantity}x)`,
          assigned_to_name: customerName,
          quantity: item.quantity,
          unit_price: prod.selling_price,
          total_price: lineTotal,
        });

        // Decrement stock
        setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, current_stock: Math.max(0, p.current_stock - item.quantity) } : p));

        // Inventory tx
        setInventoryTransactions(prev => [{
          id: 'tx-w-' + Date.now() + idx,
          club_id: 'club-main',
          product_id: prod.id,
          product_name: prod.name,
          performed_by_name: currentUser.full_name,
          transaction_type: 'sale',
          quantity_change: -item.quantity,
          balance_after: prod.current_stock - item.quantity,
          unit_cost: prod.cost_price,
          notes: `Walk-in checkout (${customerName})`,
          created_at: new Date().toISOString(),
        }, ...prev]);
      }
    });

    const invoiceId = 'inv-walkin-' + Date.now();
    const invoiceNumber = `INV-W2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInvoice: Invoice = {
      id: invoiceId,
      club_id: 'club-main',
      invoice_number: invoiceNumber,
      customer_name: customerName || 'Walk-in Customer',
      status: 'paid',
      subtotal,
      table_revenue_subtotal: 0,
      fnb_revenue_subtotal: subtotal,
      discount_amount: 0,
      tax_amount: 0,
      grand_total: subtotal,
      paid_amount: subtotal,
      balance_due: 0,
      items: invoiceItems,
      payments: [
        {
          id: 'pay-w-' + Date.now(),
          invoice_id: invoiceId,
          payer_name: customerName || 'Walk-in Customer',
          payment_method: paymentMethod,
          amount: subtotal,
          received_by_name: currentUser.full_name,
          created_at: new Date().toISOString(),
        },
      ],
      created_by_name: currentUser.full_name,
      created_at: new Date().toISOString(),
    };

    setInvoices(prev => [newInvoice, ...prev]);

    // Update shift if cash
    if (paymentMethod === 'cash' && activeShift) {
      setShifts(prev => prev.map(s => {
        if (s.id !== activeShift.id) return s;
        const newSales = s.cash_sales_collected + subtotal;
        return {
          ...s,
          cash_sales_collected: newSales,
          expected_cash: s.opening_float + newSales - s.cash_expenses_paid,
        };
      }));
    }

    logAudit('WALKIN_SALE', invoiceNumber, invoiceId, `Walk-in F&B sale for Rs ${subtotal} paid via ${paymentMethod.toUpperCase()}`);
    return invoiceId;
  };

  // 9. Employee Shift Controls
  const startEmployeeShift = (openingFloat: number) => {
    const newShift: EmployeeShift = {
      id: 'shift-' + Date.now(),
      club_id: 'club-main',
      employee_id: currentUser.id,
      employee_name: currentUser.full_name,
      shift_name: `${currentUser.full_name}'s Shift`,
      start_time: new Date().toISOString(),
      status: 'open',
      opening_float: openingFloat,
      cash_sales_collected: 0,
      cash_expenses_paid: 0,
      expected_cash: openingFloat,
      notes: 'Shift started with opening float verification.',
    };

    setShifts(prev => [newShift, ...prev]);
    logAudit('SHIFT_OPENED', newShift.shift_name, newShift.id, `Opened shift with cash float of Rs ${openingFloat}`);
  };

  const closeEmployeeShift = (actualCash: number, reason?: string) => {
    if (!activeShift) return;
    const diff = actualCash - activeShift.expected_cash;

    setShifts(prev => prev.map(s => {
      if (s.id !== activeShift.id) return s;
      return {
        ...s,
        end_time: new Date().toISOString(),
        status: 'collection_pending',
        actual_cash: actualCash,
        cash_difference: diff,
        difference_reason: reason,
        notes: `Shift closed. Actual count: Rs ${actualCash}. Difference: Rs ${diff}`,
      };
    }));

    // If discrepancy, create approval request for Owner
    if (Math.abs(diff) > settings.cash_difference_tolerance) {
      const req: ApprovalRequest = {
        id: 'appr-' + Date.now(),
        club_id: 'club-main',
        request_type: 'cash_difference',
        requested_by_name: currentUser.full_name,
        entity_name: activeShift.shift_name,
        entity_id: activeShift.id,
        amount: Math.abs(diff),
        reason: reason || `Cash drawer discrepancy of Rs ${diff}`,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      setApprovalRequests(prev => [req, ...prev]);
    }

    logAudit('SHIFT_CLOSED', activeShift.shift_name, activeShift.id, `Closed shift. Counted Rs ${actualCash} (Diff: Rs ${diff})`);
  };

  const submitShiftCollection = (shiftId: string) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return;

    const colId = 'col-' + Date.now();
    const colNumber = `COL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const collectionAmount = shift.actual_cash !== undefined ? shift.actual_cash : shift.expected_cash;

    const newCollection: CashCollection = {
      id: colId,
      club_id: 'club-main',
      collection_number: colNumber,
      shift_id: shiftId,
      employee_name: shift.employee_name,
      amount: collectionAmount,
      expected_amount: shift.expected_cash,
      status: 'pending',
      notes: `Submitted for Owner collection approval.`,
      created_at: new Date().toISOString(),
    };

    setCollections(prev => [newCollection, ...prev]);

    // Create approval request for Owner
    const req: ApprovalRequest = {
      id: 'appr-col-' + Date.now(),
      club_id: 'club-main',
      request_type: 'cash_collection',
      requested_by_name: shift.employee_name,
      entity_name: colNumber,
      entity_id: colId,
      amount: collectionAmount,
      reason: `Shift handover of Rs ${collectionAmount} submitted for Owner approval`,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    setApprovalRequests(prev => [req, ...prev]);

    logAudit('COLLECTION_SUBMITTED', colNumber, colId, `Submitted cash handover of Rs ${collectionAmount}`);
  };

  const approveCollection = (collectionId: string) => {
    const col = collections.find(c => c.id === collectionId);
    if (!col) return;

    setCollections(prev => prev.map(c => c.id === collectionId ? {
      ...c,
      status: 'approved',
      approved_at: new Date().toISOString(),
      collected_by_name: currentUser.full_name,
    } : c));

    // Mark shift as reconciled
    setShifts(prev => prev.map(s => s.id === col.shift_id ? {
      ...s,
      status: 'reconciled',
      collection_status: 'approved',
      collection_id: collectionId,
    } : s));

    // Update approval request status
    setApprovalRequests(prev => prev.map(a => a.entity_id === collectionId ? {
      ...a,
      status: 'approved',
      reviewed_by_name: currentUser.full_name,
      reviewed_at: new Date().toISOString(),
    } : a));

    logAudit('COLLECTION_APPROVED', col.collection_number, collectionId, `Owner approved and safely vaulted Rs ${col.amount}`);
  };

  const rejectCollection = (collectionId: string, reason: string) => {
    setCollections(prev => prev.map(c => c.id === collectionId ? {
      ...c,
      status: 'rejected',
      rejection_reason: reason,
    } : c));

    setApprovalRequests(prev => prev.map(a => a.entity_id === collectionId ? {
      ...a,
      status: 'rejected',
      rejection_reason: reason,
      reviewed_by_name: currentUser.full_name,
      reviewed_at: new Date().toISOString(),
    } : a));

    logAudit('COLLECTION_REJECTED', 'Cash Collection', collectionId, `Rejected collection: ${reason}`);
  };

  // 10. Governance & Approvals
  const requestInvoiceVoid = (invoiceId: string, reason: string) => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return;

    const req: ApprovalRequest = {
      id: 'appr-void-' + Date.now(),
      club_id: 'club-main',
      request_type: 'invoice_void',
      requested_by_name: currentUser.full_name,
      entity_name: inv.invoice_number,
      entity_id: invoiceId,
      amount: inv.grand_total,
      reason,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    setApprovalRequests(prev => [req, ...prev]);
    logAudit('INVOICE_VOID_REQUESTED', inv.invoice_number, invoiceId, `Requested void: ${reason}`);
  };

  const approveRequest = (requestId: string) => {
    const req = approvalRequests.find(r => r.id === requestId);
    if (!req) return;

    if (req.request_type === 'cash_collection') {
      approveCollection(req.entity_id);
    } else if (req.request_type === 'invoice_void') {
      setInvoices(prev => prev.map(inv => inv.id === req.entity_id ? { ...inv, status: 'voided', void_reason: req.reason } : inv));
    }

    setApprovalRequests(prev => prev.map(r => r.id === requestId ? {
      ...r,
      status: 'approved',
      reviewed_by_name: currentUser.full_name,
      reviewed_at: new Date().toISOString(),
    } : r));

    logAudit('APPROVAL_GRANTED', req.request_type, requestId, `Owner approved request for ${req.entity_name}`);
  };

  const rejectRequest = (requestId: string, reason: string) => {
    setApprovalRequests(prev => prev.map(r => r.id === requestId ? {
      ...r,
      status: 'rejected',
      rejection_reason: reason,
      reviewed_by_name: currentUser.full_name,
      reviewed_at: new Date().toISOString(),
    } : r));

    logAudit('APPROVAL_REJECTED', 'Approval Request', requestId, `Owner rejected request: ${reason}`);
  };

  // 11. Expenses
  const addExpense = (expenseData: Omit<Expense, 'id' | 'expense_number' | 'created_at' | 'status' | 'recorded_by_name'>) => {
    const expId = 'exp-' + Date.now();
    const expNumber = `EXP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newExp: Expense = {
      ...expenseData,
      id: expId,
      expense_number: expNumber,
      recorded_by_name: currentUser.full_name,
      status: 'approved',
      created_at: new Date().toISOString(),
    };

    setExpenses(prev => [newExp, ...prev]);

    // If paid from active shift cash drawer, update drawer cash
    if (expenseData.is_cash_drawer_deduction && activeShift && expenseData.payment_method === 'cash') {
      setShifts(prev => prev.map(s => {
        if (s.id !== activeShift.id) return s;
        const newExpenses = s.cash_expenses_paid + expenseData.amount;
        return {
          ...s,
          cash_expenses_paid: newExpenses,
          expected_cash: s.opening_float + s.cash_sales_collected - newExpenses,
        };
      }));
    }

    logAudit('EXPENSE_RECORDED', expNumber, expId, `Recorded expense of Rs ${expenseData.amount} for ${expenseData.category}`);
  };

  // 12. Products & Stock
  const updateProductStock = (productId: string, quantityChange: number, type: 'purchase' | 'adjustment' | 'damage', notes?: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const newStock = Math.max(0, prod.current_stock + quantityChange);
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, current_stock: newStock } : p));

    setInventoryTransactions(prev => [{
      id: 'tx-adj-' + Date.now(),
      club_id: 'club-main',
      product_id: productId,
      product_name: prod.name,
      performed_by_name: currentUser.full_name,
      transaction_type: type,
      quantity_change: quantityChange,
      balance_after: newStock,
      unit_cost: prod.cost_price,
      notes: notes || `Stock ${type}`,
      created_at: new Date().toISOString(),
    }, ...prev]);

    logAudit('INVENTORY_ADJUSTED', prod.name, productId, `Stock adjustment (${type}): ${quantityChange > 0 ? '+' : ''}${quantityChange}. New balance: ${newStock}`);
  };

  const addProduct = (productData: Omit<Product, 'id' | 'current_stock'>, initialStock: number) => {
    const prodId = 'prod-' + Date.now();
    const newProd: Product = {
      ...productData,
      id: prodId,
      current_stock: initialStock,
    };
    setProducts(prev => [newProd, ...prev]);
    logAudit('PRODUCT_CREATED', newProd.name, prodId, `Added new product SKU: ${newProd.sku}`);
  };

  const updateProductDetails = (productId: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
    logAudit('PRODUCT_UPDATED', 'Product Catalog', productId, `Updated product details`);
  };

  // 13. Members & Bookings
  const addMember = (memberData: Omit<Member, 'id' | 'membership_number' | 'total_games_played'>) => {
    const memId = 'mem-' + Date.now();
    const memNumber = `CMP-${Math.floor(100 + Math.random() * 900)}`;
    const newMember: Member = {
      ...memberData,
      id: memId,
      membership_number: memNumber,
      total_games_played: 0,
    };
    setMembers(prev => [newMember, ...prev]);
    logAudit('MEMBER_REGISTERED', newMember.full_name, memId, `Registered member #${memNumber}`);
  };

  const addBooking = (bookingData: Omit<Booking, 'id'>) => {
    const bkId = 'bk-' + Date.now();
    const newBooking: Booking = {
      ...bookingData,
      id: bkId,
    };
    setBookings(prev => [newBooking, ...prev]);
    logAudit('BOOKING_CREATED', newBooking.table_name, bkId, `Created booking for ${newBooking.customer_name} on ${newBooking.booking_date}`);
  };

  const updateBookingStatus = (bookingId: string, status: Booking['status']) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
    logAudit('BOOKING_UPDATED', 'Booking', bookingId, `Updated booking status to ${status}`);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentWorkspace,
        currentOrganization,
        isAuthenticated,
        onboardingStatus,
        isAuthLoading,
        login,
        signup,
        logout,
        refreshAuth,
        checkAuth: refreshAuth,
        switchUserRole,
        activeView,
        setActiveView,
        selectedTableForModal,
        setSelectedTableForModal,
        settings,
        updateSettings,
        tables,
        rates,
        sessions,
        categories,
        products,
        inventoryTransactions,
        invoices,
        shifts,
        activeShift,
        collections,
        approvalRequests,
        expenses,
        members,
        membershipPlans,
        bookings,
        auditLogs,
        employees: [OWNER_PROFILE, EMPLOYEE_PROFILE],
        switchRole: switchUserRole,
        setRole: switchUserRole,
        openTable,
        pauseSession,
        resumeSession,
        addParticipantToSession,
        removeParticipantFromSession,
        assignSessionLoser,
        setChargeAssignmentMode,
        addOrderToSession,
        removeOrderItemFromSession,
        closeTableSession,
        settleInvoice,
        createWalkInSale,
        startEmployeeShift,
        closeEmployeeShift,
        closeShift: closeEmployeeShift,
        submitShiftCollection,
        requestCashCollection: (shiftId: string, _amount?: number, _notes?: string) => submitShiftCollection(shiftId),
        approveCollection,
        approveCashCollection: approveCollection,
        rejectCollection,
        requestInvoiceVoid,
        approveRequest,
        rejectRequest,
        addExpense,
        recordExpense: (title: string, category: string, amount: number, paymentMethod: PaymentMethod, notes?: string) => {
          addExpense({
            club_id: 'club-main',
            category: (category as any) || 'Supplies',
            amount,
            payment_method: paymentMethod,
            is_cash_drawer_deduction: paymentMethod === 'cash',
            recipient_name: title,
            description: notes || title,
          });
        },
        updateProductStock,
        recordStockMovement: (productId: string, type: 'purchase' | 'adjustment' | 'damage', quantity: number, unitCost?: number, notes?: string) => {
          updateProductStock(productId, type === 'purchase' ? quantity : -quantity, type, notes);
        },
        addProduct,
        updateProductDetails,
        addMember,
        addBooking,
        updateBookingStatus,
        checkInBooking: (bookingId: string) => updateBookingStatus(bookingId, 'checked_in'),
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
