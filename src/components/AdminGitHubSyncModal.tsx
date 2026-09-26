import React, { useState, useEffect } from 'react';
import {
  X,
  GitBranch,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  FolderGit2,
  Layers,
  FileCode2,
  Terminal,
  Download,
  Copy,
  Check,
  LogOut,
  HelpCircle,
  Info,
  UserCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

interface AdminGitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminGitHubSyncModal: React.FC<AdminGitHubSyncModalProps> = ({ isOpen, onClose }) => {
  const [token, setToken] = useState<string>(() => localStorage.getItem('vanjari_github_token') || '');
  const [repoName, setRepoName] = useState<string>('vanjarijodi');
  const [branch, setBranch] = useState<string>('main');
  const [commitMessage, setCommitMessage] = useState<string>(
    '🚀 Deploy VanjariJodi v3.0: 3 Vedic Astrology Engines, Audio Sound Chimes, PWA, Android App & Admin Controls'
  );
  const [showToken, setShowToken] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [isCopiedKeystore, setIsCopiedKeystore] = useState<boolean>(false);

  // Master PIN protection for Deploy
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [masterPinInput, setMasterPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // States
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [userRepos, setUserRepos] = useState<any[]>([]);
  const [syncResult, setSyncResult] = useState<{
    success?: boolean;
    repoUrl?: string;
    commitUrl?: string;
    message?: string;
    error?: string;
  } | null>(null);

  useModalScrollLock(isOpen);

  useEffect(() => {
    const savedToken = localStorage.getItem('vanjari_github_token');
    if (savedToken && !userInfo) {
      handleValidateToken(savedToken, false);
    }
  }, [isOpen]);

  const handleValidateToken = async (tokenToTest = token, showSuccessAlert = true): Promise<any> => {
    const cleanToken = tokenToTest.trim();
    if (!cleanToken) {
      setSyncResult({ error: 'कृपया GitHub Personal Access Token प्रविष्ट करा.' });
      return null;
    }

    setIsValidating(true);
    setSyncResult(null);

    try {
      const res = await fetch('/api/github/validate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: cleanToken }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setUserInfo(data.user);
        if (data.repos && Array.isArray(data.repos)) {
          setUserRepos(data.repos);
        }
        localStorage.setItem('vanjari_github_token', cleanToken);

        // Auto-adapt repo name to the logged in user's profile
        setRepoName((prev) => {
          if (!prev || prev === 'vanjarijodi' || prev === 'vanjarijodi/vanjarijodi' || prev.startsWith('vanjarijodi/')) {
            return `${data.user.login}/vanjarijodi`;
          }
          return prev;
        });

        if (showSuccessAlert) {
          setSyncResult({
            success: true,
            message: `✅ GitHub खाते जोडले गेले: @${data.user.login} (${data.user.name || 'Admin'})`,
          });
        }
        return data.user;
      } else {
        setUserInfo(null);
        setSyncResult({
          error: data.error || 'GitHub Token अवैध आहे. कृपया परमिशन तपासा.',
        });
        return null;
      }
    } catch (err: any) {
      setSyncResult({ error: err.message || 'सर्व्हरशी संपर्क होऊ शकला नाही.' });
      return null;
    } finally {
      setIsValidating(false);
    }
  };

  const handleDisconnectAccount = () => {
    localStorage.removeItem('vanjari_github_token');
    setToken('');
    setUserInfo(null);
    setUserRepos([]);
    setRepoName('vanjarijodi');
    setSyncResult({
      message: 'ℹ️ जुने GitHub खाते डिस्कनेक्ट केले आहे. आता ज्या खात्यामध्ये तुम्हाला कोड पाठवायचा आहे, त्या योग्य खात्याचा नवीन Personal Access Token खाली टाका.',
    });
  };

  const targetOwner = repoName.includes('/') ? repoName.split('/')[0].trim() : (userInfo?.login || '');
  const isAccountMismatch = Boolean(
    userInfo?.login &&
    targetOwner &&
    targetOwner.toLowerCase() !== userInfo.login.toLowerCase()
  );

  const handleDeployToGitHub = async () => {
    const cleanToken = token.trim();
    if (!cleanToken) {
      setSyncResult({ error: 'कृपया GitHub Personal Access Token प्रविष्ट करा.' });
      return;
    }

    if (isAccountMismatch) {
      setSyncResult({
        error: `❌ खाते विसंगती: तुमचा जोडलेला टोकन '@${userInfo?.login}' या खात्याचा आहे, परंतु तुम्ही '${targetOwner}' या दुसऱ्या खात्याचे नाव टाकले आहे. GitHub नियमांनुसार '@${userInfo?.login}' च्या टोकनने '${targetOwner}' च्या खात्यात कोड पाठवता येत नाही.\n\n👉 उपाय: वर 'खाते बदला' बटण दाबून '@${targetOwner}' खात्याचा नवीन टोकन टाका, किंवा खाली Repository Name मध्ये '${userInfo?.login}/${repoName.split('/')[1] || 'vanjarijodi'}' निवडा.`,
      });
      return;
    }

    setIsSyncing(true);
    setSyncStatus('🚀 GitHub खात्याची पडताळणी करत आहे...');
    setSyncResult(null);

    try {
      let currentUser = userInfo;
      if (!currentUser) {
        currentUser = await handleValidateToken(cleanToken, false);
      }

      // Automatically determine repo target: if user is logged in as 'xyz', target 'xyz/vanjarijodi'
      let targetRepoName = repoName.trim();
      if (!targetRepoName || targetRepoName === 'vanjarijodi') {
        targetRepoName = currentUser ? `${currentUser.login}/vanjarijodi` : 'vanjarijodi';
      }

      setSyncStatus('🚀 GitHub Repository शी संपर्क व कोड पॅकेजिंग सुरू आहे...');
      localStorage.setItem('vanjari_github_token', cleanToken);

      const res = await fetch('/api/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: cleanToken,
          repoName: targetRepoName,
          branch: branch.trim() || 'main',
          commitMessage: commitMessage.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSyncResult({
          success: true,
          repoUrl: data.repoUrl || `https://github.com/${targetRepoName}`,
          commitUrl: data.commitUrl,
          message: data.message || '✅ कोड यशस्वीरीत्या GitHub वर Deploy / Push करण्यात आला!',
        });
        setSyncStatus('✅ Deploy यशस्वीरीत्या पूर्ण झाले!');
      } else {
        setSyncResult({
          error: data.error || 'GitHub वर डिप्लॉय करताना समस्या आली.',
        });
        setSyncStatus('❌ Deploy अयशस्वी झाले.');
      }
    } catch (err: any) {
      setSyncResult({
        error: err.message || 'GitHub Deploy प्रक्रियेत तांत्रिक त्रुटी आली.',
      });
      setSyncStatus('❌ तांत्रिक त्रुटी.');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-4 sm:px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
              <FolderGit2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  GitHub Deploy & Sync Center
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                  v3.0
                </span>
              </div>
              <p className="text-xs text-slate-300">
                https://github.com/{repoName.includes('/') ? repoName : `${userInfo?.login || 'username'}/${repoName}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {!isUnlocked ? (
          <div className="p-6 sm:p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-amber-900/30 border-2 border-amber-400/50 rounded-2xl flex items-center justify-center mx-auto text-amber-500 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-amber-500 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-wide">
                🚀 GitHub Deploy व सिंक लॉक (Master Protected)
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto leading-relaxed font-medium">
                Google Play Console टेस्टर्स किंवा अनधिकृत युझर्सना GitHub कोड व सिंक सेटिंग्ज बदलता येऊ नये म्हणून सुरक्षित पासवर्ड प्रविष्ट करा.
              </p>
              <div className="mt-2 inline-block px-3.5 py-1 bg-amber-100 border border-amber-300 rounded-full text-amber-900 text-xs font-black shadow-2xs">
                🔒 केवळ अधिकृत ॲडमिनसाठी सुरक्षित पिन आवश्यक आहे
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const clean = masterPinInput.trim();
                if (clean === '986188') {
                  setIsUnlocked(true);
                  setPinError('');
                } else {
                  setPinError('❌ चुकीचा सुरक्षा पिन! कृपया योग्य पिन प्रविष्ट करा.');
                }
              }}
              className="max-w-sm mx-auto space-y-3 pt-2"
            >
              <input
                type="password"
                placeholder="पासवर्ड किंवा PIN प्रविष्ट करा"
                value={masterPinInput}
                onChange={(e) => {
                  setMasterPinInput(e.target.value);
                  setPinError('');
                }}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-amber-400 rounded-xl text-slate-900 text-center font-mono text-sm font-bold placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#800C1E] shadow-inner"
                autoFocus
              />
              {pinError && (
                <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2 rounded-lg border border-rose-200">{pinError}</p>
              )}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#800C1E] to-rose-900 hover:from-[#660918] hover:to-rose-950 active:scale-[0.98] text-amber-100 font-black rounded-xl shadow-md text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>🔓 अनलॉक करा व Deploy उघडा</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Target Repo Banner */}
          <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-200/80 text-[#800C1E] flex items-center justify-center font-bold">
                <GitBranch className="w-4 h-4 text-[#800C1E]" />
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                  लक्ष्य रिपॉझिटरी (Target Repository):
                </div>
                <div className="font-mono text-amber-900 font-bold text-xs">
                  https://github.com/{repoName.includes('/') ? repoName : `${userInfo?.login || 'username'}/${repoName}`}
                </div>
              </div>
            </div>
            <a
              href={`https://github.com/${repoName.includes('/') ? repoName : `${userInfo?.login || 'username'}/${repoName}`}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-white text-slate-800 hover:text-[#800C1E] rounded-xl border border-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
            >
              <span>Repo उघडा</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Connected GitHub Account Card (Prominent & Clear) */}
          {userInfo ? (
            <div className="p-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border-2 border-indigo-400/60 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="relative shrink-0">
                    <img
                      src={userInfo.avatar_url}
                      alt={userInfo.login}
                      className="w-11 h-11 rounded-full border-2 border-amber-400 shadow"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-300">
                        सध्या जोडलेले GitHub खाते (Current Account)
                      </span>
                      <span className="px-2 py-0.2 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/30">
                        ✓ Active
                      </span>
                    </div>
                    <div className="font-black text-sm sm:text-base text-white flex items-center gap-1.5 mt-0.5">
                      <a
                        href={userInfo.html_url || `https://github.com/${userInfo.login}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center gap-1 text-amber-200"
                        title="GitHub Profile उघडा"
                      >
                        <span>@{userInfo.login}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {userInfo.name && (
                        <span className="text-xs text-slate-300 font-normal">({userInfo.name})</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      सर्व कोड व AAB फाइल्स <strong className="text-white font-mono bg-white/10 px-1 py-0.5 rounded">github.com/{userInfo.login}/...</strong> या खात्यावर जातील.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={handleDisconnectAccount}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
                    title="हे खाते काढून दुसऱ्या खात्याचा टोकन टाका"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>खाते बदला (Switch Account)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 flex items-center justify-between text-xs text-amber-950">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0" />
                <span>कोणतेही GitHub खाते जोडलेले नाही. ज्या खात्यावर कोड पाठवायचा आहे, त्याचा टोकन खाली टाका.</span>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 underline shrink-0 cursor-pointer"
              >
                टोकन कसे बनवायचे?
              </button>
            </div>
          )}

          {/* Guide for switching/creating token for the desired account */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="w-full flex items-center justify-between text-xs font-black text-slate-800 hover:text-[#800C1E] transition cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>दुसऱ्या / योग्य GitHub खात्यावर कोड कसा पाठवायचा? (Account Switch Guide)</span>
              </div>
              {showGuide ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </button>

            {showGuide && (
              <div className="pt-2 text-xs text-slate-700 space-y-2 border-t border-slate-200 animate-in fade-in duration-150">
                <p className="font-semibold text-slate-800">
                  GitHub टोकन (PAT) हा ज्या खात्यातून बनवला जातो, कोड नेहमी त्याच खात्यात जातो. दुसऱ्या खात्यात कोड पाठवण्यासाठी खालील ३ पायऱ्या करा:
                </p>
                <div className="space-y-1.5 pl-2 border-l-2 border-amber-400 text-[11.5px]">
                  <p>
                    <strong>पायरी १:</strong> ब्राऊझरमध्ये आधी <strong>ज्या GitHub खात्यात कोड हवा आहे</strong> तेच खाते लॉगिन करा (दुसऱ्या जुन्या खात्यावरून Sign Out करा किंवा Incognito/Private Window वापरा).
                  </p>
                  <p>
                    <strong>पायरी २:</strong>{' '}
                    <a
                      href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=VanjariJodi-App-Deploy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 font-bold underline inline-flex items-center gap-1"
                    >
                      <span>येथे क्लिक करून नवीन टोकन (PAT) बनवा</span>
                      <ExternalLink className="w-3 h-3 inline" />
                    </a>{' '}
                    (त्यात <code className="bg-slate-200 px-1 rounded font-bold">repo</code> आणि <code className="bg-slate-200 px-1 rounded font-bold">workflow</code> टिकमार्क करा).
                  </p>
                  <p>
                    <strong>पायरी ३:</strong> तयार झालेले टोकन कॉपी करून खालील बॉक्समध्ये टाका आणि <strong>'तपासा'</strong> दाबा. तुमचे योग्य खाते (@username) दिसेल आणि मग Deploy करा!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 🔑 Play Store AAB Signing Key Assurance Card */}
          <div className="p-3.5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-300 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-600 text-white">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-950">
                    🔑 Play Store AAB साइनिंग की हमी (Signing Key Guarantee)
                  </h4>
                  <p className="text-[10.5px] text-amber-900 font-medium">
                    या सिंकमध्ये <code className="font-mono font-bold bg-amber-200/80 px-1 rounded">release.keystore</code> थेट GitHub वर पुश केले जाते.
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black shrink-0">
                ✓ सिंक समाविष्ट
              </span>
            </div>

            <p className="text-[11px] text-slate-700 leading-relaxed">
              Google Play Console वर भविष्यात नवीन अपडेट्स (जसे की व्हर्जन २, ३, ४ ची <code className="font-mono font-bold text-[#800C1E]">.aab</code> फाईल) अपलोड करताना हेच मूळ साईन आवश्यक असते. ही की Git Repo मध्ये कायमस्वरूपी सेव्ह असल्याने GitHub Actions नेहमी याच की ने आपोआप साईन करेल, ज्यामुळे <strong>"Wrong Signing Key"</strong> ची एरर कधीही येणार नाही.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200">
              <a
                href="/downloads/release.keystore"
                download="release.keystore"
                className="px-2.5 py-1 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                title="की फाईल डाऊनलोड करा"
              >
                <Download className="w-3 h-3" />
                <span>release.keystore डाऊनलोड करा</span>
              </a>

              <a
                href="/downloads/KEYSTORE_INFO.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                title="की क्रेडेंशियल्स तपशील पहा"
              >
                <FileCode2 className="w-3 h-3" />
                <span>KEYSTORE_INFO.txt</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  const base64Key = "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";
                  navigator.clipboard.writeText(base64Key);
                  setIsCopiedKeystore(true);
                  setTimeout(() => setIsCopiedKeystore(false), 2500);
                }}
                className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 text-[11px] font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
              >
                {isCopiedKeystore ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-amber-700" />}
                <span>{isCopiedKeystore ? 'Base64 कॉपी झाले!' : 'Base64 Key कॉपी करा'}</span>
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {/* GitHub Token Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-600" />
                  <span>GitHub Personal Access Token (PAT):</span>
                </label>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=VanjariJodi+Auto+Deploy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 underline"
                >
                  <span>टोकन कसे मिळवायचे? (Get Token)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  placeholder="उदा. ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full pl-3.5 pr-20 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="p-1 text-slate-400 hover:text-slate-700"
                    title={showToken ? 'लपवा' : 'दाखवा'}
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleValidateToken()}
                    disabled={isValidating || !token.trim()}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-[10px] font-bold disabled:opacity-50 cursor-pointer"
                  >
                    {isValidating ? <Loader2 className="w-3 h-3 animate-spin" /> : 'तपासा'}
                  </button>
                </div>
              </div>
            </div>

            {/* Target Branch and Repo Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700">
                    Repository Name:
                  </label>
                  {userInfo && (
                    <button
                      type="button"
                      onClick={() => setRepoName(`${userInfo.login}/vanjarijodi`)}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
                    >
                      {userInfo.login}/vanjarijodi
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="उदा. username/vanjarijodi"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />

                {/* Quick Alternate Name Suggestions */}
                <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-500 font-semibold">सुचवलेली नावे:</span>
                  {[
                    userInfo ? `${userInfo.login}/vanjarijodi` : 'vanjarijodi',
                    userInfo ? `${userInfo.login}/vanjarijodi-app` : 'vanjarijodi-app',
                    userInfo ? `${userInfo.login}/vanjari-jodi-matrimony` : 'vanjari-jodi-matrimony',
                  ].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setRepoName(sug)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer transition active:scale-95 ${
                        repoName === sug
                          ? 'bg-amber-600 text-white font-bold'
                          : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                      }`}
                      title={sug}
                    >
                      {sug.split('/')[1] || sug}
                    </button>
                  ))}
                </div>

                {userRepos.length > 0 && (
                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-500 font-semibold">अस्तित्वात असलेल्या:</span>
                    {userRepos.slice(0, 3).map((r) => (
                      <button
                        key={r.name}
                        type="button"
                        onClick={() => setRepoName(r.full_name)}
                        className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-[10px] font-mono cursor-pointer transition truncate max-w-[130px]"
                        title={r.full_name}
                      >
                        {r.name}
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-emerald-700 font-medium mt-1">
                  ✨ जर जुने नाव डिलीट केले असल्यास 'vanjarijodi-app' निवडा किंवा GitHub वर जुनी repo Restore करा.
                </p>

                {/* Real-time Account Mismatch Warning */}
                {isAccountMismatch && (
                  <div className="mt-2.5 p-3 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-950 text-xs space-y-1.5 animate-in fade-in">
                    <div className="font-black flex items-center gap-1.5 text-rose-900">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>⚠️ खाते विसंगती चेतावणी (Account Mismatch Warning):</span>
                    </div>
                    <p className="text-[11.5px] leading-relaxed">
                      तुम्ही Repository नाव <strong className="font-mono text-rose-900 bg-rose-100 px-1 rounded">{repoName}</strong> (खाते: <strong>@{targetOwner}</strong>) असे टाकले आहे.
                      परंतु तुमचा जोडलेला टोकन <strong className="font-mono text-indigo-900 bg-indigo-100 px-1 rounded">@{userInfo?.login}</strong> या खात्याचा आहे!
                    </p>
                    <p className="text-[11px] font-bold text-rose-800">
                      GitHub च्या सुरक्षेनुसार एका खात्याचा टोकन दुसऱ्या खात्यात कोड टाकू शकत नाही.
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setRepoName(`${userInfo.login}/${repoName.split('/')[1] || 'vanjarijodi'}`)}
                        className="px-2.5 py-1 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-[10.5px] font-bold cursor-pointer transition active:scale-95"
                      >
                        👉 @{userInfo.login} च्या खात्यावर पाठवा
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleDisconnectAccount();
                          setShowGuide(true);
                        }}
                        className="px-2.5 py-1 bg-white border border-rose-400 text-rose-900 hover:bg-rose-100 rounded-lg text-[10.5px] font-bold cursor-pointer transition active:scale-95"
                      >
                        🔑 @{targetOwner} चा टोकन टाकण्यासाठी खाते बदला
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Git Branch:
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  डीफॉल्ट मुख्य शाखा: <span className="font-mono font-bold">main</span>
                </p>
              </div>
            </div>

            {/* Commit Message */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Commit Message:
              </label>
              <textarea
                rows={2}
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Sync Status / Result Banner */}
          {isSyncing && (
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center space-x-3 text-blue-900">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600 shrink-0" />
              <div>
                <div className="font-bold text-xs">Deploy सुरू आहे...</div>
                <div className="text-[11px] text-blue-700">{syncStatus}</div>
              </div>
            </div>
          )}

          {syncResult?.error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-rose-900">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold">त्रुटी: </span>
                <span>{syncResult.error}</span>
              </div>
            </div>
          )}

          {syncResult?.success && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2 text-emerald-950">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-black text-xs sm:text-sm">{syncResult.message}</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {syncResult.repoUrl && (
                  <a
                    href={syncResult.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <span>GitHub Repo उघडा</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {syncResult.commitUrl && (
                  <a
                    href={syncResult.commitUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-white border border-emerald-400 text-emerald-900 hover:bg-emerald-100 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>Commit पहा</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Quick Step Guide for Token */}
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-[11px] text-slate-700 space-y-1.5">
            <div className="font-bold text-amber-900 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>३० सेकंदात GitHub Token मिळवण्याची पद्धत:</span>
            </div>
            <ol className="list-decimal pl-4 space-y-1">
              <li>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=VanjariJodi+Auto+Deploy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 font-bold underline"
                >
                  येथे क्लिक करून GitHub Settings उघडा
                </a>
              </li>
              <li>
                <strong>'repo'</strong> (Full control of repositories) आणि <strong>'workflow'</strong> (GitHub Actions) हे दोन्ही बॉक्स निवडा (✓).
              </li>
              <li>खाली <strong>'Generate token'</strong> वर क्लिक करून टोकन कॉपी करा व वरील बॉक्समध्ये पेस्ट करा.</li>
            </ol>
          </div>
        </div>
        )}

        {/* Modal Footer Actions */}
        <div className="bg-slate-100 px-4 sm:px-6 py-3.5 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300 text-xs transition cursor-pointer"
          >
            बंद करा (Close)
          </button>

          <button
            type="button"
            onClick={handleDeployToGitHub}
            disabled={isSyncing || !token.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-xl text-xs sm:text-sm shadow-md transition flex items-center gap-2 disabled:opacity-60 cursor-pointer active:scale-95"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>GitHub वर Deploy होत आहे...</span>
              </>
            ) : (
              <>
                <FolderGit2 className="w-4 h-4 text-white" />
                <span>🚀 GitHub वर Deploy / Sync करा</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
