import React, { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Download,
  Edit3,
  Eye,
  FileSpreadsheet,
  FileText,
  History,
  Plus,
  Printer,
  Trash2,
  Upload,
  Wallet,
  X,
} from 'lucide-react';
import {
  DateFilterPreset,
  DebtReceivable,
  FinanceTransaction,
  FinanceTxType,
  Order,
  PaymentMethodType,
  StoreSettings,
} from '../../types';
import {
  compressImageFile,
  formatRupiah,
  SmartImage,
} from '../../utils/imageUtils';
import {
  deleteDebtReceivableById,
  deleteFinanceTransactionById,
  recordDebtInstallmentPayment,
  saveDebtReceivable,
  saveFinanceTransaction,
} from '../../services/dbService';

export type FinanceSubTab =
  | 'dashboard'
  | 'pemasukan'
  | 'pengeluaran'
  | 'hutang'
  | 'piutang'
  | 'kas'
  | 'labarugi'
  | 'laporan';

const INCOME_CATEGORIES = [
  'Penjualan Produk',
  'Jasa Printing',
  'Custom',
  'Pesanan Online',
  'Pelunasan Piutang',
  'Pendapatan Lainnya',
];

const EXPENSE_CATEGORIES = [
  'Bahan Printing',
  'Tinta',
  'Kertas',
  'Plastik',
  'Listrik',
  'Internet',
  'Transportasi',
  'Gaji',
  'Perawatan Mesin',
  'Promosi',
  'Operasional',
  'Sewa',
  'Pembayaran Hutang',
  'Pengeluaran Lainnya',
];

const PAYMENT_METHODS: PaymentMethodType[] = [
  'Cash',
  'Transfer',
  'QRIS',
  'E-wallet',
  'Lainnya',
];

interface FinanceModuleProps {
  activeSubTab: FinanceSubTab;
  onSelectSubTab: (sub: FinanceSubTab) => void;
  transactions: FinanceTransaction[];
  debtsReceivables: DebtReceivable[];
  orders: Order[];
  settings: StoreSettings;
  adminUsername: string;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
  onOpenLightbox: (images: string[], index: number, title: string) => void;
}

export const FinanceModule: React.FC<FinanceModuleProps> = ({
  activeSubTab,
  onSelectSubTab,
  transactions,
  debtsReceivables,
  orders,
  settings,
  adminUsername,
  onShowToast,
  onOpenLightbox,
}) => {
  // Date Filter State
  const [datePreset, setDatePreset] = useState<DateFilterPreset>('month');
  const [customStart, setCustomStart] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .slice(0, 10)
  );
  const [customEnd, setCustomEnd] = useState(
    new Date().toISOString().slice(0, 10)
  );

  // Transaction Modal State
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<FinanceTransaction | null>(null);
  const [txType, setTxType] = useState<FinanceTxType>('income');
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10));
  const [txNumber, setTxNumber] = useState('');
  const [txSourceTarget, setTxSourceTarget] = useState('');
  const [txCategory, setTxCategory] = useState(INCOME_CATEGORIES[0]);
  const [txAmount, setTxAmount] = useState('');
  const [txMethod, setTxMethod] = useState<PaymentMethodType>('Transfer');
  const [txDesc, setTxDesc] = useState('');
  const [txProofUrl, setTxProofUrl] = useState('');
  const [txCorrectionReason, setTxCorrectionReason] = useState('');
  const [txSaving, setTxSaving] = useState(false);

  // Debt / Receivable Modal State
  const [drModalOpen, setDrModalOpen] = useState(false);
  const [editingDr, setEditingDr] = useState<DebtReceivable | null>(null);
  const [drType, setDrType] = useState<'hutang' | 'piutang'>('hutang');
  const [drPartyName, setDrPartyName] = useState('');
  const [drPhone, setDrPhone] = useState('');
  const [drDate, setDrDate] = useState(new Date().toISOString().slice(0, 10));
  const [drDueDate, setDrDueDate] = useState('');
  const [drTotalAmount, setDrTotalAmount] = useState('');
  const [drPaidAmount, setDrPaidAmount] = useState('0');
  const [drDesc, setDrDesc] = useState('');
  const [drSaving, setDrSaving] = useState(false);

  // Debt Payment Installment Modal
  const [payModalRecord, setPayModalRecord] = useState<DebtReceivable | null>(
    null
  );
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethodType>('Transfer');
  const [payNote, setPayNote] = useState('');
  const [paySyncFinance, setPaySyncFinance] = useState(true);

  // Delete Confirmation Modal
  const [confirmDeleteTx, setConfirmDeleteTx] =
    useState<FinanceTransaction | null>(null);
  const [confirmDeleteDr, setConfirmDeleteDr] =
    useState<DebtReceivable | null>(null);

  // Report Type State
  const [reportType, setReportType] = useState<
    | 'labarugi'
    | 'penjualan'
    | 'pemasukan'
    | 'pengeluaran'
    | 'kas'
    | 'hutang'
    | 'piutang'
  >('labarugi');

  // Helper to check if a date string (YYYY-MM-DD) matches the active period filter
  const isDateInPeriod = (dateIso: string): boolean => {
    if (!dateIso) return true;
    const clean = dateIso.slice(0, 10);
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    if (datePreset === 'all') return true;
    if (datePreset === 'today') return clean === todayStr;
    if (datePreset === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      return clean >= weekAgo && clean <= todayStr;
    }
    if (datePreset === 'month') {
      return clean.slice(0, 7) === todayStr.slice(0, 7);
    }
    if (datePreset === 'year') {
      return clean.slice(0, 4) === todayStr.slice(0, 4);
    }
    if (datePreset === 'custom') {
      return (
        (!customStart || clean >= customStart) &&
        (!customEnd || clean <= customEnd)
      );
    }
    return true;
  };

  // Filtered Transactions & Orders
  const filteredTransactions = useMemo(
    () => transactions.filter((t) => isDateInPeriod(t.dateIso)),
    [transactions, datePreset, customStart, customEnd]
  );

  const filteredOrders = useMemo(
    () => orders.filter((o) => isDateInPeriod(o.dateIso)),
    [orders, datePreset, customStart, customEnd]
  );

  // Financial Metrics Calculation (Clear & Consistent Formula)
  const metrics = useMemo(() => {
    let periodIncome = 0;
    let periodExpense = 0;

    for (const tx of filteredTransactions) {
      if (tx.type === 'income' || tx.type === 'cash_in') {
        periodIncome += tx.amount;
      } else if (tx.type === 'expense' || tx.type === 'cash_out') {
        periodExpense += tx.amount;
      }
    }

    let allTimeIn = 0;
    let allTimeOut = 0;
    for (const tx of transactions) {
      if (tx.type === 'income' || tx.type === 'cash_in') {
        allTimeIn += tx.amount;
      } else if (tx.type === 'expense' || tx.type === 'cash_out') {
        allTimeOut += tx.amount;
      }
    }

    const initialCash = Number(settings.initialCashBalance) || 0;
    const endingCashBalance = initialCash + allTimeIn - allTimeOut;
    const netProfit = periodIncome - periodExpense;

    const hutangList = debtsReceivables.filter((d) => d.recordType === 'hutang');
    const piutangList = debtsReceivables.filter(
      (d) => d.recordType === 'piutang'
    );

    const unpaidHutang = hutangList.reduce(
      (acc, d) => acc + Math.max(0, d.totalAmount - d.paidAmount),
      0
    );
    const unpaidPiutang = piutangList.reduce(
      (acc, d) => acc + Math.max(0, d.totalAmount - d.paidAmount),
      0
    );

    return {
      periodIncome,
      periodExpense,
      netProfit,
      initialCash,
      allTimeIn,
      allTimeOut,
      endingCashBalance,
      unpaidHutang,
      unpaidPiutang,
      hutangList,
      piutangList,
    };
  }, [filteredTransactions, transactions, debtsReceivables, settings]);

  // Monthly Interactive Chart Data (Last 6 Months)
  const monthlyChartData = useMemo(() => {
    const map = new Map<
      string,
      { month: string; income: number; expense: number; profit: number }
    >();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('id-ID', {
        month: 'short',
        year: '2-digit',
      });
      map.set(ym, { month: label, income: 0, expense: 0, profit: 0 });
    }

    for (const tx of transactions) {
      const ym = (tx.dateIso || '').slice(0, 7);
      if (!map.has(ym)) {
        map.set(ym, { month: ym, income: 0, expense: 0, profit: 0 });
      }
      const entry = map.get(ym)!;
      if (tx.type === 'income' || tx.type === 'cash_in') {
        entry.income += tx.amount;
      } else if (tx.type === 'expense' || tx.type === 'cash_out') {
        entry.expense += tx.amount;
      }
      entry.profit = entry.income - entry.expense;
    }

    return Array.from(map.values()).slice(-6);
  }, [transactions]);

  // Category Breakdown
  const categoryBreakdown = useMemo(() => {
    const incMap = new Map<string, number>();
    const expMap = new Map<string, number>();

    for (const tx of filteredTransactions) {
      if (tx.type === 'income' || tx.type === 'cash_in') {
        incMap.set(tx.category, (incMap.get(tx.category) || 0) + tx.amount);
      } else if (tx.type === 'expense' || tx.type === 'cash_out') {
        expMap.set(tx.category, (expMap.get(tx.category) || 0) + tx.amount);
      }
    }

    return {
      incomeByCategory: Array.from(incMap.entries()).sort((a, b) => b[1] - a[1]),
      expenseByCategory: Array.from(expMap.entries()).sort((a, b) => b[1] - a[1]),
    };
  }, [filteredTransactions]);

  // Open Transaction Modal
  const openAddTxModal = (defaultType: FinanceTxType) => {
    setEditingTx(null);
    setTxType(defaultType);
    setTxDate(new Date().toISOString().slice(0, 10));
    const prefix =
      defaultType === 'income'
        ? 'INV'
        : defaultType === 'expense'
        ? 'EXP'
        : 'KAS';
    setTxNumber(
      `${prefix}-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`
    );
    setTxSourceTarget('');
    setTxCategory(
      defaultType === 'income' || defaultType === 'cash_in'
        ? INCOME_CATEGORIES[0]
        : EXPENSE_CATEGORIES[0]
    );
    setTxAmount('');
    setTxMethod('Transfer');
    setTxDesc('');
    setTxProofUrl('');
    setTxCorrectionReason('');
    setTxModalOpen(true);
  };

  const openEditTxModal = (tx: FinanceTransaction) => {
    setEditingTx(tx);
    setTxType(tx.type);
    setTxDate(tx.dateIso);
    setTxNumber(tx.transactionNumber);
    setTxSourceTarget(tx.sourceOrTarget);
    setTxCategory(tx.category);
    setTxAmount(String(tx.amount));
    setTxMethod(tx.paymentMethod);
    setTxDesc(tx.description);
    setTxProofUrl(tx.proofImageUrl || '');
    setTxCorrectionReason('');
    setTxModalOpen(true);
  };

  const handleSaveTx = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(txAmount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      onShowToast('Nominal transaksi harus lebih dari 0.', 'error');
      return;
    }

    setTxSaving(true);
    try {
      await saveFinanceTransaction(
        {
          id: editingTx ? editingTx.id : `tx_${Date.now()}`,
          transactionNumber: txNumber.trim() || `TX-${Date.now()}`,
          type: txType,
          dateIso: txDate,
          sourceOrTarget: txSourceTarget.trim() || 'Transaksi Umum',
          category: txCategory.trim() || 'Lainnya',
          amount: numericAmount,
          paymentMethod: txMethod,
          description: txDesc.trim(),
          proofImageUrl: txProofUrl,
          relatedOrderId: editingTx?.relatedOrderId || '',
          createdBy: editingTx?.createdBy || adminUsername,
          updatedBy: adminUsername,
          correctionHistory: editingTx?.correctionHistory || [],
        },
        Boolean(editingTx),
        txCorrectionReason,
        adminUsername
      );
      setTxModalOpen(false);
      onShowToast('Data keuangan berhasil disimpan.', 'success');
    } catch (err) {
      onShowToast(
        err instanceof Error ? err.message : 'Gagal menyimpan transaksi.',
        'error'
      );
    } finally {
      setTxSaving(false);
    }
  };

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file);
      setTxProofUrl(compressed);
      onShowToast('Bukti transaksi berhasil diupload.', 'success');
    } catch (err) {
      onShowToast(
        err instanceof Error ? err.message : 'Gagal mengupload bukti.',
        'error'
      );
    }
  };

  // Open Debt/Receivable Modal
  const openAddDrModal = (type: 'hutang' | 'piutang') => {
    setEditingDr(null);
    setDrType(type);
    setDrPartyName('');
    setDrPhone('');
    setDrDate(new Date().toISOString().slice(0, 10));
    setDrDueDate('');
    setDrTotalAmount('');
    setDrPaidAmount('0');
    setDrDesc('');
    setDrModalOpen(true);
  };

  const openEditDrModal = (dr: DebtReceivable) => {
    setEditingDr(dr);
    setDrType(dr.recordType);
    setDrPartyName(dr.partyName);
    setDrPhone(dr.phone);
    setDrDate(dr.dateIso);
    setDrDueDate(dr.dueDateIso);
    setDrTotalAmount(String(dr.totalAmount));
    setDrPaidAmount(String(dr.paidAmount));
    setDrDesc(dr.description);
    setDrModalOpen(true);
  };

  const handleSaveDr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drPartyName.trim()) {
      onShowToast('Mohon isi nama pihak/pelanggan.', 'error');
      return;
    }
    const totalNum = Number(drTotalAmount);
    if (!Number.isFinite(totalNum) || totalNum <= 0) {
      onShowToast('Nominal harus lebih dari 0.', 'error');
      return;
    }
    setDrSaving(true);
    try {
      await saveDebtReceivable(
        {
          id: editingDr ? editingDr.id : `dr_${Date.now()}`,
          recordType: drType,
          partyName: drPartyName.trim(),
          phone: drPhone.trim(),
          dateIso: drDate,
          dueDateIso: drDueDate,
          totalAmount: totalNum,
          paidAmount: Number(drPaidAmount) || 0,
          status: 'Belum Lunas',
          description: drDesc.trim(),
          paymentHistory: editingDr?.paymentHistory || [],
          createdBy: editingDr?.createdBy || adminUsername,
          updatedBy: adminUsername,
        },
        Boolean(editingDr),
        adminUsername
      );
      setDrModalOpen(false);
      onShowToast(`Data ${drType} berhasil disimpan.`, 'success');
    } catch (err) {
      onShowToast(
        err instanceof Error ? err.message : 'Gagal menyimpan data.',
        'error'
      );
    } finally {
      setDrSaving(false);
    }
  };

  const handleRecordInstallment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalRecord) return;
    try {
      await recordDebtInstallmentPayment(
        payModalRecord,
        Number(payAmount),
        payMethod,
        payNote,
        paySyncFinance,
        adminUsername
      );
      setPayModalRecord(null);
      setPayAmount('');
      setPayNote('');
      onShowToast('Pembayaran berhasil dicatat.', 'success');
    } catch (err) {
      onShowToast(
        err instanceof Error ? err.message : 'Gagal mencatat pembayaran.',
        'error'
      );
    }
  };

  // CSV / Excel Export Function
  const handleExportCsv = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (
      reportType === 'labarugi' ||
      reportType === 'pemasukan' ||
      reportType === 'pengeluaran' ||
      reportType === 'kas'
    ) {
      headers = [
        'Tanggal',
        'No. Transaksi',
        'Tipe',
        'Kategori',
        'Sumber / Tujuan',
        'Metode',
        'Nominal (Rp)',
        'Keterangan',
      ];
      const list = filteredTransactions.filter((t) => {
        if (reportType === 'pemasukan')
          return t.type === 'income' || t.type === 'cash_in';
        if (reportType === 'pengeluaran')
          return t.type === 'expense' || t.type === 'cash_out';
        return true;
      });
      rows = list.map((t) => [
        t.dateIso,
        t.transactionNumber,
        t.type === 'income' || t.type === 'cash_in' ? 'PEMASUKAN' : 'PENGELUARAN',
        t.category,
        t.sourceOrTarget,
        t.paymentMethod,
        String(t.amount),
        t.description.replace(/[\r\n]+/g, ' '),
      ]);
    } else if (reportType === 'penjualan') {
      headers = [
        'Tanggal',
        'No. Pesanan',
        'Pelanggan',
        'WhatsApp',
        'Jumlah Item',
        'Status Pesanan',
        'Status Bayar',
        'Total (Rp)',
      ];
      rows = filteredOrders.map((o) => [
        o.dateIso,
        o.orderNumber,
        o.customerName,
        o.customerPhone,
        String(o.totalQuantity),
        o.status,
        o.paymentStatus,
        String(o.totalAmount),
      ]);
    } else {
      const targetType = reportType === 'hutang' ? 'hutang' : 'piutang';
      headers = [
        'Tanggal',
        'Jatuh Tempo',
        'Nama Pihak',
        'Telepon',
        'Total (Rp)',
        'Terbayar (Rp)',
        'Sisa (Rp)',
        'Status',
        'Keterangan',
      ];
      rows = debtsReceivables
        .filter((d) => d.recordType === targetType)
        .map((d) => [
          d.dateIso,
          d.dueDateIso || '-',
          d.partyName,
          d.phone || '-',
          String(d.totalAmount),
          String(d.paidAmount),
          String(Math.max(0, d.totalAmount - d.paidAmount)),
          d.status,
          d.description.replace(/[\r\n]+/g, ' '),
        ]);
    }

    const escapeCsv = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;
    const csvContent =
      '\uFEFF' +
      [
        `"LAPORAN KEUANGAN ${settings.storeName}"`,
        `"Jenis Laporan: ${reportType.toUpperCase()} | Dicetak: ${new Date().toLocaleDateString('id-ID')}"`,
        '',
        headers.map(escapeCsv).join(','),
        ...rows.map((r) => r.map(escapeCsv).join(',')),
        '',
        `"TOTAL PEMASUKAN PERIODE","${metrics.periodIncome}"`,
        `"TOTAL PENGELUARAN PERIODE","${metrics.periodExpense}"`,
        `"LABA / RUGI BERSIH","${metrics.netProfit}"`,
      ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_${settings.storeName.replace(/\s+/g, '_')}_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast('Laporan Excel/CSV berhasil didownload.', 'success');
  };

  const periodLabelText = useMemo(() => {
    if (datePreset === 'today') return 'Hari Ini';
    if (datePreset === 'week') return '7 Hari Terakhir';
    if (datePreset === 'month') return 'Bulan Ini';
    if (datePreset === 'year') return 'Tahun Ini';
    if (datePreset === 'custom') return `${customStart} s/d ${customEnd}`;
    return 'Semua Periode';
  }, [datePreset, customStart, customEnd]);

  const maxChartVal = Math.max(
    1,
    ...monthlyChartData.map((m) => Math.max(m.income, m.expense))
  );

  return (
    <div className="space-y-6">
      {/* Sub-navigation Bar + Date Period Filter (Hidden when printing) */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-bold text-lg text-slate-900">
              Modul Manajemen Keuangan & Akuntansi
            </h2>
            <p className="text-xs text-slate-500">
              Pencatatan kas, pemasukan, pengeluaran, hutang, piutang, dan
              laporan laba rugi otomatis
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => openAddTxModal('income')}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Pemasukan</span>
            </button>
            <button
              type="button"
              onClick={() => openAddTxModal('expense')}
              className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Pengeluaran</span>
            </button>
          </div>
        </div>

        {/* 8 Submenu Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
          {(
            [
              { id: 'dashboard', label: '1. Dashboard Keuangan' },
              { id: 'pemasukan', label: '2. Pemasukan' },
              { id: 'pengeluaran', label: '3. Pengeluaran' },
              { id: 'hutang', label: '4. Hutang' },
              { id: 'piutang', label: '5. Piutang' },
              { id: 'kas', label: '6. Buku Kas' },
              { id: 'labarugi', label: '7. Laba Rugi' },
              { id: 'laporan', label: '8. Cetak & Laporan' },
            ] as { id: FinanceSubTab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectSubTab(tab.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Universal Date Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1 mr-1">
              <Calendar className="w-3.5 h-3.5" />
              Periode:
            </span>
            {(
              [
                { id: 'today', label: 'Hari Ini' },
                { id: 'week', label: 'Minggu Ini' },
                { id: 'month', label: 'Bulan Ini' },
                { id: 'year', label: 'Tahun Ini' },
                { id: 'all', label: 'Semua' },
                { id: 'custom', label: 'Custom Tanggal' },
              ] as { id: DateFilterPreset; label: string }[]
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setDatePreset(p.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  datePreset === p.id
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {datePreset === 'custom' && (
            <div className="flex items-center gap-2 text-xs">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-300 font-mono"
              />
              <span className="text-slate-400">s/d</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-300 font-mono"
              />
            </div>
          )}
        </div>
      </div>

      {/* SUBTAB 1: DASHBOARD KEUANGAN */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Total Pemasukan ({periodLabelText})</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="font-mono font-bold text-xl text-emerald-700 tabular-nums">
                {formatRupiah(metrics.periodIncome)}
              </p>
              <span className="text-[11px] text-slate-400">
                Dari {
                  filteredTransactions.filter(
                    (t) => t.type === 'income' || t.type === 'cash_in'
                  ).length
                }{' '}
                transaksi masuk
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Total Pengeluaran ({periodLabelText})</span>
                <ArrowDownRight className="w-4 h-4 text-rose-600" />
              </div>
              <p className="font-mono font-bold text-xl text-rose-600 tabular-nums">
                {formatRupiah(metrics.periodExpense)}
              </p>
              <span className="text-[11px] text-slate-400">
                Dari {
                  filteredTransactions.filter(
                    (t) => t.type === 'expense' || t.type === 'cash_out'
                  ).length
                }{' '}
                transaksi keluar
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Laba / Rugi Bersih ({periodLabelText})</span>
                <span className="text-[11px] font-semibold text-slate-700">
                  {metrics.netProfit >= 0 ? 'PROFIT' : 'DEFISIT'}
                </span>
              </div>
              <p
                className={`font-mono font-bold text-xl tabular-nums ${
                  metrics.netProfit >= 0 ? 'text-slate-900' : 'text-rose-600'
                }`}
              >
                {formatRupiah(metrics.netProfit)}
              </p>
              <span className="text-[11px] text-slate-400">
                Pemasukan dikurangi Pengeluaran
              </span>
            </div>

            <div className="bg-slate-900 text-white border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Saldo Akhir Kas Aktif</span>
                <Wallet className="w-4 h-4 text-amber-400" />
              </div>
              <p className="font-mono font-bold text-xl text-amber-400 tabular-nums">
                {formatRupiah(metrics.endingCashBalance)}
              </p>
              <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                Piutang: {formatRupiah(metrics.unpaidPiutang)} · Hutang:{' '}
                {formatRupiah(metrics.unpaidHutang)}
              </span>
            </div>
          </div>

          {/* Interactive Monthly Chart + Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-900">
                    Grafik Pemasukan vs Pengeluaran & Laba (6 Bulan)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Data otomatis diperbarui setiap ada transaksi baru
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-emerald-700 font-medium">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                    Pemasukan
                  </span>
                  <span className="flex items-center gap-1 text-rose-600 font-medium">
                    <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                    Pengeluaran
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-3 items-end h-52 pt-6 pb-2 border-b border-slate-200">
                {monthlyChartData.map((m, idx) => {
                  const incHeight = Math.max(
                    6,
                    Math.round((m.income / maxChartVal) * 150)
                  );
                  const expHeight = Math.max(
                    6,
                    Math.round((m.expense / maxChartVal) * 150)
                  );
                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center justify-end h-full group"
                    >
                      <div className="flex items-end gap-1.5 w-full justify-center">
                        <div
                          style={{ height: `${incHeight}px` }}
                          title={`Pemasukan ${m.month}: ${formatRupiah(m.income)}`}
                          className="w-4 sm:w-5 bg-emerald-500 hover:bg-emerald-600 rounded-t transition-all"
                        />
                        <div
                          style={{ height: `${expHeight}px` }}
                          title={`Pengeluaran ${m.month}: ${formatRupiah(m.expense)}`}
                          className="w-4 sm:w-5 bg-rose-500 hover:bg-rose-600 rounded-t transition-all"
                        />
                      </div>
                      <span className="text-[11px] font-mono text-slate-600 mt-2">
                        {m.month}
                      </span>
                      <span
                        className={`text-[10px] font-mono tabular-nums ${
                          m.profit >= 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {m.profit >= 0 ? '+' : ''}
                        {Math.round(m.profit / 1000)}k
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-900">
                Distribusi Kategori ({periodLabelText})
              </h3>

              <div>
                <h4 className="text-xs font-semibold text-emerald-700 mb-2">
                  Kategori Pemasukan Terbesar
                </h4>
                {categoryBreakdown.incomeByCategory.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    Belum ada pemasukan pada periode ini.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {categoryBreakdown.incomeByCategory.map(([cat, val]) => (
                      <div
                        key={cat}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-slate-700">{cat}</span>
                        <span className="font-mono font-semibold text-slate-900 tabular-nums">
                          {formatRupiah(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200">
                <h4 className="text-xs font-semibold text-rose-600 mb-2">
                  Kategori Pengeluaran Terbesar
                </h4>
                {categoryBreakdown.expenseByCategory.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    Belum ada pengeluaran pada periode ini.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {categoryBreakdown.expenseByCategory.map(([cat, val]) => (
                      <div
                        key={cat}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-slate-700">{cat}</span>
                        <span className="font-mono font-semibold text-slate-900 tabular-nums">
                          {formatRupiah(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2 & 3: PEMASUKAN / PENGELUARAN */}
      {(activeSubTab === 'pemasukan' || activeSubTab === 'pengeluaran') && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                {activeSubTab === 'pemasukan'
                  ? 'Daftar Transaksi Pemasukan'
                  : 'Daftar Transaksi Pengeluaran'}
              </h3>
              <p className="text-xs text-slate-500">
                Total Periode ({periodLabelText}):{' '}
                <strong className="font-mono text-slate-900">
                  {formatRupiah(
                    activeSubTab === 'pemasukan'
                      ? metrics.periodIncome
                      : metrics.periodExpense
                  )}
                </strong>
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                openAddTxModal(
                  activeSubTab === 'pemasukan' ? 'income' : 'expense'
                )
              }
              className={`px-4 py-2 rounded-lg text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'pemasukan'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>
                {activeSubTab === 'pemasukan'
                  ? 'Tambah Pemasukan'
                  : 'Tambah Pengeluaran'}
              </span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">No. Transaksi</th>
                  <th className="py-3 px-4">
                    {activeSubTab === 'pemasukan' ? 'Sumber' : 'Tujuan / Vendor'}
                  </th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Metode</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4">Bukti</th>
                  <th className="py-3 px-4 text-right">Nominal</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredTransactions
                  .filter((t) =>
                    activeSubTab === 'pemasukan'
                      ? t.type === 'income' || t.type === 'cash_in'
                      : t.type === 'expense' || t.type === 'cash_out'
                  )
                  .map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono whitespace-nowrap">
                        {tx.dateIso}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        {tx.transactionNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {tx.sourceOrTarget}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{tx.category}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {tx.paymentMethod}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs">
                        <p className="line-clamp-2">{tx.description}</p>
                        {tx.correctionHistory &&
                          tx.correctionHistory.length > 0 && (
                            <span className="text-[10px] text-amber-700 flex items-center gap-1 mt-0.5">
                              <History className="w-3 h-3" />
                              Dikoreksi ({tx.correctionHistory.length}x)
                            </span>
                          )}
                      </td>
                      <td className="py-3 px-4">
                        {tx.proofImageUrl ? (
                          <button
                            type="button"
                            onClick={() =>
                              onOpenLightbox(
                                [tx.proofImageUrl],
                                0,
                                `Bukti ${tx.transactionNumber}`
                              )
                            }
                            className="inline-flex items-center gap-1 text-amber-700 hover:underline font-medium cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat</span>
                          </button>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-mono font-bold whitespace-nowrap tabular-nums ${
                          activeSubTab === 'pemasukan'
                            ? 'text-emerald-700'
                            : 'text-rose-600'
                        }`}
                      >
                        {formatRupiah(tx.amount)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditTxModal(tx)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                            title="Edit / Koreksi"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteTx(tx)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 4 & 5: HUTANG & PIUTANG */}
      {(activeSubTab === 'hutang' || activeSubTab === 'piutang') && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                {activeSubTab === 'hutang'
                  ? 'Manajemen Hutang Usaha (Payables)'
                  : 'Manajemen Piutang Pelanggan (Receivables)'}
              </h3>
              <p className="text-xs text-slate-500">
                Sisa Belum Lunas:{' '}
                <strong className="font-mono text-slate-900">
                  {formatRupiah(
                    activeSubTab === 'hutang'
                      ? metrics.unpaidHutang
                      : metrics.unpaidPiutang
                  )}
                </strong>
              </p>
            </div>

            <button
              type="button"
              onClick={() => openAddDrModal(activeSubTab)}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>
                {activeSubTab === 'hutang'
                  ? 'Catat Hutang Baru'
                  : 'Catat Piutang Baru'}
              </span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Jatuh Tempo</th>
                  <th className="py-3 px-4">
                    {activeSubTab === 'hutang'
                      ? 'Nama Supplier / Kreditor'
                      : 'Nama Pelanggan'}
                  </th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-right">Terbayar</th>
                  <th className="py-3 px-4 text-right">Sisa</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {(activeSubTab === 'hutang'
                  ? metrics.hutangList
                  : metrics.piutangList
                ).map((dr) => {
                  const remaining = Math.max(0, dr.totalAmount - dr.paidAmount);
                  return (
                    <tr key={dr.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono whitespace-nowrap">
                        {dr.dateIso}
                      </td>
                      <td className="py-3 px-4 font-mono whitespace-nowrap text-slate-600">
                        {dr.dueDateIso || '-'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {dr.partyName}
                        {dr.phone && (
                          <span className="block text-[11px] font-mono text-slate-400">
                            {dr.phone}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs">
                        {dr.description}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {formatRupiah(dr.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-700 tabular-nums">
                        {formatRupiah(dr.paidAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 tabular-nums">
                        {formatRupiah(remaining)}
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        <span
                          className={
                            dr.status === 'Lunas'
                              ? 'text-emerald-700'
                              : dr.status === 'Sebagian'
                              ? 'text-amber-700'
                              : 'text-rose-600'
                          }
                        >
                          {dr.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {dr.status !== 'Lunas' && (
                            <button
                              type="button"
                              onClick={() => {
                                setPayModalRecord(dr);
                                setPayAmount(String(remaining));
                              }}
                              className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold cursor-pointer"
                            >
                              Bayar
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openEditDrModal(dr)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteDr(dr)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 6: BUKU KAS */}
      {activeSubTab === 'kas' && (
        <div className="space-y-6">
          {/* Cash Formula Card */}
          <div className="bg-slate-900 text-white rounded-xl p-5 sm:p-6">
            <h3 className="font-display font-bold text-base mb-4">
              Posisi Kas ISTAFA PRINTING (Rumus Akurat & Konsisten)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
              <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700">
                <span className="text-xs text-slate-400 block">Saldo Awal</span>
                <span className="font-mono font-bold text-lg text-white tabular-nums">
                  {formatRupiah(metrics.initialCash)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-700/50">
                <span className="text-xs text-emerald-300 block">
                  + Total Kas Masuk
                </span>
                <span className="font-mono font-bold text-lg text-emerald-400 tabular-nums">
                  {formatRupiah(metrics.allTimeIn)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-700/50">
                <span className="text-xs text-rose-300 block">
                  - Total Kas Keluar
                </span>
                <span className="font-mono font-bold text-lg text-rose-400 tabular-nums">
                  {formatRupiah(metrics.allTimeOut)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-500 text-slate-950">
                <span className="text-xs font-semibold block">
                  = Saldo Akhir Kas
                </span>
                <span className="font-mono font-extrabold text-xl tabular-nums">
                  {formatRupiah(metrics.endingCashBalance)}
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => openAddTxModal('cash_in')}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
              >
                + Tambah Kas Masuk
              </button>
              <button
                type="button"
                onClick={() => openAddTxModal('cash_out')}
                className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer"
              >
                - Catat Kas Keluar
              </button>
            </div>
          </div>

          {/* Cash Ledger Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h4 className="font-display font-bold text-sm text-slate-900">
                Buku Mutasi Kas & Riwayat Koreksi
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">No. Transaksi</th>
                    <th className="py-3 px-4">Jenis</th>
                    <th className="py-3 px-4">Kategori & Uraian</th>
                    <th className="py-3 px-4">Riwayat Koreksi</th>
                    <th className="py-3 px-4 text-right">Mutasi</th>
                    <th className="py-3 px-4 text-right">Koreksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {filteredTransactions.map((tx) => {
                    const isIn =
                      tx.type === 'income' || tx.type === 'cash_in';
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono whitespace-nowrap">
                          {tx.dateIso}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold">
                          {tx.transactionNumber}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-semibold ${
                              isIn ? 'text-emerald-700' : 'text-rose-600'
                            }`}
                          >
                            {isIn ? 'KAS MASUK' : 'KAS KELUAR'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900">
                            {tx.category}
                          </span>{' '}
                          · {tx.sourceOrTarget}
                          <p className="text-slate-500">{tx.description}</p>
                        </td>
                        <td className="py-3 px-4 text-slate-500 max-w-xs">
                          {tx.correctionHistory &&
                          tx.correctionHistory.length > 0 ? (
                            <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-amber-800">
                              {tx.correctionHistory.slice(0, 2).map((h, i) => (
                                <li key={i}>{h}</li>
                              ))}
                            </ul>
                          ) : (
                            <span>Original (Oleh {tx.createdBy})</span>
                          )}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-mono font-bold whitespace-nowrap tabular-nums ${
                            isIn ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {isIn ? '+' : '-'}
                          {formatRupiah(tx.amount)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => openEditTxModal(tx)}
                            className="px-2.5 py-1 rounded-md border border-slate-300 hover:bg-slate-100 text-slate-700 text-[11px] font-medium cursor-pointer"
                          >
                            Koreksi
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 7: LABA RUGI OTOMATIS */}
      {activeSubTab === 'labarugi' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900">
                Perhitungan Laba / Rugi Otomatis
              </h3>
              <p className="text-xs text-slate-500">
                Periode Evaluasi: <strong>{periodLabelText}</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setReportType('labarugi');
                onSelectSubTab('laporan');
              }}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Buka Tampilan Cetak / PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs font-semibold text-emerald-800 block">
                TOTAL PEMASUKAN
              </span>
              <span className="font-mono font-bold text-2xl text-emerald-700 mt-1 block tabular-nums">
                {formatRupiah(metrics.periodIncome)}
              </span>
            </div>

            <div className="p-5 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-xs font-semibold text-rose-800 block">
                DIKURANGI TOTAL PENGELUARAN
              </span>
              <span className="font-mono font-bold text-2xl text-rose-600 mt-1 block tabular-nums">
                {formatRupiah(metrics.periodExpense)}
              </span>
            </div>

            <div
              className={`p-5 rounded-xl border ${
                metrics.netProfit >= 0
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-rose-100 border-rose-300'
              }`}
            >
              <span className="text-xs font-bold text-slate-800 block">
                = {metrics.netProfit >= 0 ? 'LABA BERSIH' : 'RUGI BERSIH'}
              </span>
              <span
                className={`font-mono font-extrabold text-2xl mt-1 block tabular-nums ${
                  metrics.netProfit >= 0 ? 'text-slate-900' : 'text-rose-700'
                }`}
              >
                {formatRupiah(metrics.netProfit)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="border border-slate-200 rounded-xl p-4">
              <h4 className="font-display font-bold text-sm text-emerald-800 mb-3 border-b border-slate-200 pb-2">
                Rincian Pemasukan per Kategori
              </h4>
              <div className="space-y-2 text-xs">
                {categoryBreakdown.incomeByCategory.map(([cat, amount]) => (
                  <div key={cat} className="flex justify-between py-1">
                    <span className="text-slate-700">{cat}</span>
                    <span className="font-mono font-semibold tabular-nums">
                      {formatRupiah(amount)}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                  <span>Total Pemasukan</span>
                  <span className="font-mono tabular-nums">
                    {formatRupiah(metrics.periodIncome)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4">
              <h4 className="font-display font-bold text-sm text-rose-800 mb-3 border-b border-slate-200 pb-2">
                Rincian Pengeluaran per Kategori
              </h4>
              <div className="space-y-2 text-xs">
                {categoryBreakdown.expenseByCategory.map(([cat, amount]) => (
                  <div key={cat} className="flex justify-between py-1">
                    <span className="text-slate-700">{cat}</span>
                    <span className="font-mono font-semibold tabular-nums">
                      {formatRupiah(amount)}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                  <span>Total Pengeluaran</span>
                  <span className="font-mono tabular-nums">
                    {formatRupiah(metrics.periodExpense)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 8: LAPORAN KEUANGAN (PRINT, PDF, & EXCEL/CSV) */}
      {activeSubTab === 'laporan' && (
        <div className="space-y-4">
          {/* Controls (Hidden on Print) */}
          <div className="no-print bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">
                Pilih Jenis Laporan:
              </span>
              {(
                [
                  { id: 'labarugi', label: 'Laporan Laba Rugi' },
                  { id: 'penjualan', label: 'Laporan Penjualan' },
                  { id: 'pemasukan', label: 'Laporan Pemasukan' },
                  { id: 'pengeluaran', label: 'Laporan Pengeluaran' },
                  { id: 'kas', label: 'Laporan Kas' },
                  { id: 'hutang', label: 'Laporan Hutang' },
                  { id: 'piutang', label: 'Laporan Piutang' },
                ] as const
              ).map((rt) => (
                <button
                  key={rt.id}
                  type="button"
                  onClick={() => setReportType(rt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                    reportType === rt.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {rt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Simpan PDF</span>
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Excel / CSV</span>
              </button>
            </div>
          </div>

          {/* Printable Official Report Document */}
          <div className="print-only-area bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
            {/* Report Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display font-extrabold text-2xl text-slate-900">
                  {settings.storeName || 'ISTAFA PRINTING'}
                </h1>
                <p className="text-xs text-slate-600">{settings.address}</p>
                <p className="text-xs text-slate-600 font-mono">
                  WhatsApp: {settings.whatsappNumber} · Email: {settings.email}
                </p>
              </div>
              <div className="sm:text-right">
                <h2 className="font-display font-bold text-lg text-slate-900 uppercase">
                  LAPORAN {reportType}
                </h2>
                <p className="text-xs text-slate-600">
                  Periode: <strong>{periodLabelText}</strong>
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  Tanggal Cetak: {new Date().toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>

            {/* Report Table */}
            <div className="overflow-x-auto">
              {reportType === 'penjualan' ? (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-50 font-semibold">
                      <th className="py-2.5 px-3">Tanggal</th>
                      <th className="py-2.5 px-3">ID Pesanan</th>
                      <th className="py-2.5 px-3">Pelanggan</th>
                      <th className="py-2.5 px-3">Rincian Produk</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredOrders.map((o) => (
                      <tr key={o.id}>
                        <td className="py-2 px-3 font-mono">{o.dateIso}</td>
                        <td className="py-2 px-3 font-mono font-semibold">
                          {o.orderNumber}
                        </td>
                        <td className="py-2 px-3">{o.customerName}</td>
                        <td className="py-2 px-3">
                          {o.items
                            .map((i) => `${i.name} (x${i.quantity})`)
                            .join(', ')}
                        </td>
                        <td className="py-2 px-3">
                          {o.status} / {o.paymentStatus}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-semibold tabular-nums">
                          {formatRupiah(o.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : reportType === 'hutang' || reportType === 'piutang' ? (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-50 font-semibold">
                      <th className="py-2.5 px-3">Tanggal</th>
                      <th className="py-2.5 px-3">Jatuh Tempo</th>
                      <th className="py-2.5 px-3">Nama Pihak</th>
                      <th className="py-2.5 px-3">Keterangan</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                      <th className="py-2.5 px-3 text-right">Terbayar</th>
                      <th className="py-2.5 px-3 text-right">Sisa</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {debtsReceivables
                      .filter((d) => d.recordType === reportType)
                      .map((d) => (
                        <tr key={d.id}>
                          <td className="py-2 px-3 font-mono">{d.dateIso}</td>
                          <td className="py-2 px-3 font-mono">
                            {d.dueDateIso || '-'}
                          </td>
                          <td className="py-2 px-3 font-semibold">
                            {d.partyName}
                          </td>
                          <td className="py-2 px-3">{d.description}</td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums">
                            {formatRupiah(d.totalAmount)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums">
                            {formatRupiah(d.paidAmount)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold tabular-nums">
                            {formatRupiah(
                              Math.max(0, d.totalAmount - d.paidAmount)
                            )}
                          </td>
                          <td className="py-2 px-3">{d.status}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-50 font-semibold">
                      <th className="py-2.5 px-3">Tanggal</th>
                      <th className="py-2.5 px-3">No. Transaksi</th>
                      <th className="py-2.5 px-3">Jenis</th>
                      <th className="py-2.5 px-3">Kategori</th>
                      <th className="py-2.5 px-3">Sumber / Tujuan</th>
                      <th className="py-2.5 px-3">Keterangan</th>
                      <th className="py-2.5 px-3 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredTransactions
                      .filter((t) => {
                        if (reportType === 'pemasukan')
                          return t.type === 'income' || t.type === 'cash_in';
                        if (reportType === 'pengeluaran')
                          return t.type === 'expense' || t.type === 'cash_out';
                        return true;
                      })
                      .map((t) => {
                        const isIn =
                          t.type === 'income' || t.type === 'cash_in';
                        return (
                          <tr key={t.id}>
                            <td className="py-2 px-3 font-mono">{t.dateIso}</td>
                            <td className="py-2 px-3 font-mono font-semibold">
                              {t.transactionNumber}
                            </td>
                            <td className="py-2 px-3">
                              {isIn ? 'Pemasukan' : 'Pengeluaran'}
                            </td>
                            <td className="py-2 px-3">{t.category}</td>
                            <td className="py-2 px-3">{t.sourceOrTarget}</td>
                            <td className="py-2 px-3">{t.description}</td>
                            <td
                              className={`py-2 px-3 text-right font-mono font-semibold tabular-nums ${
                                isIn ? 'text-emerald-700' : 'text-rose-600'
                              }`}
                            >
                              {isIn ? '+' : '-'}
                              {formatRupiah(t.amount)}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Report Summary Footer */}
            <div className="pt-4 border-t-2 border-slate-900 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">
                  Total Pemasukan Periode
                </span>
                <span className="font-mono font-bold text-base text-emerald-700 tabular-nums">
                  {formatRupiah(metrics.periodIncome)}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">
                  Total Pengeluaran Periode
                </span>
                <span className="font-mono font-bold text-base text-rose-600 tabular-nums">
                  {formatRupiah(metrics.periodExpense)}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 text-white">
                <span className="text-slate-400 block">
                  Laba / Rugi Bersih Periode
                </span>
                <span className="font-mono font-bold text-base text-amber-400 tabular-nums">
                  {formatRupiah(metrics.netProfit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT FINANCE TRANSACTION */}
      {txModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-display font-bold text-base text-slate-900">
                {editingTx
                  ? `Koreksi Transaksi ${editingTx.transactionNumber}`
                  : txType === 'income' || txType === 'cash_in'
                  ? 'Catat Pemasukan / Kas Masuk Baru'
                  : 'Catat Pengeluaran / Kas Keluar Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setTxModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTx} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jenis Transaksi
                  </label>
                  <select
                    value={txType}
                    onChange={(e) => {
                      const val = e.target.value as FinanceTxType;
                      setTxType(val);
                      setTxCategory(
                        val === 'income' || val === 'cash_in'
                          ? INCOME_CATEGORIES[0]
                          : EXPENSE_CATEGORIES[0]
                      );
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  >
                    <option value="income">Pemasukan</option>
                    <option value="expense">Pengeluaran</option>
                    <option value="cash_in">Kas Masuk</option>
                    <option value="cash_out">Kas Keluar</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Transaksi *
                  </label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor Transaksi
                  </label>
                  <input
                    type="text"
                    value={txNumber}
                    onChange={(e) => setTxNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kategori *
                  </label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  >
                    {(txType === 'income' || txType === 'cash_in'
                      ? INCOME_CATEGORIES
                      : EXPENSE_CATEGORIES
                    ).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {txType === 'income' || txType === 'cash_in'
                      ? 'Sumber Pemasukan / Pelanggan *'
                      : 'Penerima / Supplier *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={txSourceTarget}
                    onChange={(e) => setTxSourceTarget(e.target.value)}
                    placeholder="Contoh: Pelanggan Walk-in / Toko Kertas"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Metode Pembayaran *
                  </label>
                  <select
                    value={txMethod}
                    onChange={(e) =>
                      setTxMethod(e.target.value as PaymentMethodType)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nominal (Rp) *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  placeholder="Contoh: 250000"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Keterangan Lengkap
                </label>
                <textarea
                  rows={2}
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  placeholder="Rincian transaksi..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              {editingTx && (
                <div>
                  <label className="block font-semibold text-amber-800 mb-1">
                    Alasan Koreksi (Tercatat di Riwayat Audit)
                  </label>
                  <input
                    type="text"
                    value={txCorrectionReason}
                    onChange={(e) => setTxCorrectionReason(e.target.value)}
                    placeholder="Contoh: Penyesuaian nominal sesuai nota fisik"
                    className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-amber-50/50"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bukti Transaksi / Nota (Opsional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 cursor-pointer inline-flex items-center gap-1.5 font-medium">
                    <Upload className="w-4 h-4 text-slate-600" />
                    <span>Upload Foto Bukti</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProofUpload}
                      className="hidden"
                    />
                  </label>
                  {txProofUrl && (
                    <div className="flex items-center gap-2">
                      <SmartImage
                        src={txProofUrl}
                        alt="Bukti"
                        className="w-10 h-10 rounded object-cover border border-slate-300"
                      />
                      <button
                        type="button"
                        onClick={() => setTxProofUrl('')}
                        className="text-rose-600 hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTxModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={txSaving}
                  className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer disabled:opacity-50"
                >
                  {txSaving ? 'Menyimpan...' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT HUTANG & PIUTANG */}
      {drModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-display font-bold text-base text-slate-900">
                {editingDr
                  ? `Edit Data ${drType.toUpperCase()}`
                  : `Tambah Data ${drType.toUpperCase()}`}
              </h3>
              <button
                type="button"
                onClick={() => setDrModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDr} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {drType === 'hutang'
                    ? 'Nama Supplier / Kreditor *'
                    : 'Nama Pelanggan *'}
                </label>
                <input
                  type="text"
                  required
                  value={drPartyName}
                  onChange={(e) => setDrPartyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    No. WhatsApp / Telepon
                  </label>
                  <input
                    type="text"
                    value={drPhone}
                    onChange={(e) => setDrPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Dicatat *
                  </label>
                  <input
                    type="date"
                    required
                    value={drDate}
                    onChange={(e) => setDrDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jatuh Tempo
                  </label>
                  <input
                    type="date"
                    value={drDueDate}
                    onChange={(e) => setDrDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Total Nominal (Rp) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={drTotalAmount}
                    onChange={(e) => setDrTotalAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Sudah Dibayar Awal / DP (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  value={drPaidAmount}
                  onChange={(e) => setDrPaidAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Keterangan
                </label>
                <textarea
                  rows={2}
                  value={drDesc}
                  onChange={(e) => setDrDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDrModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={drSaving}
                  className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                >
                  {drSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD INSTALLMENT PAYMENT */}
      {payModalRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900">
              Catat Pembayaran {payModalRecord.recordType.toUpperCase()} —{' '}
              {payModalRecord.partyName}
            </h3>
            <p className="text-xs text-slate-500">
              Sisa Tagihan:{' '}
              <strong className="font-mono text-rose-600">
                {formatRupiah(
                  Math.max(
                    0,
                    payModalRecord.totalAmount - payModalRecord.paidAmount
                  )
                )}
              </strong>
            </p>

            <form onSubmit={handleRecordInstallment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nominal Pembayaran (Rp) *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Metode Pembayaran
                </label>
                <select
                  value={payMethod}
                  onChange={(e) =>
                    setPayMethod(e.target.value as PaymentMethodType)
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Pembayaran
                </label>
                <input
                  type="text"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="Contoh: Pelunasan / Cicilan ke-2"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={paySyncFinance}
                  onChange={(e) => setPaySyncFinance(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <span className="text-slate-700">
                  Otomatis catat ke buku{' '}
                  {payModalRecord.recordType === 'piutang'
                    ? 'Pemasukan'
                    : 'Pengeluaran'}{' '}
                  Kas
                </span>
              </label>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayModalRecord(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
                >
                  Simpan Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG FOR DELETING TRANSACTION */}
      {confirmDeleteTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900">
              Konfirmasi Hapus Transaksi
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus transaksi{' '}
              <strong>{confirmDeleteTx.transactionNumber}</strong> (
              {formatRupiah(confirmDeleteTx.amount)})? Tindakan ini akan dicatat
              di Audit Log.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteTx(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await deleteFinanceTransactionById(
                      confirmDeleteTx,
                      adminUsername
                    );
                    setConfirmDeleteTx(null);
                    onShowToast('Transaksi berhasil dihapus.', 'success');
                  } catch {
                    onShowToast('Gagal menghapus transaksi.', 'error');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG FOR DELETING DEBT/RECEIVABLE */}
      {confirmDeleteDr && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900">
              Konfirmasi Hapus Data {confirmDeleteDr.recordType.toUpperCase()}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus catatan{' '}
              {confirmDeleteDr.recordType}{' '}
              <strong>{confirmDeleteDr.partyName}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteDr(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await deleteDebtReceivableById(
                      confirmDeleteDr,
                      adminUsername
                    );
                    setConfirmDeleteDr(null);
                    onShowToast('Data berhasil dihapus.', 'success');
                  } catch {
                    onShowToast('Gagal menghapus data.', 'error');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
