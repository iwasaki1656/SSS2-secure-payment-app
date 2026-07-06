'use client';

import React, { useState, useEffect } from 'react';

// Pre-seeded users in our Fintech prototype system (IDs must match backend database.service.ts)
const PRESEEDED_USERS = [
  { id: 'alice_id', email: 'alice@example.com', username: 'alice_vance', name: 'Alice Vance', initialBalance: { USD: 5000, JPY: 100000, EUR: 4000 } },
  { id: 'bob_id', email: 'bob@example.com', username: 'bob_vance', name: 'Bob Vance', initialBalance: { USD: 1500, JPY: 50000, EUR: 1200 } },
];

// Password strength validation (mirrors backend rule)
function validatePassword(pw: string): string | null {
  if (pw.length < 12) return 'Password must be at least 12 characters.';
  if (!/[a-zA-Z]/.test(pw)) return 'Password must include at least one letter.';
  if (!/\d/.test(pw)) return 'Password must include at least one number.';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pw)) return 'Password must include at least one special character.';
  return null;
}

// Rudimentary fake domain check (mirrors backend blocklist)
const BLOCKED_DOMAINS = ['mailinator.com','guerrillamail.com','tempmail.com','yopmail.com','trashmail.com','fakeinbox.com','maildrop.cc','discard.email','spambox.us'];
function isFakeDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? BLOCKED_DOMAINS.includes(domain) : false;
}


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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    } else {
      setIsDark(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const newVal = !prev;
      localStorage.setItem('theme', newVal ? 'dark' : 'light');
      return newVal;
    });
  };

  // All theme-sensitive Tailwind classes in one place
  const t = isDark ? {
    page: 'bg-[#0a0f1d] text-zinc-100',
    header: 'bg-[#0e1629]/80 border-zinc-800',
    card: 'bg-[#0e1629] border-zinc-800',
    cardInner: 'bg-zinc-900 border-zinc-800',
    subcard: 'bg-zinc-900/40 border-zinc-800',
    subcardItem: 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700',
    input: 'bg-zinc-900 border-zinc-800 text-zinc-100',
    inputLogin: 'bg-[#16223f] border-zinc-700 text-zinc-100 placeholder:text-zinc-600',
    inputPassword: 'bg-[#121c33] border-zinc-800 text-zinc-500 placeholder:text-zinc-700',
    inputTamper: 'bg-zinc-950 border-zinc-800 text-zinc-200',
    inputCode: 'bg-[#070b14] border-zinc-800 text-zinc-400',
    labelMuted: 'text-zinc-400',
    textMuted: 'text-zinc-500',
    textSub: 'text-zinc-300',
    textNormal: 'text-zinc-100',
    divider: 'border-zinc-800',
    dividerMid: 'border-zinc-800/80',
    btnSecondary: 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-400 hover:text-zinc-200',
    btnLogout: 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-400 hover:text-zinc-100',
    btnRefresh: 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100',
    tableHover: 'hover:bg-zinc-900/40',
    tableHead: 'border-b border-zinc-800 text-zinc-500',
    tableDivide: 'divide-y divide-zinc-800',
    emptyState: 'border-2 border-dashed border-zinc-800 text-zinc-500',
    balanceCard: 'bg-zinc-900 border-zinc-800',
    idempotency: 'bg-zinc-950/60 border-zinc-800',
    idempotencyVal: 'bg-[#070b14] border-zinc-800 text-zinc-400',
    auditBlock: 'bg-zinc-900/60 border-zinc-800',
    blockTag: 'bg-zinc-800 border-zinc-700 text-zinc-500',
    chainArrow: 'bg-[#0a0f1d] border-zinc-800 text-zinc-600',
    badge: 'bg-zinc-800 border-zinc-700 text-zinc-400',
    tabActive: 'border-cyan-500 text-cyan-400 bg-cyan-950/10',
    tabInactive: 'border-transparent text-zinc-400 hover:text-zinc-200',
    avatar: 'bg-cyan-950 border-cyan-800 text-cyan-400',
    toggleBtn: 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white',
    successMsg: 'bg-emerald-950/30 border-emerald-800 text-emerald-300',
    successTitle: 'text-emerald-400',
    errorMsg: 'bg-rose-950/40 border-rose-800 text-rose-300',
    errorBlock: 'bg-rose-950/20 border-rose-800 shadow-rose-950/30 shadow-lg',
    errorHash: 'text-rose-500',
    hashText: 'text-zinc-500',
  } : {
    page: 'bg-slate-100 text-slate-900',
    header: 'bg-white/95 border-slate-200',
    card: 'bg-white border-slate-200 shadow-sm',
    cardInner: 'bg-slate-50 border-slate-200',
    subcard: 'bg-slate-50 border-slate-200',
    subcardItem: 'bg-white border-slate-200 hover:border-slate-300',
    input: 'bg-white border-slate-300 text-slate-900',
    inputLogin: 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400',
    inputPassword: 'bg-slate-50 border-slate-200 text-slate-400 placeholder:text-slate-400',
    inputTamper: 'bg-white border-slate-300 text-slate-800',
    inputCode: 'bg-slate-100 border-slate-200 text-slate-500',
    labelMuted: 'text-slate-500',
    textMuted: 'text-slate-400',
    textSub: 'text-slate-700',
    textNormal: 'text-slate-900',
    divider: 'border-slate-200',
    dividerMid: 'border-slate-200',
    btnSecondary: 'bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-600 hover:text-slate-900',
    btnLogout: 'bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-500 hover:text-slate-800',
    btnRefresh: 'bg-white border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-slate-900',
    tableHover: 'hover:bg-slate-50',
    tableHead: 'border-b border-slate-200 text-slate-500',
    tableDivide: 'divide-y divide-slate-200',
    emptyState: 'border-2 border-dashed border-slate-200 text-slate-400',
    balanceCard: 'bg-slate-50 border-slate-200',
    idempotency: 'bg-slate-50 border-slate-200',
    idempotencyVal: 'bg-slate-100 border-slate-200 text-slate-500',
    auditBlock: 'bg-white border-slate-200',
    blockTag: 'bg-slate-100 border-slate-200 text-slate-500',
    chainArrow: 'bg-slate-100 border-slate-200 text-slate-400',
    badge: 'bg-white border-slate-300 text-slate-600 shadow-sm',
    tabActive: 'border-cyan-500 text-cyan-600 bg-cyan-50',
    tabInactive: 'border-transparent text-slate-500 hover:text-slate-800',
    avatar: 'bg-sky-100 border-sky-300 text-sky-600',
    toggleBtn: 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900',
    successMsg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    successTitle: 'text-emerald-600',
    errorMsg: 'bg-rose-50 border-rose-200 text-rose-700',
    errorBlock: 'bg-rose-50 border-rose-300 shadow-rose-200/50 shadow-lg',
    errorHash: 'text-rose-600',
    hashText: 'text-slate-500',
  };

  // ─── Authentication & Session ─────────────────────────────────────────────
  const [activeUser, setActiveUser] = useState<any>(null);
  // Security: JWT is stored in an HttpOnly cookie managed server-side. It is
  // never exposed to client-side JS — no accessToken state needed here.
  // Security: CSRF token is stored in JS state (read from the csrfToken cookie after login)
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Login portal selection: null = selection screen, 'USER' = user login, 'ADMIN' = staff login
  const [loginPortalMode, setLoginPortalMode] = useState<'USER' | 'ADMIN' | null>(null);

  // Admin Dashboard state
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminTransactions, setAdminTransactions] = useState<any[]>([]);
  const [adminTab, setAdminTab] = useState<'users' | 'transactions'>('users');
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
  const [adminActionMsg, setAdminActionMsg] = useState<string | null>(null);

  // Sign Up state
  const [showSignUp, setShowSignUp] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupTransactionPin, setSignupTransactionPin] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupPasswordStrength, setSignupPasswordStrength] = useState<string | null>(null);

  // Profile state
  const [activeView, setActiveView] = useState<'dashboard' | 'profile'>('dashboard');
  const [profileUsername, setProfileUsername] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileTransactionPin, setProfileTransactionPin] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // Balances & Dynamic Calculations
  const [userBalances, setUserBalances] = useState<Record<string, Record<string, number>>>({});

  // Payments & Audit state
  const [payments, setPayments] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [ledgerVerified, setLedgerVerified] = useState<boolean | null>(null);
  const [tamperedLogIndex, setTamperedLogIndex] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'logs' | 'admin'>('form');

  // Transfer Form state — recipientQuery is free-text (email, username, or ID)
  const [recipientQuery, setRecipientQuery] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('JPY');
  const [description, setDescription] = useState('');
  const [transferPin, setTransferPin] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState<any>(null);

  // Security: 2FA Email Verification state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationSuccess, setVerificationSuccess] = useState<string | null>(null);

  // Attack Simulator state
  const [simulateTamper, setSimulateTamper] = useState(false);
  const [simulateBadSignature, setSimulateBadSignature] = useState(false);
  const [tamperIndexInput, setTamperIndexInput] = useState('0');
  const [tamperAmountInput, setTamperAmountInput] = useState('99999.00');
  const [isTampering, setIsTampering] = useState(false);
  const [tamperResult, setTamperResult] = useState<string | null>(null);

  // Generate initial idempotency key on load
  useEffect(() => {
    setIdempotencyKey(generateUuid());
  }, []);

  // Security: Idle Inactivity Timeout — auto-logout after 5 minutes of no activity
  useEffect(() => {
    if (!activeUser) return; // Only active when logged in
    const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
    let idleTimer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(async () => {
        await fetch('/api/v1/auth/logout', { method: 'POST' });
        setActiveUser(null); setPayments([]); setAuditLogs([]);
        setLedgerVerified(null); setTamperedLogIndex(null);
        setActiveView('dashboard'); setProfileError(null); setProfileSuccess(null);
        alert('You have been automatically logged out due to 5 minutes of inactivity.');
      }, IDLE_TIMEOUT_MS);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer(); // Start the timer immediately

    return () => {
      clearTimeout(idleTimer);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [activeUser]);

  // Reset recipientQuery when user logs in/out
  useEffect(() => {
    if (!activeUser) return;
    // Populate profile form fields
    setProfileUsername(activeUser.username || '');
    setProfileEmail(activeUser.email || '');
    setProfilePicture(activeUser.profilePicture || null);
  }, [activeUser]);

  // Set default initial balances on start (used as fallback before login)
  useEffect(() => {
    const balances: Record<string, Record<string, number>> = {};
    PRESEEDED_USERS.forEach((u) => {
      balances[u.id] = { ...u.initialBalance };
    });
    setUserBalances(balances);
  }, []);

  // Update dynamic balances — seed from backend balance data, then apply payment history
  const updateBalances = (paymentList: any[], allUsersFromBackend?: any[], currentActiveUser?: any) => {
    const balances: Record<string, Record<string, number>> = {};
    // Use backend balance data if available (authoritative source)
    if (allUsersFromBackend && allUsersFromBackend.length > 0) {
      allUsersFromBackend.forEach((u: any) => {
        if (u.balance) balances[u.id] = { ...u.balance };
      });
    } else {
      // Fallback: re-compute from static seed + payment history
      PRESEEDED_USERS.forEach((u) => {
        balances[u.id] = { ...u.initialBalance };
      });
      // Ensure newly signed-up users (not in PRESEEDED_USERS) have their seed balance initialized
      const userToSeed = currentActiveUser || activeUser;
      if (userToSeed && !balances[userToSeed.id] && userToSeed.balance) {
        balances[userToSeed.id] = { ...userToSeed.balance };
      }
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
    }
    setUserBalances(balances);
  };

  // Fetch payments list and audit logs
  // Security: No token needed here — the HttpOnly cookie is automatically
  // attached by the browser and extracted server-side by the Next.js proxy routes.
  const fetchData = async (userId: string, currentActiveUser?: any) => {
    try {
      // Fetch payments
      const payRes = await fetch(`/api/v1/payments?userId=${userId}&page=1&limit=50`);
      const payData = await payRes.json();
      if (payData.success) {
        setPayments(payData.data.payments || []);
        updateBalances(payData.data.payments || [], undefined, currentActiveUser);
      }
      // Fetch audit logs
      const auditRes = await fetch('/api/v1/audit/logs?page=1&limit=50');
      const auditData = await auditRes.json();
      if (auditData.success) setAuditLogs(auditData.data.logs || []);
    } catch (e: any) {
      console.error('Error fetching data:', e);
    }
  };

  // Admin: Fetch all users and all transactions
  const fetchAdminData = async () => {
    setIsLoadingAdmin(true);
    try {
      const [usersRes, txRes] = await Promise.all([
        fetch('/api/v1/admin/users'),
        fetch('/api/v1/admin/transactions'),
      ]);
      const usersData = await usersRes.json();
      const txData = await txRes.json();
      if (usersData.success) setAdminUsers(usersData.data.users || []);
      if (txData.success) setAdminTransactions(txData.data.transactions || []);
    } catch (e: any) {
      console.error('Admin fetch error:', e);
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  // Admin: Update a user's status
  const handleUpdateUserStatus = async (userId: string, status: 'ACTIVE' | 'BANNED' | 'LIMITED') => {
    setAdminActionMsg(null);
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminActionMsg(`User status updated to ${status}`);
        await fetchAdminData();
      } else {
        setAdminActionMsg(`Error: ${data.error?.message || 'Failed to update'}`);
      }
    } catch (e: any) {
      setAdminActionMsg(`Network error: ${e.message}`);
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
      const endpoint = loginPortalMode === 'ADMIN' ? '/api/v1/auth/admin-login' : '/api/v1/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (data.success) {
        const user = data.data.user;
        setActiveUser(user);
        // Security: Store the Anti-CSRF token returned by the login endpoint
        if (data.data.csrfToken) setCsrfToken(data.data.csrfToken);
        // Seed this user's balance from backend data immediately
        if (user.balance) {
          setUserBalances((prev) => ({ ...prev, [user.id]: { ...user.balance } }));
        }
        // Security: Token is now in an HttpOnly cookie — no need to store it in state
        await fetchData(user.id, user);
        // If admin, pre-load admin dashboard data
        if (user.role === 'ADMIN') {
          fetchAdminData();
          runAuditVerification(true);
          setActiveTab('admin');
        }
      } else {
        setLoginError(data.error?.message || 'Invalid credentials');
      }
    } catch (err: any) {
      setLoginError(`Network error: ${err.message}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle new user sign-up
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    // Client-side validation
    if (isFakeDomain(signupEmail)) {
      setSignupError('This email domain is not accepted. Please use a real email address.');
      return;
    }
    const pwError = validatePassword(signupPassword);
    if (pwError) { setSignupError(pwError); return; }
    if (signupPassword !== signupConfirmPassword) {
      setSignupError('Passwords do not match.');
      return;
    }

    setIsSigningUp(true);
    try {
      const res = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupEmail, username: signupUsername, password: signupPassword, transactionPin: signupTransactionPin || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        const user = data.data.user;
        setActiveUser(user);
        // Security: Store the Anti-CSRF token from the signup response
        if (data.data.csrfToken) setCsrfToken(data.data.csrfToken);
        if (user.balance) {
          setUserBalances((prev) => ({ ...prev, [user.id]: { ...user.balance } }));
        }
        await fetchData(user.id, user);
        // Reset signup form
        setSignupEmail(''); setSignupUsername(''); setSignupPassword(''); setSignupConfirmPassword(''); setSignupTransactionPin('');
        setShowSignUp(false);
      } else {
        setSignupError(data.error?.message || 'Signup failed. Please try again.');
      }
    } catch (err: any) {
      setSignupError(`Network error: ${err.message}`);
    } finally {
      setIsSigningUp(false);
    }
  };

  // Handle profile picture file selection
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setProfileError('Image must be under 2MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => setProfilePicture(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    // Validate password only if provided
    if (profilePassword) {
      const pwError = validatePassword(profilePassword);
      if (pwError) { setProfileError(pwError); return; }
    }

    setIsUpdatingProfile(true);
    try {
      const body: any = {};
      if (profileEmail !== activeUser?.email) body.email = profileEmail;
      if (profileUsername !== activeUser?.username) body.username = profileUsername;
      if (profilePassword) body.password = profilePassword;
      if (profilePicture !== activeUser?.profilePicture) body.profilePicture = profilePicture;
      if (profileTransactionPin) body.transactionPin = profileTransactionPin;

      if (Object.keys(body).length === 0) { setProfileError('No changes to save.'); setIsUpdatingProfile(false); return; }

      const res = await fetch('/api/v1/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Security: CSRF double-submit cookie pattern
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setActiveUser((prev: any) => ({ ...prev, ...data.data.user }));
        setProfilePassword('');
        setProfileTransactionPin('');
        setProfileSuccess('Profile updated successfully!');
      } else {
        setProfileError(data.error?.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      setProfileError(`Network error: ${err.message}`);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Security: 2FA — Step 1: Validate form, request verification code, show modal
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) { setTransferError('Validation Error: Amount must be greater than 0'); return; }
    if (!recipientQuery.trim()) { setTransferError('Validation Error: Please enter a recipient email, username, or ID'); return; }
    // Check if recipient resolves to self
    const selfUser = PRESEEDED_USERS.find((u) => u.id === activeUser.id);
    const querySelf = recipientQuery.trim() === activeUser.id || recipientQuery.trim() === activeUser.email || recipientQuery.trim() === (activeUser.username || selfUser?.username);
    if (querySelf) { setTransferError('Validation Error: Cannot transfer money to yourself'); return; }
    // Client-side balance pre-check (authoritative check is on the backend)
    const activeBalance = activeUser.balance?.[currency] ?? 0;
    if (numAmount > activeBalance) { setTransferError(`Validation Error: Insufficient balance. You have ${activeBalance.toLocaleString(undefined, {minimumFractionDigits: 2})} ${currency}`); return; }

    // Request 2FA verification code
    setIsRequestingCode(true);
    setTransferError(null);
    setTransferSuccess(null);
    try {
      const res = await fetch('/api/v1/payments/transfer/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: activeUser.id }),
      });
      const data = await res.json();
      if (data.success && data.data?.verificationId) {
        setVerificationId(data.data.verificationId);
        setVerificationCode('');
        setVerificationError(null);
        setVerificationSuccess(null);
        setRemainingAttempts(3);
        setShowVerificationModal(true);
        // Start resend cooldown (30 seconds)
        setResendCooldown(30);
      } else {
        setTransferError(`[${data.error?.code || 'ERROR'}] ${data.error?.message || 'Failed to send verification code'}`);
      }
    } catch (err: any) {
      setTransferError(`Network error: ${err.message}`);
    } finally {
      setIsRequestingCode(false);
    }
  };

  // Security: 2FA — Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Security: 2FA — Resend verification code
  const handleResendCode = async () => {
    if (!verificationId || resendCooldown > 0) return;
    setIsResendingCode(true);
    setVerificationError(null);
    setVerificationSuccess(null);
    try {
      const res = await fetch('/api/v1/payments/transfer/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationId }),
      });
      const data = await res.json();
      if (data.success) {
        setVerificationCode('');
        setVerificationSuccess('新しい認証コードを送信しました / New code sent');
        setResendCooldown(30);
      } else {
        // If session expired or max attempts, close modal
        if (data.error?.code === 'SESSION_NOT_FOUND' || data.error?.code === 'MAX_ATTEMPTS_EXCEEDED') {
          setShowVerificationModal(false);
          setTransferError(`[${data.error.code}] ${data.error.message}`);
        } else {
          setVerificationError(data.error?.message || 'Failed to resend code');
        }
      }
    } catch (err: any) {
      setVerificationError(`Network error: ${err.message}`);
    } finally {
      setIsResendingCode(false);
    }
  };

  // Security: 2FA — Step 2: Verify code and execute transfer
  const handleVerifyAndTransfer = async () => {
    if (!activeUser || !verificationId || verificationCode.length !== 6) return;
    const numAmount = parseFloat(amount);

    setIsTransferring(true);
    setVerificationError(null);
    setVerificationSuccess(null);
    try {
      const res = await fetch('/api/v1/payments/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Authorization is handled server-side via HttpOnly cookie — not sent from client
          // Security: CSRF double-submit cookie pattern
          'X-CSRF-Token': csrfToken,
          'X-Idempotency-Key': idempotencyKey,
          'X-Simulate-Tamper': simulateTamper ? 'true' : 'false',
          'X-Simulate-Bad-Signature': simulateBadSignature ? 'true' : 'false'
        },
        body: JSON.stringify({
          senderId: activeUser.id,
          recipientId: recipientQuery.trim(),
          amount: parseFloat(amount).toFixed(2),
          currency,
          description,
          transactionPin: transferPin || undefined,
          verificationId,
          verificationCode,
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowVerificationModal(false);
        setTransferSuccess(data.data);
        setTransferPin('');
        setVerificationId(null);
        setVerificationCode('');
        setActiveUser((prev: any) => ({
          ...prev,
          balance: {
            ...prev.balance,
            [currency]: (prev.balance[currency] || 0) - numAmount
          }
        }));
        await fetchData(activeUser.id, activeUser);
        setIdempotencyKey(generateUuid());
      } else {
        // Handle verification-specific errors
        if (data.error?.code === 'INVALID_VERIFICATION_CODE') {
          const remaining = data.error?.remainingAttempts ?? (remainingAttempts - 1);
          setRemainingAttempts(remaining);
          if (remaining <= 0) {
            setShowVerificationModal(false);
            setTransferError(`[${data.error.code}] ${data.error.message}`);
          } else {
            setVerificationError(`認証コードが正しくありません。残り${remaining}回 / Incorrect code. ${remaining} attempt(s) remaining.`);
          }
        } else if (data.error?.code === 'VERIFICATION_EXPIRED' || data.error?.code === 'MAX_ATTEMPTS_EXCEEDED' || data.error?.code === 'VERIFICATION_SESSION_NOT_FOUND') {
          setShowVerificationModal(false);
          setTransferError(`[${data.error.code}] ${data.error.message}`);
        } else {
          setShowVerificationModal(false);
          setTransferError(`[${data.error?.code || 'ERROR'}] ${data.error?.message || 'Transfer failed'}`);
        }
      }
    } catch (err: any) {
      setVerificationError(`Network error: ${err.message}`);
    } finally {
      setIsTransferring(false);
    }
  };

  // Execute cryptographic ledger integrity audit
  const runAuditVerification = async (force: boolean = false) => {
    if (!activeUser && !force) return;
    setIsVerifying(true);
    setLedgerVerified(null);
    setTamperedLogIndex(null);
    try {
      const res = await fetch('/api/v1/audit/verify', {
        method: 'POST',
        // Authorization handled server-side via HttpOnly cookie
      });
      const data = await res.json();
      if (data.success) {
        setLedgerVerified(data.data.verified);
        if (!data.data.verified && data.data.tamperedIndex !== undefined) setTamperedLogIndex(data.data.tamperedIndex);
      }
    } catch (err) { console.error(err); } finally { setIsVerifying(false); }
  };

  // Simulate internal database log tampering
  const triggerLogTampering = async () => {
    if (!activeUser) return;
    setIsTampering(true);
    setTamperResult(null);
    try {
      const res = await fetch('/api/v1/audit/tamper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Authorization handled server-side via HttpOnly cookie
        body: JSON.stringify({ index: isNaN(parseInt(tamperIndexInput, 10)) ? 1 : parseInt(tamperIndexInput, 10), amount: parseFloat(tamperAmountInput).toFixed(2) })
      });
      const data = await res.json();
      if (data.success) {
        setTamperResult('Ledger value corrupted successfully! Run Verification Audit to check.');
        await fetchData(activeUser.id, activeUser);
      } else {
        setTamperResult(`Failed: ${data.error?.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      setTamperResult(`Network error: ${err.message}`);
    } finally { setIsTampering(false); }
  };

  const handleLogout = async () => {
    // Security: Call the server-side logout route to clear the HttpOnly cookie.
    // Client-side JS cannot delete an HttpOnly cookie directly.
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    setActiveUser(null); setPayments([]); setAuditLogs([]);
    setLedgerVerified(null); setTamperedLogIndex(null);
    setActiveView('dashboard'); setProfileError(null); setProfileSuccess(null);
    setLoginPortalMode(null); setAdminUsers([]); setAdminTransactions([]);
    setActiveTab('form'); setAdminActionMsg(null);
  };

  const getUserName = (id: string) => {
    // Check pre-seeded list first, then fall back to id
    const preseeded = PRESEEDED_USERS.find((u) => u.id === id);
    if (preseeded) return preseeded.name;
    // For dynamic users, use the activeUser data if it matches
    if (activeUser && activeUser.id === id) return activeUser.username || activeUser.email || id;
    return id;
  };

  if (!mounted) {
    return null; // Prevents the initial dark mode flash (hydration mismatch) on reload
  }

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
              onClick={toggleTheme}
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
            {activeUser && (
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
        {!activeUser ? (
          /* Authentication Screen */
          <div className={`w-full max-w-sm sm:max-w-md mx-auto my-6 sm:my-12 border rounded-2xl p-5 sm:p-8 shadow-2xl relative overflow-hidden ${t.card}`}>
            {/* Background Glow */}
            <div className="absolute -top-16 -left-16 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>

            {/* ─── PORTAL SELECTION SCREEN ─── */}
            {loginPortalMode === null && !showSignUp ? (
              <div className="relative">
                <div className="text-center mb-8">
                  <div className={`inline-flex p-3 rounded-2xl border mb-4 ${t.avatar}`}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold">Log in to AegisPay</h2>
                  <p className={`text-sm mt-1 ${t.labelMuted}`}>Choose how you log in to your account.</p>
                </div>

                <div className="space-y-3">
                  {/* Staff Login button */}
                  <button
                    id="staff-login-btn"
                    onClick={() => setLoginPortalMode('ADMIN')}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all cursor-pointer group hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/10 ${isDark ? 'bg-violet-950/20 border-violet-800 text-violet-300 hover:bg-violet-950/40' : 'bg-violet-50 border-violet-300 text-violet-700 hover:bg-violet-100'}`}
                  >
                    <span className={`p-2 rounded-xl border transition-colors ${isDark ? 'bg-violet-900/50 border-violet-700 group-hover:bg-violet-800/60' : 'bg-violet-100 border-violet-300 group-hover:bg-violet-200'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </span>
                    <div className="text-left">
                      <p className="font-bold text-sm">Staff Login</p>
                      <p className={`text-xs ${isDark ? 'text-violet-400' : 'text-violet-500'}`}>Admin portal with full system access</p>
                    </div>
                    <svg className="w-4 h-4 ml-auto opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* User Login button */}
                  <button
                    id="user-login-btn"
                    onClick={() => setLoginPortalMode('USER')}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all cursor-pointer group hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/10 ${isDark ? 'bg-cyan-950/20 border-cyan-800 text-cyan-300 hover:bg-cyan-950/40' : 'bg-cyan-50 border-cyan-300 text-cyan-700 hover:bg-cyan-100'}`}
                  >
                    <span className={`p-2 rounded-xl border transition-colors ${isDark ? 'bg-cyan-900/50 border-cyan-700 group-hover:bg-cyan-800/60' : 'bg-cyan-100 border-cyan-300 group-hover:bg-cyan-200'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    <div className="text-left">
                      <p className="font-bold text-sm">User Login</p>
                      <p className={`text-xs ${isDark ? 'text-cyan-400' : 'text-cyan-500'}`}>Access your account and transfers</p>
                    </div>
                    <svg className="w-4 h-4 ml-auto opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className={`text-center mt-8 pt-6 border-t ${t.divider}`}>
                  <p className={`text-sm ${t.labelMuted}`}>
                    Don&apos;t have an account yet?{' '}
                    <button
                      id="goto-signup-link"
                      onClick={() => { setShowSignUp(true); setLoginPortalMode('USER'); }}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 cursor-pointer transition-colors"
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              /* ─── LOGIN / SIGNUP FORMS ─── */
              <>
                {/* Back button */}
                {!showSignUp && (
                  <button
                    onClick={() => { setLoginPortalMode(null); setLoginError(null); }}
                    className={`flex items-center gap-1.5 text-xs font-mono mb-5 cursor-pointer transition-colors ${t.labelMuted} hover:text-cyan-400`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to login selection
                  </button>
                )}

                <div className="text-center mb-6 relative">
                  <div className={`inline-flex p-3 rounded-2xl border mb-4 ${loginPortalMode === 'ADMIN' ? (isDark ? 'bg-violet-950/40 border-violet-800 text-violet-400' : 'bg-violet-100 border-violet-300 text-violet-600') : t.avatar}`}>
                    {loginPortalMode === 'ADMIN' ? (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold">
                    {showSignUp ? 'Create Account' : (loginPortalMode === 'ADMIN' ? 'Staff Login' : 'User Login')}
                  </h2>
                  <p className={`text-sm mt-1 ${t.labelMuted}`}>
                    {showSignUp ? 'Register a new AegisPay account' : (loginPortalMode === 'ADMIN' ? 'Sign in to the admin portal' : 'Sign in to initiate a secure session')}
                  </p>
                  {loginPortalMode === 'ADMIN' && !showSignUp && (
                    <span className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${isDark ? 'bg-violet-950/40 border-violet-800 text-violet-400' : 'bg-violet-50 border-violet-300 text-violet-600'}`}>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                      Staff Portal
                    </span>
                  )}
                </div>

                {/* Tab Toggle (only shown for USER portal) */}
                {loginPortalMode === 'USER' && (
                  <div className={`flex rounded-xl border p-1 mb-6 gap-1 ${t.cardInner}`}>
                    <button id="login-tab" onClick={() => { setShowSignUp(false); setSignupError(null); setLoginError(null); }} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${!showSignUp ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : t.labelMuted}`}>Sign In</button>
                    <button id="signup-tab" onClick={() => { setShowSignUp(true); setLoginError(null); setSignupError(null); }} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${showSignUp ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : t.labelMuted}`}>Sign Up</button>
                  </div>
                )}
              </>
            )}

            {(loginPortalMode !== null || showSignUp) && (!showSignUp ? (
              /* ─── LOGIN FORM ─── */
              <form onSubmit={handleLogin} className="space-y-5 relative">
                <div>
                  <label className={`block text-xs font-mono uppercase tracking-wider mb-2 ${t.labelMuted}`}>Email Address</label>
                  <input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium ${t.inputLogin}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-mono uppercase tracking-wider mb-2 ${t.labelMuted}`}>Password</label>
                  <input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-mono text-sm ${t.inputLogin}`}
                  />
                  <span className={`text-[10px] font-mono mt-1 block ${t.textMuted}`}>Authentication uses cryptographically signed tokens.</span>
                </div>
                {loginError && (
                  <div className={`rounded-xl p-3 text-sm flex gap-2 items-center border ${t.errorMsg}`}>
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <span>{loginError}</span>
                  </div>
                )}
                <button id="login-submit-btn" type="submit" disabled={isLoggingIn} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-cyan-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer">
                  {isLoggingIn ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : (<><span>Initialize Session</span><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></>)}
                </button>
              </form>
            ) : (
              /* ─── SIGN UP FORM ─── */
              <form onSubmit={handleSignup} className="space-y-4 relative">
                <div>
                  <label className={`block text-xs font-mono uppercase tracking-wider mb-2 ${t.labelMuted}`}>Email Address</label>
                  <input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${t.inputLogin}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-mono uppercase tracking-wider mb-2 ${t.labelMuted}`}>Username</label>
                  <input
                    id="signup-username"
                    type="text"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    placeholder="your_username"
                    required
                    className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${t.inputLogin}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-mono uppercase tracking-wider mb-2 ${t.labelMuted}`}>Password</label>
                  <input
                    id="signup-password"
                    type="password"
                    value={signupPassword}
                    onChange={(e) => { setSignupPassword(e.target.value); setSignupPasswordStrength(validatePassword(e.target.value)); }}
                    placeholder="Min 12 chars, letters + numbers + symbols"
                    required
                    className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-mono text-sm ${t.inputLogin}`}
                  />
                  {/* Live password strength feedback */}
                  {signupPassword && (
                    <div className={`mt-2 flex items-center gap-2 text-xs font-mono ${signupPasswordStrength ? 'text-amber-400' : 'text-emerald-400'}`}>
                      <span>{signupPasswordStrength ? `⚠️ ${signupPasswordStrength}` : '✅ Strong password'}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className={`block text-xs font-mono uppercase tracking-wider mb-2 ${t.labelMuted}`}>Confirm Password</label>
                  <input
                    id="signup-confirm-password"
                    type="password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-mono text-sm ${t.inputLogin} ${signupConfirmPassword && signupPassword !== signupConfirmPassword ? '!border-rose-600' : ''}`}
                  />
                  {signupConfirmPassword && signupPassword !== signupConfirmPassword && (
                    <span className="text-rose-400 text-xs font-mono mt-1 block">Passwords do not match</span>
                  )}
                </div>
                <div>
                  <label className={`block text-xs font-mono uppercase tracking-wider mb-2 ${t.labelMuted}`}>
                    Transaction PIN <span className={`normal-case font-normal ${t.textMuted}`}>(Optional — 4 digits)</span>
                  </label>
                  <input
                    id="signup-transaction-pin"
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={signupTransactionPin}
                    onChange={(e) => setSignupTransactionPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="e.g. 1234"
                    className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-mono text-sm tracking-widest ${t.inputLogin}`}
                  />
                  <span className={`text-[10px] font-mono mt-1 block ${t.textMuted}`}>If set, this PIN will be required to authorize every transfer.</span>
                </div>
                {signupError && (
                  <div className={`rounded-xl p-3 text-sm flex gap-2 items-center border ${t.errorMsg}`}>
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <span>{signupError}</span>
                  </div>
                )}
                <button id="signup-submit-btn" type="submit" disabled={isSigningUp} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-cyan-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer">
                  {isSigningUp ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : (<><span>Create Secure Account</span><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg></>)}
                </button>
              </form>
            ))}

            {/* Signup back link */}
            {showSignUp && (
              <p className={`text-center text-sm mt-4 ${t.labelMuted}`}>
                Already have an account?{' '}
                <button onClick={() => { setShowSignUp(false); setSignupError(null); }} className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 cursor-pointer">Sign in</button>
              </p>
            )}
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
                    {/* Profile picture or avatar initial */}
                    {profilePicture || activeUser.profilePicture ? (
                      <img src={profilePicture || activeUser.profilePicture} alt="Profile" className={`w-10 h-10 rounded-full border object-cover ${t.avatar}`} />
                    ) : (
                      <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold ${t.avatar}`}>
                        {(activeUser.username || activeUser.email || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-sm">{activeUser.username || getUserName(activeUser.id)}</h3>
                      <p className={`text-xs font-mono ${t.labelMuted}`}>{activeUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      id="profile-nav-btn"
                      onClick={() => setActiveView(activeView === 'profile' ? 'dashboard' : 'profile')}
                      title="Edit Profile"
                      className={`p-1.5 border rounded-lg transition-colors text-xs font-mono cursor-pointer ${activeView === 'profile' ? 'bg-cyan-500 border-cyan-400 text-white' : t.btnSecondary}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </button>
                    <button
                      onClick={handleLogout}
                      className={`p-1.5 border rounded-lg transition-colors text-xs font-mono cursor-pointer ${t.btnLogout}`}
                    >
                      Logout
                    </button>
                  </div>
                </div>


                <div className={`border-t pt-4 space-y-2 ${t.divider}`}>
                  <div className="flex justify-between text-xs font-mono">
                    <span className={t.textMuted}>USER ID:</span>
                    <span className="text-cyan-400 font-bold">{activeUser.id}</span>
                  </div>
                  <div className="flex flex-col text-xs font-mono">
                    <span className={`mb-1 ${t.textMuted}`}>BEARER JWT TOKEN:</span>
                    <span className={`text-[10px] break-all p-2 rounded-lg border font-mono ${t.inputCode}`}>
                      {'[Secured — stored in HttpOnly cookie]'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Balance Board — hidden for Admin accounts */}
              {activeUser?.role !== 'ADMIN' && (
              <div className={`border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 ${t.card}`}>
                <h3 className={`text-xs font-mono uppercase tracking-wider ${t.labelMuted}`}>Account Balances</h3>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {Object.entries(userBalances[activeUser.id] || activeUser.balance || {}).map(([cur, bal]: any) => (
                    <div key={cur} className={`border p-2 sm:p-3 rounded-lg sm:rounded-xl flex flex-col items-center ${t.balanceCard}`}>
                      <span className={`text-[10px] sm:text-xs font-mono font-semibold ${t.textMuted}`}>{cur}</span>
                      <span className="text-xs sm:text-sm font-bold mt-1">
                        {bal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* Interactive Transfer Form Panel — hidden for Admin accounts */}
              {activeUser?.role !== 'ADMIN' && (
              <div className={`border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl ${t.card}`}>
                <h3 className="text-md font-bold mb-4 flex items-center gap-2 text-cyan-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-20c5.303 0 9.697 4.303 9.697 9.697 0 5.303-4.303 9.697-9.697 9.697C6.697 21.697 2.3 17.303 2.3 12 2.3 6.697 6.697 2.3 12 2.3z" />
                  </svg>
                  Transfer Funds
                </h3>

                {activeUser?.status === 'LIMITED' ? (
                  <div className={`rounded-xl p-5 text-sm flex gap-3 items-start border ${t.errorMsg}`}>
                    <svg className="w-6 h-6 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <h4 className="font-bold text-base mb-1">Account Limited</h4>
                      <p className="opacity-90">Your account is currently limited. You can only view your balance. You cannot initiate new transfers until your account status is restored.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleTransfer} className="space-y-4">
                  <div>
                    <label className={`block text-xs font-mono mb-1 ${t.labelMuted}`}>Recipient</label>
                    <input
                      id="transfer-recipient-input"
                      type="text"
                      value={recipientQuery}
                      onChange={(e) => setRecipientQuery(e.target.value)}
                      placeholder="Email, username, or user ID"
                      className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 font-medium ${t.input}`}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className={`block text-xs font-mono mb-1 ${t.labelMuted}`}>Amount</label>
                      <input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Amount"
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

                  {/* Security: Transaction PIN — only shown if user has set one */}
                  {activeUser?.transactionPinSet && (
                    <div>
                      <label className={`block text-xs font-mono mb-1 ${t.labelMuted}`}>
                        🔐 Transaction PIN <span className="text-rose-400">*required</span>
                      </label>
                      <input
                        id="transfer-pin-input"
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        value={transferPin}
                        onChange={(e) => setTransferPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="Enter your 4-digit PIN"
                        className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono tracking-widest ${t.input}`}
                      />
                    </div>
                  )}

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
                    <div className={`rounded-xl p-3 text-xs flex gap-2 items-start font-mono border ${t.errorMsg}`}>
                      <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div className="break-all">{transferError}</div>
                    </div>
                  )}

                  {transferSuccess && (
                    <div className={`rounded-xl p-3 text-xs flex gap-2 items-start font-mono border ${t.successMsg}`}>
                      <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className={`font-bold ${t.successTitle}`}>Success!</p>
                        <p className="mt-1">ID: {transferSuccess.paymentId}</p>
                        <p>Status: {transferSuccess.status}</p>
                        <p>Key: {transferSuccess.idempotencyKey.substring(0, 8)}...</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isTransferring || isRequestingCode}
                      className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20 flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isRequestingCode ? (
                        <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span><span>Sending Code...</span></>
                      ) : isTransferring ? (
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
                      disabled={isTransferring || isRequestingCode || !idempotencyKey}
                      onClick={handleTransfer}
                      title="Sends the exact same payload again with the exact same Idempotency Key"
                      className={`px-3 py-2 border rounded-xl transition-colors text-xs font-mono font-bold cursor-pointer disabled:opacity-50 ${t.btnSecondary}`}
                    >
                      Replay
                    </button>
                  </div>
                </form>
                )}
              </div>
              )}
            </div>

            {/* Right Pane - Profile OR Logs, Ledger & Abuse Simulator */}
            <div className="md:col-span-7 lg:col-span-8 xl:col-span-8 space-y-4 sm:space-y-6">

              {activeView === 'profile' ? (
                <div className={`border rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl ${t.card}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-cyan-950/30 border border-cyan-800/50 rounded-xl text-cyan-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div><h3 className="font-bold text-lg">Edit Profile</h3><p className={`text-xs ${t.labelMuted}`}>Update your account details</p></div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-6 border-b border-zinc-800">
                    <div className="relative group">
                      {(profilePicture || activeUser.profilePicture) ? (
                        <img src={profilePicture || activeUser.profilePicture} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-cyan-800" />
                      ) : (
                        <div className={`w-24 h-24 rounded-full border-4 border-cyan-800 flex items-center justify-center text-3xl font-bold ${t.avatar}`}>
                          {(activeUser.username || activeUser.email || '?')[0].toUpperCase()}
                        </div>
                      )}
                      <label htmlFor="profile-picture-input" className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </label>
                      <input id="profile-picture-input" type="file" accept="image/*" className="hidden" onChange={handleProfilePictureChange} />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${t.textSub}`}>{activeUser.username || activeUser.email}</p>
                      <p className={`text-xs ${t.labelMuted}`}>{activeUser.email}</p>
                      <p className={`text-[10px] mt-2 font-mono ${t.textMuted}`}>Click photo to upload a new one (max 2MB)</p>
                    </div>
                  </div>
                  <form id="profile-form" onSubmit={handleUpdateProfile} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={`block text-xs font-mono uppercase tracking-wider mb-2 ${t.labelMuted}`}>Username</label>
                        <input id="profile-username" type="text" value={profileUsername} onChange={(e) => setProfileUsername(e.target.value)} className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${t.input}`} />
                      </div>
                      <div>
                        <label className={`block text-xs font-mono uppercase tracking-wider mb-2 ${t.labelMuted}`}>Email Address</label>
                        <input id="profile-email" type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${t.input}`} />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-xs font-mono uppercase tracking-wider mb-2 ${t.labelMuted}`}>New Password <span className="normal-case font-normal">(leave blank to keep current)</span></label>
                      <input id="profile-password" type="password" value={profilePassword} onChange={(e) => setProfilePassword(e.target.value)} placeholder="Min 12 chars, letters + numbers + symbols" className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-mono ${t.input}`} />
                      {profilePassword && (
                        <div className={`mt-2 text-xs font-mono ${validatePassword(profilePassword) ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {validatePassword(profilePassword) ? `\u26a0\ufe0f ${validatePassword(profilePassword)}` : '\u2705 Strong password'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className={`block text-xs font-mono uppercase tracking-wider mb-2 ${t.labelMuted}`}>Transaction PIN <span className="normal-case font-normal">(leave blank to keep current)</span></label>
                      <input
                        id="profile-transaction-pin"
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        value={profileTransactionPin}
                        onChange={(e) => setProfileTransactionPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="4-digit PIN"
                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-mono tracking-widest ${t.input}`}
                      />
                    </div>
                    {profileError && (<div className="bg-rose-950/40 border border-rose-800 text-rose-300 rounded-xl p-3 text-sm flex gap-2 items-center"><svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg><span>{profileError}</span></div>)}
                    {profileSuccess && (<div className="bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded-xl p-3 text-sm flex gap-2 items-center"><svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>{profileSuccess}</span></div>)}
                    <div className="flex gap-3 pt-2">
                      <button id="profile-save-btn" type="submit" disabled={isUpdatingProfile} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer">
                        {isUpdatingProfile ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Save Changes'}
                      </button>
                      <button type="button" onClick={() => { setActiveView('dashboard'); setProfileError(null); setProfileSuccess(null); }} className={`px-6 py-3 border rounded-xl text-sm font-semibold transition-all cursor-pointer ${t.btnSecondary}`}>Cancel</button>
                    </div>
                  </form>
                </div>
              ) : (<>

              {/* Tab Selector — tabs available depend on role */}
              <div className={`flex border-b ${t.divider}`}>
                {/* Admin Dashboard tab — ADMIN only */}
                {activeUser?.role === 'ADMIN' && (
                  <button
                    onClick={() => { setActiveTab('admin'); fetchAdminData(); }}
                    className={`px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'admin' ? (isDark ? 'border-violet-500 text-violet-400 bg-violet-950/10' : 'border-violet-500 text-violet-600 bg-violet-50') : t.tabInactive}`}
                  >
                    🛡️ Admin Dashboard
                  </button>
                )}
                {/* Payment Activity tab — USER only (admins use All Transactions in Admin Dashboard) */}
                {activeUser?.role !== 'ADMIN' && (
                  <button
                    onClick={() => setActiveTab('form')}
                    className={`px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'form' ? t.tabActive : t.tabInactive}`}
                  >
                    Payment Activity
                  </button>
                )}
                {/* Cryptographic Audit Chain tab — ADMIN only */}
                {activeUser?.role === 'ADMIN' && (
                  <button
                    onClick={() => setActiveTab('logs')}
                    className={`px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'logs' ? t.tabActive : t.tabInactive}`}
                  >
                    Audit Chain ({auditLogs.length})
                  </button>
                )}
              </div>

              {activeTab === 'admin' && activeUser?.role === 'ADMIN' && (
                /* ─── ADMIN DASHBOARD ─── */
                <div className={`border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl space-y-6 ${t.card}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl border ${isDark ? 'bg-violet-950/40 border-violet-800 text-violet-400' : 'bg-violet-100 border-violet-300 text-violet-600'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Admin Dashboard</h3>
                        <p className={`text-xs ${t.labelMuted}`}>Manage users and monitor all system activity.</p>
                      </div>
                    </div>
                    <button onClick={fetchAdminData} disabled={isLoadingAdmin} className={`p-2 border rounded-lg transition-colors shadow-sm ${t.btnRefresh}`} title="Refresh">
                      <svg className={`w-4 h-4 ${isLoadingAdmin ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.213 6h-2.182" /></svg>
                    </button>
                  </div>

                  {/* Admin Sub-tabs */}
                  <div className={`flex rounded-xl border p-1 gap-1 ${t.cardInner}`}>
                    <button onClick={() => setAdminTab('users')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${adminTab === 'users' ? (isDark ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'bg-violet-500 text-white shadow-lg') : t.labelMuted}`}>
                      👥 User Management ({adminUsers.length})
                    </button>
                    <button onClick={() => setAdminTab('transactions')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${adminTab === 'transactions' ? (isDark ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'bg-violet-500 text-white shadow-lg') : t.labelMuted}`}>
                      💳 All Transactions ({adminTransactions.length})
                    </button>
                  </div>

                  {/* Action message */}
                  {adminActionMsg && (
                    <div className={`rounded-xl p-3 text-sm border ${adminActionMsg.startsWith('Error') ? t.errorMsg : t.successMsg}`}>
                      {adminActionMsg}
                    </div>
                  )}

                  {adminTab === 'users' ? (
                    /* User list */
                    <div className="overflow-x-auto">
                      {adminUsers.length === 0 ? (
                        <div className={`text-center py-12 font-mono text-sm rounded-xl ${t.emptyState}`}>No users found.</div>
                      ) : (
                        <table className="w-full text-left text-xs font-mono">
                          <thead>
                            <tr className={t.tableHead}>
                              <th className="py-3 px-2">User</th>
                              <th className="py-3 px-2">Role</th>
                              <th className="py-3 px-2">Status</th>
                              <th className="py-3 px-2 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className={t.tableDivide}>
                            {adminUsers.map((u: any) => (
                              <tr key={u.id} className={t.tableHover}>
                                <td className="py-3 px-2">
                                  <p className={`font-bold ${t.textSub}`}>{u.username}</p>
                                  <p className={`text-[10px] ${t.textMuted}`}>{u.email}</p>
                                </td>
                                <td className="py-3 px-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                    u.role === 'ADMIN'
                                      ? (isDark ? 'bg-violet-950 text-violet-400 border-violet-800' : 'bg-violet-100 text-violet-700 border-violet-300')
                                      : (isDark ? 'bg-cyan-950 text-cyan-400 border-cyan-800' : 'bg-cyan-100 text-cyan-700 border-cyan-300')
                                  }`}>{u.role}</span>
                                </td>
                                <td className="py-3 px-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                    u.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                    : u.status === 'BANNED' ? 'bg-rose-950 text-rose-400 border-rose-800'
                                    : 'bg-amber-950 text-amber-400 border-amber-800'
                                  }`}>{u.status}</span>
                                </td>
                                <td className="py-3 px-2">
                                  {/* Prevent admins from managing other admins or themselves */}
                                  {u.role !== 'ADMIN' && u.id !== activeUser.id ? (
                                    <div className="flex gap-1 justify-end">
                                      {u.status !== 'ACTIVE' && (
                                        <button onClick={() => handleUpdateUserStatus(u.id, 'ACTIVE')} className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800 hover:bg-emerald-900 cursor-pointer transition-colors">Activate</button>
                                      )}
                                      {u.status !== 'LIMITED' && (
                                        <button onClick={() => handleUpdateUserStatus(u.id, 'LIMITED')} className="px-2 py-1 rounded text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800 hover:bg-amber-900 cursor-pointer transition-colors">Limit</button>
                                      )}
                                      {u.status !== 'BANNED' && (
                                        <button onClick={() => handleUpdateUserStatus(u.id, 'BANNED')} className="px-2 py-1 rounded text-[10px] font-bold bg-rose-950/60 text-rose-400 border border-rose-800 hover:bg-rose-900 cursor-pointer transition-colors">Ban</button>
                                      )}
                                    </div>
                                  ) : (
                                    <span className={`text-[10px] ${t.textMuted}`}>{u.id === activeUser.id ? '(you)' : '—'}</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  ) : (
                    /* Global Transactions list */
                    <div className="overflow-x-auto">
                      {adminTransactions.length === 0 ? (
                        <div className={`text-center py-12 font-mono text-sm rounded-xl ${t.emptyState}`}>No transactions found.</div>
                      ) : (
                        <table className="w-full text-left text-xs font-mono">
                          <thead>
                            <tr className={t.tableHead}>
                              <th className="py-3 px-2">Payment ID</th>
                              <th className="py-3 px-2">Sender</th>
                              <th className="py-3 px-2">Recipient</th>
                              <th className="py-3 px-2">Amount</th>
                              <th className="py-3 px-2">Status</th>
                              <th className="py-3 px-2">Date</th>
                            </tr>
                          </thead>
                          <tbody className={t.tableDivide}>
                            {adminTransactions.map((p: any) => (
                              <tr key={p.paymentId} className={t.tableHover}>
                                <td className={`py-3 px-2 font-bold ${t.textSub}`}>{p.paymentId.substring(0,8)}...</td>
                                <td className={`py-3 px-2 ${t.textMuted}`}>{p.senderId}</td>
                                <td className={`py-3 px-2 ${t.textMuted}`}>{p.recipientId}</td>
                                <td className={`py-3 px-2 font-bold ${t.textSub}`}>{parseFloat(p.amount).toLocaleString(undefined, {minimumFractionDigits:2})} {p.currency}</td>
                                <td className="py-3 px-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    p.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                                  }`}>{p.status}</span>
                                </td>
                                <td className={`py-3 px-2 ${t.textMuted}`}>{new Date(p.createdAt).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'form' && (
                /* Payment Activity History list */
                <div className={`border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl ${t.card}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-bold">Payments History</h3>
                    <button
                      onClick={() => fetchData(activeUser.id)}
                      className={`p-2 border rounded-lg transition-colors shadow-sm ${t.btnRefresh}`}
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
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.status === 'COMPLETED'
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
              )}

              {activeTab === 'logs' && activeUser?.role === 'ADMIN' && (
                /* Cryptographic Log Chain visualizer */
                <div className={`border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 sm:space-y-6 ${t.card}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-md font-bold">Immutable Verification Ledger</h3>
                      <p className={`text-xs mt-0.5 ${t.labelMuted}`}>Logs are cryptographically linked using SHA-256 hash chaining.</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => runAuditVerification()}
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
                            className={`p-4 rounded-xl border font-mono text-xs transition-all relative ${isTampered
                                ? t.errorBlock
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
                                    <span className={`text-[9px] font-bold animate-pulse ${t.errorHash}`}>[TAMPERED / BREAK POINT]</span>
                                  )}
                                </p>
                                <p className={`text-[11px] break-all select-all font-bold ${isTampered ? t.errorHash : t.successTitle}`}>
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

              {/* Abuse Case & Security Attack Simulator Deck — USER only */}
              {/* Normal users can attempt attacks to see the system detect and block them in real time */}
              {activeUser?.role !== 'ADMIN' && (
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
              )}
            </>)}
            </div>
          </div>
        )}
      </main>

      {/* ─── Security: 2FA Email Verification Modal ─────────────────────────── */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div
            className={`w-full max-w-md border rounded-2xl shadow-2xl p-6 sm:p-8 relative ${isDark ? 'bg-[#0e1629] border-zinc-700' : 'bg-white border-slate-200'}`}
            style={{ animation: 'fadeInScale 0.3s ease-out' }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl ${isDark ? 'bg-cyan-950/50 border border-cyan-800/50' : 'bg-cyan-50 border border-cyan-200'}`}>
                🔐
              </div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                認証コードを入力 / Enter Verification Code
              </h3>
              <p className={`text-xs mt-2 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                {activeUser?.email} に6桁の認証コードを送信しました。
                <br />A 6-digit code was sent to your email.
              </p>
            </div>

            {/* 6-digit Code Input */}
            <div className="mb-5">
              <div className="flex justify-center gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <input
                    key={i}
                    id={`verification-code-input-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={verificationCode[i] || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 1) {
                        const newCode = verificationCode.split('');
                        newCode[i] = val;
                        setVerificationCode(newCode.join(''));
                        // Auto-advance to next input
                        if (val && i < 5) {
                          const next = document.getElementById(`verification-code-input-${i + 1}`);
                          next?.focus();
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      // Handle backspace to go to previous input
                      if (e.key === 'Backspace' && !verificationCode[i] && i > 0) {
                        const prev = document.getElementById(`verification-code-input-${i - 1}`);
                        prev?.focus();
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                      setVerificationCode(pasted);
                      // Focus last filled or next empty
                      const focusIdx = Math.min(pasted.length, 5);
                      const el = document.getElementById(`verification-code-input-${focusIdx}`);
                      el?.focus();
                    }}
                    className={`w-11 h-13 text-center text-xl font-mono font-bold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all ${
                      isDark
                        ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    autoFocus={i === 0}
                  />
                ))}
              </div>
            </div>

            {/* Remaining Attempts */}
            <div className="text-center mb-4">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono ${
                remainingAttempts <= 1
                  ? 'bg-rose-950/30 border border-rose-800 text-rose-400'
                  : isDark
                    ? 'bg-zinc-800 border border-zinc-700 text-zinc-400'
                    : 'bg-slate-100 border border-slate-200 text-slate-500'
              }`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                残り {remainingAttempts} 回 / {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
              </div>
            </div>

            {/* Error Message */}
            {verificationError && (
              <div className={`rounded-xl p-3 text-xs flex gap-2 items-start font-mono border mb-4 ${isDark ? 'bg-rose-950/40 border-rose-800 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="break-all">{verificationError}</div>
              </div>
            )}

            {/* Success Message (resend) */}
            {verificationSuccess && (
              <div className={`rounded-xl p-3 text-xs flex gap-2 items-start font-mono border mb-4 ${isDark ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>{verificationSuccess}</div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleVerifyAndTransfer}
                disabled={verificationCode.length !== 6 || isTransferring}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/50 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20 flex justify-center items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isTransferring ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span><span>認証中... / Verifying...</span></>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg><span>認証して送金 / Verify & Transfer</span></>
                )}
              </button>

              <div className="flex gap-2">
                {/* Resend Code Button */}
                <button
                  onClick={handleResendCode}
                  disabled={isResendingCode || resendCooldown > 0}
                  className={`flex-1 py-2.5 px-3 border rounded-xl text-xs font-bold transition-all flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark
                      ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600'
                  }`}
                >
                  {isResendingCode ? (
                    <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  {resendCooldown > 0
                    ? `再送信 (${resendCooldown}s)`
                    : '認証コードを再送信 / Resend Code'}
                </button>

                {/* Cancel Button */}
                <button
                  onClick={() => {
                    setShowVerificationModal(false);
                    setVerificationId(null);
                    setVerificationCode('');
                    setVerificationError(null);
                    setVerificationSuccess(null);
                  }}
                  disabled={isTransferring}
                  className={`py-2.5 px-4 border rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${
                    isDark
                      ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-400'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-500'
                  }`}
                >
                  キャンセル
                </button>
              </div>
            </div>

            {/* Timer Notice */}
            <p className={`text-center text-[10px] mt-4 ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
              ⏱ コードの有効期限: 5分 / Code expires in 5 minutes
            </p>
          </div>
        </div>
      )}

      {/* Modal animation keyframes */}
      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
