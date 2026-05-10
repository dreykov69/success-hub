const { useState, useEffect, useMemo } = React;

const translations = {
  en: {
    selectLanguage: "Select Language",
    continue: "Continue",
    login: "Login",
    register: "Register",
    fullName: "Full Name",
    phone: "Phone Number",
    password: "Password",
    referralCode: "Referral Code (Optional)",
    createAccount: "Create Account",
    signIn: "Sign In",
    dashboard: "Dashboard",
    balance: "Account Balance",
    referrals: "Referrals",
    rank: "Rank Level",
    pending: "Pending Rewards",
    inviteBtn: "Invite Friends & Earn",
    deposit: "Deposit",
    telebirrInst: "Send payment using Telebirr and upload your payment screenshot and transaction SMS.",
    pasteSms: "Paste Telebirr Transaction SMS",
    uploadBtn: "Upload Screenshot",
    verifyBtn: "Verify Transaction",
    processing: "Processing Payment...",
    underReview: "Transaction Under Review...",
    aiComplete: "AI Verification Complete!",
    copySuccess: "Copied!",
    leaderboard: "Top Earners Leaderboard",
    motivationalBanner: "Join the VIP tier and unlock unlimited earning potential!",
    motivationalTitle: "Level Up Your Income",
    successAlert: "Success!",
    errorAlert: "Error!",
    logout: "Logout",
    referralLinkGen: "Your Unique Invite Link:",
    validReferrals: "Valid Referrals",
    howItWorks: "How It Works & Rules",
    rule1: "1. Share your unique link.",
    rule2: "2. Your friend registers & makes a deposit.",
    rule3: "3. You receive 200 ETB for each valid referral!",
    vipPlans: "VIP Plans",
    insufficientBalance: "Insufficient balance! Redirecting to deposit...",
    upgradeSuccess: "Upgrade successful! Welcome to",
    currentPlan: "Current Plan",
    upgradeBtn: "Upgrade Now",
    earnPerRef1: "Earn ",
    earnPerRef2: " ETB per valid referral",
    prioritySupport: "Priority customer support",
    fastWithdrawal: "Faster withdrawal processing"
  },
  om: {
    selectLanguage: "Afaan Filadhu",
    continue: "Itti Fufi",
    login: "Seeni",
    register: "Galmoofthu",
    fullName: "Maqaa Guutuu",
    phone: "Lakkoofsa Bilbilaa",
    password: "Iccitii",
    referralCode: "Koodii Affeerrii (Dirqama Miti)",
    createAccount: "Herrega Bani",
    signIn: "Seeni",
    dashboard: "Daashboordii",
    balance: "Haftee Herregaa",
    referrals: "Affeerrii",
    rank: "Sadarkaa",
    pending: "Badhaasa Eegutti Jiru",
    inviteBtn: "Hiriyoota Affeerii Maallaqa Argadhu",
    deposit: "Maallaqa Galchi",
    telebirrInst: "Mallaqa Telebirriin ergaa keessatti suuraa kaffaltii fi ergaa transaction upload godhaa.",
    pasteSms: "Ergaa SMS Telebirr Asitti Maxxansi",
    uploadBtn: "Suuraa Olkaa'i",
    verifyBtn: "Kaffaltii Mirkaneessi",
    processing: "Kaffaltii Adeemsisaa Jira...",
    underReview: "Kaffaltiin Qoratamaa Jira...",
    aiComplete: "Mirkaneessi AI Xumurameera!",
    copySuccess: "Koppii Ta'eera!",
    leaderboard: "Gabatee Warra Irra Caalaan Argatan",
    motivationalBanner: "Sadarkaa VIPtti makamiitii carraa galii daangaa hin qabne bani!",
    motivationalTitle: "Galii Kee Guddisi",
    successAlert: "Milkaa'eera!",
    errorAlert: "Dogoggora!",
    logout: "Bahi",
    referralLinkGen: "Liinkii Affeerrii Kee:",
    validReferrals: "Affeerrii Mirkanaa'an",
    howItWorks: "Akkaataa Itti Hojjetu fi Seerota",
    rule1: "1. Liinkii kee qoodi.",
    rule2: "2. Hiriyyaan kee galmaa'ee maallaqa galcha.",
    rule3: "3. Affeerrii mirkanaa'e tokkoof 200 ETB argatta!",
    vipPlans: "Karoora VIP",
    insufficientBalance: "Hafteen hin ga'u! Gara galchutti qajeelchaa jira...",
    upgradeSuccess: "Fooyya'iinsi milkaa'eera! Baga nagaan gara",
    currentPlan: "Karoora Ammaa",
    upgradeBtn: "Amma Fooyyessi",
    earnPerRef1: "Affeerrii mirkanaa'e tokkoof ETB ",
    earnPerRef2: " argadhu",
    prioritySupport: "Dursa deeggarsa maamilaa",
    fastWithdrawal: "Adeemsa baasii saffisaa"
  },
  am: {
    selectLanguage: "ቋንቋ ይምረጡ",
    continue: "ቀጥል",
    login: "ግባ",
    register: "ተመዝገብ",
    fullName: "ሙሉ ስም",
    phone: "ስልክ ቁጥር",
    password: "የይለፍ ቃል",
    referralCode: "የመጋበዣ ኮድ (አማራጭ)",
    createAccount: "አካውንት ፍጠር",
    signIn: "ግባ",
    dashboard: "ዳሽቦርድ",
    balance: "የአካውንት ቀሪ ሂሳብ",
    referrals: "የተጋበዙ ሰዎች",
    rank: "ደረጃ",
    pending: "በመጠባበቅ ላይ ያለ ሽልማት",
    inviteBtn: "ጓደኞችን ይጋብዙ እና ያግኙ",
    deposit: "ገንዘብ ያስገቡ",
    telebirrInst: "በቴሌብር ክፍያውን ይላኩ እና የክፍያውን ስክሪንሾት እና የtransaction መልዕክት ያስገቡ።",
    pasteSms: "የቴሌብር SMS መልዕክት እዚህ ያስገቡ",
    uploadBtn: "ስክሪንሾት ጫን",
    verifyBtn: "ክፍያውን አረጋግጥ",
    processing: "ክፍያ በማስኬድ ላይ...",
    underReview: "ክፍያ በመገምገም ላይ...",
    aiComplete: "የ AI ማረጋገጫ ተጠናቋል!",
    copySuccess: "ኮፒ ተደርጓል!",
    leaderboard: "ከፍተኛ ገቢ ያገኙ",
    motivationalBanner: "የ VIP ደረጃን ይቀላቀሉ እና ያልተገደበ የገቢ አቅም ይክፈቱ!",
    motivationalTitle: "ገቢዎን ያሳድጉ",
    successAlert: "ተሳክቷል!",
    errorAlert: "ስህተት!",
    logout: "ውጣ",
    referralLinkGen: "የእርስዎ መጋበዣ ሊንክ፦",
    validReferrals: "ትክክለኛ ግብዣዎች",
    howItWorks: "እንዴት እንደሚሰራ እና ህጎች",
    rule1: "1. መጋበዣ ሊንክዎን ያጋሩ።",
    rule2: "2. ጓደኛዎ ይመዘገባል እና ገንዘብ ያስገባል።",
    rule3: "3. ለእያንዳንዱ ትክክለኛ ግብዣ 200 ETB ያገኛሉ!",
    vipPlans: "የ VIP እቅዶች",
    insufficientBalance: "ቀሪ ሂሳብዎ አነስተኛ ነው! ወደ ክፍያ ገጽ እየመራ ነው...",
    upgradeSuccess: "ማሻሻያው ተሳክቷል! እንኳን ደህና መጡ ወደ",
    currentPlan: "የአሁኑ እቅድ",
    upgradeBtn: "አሁን አሻሽል",
    earnPerRef1: "ለእያንዳንዱ ትክክለኛ ግብዣ ",
    earnPerRef2: " ETB ያግኙ",
    prioritySupport: "ልዩ የደንበኞች ድጋፍ",
    fastWithdrawal: "ፈጣን የገንዘብ ወጪ ሂደት"
  }
};

const DUMMY_LEADERBOARD = [
  { name: "Abebe K.", amount: "125,400 ETB" },
  { name: "Chaltu T.", amount: "98,200 ETB" },
  { name: "Dawit M.", amount: "84,500 ETB" },
  { name: "Hanna A.", amount: "76,100 ETB" },
  { name: "Gemechu B.", amount: "62,300 ETB" }
];

function App() {
  const [lang, setLang] = useState(null);
  const [page, setPage] = useState('lang_select'); // lang_select, auth, dashboard, deposit, verification
  const [user, setUser] = useState(null);
  const [referralParam, setReferralParam] = useState('');
  const [pendingUpgrade, setPendingUpgrade] = useState(null);

  const t = useMemo(() => lang ? translations[lang] : translations.en, [lang]);

  useEffect(() => {
    // Check URL for referral param
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) setReferralParam(ref);
  }, []);

  const switchLang = (newLang) => {
    setLang(newLang);
    if (page === 'lang_select') setPage('auth');
  };

  const TopNav = () => (
    <div className="top-nav">
      <div className="logo-text">Milkii<span className="logo-accent">Hub</span></div>
      
      {page !== 'lang_select' && page !== 'auth' && page !== 'verification' && (
        <div className="desktop-nav">
          <div className={`nav-item ${page === 'dashboard' ? 'active' : ''}`} onClick={() => setPage('dashboard')}>
            <div className="nav-icon">📊</div>
            <span>{t.dashboard}</span>
          </div>
          <div className={`nav-item ${page === 'deposit' ? 'active' : ''}`} onClick={() => setPage('deposit')}>
            <div className="nav-icon">💰</div>
            <span>{t.deposit}</span>
          </div>
          <div className={`nav-item ${page === 'vip' ? 'active' : ''}`} onClick={() => setPage('vip')}>
            <div className="nav-icon">👑</div>
            <span>{t.vipPlans}</span>
          </div>
          <div className="nav-item" onClick={() => { setUser(null); setPage('auth'); }}>
            <div className="nav-icon">🚪</div>
            <span>{t.logout}</span>
          </div>
        </div>
      )}

      <div className="lang-switch">
        <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
        <button className={`lang-btn ${lang === 'om' ? 'active' : ''}`} onClick={() => setLang('om')}>OM</button>
        <button className={`lang-btn ${lang === 'am' ? 'active' : ''}`} onClick={() => setLang('am')}>AM</button>
      </div>
    </div>
  );

  const BottomNav = () => (
    <div className="bottom-nav">
      <div className={`nav-item ${page === 'dashboard' ? 'active' : ''}`} onClick={() => setPage('dashboard')}>
        <div className="nav-icon">📊</div>
        <span>{t.dashboard}</span>
      </div>
      <div className={`nav-item ${page === 'deposit' ? 'active' : ''}`} onClick={() => setPage('deposit')}>
        <div className="nav-icon">💰</div>
        <span>{t.deposit}</span>
      </div>
      <div className={`nav-item ${page === 'vip' ? 'active' : ''}`} onClick={() => setPage('vip')}>
        <div className="nav-icon">👑</div>
        <span>{t.vipPlans || 'VIP'}</span>
      </div>
      <div className="nav-item" onClick={() => { setUser(null); setPage('auth'); }}>
        <div className="nav-icon">🚪</div>
        <span>{t.logout}</span>
      </div>
    </div>
  );

  if (page === 'lang_select') {
    return (
      <div className="container">
        <div className="lang-screen">
          <div className="logo-text mb-4" style={{fontSize: '40px', textAlign: 'center'}}>
            Milkii<span className="logo-accent">Hub</span>
          </div>
          <div className="card lang-card">
            <h2 className="text-center mb-4 text-secondary">Choose Language</h2>
            
            <div className={`lang-option ${lang === 'en' ? 'selected' : ''}`} onClick={() => switchLang('en')}>
              <span style={{fontWeight: 600, fontSize: '18px'}}>English</span>
              <div className="check-circle"></div>
            </div>
            
            <div className={`lang-option ${lang === 'om' ? 'selected' : ''}`} onClick={() => switchLang('om')}>
              <span style={{fontWeight: 600, fontSize: '18px'}}>Afaan Oromo</span>
              <div className="check-circle"></div>
            </div>
            
            <div className={`lang-option ${lang === 'am' ? 'selected' : ''}`} onClick={() => switchLang('am')}>
              <span style={{fontWeight: 600, fontSize: '18px'}}>አማርኛ</span>
              <div className="check-circle"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (page === 'auth') {
    return <AuthScreen t={t} lang={lang} TopNav={TopNav} setUser={setUser} setPage={setPage} referralParam={referralParam} />;
  }

  if (page === 'verification') {
    return <VerificationScene t={t} onComplete={() => setPage('dashboard')} />;
  }

  return (
    <div className="container dashboard-content">
      <TopNav />
      {page === 'dashboard' && <Dashboard t={t} user={user} setPage={setPage} />}
      {page === 'deposit' && <DepositScreen t={t} lang={lang} user={user} setUser={setUser} setPage={setPage} pendingUpgrade={pendingUpgrade} setPendingUpgrade={setPendingUpgrade} />}
      {page === 'vip' && <VipScreen t={t} user={user} setUser={setUser} setPage={setPage} setPendingUpgrade={setPendingUpgrade} />}
      <BottomNav />
    </div>
  );
}

function AuthScreen({ t, lang, TopNav, setUser, setPage, referralParam }) {
  const [isLogin, setIsLogin] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '', password: '', referrerCode: referralParam });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Fallback Mock Local Logic if backend is not running
    const endpoint = isLogin ? '/api/login' : '/api/register';
    
    try {
      const res = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      
      if (data.success) {
        setUser(data.user);
        setPage('dashboard');
      } else {
        setError(data.message || 'Error occurred');
      }
    } catch (err) {
      // Offline Mock Mode for demonstration
      if (isLogin) {
        setUser({ fullName: "Demo User", phone: form.phone, balance: 1200, validReferralsCount: 4, pendingReferralsCount: 2, rank: 'Starter', referralCode: 'MILKIIX99', pendingRewards: 400, hasDeposited: true, baseReferralReward: 200 });
      } else {
        const isRef = !!form.referrerCode;
        setUser({ fullName: form.fullName, phone: form.phone, balance: 0, validReferralsCount: 0, pendingReferralsCount: 0, rank: 'Starter', referralCode: 'MILKII' + Math.floor(Math.random()*1000), pendingRewards: 0, hasDeposited: false, invitedBy: form.referrerCode || null, baseReferralReward: 200 });
      }
      setPage('dashboard');
    }
  };

  return (
    <div className="container" style={{justifyContent: 'center'}}>
      <TopNav />
      
      <div className="auth-card-wrapper">
        <div className="card mt-4" style={{animation: 'fadeIn 0.5s ease-out'}}>
          <div className="tabs">
          <div className={`tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>{t.register}</div>
          <div className={`tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>{t.login}</div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label>{t.fullName}</label>
              <input type="text" required value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} />
            </div>
          )}
          
          <div className="input-group">
            <label>{t.phone}</label>
            <input type="tel" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
          
          <div className="input-group">
            <label>{t.password}</label>
            <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>

          {!isLogin && (
            <div className="input-group">
              <label>{t.referralCode}</label>
              <input 
                type="text" 
                value={form.referrerCode} 
                disabled={!!referralParam}
                onChange={e => setForm({...form, referrerCode: e.target.value})} 
                style={referralParam ? {borderColor: 'var(--eth-green)', color: 'var(--eth-green)'} : {}}
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary mt-2">
            {isLogin ? t.signIn : t.createAccount}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}

function Dashboard({ t, user, setPage }) {
  const inviteLink = `${window.location.origin}${window.location.pathname}?ref=${user?.referralCode}`;
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{animation: 'fadeIn 0.5s ease-out'}}>
      {/* Motivational Banner */}
      <div className="banner" style={{cursor: 'pointer'}} onClick={() => setPage('vip')}>
        <div className="banner-content">
          <div className="banner-icon">🚀</div>
          <div className="banner-text">
            <h4>{t.motivationalTitle}</h4>
            <p>{t.motivationalBanner}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          {/* User Info & Badges */}
          <div className="mb-3 d-flex" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <h2 style={{fontSize: '20px'}}>{user?.fullName}</h2>
          <div className="text-secondary" style={{fontSize: '13px'}}>{user?.phone}</div>
        </div>
        <div className={`badge ${user?.rank.includes('VIP') ? 'badge-vip' : ''}`}>
          {user?.rank || 'Starter'}
        </div>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        <div className="metric-card highlight">
          <div className="metric-label">{t.balance}</div>
          <div className="metric-value">{user?.balance?.toLocaleString() || '0'} <span className="currency">ETB</span></div>
        </div>
        
        <div className="metric-card">
          <div className="metric-label">{t.validReferrals}</div>
          <div className="metric-value text-green">{user?.validReferralsCount || '0'}</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-label">{t.pending}</div>
          <div className="metric-value text-red">{user?.pendingRewards?.toLocaleString() || '0'} <span className="currency">ETB</span></div>
        </div>
      </div>

          {/* Leaderboard */}
          <div className="leaderboard mb-4">
            <div className="lb-header">
              <h3>{t.leaderboard}</h3>
              <span className="badge">Live</span>
            </div>
            {DUMMY_LEADERBOARD.map((p, i) => (
              <div className="lb-item" key={i}>
                <div className={`lb-rank top-${i+1}`}>#{i+1}</div>
                <div className="lb-user">
                  <div className="lb-avatar">{p.name.charAt(0)}</div>
                  <div className="lb-name">{p.name}</div>
                </div>
                <div className="lb-amount">{p.amount}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-sidebar">
          {/* Invite Action */}
          <div className="card mb-4" style={{textAlign: 'center', borderColor: 'var(--eth-yellow)'}}>
            <h3 className="mb-2">{t.inviteBtn}</h3>
            <p className="text-secondary mb-3" style={{fontSize: '13px'}}>{t.referralLinkGen}</p>
            <div className="copy-box" style={{marginBottom: '16px', padding: '10px'}}>
              <div className="number" style={{fontSize: '14px', wordBreak: 'break-all'}}>{inviteLink}</div>
            </div>
            <button className="btn btn-vip" onClick={copyLink}>
              {copied ? t.copySuccess : 'Copy Link'}
            </button>
          </div>

          {/* Rules Section */}
          <div className="card mb-4" style={{background: 'rgba(0, 154, 68, 0.05)', borderColor: 'rgba(0, 154, 68, 0.2)'}}>
            <h3 className="mb-3 text-green" style={{fontSize: '16px'}}>{t.howItWorks}</h3>
            <div style={{fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)'}}>
              <p className="mb-2">{t.rule1}</p>
              <p className="mb-2">{t.rule2}</p>
              <p style={{color: 'var(--eth-yellow)', fontWeight: 'bold'}}>{user?.baseReferralReward ? `3. You receive ${user.baseReferralReward} ETB for each valid referral!` : t.rule3}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DepositScreen({ t, lang, user, setUser, setPage, pendingUpgrade, setPendingUpgrade }) {
  const [sms, setSms] = useState('');
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!sms) {
      setError('Please paste the SMS');
      return;
    }
    
    // Jump to verification scene
    setPage('verification');
    
    const applyUpgradeLogic = async (balance, depositedAmount) => {
      let finalBalance = balance + depositedAmount;
      let finalRank = user.rank;
      let finalReward = user.baseReferralReward;
      
      if (pendingUpgrade && finalBalance >= pendingUpgrade.price) {
        try {
          await fetch(`http://localhost:3000/api/upgrade`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: user.phone, tierName: pendingUpgrade.name, price: pendingUpgrade.price, newReward: pendingUpgrade.reward })
          });
        } catch(e) {}
        
        finalBalance -= pendingUpgrade.price;
        finalRank = pendingUpgrade.name;
        finalReward = pendingUpgrade.reward;
        setPendingUpgrade(null); 
      }
      
      setUser({ ...user, balance: finalBalance, hasDeposited: true, rank: finalRank, baseReferralReward: finalReward });
    };
    
    // Simulate backend call behind the scenes
    try {
      const res = await fetch(`http://localhost:3000/api/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: user.phone, smsText: sms })
      });
      const data = await res.json();
      
      setTimeout(() => {
        if (data.success) {
          applyUpgradeLogic(user.balance, data.amount);
        }
      }, 3500); // Wait for animation
    } catch (err) {
      // Offline Mode Fallback
      setTimeout(() => {
        const regex = /You have transferred ETB\s+(\d+(\.\d+)?)\s+to ashim shenko \(2519\*\*\*\*6250\)/i;
        const match = sms.match(regex);
        if (match) {
          applyUpgradeLogic(user.balance, parseFloat(match[1]));
        }
      }, 3500);
    }
  };

  return (
    <div style={{animation: 'fadeIn 0.5s ease-out'}} className="deposit-container">
      <div className="telebirr-logo">
        <div style={{display: 'inline-block', background: '#fff', padding: '10px', borderRadius: '16px'}}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Telebirr_Logo.png" alt="Telebirr" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerText = 'TELEBIRR'; e.target.parentElement.style.color = '#00a3e0'; e.target.parentElement.style.fontWeight = 'bold'; }} />
        </div>
      </div>

      {/* Multilingual Instructions Box */}
      <div className="multilingual-instruction">
        <p><strong>EN:</strong> Send payment using Telebirr and upload your payment screenshot and transaction SMS.</p>
        <p><strong>OM:</strong> Mallaqa Telebirriin ergaa keessatti suuraa kaffaltii fi ergaa transaction upload godhaa.</p>
        <p><strong>AM:</strong> በቴሌብር ክፍያውን ይላኩ እና የክፍያውን ስክሪንሾት እና የtransaction መልዕክት ያስገቡ።</p>
      </div>

      <div className="card mb-4">
        <h3 className="mb-3 text-center">Payment Details</h3>
        <div className="copy-box">
          <div className="number">0962186250</div>
          <button className="copy-btn" onClick={() => navigator.clipboard.writeText("0962186250")}>Copy</button>
        </div>

        <div className="upload-area">
          <div className="upload-icon">📷</div>
          <div style={{fontSize: '14px', color: 'var(--text-secondary)'}}>{t.uploadBtn}</div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="input-group">
          <label>{t.pasteSms}</label>
          <textarea 
            rows="5" 
            placeholder="Dear user You have transferred ETB ..."
            value={sms}
            onChange={(e) => setSms(e.target.value)}
          ></textarea>
        </div>

        <button className="btn btn-primary" onClick={handleVerify}>
          {t.verifyBtn}
        </button>
      </div>
    </div>
  );
}

function VerificationScene({ t, onComplete }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1500); // Processing -> Under Review
    const t2 = setTimeout(() => setStep(2), 3000); // Under Review -> Complete
    const t3 = setTimeout(() => onComplete(), 4500); // Finish
    
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  const texts = [
    t.processing,
    t.underReview,
    t.aiComplete
  ];

  return (
    <div className="container ai-loader-container" style={{animation: 'fadeIn 0.5s ease-out'}}>
      <div className="cyber-ring" style={step === 2 ? {borderColor: 'var(--eth-green)', animation: 'none', transform: 'scale(1.1)', transition: 'all 0.5s'} : {}}></div>
      <div className="loader-text" style={step === 2 ? {animation: 'none', color: '#fff'} : {}}>
        {texts[step]}
      </div>
      {step === 2 && (
        <div style={{marginTop: '20px', color: 'var(--eth-green)', fontSize: '24px'}}>✓</div>
      )}
    </div>
  );
}

function VipScreen({ t, user, setUser, setPage, setPendingUpgrade }) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const plans = [
    { id: 'silver', name: 'VIP Silver', price: 250, reward: 300, colorClass: 'silver' },
    { id: 'golden', name: 'VIP Golden', price: 450, reward: 400, colorClass: 'golden' },
    { id: 'platinum', name: 'VIP Platinum', price: 650, reward: 500, colorClass: 'platinum' },
    { id: 'diamond', name: 'VIP Diamond', price: 900, reward: 650, colorClass: 'diamond' }
  ];

  const handleUpgrade = async (plan) => {
    if (user.balance < plan.price) {
      setPendingUpgrade(plan);
      setError(t.insufficientBalance);
      setTimeout(() => setPage('deposit'), 2000);
      return;
    }
    
    // Simulate Backend
    try {
      const res = await fetch(`http://localhost:3000/api/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: user.phone, tierName: plan.name, price: plan.price, newReward: plan.reward })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setSuccess(`${t.upgradeSuccess} ${plan.name}!`);
        setError('');
      } else {
        setError(data.message);
      }
    } catch (err) {
      // Offline mock
      setUser({ ...user, balance: user.balance - plan.price, rank: plan.name, baseReferralReward: plan.reward });
      setSuccess(`${t.upgradeSuccess} ${plan.name}!`);
      setError('');
    }
  };

  return (
    <div className="vip-container" style={{animation: 'fadeIn 0.5s ease-out'}}>
      <h2 className="mb-4 text-center" style={{fontFamily: 'Outfit', fontWeight: 800, fontSize: '28px'}}>{t.vipPlans}</h2>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="vip-grid">
        {plans.map(p => (
          <div key={p.id} className={`vip-card ${p.colorClass}`}>
            <div className="vip-header">
              <div className="vip-title">{p.name}</div>
              <div className="vip-price">{p.price} <span>ETB</span></div>
            </div>
            
            <ul className="vip-benefits">
              <li>{t.earnPerRef1}<strong>{p.reward}</strong>{t.earnPerRef2}</li>
              <li>{t.prioritySupport}</li>
              <li>{t.fastWithdrawal}</li>
            </ul>
            
            {user.rank === p.name ? (
              <button className="btn btn-outline" disabled>{t.currentPlan}</button>
            ) : (
              <button className="btn btn-primary" onClick={() => handleUpgrade(p)}>{t.upgradeBtn}</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
