// apps/web/app/dashboard/page.tsx
/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import _ from 'lodash';
import {
  Building2, Wallet, AlertCircle, TrendingUp,
  TrendingDown, Download, Activity, ArrowRight,
  CheckCircle2, Clock, CalendarDays, DoorOpen,
  FileText, Smartphone, XCircle, PiggyBank, Receipt, PieChart,
  AlertTriangle, CalendarClock, Megaphone, Wrench,
  Calculator, Target, Users, DollarSign, Plus, Globe, Filter, Languages,
  Loader2
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';

// --- MOCK EXCHANGE RATES (Base: KES) ---
const EXCHANGE_RATES: Record<string, number> = {
  KES: 1,
  USD: 1 / 130,  // 1 KES = ~0.0077 USD
  EUR: 1 / 142,  // 1 KES = ~0.0070 EUR
  TZS: 20,       // 1 KES = ~20 TZS
  UGX: 30        // 1 KES = ~30 UGX
};

// --- NATIVE TRANSLATION DICTIONARY ---
const TRANSLATIONS = {
  EN: {
    greeting_morning: "Good morning", greeting_afternoon: "Good afternoon", greeting_evening: "Good evening",
    subtitle: "Here is the real-time financial and operational status of your property portfolio.",
    general_ledger: "General Ledger", record_expense: "Record Expense",
    pipeline_crm: "Pipeline CRM", marketplace: "Marketplace",
    onboard_tenant: "Onboard Tenant", lease_manager: "Lease Manager",
    log_ticket: "Log Ticket", maintenance: "Maintenance",
    outstanding_arrears: "Outstanding Arrears", unpaid_balance: "Unpaid Balance",
    gross_collected: "Gross Collected", mtd_velocity: "MTD Velocity",
    net_margin: "Net Margin", profit: "Profit",
    collection_health: "Collection Health", clearance: "Clearance",
    occupancy: "Occupancy", units: "Units",
    new_leads: "New Leads", unread: "Unread", reply: "Reply",
    defaulters: "Defaulters", highest_balances: "Highest balances", found: "Found", remind: "Remind",
    renewals: "Renewals", expiring: "Expiring < 60 days", soon: "Soon", view_lease: "View Lease", days: "Days",
    pending_fixes: "Pending Fixes", unresolved_tickets: "Unresolved tickets", open: "Open",
    collection_trajectory: "Collection Trajectory", realized_income: "Realized income over the last 6 months", live_data: "Live Data",
    active_portfolio: "Active Portfolio", managed_units: "Managed Units", no_properties: "No properties", add_property: "Add a property to start tracking.",
    recent_ledger: "Recent Ledger Entries", latest_transactions: "Latest automated invoices and transactions.", view_ledger: "View Full Ledger",
    tenant_entity: "Tenant / Entity", date_issued: "Date Issued", amount: "Amount", status: "Status",
    live_mpesa: "Live M-Pesa Feed", webhook_connections: "Webhook Connections", waiting_payments: "Waiting for payments...",
    export: "Export"
  },
  SW: {
    greeting_morning: "Habari ya asubuhi", greeting_afternoon: "Habari ya mchana", greeting_evening: "Habari ya jioni",
    subtitle: "Hapa kuna hali halisi ya kifedha na uendeshaji wa mali zako.",
    general_ledger: "Leja Kuu", record_expense: "Rekodi Matumizi",
    pipeline_crm: "Mawasiliano (CRM)", marketplace: "Soko",
    onboard_tenant: "Sajili Mpangaji", lease_manager: "Meneja wa Kodi",
    log_ticket: "Ripoti Tatizo", maintenance: "Matengenezo",
    outstanding_arrears: "Malimbikizo", unpaid_balance: "Kiasi Hakijalipwa",
    gross_collected: "Pato Ghafi", mtd_velocity: "Kasi ya Mwezi",
    net_margin: "Faida Halisi", profit: "Faida",
    collection_health: "Hali ya Makusanyo", clearance: "Uidhinishaji",
    occupancy: "Ujazaji", units: "Vyumba",
    new_leads: "Wateja Wapya", unread: "Hazijasomwa", reply: "Jibu",
    defaulters: "Wadaiwa", highest_balances: "Madeni Makubwa", found: "Zimepatikana", remind: "Kumbusha",
    renewals: "Upyaji", expiring: "Zinaisha < siku 60", soon: "Karibuni", view_lease: "Tazama", days: "Siku",
    pending_fixes: "Matengenezo", unresolved_tickets: "Hazijatatuliwa", open: "Wazi",
    collection_trajectory: "Mwenendo wa Makusanyo", realized_income: "Mapato ya miezi 6 iliyopita", live_data: "Moja kwa Moja",
    active_portfolio: "Mali Zako", managed_units: "Vyumba", no_properties: "Hakuna Mali", add_property: "Ongeza mali kuanza.",
    recent_ledger: "Kumbukumbu za Leja", latest_transactions: "Ankara na miamala ya hivi karibuni.", view_ledger: "Tazama Leja Kamili",
    tenant_entity: "Mpangaji / Jina", date_issued: "Tarehe", amount: "Kiasi", status: "Hali",
    live_mpesa: "Miamala ya M-Pesa", webhook_connections: "Miunganisho ya Mfumo", waiting_payments: "Inasubiri malipo...",
    export: "Pakua"
  },
  FR: {
    greeting_morning: "Bonjour", greeting_afternoon: "Bon après-midi", greeting_evening: "Bonsoir",
    subtitle: "Voici l'état financier et opérationnel en temps réel de votre portefeuille.",
    general_ledger: "Grand Livre", record_expense: "Dépense",
    pipeline_crm: "Pipeline CRM", marketplace: "Marché",
    onboard_tenant: "Nouveau Locataire", lease_manager: "Gestion des Baux",
    log_ticket: "Créer Ticket", maintenance: "Entretien",
    outstanding_arrears: "Arriérés", unpaid_balance: "Solde Impayé",
    gross_collected: "Total Collecté", mtd_velocity: "Vélocité MTD",
    net_margin: "Marge Nette", profit: "Bénéfice",
    collection_health: "Santé Recouvrement", clearance: "Liquidation",
    occupancy: "Occupation", units: "Unités",
    new_leads: "Prospects", unread: "Non Lu", reply: "Répondre",
    defaulters: "Défaillants", highest_balances: "Soldes Élevés", found: "Trouvé", remind: "Rappeler",
    renewals: "Renouvellements", expiring: "Expire < 60 jours", soon: "Bientôt", view_lease: "Voir le bail", days: "Jours",
    pending_fixes: "Réparations", unresolved_tickets: "Non Résolu", open: "Ouvert",
    collection_trajectory: "Trajectoire de Recouvrement", realized_income: "Revenus réalisés sur les 6 derniers mois", live_data: "En Direct",
    active_portfolio: "Portefeuille Actif", managed_units: "Unités Gérées", no_properties: "Aucune propriété", add_property: "Ajoutez une propriété.",
    recent_ledger: "Entrées Récentes", latest_transactions: "Dernières factures et transactions.", view_ledger: "Voir le Grand Livre",
    tenant_entity: "Locataire / Entité", date_issued: "Date d'émission", amount: "Montant", status: "Statut",
    live_mpesa: "Flux M-Pesa en Direct", webhook_connections: "Connexions Webhook", waiting_payments: "En attente de paiements...",
    export: "Exporter"
  },
  ES: {
    greeting_morning: "Buenos días", greeting_afternoon: "Buenas tardes", greeting_evening: "Buenas noches",
    subtitle: "Aquí está el estado financiero y operativo en tiempo real de su cartera.",
    general_ledger: "Libro Mayor", record_expense: "Registrar Gasto",
    pipeline_crm: "CRM de Ventas", marketplace: "Mercado",
    onboard_tenant: "Registrar Inquilino", lease_manager: "Gestor de Contratos",
    log_ticket: "Crear Ticket", maintenance: "Mantenimiento",
    outstanding_arrears: "Atrasos", unpaid_balance: "Saldo Pendiente",
    gross_collected: "Total Cobrado", mtd_velocity: "Velocidad MTD",
    net_margin: "Margen Neto", profit: "Beneficio",
    collection_health: "Salud de Cobro", clearance: "Liquidación",
    occupancy: "Ocupación", units: "Unidades",
    new_leads: "Nuevos Prospectos", unread: "No Leído", reply: "Responder",
    defaulters: "Morosos", highest_balances: "Saldos Altos", found: "Encontrado", remind: "Recordar",
    renewals: "Renovaciones", expiring: "Expira < 60 días", soon: "Pronto", view_lease: "Ver contrato", days: "Días",
    pending_fixes: "Reparaciones", unresolved_tickets: "No Resuelto", open: "Abierto",
    collection_trajectory: "Trayectoria de Cobro", realized_income: "Ingresos de los últimos 6 meses", live_data: "En Vivo",
    active_portfolio: "Cartera Activa", managed_units: "Unidades Gestionadas", no_properties: "Sin propiedades", add_property: "Añada una propiedad.",
    recent_ledger: "Entradas Recientes", latest_transactions: "Últimas facturas y transacciones.", view_ledger: "Ver Libro Mayor",
    tenant_entity: "Inquilino / Entidad", date_issued: "Fecha de emisión", amount: "Monto", status: "Estado",
    live_mpesa: "Flujo M-Pesa en Vivo", webhook_connections: "Conexiones Webhook", waiting_payments: "Esperando pagos...",
    export: "Exportar"
  },
  AR: {
    greeting_morning: "صباح الخير", greeting_afternoon: "طاب مساؤك", greeting_evening: "مساء الخير",
    subtitle: "إليك الحالة المالية والتشغيلية في الوقت الفعلي لمحفظتك العقارية.",
    general_ledger: "دفتر الأستاذ", record_expense: "تسجيل مصروف",
    pipeline_crm: "إدارة العملاء", marketplace: "السوق",
    onboard_tenant: "تسجيل مستأجر", lease_manager: "مدير العقود",
    log_ticket: "تذكرة صيانة", maintenance: "صيانة",
    outstanding_arrears: "المتأخرات", unpaid_balance: "الرصيد غير المدفوع",
    gross_collected: "إجمالي المحصل", mtd_velocity: "سرعة الشهر",
    net_margin: "صافي الربح", profit: "ربح",
    collection_health: "صحة التحصيل", clearance: "تصفية",
    occupancy: "الإشغال", units: "وحدات",
    new_leads: "عملاء جدد", unread: "غير مقروء", reply: "رد",
    defaulters: "المتخلفين", highest_balances: "أعلى الأرصدة", found: "موجود", remind: "تذكير",
    renewals: "التجديدات", expiring: "ينتهي < 60 يوم", soon: "قريباً", view_lease: "عرض العقد", days: "أيام",
    pending_fixes: "الإصلاحات المعلقة", unresolved_tickets: "غير محلولة", open: "مفتوح",
    collection_trajectory: "مسار التحصيل", realized_income: "الدخل المحقق لآخر 6 أشهر", live_data: "بيانات حية",
    active_portfolio: "المحفظة النشطة", managed_units: "الوحدات المدارة", no_properties: "لا توجد عقارات", add_property: "أضف عقار للبدء.",
    recent_ledger: "الإدخالات الأخيرة", latest_transactions: "أحدث الفواتير والمعاملات.", view_ledger: "عرض السجل الكامل",
    tenant_entity: "المستأجر / الكيان", date_issued: "تاريخ الإصدار", amount: "المبلغ", status: "الحالة",
    live_mpesa: "تغذية M-Pesa الحية", webhook_connections: "اتصالات الويب هوك", waiting_payments: "في انتظار المدفوعات...",
    export: "تصدير"
  }
};

export default function MasterDashboardPage() {
  const router = useRouter();
  const { profile } = useUserStore();

  // 1. Identify their exact staff role
  const isStaffWorkspace = !!profile?.staff;
  const staffRoleType = profile?.staff?.role_type || 'NONE';

  // 2. Intelligent Traffic Controller
  useEffect(() => {
    if (isStaffWorkspace) {
      if (staffRoleType === 'VENDOR') {
        router.replace('/dashboard/maintenance'); // Plumbers go straight to tickets
      } else if (staffRoleType === 'CARETAKER') {
        router.replace('/dashboard/units'); // Caretakers go straight to units
      }
      // Finance and Managers are allowed to stay on the main dashboard
    }
  }, [isStaffWorkspace, staffRoleType, router]);

  // 3. Prevent the Master Dashboard UI from flashing before the redirect happens
  if (isStaffWorkspace && (staffRoleType === 'VENDOR' || staffRoleType === 'CARETAKER')) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafb]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1f8898]" />
        <p className="text-gray-500 mt-4 font-bold text-sm">Routing to your workspace...</p>
      </div>
    );
  }

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // --- GLOBAL FILTERS ---
  const [timeFilter, setTimeFilter] = useState('ALL'); // ALL, TODAY, WEEK, MONTH, YEAR, CUSTOM
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [currency, setCurrency] = useState('KES');
  const [lang, setLang] = useState<'EN' | 'SW' | 'FR' | 'ES' | 'AR'>('EN');

  const t = (key: string) => TRANSLATIONS[lang][key as keyof typeof TRANSLATIONS['EN']] || TRANSLATIONS['EN'][key as keyof typeof TRANSLATIONS['EN']];

  const [data, setData] = useState({
    properties: [] as any[],
    tenants: [] as any[],
    invoices: [] as any[],
    mpesaLogs: [] as any[],
    maintenance: [] as any[],
    leads: [] as any[],
    pnl: null as any
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const reqOptions = { credentials: 'include' as RequestCredentials };

        const [propsRes, tenantsRes, invsRes, mpesaRes, maintRes, leadsRes, pnlRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties`, reqOptions),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants`, reqOptions),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices`, reqOptions),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/mpesa/logs`, reqOptions),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets`, reqOptions).catch(() => ({ ok: false })),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads`, reqOptions).catch(() => ({ ok: false })),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounting/pnl?propertyId=ALL`, reqOptions).catch(() => ({ ok: false }))
        ]);

        if (propsRes.status === 401 || propsRes.status === 403) {
          return router.push('/login');
        }

        setData({
          properties: await propsRes.json(),
          tenants: await tenantsRes.json(),
          invoices: await invsRes.json(),
          mpesaLogs: mpesaRes.ok ? await mpesaRes.json() : [],
          maintenance: maintRes.ok ? await (maintRes as any).json() : [],
          leads: leadsRes.ok ? await (leadsRes as any).json() : [],
          pnl: pnlRes.ok ? await (pnlRes as any).json() : null
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, [router]);


  // --- UTILS: TIME FILTERING & CURRENCY ---
  const filterByTime = (items: any[], dateKey: string) => {
    if (timeFilter === 'ALL' || !items) return items || [];
    const now = new Date();
    return _.filter(items, item => {
      const itemDate = new Date(item[dateKey]);

      if (timeFilter === 'TODAY') return itemDate.toDateString() === now.toDateString();

      if (timeFilter === 'WEEK') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return itemDate >= weekAgo;
      }

      if (timeFilter === 'MONTH') {
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      }

      if (timeFilter === 'YEAR') {
        return itemDate.getFullYear() === now.getFullYear();
      }

      if (timeFilter === 'CUSTOM') {
        if (!customStartDate && !customEndDate) return true;
        let isAfterStart = true;
        let isBeforeEnd = true;
        if (customStartDate) isAfterStart = itemDate >= new Date(customStartDate);
        if (customEndDate) {
          const endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);
          isBeforeEnd = itemDate <= endDate;
        }
        return isAfterStart && isBeforeEnd;
      }

      return true;
    });
  };

  const formatCurrency = (amount: number | string) => {
    const num = Number(amount) || 0;
    const converted = num * (EXCHANGE_RATES[currency] || 1);
    const decimals = ['KES', 'TZS', 'UGX'].includes(currency) ? 0 : 2;
    return `${currency} ${converted.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  };


  // --- DYNAMIC ANALYTICS (Reacts to Time Filter) ---
  const totalProperties = _.size(data.properties);
  const activeTenants = _.size(_.filter(data.tenants, { is_active: true }));
  const totalUnits = _.sumBy(data.properties, (p) => _.size(p.units));
  const occupancyRate = totalUnits === 0 ? 0 : Math.round((activeTenants / totalUnits) * 100);

  const filteredInvoices = filterByTime(data.invoices, 'created_at');
  const allPayments = _.flatMap(data.invoices, (inv) => inv.payments || []);
  const filteredPayments = filterByTime(allPayments, 'created_at');
  const filteredExpenses = filterByTime(data.pnl?.expenses || [], 'date_incurred');

  const totalBilled = _.sumBy(filteredInvoices, 'amount') || 0;
  const totalCollected = _.sumBy(filteredPayments, 'amount_paid') || 0;

  // Outstanding is calculated from invoices created in this period
  const totalOutstanding = _.sumBy(filteredInvoices, inv => {
    const paid = _.sumBy(inv.payments || [], 'amount_paid') || 0;
    return Math.max(0, inv.amount - paid);
  }) || 0;

  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  const totalExp = _.sumBy(filteredExpenses, 'amount') || 0;
  const netProfit = totalCollected - totalExp;
  const profitMargin = totalCollected > 0 ? Math.round((netProfit / totalCollected) * 100) : 0;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const getRevenueForMonth = (month: number, year: number) => {
    const monthlyPayments = _.filter(allPayments, (p) => {
      const d = new Date(p.created_at);
      return d.getMonth() === month && d.getFullYear() === year;
    });
    return _.sumBy(monthlyPayments, 'amount_paid') || 0;
  };

  const thisMonthRevenue = getRevenueForMonth(currentMonth, currentYear);
  const lastMonthRevenue = getRevenueForMonth(lastMonth, lastMonthYear);
  const revenueTrend = lastMonthRevenue === 0
    ? (thisMonthRevenue > 0 ? 100 : 0)
    : Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);

  // ACCURATE CHART DATA GENERATION
  const displayChartData = _.map(_.range(5, -1, -1), (i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      month: d.toLocaleString('default', { month: 'short' }),
      total: getRevenueForMonth(d.getMonth(), d.getFullYear())
    };
  });

  const maxRevenue = Math.max(..._.map(displayChartData, 'total'), 1000);

  const generateChartPath = () => {
    if (_.isEmpty(displayChartData)) return '';
    const width = 500;
    const height = 150;
    const points = _.map(displayChartData, (d, index) => {
      const x = (index / (displayChartData.length - 1)) * width;
      const y = height - ((d.total / maxRevenue) * height);
      return `${x},${y}`;
    });
    return `M0,${height} L${points.join(' L')} L${width},${height} Z`;
  };

  const generateLinePath = () => {
    if (_.isEmpty(displayChartData)) return '';
    const width = 500;
    const height = 150;
    return 'M' + _.map(displayChartData, (d, index) => {
      const x = (index / (displayChartData.length - 1)) * width;
      const y = height - ((d.total / maxRevenue) * height);
      return `${x},${y}`;
    }).join(' L');
  };

  // --- ACTION CENTER ANALYTICS (Filtered) ---
  const recentInvoices = _.take(_.orderBy(filteredInvoices, ['created_at'], ['desc']), 6);

  const topDefaulters = _.chain(filteredInvoices)
    .filter(inv => inv.status !== 'PAID')
    .groupBy('tenant_id')
    .map((invoices, tenant_id) => {
      const tenant = _.find(data.tenants, { id: tenant_id });
      const totalOwed = _.sumBy(invoices, 'amount');
      const totalPaidForThese = _.sumBy(invoices, inv => _.sumBy(inv.payments, 'amount_paid') || 0);
      const balance = totalOwed - totalPaidForThese;
      return { tenant, balance };
    })
    .filter(t => t.balance > 0 && !!t.tenant)
    .orderBy(['balance'], ['desc'])
    .take(3)
    .value();

  const sixtyDaysFromNow = new Date();
  sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);

  const expiringLeases = _.chain(data.tenants)
    .filter(t => {
      if (!t.is_active || !t.lease_end) return false;
      const endDate = new Date(t.lease_end);
      return endDate <= sixtyDaysFromNow && endDate >= new Date();
    })
    .map(t => {
      const daysLeft = Math.ceil((new Date(t.lease_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return { ...t, daysLeft };
    })
    .orderBy(['daysLeft'], ['asc'])
    .take(3)
    .value();

  const urgencyWeight = { 'EMERGENCY': 1, 'HIGH': 2, 'MEDIUM': 3, 'LOW': 4 };
  const activeTickets = _.chain(filterByTime(data.maintenance, 'created_at'))
    .filter(t => t.status !== 'RESOLVED' && t.status !== 'Completed')
    .orderBy([(t) => (urgencyWeight as any)[t.urgency || t.priority] || 5, 'created_at'], ['asc', 'desc'])
    .take(3)
    .value();

  const freshLeads = _.chain(filterByTime(data.leads, 'created_at'))
    .filter(l => l.status === 'NEW')
    .orderBy(['created_at'], ['desc'])
    .take(3)
    .value();

  const filteredMpesaLogs = filterByTime(data.mpesaLogs, 'created_at');

  const resolveUnitName = (unitId: string) => {
    for (const prop of data.properties) {
      const unit = _.find(prop.units, { id: unitId });
      if (unit) return `${prop.name}, ${unit.unit_number}`;
    }
    return 'Unknown Unit';
  };

  const getUrgencyColors = (urgency: string) => {
    if (urgency === 'EMERGENCY' || urgency === 'HIGH' || urgency === 'High') return 'bg-rose-100 text-rose-700 border-rose-200';
    if (urgency === 'MEDIUM' || urgency === 'Medium') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  const hour = now.getHours();
  const greeting = hour < 12 ? t('greeting_morning') : hour < 18 ? t('greeting_afternoon') : t('greeting_evening');
  const currentDateString = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  let userFirstName = 'Executive';
  if (profile?.user?.first_name) userFirstName = profile.user.first_name;
  else if (profile?.first_name) userFirstName = profile.first_name;

  const maskPhone = (phone: string) => {
    if (!phone) return 'Unknown';
    if (phone.length < 9) return phone;
    return `${phone.substring(0, 6)}***${phone.substring(phone.length - 3)}`;
  };

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fafb]">
      <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
      <h2 className="text-xl font-black text-gray-900">Connection Error</h2>
      <p className="text-gray-500 mt-2">{error}</p>
      <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2.5 bg-[#1f8898] text-white font-bold rounded-xl shadow-lg hover:bg-[#1a7684] transition-all">Retry Connection</button>
    </div>
  );

  const cardClass = "bg-[#ffffff] p-5 xl:p-4 2xl:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden";

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans text-gray-900 selection:bg-[#1f8898]/30 overflow-x-hidden" dir={lang === 'AR' ? 'rtl' : 'ltr'}>

      {/* --- MINIMIZED EXECUTIVE HERO AREA --- */}
      <div className="bg-gradient-to-br from-[#0d393f] to-[#1f8898] px-4 sm:px-6 pt-5 pb-10 sm:pb-12 relative overflow-hidden shadow-inner">
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-2 border border-white/20 backdrop-blur-sm">
              <CalendarDays className="w-3.5 h-3.5" /> {currentDateString}
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-[#ffffff] tracking-tight mb-1">
              {greeting}, {userFirstName}.
            </h1>
            {/* Kept English subtitle on AR to prevent broken rendering, but localized elsewhere */}
            <p className={`text-teal-100 text-xs sm:text-sm font-medium max-w-xl leading-relaxed ${lang === 'AR' ? 'hidden sm:block' : ''}`}>
              {t('subtitle')}
            </p>
          </div>

          {/* GLOBAL FILTERS */}
          <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
            <div className="relative shrink-0">
              <Languages className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-teal-100 ${lang === 'AR' ? 'right-3' : 'left-3'}`} />
              <select
                value={lang} onChange={(e) => setLang(e.target.value as any)}
                className={`appearance-none bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 rounded-xl font-bold text-xs backdrop-blur-md transition-all outline-none cursor-pointer ${lang === 'AR' ? 'pr-8 pl-8' : 'pl-8 pr-8'}`}
              >
                <option value="EN" className="text-gray-900">EN - English</option>
                <option value="SW" className="text-gray-900">SW - Swahili</option>
                <option value="FR" className="text-gray-900">FR - French</option>
                <option value="ES" className="text-gray-900">ES - Spanish</option>
                <option value="AR" className="text-gray-900">AR - Arabic</option>
              </select>
            </div>

            <div className="relative shrink-0">
              <Globe className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-teal-100 ${lang === 'AR' ? 'right-3' : 'left-3'}`} />
              <select
                value={currency} onChange={(e) => setCurrency(e.target.value)}
                className={`appearance-none bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 rounded-xl font-bold text-xs backdrop-blur-md transition-all outline-none cursor-pointer ${lang === 'AR' ? 'pr-8 pl-8' : 'pl-8 pr-8'}`}
              >
                <option value="KES" className="text-gray-900">KES - Kenyan Shilling</option>
                <option value="USD" className="text-gray-900">USD - US Dollar</option>
                <option value="EUR" className="text-gray-900">EUR - Euro</option>
                <option value="TZS" className="text-gray-900">TZS - Tanzanian Shilling</option>
                <option value="UGX" className="text-gray-900">UGX - Ugandan Shilling</option>
              </select>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <Filter className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-teal-100 ${lang === 'AR' ? 'right-3' : 'left-3'}`} />
                <select
                  value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}
                  className={`appearance-none bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 rounded-xl font-bold text-xs backdrop-blur-md transition-all outline-none cursor-pointer ${lang === 'AR' ? 'pr-8 pl-8' : 'pl-8 pr-8'}`}
                >
                  <option value="ALL" className="text-gray-900">All Time</option>
                  <option value="TODAY" className="text-gray-900">Today</option>
                  <option value="WEEK" className="text-gray-900">This Week</option>
                  <option value="MONTH" className="text-gray-900">This Month</option>
                  <option value="YEAR" className="text-gray-900">This Year</option>
                  <option value="CUSTOM" className="text-gray-900">Custom Range</option>
                </select>
              </div>

              {timeFilter === 'CUSTOM' && (
                <div className={`flex items-center gap-1.5 animate-in fade-in duration-300 ${lang === 'AR' ? 'slide-in-from-left-2' : 'slide-in-from-right-2'}`}>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={e => setCustomStartDate(e.target.value)}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-2.5 py-1.5 rounded-xl font-bold text-[11px] sm:text-xs backdrop-blur-md outline-none custom-calendar-icon"
                  />
                  <span className="text-white/50 text-xs">-</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={e => setCustomEndDate(e.target.value)}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-2.5 py-1.5 rounded-xl font-bold text-[11px] sm:text-xs backdrop-blur-md outline-none custom-calendar-icon"
                  />
                </div>
              )}
            </div>

            <Link
              href="/dashboard/reports"
              className="bg-white text-[#1f8898] px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm hover:shadow-md shrink-0"
            >
              <Download className="w-3.5 h-3.5" /> {t('export')}
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8 relative z-20 space-y-5 sm:space-y-6">

        {/* --- EXECUTIVE QUICK ACTIONS BAR --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-2">
          <Link href="/dashboard/accounting" className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 hover:bg-[#ebf3f5] hover:border-[#1f8898]/30 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Calculator className="w-5 h-5" /></div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-gray-900 tracking-tight group-hover:text-[#1f8898]">{t('record_expense')}</h4>
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('general_ledger')}</p>
            </div>
          </Link>
          <Link href="/dashboard/leads" className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 hover:bg-[#ebf3f5] hover:border-[#1f8898]/30 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Target className="w-5 h-5" /></div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-gray-900 tracking-tight group-hover:text-[#1f8898]">{t('pipeline_crm')}</h4>
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('marketplace')}</p>
            </div>
          </Link>
          <Link href="/dashboard/tenants" className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 hover:bg-[#ebf3f5] hover:border-[#1f8898]/30 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Users className="w-5 h-5" /></div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-gray-900 tracking-tight group-hover:text-[#1f8898]">{t('onboard_tenant')}</h4>
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('lease_manager')}</p>
            </div>
          </Link>
          <Link href="/dashboard/maintenance" className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 hover:bg-[#ebf3f5] hover:border-[#1f8898]/30 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Wrench className="w-5 h-5" /></div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-gray-900 tracking-tight group-hover:text-[#1f8898]">{t('log_ticket')}</h4>
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('maintenance')}</p>
            </div>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl shadow-sm border border-gray-100">
            <Activity className="w-10 h-10 animate-pulse text-[#1f8898] mb-4" />
            <p className="font-bold text-sm uppercase tracking-widest text-gray-400">Loading Analytics...</p>
          </div>
        ) : (
          <>
            {/* --- TOP BENTO BOX: Lifetime Financials & Operations --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5">

              <div className={`p-5 xl:p-4 2xl:p-6 rounded-3xl shadow-sm border flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden ${totalOutstanding > 0 ? 'bg-gradient-to-br from-white to-rose-50 border-rose-100' : 'bg-[#ffffff] border-gray-100'}`}>
                <div className={`absolute ${lang === 'AR' ? '-left-4' : '-right-4'} -top-4 w-24 h-24 rounded-full blur-2xl pointer-events-none ${totalOutstanding > 0 ? 'bg-rose-200 opacity-50' : 'bg-gray-100 opacity-0'}`}></div>
                <div className="flex flex-row items-center justify-between mb-2 relative z-10">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${totalOutstanding > 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${lang === 'AR' ? 'text-left' : 'text-right'} leading-tight ${totalOutstanding > 0 ? 'text-rose-600' : 'text-gray-400'}`}>
                    {t('outstanding_arrears')}
                  </span>
                </div>
                <div className="relative z-10 mt-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-2xl xl:text-xl 2xl:text-2xl font-black tracking-tight truncate ${totalOutstanding > 0 ? 'text-rose-600' : 'text-gray-900'} ${lang === 'AR' ? 'text-left w-full block' : ''}`} dir="ltr">
                      {formatCurrency(totalOutstanding)}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-2 truncate">{t('unpaid_balance')}</p>
                </div>
              </div>

              <div className={cardClass}>
                <div className={`absolute ${lang === 'AR' ? '-left-4' : '-right-4'} -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl pointer-events-none`}></div>
                <div className="flex flex-row items-center justify-between mb-2 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                    <PiggyBank className="h-5 w-5" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest text-emerald-600 ${lang === 'AR' ? 'text-left' : 'text-right'} leading-tight`}>
                    {t('gross_collected')}
                  </span>
                </div>
                <div className="relative z-10 mt-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-2xl xl:text-xl 2xl:text-2xl font-black text-gray-900 tracking-tight truncate ${lang === 'AR' ? 'text-left w-full block' : ''}`} dir="ltr">
                      {formatCurrency(totalCollected)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 truncate">
                    <span className={`flex items-center text-[10px] font-black px-1.5 py-0.5 rounded-md ${revenueTrend >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`} dir="ltr">
                      {revenueTrend >= 0 ? <TrendingUp className={`w-3 h-3 ${lang === 'AR' ? 'ml-0.5' : 'mr-0.5'}`} /> : <TrendingDown className={`w-3 h-3 ${lang === 'AR' ? 'ml-0.5' : 'mr-0.5'}`} />}
                      {Math.abs(revenueTrend)}%
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate">{t('mtd_velocity')}</span>
                  </div>
                </div>
              </div>

              <div className={cardClass}>
                <div className={`absolute ${lang === 'AR' ? '-left-4' : '-right-4'} -top-4 w-24 h-24 bg-[#1f8898]/10 rounded-full blur-2xl pointer-events-none`}></div>
                <div className="flex flex-row items-center justify-between mb-2 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-[#ebf3f5] flex items-center justify-center text-[#1f8898] border border-[#1f8898]/20 shrink-0">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest text-[#1f8898] ${lang === 'AR' ? 'text-left' : 'text-right'} leading-tight`}>
                    {t('net_margin')}
                  </span>
                </div>
                <div className="relative z-10 mt-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-2xl xl:text-xl 2xl:text-2xl font-black text-gray-900 tracking-tight truncate ${lang === 'AR' ? 'text-left w-full block' : ''}`} dir="ltr">
                      {formatCurrency(netProfit)}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-2 flex items-center gap-1">
                    <Calculator className="w-3 h-3" /> <span dir="ltr">{profitMargin}%</span> {t('profit')}
                  </p>
                </div>
              </div>

              <div className={cardClass}>
                <div className="flex flex-row items-center justify-between mb-2 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shrink-0">
                    <Activity className="h-5 w-5" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest text-purple-600 ${lang === 'AR' ? 'text-left' : 'text-right'} leading-tight`}>
                    {t('collection_health')}
                  </span>
                </div>
                <div className="relative z-10 mt-2">
                  <div className="flex items-end justify-between mb-1.5">
                    <span className="text-2xl xl:text-xl 2xl:text-3xl font-black text-gray-900 tracking-tight leading-none" dir="ltr">{collectionRate}%</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{t('clearance')}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-2">
                    <div className={`h-full rounded-full ${collectionRate > 80 ? 'bg-emerald-500' : collectionRate > 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${collectionRate}%` }}></div>
                  </div>
                </div>
              </div>

              <div className={cardClass.replace('flex-col justify-between', 'flex-row items-center justify-between')}>
                <div className="flex flex-col min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 mb-2">
                    <DoorOpen className="w-4 h-4 text-[#1f8898]" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#1f8898]">{t('occupancy')}</h3>
                  </div>
                  <div className={`text-2xl xl:text-xl 2xl:text-3xl font-black text-gray-900 tracking-tight truncate ${lang === 'AR' ? 'text-right' : ''}`} dir="ltr">{occupancyRate}%</div>
                  <p className={`text-[11px] text-gray-500 font-medium mt-1 truncate ${lang === 'AR' ? 'text-right' : ''}`} dir="ltr">{activeTenants} / {totalUnits} {t('units')}</p>
                </div>
                <div className="relative w-14 h-14 2xl:w-16 2xl:h-16 flex-shrink-0 drop-shadow-sm">
                  <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f3f4f6" strokeWidth="4.5"></circle>
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#1f8898" strokeWidth="4.5"
                      strokeDasharray={`${occupancyRate}, ${100 - occupancyRate}`} strokeDashoffset="0" strokeLinecap="round">
                    </circle>
                  </svg>
                </div>
              </div>

            </div>

            {/* --- ACTION CENTER (Alerts & Risks) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">

              {/* 1. Fresh Marketplace Leads Widget */}
              <div className="bg-[#ffffff] rounded-3xl shadow-sm border border-blue-100 flex flex-col overflow-hidden relative">
                <div className={`p-4 border-b border-blue-50 bg-blue-50/30 flex items-center justify-between shrink-0`}>
                  <div>
                    <h3 className="text-sm font-black text-blue-900 tracking-tight flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-blue-500" /> {t('new_leads')}
                    </h3>
                    <p className="text-[9px] text-blue-700 font-bold uppercase tracking-wider mt-0.5">{t('pipeline_crm')}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg text-[9px] font-black shrink-0">{freshLeads.length} {t('unread')}</span>
                </div>
                <div className={`p-2 flex-1 overflow-y-auto`}>
                  {_.isEmpty(freshLeads) ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                      <CheckCircle2 className="w-6 h-6 text-emerald-300 mb-2" />
                      <p className="text-xs font-bold text-gray-900">Inbox Zero</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {_.map(freshLeads, (lead, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-2xl hover:bg-blue-50/50 transition-colors group">
                          <div>
                            <p className="text-xs font-black text-gray-900 tracking-tight group-hover:text-blue-700 transition-colors truncate max-w-[100px]">{lead.prospect_name}</p>
                            <p className="text-[9px] font-bold text-gray-500 mt-0.5 truncate">Unit {lead.unit?.unit_number}</p>
                          </div>
                          <Link href={`/dashboard/leads`} className="shrink-0 text-[9px] font-black uppercase tracking-widest text-[#1f8898] hover:text-[#135a65] flex items-center gap-1 bg-white border border-gray-100 px-2 py-1 rounded shadow-sm group-hover:border-blue-200">
                            {t('reply')} <ArrowRight className={`w-3 h-3 ${lang === 'AR' ? 'rotate-180' : ''}`} />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Top Defaulters Widget */}
              <div className="bg-[#ffffff] rounded-3xl shadow-sm border border-rose-100 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-rose-50 bg-rose-50/30 flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="text-sm font-black text-rose-900 tracking-tight flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-500" /> {t('defaulters')}
                    </h3>
                    <p className="text-[9px] text-rose-600 font-bold uppercase tracking-wider mt-0.5">{t('highest_balances')}</p>
                  </div>
                  <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-lg text-[9px] font-black shrink-0">{topDefaulters.length} {t('found')}</span>
                </div>
                <div className="p-2 flex-1 overflow-y-auto">
                  {_.isEmpty(topDefaulters) ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                      <CheckCircle2 className="w-6 h-6 text-emerald-300 mb-2" />
                      <p className="text-xs font-bold text-gray-900">Zero Arrears</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {_.map(topDefaulters, ({ tenant, balance }, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-2xl hover:bg-rose-50/50 transition-colors group">
                          <div>
                            <p className="text-xs font-black text-gray-900 group-hover:text-rose-700 transition-colors truncate max-w-[100px]">{tenant.first_name} {tenant.last_name}</p>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5" dir="ltr">{tenant.phone || 'No Phone'}</p>
                          </div>
                          <div className={`shrink-0 ${lang === 'AR' ? 'text-left' : 'text-right'}`}>
                            <p className="text-xs font-black text-rose-600" dir="ltr">{formatCurrency(balance)}</p>
                            <Link href={`/dashboard/communications`} className="mt-0.5 inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-[#1f8898] hover:text-[#135a65]">
                              <Megaphone className="w-2.5 h-2.5" /> {t('remind')}
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Expiring Leases Widget */}
              <div className="bg-[#ffffff] rounded-3xl shadow-sm border border-amber-100 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-amber-50 bg-amber-50/30 flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="text-sm font-black text-amber-900 tracking-tight flex items-center gap-1.5">
                      <CalendarClock className="w-4 h-4 text-amber-500" /> {t('renewals')}
                    </h3>
                    <p className="text-[9px] text-amber-700 font-bold uppercase tracking-wider mt-0.5">{t('expiring')}</p>
                  </div>
                  <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-lg text-[9px] font-black shrink-0">{expiringLeases.length} {t('soon')}</span>
                </div>
                <div className="p-2 flex-1 overflow-y-auto">
                  {_.isEmpty(expiringLeases) ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                      <CheckCircle2 className="w-6 h-6 text-emerald-300 mb-2" />
                      <p className="text-xs font-bold text-gray-900">Pipeline Clear</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {_.map(expiringLeases, (tenant, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-2xl hover:bg-amber-50/50 transition-colors group">
                          <div>
                            <p className="text-xs font-black text-gray-900 group-hover:text-amber-700 transition-colors truncate max-w-[100px]">{tenant.first_name} {tenant.last_name}</p>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5" dir="ltr">
                              Ends: {new Date(tenant.lease_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                          <div className={`shrink-0 ${lang === 'AR' ? 'text-left' : 'text-right'}`}>
                            <div className="inline-flex items-center justify-center px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[8px] font-black uppercase tracking-widest border border-amber-200" dir="ltr">
                              {tenant.daysLeft} {t('days')}
                            </div>
                            <div className="mt-1">
                              <Link href={`/dashboard/tenants`} className="text-[8px] font-black uppercase tracking-widest text-[#1f8898] hover:text-[#135a65]">
                                {t('view_lease')}
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Active Maintenance Widget */}
              <div className="bg-[#ffffff] rounded-3xl shadow-sm border border-purple-100 flex flex-col overflow-hidden relative">
                <div className={`p-4 border-b border-purple-50 bg-purple-50/30 flex items-center justify-between shrink-0`}>
                  <div>
                    <h3 className="text-sm font-black text-purple-900 tracking-tight flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-purple-500" /> {t('pending_fixes')}
                    </h3>
                    <p className="text-[9px] text-purple-700 font-bold uppercase tracking-wider mt-0.5">{t('unresolved_tickets')}</p>
                  </div>
                  <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-lg text-[9px] font-black shrink-0">{activeTickets.length} {t('open')}</span>
                </div>
                <div className={`p-2 flex-1 overflow-y-auto`}>
                  {_.isEmpty(activeTickets) ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                      <CheckCircle2 className="w-6 h-6 text-emerald-300 mb-2" />
                      <p className="text-xs font-bold text-gray-900">All Clear</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {_.map(activeTickets, (ticket, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-2xl hover:bg-purple-50/50 transition-colors group">
                          <div>
                            <p className="text-xs font-black text-gray-900 tracking-tight truncate max-w-[120px]">{ticket.issue_type}</p>
                            <p className="text-[9px] font-bold text-gray-500 mt-0.5 truncate">{resolveUnitName(ticket.unit_id)}</p>
                          </div>
                          <div className={`shrink-0 ${lang === 'AR' ? 'text-left' : 'text-right'}`}>
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${getUrgencyColors(ticket.urgency || ticket.priority)}`}>
                              {ticket.urgency || ticket.priority}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* --- Middle Section: Analytics & Lists --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

              {/* Area Chart */}
              <div className="lg:col-span-2 bg-[#ffffff] rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden relative">
                <div className={`p-6 md:p-8 pb-4 flex items-center justify-between z-10 relative`}>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">{t('collection_trajectory')}</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">{t('realized_income')}</p>
                  </div>
                  <div className="inline-flex items-center rounded-full border border-emerald-200 px-3 py-1 text-[10px] uppercase tracking-widest font-black bg-emerald-50 text-emerald-600">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div> {t('live_data')}
                  </div>
                </div>

                <div className={`p-6 pt-0 flex-1 relative min-h-[220px]`}>
                  <div className="absolute inset-0 pt-6 pb-8 pl-14 pr-8 flex flex-col justify-between pointer-events-none">
                    {_.map([1, 0.75, 0.5, 0.25, 0], (tick, i) => (
                      <div key={i} className="w-full flex items-center border-b border-dashed border-gray-200 h-0">
                        <span className={`absolute ${lang === 'AR' ? 'right-2' : 'left-2'} text-[10px] font-bold text-gray-400 tracking-wider`} dir="ltr">
                          {formatCurrency(maxRevenue * tick)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className={`absolute inset-0 pt-6 pb-8 ${lang === 'AR' ? 'pr-16 pl-8' : 'pl-16 pr-8'}`}>
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 150">
                      <defs>
                        <linearGradient id="gradientTeal" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#1f8898" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#1f8898" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path d={generateChartPath()} fill="url(#gradientTeal)" />
                      <path d={generateLinePath()} fill="none" stroke="#1f8898" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                      {_.map(displayChartData, (data, index) => {
                        const x = (index / (displayChartData.length - 1)) * 500;
                        const y = 150 - ((data.total / maxRevenue) * 150);
                        return (
                          <g key={index} className="group cursor-pointer">
                            <circle cx={x} cy={y} r="12" fill="#1f8898" opacity="0" className="transition-opacity group-hover:opacity-20" />
                            <circle cx={x} cy={y} r="5" fill="#ffffff" stroke="#1f8898" strokeWidth="3" className="transition-transform group-hover:scale-110 shadow-lg" />
                            <rect x={x - 45} y={y - 38} width="100" height="26" rx="6" fill="#0d393f" className="opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-xl" />
                            <text x={x} y={y - 20} textAnchor="middle" className="text-[10px] font-black fill-[#ffffff] opacity-0 group-hover:opacity-100 transition-opacity tracking-wider">
                              {formatCurrency(data.total)}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  <div className={`absolute bottom-2 flex justify-between ${lang === 'AR' ? 'right-16 left-8' : 'left-16 right-8'}`}>
                    {_.map(displayChartData, (data, idx) => (
                      <span key={idx} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{data.month}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Portfolio List */}
              <div className="bg-[#ffffff] rounded-3xl shadow-sm border border-gray-100 flex flex-col max-h-[380px]">
                <div className="p-6 md:p-8 pb-4 border-b border-gray-100 shrink-0 flex items-center justify-between">
                  <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#1f8898]" /> {t('active_portfolio')}
                  </h3>
                  <span className="bg-[#ebf3f5] text-[#1f8898] px-2.5 py-1 rounded-lg text-[10px] font-black">{totalProperties}</span>
                </div>
                <div className="p-4 flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                  {_.isEmpty(data.properties) ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 mb-3">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-gray-900">{t('no_properties')}</p>
                      <p className="text-xs text-gray-500 font-medium mt-1">{t('add_property')}</p>
                    </div>
                  ) : (
                    _.map(data.properties, prop => (
                      <Link key={prop.id} href={`/dashboard/properties/${prop.id}`} className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-[#ebf3f5] hover:border-[#1f8898]/30 transition-all duration-200 group">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-[#ffffff] shadow-sm flex items-center justify-center text-[#1f8898] border border-gray-200 group-hover:border-[#1f8898]/20">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 tracking-tight group-hover:text-[#1f8898] transition-colors">{prop.name}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5" dir="ltr">{_.size(prop.units)} {t('managed_units')}</p>
                          </div>
                        </div>
                        <ArrowRight className={`w-4 h-4 text-gray-300 group-hover:text-[#1f8898] transition-transform ${lang === 'AR' ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                      </Link>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* --- Bottom Section: Ledger & M-Pesa Grid --- */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">

              {/* Ledger Table (Spans 2 columns) */}
              <div className="xl:col-span-2 bg-[#ffffff] rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 md:p-8 border-b border-gray-100 gap-4">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight">{t('recent_ledger')}</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">{t('latest_transactions')}</p>
                  </div>
                  <Link
                    href="/dashboard/billing"
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-[#ffffff] px-4 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all shrink-0 gap-2"
                  >
                    {t('view_ledger')}
                  </Link>
                </div>

                <div className="relative w-full overflow-x-auto flex-1">
                  <table className={`w-full ${lang === 'AR' ? 'text-right' : 'text-left'} border-collapse whitespace-nowrap`}>
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                        <th className={`h-12 px-6 align-middle ${lang === 'AR' ? 'pr-8' : 'pl-8'}`}>{t('tenant_entity')}</th>
                        <th className="h-12 px-6 align-middle">{t('date_issued')}</th>
                        <th className={`h-12 px-6 align-middle ${lang === 'AR' ? 'text-left' : 'text-right'}`}>{t('amount')}</th>
                        <th className={`h-12 px-6 align-middle text-center ${lang === 'AR' ? 'pl-8' : 'pr-8'}`}>{t('status')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {_.isEmpty(recentInvoices) ? (
                        <tr>
                          <td colSpan={4} className="p-12 text-center text-sm font-medium text-gray-500">No recent transactions recorded in the ledger.</td>
                        </tr>
                      ) : (
                        _.map(recentInvoices, (inv, index) => (
                          <tr key={inv.id ? `${inv.id}-${index}` : `invoice-${index}`} className="hover:bg-gray-50/80 transition duration-150 group">
                            <td className={`p-4 px-6 align-middle ${lang === 'AR' ? 'pr-8' : 'pl-8'}`}>
                              <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-full bg-[#ebf3f5] text-[#1f8898] flex items-center justify-center font-black text-xs shrink-0">
                                  {inv.tenant?.first_name?.charAt(0) || 'U'}{inv.tenant?.last_name?.charAt(0) || 'N'}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-gray-900 group-hover:text-[#1f8898] transition-colors">{inv.tenant?.first_name} {inv.tenant?.last_name}</span>
                                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">{inv.description}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 px-6 align-middle">
                              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600" dir="ltr">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                {new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </div>
                            </td>
                            <td className={`p-4 px-6 align-middle font-black text-gray-900 text-base ${lang === 'AR' ? 'text-left' : 'text-right'}`} dir="ltr">
                              {formatCurrency(inv.amount)}
                            </td>
                            <td className={`p-4 px-6 align-middle text-center ${lang === 'AR' ? 'pl-8' : 'pr-8'}`}>
                              <div className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border ${inv.status === 'PAID'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : inv.status === 'PARTIAL'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                {inv.status === 'PAID' && <CheckCircle2 className="w-3 h-3" />}
                                {inv.status === 'PARTIAL' && <AlertCircle className="w-3 h-3" />}
                                {inv.status}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* --- LIVE M-PESA FEED WIDGET --- */}
              <div className="xl:col-span-1 bg-[#ffffff] rounded-3xl shadow-sm border border-gray-100 flex flex-col max-h-[450px]">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900 tracking-tight">{t('live_mpesa')}</h3>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">{t('webhook_connections')}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar bg-gray-50/30">
                  {_.isEmpty(filteredMpesaLogs) ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                      <Smartphone className="w-8 h-8 text-gray-300 mb-3" />
                      <p className="text-sm font-bold text-gray-900">{t('waiting_payments')}</p>
                      <p className="text-xs text-gray-500 font-medium mt-1">Tenant STK pushes will appear here instantly.</p>
                    </div>
                  ) : (
                    filteredMpesaLogs.map((log: any) => (
                      <div key={log.id} className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-[#1f8898]/30 transition-colors">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' :
                            log.status === 'FAILED' ? 'bg-rose-50 text-rose-600' :
                              'bg-amber-50 text-amber-600'
                            }`}>
                            {log.status === 'SUCCESS' ? <CheckCircle2 className="w-5 h-5" /> :
                              log.status === 'FAILED' ? <XCircle className="w-5 h-5" /> :
                                <Activity className="w-5 h-5 animate-pulse" />}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 tracking-tight" dir="ltr">{maskPhone(log.phone_number)}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5" dir="ltr">
                              {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className={`${lang === 'AR' ? 'text-left' : 'text-right'}`}>
                          <p className="text-sm font-black text-gray-900" dir="ltr">{log.amount ? formatCurrency(log.amount) : '---'}</p>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${log.status === 'SUCCESS' ? 'text-emerald-600' :
                            log.status === 'FAILED' ? 'text-rose-600' :
                              'text-amber-600'
                            }`}>
                            {log.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </>
        )}
      </main>

      {/* Hide the default web date picker icon since we styled our own to fit the dark theme */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-calendar-icon::-webkit-calendar-picker-indicator {
            filter: invert(1);
            opacity: 0.6;
            cursor: pointer;
        }
        .custom-calendar-icon::-webkit-calendar-picker-indicator:hover {
            opacity: 1;
        }
      `}} />
    </div>
  );
}