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
  Settings,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react';
import { adminCredentials, isLocalDemoAdminEnabled, paymentInfo } from './data/content.js';
import { isSupabaseConfigured } from './lib/supabase.js';
import {
  MIN_WITHDRAWAL_ETB,
  WITHDRAWAL_REFERRAL_REQUIREMENT,
  betGames,
  canWithdraw,
  cryptoRandomInt,
  dailyGames,
  defaultGameSettings,
  etbToPoints,
  formatClockCountdown,
  getEthiopiaHalfDayKey,
  getNextEthiopiaHalfDayReset,
  getEthiopiaDayKey,
  getPlanLevel,
  hasSilverOrAbove,
  pointsToEtb,
  shuffle,
  vipPlans,
  weightedPick,
} from './lib/platformRules.js';

const storageKeys = {
  users: 'milkii.users.v2',
  deposits: 'milkii.deposits.v2',
  withdrawals: 'milkii.withdrawals.v2',
  gameLogs: 'milkii.gameLogs.v2',
  gameSettings: 'milkii.gameSettings.v2',
  fakeLeaderboard: 'milkii.fakeLeaderboard.v1',
};

const copy = {
  en: {
    english: 'English',
    afaanOromo: 'Afaan Oromo',
    amharic: 'Amharic',
    chooseLanguage: 'Choose your language',
    languageCopy: 'Registration instructions, dashboard rules, games and admin labels will follow this language.',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    dashboard: 'Dashboard',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    play: 'Games',
    vip: 'VIP',
    referrals: 'Referrals',
    admin: 'Admin',
    balance: 'Money balance',
    points: 'Points balance',
    pending: 'Pending',
    approved: 'Approved',
    rank: 'Rank',
    startNow: 'Start now',
    heroTitle: 'Milkii Hub referral platform',
    heroCopy: 'Earn mainly from valid referrals. Games are entertainment and points only until withdrawal requirements are met.',
    authTitle: 'Read the rules before registration',
    authCopy: 'A valid referral is created only when your invited person becomes VIP Silver or higher.',
    fullName: 'Full name',
    email: 'Email or username',
    phone: 'Phone number',
    password: 'Password',
    referralCode: 'Referral code',
    createAccount: 'Create account',
    signIn: 'Sign in',
    back: 'Back',
    invalidLogin: 'Invalid email, username or password.',
    emailExists: 'Email already exists.',
    phoneExists: 'Phone already exists.',
    acceptRules: 'I have read and understand the rules',
    acceptNeeded: 'You must accept the rules before registration.',
    rulesTitle: 'How this system works',
    validInvite: 'Valid invite',
    validInviteCopy: 'A person you invite becomes valid only when admin approves their VIP Silver or higher upgrade. If they do not become VIP Silver, you get no referral money from them.',
    withdrawRule: 'Withdrawal rule',
    withdrawRuleCopy: `You can withdraw only after you are VIP Silver or higher and have ${WITHDRAWAL_REFERRAL_REQUIREMENT} valid referrals.`,
    warning: 'Warning',
    warningCopy: 'You risk losing your deposit if you cannot invite enough people who become VIP Silver. Admin has final authority on withdrawals.',
    vipLevels: 'VIP levels and earnings',
    freePlan: 'Free plan users can invite, but cannot withdraw and do not receive referral money until becoming VIP.',
    requestVip: 'Request upgrade',
    currentPlan: 'Current plan',
    included: 'Included',
    perValidInvite: 'ETB per valid referral',
    depositTitle: 'Submit deposit for admin review',
    depositCopy: 'Send payment, upload proof, and paste the transaction message. Admin approval updates VIP level or money balance.',
    amount: 'Amount',
    screenshot: 'Payment screenshot',
    chooseImageProof: 'Choose proof image',
    sms: 'Transaction SMS',
    submitDeposit: 'Submit deposit',
    paymentNumber: 'Payment number',
    paymentName: 'Account name',
    manualReview: 'Manual review',
    depositSafety: 'Users cannot approve their own deposits. VIP upgrades and balances must be approved by admin.',
    welcome: (name) => `Welcome, ${name}`,
    dashboardCopy: 'Invite people who become VIP Silver, manage deposits, and play entertainment games.',
    validReferrals: 'Valid referrals',
    withdrawLocked: 'Withdraw locked',
    withdrawOpen: 'Withdraw open',
    requirementMessage: (missing, vipOk) =>
      vipOk
        ? `You still need ${missing} valid referral${missing === 1 ? '' : 's'}.`
        : `Upgrade to VIP Silver or higher and collect ${missing} more valid referral${missing === 1 ? '' : 's'}.`,
    inviteFriends: 'Invite friends',
    copyLink: 'Copy link',
    copied: 'Copied',
    recentActivity: 'Recent activity',
    noActivity: 'No activity yet.',
    topWithdrawals: 'Top withdrawals',
    updatedDaily: 'Updated daily at midnight',
    withdrawalCenter: 'Withdrawal center',
    withdrawCopy: `Minimum withdrawal is ${MIN_WITHDRAWAL_ETB} ETB. Admin approves or rejects every request.`,
    withdrawalMethod: 'Withdrawal method',
    cbe: 'Commercial Bank of Ethiopia',
    telebirr: 'Telebirr',
    accountName: 'Account name',
    accountNumber: 'Account number or phone',
    requestWithdrawal: 'Request withdrawal',
    withdrawalSubmitted: 'Withdrawal request submitted.',
    enterWithdrawalAmount: 'Enter a withdrawal amount.',
    withdrawalTooHigh: 'Amount is higher than your available balance.',
    withdrawalTooSmall: `Minimum withdrawal is ${MIN_WITHDRAWAL_ETB} ETB.`,
    loginFirst: 'Please login first.',
    noWithdrawals: 'No withdrawal requests yet.',
    dailyPlay: 'Daily play and earn',
    betPlay: 'Bet and earn',
    nextFree: 'Next free chance in',
    freeReady: 'Free chance ready',
    playNow: 'Play now',
    cashOut: 'Cash out',
    roll: 'Roll',
    spin: 'Spin',
    drop: 'Drop',
    selectBet: 'Select bet',
    walletType: 'Wallet',
    moneyWallet: 'Money',
    pointsWallet: 'Points',
    gameResult: 'Game result',
    noFreeChance: 'Daily free chance already used. Use a paid bet or wait for reset.',
    insufficientBalance: 'Not enough balance for this bet.',
    adminTitle: 'Admin command center',
    adminCopy: 'Approve deposits, process withdrawals, adjust balances, review game logs, and tune odds.',
    users: 'Users',
    pendingDeposits: 'Pending deposits',
    pendingWithdrawals: 'Pending withdrawals',
    totalBalances: 'Total balances',
    approve: 'Approve',
    reject: 'Reject',
    paid: 'Paid',
    proof: 'Proof',
    vipUpgrade: 'VIP upgrade',
    adjustBalances: 'Adjust balances',
    addPoints: 'Add points',
    addMoney: 'Add money',
    removePoints: 'Remove points',
    removeMoney: 'Remove money',
    gameLogs: 'Game logs',
    oddsSettings: 'Game odds settings',
    saveSettings: 'Save settings',
    noLogs: 'No game logs yet.',
    supabaseMode: 'Supabase mode',
    readyMode: 'Ready',
    mockMode: 'Mock/local demo',
    approvedStatus: 'approved',
    pendingStatus: 'pending',
    rejectedStatus: 'rejected',
    paidStatus: 'paid',
  },
  om: {
    english: 'English',
    afaanOromo: 'Afaan Oromo',
    amharic: 'Afaan Amaaraa',
    chooseLanguage: 'Afaan kee filadhu',
    languageCopy: 'Qajeelfamni galmee, daashboordii, taphoonni fi admin afaan kanaan mulatu.',
    login: 'Seeni',
    register: 'Galmaa\'i',
    logout: 'Bahi',
    dashboard: 'Daashboordii',
    deposit: 'Kaffaltii',
    withdraw: 'Baafachuu',
    play: 'Taphoota',
    vip: 'VIP',
    referrals: 'Affeerraa',
    admin: 'Bulchaa',
    balance: 'Haftee maallaqaa',
    points: 'Qabxii',
    pending: 'Eeggachaa jira',
    approved: 'Mirkanaa\'e',
    rank: 'Sadarkaa',
    startNow: 'Amma jalqabi',
    heroTitle: 'Waltajjii affeerraa Milkii Hub',
    heroCopy: 'Galiin guddaan affeerraa mirkanaa\'e irraa dhufa. Taphoonni bashannanaafi qabxii qofa hanga ulaagaa baafannaa guuttanitti.',
    authTitle: 'Galmaa\'uu dura seera dubbisi',
    authCopy: 'Affeerraan valid ta\'u namni affeerame VIP Silver ykn isaa ol yoo ta\'e qofa.',
    fullName: 'Maqaa guutuu',
    email: 'Imeelii ykn maqaa fayyadamaa',
    phone: 'Lakkoofsa bilbilaa',
    password: 'Jecha iccitii',
    referralCode: 'Koodii affeerraa',
    createAccount: 'Herrega bani',
    signIn: 'Seeni',
    back: 'Deebi\'i',
    invalidLogin: 'Imeelii, maqaa fayyadamaa ykn jechi iccitii sirrii miti.',
    emailExists: 'Imeeliin kun duraan jira.',
    phoneExists: 'Lakkoofsi kun duraan jira.',
    acceptRules: 'Seera dubbisee hubadheera',
    acceptNeeded: 'Galmaa\'uuf seera fudhachuun dirqama.',
    rulesTitle: 'Sirni kun akkamitti hojjeta',
    validInvite: 'Affeerraa valid',
    validInviteCopy: 'Namni ati affeertte VIP Silver ykn isaa ol yoo admin mirkaneesse qofa valid ta\'a. Yoo VIP Silver hin ta\'in maallaqa affeerraa hin argattu.',
    withdrawRule: 'Seera baafannaa',
    withdrawRuleCopy: `Baafachuu kan dandeessu VIP Silver ykn isaa ol taatee affeerraa valid ${WITHDRAWAL_REFERRAL_REQUIREMENT} yoo qabaatte qofa.`,
    warning: 'Akeekkachiisa',
    warningCopy: 'Namoota gahaa VIP Silver ta\'an affeeruu yoo dadhabde deposit kee dhabuu dandeessa. Admin murtii dhumaa qaba.',
    vipLevels: 'Sadarkaa VIP fi galii',
    freePlan: 'Free plan namoota affeeruu danda\'a, garuu VIP ta\'uu malee hin baafatu, maallaqa affeerraas hin argatu.',
    requestVip: 'Upgrade gaafadhu',
    currentPlan: 'Plan ammaa',
    included: 'Dabalameera',
    perValidInvite: 'ETB affeerraa valid tokkoof',
    depositTitle: 'Kaffaltii admin akka ilaalu galchi',
    depositCopy: 'Kaffaltii ergi, ragaa olkaa\'i, ergaa transaction maxxansi. Admin yoo mirkaneesse VIP ykn hafteen jijjiirama.',
    amount: 'Hamma',
    screenshot: 'Suuraa ragaa kaffaltii',
    chooseImageProof: 'Ragaa filadhu',
    sms: 'SMS transaction',
    submitDeposit: 'Kaffaltii galchi',
    paymentNumber: 'Lakkoofsa kaffaltii',
    paymentName: 'Maqaa herregaa',
    manualReview: 'Qorannoo harkaa',
    depositSafety: 'Fayyadamaan deposit ofii mirkaneessuu hin danda\'u. VIP fi balance adminiin mirkanaa\'uu qaba.',
    welcome: (name) => `Baga nagaan dhuftu, ${name}`,
    dashboardCopy: 'Namoota VIP Silver ta\'an affeeri, deposit hordofi, taphoota bashannanaa taphadhu.',
    validReferrals: 'Affeerraa valid',
    withdrawLocked: 'Baafannaan cufame',
    withdrawOpen: 'Baafannaan baname',
    requirementMessage: (missing, vipOk) =>
      vipOk ? `Affeerraa valid ${missing} si hafa.` : `VIP Silver ykn isaa ol ta\'i; affeerraa valid ${missing} si hafa.`,
    inviteFriends: 'Hiriyoota affeeri',
    copyLink: 'Link copy godhi',
    copied: 'Copy ta\'e',
    recentActivity: 'Sochii dhihoo',
    noActivity: 'Sochiin hin jiru.',
    topWithdrawals: 'Baafannaa olaanaa',
    updatedDaily: 'Guyyaa guyyaan halkan walakkaatti haaromfama',
    withdrawalCenter: 'Wiirtuu baafannaa',
    withdrawCopy: `Baafannaan xiqqaan ${MIN_WITHDRAWAL_ETB} ETB. Admin gaaffii hundaa ni mirkaneessa ykn ni kuffisa.`,
    withdrawalMethod: 'Mala baafannaa',
    cbe: 'Commercial Bank of Ethiopia',
    telebirr: 'Telebirr',
    accountName: 'Maqaa herregaa',
    accountNumber: 'Lakkoofsa herregaa ykn bilbilaa',
    requestWithdrawal: 'Baafannaa gaafadhu',
    withdrawalSubmitted: 'Gaaffiin baafannaa ergameera.',
    enterWithdrawalAmount: 'Hamma baafannaa galchi.',
    withdrawalTooHigh: 'Hamma haftee caala.',
    withdrawalTooSmall: `Baafannaan xiqqaan ${MIN_WITHDRAWAL_ETB} ETB.`,
    loginFirst: 'Jalqaba seeni.',
    noWithdrawals: 'Gaaffiin baafannaa hin jiru.',
    dailyPlay: 'Tapha guyyaa fi argachuu',
    betPlay: 'Bet godhii taphadhu',
    nextFree: 'Carraan bilisaa itti aanu',
    freeReady: 'Carraan bilisaa qophaa\'eera',
    playNow: 'Amma taphadhu',
    cashOut: 'Cash out',
    roll: 'Roll',
    spin: 'Spin',
    drop: 'Drop',
    selectBet: 'Bet filadhu',
    walletType: 'Wallet',
    moneyWallet: 'Maallaqa',
    pointsWallet: 'Qabxii',
    gameResult: 'Bu\'aa taphaa',
    noFreeChance: 'Carraan bilisaa guyyaa kanaa fayyadamameera.',
    insufficientBalance: 'Balance gahaa hin qabu.',
    adminTitle: 'Wiirtuu admin',
    adminCopy: 'Deposit mirkaneessi, baafannaa hojjadhu, balance sirreessi, game log ilaali, odds jijjiiri.',
    users: 'Fayyadamtoota',
    pendingDeposits: 'Deposit eeggachaa jiru',
    pendingWithdrawals: 'Baafannaa eeggachaa jiru',
    totalBalances: 'Haftee waliigalaa',
    approve: 'Mirkaneessi',
    reject: 'Kuffisi',
    paid: 'Kaffalame',
    proof: 'Ragaa',
    vipUpgrade: 'VIP upgrade',
    adjustBalances: 'Balance sirreessi',
    addPoints: 'Qabxii dabali',
    addMoney: 'Maallaqa dabali',
    removePoints: 'Qabxii hir\'isi',
    removeMoney: 'Maallaqa hir\'isi',
    gameLogs: 'Game logs',
    oddsSettings: 'Odds taphaa',
    saveSettings: 'Save godhi',
    noLogs: 'Game log hin jiru.',
    supabaseMode: 'Supabase mode',
    readyMode: 'Qophaa\'e',
    mockMode: 'Mock/local demo',
    approvedStatus: 'mirkanaa\'e',
    pendingStatus: 'eeggachaa jira',
    rejectedStatus: 'kuffifame',
    paidStatus: 'kaffalame',
  },
  am: {
    english: 'English',
    afaanOromo: 'Afaan Oromo',
    amharic: 'አማርኛ',
    chooseLanguage: 'ቋንቋዎን ይምረጡ',
    languageCopy: 'የምዝገባ መመሪያ፣ ዳሽቦርድ፣ ጨዋታዎች እና አድሚን ጽሁፎች በዚህ ቋንቋ ይታያሉ።',
    login: 'ግባ',
    register: 'ተመዝገብ',
    logout: 'ውጣ',
    dashboard: 'ዳሽቦርድ',
    deposit: 'ተቀማጭ',
    withdraw: 'ማውጣት',
    play: 'ጨዋታዎች',
    vip: 'VIP',
    referrals: 'ግብዣዎች',
    admin: 'አድሚን',
    balance: 'የገንዘብ ቀሪ',
    points: 'የነጥብ ቀሪ',
    pending: 'በመጠባበቅ',
    approved: 'ጸድቋል',
    rank: 'ደረጃ',
    startNow: 'አሁን ጀምር',
    heroTitle: 'Milkii Hub የግብዣ መድረክ',
    heroCopy: 'ዋናው ገቢ ከትክክለኛ ግብዣ ነው። ጨዋታዎች ለመዝናኛ ናቸው፤ የማውጣት መስፈርት እስኪሟላ ድረስ ነጥብ ብቻ ናቸው።',
    authTitle: 'ከመመዝገብዎ በፊት ህጎቹን ያንብቡ',
    authCopy: 'ትክክለኛ ግብዣ የሚሆነው የጋበዙት ሰው VIP Silver ወይም ከዚያ በላይ ሲሆን ብቻ ነው።',
    fullName: 'ሙሉ ስም',
    email: 'ኢሜይል ወይም የተጠቃሚ ስም',
    phone: 'ስልክ ቁጥር',
    password: 'የይለፍ ቃል',
    referralCode: 'የግብዣ ኮድ',
    createAccount: 'አካውንት ፍጠር',
    signIn: 'ግባ',
    back: 'ተመለስ',
    invalidLogin: 'ኢሜይል፣ የተጠቃሚ ስም ወይም የይለፍ ቃል ትክክል አይደለም።',
    emailExists: 'ይህ ኢሜይል አስቀድሞ አለ።',
    phoneExists: 'ይህ ስልክ ቁጥር አስቀድሞ አለ።',
    acceptRules: 'ህጎቹን አንብቤ ተረድቻለሁ',
    acceptNeeded: 'ከመመዝገብዎ በፊት ህጎቹን መቀበል አለብዎት።',
    rulesTitle: 'ይህ ሲስተም እንዴት ይሰራል',
    validInvite: 'ትክክለኛ ግብዣ',
    validInviteCopy: 'የጋበዙት ሰው VIP Silver ወይም ከዚያ በላይ ሲሆን እና አድሚን ሲያጸድቀው ብቻ valid ይሆናል። VIP Silver ካልሆነ የግብዣ ገንዘብ አያገኙም።',
    withdrawRule: 'የማውጣት ህግ',
    withdrawRuleCopy: `ገንዘብ ማውጣት የሚቻለው VIP Silver ወይም ከዚያ በላይ ሲሆኑ እና ${WITHDRAWAL_REFERRAL_REQUIREMENT} valid ግብዣዎች ሲኖሩዎት ብቻ ነው።`,
    warning: 'ማስጠንቀቂያ',
    warningCopy: 'VIP Silver የሚሆኑ በቂ ሰዎችን መጋበዝ ካልቻሉ ተቀማጭዎን ሊያጡ ይችላሉ። አድሚን የመጨረሻ ውሳኔ አለው።',
    vipLevels: 'VIP ደረጃዎች እና ገቢ',
    freePlan: 'Free plan ሰዎችን መጋበዝ ይችላል፣ ግን VIP እስኪሆን ድረስ ማውጣት እና የግብዣ ገንዘብ አያገኝም።',
    requestVip: 'Upgrade ጠይቅ',
    currentPlan: 'የአሁኑ ፕላን',
    included: 'ተካትቷል',
    perValidInvite: 'ETB ለአንድ valid ግብዣ',
    depositTitle: 'ተቀማጭ ለአድሚን ምርመራ ያስገቡ',
    depositCopy: 'ክፍያ ይላኩ፣ ማስረጃ ያስገቡ፣ transaction SMS ይለጥፉ። አድሚን ሲያጸድቅ VIP ወይም ቀሪ ይቀየራል።',
    amount: 'መጠን',
    screenshot: 'የክፍያ ማስረጃ',
    chooseImageProof: 'ማስረጃ ይምረጡ',
    sms: 'Transaction SMS',
    submitDeposit: 'ተቀማጭ አስገባ',
    paymentNumber: 'የክፍያ ቁጥር',
    paymentName: 'የአካውንት ስም',
    manualReview: 'የእጅ ምርመራ',
    depositSafety: 'ተጠቃሚ የራሱን ተቀማጭ ማጽደቅ አይችልም። VIP እና balance በአድሚን መጽደቅ አለባቸው።',
    welcome: (name) => `እንኳን ደህና መጡ፣ ${name}`,
    dashboardCopy: 'VIP Silver የሚሆኑ ሰዎችን ይጋብዙ፣ ተቀማጭ ይከታተሉ፣ የመዝናኛ ጨዋታዎችን ይጫወቱ።',
    validReferrals: 'Valid ግብዣዎች',
    withdrawLocked: 'ማውጣት ተቆልፏል',
    withdrawOpen: 'ማውጣት ተከፍቷል',
    requirementMessage: (missing, vipOk) =>
      vipOk ? `${missing} valid ግብዣዎች ይቀሩዎታል።` : `VIP Silver ወይም ከዚያ በላይ ይሁኑ፣ ${missing} valid ግብዣዎች ይቀሩዎታል።`,
    inviteFriends: 'ጓደኞችን ጋብዝ',
    copyLink: 'ሊንክ ቅዳ',
    copied: 'ተቀድቷል',
    recentActivity: 'የቅርብ እንቅስቃሴ',
    noActivity: 'እስካሁን እንቅስቃሴ የለም።',
    topWithdrawals: 'ከፍተኛ ማውጣቶች',
    updatedDaily: 'በየቀኑ እኩለ ሌሊት ይዘምናል',
    withdrawalCenter: 'የማውጣት ማዕከል',
    withdrawCopy: `ዝቅተኛ ማውጣት ${MIN_WITHDRAWAL_ETB} ETB ነው። አድሚን ሁሉንም ጥያቄ ያጸድቃል ወይም ይቃወማል።`,
    withdrawalMethod: 'የማውጣት ዘዴ',
    cbe: 'Commercial Bank of Ethiopia',
    telebirr: 'Telebirr',
    accountName: 'የአካውንት ስም',
    accountNumber: 'የአካውንት ቁጥር ወይም ስልክ',
    requestWithdrawal: 'ማውጣት ጠይቅ',
    withdrawalSubmitted: 'የማውጣት ጥያቄ ተልኳል።',
    enterWithdrawalAmount: 'የማውጣት መጠን ያስገቡ።',
    withdrawalTooHigh: 'መጠኑ ካለው balance በላይ ነው።',
    withdrawalTooSmall: `ዝቅተኛ ማውጣት ${MIN_WITHDRAWAL_ETB} ETB ነው።`,
    loginFirst: 'መጀመሪያ ይግቡ።',
    noWithdrawals: 'የማውጣት ጥያቄ የለም።',
    dailyPlay: 'ዕለታዊ ጨዋታ እና ነጥብ',
    betPlay: 'Bet እና ጨዋታ',
    nextFree: 'ቀጣይ ነፃ እድል',
    freeReady: 'ነፃ እድል ዝግጁ ነው',
    playNow: 'አሁን ተጫወት',
    cashOut: 'Cash out',
    roll: 'Roll',
    spin: 'Spin',
    drop: 'Drop',
    selectBet: 'Bet ምረጥ',
    walletType: 'Wallet',
    moneyWallet: 'ገንዘብ',
    pointsWallet: 'ነጥብ',
    gameResult: 'የጨዋታ ውጤት',
    noFreeChance: 'የዛሬ ነፃ እድል ተጠቅመዋል።',
    insufficientBalance: 'ለዚህ bet በቂ balance የለም።',
    adminTitle: 'የአድሚን ማዕከል',
    adminCopy: 'ተቀማጭ አጽድቅ፣ ማውጣት አካሂድ፣ balance አስተካክል፣ game logs ተመልከት፣ odds ቀይር።',
    users: 'ተጠቃሚዎች',
    pendingDeposits: 'በመጠባበቅ ላይ ያሉ ተቀማጮች',
    pendingWithdrawals: 'በመጠባበቅ ላይ ያሉ ማውጣቶች',
    totalBalances: 'ጠቅላላ balance',
    approve: 'አጽድቅ',
    reject: 'ውድቅ',
    paid: 'ተከፍሏል',
    proof: 'ማስረጃ',
    vipUpgrade: 'VIP upgrade',
    adjustBalances: 'Balance አስተካክል',
    addPoints: 'ነጥብ ጨምር',
    addMoney: 'ገንዘብ ጨምር',
    removePoints: 'ነጥብ ቀንስ',
    removeMoney: 'ገንዘብ ቀንስ',
    gameLogs: 'Game logs',
    oddsSettings: 'የጨዋታ odds',
    saveSettings: 'Save',
    noLogs: 'Game log የለም።',
    supabaseMode: 'Supabase mode',
    readyMode: 'ዝግጁ',
    mockMode: 'Mock/local demo',
    approvedStatus: 'ጸድቋል',
    pendingStatus: 'በመጠባበቅ',
    rejectedStatus: 'ውድቅ',
    paidStatus: 'ተከፍሏል',
  },
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
    balance: 1250,
    pointsBalance: 420,
    pendingAmount: 0,
    approvedDeposits: 2,
    validReferrals: 7,
    pendingReferrals: 2,
    rank: 'VIP Silver',
    xp: 640,
    streak: 6,
    pendingWithdrawal: 0,
    approvedWithdrawals: 0,
    onboardingSeen: true,
    referralRewarded: false,
    dailyUsage: {},
  },
];

const initialDeposits = [];
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

const ethiopianFirstNames = [
  'Alemitu',
  'Tigist',
  'Meseret',
  'Genet',
  'Worku',
  'Meselech',
  'Bekelech',
  'Tsehay',
  'Almaz',
  'Askale',
  'Abebech',
  'Yeshi',
  'Hiwot',
  'Mulu',
  'Frehiwot',
  'Tesfaye',
  'Girma',
  'Kebede',
  'Alemu',
  'Tadesse',
  'Bekele',
  'Haile',
  'Solomon',
  'Daniel',
  'Samuel',
  'Tekle',
  'Berhanu',
  'Assefa',
  'Demeke',
  'Fikre',
];

const lastInitials = ['A', 'B', 'D', 'G', 'H', 'K', 'M', 'S', 'T', 'W'];

function randomAmount(min, max, roundTo = 50) {
  const raw = cryptoRandomInt(Math.ceil(min / roundTo), Math.floor(max / roundTo)) * roundTo;
  return Math.max(min, Math.min(max, raw));
}

function makeDisplayName(excluded = []) {
  const combinations = ethiopianFirstNames.flatMap((firstName) =>
    lastInitials.map((initial) => ({ firstName, label: `${firstName} ${initial}.` })),
  );
  const available = combinations.filter((name) => !excluded.includes(name.label));
  const pool = available.length > 0 ? available : combinations;
  return pool[cryptoRandomInt(0, pool.length - 1)];
}

function getDailyFakeLeaderboard() {
  const dayKey = getEthiopiaDayKey();
  const saved = readStore(storageKeys.fakeLeaderboard, null);
  if (saved?.dayKey === dayKey && Array.isArray(saved.entries)) return saved.entries;

  const sevenDayHistory = Array.isArray(saved?.history) ? saved.history.slice(-70) : [];
  const used = [];
  const entries = Array.from({ length: 10 }, (_, index) => {
    const name = makeDisplayName([...sevenDayHistory, ...used]);
    used.push(name.label);
    return {
      id: `${dayKey}-${index}`,
      rank: index + 1,
      name: name.label,
      amount: randomAmount(1000, 50000, 250),
    };
  }).sort((a, b) => b.amount - a.amount).map((entry, index) => ({ ...entry, rank: index + 1 }));

  writeStore(storageKeys.fakeLeaderboard, {
    dayKey,
    entries,
    history: [...sevenDayHistory, ...used].slice(-210),
  });
  return entries;
}

function makeWithdrawalToast(recentNames = []) {
  const name = makeDisplayName(recentNames);
  const bank = Math.random() < 0.7 ? 'Commercial Bank of Ethiopia' : 'Telebirr';
  return {
    id: createId(),
    firstName: name.firstName,
    name: name.label,
    text: `${name.label} withdrew ${formatMoney(randomAmount(500, 15000, 100))} ETB via ${bank}`,
  };
}

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function makeReferralCode(name = 'MILKII') {
  const prefix = name.replace(/[^a-z]/gi, '').slice(0, 3).toUpperCase() || 'MIL';
  return `${prefix}${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function normalizePhone(value = '') {
  return value.replace(/[^\d+]/g, '');
}

function normalizeUser(user) {
  return {
    approvedDeposits: 0,
    approvedWithdrawals: 0,
    balance: 0,
    pointsBalance: user.gamePoints || 0,
    dailyUsage: {},
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
  };
}

function getRequirementMessage(user, t) {
  const missing = Math.max(0, WITHDRAWAL_REFERRAL_REQUIREMENT - Number(user?.validReferrals || 0));
  return t.requirementMessage(missing, hasSilverOrAbove(user));
}

function getGameUsage(user, gameId) {
  const periodKey = getEthiopiaHalfDayKey();
  const entry = user.dailyUsage?.[gameId];
  return entry?.periodKey === periodKey ? entry : null;
}

function userDailyCount(user, gameId) {
  const entry = getGameUsage(user, gameId);
  return entry ? Number(entry.count || 0) : 0;
}

function freeChanceAvailable(user, game) {
  return userDailyCount(user, game.id) < game.freeLimit;
}

const slotSymbols = [
  { label: 'Cherry', icon: '🍒', weight: 30, multiplier: 2 },
  { label: 'Lemon', icon: '🍋', weight: 24, multiplier: 3 },
  { label: 'Orange', icon: '🍊', weight: 18, multiplier: 4 },
  { label: 'Bell', icon: '🔔', weight: 12, multiplier: 5 },
  { label: 'Star', icon: '⭐', weight: 7, multiplier: 10 },
  { label: 'Seven', icon: '7', weight: 3, multiplier: 20 },
  { label: 'Diamond', icon: '💎', weight: 1, multiplier: 50 },
];

const prizeIcons = {
  Empty: '📦',
  'Empty box': '📦',
  'Small gem': '💎',
  'Gold coin': '🪙',
  'Treasure chest': '💰',
  Diamond: '💍',
  Jackpot: '💎',
  'Tiny prize': '🎁',
  'Small prize': '💎',
  'Medium prize': '🪙',
  'Completed board': '🧠',
};

const memorySymbols = ['🍎', '🍌', '🍒', '🍇', '🍊', '🍉', '🥝', '🥭'];
const plinkoMultipliers = [0, 0.5, 1, 2, 3, 5, 10, 0];
const betAmounts = [5, 10, 20, 50, 100];

function resultText(result) {
  if (!result) return '';
  const wallet = result.wallet === 'points' ? 'points' : 'ETB';
  const amount = result.wallet === 'points' ? formatMoney(result.win) : `${formatMoney(result.win)} ETB`;
  return result.win > 0 ? `${result.status}: won ${amount}` : `${result.status}: no win`;
}

export default function App() {
  const [language, setLanguage] = useState(() => localStorage.getItem('milkii.lang') || '');
  const [users, setUsers] = useState(() => readStore(storageKeys.users, initialUsers).map(normalizeUser));
  const [deposits, setDeposits] = useState(() => readStore(storageKeys.deposits, initialDeposits));
  const [withdrawals, setWithdrawals] = useState(() => readStore(storageKeys.withdrawals, initialWithdrawals));
  const [gameLogs, setGameLogs] = useState(() => readStore(storageKeys.gameLogs, []));
  const [gameSettings, setGameSettings] = useState(() =>
    readStore(storageKeys.gameSettings, defaultGameSettings),
  );
  const [session, setSession] = useState(null);
  const [page, setPage] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [vipNotice, setVipNotice] = useState('');
  const [leaderboard, setLeaderboard] = useState(() => getDailyFakeLeaderboard());
  const [withdrawalToasts, setWithdrawalToasts] = useState([]);
  const recentToastNames = useRef([]);
  const t = copy[language || 'en'];

  const currentUser = users.find((user) => user.id === session?.userId);
  const isAdmin = session?.role === 'admin';

  useEffect(() => {
    const refresh = () => setLeaderboard(getDailyFakeLeaderboard());
    const interval = setInterval(refresh, 60 * 1000);
    refresh();
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!session || isAdmin) {
      setWithdrawalToasts([]);
      return undefined;
    }

    const showToast = () => {
      const toast = makeWithdrawalToast(recentToastNames.current);
      recentToastNames.current = [toast.firstName, ...recentToastNames.current].slice(0, 30);
      setWithdrawalToasts((items) => [toast, ...items].slice(0, 3));
      setTimeout(() => {
        setWithdrawalToasts((items) => items.filter((item) => item.id !== toast.id));
      }, 5000);
    };

    showToast();
    const interval = setInterval(showToast, 5000);
    return () => clearInterval(interval);
  }, [session, isAdmin]);

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

  const persistGameLogs = (nextLogs) => {
    setGameLogs(nextLogs);
    writeStore(storageKeys.gameLogs, nextLogs);
  };

  const persistGameSettings = (nextSettings) => {
    setGameSettings(nextSettings);
    writeStore(storageKeys.gameSettings, nextSettings);
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

    if (!user) return { ok: false, message: t.invalidLogin };
    setSession({ role: 'user', userId: user.id });
    setPage(user.onboardingSeen ? 'dashboard' : 'onboarding');
    return { ok: true };
  };

  const register = ({ fullName, email, phone, password, referralCode, acceptedRules }) => {
    if (!acceptedRules) return { ok: false, message: t.acceptNeeded };

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

    const user = normalizeUser({
      id: createId(),
      fullName,
      email: normalizedEmail,
      phone,
      password,
      referralCode: makeReferralCode(fullName),
      invitedBy: inviter?.id || '',
      pendingReferrals: 0,
      xp: 80,
      onboardingSeen: false,
    });

    const nextUsers = inviter
      ? users.map((item) =>
          item.id === inviter.id ? { ...item, pendingReferrals: item.pendingReferrals + 1 } : item,
        )
      : users;

    persistUsers([...nextUsers, user]);
    setSession({ role: 'user', userId: user.id });
    setPage('onboarding');
    return { ok: true };
  };

  const logout = () => {
    setSession(null);
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
      fileName: payload.fileName || 'No file selected',
      vipPlan: payload.vipPlan || '',
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

  const requestVip = (plan) => {
    if (!currentUser || plan.price === 0) return;
    if (getPlanLevel(currentUser.rank) >= getPlanLevel(plan.name)) return;
    const deposit = {
      id: createId(),
      userId: currentUser.id,
      name: currentUser.fullName,
      phone: currentUser.phone,
      amount: plan.price,
      sms: `VIP upgrade request: ${plan.name}`,
      fileName: 'VIP upgrade request',
      vipPlan: plan.name,
      status: 'pending',
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

  const approveDeposit = (depositId) => {
    const deposit = deposits.find((item) => item.id === depositId);
    if (!deposit || deposit.status !== 'pending') return;

    const vipPlan = vipPlans.find((plan) => plan.name === deposit.vipPlan);
    const isVipUpgrade = Boolean(vipPlan);
    const depositedUser = users.find((user) => user.id === deposit.userId);
    const qualifiesAsValidReferral = isVipUpgrade && getPlanLevel(vipPlan.name) >= getPlanLevel('VIP Silver');

    const nextUsers = users.map((user) => {
      if (user.id === deposit.userId) {
        return {
          ...user,
          balance: isVipUpgrade ? user.balance : user.balance + deposit.amount,
          pendingAmount: Math.max(0, user.pendingAmount - deposit.amount),
          approvedDeposits: user.approvedDeposits + 1,
          rank: vipPlan?.name || user.rank,
          xp: user.xp + (isVipUpgrade ? 180 : Math.round(deposit.amount / 5)),
          referralRewarded: user.referralRewarded || (qualifiesAsValidReferral && Boolean(user.invitedBy)),
        };
      }

      if (
        qualifiesAsValidReferral &&
        depositedUser?.invitedBy === user.id &&
        !depositedUser.referralRewarded
      ) {
        const reward = hasSilverOrAbove(user)
          ? vipPlans.find((plan) => plan.name === user.rank)?.reward || 0
          : 0;
        return {
          ...user,
          balance: user.balance + reward,
          validReferrals: user.validReferrals + 1,
          pendingReferrals: Math.max(0, user.pendingReferrals - 1),
          xp: user.xp + 120,
        };
      }
      return user;
    });

    persistDeposits(
      deposits.map((item) =>
        item.id === depositId
          ? { ...item, status: 'approved', reviewedAt: new Date().toISOString() }
          : item,
      ),
    );
    persistUsers(nextUsers);
  };

  const rejectDeposit = (depositId) => {
    const deposit = deposits.find((item) => item.id === depositId);
    if (!deposit) return;
    persistDeposits(deposits.map((item) => (item.id === depositId ? { ...item, status: 'rejected' } : item)));
    persistUsers(
      users.map((user) =>
        user.id === deposit.userId ? { ...user, pendingAmount: Math.max(0, user.pendingAmount - deposit.amount) } : user,
      ),
    );
  };

  const openWithdraw = () => {
    if (!currentUser) return;
    if (canWithdraw(currentUser)) {
      setVipNotice('');
      setPage('withdraw');
    } else {
      setVipNotice(getRequirementMessage(currentUser, t));
      setPage('vip');
    }
    setMobileOpen(false);
  };

  const submitWithdrawal = (payload) => {
    if (!currentUser) return { ok: false, message: t.loginFirst };
    if (!canWithdraw(currentUser)) {
      openWithdraw();
      return { ok: false, message: getRequirementMessage(currentUser, t) };
    }

    const amount = Number(payload.amount);
    if (!amount || amount <= 0) return { ok: false, message: t.enterWithdrawalAmount };
    if (amount < MIN_WITHDRAWAL_ETB) return { ok: false, message: t.withdrawalTooSmall };
    if (amount > currentUser.balance) return { ok: false, message: t.withdrawalTooHigh };

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
        item.id === withdrawalId ? { ...item, status: 'paid', reviewedAt: new Date().toISOString() } : item,
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
        item.id === withdrawalId ? { ...item, status: 'rejected', reviewedAt: new Date().toISOString() } : item,
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

  const adjustUserBalance = (userId, field, delta) => {
    persistUsers(
      users.map((user) =>
        user.id === userId
          ? { ...user, [field]: Math.max(0, Number(user[field] || 0) + delta) }
          : user,
      ),
    );
  };

  const playGame = ({ game, mode, wallet = 'points', betEtb = 0, extra = {} }) => {
    if (!currentUser) return { ok: false, message: t.loginFirst };
    const isFree = mode === 'free';
    const periodKey = getEthiopiaHalfDayKey();
    const freeAvailable = freeChanceAvailable(currentUser, game);
    if (isFree && !freeAvailable) return { ok: false, message: t.noFreeChance };

    let cost = 0;
    if (!isFree && game.type === 'bet') {
      cost = wallet === 'points' ? etbToPoints(betEtb) : Number(betEtb);
      const available = wallet === 'points' ? currentUser.pointsBalance : currentUser.balance;
      if (available < cost) return { ok: false, message: t.insufficientBalance };
    }

    const result = resolveGameResult(game, {
      isFree,
      wallet,
      betEtb,
      settings: gameSettings,
      extra,
    });

    const nextUser = {
      ...currentUser,
      streak: currentUser.streak + 1,
      xp: currentUser.xp + 10,
      dailyUsage: isFree
        ? {
            ...currentUser.dailyUsage,
            [game.id]: {
              periodKey,
              count: userDailyCount(currentUser, game.id) + 1,
            },
          }
        : currentUser.dailyUsage,
    };

    if (!isFree && game.type === 'bet') {
      if (wallet === 'points') nextUser.pointsBalance = Math.max(0, nextUser.pointsBalance - cost);
      else nextUser.balance = Math.max(0, nextUser.balance - cost);
    }

    if (result.wallet === 'points') nextUser.pointsBalance = nextUser.pointsBalance + result.win;
    else nextUser.balance = nextUser.balance + result.win;

    const log = {
      id: createId(),
      userId: currentUser.id,
      name: currentUser.fullName,
      gameId: game.id,
      gameName: game.name,
      mode,
      wallet: result.wallet,
      bet: result.bet,
      win: result.win,
      outcome: result.status,
      detail: result.detail,
      createdAt: new Date().toISOString(),
    };

    persistUsers(users.map((user) => (user.id === currentUser.id ? nextUser : user)));
    persistGameLogs([log, ...gameLogs].slice(0, 250));
    return { ok: true, result };
  };

  const completeOnboarding = () => {
    if (!currentUser) return;
    persistUsers(users.map((user) => (user.id === currentUser.id ? { ...user, onboardingSeen: true } : user)));
    setPage('dashboard');
  };

  if (!language) {
    return <LanguageGate t={copy.en} chooseLanguage={chooseLanguage} />;
  }

  return (
    <div className="app-shell">
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
        {!session && page === 'auth' && <AuthPanel t={t} login={login} register={register} setPage={setPage} />}
        {session && !isAdmin && currentUser && (
          <UserExperience
            t={t}
            page={page}
            setPage={setPage}
            user={currentUser}
            users={users}
            deposits={deposits}
            withdrawals={withdrawals}
            leaderboard={leaderboard}
            gameLogs={gameLogs}
            gameSettings={gameSettings}
            submitDeposit={submitDeposit}
            submitWithdrawal={submitWithdrawal}
            requestVip={requestVip}
            playGame={playGame}
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
            gameLogs={gameLogs}
            gameSettings={gameSettings}
            approveDeposit={approveDeposit}
            rejectDeposit={rejectDeposit}
            approveWithdrawal={approveWithdrawal}
            rejectWithdrawal={rejectWithdrawal}
            adjustUserBalance={adjustUserBalance}
            persistGameSettings={persistGameSettings}
          />
        )}
      </main>
      {!isAdmin && <WithdrawalToastStack toasts={withdrawalToasts} />}
    </div>
  );
}

function resolveGameResult(game, { isFree, wallet, betEtb, settings, extra }) {
  if (game.type === 'daily') {
    const reward = extra.dailyReward || weightedPick(game.rewards);
    return {
      status: reward.points > 0 ? reward.label : 'Empty',
      wallet: 'points',
      bet: 0,
      win: reward.points,
      detail: `${game.name}: ${reward.label}`,
      prize: reward,
    };
  }

  const bet = isFree ? game.freeBetPoints : wallet === 'points' ? etbToPoints(betEtb) : Number(betEtb);
  const payoutWallet = isFree || wallet === 'points' ? 'points' : 'money';

  if (game.id === 'slot') {
    const symbols = slotSymbols.map((symbol) => ({
      ...symbol,
      weight: symbol.label === 'Cherry'
        ? Number(settings.slotCherryWeight || symbol.weight)
        : symbol.label === 'Diamond'
          ? Number(settings.slotDiamondWeight || symbol.weight)
          : symbol.weight,
    }));
    const reels = [weightedPick(symbols), weightedPick(symbols), weightedPick(symbols)];
    const same = reels.every((item) => item.label === reels[0].label);
    const hasCherry = reels.some((item) => item.label === 'Cherry');
    const pairs = new Set(reels.map((item) => item.label)).size === 2;
    const multiplier = same ? reels[0].multiplier : pairs && hasCherry ? 1 : 0;
    return {
      status: multiplier >= 10 ? 'Big Win' : multiplier > 0 ? 'Win' : 'No win',
      wallet: payoutWallet,
      bet,
      win: Math.round(bet * multiplier * 100) / 100,
      detail: reels.map((item) => item.label).join(' | '),
      reels,
      multiplier,
    };
  }

  if (game.id === 'plinko') {
    const slot = cryptoRandomInt(0, plinkoMultipliers.length - 1);
    const multiplier = plinkoMultipliers[slot];
    return {
      status: multiplier >= 5 ? 'High slot' : multiplier > 0 ? 'Landed' : 'Missed',
      wallet: payoutWallet,
      bet,
      win: Math.round(bet * multiplier * 100) / 100,
      detail: `Dropped from ${extra.drop || 'center'}, landed at ${multiplier}x slot.`,
      slot,
      multiplier,
      drop: extra.drop || 'center',
    };
  }

  if (game.id === 'apple') {
    const score = Math.max(0, Number(extra.score || 0));
    const badClicked = Boolean(extra.badClicked);
    const multiplier = Number(settings.appleGoodMultiplier || 0.5);
    const win = badClicked ? 0 : Math.round(bet * score * multiplier * 100) / 100;
    return {
      status: badClicked ? 'Bad apple' : score > 0 ? 'Good harvest' : 'No apples',
      wallet: payoutWallet,
      bet,
      win,
      detail: badClicked ? 'Bad apple clicked. Round ended.' : `${score} good apples x ${multiplier} multiplier.`,
      score,
      badClicked,
      multiplier,
    };
  }

  if (game.id === 'higherlower') {
    const first = extra.firstCard || drawCard();
    const second = extra.secondCard || drawCard([first.code]);
    const guess = extra.guess || 'higher';
    const tied = second.value === first.value;
    const correct = guess === 'higher' ? second.value > first.value : second.value < first.value;
    const multiplier = tied ? 1 : Number(settings.higherLowerMultiplier || 2);
    return {
      status: tied ? 'Tie' : correct ? 'Correct' : 'Wrong',
      wallet: payoutWallet,
      bet,
      win: tied ? bet : correct ? Math.round(bet * multiplier * 100) / 100 : 0,
      detail: `${first.rank}${first.suit} to ${second.rank}${second.suit}; guessed ${guess}.`,
      first,
      second,
      guess,
      multiplier,
    };
  }

  const target = Number(extra.target || 50);
  const roll = cryptoRandomInt(1, 100);
  const multiplier = Math.max(1, (100 / target) * (1 - Number(settings.diceHouseEdgePercent || 0) / 100));
  const won = roll <= target;
  return {
    status: won ? `Rolled ${roll}` : `Lost by ${Math.max(1, roll - target)}`,
    wallet: payoutWallet,
    bet,
    win: won ? Math.round(bet * multiplier * 100) / 100 : 0,
    detail: `Target ${target}, multiplier ${multiplier.toFixed(2)}x.`,
    roll,
    target,
    multiplier,
  };
}

function drawCard(excludedCodes = []) {
  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  let card;
  do {
    const suit = suits[cryptoRandomInt(0, suits.length - 1)];
    const rankIndex = cryptoRandomInt(0, ranks.length - 1);
    card = {
      rank: ranks[rankIndex],
      suit,
      value: rankIndex + 1,
      code: `${ranks[rankIndex]}${suit}`,
    };
  } while (excludedCodes.includes(card.code));
  return card;
}

function LanguageGate({ t, chooseLanguage }) {
  return (
    <main className="language-screen">
      <section className="language-panel">
        <div className="brand-mark">
          <Sparkles size={22} />
          <span>Milkii Hub</span>
        </div>
        <h1>{t.chooseLanguage}</h1>
        <p>{t.languageCopy}</p>
        <div className="language-grid">
          <button onClick={() => chooseLanguage('en')}><span>EN</span>{t.english}</button>
          <button onClick={() => chooseLanguage('om')}><span>OM</span>{t.afaanOromo}</button>
          <button onClick={() => chooseLanguage('am')}><span>AM</span>{t.amharic}</button>
        </div>
      </section>
    </main>
  );
}

function Header({ t, language, setLanguage, page, setPage, session, logout, mobileOpen, setMobileOpen, openWithdraw }) {
  const nav = session?.role === 'admin'
    ? [{ id: 'admin', label: t.admin, icon: ShieldCheck }]
    : [
        { id: 'dashboard', label: t.dashboard, icon: Gauge },
        { id: 'deposit', label: t.deposit, icon: Wallet },
        { id: 'withdraw', label: t.withdraw, icon: Banknote },
        { id: 'game', label: t.play, icon: Gamepad2 },
        { id: 'vip', label: t.vip, icon: Crown },
        { id: 'referrals', label: t.referrals, icon: Users },
      ];

  return (
    <header className="site-header">
      <button className="brand-button" onClick={() => setPage(session ? nav[0].id : 'home')}>
        <span className="brand-icon"><Sparkles size={18} /></span>
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
                  if (item.id === 'withdraw') openWithdraw();
                  else setPage(item.id);
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
          <button className="ghost-button" onClick={logout}><LogOut size={17} />{t.logout}</button>
        ) : (
          <button className="primary-small" onClick={() => setPage('auth')}>{t.login}</button>
        )}
        {session && <button className="menu-button" onClick={() => setMobileOpen(!mobileOpen)}><Menu size={20} /></button>}
      </div>
    </header>
  );
}

function Home({ t, setPage }) {
  return (
    <section className="hero-layout">
      <div className="hero-copy">
        <div className="eyebrow"><ShieldCheck size={16} />Milkii Hub</div>
        <h1>{t.heroTitle}</h1>
        <p>{t.heroCopy}</p>
        <div className="hero-actions">
          <button className="primary-button" onClick={() => setPage('auth')}>{t.startNow}<ChevronRight size={18} /></button>
          <span className="trust-pill">{t.withdrawRuleCopy}</span>
        </div>
      </div>
      <RulesPanel t={t} compact />
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
    acceptedRules: false,
  });
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const result = mode === 'login' ? login(form) : register(form);
    if (!result.ok) setError(result.message);
  };

  return (
    <section className="auth-layout wide-auth">
      <div className="auth-info">
        <div className="eyebrow"><Lock size={16} />{t.authTitle}</div>
        <h1>{t.authTitle}</h1>
        <p>{t.authCopy}</p>
        <RulesPanel t={t} />
        {isLocalDemoAdminEnabled && adminCredentials.username && (
          <div className="credential-note">
            <b>Local demo admin</b>
            <span>{adminCredentials.username}</span>
          </div>
        )}
      </div>
      <form className="auth-card" onSubmit={submit}>
        <div className="tabs">
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>{t.register}</button>
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>{t.login}</button>
        </div>
        {error && <div className="alert error">{error}</div>}
        {mode === 'register' && (
          <label>{t.fullName}<input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} /></label>
        )}
        <label>{t.email}<input type={mode === 'register' ? 'email' : 'text'} required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
        {mode === 'register' && (
          <label>{t.phone}<input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
        )}
        <label>{t.password}<input type="password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
        {mode === 'register' && (
          <>
            <label>{t.referralCode}<input value={form.referralCode} onChange={(event) => setForm({ ...form, referralCode: event.target.value })} /></label>
            <label className="check-row">
              <input type="checkbox" checked={form.acceptedRules} onChange={(event) => setForm({ ...form, acceptedRules: event.target.checked })} />
              <span>{t.acceptRules}</span>
            </label>
          </>
        )}
        <button className="primary-button full" type="submit">{mode === 'login' ? t.signIn : t.createAccount}<ChevronRight size={18} /></button>
        <button className="text-link" type="button" onClick={() => setPage('home')}>{t.back}</button>
      </form>
    </section>
  );
}

function RulesPanel({ t, compact = false }) {
  return (
    <div className={`rules-panel ${compact ? 'compact-rules' : ''}`}>
      <h2>{t.rulesTitle}</h2>
      <div className="rules-list">
        <RuleItem title={t.validInvite} text={t.validInviteCopy} />
        <RuleItem title={t.withdrawRule} text={t.withdrawRuleCopy} />
        <RuleItem title={t.warning} text={t.warningCopy} />
        {!compact && <RuleItem title={t.vipLevels} text={t.freePlan} />}
      </div>
    </div>
  );
}

function RuleItem({ title, text }) {
  return (
    <div className="rule-item">
      <CheckCircle2 size={17} />
      <div>
        <b>{title}</b>
        <span>{text}</span>
      </div>
    </div>
  );
}

function UserExperience(props) {
  if (props.page === 'onboarding') return <OnboardingPage {...props} />;
  if (props.page === 'deposit') return <DepositPage {...props} />;
  if (props.page === 'withdraw') return <WithdrawalPage {...props} />;
  if (props.page === 'game') return <GamePage {...props} />;
  if (props.page === 'vip') return <VipPage {...props} />;
  if (props.page === 'referrals') return <ReferralPage {...props} />;
  return <Dashboard {...props} />;
}

function OnboardingPage({ t, user, completeOnboarding }) {
  return (
    <section className="onboarding-layout">
      <div className="welcome-panel onboarding-hero">
        <div>
          <span className="eyebrow"><Sparkles size={16} />{t.rulesTitle}</span>
          <h1>{t.welcome(user.fullName.split(' ')[0])}</h1>
          <p>{t.heroCopy}</p>
        </div>
        <button className="primary-button" onClick={completeOnboarding}>{t.dashboard}<ChevronRight size={18} /></button>
      </div>
      <RulesPanel t={t} />
      <VipTable t={t} />
    </section>
  );
}

function Dashboard({ t, user, deposits, withdrawals, leaderboard, setPage, openWithdraw }) {
  const inviteLink = `${window.location.origin}${window.location.pathname}?ref=${user.referralCode}`;
  const [copied, setCopied] = useState(false);
  const withdrawOpen = canWithdraw(user);
  const missing = Math.max(0, WITHDRAWAL_REFERRAL_REQUIREMENT - user.validReferrals);

  const copyInvite = async () => {
    await navigator.clipboard?.writeText?.(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const activity = [
    ...deposits.filter((item) => item.userId === user.id).map((item) => ({ ...item, kind: t.deposit })),
    ...withdrawals.filter((item) => item.userId === user.id).map((item) => ({ ...item, kind: t.withdraw })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <section className="page-grid">
      <div className="dashboard-main">
        <div className="welcome-panel">
          <div>
            <span className="eyebrow"><BadgeCheck size={16} />{user.rank}</span>
            <h1>{t.welcome(user.fullName.split(' ')[0])}</h1>
            <p>{t.dashboardCopy}</p>
          </div>
          <div className="welcome-actions">
            <button className="primary-button" onClick={() => setPage('deposit')}>{t.deposit}<Wallet size={18} /></button>
            <button className="secondary-button" onClick={openWithdraw}>{t.withdraw}<Banknote size={18} /></button>
          </div>
        </div>
        <div className="stats-grid">
          <Stat icon={Wallet} label={t.balance} value={`${formatMoney(user.balance)} ETB`} tone="green" />
          <Stat icon={Sparkles} label={t.points} value={`${formatMoney(user.pointsBalance)} pts`} tone="blue" />
          <Stat icon={Users} label={t.validReferrals} value={`${user.validReferrals}/${WITHDRAWAL_REFERRAL_REQUIREMENT}`} tone="yellow" />
          <Stat icon={Banknote} label={t.withdraw} value={withdrawOpen ? t.withdrawOpen : t.withdrawLocked} tone={withdrawOpen ? 'green' : 'red'} />
        </div>
        {!withdrawOpen && (
          <div className="notice-card strong">
            <Lock size={18} />
            <span>{t.requirementMessage(missing, hasSilverOrAbove(user))}</span>
          </div>
        )}
        <div className="content-card">
          <div className="section-heading"><h2>{t.recentActivity}</h2><span>{activity.length}</span></div>
          <div className="activity-list">
            {activity.length === 0 && <p className="muted">{t.noActivity}</p>}
            {activity.slice(0, 8).map((item) => (
              <div className="activity-row" key={item.id}>
                <div>
                  <b>{item.kind} - {formatMoney(item.amount)} ETB</b>
                  <small>{item.vipPlan || item.method || item.sms}</small>
                </div>
                <Status status={item.status} t={t} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <aside className="side-stack">
        <div className="content-card leaderboard-card">
          <div className="section-heading"><h2>{t.topWithdrawals}</h2><span>{t.updatedDaily}</span></div>
          <div className="leaderboard-list">
            {leaderboard.map((entry) => (
              <div className="leaderboard-row" key={entry.id}>
                <span>{entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}</span>
                <b>{entry.name}</b>
                <strong>{formatMoney(entry.amount)} ETB</strong>
              </div>
            ))}
          </div>
          <small>{t.updatedDaily}</small>
        </div>
        <div className="content-card invite-card">
          <Gift size={26} />
          <h2>{t.inviteFriends}</h2>
          <p>{t.validInviteCopy}</p>
          <div className="copy-box">
            <span>{inviteLink}</span>
            <button onClick={copyInvite}><Copy size={16} />{copied ? t.copied : t.copyLink}</button>
          </div>
        </div>
        <div className="content-card">
          <h2>{t.points}</h2>
          <p className="muted">{formatMoney(user.pointsBalance)} points = {formatMoney(pointsToEtb(user.pointsBalance))} ETB equivalent, but withdrawal still needs VIP Silver + 10 valid referrals.</p>
        </div>
      </aside>
    </section>
  );
}

function WithdrawalToastStack({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="withdrawal-toast-stack" aria-live="polite">
      {toasts.map((toast) => (
        <div className="live-withdrawal-notice" key={toast.id}>
          📍 {toast.text}
        </div>
      ))}
    </div>
  );
}

function DepositPage({ t, user, submitDeposit }) {
  const [form, setForm] = useState({ amount: '', sms: '', fileName: '', vipPlan: '' });
  const [message, setMessage] = useState('');

  const submit = (event) => {
    event.preventDefault();
    if (!form.amount || Number(form.amount) <= 0 || !form.sms.trim()) {
      setMessage('Enter amount and transaction SMS.');
      return;
    }
    submitDeposit(form);
  };

  return (
    <section className="deposit-layout">
      <div className="content-card deposit-instructions">
        <span className="eyebrow"><ShieldCheck size={16} />{t.manualReview}</span>
        <h1>{t.depositTitle}</h1>
        <p>{t.depositCopy}</p>
        <div className="payment-card">
          <span>{t.paymentNumber}</span>
          <strong>{paymentInfo.phone}</strong>
          <small>{t.paymentName}: {paymentInfo.name}</small>
        </div>
        <div className="safety-box"><b>{t.warning}</b><span>{t.depositSafety}</span></div>
      </div>
      <form className="content-card deposit-form" onSubmit={submit}>
        {message && <div className="alert error">{message}</div>}
        <label>
          {t.vipUpgrade}
          <select value={form.vipPlan} onChange={(event) => {
            const plan = vipPlans.find((item) => item.name === event.target.value);
            setForm({ ...form, vipPlan: event.target.value, amount: plan ? String(plan.price) : form.amount });
          }}>
            <option value="">Normal money deposit</option>
            {vipPlans.filter((plan) => plan.price > 0 && getPlanLevel(plan.name) > getPlanLevel(user.rank)).map((plan) => (
              <option key={plan.id} value={plan.name}>{plan.name} - {plan.price} ETB</option>
            ))}
          </select>
        </label>
        <label>{t.amount}<input type="number" min="1" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></label>
        <label>
          {t.screenshot}
          <div className="file-input">
            <Upload size={18} />
            <span>{form.fileName || t.chooseImageProof}</span>
            <input type="file" accept="image/*" onChange={(event) => setForm({ ...form, fileName: event.target.files?.[0]?.name || '' })} />
          </div>
        </label>
        <label>{t.sms}<textarea rows="6" value={form.sms} onChange={(event) => setForm({ ...form, sms: event.target.value })} /></label>
        <button className="primary-button" type="submit">{t.submitDeposit}<ChevronRight size={18} /></button>
      </form>
    </section>
  );
}

function WithdrawalPage({ t, user, withdrawals, submitWithdrawal, openWithdraw }) {
  const [form, setForm] = useState({ method: 'cbe', accountName: user.fullName, accountNumber: user.phone, amount: '' });
  const [message, setMessage] = useState(null);
  const eligible = canWithdraw(user);
  const userWithdrawals = withdrawals.filter((withdrawal) => withdrawal.userId === user.id);

  const submit = (event) => {
    event.preventDefault();
    if (!eligible) {
      openWithdraw();
      return;
    }
    const result = submitWithdrawal(form);
    setMessage(result);
    if (result.ok) setForm({ ...form, amount: '' });
  };

  return (
    <section className="withdraw-layout">
      <div className="content-card withdrawal-summary">
        <span className="eyebrow"><Banknote size={16} />{t.withdrawalCenter}</span>
        <h1>{t.withdraw}</h1>
        <p>{t.withdrawCopy}</p>
        <div className="requirement-list">
          <Requirement done={hasSilverOrAbove(user)} label="VIP Silver or higher" />
          <Requirement done={user.validReferrals >= WITHDRAWAL_REFERRAL_REQUIREMENT} label={`${user.validReferrals}/${WITHDRAWAL_REFERRAL_REQUIREMENT} valid referrals`} />
        </div>
        {!eligible && <div className="alert error">{getRequirementMessage(user, t)}</div>}
        <div className="stats-grid compact">
          <Stat icon={Wallet} label={t.balance} value={`${formatMoney(user.balance)} ETB`} tone="green" />
          <Stat icon={Sparkles} label={t.pending} value={`${formatMoney(user.pendingWithdrawal || 0)} ETB`} tone="yellow" />
        </div>
      </div>
      <form className="content-card withdrawal-form" onSubmit={submit}>
        {message && <div className={`alert ${message.ok ? 'success' : 'error'}`}>{message.message}</div>}
        <label>{t.withdrawalMethod}<select value={form.method} onChange={(event) => setForm({ ...form, method: event.target.value })}><option value="cbe">{t.cbe}</option><option value="telebirr">{t.telebirr}</option></select></label>
        <label>{t.accountName}<input required value={form.accountName} onChange={(event) => setForm({ ...form, accountName: event.target.value })} /></label>
        <label>{t.accountNumber}<input required value={form.accountNumber} onChange={(event) => setForm({ ...form, accountNumber: event.target.value })} /></label>
        <label>{t.amount}<input type="number" min={MIN_WITHDRAWAL_ETB} max={user.balance} value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></label>
        <button className="primary-button" type="submit" disabled={!eligible}>{t.requestWithdrawal}<ChevronRight size={18} /></button>
      </form>
      <div className="content-card withdrawal-history">
        <div className="section-heading"><h2>{t.recentActivity}</h2><span>{userWithdrawals.length}</span></div>
        <div className="activity-list">
          {userWithdrawals.length === 0 && <p className="muted">{t.noWithdrawals}</p>}
          {userWithdrawals.map((withdrawal) => (
            <div className="activity-row" key={withdrawal.id}>
              <div><b>{formatMoney(withdrawal.amount)} ETB</b><small>{withdrawal.method} - {withdrawal.accountNumber}</small></div>
              <Status status={withdrawal.status} t={t} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Requirement({ done, label }) {
  return <div className={`requirement ${done ? 'done' : ''}`}>{done ? <CheckCircle2 size={18} /> : <Lock size={18} />}<span>{label}</span></div>;
}

function GamePage({ t, user, gameLogs, gameSettings, playGame, setPage }) {
  const [section, setSection] = useState('daily');
  const [activeGameId, setActiveGameId] = useState(dailyGames[0].id);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const games = section === 'daily' ? dailyGames : betGames;
  const activeGame = games.find((game) => game.id === activeGameId) || games[0];
  const freeAvailable = freeChanceAvailable(user, activeGame);
  const countdown = formatClockCountdown(getNextEthiopiaHalfDayReset().getTime() - now);

  const runGame = (payload) => {
    const response = playGame({ game: activeGame, ...payload });
    if (!response.ok) {
      setError(response.message);
      return response;
    }
    setError('');
    setResult(response.result);
    return response;
  };

  return (
    <section className="games-layout">
      <div className="game-sidebar content-card">
        <div className="tabs">
          <button className={section === 'daily' ? 'active' : ''} onClick={() => { setSection('daily'); setActiveGameId(dailyGames[0].id); }}>{t.dailyPlay}</button>
          <button className={section === 'bet' ? 'active' : ''} onClick={() => { setSection('bet'); setActiveGameId(betGames[0].id); }}>{t.betPlay}</button>
        </div>
        <div className="game-list">
          {games.map((game) => (
            <button key={game.id} className={activeGame.id === game.id ? 'active' : ''} onClick={() => { setActiveGameId(game.id); setResult(null); setError(''); }}>
              <b>{game.name}</b>
              <span>{game.freeLabel || `Free bet: ${game.freeBetPoints} points`}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="game-arena">
        <div className="game-stage modern">
          <div className="game-scoreboard">
            <span>{activeGame.name}</span>
            <strong>{section === 'daily' ? `${formatMoney(user.pointsBalance)} pts` : `${formatMoney(user.balance)} ETB`}</strong>
            <small>{freeAvailable ? t.freeReady : `${t.nextFree} ${countdown}`}</small>
          </div>
          {section === 'daily' ? (
            <DailyGameVisual game={activeGame} runGame={runGame} t={t} freeAvailable={freeAvailable} />
          ) : (
            <BetGameVisual game={activeGame} runGame={runGame} t={t} freeAvailable={freeAvailable} settings={gameSettings} />
          )}
          {error && <p className="game-message danger">{error}</p>}
          {result && <p className="game-message">{t.gameResult}: {resultText(result)}. {result.detail}</p>}
        </div>
      </div>
      <aside className="content-card side-stack">
        <h2>{activeGame.name}</h2>
        <p className="muted">{activeGame.summary}</p>
        <div className="stats-grid compact">
          <Stat icon={Wallet} label={t.balance} value={`${formatMoney(user.balance)} ETB`} tone="green" />
          <Stat icon={Sparkles} label={t.points} value={`${formatMoney(user.pointsBalance)} pts`} tone="blue" />
        </div>
        <div className="activity-list">
          {gameLogs.filter((log) => log.userId === user.id).slice(0, 5).map((log) => (
            <div className="activity-row" key={log.id}>
              <div><b>{log.gameName}</b><small>{log.outcome} - {formatMoney(log.win)} {log.wallet === 'points' ? 'pts' : 'ETB'}</small></div>
            </div>
          ))}
        </div>
        <button className="secondary-button full" onClick={() => setPage('deposit')}>{t.deposit}</button>
      </aside>
    </section>
  );
}

function DailyGameVisual({ game, runGame, t, freeAvailable }) {
  if (game.id === 'treasure') return <TreasureHunt runGame={runGame} freeAvailable={freeAvailable} />;
  if (game.id === 'mystery') return <MysteryBoxes runGame={runGame} freeAvailable={freeAvailable} />;
  return <MemoryMatch runGame={runGame} freeAvailable={freeAvailable} t={t} />;
}

function makeTreasureBoard() {
  const prizes = [
    { label: 'Diamond', points: 25 },
    { label: 'Treasure chest', points: 15 },
    { label: 'Gold coin', points: 10 },
    { label: 'Gold coin', points: 10 },
    { label: 'Small gem', points: 5 },
    { label: 'Small gem', points: 5 },
    ...Array.from({ length: 10 }, () => ({ label: 'Empty box', points: 0 })),
  ];
  return shuffle(prizes);
}

function TreasureHunt({ runGame, freeAvailable }) {
  const [board, setBoard] = useState(() => makeTreasureBoard());
  const [opened, setOpened] = useState([]);
  const [revealAll, setRevealAll] = useState(false);

  const reset = () => {
    setBoard(makeTreasureBoard());
    setOpened([]);
    setRevealAll(false);
  };

  const openTile = (index) => {
    if (!freeAvailable || opened.includes(index) || revealAll) return;
    const prize = board[index];
    const response = runGame({ mode: 'free', extra: { dailyReward: prize } });
    if (!response?.ok) return;
    const nextOpened = [...opened, index];
    setOpened(nextOpened);
    if (nextOpened.length >= 3) setRevealAll(true);
  };

  return (
    <div className="daily-visual">
      <GameGuide
        title="How to play Daily Treasure Hunt"
        steps={['Open any 3 chests every 12 hours.', 'Each chest reveals points or an empty box.', 'After your third click, all remaining chests open automatically.']}
        example="Example: gem 5 + coin 10 + diamond 25 = 40 points."
      />
      <div className="treasure-grid luxe-grid">
        {board.map((prize, index) => {
          const isOpen = revealAll || opened.includes(index);
          return (
            <button
              key={`${prize.label}-${index}`}
              className={`treasure-tile ${isOpen ? 'open' : ''} ${opened.includes(index) ? 'picked' : ''}`}
              disabled={!freeAvailable || isOpen}
              onClick={() => openTile(index)}
            >
              <span>{isOpen ? prizeIcons[prize.label] : '🎁'}</span>
              <small>{isOpen ? `${prize.points} pts` : 'Pick'}</small>
            </button>
          );
        })}
      </div>
      <div className="game-actions-row">
        <span>{Math.max(0, 3 - opened.length)} free clicks left</span>
        <button className="secondary-button" type="button" onClick={reset}>New visual map</button>
      </div>
    </div>
  );
}

function MysteryBoxes({ runGame, freeAvailable }) {
  const [boxes, setBoxes] = useState(() => shuffle([
    { label: 'Tiny prize', points: 2 },
    { label: 'Small prize', points: 5 },
    { label: 'Medium prize', points: 10 },
    { label: 'Empty box', points: 0 },
    { label: 'Jackpot', points: 50 },
  ]));
  const [picked, setPicked] = useState(null);

  const pickBox = (index) => {
    if (!freeAvailable || picked !== null) return;
    const response = runGame({ mode: 'free', extra: { dailyReward: boxes[index] } });
    if (response?.ok) setPicked(index);
  };

  return (
    <div className="daily-visual">
      <GameGuide
        title="How to play Mystery Box Auction"
        steps={['Pick one of the 5 identical boxes.', 'You win what is inside your chosen box.', 'All boxes reveal after your pick so you can see the jackpot position.']}
        example="Example: pick Box 3 and win 5 points, then see where the 50 point jackpot was."
      />
      <div className="box-row mystery-row">
        {boxes.map((box, index) => {
          const revealed = picked !== null;
          return (
            <button
              key={`${box.label}-${index}`}
              className={`${revealed ? 'open' : ''} ${picked === index ? 'picked' : ''} ${box.label === 'Jackpot' && revealed ? 'jackpot' : ''}`}
              disabled={!freeAvailable || revealed}
              onClick={() => pickBox(index)}
            >
              <span>{revealed ? prizeIcons[box.label] : '🎁'}</span>
              <small>{revealed ? `${box.points} pts` : `Box ${index + 1}`}</small>
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <p className="game-message">
          {boxes[picked].label === 'Jackpot'
            ? 'JACKPOT! You picked the best box.'
            : `You won ${boxes[picked].points} points. The jackpot was in Box ${boxes.findIndex((box) => box.label === 'Jackpot') + 1}.`}
        </p>
      )}
    </div>
  );
}

function MemoryMatch({ runGame, freeAvailable, t }) {
  const makeDeck = () => shuffle(memorySymbols.flatMap((symbol, pair) => [
    { id: `${pair}-a`, symbol },
    { id: `${pair}-b`, symbol },
  ]));
  const [deck, setDeck] = useState(makeDeck);
  const [started, setStarted] = useState(false);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [won, setWon] = useState(false);

  const start = () => {
    setDeck(makeDeck());
    setStarted(true);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setWon(false);
  };

  const flipCard = (index) => {
    if (!started || locked || won || flipped.includes(index) || matched.includes(index)) return;
    const next = [...flipped, index];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((value) => value + 1);
      setLocked(true);
      const [first, second] = next;
      if (deck[first].symbol === deck[second].symbol) {
        const nextMatched = [...matched, first, second];
        setTimeout(() => {
          setMatched(nextMatched);
          setFlipped([]);
          setLocked(false);
          if (nextMatched.length === deck.length) {
            setWon(true);
            runGame({ mode: 'free', extra: { dailyReward: { label: 'Completed board', points: 30 } } });
          }
        }, 350);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 900);
      }
    }
  };

  return (
    <div className="daily-visual">
      <GameGuide
        title="How to play Memory Match"
        steps={['Start one free game every 12 hours.', 'Flip two cards and find matching fruit pairs.', 'Match all 8 pairs to win 30 points.']}
        example="Example: match all pairs in fewer moves for a cleaner win."
      />
      <div className="memory-status">
        <span>Matches: {matched.length / 2}/8</span>
        <span>Moves: {moves}</span>
      </div>
      <div className="memory-grid">
        {deck.map((card, index) => {
          const visible = flipped.includes(index) || matched.includes(index) || won;
          return (
            <button
              key={card.id}
              className={`${visible ? 'flipped' : ''} ${matched.includes(index) ? 'matched' : ''}`}
              disabled={!started || !freeAvailable || matched.includes(index)}
              onClick={() => flipCard(index)}
            >
              <span>{visible ? card.symbol : '?'}</span>
            </button>
          );
        })}
      </div>
      <button className="primary-button memory-action" disabled={!freeAvailable || (started && !won)} onClick={start}>{started ? 'Restart board' : t.playNow}</button>
      {won && <p className="game-message">YOU WIN! 30 points added.</p>}
    </div>
  );
}

function BetGameVisual({ game, runGame, t, freeAvailable, settings }) {
  const [wallet, setWallet] = useState('points');
  const [betEtb, setBetEtb] = useState(game.betOptions[0]);
  const [target, setTarget] = useState(60);
  const [drop, setDrop] = useState('center');
  const [rolling, setRolling] = useState(false);
  const [displayNumber, setDisplayNumber] = useState(60);
  const [slotReels, setSlotReels] = useState(slotSymbols.slice(0, 3));
  const [plinkoSlot, setPlinkoSlot] = useState(null);
  const [higherCards, setHigherCards] = useState(() => ({ first: drawCard(), second: null, guess: '' }));
  const [appleRound, setAppleRound] = useState({ running: false, score: 0, lives: 3, apples: [], spawned: 0 });
  const [lastOutcome, setLastOutcome] = useState(null);

  useEffect(() => {
    setBetEtb(game.betOptions[0]);
    setRolling(false);
    setLastOutcome(null);
    setDisplayNumber(60);
    setSlotReels(slotSymbols.slice(0, 3));
    setPlinkoSlot(null);
    setHigherCards({ first: drawCard(), second: null, guess: '' });
    setAppleRound({ running: false, score: 0, lives: 3, apples: [], spawned: 0 });
  }, [game]);

  useEffect(() => {
    if (!appleRound.running) return undefined;
    if (appleRound.spawned >= 20 || appleRound.lives <= 0) return undefined;
    const timer = setTimeout(() => {
      const bad = Math.random() < Number(settings.appleBadAppleWeight || 30) / 100;
      setAppleRound((round) => ({
        ...round,
        spawned: round.spawned + 1,
        apples: [
          ...round.apples,
          {
            id: createId(),
            bad,
            left: cryptoRandomInt(5, 85),
            top: cryptoRandomInt(4, 70),
          },
        ].slice(-8),
      }));
    }, 650);
    return () => clearTimeout(timer);
  }, [appleRound, settings.appleBadAppleWeight]);

  const payload = (mode, extra = {}) => ({
    mode,
    wallet,
    betEtb,
    extra: { target, drop, ...extra },
  });

  const playAfterAnimation = (mode, extra, done) => {
    setRolling(true);
    setLastOutcome(null);
    window.setTimeout(() => {
      const response = runGame(payload(mode, extra));
      setRolling(false);
      if (response?.ok) {
        setLastOutcome(response.result);
        done?.(response.result);
      }
    }, 950);
  };

  const rollDice = (mode) => {
    const interval = setInterval(() => setDisplayNumber(cryptoRandomInt(1, 100)), 50);
    playAfterAnimation(mode, {}, (result) => {
      clearInterval(interval);
      setDisplayNumber(result.roll);
    });
  };

  const spinSlot = (mode) => {
    const interval = setInterval(() => setSlotReels([
      slotSymbols[cryptoRandomInt(0, slotSymbols.length - 1)],
      slotSymbols[cryptoRandomInt(0, slotSymbols.length - 1)],
      slotSymbols[cryptoRandomInt(0, slotSymbols.length - 1)],
    ]), 80);
    playAfterAnimation(mode, {}, (result) => {
      clearInterval(interval);
      setSlotReels(result.reels);
    });
  };

  const dropBall = (mode) => {
    setPlinkoSlot(null);
    playAfterAnimation(mode, {}, (result) => setPlinkoSlot(result.slot));
  };

  const guessCard = (mode, guess) => {
    const second = drawCard([higherCards.first.code]);
    setHigherCards({ ...higherCards, second, guess });
    playAfterAnimation(mode, { firstCard: higherCards.first, secondCard: second, guess }, () => {
      window.setTimeout(() => setHigherCards({ first: drawCard(), second: null, guess: '' }), 1800);
    });
  };

  const startApple = (mode) => {
    setLastOutcome(null);
    setAppleRound({ running: mode, score: 0, lives: 3, apples: [], spawned: 0 });
  };

  const finishApple = (round, badClicked = false) => {
    const mode = round.running || 'paid';
    setAppleRound({ ...round, running: false, apples: [] });
    const response = runGame(payload(mode, { score: round.score, badClicked }));
    if (response?.ok) setLastOutcome(response.result);
  };

  const clickApple = (apple) => {
    if (!appleRound.running) return;
    const nextRound = {
      ...appleRound,
      score: apple.bad ? appleRound.score : appleRound.score + 1,
      lives: apple.bad ? appleRound.lives - 1 : appleRound.lives,
      apples: appleRound.apples.filter((item) => item.id !== apple.id),
    };
    if (apple.bad && nextRound.lives <= 0) finishApple(nextRound, true);
    else if (nextRound.spawned >= 20 && nextRound.apples.length === 0) finishApple(nextRound, false);
    else setAppleRound(nextRound);
  };

  const primaryAction = game.id === 'dice' ? rollDice : game.id === 'slot' ? spinSlot : game.id === 'plinko' ? dropBall : null;

  return (
    <div className="bet-console">
      <GameGuide title={`How to play ${game.name}`} steps={gameInstructions(game.id)} example={gameExample(game.id)} />
      <div className={`game-visual ${game.id} ${rolling ? 'rolling' : ''} ${lastOutcome?.win > 0 ? 'win' : lastOutcome ? 'loss' : ''}`}>
        {game.id === 'dice' && (
          <div className="dice-duel">
            <div className={`dice-cube ${rolling ? 'spin' : ''}`}><span>{displayNumber}</span></div>
            <div className="dice-stats">
              <span>Win chance: {target}%</span>
              <span>Payout: {(100 / target).toFixed(2)}x</span>
              <span>Provably fair seed: MH-{getEthiopiaHalfDayKey()}</span>
            </div>
          </div>
        )}
        {game.id === 'slot' && (
          <div className="slot-machine">
            <div className="slot-window">
              {slotReels.map((symbol, index) => <span className={rolling ? 'spinning' : ''} key={`${symbol.label}-${index}`}>{symbol.icon}</span>)}
            </div>
            <div className="payout-table">{slotSymbols.map((symbol) => <small key={symbol.label}>{symbol.icon}{symbol.icon}{symbol.icon} = {symbol.multiplier}x</small>)}</div>
          </div>
        )}
        {game.id === 'plinko' && (
          <div className="plinko-cabinet">
            <div className={`plinko-ball ${rolling ? `drop-${drop}` : ''}`} style={plinkoSlot !== null ? { left: `${8 + plinkoSlot * 12}%`, top: '78%' } : undefined} />
            <div className="plinko-pegs">{Array.from({ length: 44 }, (_, index) => <span key={index} />)}</div>
            <div className="plinko-slots">{plinkoMultipliers.map((multiplier, index) => <span className={plinkoSlot === index ? 'hit' : ''} key={`${multiplier}-${index}`}>{multiplier}x</span>)}</div>
          </div>
        )}
        {game.id === 'apple' && (
          <div className="apple-field">
            <div className="apple-hud"><b>Score: {appleRound.score}</b><span>Lives: {'❤'.repeat(appleRound.lives)}</span><span>{appleRound.spawned}/20 apples</span></div>
            <div className="basket">Basket</div>
            {appleRound.apples.map((apple) => (
              <button
                className={`apple ${apple.bad ? 'bad' : 'good'}`}
                key={apple.id}
                style={{ left: `${apple.left}%`, top: `${apple.top}%` }}
                onClick={() => clickApple(apple)}
              >
                {apple.bad ? '🍎☠' : '🍎✓'}
              </button>
            ))}
          </div>
        )}
        {game.id === 'higherlower' && (
          <div className="higher-lower-table">
            <PlayingCard card={higherCards.first} />
            <PlayingCard card={higherCards.second} hidden={!higherCards.second} />
          </div>
        )}
      </div>
      <div className="bet-controls">
        <label>{t.walletType}<select value={wallet} onChange={(event) => setWallet(event.target.value)}><option value="points">{t.pointsWallet}</option><option value="money">{t.moneyWallet}</option></select></label>
        <label>{t.selectBet}<select value={betEtb} onChange={(event) => setBetEtb(Number(event.target.value))}>{game.betOptions.map((amount) => <option key={amount} value={amount}>{amount} ETB / {etbToPoints(amount)} pts</option>)}</select></label>
        {game.id === 'dice' && <label>Target {target}<input type="range" min="1" max="96" value={target} onChange={(event) => setTarget(Number(event.target.value))} /></label>}
        {game.id === 'plinko' && <label>{t.drop}<select value={drop} onChange={(event) => setDrop(event.target.value)}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>}
        {primaryAction && (
          <div className="bet-buttons">
            <button className="secondary-button" disabled={!freeAvailable || rolling} onClick={() => primaryAction('free')}>{t.freeReady}</button>
            <button className="primary-button" disabled={rolling} onClick={() => primaryAction('paid')}>{game.id === 'dice' ? t.roll : game.id === 'slot' ? t.spin : t.drop}</button>
          </div>
        )}
        {game.id === 'apple' && (
          <div className="bet-buttons">
            <button className="secondary-button" disabled={!freeAvailable || appleRound.running} onClick={() => startApple('free')}>{t.freeReady}</button>
            <button className="primary-button" disabled={appleRound.running} onClick={() => startApple('paid')}>START GAME</button>
          </div>
        )}
        {game.id === 'higherlower' && (
          <div className="bet-buttons split-four">
            <button className="secondary-button" disabled={!freeAvailable || rolling} onClick={() => guessCard('free', 'higher')}>Free Higher</button>
            <button className="secondary-button" disabled={!freeAvailable || rolling} onClick={() => guessCard('free', 'lower')}>Free Lower</button>
            <button className="primary-button" disabled={rolling} onClick={() => guessCard('paid', 'higher')}>Higher</button>
            <button className="primary-button" disabled={rolling} onClick={() => guessCard('paid', 'lower')}>Lower</button>
          </div>
        )}
      </div>
      {lastOutcome && (
        <p className={`game-message ${lastOutcome.win > 0 ? '' : 'danger'}`}>
          {game.id === 'dice' && `You rolled: ${lastOutcome.roll} | Target was ${lastOutcome.target} -> ${lastOutcome.win > 0 ? 'YOU WIN!' : 'YOU LOSE!'}`}
          {game.id !== 'dice' && `${lastOutcome.status}: ${lastOutcome.detail}`}
        </p>
      )}
    </div>
  );
}

function PlayingCard({ card, hidden = false }) {
  return (
    <div className={`playing-card ${hidden ? 'hidden' : ''}`}>
      {hidden ? <span>?</span> : <><b>{card.rank}</b><span>{card.suit}</span></>}
    </div>
  );
}

function GameGuide({ title, steps, example }) {
  return (
    <div className="game-how-to">
      <h3>{title}</h3>
      <ol>{steps.map((step) => <li key={step}>{step}</li>)}</ol>
      <p className="example">{example}</p>
    </div>
  );
}

function gameInstructions(gameId) {
  const instructions = {
    dice: ['Choose a target number from 1 to 96.', 'Lower target pays more but wins less often.', 'Roll the 100-number cube. Roll under or equal to target wins.'],
    slot: ['Select your bet and spin.', 'The three center reels stop left to right.', 'Three matching symbols pay the listed multiplier.'],
    plinko: ['Choose left, center, or right drop position.', 'Drop the ball through the peg board.', 'The bottom slot multiplier decides the payout.'],
    apple: ['Start the round, then tap good apples only.', 'Good apples add score. Bad apples remove lives.', 'Final winnings are score x bet x multiplier.'],
    higherlower: ['Look at the first card.', 'Guess whether the next card is higher or lower.', 'Correct wins 2x. Same value returns the bet.'],
  };
  return instructions[gameId] || ['Choose a bet.', 'Play the round.', 'Win based on the result.'];
}

function gameExample(gameId) {
  const examples = {
    dice: 'Example: target 70, roll 50, you win about 1.42x.',
    slot: 'Example: three cherries pay 2x; three diamonds pay 50x.',
    plinko: 'Example: a 10 ETB bet landing in 3x wins 30 ETB.',
    apple: 'Example: 15 good apples on a 10 ETB bet pays 75 ETB.',
    higherlower: 'Example: 7 to 10 after guessing higher pays 2x.',
  };
  return examples[gameId] || 'Play once for free every 12 hours or use a paid bet.';
}

function VipPage({ t, user, requestVip, vipNotice }) {
  return (
    <section className="vip-page">
      {vipNotice && <div className="notice-card strong"><Lock size={18} /><span>{vipNotice}</span></div>}
      <div className="section-heading hero-heading">
        <div>
          <span className="eyebrow"><Crown size={16} />{t.vipLevels}</span>
          <h1>{t.vipLevels}</h1>
          <p className="muted">{t.withdrawRuleCopy}</p>
        </div>
      </div>
      <VipTable t={t} user={user} requestVip={requestVip} />
    </section>
  );
}

function VipTable({ t, user, requestVip }) {
  const currentLevel = getPlanLevel(user?.rank || 'Starter');
  return (
    <div className="vip-grid">
      {vipPlans.map((plan) => {
        const planLevel = getPlanLevel(plan.name);
        const isCurrent = user?.rank === plan.name;
        const unavailable = !user || plan.price === 0 || planLevel <= currentLevel;
        return (
          <article className={`vip-card ${plan.color}`} key={plan.id}>
            <div>
              <span className="plan-badge">{plan.name}</span>
              <h2>{plan.price === 0 ? 'Free' : `${plan.price} ETB`}</h2>
              <p>{plan.reward} {t.perValidInvite}</p>
            </div>
            <ul>{plan.perks.map((perk) => <li key={perk}><CheckCircle2 size={16} />{perk}</li>)}</ul>
            {user && (
              <button className={unavailable ? 'secondary-button full' : 'primary-button full'} disabled={unavailable} onClick={() => requestVip(plan)}>
                {isCurrent ? t.currentPlan : planLevel < currentLevel ? t.included : t.requestVip}
              </button>
            )}
          </article>
        );
      })}
    </div>
  );
}

function ReferralPage({ t, user, users }) {
  const invited = users.filter((item) => item.invitedBy === user.id);
  return (
    <section className="page-grid">
      <div className="content-card">
        <span className="eyebrow"><Users size={16} />{t.referrals}</span>
        <h1>{t.inviteFriends}</h1>
        <p>{t.referralCode}: <b>{user.referralCode}</b></p>
        <p className="muted">{t.validInviteCopy}</p>
        <div className="stats-grid compact">
          <Stat icon={BadgeCheck} label={t.validReferrals} value={user.validReferrals} tone="green" />
          <Stat icon={Sparkles} label={t.pending} value={user.pendingReferrals} tone="yellow" />
          <Stat icon={Crown} label={t.rank} value={user.rank} tone="blue" />
          <Stat icon={Banknote} label={t.withdraw} value={canWithdraw(user) ? t.withdrawOpen : t.withdrawLocked} tone={canWithdraw(user) ? 'green' : 'red'} />
        </div>
      </div>
      <div className="content-card">
        <div className="section-heading"><h2>{t.users}</h2><span>{invited.length}</span></div>
        <div className="activity-list">
          {invited.map((item) => (
            <div className="activity-row" key={item.id}>
              <div><b>{item.fullName}</b><small>{item.phone} - {item.rank}</small></div>
              <Status status={item.referralRewarded || hasSilverOrAbove(item) ? 'approved' : 'pending'} t={t} />
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
  gameLogs,
  gameSettings,
  approveDeposit,
  rejectDeposit,
  approveWithdrawal,
  rejectWithdrawal,
  adjustUserBalance,
  persistGameSettings,
}) {
  const [settingsDraft, setSettingsDraft] = useState(gameSettings);
  const pendingDeposits = deposits.filter((deposit) => deposit.status === 'pending');
  const pendingWithdrawals = withdrawals.filter((withdrawal) => withdrawal.status === 'pending');
  const totalBalance = users.reduce((sum, user) => sum + user.balance, 0);

  return (
    <section className="admin-layout">
      <div className="admin-hero">
        <div><span className="eyebrow"><ShieldCheck size={16} />{t.adminTitle}</span><h1>{t.adminTitle}</h1><p>{t.adminCopy}</p></div>
      </div>
      <div className="stats-grid">
        <Stat icon={Users} label={t.users} value={users.length} tone="blue" />
        <Stat icon={Wallet} label={t.totalBalances} value={`${formatMoney(totalBalance)} ETB`} tone="green" />
        <Stat icon={Sparkles} label={t.pendingDeposits} value={pendingDeposits.length} tone="yellow" />
        <Stat icon={Banknote} label={t.pendingWithdrawals} value={pendingWithdrawals.length} tone="red" />
      </div>
      <div className="admin-columns">
        <div className="admin-stack">
          <AdminList title={t.pendingDeposits} count={pendingDeposits.length}>
            {pendingDeposits.map((deposit) => (
              <div className="admin-deposit" key={deposit.id}>
                <div><b>{deposit.name}</b><span>{formatMoney(deposit.amount)} ETB - {deposit.phone}</span><small>{deposit.sms}</small><small>{t.proof}: {deposit.fileName}</small>{deposit.vipPlan && <small>{t.vipUpgrade}: {deposit.vipPlan}</small>}</div>
                <div className="admin-actions"><button className="approve" onClick={() => approveDeposit(deposit.id)}><CheckCircle2 size={16} />{t.approve}</button><button className="reject" onClick={() => rejectDeposit(deposit.id)}><XCircle size={16} />{t.reject}</button></div>
              </div>
            ))}
          </AdminList>
          <AdminList title={t.pendingWithdrawals} count={pendingWithdrawals.length}>
            {pendingWithdrawals.map((withdrawal) => (
              <div className="admin-deposit" key={withdrawal.id}>
                <div><b>{withdrawal.name}</b><span>{formatMoney(withdrawal.amount)} ETB - {withdrawal.phone}</span><small>{withdrawal.method} - {withdrawal.accountNumber}</small><small>{t.accountName}: {withdrawal.accountName}</small></div>
                <div className="admin-actions"><button className="approve" onClick={() => approveWithdrawal(withdrawal.id)}><CheckCircle2 size={16} />{t.paid}</button><button className="reject" onClick={() => rejectWithdrawal(withdrawal.id)}><XCircle size={16} />{t.reject}</button></div>
              </div>
            ))}
          </AdminList>
          <AdminList title={t.gameLogs} count={gameLogs.length}>
            {gameLogs.length === 0 && <p className="muted">{t.noLogs}</p>}
            {gameLogs.slice(0, 20).map((log) => (
              <div className="activity-row" key={log.id}>
                <div><b>{log.name} - {log.gameName}</b><small>{log.outcome}; bet {formatMoney(log.bet)}; win {formatMoney(log.win)} {log.wallet === 'points' ? 'pts' : 'ETB'}</small></div>
              </div>
            ))}
          </AdminList>
        </div>
        <div className="admin-stack">
          <div className="content-card">
            <div className="section-heading"><h2>{t.adjustBalances}</h2><span>{users.length}</span></div>
            <div className="activity-list">
              {users.map((user) => (
                <div className="admin-user-row" key={user.id}>
                  <div><b>{user.fullName}</b><small>{user.rank} - {formatMoney(user.balance)} ETB - {formatMoney(user.pointsBalance)} pts</small></div>
                  <div className="balance-buttons">
                    <button onClick={() => adjustUserBalance(user.id, 'pointsBalance', 100)}>{t.addPoints}</button>
                    <button onClick={() => adjustUserBalance(user.id, 'pointsBalance', -100)}>{t.removePoints}</button>
                    <button onClick={() => adjustUserBalance(user.id, 'balance', 100)}>{t.addMoney}</button>
                    <button onClick={() => adjustUserBalance(user.id, 'balance', -100)}>{t.removeMoney}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="content-card">
            <div className="section-heading"><h2>{t.oddsSettings}</h2><Settings size={18} /></div>
            {Object.keys(defaultGameSettings).map((key) => (
              <label key={key}>{key}<input type="number" step="0.1" value={settingsDraft[key]} onChange={(event) => setSettingsDraft({ ...settingsDraft, [key]: Number(event.target.value) })} /></label>
            ))}
            <button className="primary-button full" onClick={() => persistGameSettings(settingsDraft)}>{t.saveSettings}</button>
          </div>
          <div className="content-card safety-panel">
            <h2>{t.manualReview}</h2>
            <p>{t.supabaseMode}: {isSupabaseConfigured ? t.readyMode : t.mockMode}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function AdminList({ title, count, children }) {
  return (
    <div className="content-card">
      <div className="section-heading"><h2>{title}</h2><span>{count}</span></div>
      <div className="activity-list">{children}</div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }) {
  return <div className={`stat-card ${tone}`}><Icon size={22} /><span>{label}</span><strong>{value}</strong></div>;
}

function Status({ status, t }) {
  const label = t?.[`${status}Status`] || status;
  return <span className={`status ${status}`}>{label}</span>;
}
