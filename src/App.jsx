import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BadgeCheck,
  Banknote,
  CheckCircle2,
  ChevronRight,
  Copy,
  Crown,
  Gamepad2,
  Gauge,
  Gift,
  Languages,
  Lock,
  LogOut,
  Menu,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react';
import {
  adminCredentials,
  isLocalDemoAdminEnabled,
  paymentInfo,
  translations,
  vipPlans,
} from './data/content.js';
import { isSupabaseConfigured } from './lib/supabase.js';

const storageKeys = {
  users: 'milkii.users',
  deposits: 'milkii.deposits',
  withdrawals: 'milkii.withdrawals',
};

const REFERRAL_UPGRADE_REWARD = 200;
const WITHDRAWAL_REFERRAL_REQUIREMENT = 10;
const GAME_POINTS_FOR_CASHOUT = 10;
const GAME_CASHOUT_AMOUNT = 5;
const REQUIRED_TELEBIRR_RECEIVER = 'ashim shenko (2519****6250)';

const planLevels = {
  Starter: 0,
  'VIP Silver': 1,
  'VIP Gold': 2,
  'VIP Platinum': 3,
  'VIP Diamond': 4,
};

const initialUsers = [
  {
    id: 'demo-user',
    fullName: 'Demo Member',
    email: 'member@milkiihub.com',
    phone: '0911000000',
    password: 'member123',
    referralCode: 'MILKII777',
    invitedBy: '',
    balance: 1200,
    pendingAmount: 450,
    approvedDeposits: 3,
    validReferrals: 5,
    pendingReferrals: 2,
    rank: 'VIP Silver',
    reward: REFERRAL_UPGRADE_REWARD,
    xp: 640,
    streak: 6,
    gameSpins: 0,
    gamePoints: 4,
    pendingWithdrawal: 0,
    approvedWithdrawals: 0,
    onboardingSeen: true,
    referralRewarded: false,
  },
];

const initialDeposits = [
  {
    id: 'dep-1001',
    userId: 'demo-user',
    name: 'Demo Member',
    phone: '0911000000',
    amount: 450,
    sms: 'You have transferred ETB 450 to Ashim Shenko.',
    fileName: 'telebirr-proof.jpg',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
];

const initialWithdrawals = [];

function readStore(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();

  const randomPart = Math.random().toString(36).slice(2, 11);
  return `${Date.now().toString(36)}-${randomPart}`;
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-US');
}

function makeReferralCode(name = 'MILKII') {
  const prefix = name.replace(/[^a-z]/gi, '').slice(0, 3).toUpperCase() || 'MIL';
  return `${prefix}${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function getPlanLevel(rank = 'Starter') {
  return planLevels[rank] ?? 0;
}

function hasPaidPlan(rank = 'Starter') {
  return getPlanLevel(rank) > 0;
}

function hasGoldOrAbove(user) {
  return getPlanLevel(user?.rank) >= planLevels['VIP Gold'];
}

function canWithdraw(user) {
  return hasGoldOrAbove(user) && Number(user?.validReferrals || 0) >= WITHDRAWAL_REFERRAL_REQUIREMENT;
}

function normalizePhone(value = '') {
  return value.replace(/[^\d+]/g, '');
}

function normalizeAmount(value) {
  return Number.parseFloat(String(value || '').replace(/,/g, ''));
}

function validateTelebirrSms(amount, sms) {
  const typedAmount = normalizeAmount(amount);
  const transferredAmountMatch = sms.match(/You have transferred ETB\s*([0-9,]+(?:\.[0-9]{1,2})?)/);
  const transferredAmount = transferredAmountMatch ? normalizeAmount(transferredAmountMatch[1]) : NaN;

  return (
    sms.includes(REQUIRED_TELEBIRR_RECEIVER) &&
    Number.isFinite(typedAmount) &&
    Number.isFinite(transferredAmount) &&
    Math.abs(typedAmount - transferredAmount) < 0.01
  );
}

function getWithdrawalNoticeName(text = '') {
  const cleaned = text.replace(/^[^\p{L}]*/u, '').trim();
  const match = cleaned.match(/^(.+?)\s+(?:withdrew|successfully|just|received)\b/i);
  return match?.[1] || cleaned.split(' ').slice(0, 2).join(' ');
}

function getWithdrawRequirementMessage(user, t) {
  const missingReferrals = Math.max(
    0,
    WITHDRAWAL_REFERRAL_REQUIREMENT - Number(user?.validReferrals || 0),
  );

  if (!hasGoldOrAbove(user) && missingReferrals > 0) {
    return t.withdrawNeedBoth(missingReferrals);
  }

  if (!hasGoldOrAbove(user)) {
    return t.withdrawNeedGold;
  }

  return t.withdrawNeedReferrals(missingReferrals);
}

function normalizeUser(user) {
  return {
    approvedDeposits: 0,
    approvedWithdrawals: 0,
    balance: 0,
    gamePoints: 0,
    gameSpins: 0,
    invitedBy: '',
    onboardingSeen: false,
    pendingAmount: 0,
    pendingReferrals: 0,
    pendingWithdrawal: 0,
    rank: 'Starter',
    referralRewarded: false,
    streak: 1,
    validReferrals: 0,
    xp: 0,
    ...user,
    reward: REFERRAL_UPGRADE_REWARD,
  };
}

export default function App() {
  const [language, setLanguage] = useState(() => localStorage.getItem('milkii.lang') || '');
  const [users, setUsers] = useState(() =>
    readStore(storageKeys.users, initialUsers).map(normalizeUser),
  );
  const [deposits, setDeposits] = useState(() => readStore(storageKeys.deposits, initialDeposits));
  const [withdrawals, setWithdrawals] = useState(() =>
    readStore(storageKeys.withdrawals, initialWithdrawals),
  );
  const [session, setSession] = useState(null);
  const [page, setPage] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [vipNotice, setVipNotice] = useState('');
  const [liveWithdrawalNotice, setLiveWithdrawalNotice] = useState(null);
  const [showLiveWithdrawals, setShowLiveWithdrawals] = useState(false);
  const lastWithdrawalNoticeName = useRef('');

  const t = useMemo(() => translations[language || 'en'], [language]);
  const currentUser = users.find((user) => user.id === session?.userId);
  const isAdmin = session?.role === 'admin';

  useEffect(() => {
    if (!showLiveWithdrawals || session?.role !== 'user') return undefined;

    let hideTimer;
    const showNotice = () => {
      const notices = t.withdrawalNotifications || [];
      const availableNotices = notices.filter(
        (notice) => getWithdrawalNoticeName(notice) !== lastWithdrawalNoticeName.current,
      );
      const noticePool = availableNotices.length > 0 ? availableNotices : notices;
      const text = noticePool[Math.floor(Math.random() * noticePool.length)];
      lastWithdrawalNoticeName.current = getWithdrawalNoticeName(text);
      setLiveWithdrawalNotice({ id: createId(), text });
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setLiveWithdrawalNotice(null), 6500);
    };

    const interval = setInterval(showNotice, 5000);
    return () => {
      clearInterval(interval);
      clearTimeout(hideTimer);
    };
  }, [session?.role, showLiveWithdrawals, t]);

  const persistUsers = (nextUsers) => {
    setUsers(nextUsers);
    writeStore(storageKeys.users, nextUsers);
  };

  const persistDeposits = (nextDeposits) => {
    setDeposits(nextDeposits);
    writeStore(storageKeys.deposits, nextDeposits);
  };

  const persistWithdrawals = (nextWithdrawals) => {
    setWithdrawals(nextWithdrawals);
    writeStore(storageKeys.withdrawals, nextWithdrawals);
  };

  const chooseLanguage = (nextLanguage) => {
    localStorage.setItem('milkii.lang', nextLanguage);
    setLanguage(nextLanguage);
  };

  const login = ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (
      isLocalDemoAdminEnabled &&
      adminCredentials.username &&
      adminCredentials.password &&
      normalizedEmail === adminCredentials.username.toLowerCase() &&
      password === adminCredentials.password
    ) {
      setSession({ role: 'admin', email: normalizedEmail });
      setPage('admin');
      return { ok: true };
    }

    const user = users.find(
      (item) =>
        (item.email.toLowerCase() === normalizedEmail ||
          item.username?.toLowerCase() === normalizedEmail) &&
        item.password === password,
    );

    if (!user) {
      return { ok: false, message: t.invalidLogin };
    }

    setSession({ role: 'user', userId: user.id });
    setPage(user.onboardingSeen ? 'dashboard' : 'onboarding');
    return { ok: true };
  };

  const register = ({ fullName, email, phone, password, referralCode }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = normalizePhone(phone);

    if (users.some((item) => item.email.toLowerCase() === normalizedEmail)) {
      return { ok: false, message: t.emailExists };
    }

    if (normalizedPhone && users.some((item) => normalizePhone(item.phone) === normalizedPhone)) {
      return { ok: false, message: t.phoneExists };
    }

    const inviter = users.find(
      (item) => item.referralCode.toLowerCase() === referralCode.trim().toLowerCase(),
    );

    const user = {
      id: createId(),
      fullName,
      email: normalizedEmail,
      phone,
      username: '',
      password,
      referralCode: makeReferralCode(fullName),
      invitedBy: inviter?.id || '',
      balance: 0,
      pendingAmount: 0,
      approvedDeposits: 0,
      validReferrals: 0,
      pendingReferrals: inviter ? 1 : 0,
      rank: 'Starter',
      reward: REFERRAL_UPGRADE_REWARD,
      xp: 80,
      streak: 1,
      gameSpins: 0,
      gamePoints: 0,
      pendingWithdrawal: 0,
      approvedWithdrawals: 0,
      onboardingSeen: false,
      referralRewarded: false,
    };

    const nextUsers = inviter
      ? users.map((item) =>
          item.id === inviter.id
            ? { ...item, pendingReferrals: item.pendingReferrals + 1 }
            : item,
        )
      : users;

    persistUsers([...nextUsers, user]);
    setSession({ role: 'user', userId: user.id });
    setShowLiveWithdrawals(true);
    setPage('onboarding');
    return { ok: true };
  };

  const logout = () => {
    setSession(null);
    setLiveWithdrawalNotice(null);
    setShowLiveWithdrawals(false);
    setPage('home');
    setMobileOpen(false);
  };

  const submitDeposit = (payload) => {
    if (!currentUser) return;

    const deposit = {
      id: createId(),
      userId: currentUser.id,
      name: currentUser.fullName,
      phone: currentUser.phone,
      amount: Number(payload.amount),
      sms: payload.sms,
      fileName: payload.fileName || t.noFileSelected,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    persistDeposits([deposit, ...deposits]);
    persistUsers(
      users.map((user) =>
        user.id === currentUser.id
          ? { ...user, pendingAmount: user.pendingAmount + Number(payload.amount), xp: user.xp + 25 }
          : user,
      ),
    );
    setPage('dashboard');
  };

  const approveDeposit = (depositId) => {
    const deposit = deposits.find((item) => item.id === depositId);
    if (!deposit || deposit.status !== 'pending') return;
    const vipPlan = vipPlans.find((plan) => plan.name === deposit.vipPlan);
    const isVipUpgrade = Boolean(vipPlan);

    const updatedDeposits = deposits.map((item) =>
      item.id === depositId
        ? { ...item, status: 'approved', reviewedAt: new Date().toISOString() }
        : item,
    );

    const depositedUser = users.find((user) => user.id === deposit.userId);
    const nextUsers = users.map((user) => {
      if (user.id === deposit.userId) {
        return {
          ...user,
          balance: isVipUpgrade ? user.balance : user.balance + deposit.amount,
          pendingAmount: Math.max(0, user.pendingAmount - deposit.amount),
          approvedDeposits: user.approvedDeposits + 1,
          rank: vipPlan?.name || user.rank,
          xp: user.xp + (isVipUpgrade ? 180 : Math.round(deposit.amount / 5)),
          referralRewarded:
            user.referralRewarded ||
            (isVipUpgrade && hasPaidPlan(vipPlan?.name) && Boolean(user.invitedBy)),
        };
      }

      if (
        isVipUpgrade &&
        hasPaidPlan(vipPlan?.name) &&
        depositedUser?.invitedBy === user.id &&
        !depositedUser.referralRewarded
      ) {
        return {
          ...user,
          balance: user.balance + REFERRAL_UPGRADE_REWARD,
          validReferrals: user.validReferrals + 1,
          pendingReferrals: Math.max(0, user.pendingReferrals - 1),
          xp: user.xp + 120,
        };
      }

      return user;
    });

    persistDeposits(updatedDeposits);
    persistUsers(nextUsers);
  };

  const rejectDeposit = (depositId) => {
    const deposit = deposits.find((item) => item.id === depositId);
    if (!deposit) return;

    persistDeposits(
      deposits.map((item) => (item.id === depositId ? { ...item, status: 'rejected' } : item)),
    );
    persistUsers(
      users.map((user) =>
        user.id === deposit.userId
          ? { ...user, pendingAmount: Math.max(0, user.pendingAmount - deposit.amount) }
          : user,
      ),
    );
  };

  const requestVip = (plan) => {
    if (!currentUser || plan.price === 0) return;
    if (getPlanLevel(currentUser.rank) >= getPlanLevel(plan.name)) return;

    const alreadyPending = deposits.some(
      (deposit) =>
        deposit.userId === currentUser.id &&
        deposit.vipPlan === plan.name &&
        deposit.status === 'pending',
    );
    if (alreadyPending) {
      setPage('deposit');
      return;
    }

    const deposit = {
      id: createId(),
      userId: currentUser.id,
      name: currentUser.fullName,
      phone: currentUser.phone,
      amount: plan.price,
      sms: `${t.vipUpgradeRequest}: ${plan.name}`,
      fileName: t.vipUpgradeRequest,
      status: 'pending',
      type: 'vip-upgrade',
      vipPlan: plan.name,
      createdAt: new Date().toISOString(),
    };

    persistDeposits([deposit, ...deposits]);
    persistUsers(
      users.map((user) =>
        user.id === currentUser.id
          ? { ...user, pendingAmount: user.pendingAmount + plan.price, xp: user.xp + 20 }
          : user,
      ),
    );
    setPage('deposit');
  };

  const playGameRound = (points = 1) => {
    if (!currentUser) return { points: 0, cash: 0, remainingPoints: 0 };
    const earnedPoints = Number(points) || 1;
    const totalPoints = (currentUser.gamePoints || 0) + earnedPoints;
    const cashouts = Math.floor(totalPoints / GAME_POINTS_FOR_CASHOUT);
    const cash = cashouts * GAME_CASHOUT_AMOUNT;
    const remainingPoints = totalPoints % GAME_POINTS_FOR_CASHOUT;

    persistUsers(
      users.map((user) =>
        user.id === currentUser.id
          ? {
              ...user,
              balance: user.balance + cash,
              gamePoints: remainingPoints,
              xp: user.xp + earnedPoints * 10 + cash,
              streak: user.streak + 1,
            }
          : user,
      ),
    );

    return { points: earnedPoints, cash, remainingPoints };
  };

  const completeOnboarding = (nextPage = 'dashboard') => {
    if (!currentUser) return;
    persistUsers(
      users.map((user) =>
        user.id === currentUser.id ? { ...user, onboardingSeen: true } : user,
      ),
    );
    setPage(nextPage);
  };

  const openWithdraw = () => {
    if (!currentUser) return;

    if (canWithdraw(currentUser)) {
      setVipNotice('');
      setPage('withdraw');
      setMobileOpen(false);
      return;
    }

    setVipNotice(getWithdrawRequirementMessage(currentUser, t));
    setPage('vip');
    setMobileOpen(false);
  };

  const submitWithdrawal = (payload) => {
    if (!currentUser) return { ok: false, message: t.loginFirst };
    if (!canWithdraw(currentUser)) {
      openWithdraw();
      return { ok: false, message: getWithdrawRequirementMessage(currentUser, t) };
    }

    const amount = Number(payload.amount);
    if (!amount || amount <= 0) {
      return { ok: false, message: t.enterWithdrawalAmount };
    }

    if (amount > currentUser.balance) {
      return { ok: false, message: t.withdrawalTooHigh };
    }

    const withdrawal = {
      id: createId(),
      userId: currentUser.id,
      name: currentUser.fullName,
      phone: currentUser.phone,
      amount,
      method: payload.method,
      accountName: payload.accountName,
      accountNumber: payload.accountNumber,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    persistWithdrawals([withdrawal, ...withdrawals]);
    persistUsers(
      users.map((user) =>
        user.id === currentUser.id
          ? {
              ...user,
              balance: Math.max(0, user.balance - amount),
              pendingWithdrawal: (user.pendingWithdrawal || 0) + amount,
            }
          : user,
      ),
    );

    return { ok: true, message: t.withdrawalSubmitted };
  };

  const approveWithdrawal = (withdrawalId) => {
    const withdrawal = withdrawals.find((item) => item.id === withdrawalId);
    if (!withdrawal || withdrawal.status !== 'pending') return;

    persistWithdrawals(
      withdrawals.map((item) =>
        item.id === withdrawalId
          ? { ...item, status: 'paid', reviewedAt: new Date().toISOString() }
          : item,
      ),
    );
    persistUsers(
      users.map((user) =>
        user.id === withdrawal.userId
          ? {
              ...user,
              pendingWithdrawal: Math.max(0, (user.pendingWithdrawal || 0) - withdrawal.amount),
              approvedWithdrawals: (user.approvedWithdrawals || 0) + 1,
            }
          : user,
      ),
    );
  };

  const rejectWithdrawal = (withdrawalId) => {
    const withdrawal = withdrawals.find((item) => item.id === withdrawalId);
    if (!withdrawal || withdrawal.status !== 'pending') return;

    persistWithdrawals(
      withdrawals.map((item) =>
        item.id === withdrawalId
          ? { ...item, status: 'rejected', reviewedAt: new Date().toISOString() }
          : item,
      ),
    );
    persistUsers(
      users.map((user) =>
        user.id === withdrawal.userId
          ? {
              ...user,
              balance: user.balance + withdrawal.amount,
              pendingWithdrawal: Math.max(0, (user.pendingWithdrawal || 0) - withdrawal.amount),
            }
          : user,
      ),
    );
  };

  if (!language) {
    return <LanguageGate t={translations.en} chooseLanguage={chooseLanguage} />;
  }

  return (
    <div className="app-shell">
      {liveWithdrawalNotice && <LiveWithdrawalNotice text={liveWithdrawalNotice.text} />}
      <Header
        t={t}
        language={language}
        setLanguage={chooseLanguage}
        page={page}
        setPage={setPage}
        session={session}
        logout={logout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        openWithdraw={openWithdraw}
      />

      <main>
        {!session && page === 'home' && <Home t={t} setPage={setPage} />}
        {!session && page === 'auth' && (
          <AuthPanel t={t} login={login} register={register} setPage={setPage} />
        )}

        {session && !isAdmin && currentUser && (
          <UserExperience
            t={t}
            page={page}
            setPage={setPage}
            user={currentUser}
            users={users}
            deposits={deposits}
            withdrawals={withdrawals}
            submitDeposit={submitDeposit}
            submitWithdrawal={submitWithdrawal}
            requestVip={requestVip}
            playGameRound={playGameRound}
            openWithdraw={openWithdraw}
            completeOnboarding={completeOnboarding}
            vipNotice={vipNotice}
          />
        )}

        {isAdmin && (
          <AdminConsole
            t={t}
            users={users}
            deposits={deposits}
            withdrawals={withdrawals}
            approveDeposit={approveDeposit}
            rejectDeposit={rejectDeposit}
            approveWithdrawal={approveWithdrawal}
            rejectWithdrawal={rejectWithdrawal}
          />
        )}
      </main>
    </div>
  );
}

function LanguageGate({ t, chooseLanguage }) {
  return (
    <main className="language-screen">
      <section className="language-panel">
        <div className="brand-mark">
          <Sparkles size={22} />
          <span>Milkii Hub</span>
        </div>
        <h1>{t.languageTitle}</h1>
        <p>{t.languageSubtitle}</p>
        <div className="language-grid">
          <button onClick={() => chooseLanguage('en')}>
            <span>EN</span>
            {t.english}
          </button>
          <button onClick={() => chooseLanguage('om')}>
            <span>OM</span>
            {t.afaanOromo}
          </button>
          <button onClick={() => chooseLanguage('am')}>
            <span>AM</span>
            {t.amharic}
          </button>
        </div>
      </section>
    </main>
  );
}

function LiveWithdrawalNotice({ text }) {
  return (
    <div className="live-withdrawal-notice" role="status" aria-live="polite">
      {text}
    </div>
  );
}

function Header({
  t,
  language,
  setLanguage,
  page,
  setPage,
  session,
  logout,
  mobileOpen,
  setMobileOpen,
  openWithdraw,
}) {
  const nav = session?.role === 'admin'
    ? [{ id: 'admin', label: t.admin, icon: ShieldCheck }]
    : [
        { id: 'dashboard', label: t.dashboard, icon: Gauge },
        { id: 'deposit', label: t.deposit, icon: Wallet },
        { id: 'withdraw', label: t.withdraw || 'Withdraw', icon: Banknote },
        { id: 'game', label: t.play, icon: Gamepad2 },
        { id: 'vip', label: t.vip, icon: Crown },
        { id: 'referrals', label: t.referrals, icon: Users },
      ];

  return (
    <header className="site-header">
      <button className="brand-button" onClick={() => setPage(session ? nav[0].id : 'home')}>
        <span className="brand-icon">
          <Sparkles size={18} />
        </span>
        <span>Milkii Hub</span>
      </button>

      {session && (
        <nav className={`nav-links ${mobileOpen ? 'open' : ''}`}>
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={page === item.id ? 'active' : ''}
                onClick={() => {
                  if (item.id === 'withdraw') {
                    openWithdraw();
                    return;
                  }
                  setPage(item.id);
                  setMobileOpen(false);
                }}
              >
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}
        </nav>
      )}

      <div className="header-actions">
        <div className="language-mini">
          <Languages size={16} />
          <select value={language} onChange={(event) => setLanguage(event.target.value)}>
            <option value="en">EN</option>
            <option value="om">OM</option>
            <option value="am">AM</option>
          </select>
        </div>
        {session ? (
          <button className="ghost-button" onClick={logout}>
            <LogOut size={17} />
            {t.logout}
          </button>
        ) : (
          <button className="primary-small" onClick={() => setPage('auth')}>
            {t.login}
          </button>
        )}
        {session && (
          <button className="menu-button" onClick={() => setMobileOpen(!mobileOpen)}>
            <Menu size={20} />
          </button>
        )}
      </div>
    </header>
  );
}

function Home({ t, setPage }) {
  return (
    <section className="hero-layout">
      <div className="hero-copy">
        <div className="eyebrow">
          <Rocket size={16} />
          {t.successHub}
        </div>
        <h1>{t.heroTitle}</h1>
        <p>{t.heroCopy}</p>
        <div className="hero-actions">
          <button className="primary-button" onClick={() => setPage('auth')}>
            {t.startNow}
            <ChevronRight size={18} />
          </button>
          <span className="trust-pill">
            <ShieldCheck size={16} />
            {t.supabaseReady}
          </span>
        </div>
      </div>

      <div className="phone-preview">
        <div className="phone-topbar">
          <span />
          <span />
        </div>
        <div className="preview-card glow">
          <span>{t.balance}</span>
          <strong>12,840 ETB</strong>
          <small>{t.thisWeekGrowth}</small>
        </div>
        <div className="preview-grid">
          <div>
            <Gift size={20} />
            <b>{t.dailySpin}</b>
            <small>{t.unlocked}</small>
          </div>
          <div>
            <Users size={20} />
            <b>{t.referrals}</b>
            <small>{t.activeReferrals}</small>
          </div>
        </div>
        <div className="leader-strip">
          <span>#1</span>
          <strong>VIP Diamond</strong>
          <small>{REFERRAL_UPGRADE_REWARD} ETB/ref</small>
        </div>
      </div>
    </section>
  );
}

function AuthPanel({ t, login, register, setPage }) {
  const [mode, setMode] = useState('register');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    referralCode: new URLSearchParams(window.location.search).get('ref') || '',
  });
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const result = mode === 'login' ? login(form) : register(form);
    if (!result.ok) setError(result.message);
  };

  return (
    <section className="auth-layout">
      <div className="auth-info">
        <div className="eyebrow">
          <Lock size={16} />
          {t.authEyebrow}
        </div>
        <h1>{t.authTitle}</h1>
        <p>{t.authCopy}</p>
        {isLocalDemoAdminEnabled && adminCredentials.username && (
          <div className="credential-note">
            <b>{t.localDemoAdmin}</b>
            <span>{adminCredentials.username}</span>
            <span>{t.configuredInEnv}</span>
          </div>
        )}
      </div>

      <form className="auth-card" onSubmit={submit}>
        <div className="tabs">
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
            {t.register}
          </button>
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            {t.login}
          </button>
        </div>

        {error && <div className="alert error">{error}</div>}

        {mode === 'register' && (
          <label>
            {t.fullName}
            <input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
          </label>
        )}
        <label>
          {t.email}
          <input
            type={mode === 'register' ? 'email' : 'text'}
            required
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
        </label>
        {mode === 'register' && (
          <label>
            {t.phone}
            <input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          </label>
        )}
        <label>
          {t.password}
          <input type="password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        </label>
        {mode === 'register' && (
          <label>
            {t.referralCode}
            <input value={form.referralCode} onChange={(event) => setForm({ ...form, referralCode: event.target.value })} />
          </label>
        )}

        <button className="primary-button" type="submit">
          {mode === 'login' ? t.signIn : t.createAccount}
          <ChevronRight size={18} />
        </button>
        <button className="text-link" type="button" onClick={() => setPage('home')}>
          {t.backToOverview}
        </button>
      </form>
    </section>
  );
}

function UserExperience({
  t,
  page,
  setPage,
  user,
  users,
  deposits,
  withdrawals,
  submitDeposit,
  submitWithdrawal,
  requestVip,
  playGameRound,
  openWithdraw,
  completeOnboarding,
  vipNotice,
}) {
  if (page === 'onboarding') {
    return (
      <OnboardingPage
        t={t}
        user={user}
        setPage={setPage}
        openWithdraw={openWithdraw}
        completeOnboarding={completeOnboarding}
      />
    );
  }
  if (page === 'deposit') return <DepositPage t={t} user={user} submitDeposit={submitDeposit} />;
  if (page === 'withdraw') {
    return (
      <WithdrawalPage
        t={t}
        user={user}
        withdrawals={withdrawals}
        submitWithdrawal={submitWithdrawal}
        openWithdraw={openWithdraw}
      />
    );
  }
  if (page === 'game') return <GamePage t={t} user={user} playGameRound={playGameRound} />;
  if (page === 'vip') return <VipPage t={t} user={user} requestVip={requestVip} notice={vipNotice} />;
  if (page === 'referrals') return <ReferralPage t={t} user={user} users={users} />;

  return (
    <Dashboard
      t={t}
      user={user}
      deposits={deposits}
      withdrawals={withdrawals}
      setPage={setPage}
      openWithdraw={openWithdraw}
    />
  );
}

function OnboardingPage({ t, user, setPage, openWithdraw, completeOnboarding }) {
  const firstName = user.fullName.split(' ')[0];

  const goToVip = () => completeOnboarding('vip');
  const goToDashboard = () => completeOnboarding('dashboard');
  const checkWithdraw = () => {
    completeOnboarding('dashboard');
    openWithdraw();
  };

  return (
    <section className="onboarding-layout">
      <div className="welcome-panel onboarding-hero">
        <div>
          <span className="eyebrow">
            <Sparkles size={16} />
            {t.newMemberGuide}
          </span>
          <h1>{t.welcomeName(firstName)}</h1>
          <p>{t.onboardingCopy}</p>
        </div>
      </div>

      <div className="rules-grid">
        <InfoTile
          icon={Gift}
          title={`${REFERRAL_UPGRADE_REWARD} ${t.validInvitationTitle}`}
          text={t.validInvitationText}
        />
        <InfoTile
          icon={Crown}
          title={t.upgradeMattersTitle}
          text={t.upgradeMattersText}
        />
        <InfoTile
          icon={Users}
          title={`${WITHDRAWAL_REFERRAL_REQUIREMENT} ${t.validInvitationsTitle}`}
          text={t.validInvitationsText}
        />
        <InfoTile
          icon={Gamepad2}
          title={t.gameConvertTitle}
          text={t.gameConvertText(GAME_POINTS_FOR_CASHOUT, GAME_CASHOUT_AMOUNT)}
        />
      </div>

      <div className="content-card requirement-card">
        <div>
          <h2>{t.withdrawalRule}</h2>
          <p>{t.withdrawalRuleCopy(WITHDRAWAL_REFERRAL_REQUIREMENT)}</p>
        </div>
        <div className="onboarding-actions">
          <button className="primary-button" onClick={goToVip}>
            {t.viewVipPlans}
            <Crown size={18} />
          </button>
          <button className="secondary-button" onClick={checkWithdraw}>
            {t.checkWithdrawal}
            <Banknote size={18} />
          </button>
          <button className="text-link inline" onClick={goToDashboard}>
            {t.continueDashboard}
          </button>
        </div>
      </div>
    </section>
  );
}

function InfoTile({ icon: Icon, title, text }) {
  return (
    <article className="info-tile">
      <Icon size={22} />
      <h2>{title}</h2>
      <p>{text}</p>
    </article>
  );
}

function Dashboard({ t, user, deposits, withdrawals, setPage, openWithdraw }) {
  const userDeposits = deposits.filter((deposit) => deposit.userId === user.id);
  const userWithdrawals = withdrawals.filter((withdrawal) => withdrawal.userId === user.id);
  const inviteLink = `${window.location.origin}${window.location.pathname}?ref=${user.referralCode}`;
  const [copied, setCopied] = useState(false);
  const withdrawOpen = canWithdraw(user);

  const copyInvite = async () => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(inviteLink);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = inviteLink;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className="page-grid">
      <div className="dashboard-main">
        <div className="welcome-panel">
          <div>
            <span className="eyebrow">
              <BadgeCheck size={16} />
              {user.rank}
            </span>
            <h1>{t.welcomeBack(user.fullName.split(' ')[0])}</h1>
            <p>{t.dashboardCopy}</p>
          </div>
          <div className="welcome-actions">
            <button className="primary-button" onClick={() => setPage('deposit')}>
              {t.deposit}
              <Wallet size={18} />
            </button>
            <button className="secondary-button" onClick={openWithdraw}>
              {t.withdraw || 'Withdraw'}
              <Banknote size={18} />
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <Stat icon={Wallet} label={t.balance} value={`${formatMoney(user.balance)} ETB`} tone="green" />
          <Stat icon={Users} label={t.validInvitations} value={`${user.validReferrals}/${WITHDRAWAL_REFERRAL_REQUIREMENT}`} tone="yellow" />
          <Stat icon={Banknote} label={t.withdraw} value={withdrawOpen ? t.open : t.locked} tone={withdrawOpen ? 'green' : 'red'} />
          <Stat icon={Sparkles} label={t.gamePoints} value={`${user.gamePoints || 0}/${GAME_POINTS_FOR_CASHOUT}`} tone="blue" />
        </div>

        {!withdrawOpen && (
          <div className="notice-card">
            <Lock size={18} />
            <span>{getWithdrawRequirementMessage(user, t)}</span>
          </div>
        )}

        <div className="content-card">
          <div className="section-heading">
            <h2>{t.recentActivity}</h2>
            <span>{userDeposits.length + userWithdrawals.length} {t.records}</span>
          </div>
          <div className="activity-list">
            {userDeposits.length + userWithdrawals.length === 0 && <p className="muted">{t.noActivityYet}</p>}
            {userDeposits.slice(0, 5).map((deposit) => (
              <div className="activity-row" key={deposit.id}>
                <div>
                  <b>{deposit.vipPlan || t.deposit} - {formatMoney(deposit.amount)} ETB</b>
                  <small>{deposit.sms}</small>
                </div>
                <Status status={deposit.status} t={t} />
              </div>
            ))}
            {userWithdrawals.slice(0, 3).map((withdrawal) => (
              <div className="activity-row" key={withdrawal.id}>
                <div>
                  <b>{t.withdrawal} - {formatMoney(withdrawal.amount)} ETB</b>
                  <small>{withdrawal.method === 'cbe' ? t.cbe : t.telebirr}</small>
                </div>
                <Status status={withdrawal.status} t={t} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside className="side-stack">
        <div className="content-card invite-card">
          <Gift size={26} />
          <h2>{t.inviteFriends}</h2>
          <p>
            {t.earnReferralCopy(REFERRAL_UPGRADE_REWARD)}
          </p>
          <div className="copy-box">
            <span>{inviteLink}</span>
            <button onClick={copyInvite}>
              <Copy size={16} />
              {copied ? t.copied : t.copyLink}
            </button>
          </div>
        </div>
        <div className="content-card progress-card">
          <div className="section-heading">
            <h2>{t.withdrawalProgress}</h2>
            <span>{withdrawOpen ? t.ready : `${Math.min(user.validReferrals, WITHDRAWAL_REFERRAL_REQUIREMENT)}/${WITHDRAWAL_REFERRAL_REQUIREMENT}`}</span>
          </div>
          <div className="progress-track">
            <span style={{ width: `${Math.min(100, Math.round((user.validReferrals / WITHDRAWAL_REFERRAL_REQUIREMENT) * 100))}%` }} />
          </div>
          <p className="muted">
            {t.progressCopy(WITHDRAWAL_REFERRAL_REQUIREMENT)}
          </p>
        </div>
      </aside>
    </section>
  );
}

function DepositPage({ t, submitDeposit }) {
  const [form, setForm] = useState({ amount: '', sms: '', fileName: '' });
  const [message, setMessage] = useState('');

  const submit = (event) => {
    event.preventDefault();
    if (!form.amount || Number(form.amount) <= 0 || !form.sms.trim()) {
      setMessage(t.enterAmountSms);
      return;
    }

    if (!validateTelebirrSms(form.amount, form.sms)) {
      setMessage(t.invalidPaymentProcess);
      return;
    }

    submitDeposit(form);
  };

  return (
    <section className="deposit-layout">
      <div className="content-card deposit-instructions">
        <span className="eyebrow">
          <ShieldCheck size={16} />
          {t.manualReviewFlow}
        </span>
        <h1>{t.depositTitle}</h1>
        <p>{t.depositCopy}</p>
        <div className="payment-card">
          <span>{t.paymentNumber}</span>
          <strong>{paymentInfo.phone}</strong>
          <small>{t.paymentName}: {paymentInfo.name}</small>
        </div>
        <div className="safety-box">
          <b>{t.important}</b>
          <span>{t.depositSafety}</span>
        </div>
      </div>

      <form className="content-card deposit-form" onSubmit={submit}>
        {message && <div className="alert error">{message}</div>}
        <label>
          {t.amount}
          <input type="number" min="1" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
        </label>
        <label>
          {t.screenshot}
          <div className="file-input">
            <Upload size={18} />
            <span>{form.fileName || t.chooseImageProof}</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setForm({ ...form, fileName: event.target.files?.[0]?.name || '' })}
            />
          </div>
        </label>
        <label>
          {t.sms}
          <textarea rows="6" value={form.sms} onChange={(event) => setForm({ ...form, sms: event.target.value })} />
        </label>
        <button className="primary-button" type="submit">
          {t.submitDeposit}
          <ChevronRight size={18} />
        </button>
      </form>
    </section>
  );
}

function WithdrawalPage({ t, user, withdrawals, submitWithdrawal, openWithdraw }) {
  const [form, setForm] = useState({
    method: 'telebirr',
    accountName: user.fullName,
    accountNumber: user.phone,
    amount: '',
  });
  const [message, setMessage] = useState(null);
  const eligible = canWithdraw(user);
  const userWithdrawals = withdrawals.filter((withdrawal) => withdrawal.userId === user.id);

  const changeMethod = (method) => {
    setForm({
      ...form,
      method,
      accountNumber: method === 'telebirr' ? user.phone : '',
    });
  };

  const submit = (event) => {
    event.preventDefault();
    if (!eligible) {
      openWithdraw();
      return;
    }
    const result = submitWithdrawal(form);
    setMessage({ text: result.message, ok: result.ok });
    if (result.ok) {
      setForm({ ...form, amount: '' });
    }
  };

  return (
    <section className="withdraw-layout">
      <div className="content-card withdrawal-summary">
        <span className="eyebrow">
          <Banknote size={16} />
          {t.withdrawalCenter}
        </span>
        <h1>{t.withdrawEarnings}</h1>
        <p>{t.withdrawCopy(WITHDRAWAL_REFERRAL_REQUIREMENT)}</p>

        <div className="requirement-list">
          <Requirement done={hasGoldOrAbove(user)} label={t.vipGoldRequirement} />
          <Requirement
            done={user.validReferrals >= WITHDRAWAL_REFERRAL_REQUIREMENT}
            label={t.validInvitationCount(user.validReferrals, WITHDRAWAL_REFERRAL_REQUIREMENT)}
          />
        </div>

        {!eligible && (
          <div className="alert error">
            {getWithdrawRequirementMessage(user, t)}
          </div>
        )}

        <div className="stats-grid compact">
          <Stat icon={Wallet} label={t.available} value={`${formatMoney(user.balance)} ETB`} tone="green" />
          <Stat icon={Sparkles} label={t.pending} value={`${formatMoney(user.pendingWithdrawal || 0)} ETB`} tone="yellow" />
        </div>
      </div>

      <form className="content-card withdrawal-form" onSubmit={submit}>
        {message && <div className={`alert ${message.ok ? 'success' : 'error'}`}>{message.text}</div>}
        <label>
          {t.withdrawalMethod}
          <select value={form.method} onChange={(event) => changeMethod(event.target.value)}>
            <option value="telebirr">{t.telebirr}</option>
            <option value="cbe">{t.cbe}</option>
          </select>
        </label>
        <label>
          {t.accountName}
          <input
            required
            value={form.accountName}
            onChange={(event) => setForm({ ...form, accountName: event.target.value })}
          />
        </label>
        <label>
          {form.method === 'cbe' ? t.cbeAccountNumber : t.telebirrPhoneNumber}
          <input
            required
            value={form.accountNumber}
            onChange={(event) => setForm({ ...form, accountNumber: event.target.value })}
          />
        </label>
        <label>
          {t.amount}
          <input
            type="number"
            min="1"
            max={user.balance}
            value={form.amount}
            onChange={(event) => setForm({ ...form, amount: event.target.value })}
          />
        </label>
        <button className="primary-button" type="submit" disabled={!eligible}>
          {t.requestWithdrawal}
          <ChevronRight size={18} />
        </button>
      </form>

      <div className="content-card withdrawal-history">
        <div className="section-heading">
          <h2>{t.withdrawalHistory}</h2>
          <span>{userWithdrawals.length}</span>
        </div>
        <div className="activity-list">
          {userWithdrawals.length === 0 && <p className="muted">{t.noWithdrawalRequests}</p>}
          {userWithdrawals.map((withdrawal) => (
            <div className="activity-row" key={withdrawal.id}>
              <div>
                <b>{formatMoney(withdrawal.amount)} ETB</b>
                <small>
                  {withdrawal.method === 'cbe' ? t.cbe : t.telebirr} -
                  {withdrawal.accountNumber}
                </small>
              </div>
              <Status status={withdrawal.status} t={t} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Requirement({ done, label }) {
  return (
    <div className={`requirement ${done ? 'done' : ''}`}>
      {done ? <CheckCircle2 size={18} /> : <Lock size={18} />}
      <span>{label}</span>
    </div>
  );
}

function GamePage({ t, user, playGameRound }) {
  const [target, setTarget] = useState(() => Math.floor(Math.random() * 9));
  const [message, setMessage] = useState(() => t.gameInitial);
  const tiles = Array.from({ length: 9 }, (_, index) => index);
  const progress = Math.round(((user.gamePoints || 0) / GAME_POINTS_FOR_CASHOUT) * 100);

  useEffect(() => {
    setMessage(t.gameInitial);
  }, [t]);

  const pickTile = (index) => {
    if (index === target) {
      const points = [1, 2, 3][Math.floor(Math.random() * 3)];
      const result = playGameRound(points);
      setMessage(
        result.cash > 0
          ? t.niceHitCash(points, result.cash)
          : t.niceHitPoints(points, GAME_POINTS_FOR_CASHOUT - result.remainingPoints),
      );
    } else {
      setMessage(t.missedTarget);
    }

    let nextTarget = Math.floor(Math.random() * 9);
    if (nextTarget === target) nextTarget = (nextTarget + 1) % 9;
    setTarget(nextTarget);
  };

  return (
    <section className="game-layout">
      <div className="game-stage">
        <div className="game-scoreboard">
          <span>{t.points}</span>
          <strong>{user.gamePoints || 0}/{GAME_POINTS_FOR_CASHOUT}</strong>
          <small>{t.pointsValue(GAME_POINTS_FOR_CASHOUT, GAME_CASHOUT_AMOUNT)}</small>
        </div>
        <div className="target-grid" aria-label="Milkii points game">
          {tiles.map((tile) => (
            <button
              key={tile}
              className={tile === target ? 'target active' : 'target'}
              onClick={() => pickTile(tile)}
              type="button"
            >
              {tile === target ? <Target size={26} /> : <Sparkles size={22} />}
            </button>
          ))}
        </div>
        <div className="game-progress">
          <span style={{ width: `${progress}%` }} />
        </div>
        <p className="game-message">{message}</p>
      </div>
      <div className="content-card">
        <span className="eyebrow">
          <Sparkles size={16} />
          {t.gameTitle}
        </span>
        <h1>{t.gameTitle}</h1>
        <p>{t.gameCopy}</p>
        <div className="mission-list">
          <Mission done label={t.createAccountMission} reward="+80 XP" />
          <Mission done={user.approvedDeposits > 0} label={t.firstDepositMission} reward="+100 XP" />
          <Mission done={user.validReferrals > 0} label={t.inviteMission} reward={`+${REFERRAL_UPGRADE_REWARD} ETB`} />
          <Mission done={user.gamePoints > 0} label={t.winGameMission} reward={t.pointsValue(GAME_POINTS_FOR_CASHOUT, GAME_CASHOUT_AMOUNT)} />
          <Mission done={canWithdraw(user)} label={t.unlockWithdrawalsMission} reward={t.unlockReward} />
        </div>
      </div>
    </section>
  );
}

function VipPage({ t, user, requestVip, notice }) {
  const currentLevel = getPlanLevel(user.rank);

  return (
    <section className="vip-page">
      {notice && (
        <div className="notice-card strong">
          <Lock size={18} />
          <span>{notice}</span>
        </div>
      )}
      <div className="section-heading hero-heading">
        <div>
          <span className="eyebrow">
            <Crown size={16} />
            {t.vipGrowth}
          </span>
          <h1>{t.vipTitle}</h1>
          <p className="muted">{t.vipCopy(WITHDRAWAL_REFERRAL_REQUIREMENT)}</p>
        </div>
      </div>
      <div className="vip-grid">
        {vipPlans.map((plan) => {
          const planLevel = getPlanLevel(plan.name);
          const isCurrent = user.rank === plan.name;
          const isLowerPlan = planLevel < currentLevel;
          const isUnavailable = plan.price === 0 || planLevel <= currentLevel;

          return (
            <article className={`vip-card ${plan.color}`} key={plan.id}>
              <div>
                <span className="plan-badge">{plan.name}</span>
                <h2>{plan.price === 0 ? t.free : `${plan.price} ETB`}</h2>
                <p>{REFERRAL_UPGRADE_REWARD} {t.perValidInvite}</p>
              </div>
              <ul>
                {plan.perks.map((perk) => (
                  <li key={perk}>
                    <CheckCircle2 size={16} />
                    {t[perk]}
                  </li>
                ))}
              </ul>
              <button
                className={isUnavailable ? 'secondary-button full' : 'primary-button full'}
                disabled={isUnavailable}
                onClick={() => requestVip(plan)}
              >
                {isCurrent ? t.currentPlan : isLowerPlan ? t.included : t.requestVip}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ReferralPage({ t, user, users }) {
  const invited = users.filter((item) => item.invitedBy === user.id);
  return (
    <section className="page-grid">
      <div className="content-card">
        <span className="eyebrow">
          <Users size={16} />
          {t.referrals}
        </span>
        <h1>{t.inviteFriends}</h1>
        <p>
          {t.referralCodeLabel}: <b>{user.referralCode}</b>
        </p>
        <p className="muted">{t.referralCopy(REFERRAL_UPGRADE_REWARD)}</p>
        <div className="stats-grid compact">
          <Stat icon={BadgeCheck} label={t.valid} value={user.validReferrals} tone="green" />
          <Stat icon={Sparkles} label={t.pending} value={user.pendingReferrals} tone="yellow" />
          <Stat
            icon={Banknote}
            label={t.withdrawTarget}
            value={`${Math.min(user.validReferrals, WITHDRAWAL_REFERRAL_REQUIREMENT)}/${WITHDRAWAL_REFERRAL_REQUIREMENT}`}
            tone={canWithdraw(user) ? 'green' : 'red'}
          />
          <Stat icon={Crown} label={t.currentPlan} value={user.rank} tone="blue" />
        </div>
      </div>
      <div className="content-card">
        <div className="section-heading">
          <h2>{t.invitedMembers}</h2>
          <span>{invited.length}</span>
        </div>
        <div className="activity-list">
          {invited.length === 0 && <p className="muted">{t.noInvitedMembers}</p>}
          {invited.map((item) => (
            <div className="activity-row" key={item.id}>
              <div>
                <b>{item.fullName}</b>
                <small>{item.phone} - {item.rank}</small>
              </div>
              <Status status={item.referralRewarded || hasPaidPlan(item.rank) ? 'approved' : 'pending'} t={t} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AdminConsole({
  t,
  users,
  deposits,
  withdrawals,
  approveDeposit,
  rejectDeposit,
  approveWithdrawal,
  rejectWithdrawal,
}) {
  const pendingDeposits = deposits.filter((deposit) => deposit.status === 'pending');
  const pendingWithdrawals = withdrawals.filter((withdrawal) => withdrawal.status === 'pending');
  const totalBalance = users.reduce((sum, user) => sum + user.balance, 0);

  return (
    <section className="admin-layout">
      <div className="admin-hero">
        <div>
          <span className="eyebrow">
            <ShieldCheck size={16} />
            {t.adminTitle}
          </span>
          <h1>{t.adminTitle}</h1>
          <p>{t.adminCopy}</p>
        </div>
      </div>

      <div className="stats-grid">
        <Stat icon={Users} label={t.users} value={users.length} tone="blue" />
        <Stat icon={Wallet} label={t.totalBalances} value={`${formatMoney(totalBalance)} ETB`} tone="green" />
        <Stat icon={Sparkles} label={t.pendingDeposits} value={pendingDeposits.length} tone="yellow" />
        <Stat icon={Banknote} label={t.withdrawals} value={pendingWithdrawals.length} tone="red" />
      </div>

      <div className="admin-columns">
        <div className="admin-stack">
        <div className="content-card">
          <div className="section-heading">
            <h2>{t.pendingDeposits}</h2>
            <span>{pendingDeposits.length}</span>
          </div>
          <div className="activity-list">
            {pendingDeposits.length === 0 && <p className="muted">{t.noPendingDeposits}</p>}
            {pendingDeposits.map((deposit) => (
              <div className="admin-deposit" key={deposit.id}>
                <div>
                  <b>{deposit.name}</b>
                  <span>{formatMoney(deposit.amount)} ETB - {deposit.phone}</span>
                  <small>{deposit.sms}</small>
                  <small>{t.proof}: {deposit.fileName}</small>
                  {deposit.vipPlan && <small>{t.vipUpgrade}: {deposit.vipPlan}</small>}
                </div>
                <div className="admin-actions">
                  <button className="approve" onClick={() => approveDeposit(deposit.id)}>
                    <CheckCircle2 size={16} />
                    {t.approve}
                  </button>
                  <button className="reject" onClick={() => rejectDeposit(deposit.id)}>
                    <XCircle size={16} />
                    {t.reject}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

          <div className="content-card">
            <div className="section-heading">
              <h2>{t.pendingWithdrawals}</h2>
              <span>{pendingWithdrawals.length}</span>
            </div>
            <div className="activity-list">
              {pendingWithdrawals.length === 0 && <p className="muted">{t.noPendingWithdrawals}</p>}
              {pendingWithdrawals.map((withdrawal) => (
                <div className="admin-deposit" key={withdrawal.id}>
                  <div>
                    <b>{withdrawal.name}</b>
                    <span>{formatMoney(withdrawal.amount)} ETB - {withdrawal.phone}</span>
                    <small>
                      {withdrawal.method === 'cbe' ? t.cbe : t.telebirr} -
                      {withdrawal.accountNumber}
                    </small>
                    <small>{t.accountName}: {withdrawal.accountName}</small>
                  </div>
                  <div className="admin-actions">
                    <button className="approve" onClick={() => approveWithdrawal(withdrawal.id)}>
                      <CheckCircle2 size={16} />
                      {t.paid}
                    </button>
                    <button className="reject" onClick={() => rejectWithdrawal(withdrawal.id)}>
                      <XCircle size={16} />
                      {t.reject}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="content-card">
          <div className="section-heading">
            <h2>{t.users}</h2>
            <span>{users.length}</span>
          </div>
          <div className="activity-list">
            {users.map((user) => (
              <div className="activity-row" key={user.id}>
                <div>
                  <b>{user.fullName}</b>
                  <small>
                    {user.rank} - {formatMoney(user.balance)} ETB - {user.validReferrals} {t.valid} -
                    {user.referralCode}
                  </small>
                </div>
                <Status status={user.approvedDeposits > 0 ? 'approved' : 'pending'} t={t} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="content-card safety-panel">
        <h2>{t.safety}</h2>
        <p>{t.safetyCopy}</p>
        <p className="muted">{t.supabaseMode}: {isSupabaseConfigured ? t.readyMode : t.mockMode}</p>
      </div>
    </section>
  );
}

function Stat({ icon: Icon, label, value, tone }) {
  return (
    <div className={`stat-card ${tone}`}>
      <Icon size={22} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Status({ status, t }) {
  const label = t?.[`${status}Status`] || status;
  return <span className={`status ${status}`}>{label}</span>;
}

function Mission({ done, label, reward }) {
  return (
    <div className={`mission ${done ? 'done' : ''}`}>
      <span>{done ? <CheckCircle2 size={18} /> : <Sparkles size={18} />}</span>
      <div>
        <b>{label}</b>
        <small>{reward}</small>
      </div>
    </div>
  );
}
