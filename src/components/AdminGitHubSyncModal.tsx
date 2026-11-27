import React, { useState, useEffect, useMemo } from 'react';
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
  Download,
  Copy,
  Check,
  LogOut,
  Search,
  Lock,
  Globe,
  Star,
  CheckCircle,
  FileCode2,
} from 'lucide-react';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

interface AdminGitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminGitHubSyncModal: React.FC<AdminGitHubSyncModalProps> = ({ isOpen, onClose }) => {
  const [token, setToken] = useState<string>(() => localStorage.getItem('vanjari_github_token') || '');
  const [repoName, setRepoName] = useState<string>(() => localStorage.getItem('vanjari_github_repo') || '');
  const [branch, setBranch] = useState<string>(() => localStorage.getItem('vanjari_github_branch') || 'main');
  const [repoSelectionMode, setRepoSelectionMode] = useState<'existing' | 'new'>('existing');
  const [repoSearchQuery, setRepoSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'push' | 'pull'>('push');
  const [commitMessage, setCommitMessage] = useState<string>(
    '🚀 Final Play Store Launch Release - VanjariJodi Matrimony'
  );
  const [showToken, setShowToken] = useState<boolean>(false);
  const [isCopiedKeystore, setIsCopiedKeystore] = useState<boolean>(false);

  // States
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [userRepos, setUserRepos] = useState<any[]>([]);
  const [syncResult, setSyncResult] = useState<{
    success?: boolean;
    repoUrl?: string;
    commitUrl?: string;
    commitMessage?: string;
    commitAuthor?: string;
    commitDate?: string;
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
        const fetchedRepos = Array.isArray(data.repos) ? data.repos : [];
        setUserRepos(fetchedRepos);
        localStorage.setItem('vanjari_github_token', cleanToken);

        // Smart repository matching:
        // 1. Check if user already had a saved repo in localStorage that exists in the fetched repos
        const savedRepo = localStorage.getItem('vanjari_github_repo');
        const savedRepoMatch = fetchedRepos.find(
          (r: any) => r.full_name?.toLowerCase() === savedRepo?.toLowerCase() || r.name?.toLowerCase() === savedRepo?.toLowerCase()
        );

        if (savedRepoMatch) {
          setRepoName(savedRepoMatch.full_name);
          setBranch(savedRepoMatch.default_branch || 'main');
          setRepoSelectionMode('existing');
        } else {
          // 2. Look for any existing repository with 'vanjari' in its name
          const vanjariRepo = fetchedRepos.find(
            (r: any) => r.name?.toLowerCase().includes('vanjari') || r.full_name?.toLowerCase().includes('vanjari')
          );

          if (vanjariRepo) {
            setRepoName(vanjariRepo.full_name);
            setBranch(vanjariRepo.default_branch || 'main');
            setRepoSelectionMode('existing');
            localStorage.setItem('vanjari_github_repo', vanjariRepo.full_name);
            localStorage.setItem('vanjari_github_branch', vanjariRepo.default_branch || 'main');
          } else if (fetchedRepos.length > 0) {
            // 3. Fallback to first existing repo
            setRepoName(fetchedRepos[0].full_name);
            setBranch(fetchedRepos[0].default_branch || 'main');
            setRepoSelectionMode('existing');
            localStorage.setItem('vanjari_github_repo', fetchedRepos[0].full_name);
          } else {
            // 4. Stay in existing mode so user can paste their existing repo URL without creating a new duplicate
            setRepoSelectionMode('existing');
          }
        }

        if (showSuccessAlert) {
          setSyncResult({
            success: true,
            message: `✅ GitHub खाते जोडले गेले: @${data.user.login} (${data.user.name || 'Admin'}) • ${fetchedRepos.length} रिपॉझिटरीज सापडल्या.`,
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

  const handleSelectExistingRepo = (selectedFullName: string, defaultBranch = 'main') => {
    setRepoName(selectedFullName);
    setBranch(defaultBranch);
    setRepoSelectionMode('existing');
    localStorage.setItem('vanjari_github_repo', selectedFullName);
    localStorage.setItem('vanjari_github_branch', defaultBranch);
    localStorage.setItem('vanjari_github_repo_mode', 'existing');
    setSyncResult({
      success: true,
      message: `✅ जुनी रिपॉझिटरी निवडली: github.com/${selectedFullName} (शाखा: ${defaultBranch}). कोणतीही नवीन repo तयार होणार नाही, याच जुन्या repo मध्ये कोड अपडेट होईल.`,
    });
  };

  const handleDisconnectAccount = () => {
    localStorage.removeItem('vanjari_github_token');
    localStorage.removeItem('vanjari_github_repo');
    localStorage.removeItem('vanjari_github_branch');
    setToken('');
    setUserInfo(null);
    setUserRepos([]);
    setRepoName('');
    setSyncResult({
      message: 'ℹ️ जुने GitHub खाते डिस्कनेक्ट केले आहे. आता योग्य खात्याचा Personal Access Token (PAT) खाली टाका.',
    });
  };

  // Filtered repositories based on search query
  const filteredRepos = useMemo(() => {
    if (!repoSearchQuery.trim()) return userRepos;
    const q = repoSearchQuery.toLowerCase();
    return userRepos.filter(
      (r) => r.name?.toLowerCase().includes(q) || r.full_name?.toLowerCase().includes(q)
    );
  }, [userRepos, repoSearchQuery]);

  const targetOwner = repoName.includes('/') ? repoName.split('/')[0].trim() : (userInfo?.login || '');
  const isAccountMismatch = Boolean(
    userInfo?.login &&
    targetOwner &&
    targetOwner.toLowerCase() !== userInfo.login.toLowerCase()
  );

  const handleDeployToGitHub = async () => {
    const cleanToken = token.trim();
    if (!cleanToken) {
      setSyncResult({ error: 'कृपया आधी GitHub Personal Access Token प्रविष्ट करा.' });
      return;
    }

    if (!repoName.trim()) {
      setSyncResult({ error: 'कृपया रिपॉझिटरी निवडा किंवा नाव प्रविष्ट करा.' });
      return;
    }

    setIsSyncing(true);
    setSyncStatus('🚀 GitHub शी संपर्क व कोड पॅकेजिंग सुरू आहे...');
    setSyncResult(null);

    try {
      let targetRepoName = repoName
        .trim()
        .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
        .replace(/\.git$/i, '')
        .replace(/^\/+|\/+$/g, '');
      if (!targetRepoName.includes('/') && userInfo?.login) {
        targetRepoName = `${userInfo.login}/${targetRepoName}`;
      }

      localStorage.setItem('vanjari_github_token', cleanToken);
      localStorage.setItem('vanjari_github_repo', targetRepoName);
      localStorage.setItem('vanjari_github_branch', branch.trim() || 'main');
      localStorage.setItem('vanjari_github_repo_mode', repoSelectionMode);

      const res = await fetch('/api/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: cleanToken,
          repoName: targetRepoName,
          branch: branch.trim() || 'main',
          commitMessage: commitMessage.trim(),
          createIfNotExists: repoSelectionMode === 'new',
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSyncResult({
          success: true,
          repoUrl: data.repoUrl || `https://github.com/${targetRepoName}`,
          commitUrl: data.commitUrl,
          message: data.message || `✅ संपूर्ण कोड व की यशस्वीरीत्या GitHub (${targetRepoName}) वर Deploy झाला!`,
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

  const handlePullFromGitHub = async () => {
    const cleanToken = token.trim();
    if (!cleanToken) {
      setSyncResult({ error: 'कृपया GitHub Personal Access Token प्रविष्ट करा.' });
      return;
    }

    if (!repoName.trim()) {
      setSyncResult({ error: 'कृपया ज्या रिपॉझिटरीवरून कोड डाऊनलोड करायचा आहे, ती निवडा.' });
      return;
    }

    setIsPulling(true);
    setSyncStatus('📥 GitHub वरून कोड डाऊनलोड (Pull) सुरू आहे...');
    setSyncResult(null);

    try {
      let targetRepoName = repoName.trim();
      if (!targetRepoName.includes('/') && userInfo?.login) {
        targetRepoName = `${userInfo.login}/${targetRepoName}`;
      }

      localStorage.setItem('vanjari_github_token', cleanToken);
      localStorage.setItem('vanjari_github_repo', targetRepoName);

      const res = await fetch('/api/github/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: cleanToken,
          repoName: targetRepoName,
          branch: branch.trim() || 'main',
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSyncResult({
          success: true,
          repoUrl: data.repoUrl || `https://github.com/${targetRepoName}`,
          commitUrl: data.commitUrl,
          commitMessage: data.commitMessage,
          commitAuthor: data.commitAuthor,
          commitDate: data.commitDate,
          message: data.message || '✅ GitHub वरून नवीन कोड यशस्वीरीत्या डाऊनलोड (Pull) झाला!',
        });
        setSyncStatus('✅ Pull यशस्वीरीत्या पूर्ण झाले!');
      } else {
        setSyncResult({
          error: data.error || 'GitHub वरून कोड डाऊनलोड करताना समस्या आली.',
        });
        setSyncStatus('❌ Pull अयशस्वी झाले.');
      }
    } catch (err: any) {
      setSyncResult({
        error: err.message || 'GitHub Pull प्रक्रियेत तांत्रिक त्रुटी आली.',
      });
      setSyncStatus('❌ तांत्रिक त्रुटी.');
    } finally {
      setIsPulling(false);
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
                  GitHub Deploy &amp; Code Sync Center
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                  v3.0
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {repoName ? `github.com/${repoName}` : 'GitHub वरून जुनी Repo निवडा किंवा नवीन कनेक्ट करा'}
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">

          {/* Connected GitHub Account Card */}
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
                        सध्या जोडलेले GitHub खाते (Connected Account)
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
                      एकूण रिपॉझिटरीज: <strong className="text-amber-300">{userRepos.length}</strong> सापडल्या.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleValidateToken(token, true)}
                    disabled={isValidating}
                    className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition active:scale-95"
                    title="रिफ्रेश करा"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin' : ''}`} />
                    <span>रिफ्रेश</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnectAccount}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer transition active:scale-95"
                    title="खाते बदला / डिस्कनेक्ट करा"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>खाते बदला</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-center gap-2.5 text-amber-900 text-xs font-medium">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
              <span>कोणतेही GitHub खाते जोडलेले नाही. ज्या खात्यावर कोड पाठवायचा आहे, त्याचा टोकन खाली टाका.</span>
            </div>
          )}

          {/* Push / Pull Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-200/90 p-1">
            <button
              type="button"
              onClick={() => { setActiveTab('push'); setSyncResult(null); }}
              className={`flex-1 py-2 text-xs font-black rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'push'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>🚀 GitHub वर पाठवा (Push / Deploy)</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('pull'); setSyncResult(null); }}
              className={`flex-1 py-2 text-xs font-black rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'pull'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>📥 GitHub वरून आणा (Pull / Download)</span>
            </button>
          </div>

          {/* Main Sync Config Form */}
          <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {/* Step 1: GitHub Token Input */}
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
                  <span>टोकन मिळवा (Get Token)</span>
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
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-[10px] font-bold disabled:opacity-50 cursor-pointer"
                  >
                    {isValidating ? <Loader2 className="w-3 h-3 animate-spin" /> : 'तपासा'}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: Repository Mode Switcher (Existing Repo vs New Repo) */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">
                  🎯 रिपॉझिटरी कशी जोडायची आहे? (Select Repository Method):
                </label>
                {repoName && (
                  <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                    {repoName}
                  </span>
                )}
              </div>

              {/* Toggle Mode: 1. जुनी अस्तित्वात असलेली Repo | 2. नवीन Repo तयार करा */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRepoSelectionMode('existing');
                    localStorage.setItem('vanjari_github_repo_mode', 'existing');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2 ${
                    repoSelectionMode === 'existing'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400 font-black shadow-xs'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 font-bold'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    repoSelectionMode === 'existing' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-400'
                  }`}>
                    {repoSelectionMode === 'existing' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="text-xs">🔗 १. जुनी / अस्तित्वात असलेली Repo</div>
                    <div className="text-[10px] text-slate-500 font-medium">खात्यातील जुनी Repo निवडून थेट कनेक्ट करा</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRepoSelectionMode('new');
                    localStorage.setItem('vanjari_github_repo_mode', 'new');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2 ${
                    repoSelectionMode === 'new'
                      ? 'bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-400 font-black shadow-xs'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 font-bold'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    repoSelectionMode === 'new' ? 'border-amber-600 bg-amber-600' : 'border-slate-400'
                  }`}>
                    {repoSelectionMode === 'new' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="text-xs">➕ २. नवीन Repo तयार करा</div>
                    <div className="text-[10px] text-slate-500 font-medium">GitHub वर नवीन रिकामी repo बनवण्यासाठी</div>
                  </div>
                </button>
              </div>

              {/* MODE A: EXISTING OLD REPOSITORY SELECTOR */}
              {repoSelectionMode === 'existing' && (
                <div className="p-3 bg-white rounded-xl border-2 border-emerald-300 space-y-2.5 shadow-xs">
                  {/* Direct Input Box for Existing Repo URL or owner/repo */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-emerald-900 block">
                      🎯 तुमच्या आधीपासून बनवलेल्या GitHub Repo चे नाव किंवा URL टाका (किंवा खालील यादीतून निवडा):
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. https://github.com/username/vanjarijodi किंवा username/vanjarijodi"
                      value={repoName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRepoName(val);
                        localStorage.setItem('vanjari_github_repo', val);
                      }}
                      className="w-full px-3 py-2 bg-emerald-50/40 border border-emerald-400 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <Search className="w-3.5 h-3.5 text-slate-500" />
                      <span>तुमच्या खात्यावरील सर्व जुन्या रिपॉझिटरीज ({userRepos.length}):</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      टॅप करून जुनी repo निवडा 👇
                    </span>
                  </div>

                  {/* Search box if there are multiple repos */}
                  {userRepos.length > 3 && (
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="🔍 जुनी रिपॉझिटरी शोधा (उदा. vanjari, app, matrimony)..."
                        value={repoSearchQuery}
                        onChange={(e) => setRepoSearchQuery(e.target.value)}
                        className="w-full px-3 py-1.5 pl-8 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                    </div>
                  )}

                  {/* Repositories Scrollable List */}
                  {userRepos.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
                      {filteredRepos.map((r: any) => {
                        const isSelected =
                          repoName.toLowerCase() === r.full_name?.toLowerCase() ||
                          repoName.toLowerCase() === r.name?.toLowerCase();
                        const isVanjari = r.name?.toLowerCase().includes('vanjari');

                        return (
                          <div
                            key={r.full_name}
                            onClick={() => handleSelectExistingRepo(r.full_name, r.default_branch || 'main')}
                            className={`p-2 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition ${
                              isSelected
                                ? 'bg-emerald-100/90 border border-emerald-400 font-bold'
                                : 'hover:bg-slate-100 bg-slate-50/70 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`p-1 rounded-lg ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                <FolderGit2 className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`font-mono text-xs truncate ${isSelected ? 'text-emerald-950 font-black' : 'text-slate-900'}`}>
                                    {r.full_name}
                                  </span>
                                  {isVanjari && (
                                    <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 text-[9px] font-bold rounded flex items-center gap-0.5">
                                      <Star className="w-2.5 h-2.5 fill-amber-700 text-amber-700" />
                                      <span>वंजारी प्रोजेक्ट</span>
                                    </span>
                                  )}
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                                    {r.private ? 'Private 🔒' : 'Public 🌐'}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                  शाखा: <strong>{r.default_branch || 'main'}</strong>
                                  {r.description ? ` • ${r.description.slice(0, 45)}...` : ''}
                                </div>
                              </div>
                            </div>

                            <div className="shrink-0">
                              {isSelected ? (
                                <span className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  <span>निवडली</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  className="px-2 py-1 bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-lg text-[10px] font-bold"
                                >
                                  निवडा
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-100 rounded-xl text-center text-xs text-slate-600">
                      या खात्यावर कोणतीही रिपॉझिटरी सापडली नाही. वर 'तपासा' बटण दाबून टोकन तपासा किंवा नवीन तयार करण्याचा पर्याय निवडा.
                    </div>
                  )}

                  {/* Confirmation Banner for Selected Old Repo */}
                  {repoName && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-950 text-xs space-y-1">
                      <div className="font-black flex items-center gap-1 text-emerald-900">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>१००% सुरक्षित हमी (Zero Duplicate Repo):</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        कोणतीही नवीन रिपॉझिटरी तयार होणार नाही! सर्व नवीन कोड, कीस्टोअर आणि ३ ॲस्ट्रॉलॉजी इंजिन्स तुमच्या याच <strong>github.com/{repoName}</strong> जुन्या रिपॉझिटरीमध्ये (शाखा: <strong>{branch}</strong>) थेट अपडेट होतील.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* MODE B: CREATE NEW REPOSITORY */}
              {repoSelectionMode === 'new' && (
                <div className="p-3 bg-white rounded-xl border-2 border-amber-300 space-y-2">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    नवीन रिपॉझिटरीचे नाव (New Repository Name):
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. username/vanjarijodi-app"
                    value={repoName}
                    onChange={(e) => {
                      setRepoName(e.target.value);
                      localStorage.setItem('vanjari_github_repo', e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-amber-800 font-medium">
                    ✨ हे नाव तुमच्या GitHub खात्यावर अस्तित्वात नसल्यास नवीन रिपॉझिटरी आपोआप तयार केली जाईल.
                  </p>
                </div>
              )}
            </div>

            {/* Target Branch & Commit Message */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Git Branch (शाखा):
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => {
                    setBranch(e.target.value);
                    localStorage.setItem('vanjari_github_branch', e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  डीफॉल्ट मुख्य शाखा: <span className="font-mono font-bold">{branch || 'main'}</span>
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Commit Message (अपडेट नोंद):
                </label>
                <textarea
                  rows={2}
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Account Info Notice (Non-blocking for Org/Collaborator Repos) */}
            {isAccountMismatch && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 text-xs space-y-1">
                <div className="font-black flex items-center gap-1 text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>ℹ️ संस्था / कोलाबोरेटर रिपॉझिटरी सूचना:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  टोकन <strong>@{userInfo?.login}</strong> चा आहे आणि रिपॉझिटरी <strong>@{targetOwner}</strong> अंतर्गत आहे. तुम्हाला या रिपॉझिटरीवर लिहिण्याची (Push) परवानगी असल्यास डिप्लॉय थेट याच जुन्या रिपॉझिटरीमध्ये होईल.
                </p>
              </div>
            )}
          </div>

          {/* 🔑 Secure Play Store Signing Info Card (Zero Public Keystore Exposure) */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-300 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-600 text-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-emerald-950">
                    🔒 Play Store AAB सुरक्षा व GitHub Actions Auto-Build तयार
                  </h4>
                  <p className="text-[10.5px] text-emerald-900 font-medium">
                    कोड GitHub वर Push होताच Actions मध्ये Google Play Store साठी signed <code className="font-mono font-bold bg-emerald-200/70 px-1 rounded">VanjariJodi-release.aab</code> व <code className="font-mono font-bold bg-emerald-200/70 px-1 rounded">VanjariJodi.apk</code> आपोआप तयार होतात.
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black shrink-0">
                ✓ Play Ready
              </span>
            </div>
          </div>

          {/* Sync Result Feedback Banner */}
          {syncResult && (
            <div
              className={`p-4 rounded-2xl border-2 space-y-2 animate-in fade-in ${
                syncResult.success
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {syncResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="font-bold text-xs sm:text-sm">
                    {syncResult.message || syncResult.error}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 pl-7">
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
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-100 px-4 sm:px-6 py-3.5 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300 text-xs transition cursor-pointer"
          >
            बंद करा (Close)
          </button>

          {activeTab === 'push' ? (
            <button
              type="button"
              onClick={handleDeployToGitHub}
              disabled={isSyncing || isPulling || !token.trim() || !repoName.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-xl text-xs sm:text-sm shadow-md transition flex items-center gap-2 disabled:opacity-60 cursor-pointer active:scale-95"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>GitHub वर पाठवत आहे...</span>
                </>
              ) : (
                <>
                  <FolderGit2 className="w-4 h-4 text-white" />
                  <span>
                    {repoSelectionMode === 'existing'
                      ? '🚀 जुन्या Repo मध्ये Deploy / Push करा'
                      : '🚀 नवीन Repo मध्ये Deploy / Push करा'}
                  </span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePullFromGitHub}
              disabled={isSyncing || isPulling || !token.trim() || !repoName.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black rounded-xl text-xs sm:text-sm shadow-md transition flex items-center gap-2 disabled:opacity-60 cursor-pointer active:scale-95"
            >
              {isPulling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>GitHub वरून डाऊनलोड (Pull) होत आहे...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>📥 GitHub वरून कोड पुल (Pull) करा</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminGitHubSyncModal;
