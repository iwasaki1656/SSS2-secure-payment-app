'use client';

import React, { useState, useEffect } from 'react';

// Pre-seeded users in our Fintech prototype system
const PRESEEDED_USERS = [
  { id: 'usr_01', email: 'alice@example.com', name: 'Alice Vance', initialBalance: { USD: 5000, JPY: 100000, EUR: 4000 } },
  { id: 'usr_02', email: 'bob@example.com', name: 'Bob Vance', initialBalance: { USD: 1500, JPY: 50000, EUR: 1200 } },
  { id: 'usr_03', email: 'charlie@example.com', name: 'Charlie Vance', initialBalance: { USD: 250, JPY: 15000, EUR: 200 } }
];

// Helper to generate UUID v4 without external npm packages
function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function Dashboard() {
  // ─── Theme ───────────────────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(true);

  // All theme-sensitive Tailwind classes in one place
  const t = isDark ? {
    page:           'bg-[#0a0f1d] text-zinc-100',
    header:         'bg-[#0e1629]/80 border-zinc-800',
    card:           'bg-[#0e1629] border-zinc-800',
    cardInner:      'bg-zinc-900 border-zinc-800',
    subcard:        'bg-zinc-900/40 border-zinc-800',
    subcardItem:    'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700',
    input:          'bg-zinc-900 border-zinc-800 text-zinc-100',
    inputLogin:     'bg-[#16223f] border-zinc-700 text-zinc-100',
    inputPassword:  'bg-[#121c33] border-zinc-800 text-zinc-500',
    inputTamper:    'bg-zinc-950 border-zinc-800 text-zinc-200',
    inputCode:      'bg-[#070b14] border-zinc-800 text-zinc-400',
    labelMuted:     'text-zinc-400',
    textMuted:      'text-zinc-500',
    textSub:        'text-zinc-300',
    textNormal:     'text-zinc-100',
    divider:        'border-zinc-800',
    dividerMid:     'border-zinc-800/80',
    btnSecondary:   'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-400 hover:text-zinc-200',
    btnLogout:      'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-400 hover:text-zinc-100',
    btnRefresh:     'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100',
    tableHover:     'hover:bg-zinc-900/40',
    tableHead:      'border-b border-zinc-800 text-zinc-500',
    tableDivide:    'divide-y divide-zinc-800',
    emptyState:     'border-2 border-dashed border-zinc-800 text-zinc-500',
    balanceCard:    'bg-zinc-900 border-zinc-800',
    idempotency:    'bg-zinc-950/60 border-zinc-800',
    idempotencyVal: 'bg-[#070b14] border-zinc-800 text-zinc-400',
    auditBlock:     'bg-zinc-900/60 border-zinc-800',
    blockTag:       'bg-zinc-800 border-zinc-700 text-zinc-500',
    chainArrow:     'bg-[#0a0f1d] border-zinc-800 text-zinc-600',
    badge:          'bg-zinc-800 border-zinc-700 text-zinc-400',
    tabActive:      'border-cyan-500 text-cyan-400 bg-cyan-950/10',
    tabInactive:    'border-transparent text-zinc-400 hover:text-zinc-200',
    avatar:         'bg-cyan-950 border-cyan-800 text-cyan-400',
    toggleBtn:      'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white',
  } : {
    page:           'bg-slate-100 text-slate-900',
    header:         'bg-white/95 border-slate-200',
    card:           'bg-white border-slate-200 shadow-sm',
    cardInner:      'bg-slate-50 border-slate-200',
    subcard:        'bg-slate-50 border-slate-200',
    subcardItem:    'bg-white border-slate-200 hover:border-slate-300',
    input:          'bg-white border-slate-300 text-slate-900',
    inputLogin:     'bg-white border-slate-300 text-slate-900',
    inputPassword:  'bg-slate-50 border-slate-200 text-slate-400',
    inputTamper:    'bg-white border-slate-300 text-slate-800',
    inputCode:      'bg-slate-100 border-slate-200 text-slate-500',
    labelMuted:     'text-slate-500',
    textMuted:      'text-slate-400',
    textSub:        'text-slate-700',
    textNormal:     'text-slate-900',
    divider:        'border-slate-200',
    dividerMid:     'border-slate-200',
    btnSecondary:   'bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-600 hover:text-slate-900',
    btnLogout:      'bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-500 hover:text-slate-800',
    btnRefresh:     'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-500 hover:text-slate-800',
    tableHover:     'hover:bg-slate-50',
    tableHead:      'border-b border-slate-200 text-slate-500',
    tableDivide:    'divide-y divide-slate-200',
    emptyState:     'border-2 border-dashed border-slate-200 text-slate-400',
    balanceCard:    'bg-slate-50 border-slate-200',
    idempotency:    'bg-slate-50 border-slate-200',
    idempotencyVal: 'bg-slate-100 border-slate-200 text-slate-500',
    auditBlock:     'bg-white border-slate-200',
    blockTag:       'bg-slate-100 border-slate-200 text-slate-500',
    chainArrow:     'bg-slate-100 border-slate-200 text-slate-400',
    badge:          'bg-slate-100 border-slate-200 text-slate-500',
    tabActive:      'border-cyan-500 text-cyan-600 bg-cyan-50',
    tabInactive:    'border-transparent text-slate-500 hover:text-slate-800',
    avatar:         'bg-sky-100 border-sky-300 text-sky-600',
    toggleBtn:      'bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700 hover:text-white',
  };

  // ─── Authentication & Session ─────────────────────────────────────────────
  const [activeUser, setActiveUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState(PRESEEDED_USERS[0].email);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Balances & Dynamic Calculations
  const [userBalances, setUserBalances] = useState<Record<string, Record<string, number>>>({});

  // Payments & Audit state
  const [payments, setPayments] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [ledgerVerified, setLedgerVerified] = useState<boolean | null>(null);
  const [tamperedLogIndex, setTamperedLogIndex] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'logs'>('form');

  // Transfer Form state
  const [recipientId, setRecipientId] = useState(PRESEEDED_USERS[1].id);
  const [amount, setAmount] = useState('100.00');
  const [currency, setCurrency] = useState('JPY');
  const [description, setDescription] = useState('Test Transfer');
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState<any>(null);

  // Attack Simulator state
  const [simulateTamper, setSimulateTamper] = useState(false);
  const [simulateBadSignature, setSimulateBadSignature] = useState(false);
  const [tamperIndexInput, setTamperIndexInput] = useState('1');
  const [tamperAmountInput, setTamperAmountInput] = useState('99999.00');
  const [isTampering, setIsTampering] = useState(false);
  const [tamperResult, setTamperResult] = useState<string | null>(null);

  // Generate initial idempotency key on load
  useEffect(() => {
    setIdempotencyKey(generateUuid());
  }, []);

  // Set default initial balances on start
  useEffect(() => {
    const balances: Record<string, Record<string, number>> = {};
    PRESEEDED_USERS.forEach((u) => {
      balances[u.id] = { ...u.initialBalance };
    });
    setUserBalances(balances);
  }, []);

  // Update dynamic balances based on payment history
  const updateBalances = (paymentList: any[]) => {
    const balances: Record<string, Record<string, number>> = {};
    PRESEEDED_USERS.forEach((u) => {
      balances[u.id] = { ...u.initialBalance };
    });
    paymentList.forEach((p) => {
      if (p.status === 'COMPLETED') {
        const val = parseFloat(p.amount) || 0;
        const cur = p.currency;
        const sender = p.senderId;
        const recipient = p.recipientId;
        if (balances[sender] && balances[sender][cur] !== undefined) balances[sender][cur] -= val;
        if (balances[recipient] && balances[recipient][cur] !== undefined) balances[recipient][cur] += val;
      }
    });
    setUserBalances(balances);
  };

  // Fetch payments list and audit logs
  const fetchData = async (userId: string, token: string) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const payRes = await fetch(`/api/payments?userId=${userId}&page=1&limit=50`, { headers });
      const payData = await payRes.json();
      if (payData.success) {
        setPayments(payData.data.payments || []);
        updateBalances(payData.data.payments || []);
      }
      const auditRes = await fetch('/api/audit/logs?page=1&limit=50', { headers });
      const auditData = await auditRes.json();
      if (auditData.success) setAuditLogs(auditData.data.logs || []);
    } catch (e: any) {
      console.error('Error fetching data:', e);
    }
  };

  // Perform mock authentication login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    setTransferSuccess(null);
    setTransferError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: 's3cr3tPass!' })
      });
      const data = await res.json();
      if (data.success) {
        setActiveUser(data.data.user);
        setAccessToken(data.data.accessToken);
        await fetchData(data.data.user.id, data.data.accessToken);
      } else {
        setLoginError(data.error?.message || 'Invalid credentials');
      }
    } catch (err: any) {
      setLoginError(`Network error: ${err.message}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Submit transfer request
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser || !accessToken) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) { setTransferError('Validation Error: Amount must be greater than 0'); return; }
    if (activeUser.id === recipientId) { setTransferError('Validation Error: Cannot transfer money to yourself'); return; }
    const activeBalance = userBalances[activeUser.id]?.[currency] || 0;
    if (numAmount > activeBalance) { setTransferError(`Validation Error: Insufficient balance. You have ${activeBalance.toFixed(2)} ${currency}`); return; }

    setIsTransferring(true);
    setTransferError(null);
    setTransferSuccess(null);
    try {
      const res = await fetch('/api/payments/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Idempotency-Key': idempotencyKey,
          'X-Simulate-Tamper': simulateTamper ? 'true' : 'false',
          'X-Simulate-Bad-Signature': simulateBadSignature ? 'true' : 'false'
        },
        body: JSON.stringify({ senderId: activeUser.id, recipientId, amount: parseFloat(amount).toFixed(2), currency, description })
      });
      const data = await res.json();
      if (data.success) {
        setTransferSuccess(data.data);
        await fetchData(activeUser.id, accessToken);
        setIdempotencyKey(generateUuid());
      } else {
        setTransferError(`[${data.error?.code || 'ERROR'}] ${data.error?.message || 'Transfer failed'}`);
      }
    } catch (err: any) {
      setTransferError(`Network error: ${err.message}`);
    } finally {
      setIsTransferring(false);
    }
  };

  // Execute cryptographic ledger integrity audit
  const runAuditVerification = async () => {
    if (!accessToken) return;
    setIsVerifying(true);
    setLedgerVerified(null);
    setTamperedLogIndex(null);
    try {
      const res = await fetch('/api/audit/verify', { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await res.json();
      if (data.success) {
        setLedgerVerified(data.data.verified);
        if (!data.data.verified && data.data.tamperedIndex !== undefined) setTamperedLogIndex(data.data.tamperedIndex);
      }
    } catch (err) { console.error(err); } finally { setIsVerifying(false); }
  };

  // Simulate internal database log tampering
  const triggerLogTampering = async () => {
    if (!accessToken) return;
    setIsTampering(true);
    setTamperResult(null);
    try {
      const res = await fetch('/api/audit/tamper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify({ index: parseInt(tamperIndexInput) || 1, amount: parseFloat(tamperAmountInput).toFixed(2) })
      });
      const data = await res.json();
      if (data.success) {
        setTamperResult('Ledger value corrupted successfully! Run Verification Audit to check.');
        await fetchData(activeUser.id, accessToken);
      } else {
        setTamperResult(`Failed: ${data.error?.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      setTamperResult(`Network error: ${err.message}`);
    } finally { setIsTampering(false); }
  };

  const handleLogout = () => {
    setActiveUser(null); setAccessToken(null); setPayments([]); setAuditLogs([]);
    setLedgerVerified(null); setTamperedLogIndex(null);
  };

  const getUserName = (id: string) => {
    const user = PRESEEDED_USERS.find((u) => u.id === id);
    return user ? user.name : id;
  };

  return (
    <div className={`min-h-screen w-full font-sans antialiased selection:bg-cyan-500 selection:text-white transition-colors duration-300 ${t.page}`}>

      {/* Top Banner Header */}
      <header className={`border-b backdrop-blur sticky top-0 z-50 ${t.header}`}>
        <div className="w-full max-w-[1920px] mx-auto px-4 py-3 sm:px-6 sm:py-4 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            {/* Shield Logo */}
            <div className="p-2 bg-cyan-950/50 border border-cyan-800 rounded-lg text-cyan-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                AegisPay Secure Core
              </h1>
              <p className={`text-xs font-mono ${t.textMuted}`}>Fintech Security Testing Suite v1.0</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme toggle button */}
            <button
              id="theme-toggle-btn"
              onClick={() => setIsDark(!isDark)}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-mono font-semibold cursor-pointer select-none ${t.toggleBtn}`}
            >
              {isDark ? (
                <>
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m8.66-9H21m-18 0H2m14.95-6.364l-.707.707M7.757 16.95l-.707.707M18.364 18.364l-.707-.707M6.343 6.343l-.707-.707M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                  </svg>
                  <span>Light</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
                  </svg>
                  <span>Dark</span>
                </>
              )}
            </button>

            {/* Ledger Integrity Badge */}
            {accessToken && (
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono ${t.labelMuted}`}>Ledger Status:</span>
                {ledgerVerified === true ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    SECURE (GENUINE)
                  </span>
                ) : ledgerVerified === false ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950 text-rose-400 border border-rose-800 animate-bounce">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    INTEGRITY COMPROMISED
                  </span>
                ) : (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${t.badge}`}>
                    <span className="w-2 h-2 rounded-full bg-current opacity-60"></span>
                    UNAUDITED (READY)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-[1920px] mx-auto px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {!accessToken ? (
          /* Authentication Screen */
          <div className={`w-full max-w-sm sm:max-w-md mx-auto my-6 sm:my-12 border rounded-2xl p-5 sm:p-8 shadow-2xl relative overflow-hidden ${t.card}`}>
            {/* Background Glow */}
            <div className="absolute -top-16 -left-16 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>

            <div className="text-center mb-8 relative">
              <div className="inline-flex p-3 bg-cyan-950/30 border border-cyan-800/50 rounded-2xl text-cyan-400 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">Simulator Login</h2>
              <p className={`text-sm mt-1 ${t.labelMuted}`}>Select an account to initiate secure session</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6 relative">
              <div>
                <label className={`block text-xs font-mono uppercase tracking-wider mb-2 ${t.labelMuted}`}>User Identity</label>
                <select
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium ${t.inputLogin}`}
                >
                  {PRESEEDED_USERS.map((user) => (
                    <option key={user.id} value={user.email}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-xs font-mono uppercase tracking-wider mb-2 ${t.labelMuted}`}>Password</label>
                <input
                  type="password"
                  disabled
                  value="s3cr3tPass!"
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none font-mono text-sm cursor-not-allowed ${t.inputPassword}`}
                />
                <span className={`text-[10px] font-mono mt-1 block ${t.textMuted}`}>Authentication uses cryptographically signed tokens.</span>
              </div>

              {loginError && (
                <div className="bg-rose-950/40 border border-rose-800 text-rose-300 rounded-xl p-3 text-sm flex gap-2 items-center">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-cyan-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer"
              >
                {isLoggingIn ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Initialize Session</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Unified Double-Pane Dashboard */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 xl:gap-8">

            {/* Sidebar Active User & Balance Cards */}
            <div className="md:col-span-5 lg:col-span-4 xl:col-span-4 space-y-4 sm:space-y-6">

              {/* User Session Info */}
              <div className={`border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden ${t.card}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold ${t.avatar}`}>
                      {activeUser.email[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">{getUserName(activeUser.id)}</h3>
                      <p className={`text-xs font-mono ${t.labelMuted}`}>{activeUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className={`p-1.5 border rounded-lg transition-colors text-xs font-mono cursor-pointer ${t.btnLogout}`}
                  >
                    Logout
                  </button>
                </div>

                <div className={`border-t pt-4 space-y-2 ${t.divider}`}>
                  <div className="flex justify-between text-xs font-mono">
                    <span className={t.textMuted}>USER ID:</span>
                    <span className="text-cyan-400 font-bold">{activeUser.id}</span>
                  </div>
                  <div className="flex flex-col text-xs font-mono">
                    <span className={`mb-1 ${t.textMuted}`}>BEARER JWT TOKEN:</span>
                    <span className={`text-[10px] break-all p-2 rounded-lg border font-mono ${t.inputCode}`}>
                      {accessToken ? `${accessToken.substring(0, 32)}...` : 'None'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Balance Board */}
              <div className={`border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 ${t.card}`}>
                <h3 className={`text-xs font-mono uppercase tracking-wider ${t.labelMuted}`}>Account Balances</h3>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {Object.entries(userBalances[activeUser.id] || {}).map(([cur, bal]) => (
                    <div key={cur} className={`border p-2 sm:p-3 rounded-lg sm:rounded-xl flex flex-col items-center ${t.balanceCard}`}>
                      <span className={`text-[10px] sm:text-xs font-mono font-semibold ${t.textMuted}`}>{cur}</span>
                      <span className="text-xs sm:text-sm font-bold mt-1">
                        {bal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Transfer Form Panel */}
              <div className={`border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl ${t.card}`}>
                <h3 className="text-md font-bold mb-4 flex items-center gap-2 text-cyan-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-20c5.303 0 9.697 4.303 9.697 9.697 0 5.303-4.303 9.697-9.697 9.697C6.697 21.697 2.3 17.303 2.3 12 2.3 6.697 6.697 2.3 12 2.3z" />
                  </svg>
                  Transfer Funds
                </h3>

                <form onSubmit={handleTransfer} className="space-y-4">
                  <div>
                    <label className={`block text-xs font-mono mb-1 ${t.labelMuted}`}>Recipient</label>
                    <select
                      value={recipientId}
                      onChange={(e) => setRecipientId(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 font-medium ${t.input}`}
                    >
                      {PRESEEDED_USERS.filter((u) => u.id !== activeUser.id).map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className={`block text-xs font-mono mb-1 ${t.labelMuted}`}>Amount</label>
                      <input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="100.00"
                        className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono ${t.input}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-mono mb-1 ${t.labelMuted}`}>Currency</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono ${t.input}`}
                      >
                        <option value="JPY">JPY</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-mono mb-1 ${t.labelMuted}`}>Description</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 ${t.input}`}
                    />
                  </div>

                  {/* Idempotency Key Section */}
                  <div className={`p-3 rounded-xl border space-y-2 ${t.idempotency}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-mono ${t.textMuted}`}>IDEMPOTENCY KEY</span>
                      <button
                        type="button"
                        onClick={() => setIdempotencyKey(generateUuid())}
                        className="text-[10px] text-cyan-400 font-bold hover:underline cursor-pointer"
                      >
                        Regenerate
                      </button>
                    </div>
                    <div className={`text-[11px] font-mono break-all select-all font-semibold p-2 rounded border ${t.idempotencyVal}`}>
                      {idempotencyKey}
                    </div>
                  </div>

                  {/* Errors and Success feedback */}
                  {transferError && (
                    <div className="bg-rose-950/30 border border-rose-800 text-rose-300 rounded-xl p-3 text-xs flex gap-2 items-start font-mono">
                      <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div className="break-all">{transferError}</div>
                    </div>
                  )}

                  {transferSuccess && (
                    <div className="bg-emerald-950/30 border border-emerald-800 text-emerald-300 rounded-xl p-3 text-xs flex gap-2 items-start font-mono">
                      <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-bold text-emerald-400">Success!</p>
                        <p className="mt-1">ID: {transferSuccess.paymentId}</p>
                        <p>Status: {transferSuccess.status}</p>
                        <p>Key: {transferSuccess.idempotencyKey.substring(0, 8)}...</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isTransferring}
                      className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20 flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isTransferring ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                          <span>Send Payment</span>
                        </>
                      )}
                    </button>

                    {/* Retry button to trigger exact replay check */}
                    <button
                      type="button"
                      disabled={isTransferring || !idempotencyKey}
                      onClick={handleTransfer}
                      title="Sends the exact same payload again with the exact same Idempotency Key"
                      className={`px-3 py-2 border rounded-xl transition-colors text-xs font-mono font-bold cursor-pointer disabled:opacity-50 ${t.btnSecondary}`}
                    >
                      Replay
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Pane - Logs, Ledger & Abuse Simulator */}
            <div className="md:col-span-7 lg:col-span-8 xl:col-span-8 space-y-4 sm:space-y-6">

              {/* Tab Selector */}
              <div className={`flex border-b ${t.divider}`}>
                <button
                  onClick={() => setActiveTab('form')}
                  className={`px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'form' ? t.tabActive : t.tabInactive}`}
                >
                  Payment Activity List
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'logs' ? t.tabActive : t.tabInactive}`}
                >
                  Cryptographic Audit Chain ({auditLogs.length})
                </button>
              </div>

              {activeTab === 'form' ? (
                /* Payment Activity History list */
                <div className={`border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl ${t.card}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-bold">Payments History</h3>
                    <button
                      onClick={() => fetchData(activeUser.id, accessToken)}
                      className={`p-1.5 border rounded-lg transition-colors ${t.btnRefresh}`}
                      title="Sync data"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.213 6h-2.182" />
                      </svg>
                    </button>
                  </div>

                  {payments.length === 0 ? (
                    <div className={`text-center py-12 font-mono text-sm rounded-xl ${t.emptyState}`}>
                      No payments executed yet. Set up a transfer to start.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead>
                          <tr className={t.tableHead}>
                            <th className="py-3 px-2">Payment ID</th>
                            <th className="py-3 px-2">From/To</th>
                            <th className="py-3 px-2">Amount</th>
                            <th className="py-3 px-2">Status</th>
                            <th className="py-3 px-2">Date</th>
                          </tr>
                        </thead>
                        <tbody className={t.tableDivide}>
                          {payments.map((p) => (
                            <tr key={p.paymentId} className={t.tableHover}>
                              <td className={`py-3 px-2 font-bold ${t.textSub}`}>{p.paymentId}</td>
                              <td className="py-3 px-2">
                                <span className={p.senderId === activeUser.id ? t.labelMuted : 'text-emerald-400'}>
                                  {p.senderId === activeUser.id ? 'Outbound' : 'Inbound'}
                                </span>{' '}
                                <span className={`text-[10px] ${t.textMuted}`}>
                                  ({p.senderId === activeUser.id ? getUserName(p.recipientId) : getUserName(p.senderId)})
                                </span>
                              </td>
                              <td className={`py-3 px-2 font-bold ${t.textSub}`}>
                                {p.senderId === activeUser.id ? '-' : '+'}
                                {parseFloat(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} {p.currency}
                              </td>
                              <td className="py-3 px-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  p.status === 'COMPLETED'
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                                }`}>
                                  {p.status}
                                </span>
                              </td>
                              <td className={`py-3 px-2 ${t.textMuted}`}>{new Date(p.createdAt).toLocaleTimeString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                /* Cryptographic Log Chain visualizer */
                <div className={`border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 sm:space-y-6 ${t.card}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-md font-bold">Immutable Verification Ledger</h3>
                      <p className={`text-xs mt-0.5 ${t.labelMuted}`}>Logs are cryptographically linked using SHA-256 hash chaining.</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={runAuditVerification}
                        disabled={isVerifying}
                        className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isVerifying ? (
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span>Verify Hash Chain Integrity</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {auditLogs.length === 0 ? (
                    <div className={`text-center py-12 font-mono text-sm rounded-xl ${t.emptyState}`}>
                      No logs logged yet. Send a transaction to start the ledger.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {auditLogs.map((log, index) => {
                        const isTampered = tamperedLogIndex !== null && log.index === tamperedLogIndex;
                        return (
                          <div
                            key={log.logId || index}
                            className={`p-4 rounded-xl border font-mono text-xs transition-all relative ${
                              isTampered
                                ? 'bg-rose-950/20 border-rose-800 shadow-rose-950/30 shadow-lg'
                                : t.auditBlock
                            }`}
                          >
                            {/* Block Tag */}
                            <div className={`absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded font-bold border ${t.blockTag}`}>
                              BLOCK #{log.index !== undefined ? log.index : index}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <div className="space-y-1">
                                <p className={`text-[10px] ${t.textMuted}`}>EVENT TYPE</p>
                                <p className={`font-bold ${t.textSub}`}>{log.event}</p>
                              </div>
                              <div className="space-y-1">
                                <p className={`text-[10px] ${t.textMuted}`}>TX REFERENCE</p>
                                <p className="text-cyan-400 font-semibold">{log.paymentId || 'N/A'}</p>
                              </div>
                              <div className="space-y-1">
                                <p className={`text-[10px] ${t.textMuted}`}>ACTOR ID</p>
                                <p className={t.textSub}>{log.actor || 'SYSTEM'}</p>
                              </div>
                            </div>

                            <div className={`border-t my-3 pt-3 space-y-2 ${t.dividerMid}`}>
                              <div>
                                <p className={`text-[9px] font-bold ${t.textMuted}`}>PREVIOUS HASH</p>
                                <p className={`text-[11px] break-all select-all ${t.labelMuted}`}>{log.prevChecksum}</p>
                              </div>
                              <div>
                                <p className={`text-[9px] font-bold flex items-center gap-1 ${t.textMuted}`}>
                                  <span>CURRENT BLOCK HASH</span>
                                  {isTampered && (
                                    <span className="text-[9px] text-rose-400 font-bold animate-pulse">[TAMPERED / BREAK POINT]</span>
                                  )}
                                </p>
                                <p className={`text-[11px] break-all select-all font-bold ${isTampered ? 'text-rose-400' : 'text-emerald-400'}`}>
                                  {log.checksum}
                                </p>
                              </div>
                            </div>

                            {/* Verification Chain Link Arrow */}
                            {index < auditLogs.length - 1 && (
                              <div className="flex justify-center -mb-8 mt-4 relative z-10">
                                <div className={`p-1 border rounded-full shadow-md ${t.chainArrow}`}>
                                  <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Abuse Case & Security Attack Simulator Deck */}
              <div className={`border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 sm:space-y-6 relative overflow-hidden ${t.card}`}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/5 blur-3xl rounded-full"></div>

                <div>
                  <h3 className="text-md font-bold text-rose-400 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Abuse Case &amp; Attack Sandbox Deck
                  </h3>
                  <p className={`text-xs mt-0.5 ${t.labelMuted}`}>Toggle network/database injection attacks to verify fail-safe filters.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Network / MitM Attacks */}
                  <div className={`space-y-4 p-4 rounded-xl border ${t.subcard}`}>
                    <h4 className={`text-xs font-mono uppercase tracking-wider font-bold ${t.labelMuted}`}>1. Network Transit Tampering</h4>

                    <div className="space-y-3">
                      <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${t.subcardItem}`}>
                        <input
                          type="checkbox"
                          checked={simulateTamper}
                          onChange={(e) => setSimulateTamper(e.target.checked)}
                          className="mt-1 accent-cyan-500"
                        />
                        <div>
                          <p className="text-xs font-bold">MITM Payload Tampering</p>
                          <p className={`text-[10px] mt-0.5 ${t.textMuted}`}>Calculates valid signature, then multiplies payment amount by 10 before routing (triggers invalid signature rejection).</p>
                        </div>
                      </label>

                      <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${t.subcardItem}`}>
                        <input
                          type="checkbox"
                          checked={simulateBadSignature}
                          onChange={(e) => setSimulateBadSignature(e.target.checked)}
                          className="mt-1 accent-cyan-500"
                        />
                        <div>
                          <p className="text-xs font-bold">Force Bad Signature</p>
                          <p className={`text-[10px] mt-0.5 ${t.textMuted}`}>Overrides calculated signature header with a bad mock string (triggers signature matching filter failure).</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Log Database Tampering */}
                  <div className={`space-y-4 p-4 rounded-xl border flex flex-col justify-between ${t.subcard}`}>
                    <div>
                      <h4 className={`text-xs font-mono uppercase tracking-wider font-bold mb-3 ${t.labelMuted}`}>2. Database Log Corruption</h4>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <label className={`block text-[9px] font-mono mb-1 ${t.textMuted}`}>LOG INDEX</label>
                          <input
                            type="number"
                            value={tamperIndexInput}
                            onChange={(e) => setTamperIndexInput(e.target.value)}
                            className={`w-full border rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-rose-500 ${t.inputTamper}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[9px] font-mono mb-1 ${t.textMuted}`}>NEW AMOUNT</label>
                          <input
                            type="text"
                            value={tamperAmountInput}
                            onChange={(e) => setTamperAmountInput(e.target.value)}
                            className={`w-full border rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-rose-500 ${t.inputTamper}`}
                          />
                        </div>
                      </div>
                      <p className={`text-[10px] ${t.textMuted}`}>Directly modifies a saved log entry in the NestJS in-memory array. Recalculating audit hashes will immediately flag the index.</p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={triggerLogTampering}
                        disabled={isTampering}
                        className="w-full bg-rose-950 hover:bg-rose-900 text-rose-300 font-bold border border-rose-800 py-2 px-3 rounded-lg text-xs transition-all flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isTampering ? (
                          <span className="w-3.5 h-3.5 border-2 border-rose-300 border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-16v1a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3h-4a3 3 0 00-3-3H9z" />
                            </svg>
                            <span>Corrupt Database Record</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Abuse result alert */}
                {tamperResult && (
                  <div className="bg-[#1c1218] border border-rose-950 text-rose-300 rounded-xl p-3 text-xs font-mono flex gap-2 items-center">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{tamperResult}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
