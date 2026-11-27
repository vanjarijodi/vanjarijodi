import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export interface GitHubAuthResult {
  success: boolean;
  user?: {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
    name: string;
    email: string;
    public_repos: number;
    total_private_repos?: number;
  };
  repos?: Array<{
    name: string;
    full_name: string;
    private: boolean;
    html_url: string;
    default_branch: string;
    description?: string;
    updated_at?: string;
    pushed_at?: string;
  }>;
  error?: string;
}

/**
 * Validates a GitHub Personal Access Token or credentials and returns user's repositories
 */
export async function validateGitHubToken(token: string): Promise<GitHubAuthResult> {
  try {
    const cleanToken = token.trim();
    if (!cleanToken) {
      return { success: false, error: 'GitHub Personal Access Token is required.' };
    }

    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'VanjariJodi-Sync-Agent',
      },
    });

    if (!userRes.ok) {
      const errData: any = await userRes.json().catch(() => ({}));
      return {
        success: false,
        error:
          errData.message ||
          `GitHub Authentication failed with status ${userRes.status}. Please check your token permissions.`,
      };
    }

    const userData: any = await userRes.json();

    // Fetch user repositories (up to 200 across owner, collaborator, and organization memberships)
    const fetchReposPage = async (page: number) => {
      const res = await fetch(
        `https://api.github.com/user/repos?visibility=all&sort=updated&per_page=100&page=${page}&affiliation=owner,collaborator,organization_member`,
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'VanjariJodi-Sync-Agent',
          },
        }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    };

    const page1 = await fetchReposPage(1);
    const page2 = page1.length === 100 ? await fetchReposPage(2) : [];
    const allReposRaw = [...page1, ...page2];

    const repos: any[] = allReposRaw.map((r) => ({
      name: r.name,
      full_name: r.full_name,
      private: r.private,
      html_url: r.html_url,
      default_branch: r.default_branch || 'main',
      description: r.description || '',
      updated_at: r.updated_at || '',
      pushed_at: r.pushed_at || '',
    }));

    return {
      success: true,
      user: {
        login: userData.login,
        id: userData.id,
        avatar_url: userData.avatar_url,
        html_url: userData.html_url,
        name: userData.name || userData.login,
        email: userData.email || '',
        public_repos: userData.public_repos || 0,
        total_private_repos: userData.total_private_repos || 0,
      },
      repos,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to connect to GitHub API.',
    };
  }
}

/**
 * Syncs the project strictly into an existing GitHub repository (or creates a new one ONLY when createIfNotExists=true)
 */
export async function syncProjectToGitHub(params: {
  token: string;
  repoName: string;
  isPrivate?: boolean;
  commitMessage?: string;
  branch?: string;
  owner?: string;
  createIfNotExists?: boolean;
}): Promise<{
  success: boolean;
  repoUrl?: string;
  commitUrl?: string;
  filesSyncedCount?: number;
  message?: string;
  error?: string;
}> {
  const {
    token,
    repoName,
    isPrivate = false,
    commitMessage = '🚀 Final Launch Update - VanjariJodi Matrimony',
    branch = 'main',
    createIfNotExists = false,
  } = params;
  const cleanToken = token.trim();

  try {
    // 1. Verify user & get login
    const auth = await validateGitHubToken(cleanToken);
    if (!auth.success || !auth.user) {
      return { success: false, error: auth.error || 'अवैध GitHub टोकन. कृपया योग्य टोकन प्रविष्ट करा.' };
    }

    const username = auth.user.login;
    const authorEmail = auth.user.email || 'hospital.hospital916@gmail.com';
    const authorName = auth.user.name || username || 'vanjarijodi';

    // 2. Parse target repo name and owner with smart cleaning (handles full GitHub URLs, .git suffix, trailing slashes)
    let cleanRepo = repoName.trim()
      .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
      .replace(/^git@github\.com:/i, '')
      .replace(/\.git$/i, '')
      .replace(/^\/+|\/+$/g, '');

    // Strip any extra URL path segments like /tree/main or /blob/...
    const rawParts = cleanRepo.split('/').map((p) => p.trim()).filter(Boolean);
    let targetOwner = username;
    let targetRepo = '';
    if (rawParts.length >= 2) {
      targetOwner = rawParts[0];
      targetRepo = rawParts[1];
    } else if (rawParts.length === 1) {
      targetRepo = rawParts[0];
    }

    if (!targetRepo) {
      return {
        success: false,
        error: 'कृपया अचूक GitHub Repository नाव किंवा URL टाका (उदा. username/vanjarijodi).',
      };
    }

    // 3. Check if the exact target repository exists on GitHub
    let repoCheckRes = await fetch(`https://api.github.com/repos/${targetOwner}/${targetRepo}`, {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'VanjariJodi-Sync-Agent',
      },
    });

    // If user typed only repo name (no slash) and 404, try matching case-insensitively from their repos list
    if (repoCheckRes.status === 404 && auth.repos && auth.repos.length > 0) {
      const matchedRepo = auth.repos.find(
        (r) =>
          r.full_name.toLowerCase() === `${targetOwner}/${targetRepo}`.toLowerCase() ||
          r.name.toLowerCase() === targetRepo.toLowerCase()
      );
      if (matchedRepo) {
        const [matchedOwner, matchedName] = matchedRepo.full_name.split('/');
        targetOwner = matchedOwner;
        targetRepo = matchedName;
        repoCheckRes = await fetch(`https://api.github.com/repos/${targetOwner}/${targetRepo}`, {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'VanjariJodi-Sync-Agent',
          },
        });
      }
    }

    let existingRepoData: any = null;
    if (repoCheckRes.ok) {
      existingRepoData = await repoCheckRes.json().catch(() => ({}));
      if (existingRepoData?.full_name) {
        const [canonicalOwner, canonicalName] = String(existingRepoData.full_name).split('/');
        if (canonicalOwner && canonicalName) {
          targetOwner = canonicalOwner;
          targetRepo = canonicalName;
        }
      }
    }

    // If repository not found (404)
    if (repoCheckRes.status === 404) {
      if (!createIfNotExists) {
        return {
          success: false,
          error: `GitHub वर '${targetOwner}/${targetRepo}' ही जुनी रिपॉझिटरी सापडली नाही (किंवा टोकनला ती पाहण्याची परवानगी नाही). कोणतीही नवीन repo तयार केलेली नाही — कृपया वरच्या यादीतून तुमची बनवलेली repo निवडा किंवा टोकनला 'repo' + 'workflow' परवानगी द्या.`,
        };
      }

      let created = false;

      // Create ONLY when explicitly requested via createIfNotExists=true
      const createRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'VanjariJodi-Sync-Agent',
        },
        body: JSON.stringify({
          name: targetRepo,
          description:
            '🚩 Vanjari Jodi Matrimony - Official Community Portal & Android App',
          private: isPrivate,
          auto_init: false,
        }),
      });

      if (createRes.ok) {
        created = true;
        targetOwner = username;
      } else {
        const errData: any = await createRes.json().catch(() => ({}));
        const rawErr = JSON.stringify(errData);
        if (rawErr.toLowerCase().includes('already exists')) {
          targetOwner = username;
        } else {
          return {
            success: false,
            error: `GitHub वर नवीन रिपॉझिटरी (${targetRepo}) तयार करताना त्रुटी: ${errData.message || 'Error creating repo'}. कृपया तुमच्या टोकनला 'repo' परमिशन आहे का ते तपासा.`,
          };
        }
      }

      if (created) {
        await new Promise((resolve) => setTimeout(resolve, 2500));
      }
    }

    const finalFullName = `${targetOwner}/${targetRepo}`;
    const projectRoot = process.cwd();

    // Auto-detect branch: if repo exists on GitHub and user left default branch as main, respect repo's default branch (e.g. master)
    let targetBranch = branch || 'main';
    if (existingRepoData && existingRepoData.default_branch) {
      if (!params.branch || params.branch === 'main' || params.branch === existingRepoData.default_branch) {
        targetBranch = existingRepoData.default_branch;
      }
    }

    // 4. Fast Git CLI push with support for both Classic PAT (ghp_) & Fine-Grained PAT (github_pat_)
    try {
      execSync('git config --global --add safe.directory ' + projectRoot, { stdio: 'pipe' });
      execSync('git init', { cwd: projectRoot, stdio: 'pipe' });
      execSync(`git config user.name "${authorName.replace(/"/g, '\\"')}"`, { cwd: projectRoot, stdio: 'pipe' });
      execSync(`git config user.email "${authorEmail.replace(/"/g, '\\"')}"`, { cwd: projectRoot, stdio: 'pipe' });
      execSync(`git checkout -B ${targetBranch}`, { cwd: projectRoot, stdio: 'pipe' });
      execSync('git add -A', { cwd: projectRoot, stdio: 'pipe' });
      execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}" --allow-empty`, {
        cwd: projectRoot,
        stdio: 'pipe',
      });

      const commitSha = execSync('git rev-parse HEAD', { cwd: projectRoot }).toString().trim();

      try {
        execSync('git remote remove origin', { cwd: projectRoot, stdio: 'ignore' });
      } catch {}

      // Official GitHub x-access-token format (works for BOTH classic ghp_ and fine-grained github_pat_ tokens)
      const authRemoteUrl = `https://x-access-token:${encodeURIComponent(cleanToken)}@github.com/${finalFullName}.git`;
      execSync(`git remote add origin ${authRemoteUrl}`, { cwd: projectRoot, stdio: 'pipe' });

      // Attempt primary push
      try {
        execSync(`git push -u origin ${targetBranch} --force`, { cwd: projectRoot, stdio: 'pipe' });
      } catch (firstPushErr: any) {
        const rawErr = (firstPushErr.stderr?.toString() || '') + (firstPushErr.stdout?.toString() || '');
        // If GitHub rejects push because PAT lacks 'workflow' scope for .github/workflows
        if (
          rawErr.includes('workflow') ||
          rawErr.includes('refusing to allow') ||
          rawErr.includes('Repository rule violations')
        ) {
          const workflowsDir = path.join(projectRoot, '.github', 'workflows');
          if (fs.existsSync(workflowsDir)) {
            try {
              console.warn('Amending commit without .github/workflows due to token permission constraints...');
              execSync('git rm -r --cached .github/workflows', { cwd: projectRoot, stdio: 'pipe' });
              execSync('git commit --amend --no-edit --allow-empty', { cwd: projectRoot, stdio: 'pipe' });
              execSync(`git push -u origin ${targetBranch} --force`, { cwd: projectRoot, stdio: 'pipe' });

              // Restore workflow tracking in local repo
              try {
                execSync('git add .github/workflows', { cwd: projectRoot, stdio: 'pipe' });
              } catch {}

              const fallbackSha = execSync('git rev-parse HEAD', { cwd: projectRoot }).toString().trim();
              return {
                success: true,
                repoUrl: `https://github.com/${finalFullName}`,
                commitUrl: `https://github.com/${finalFullName}/commit/${fallbackSha}`,
                message: `✅ यशस्वीरीत्या संपूर्ण कोड तुमच्या जुन्या GitHub (${finalFullName}) मध्ये थेट Deploy झाला! (सूचना: GitHub Actions Workflows पुश करण्यासाठी टोकनला 'workflow' स्कोप टिक करा).`,
              };
            } catch {
              try {
                execSync('git add .github/workflows', { cwd: projectRoot, stdio: 'pipe' });
              } catch {}
            }
          }
        }

        // Try secondary auth format with username:token
        try {
          const fallbackRemoteUrl = `https://${encodeURIComponent(username)}:${encodeURIComponent(cleanToken)}@github.com/${finalFullName}.git`;
          execSync(`git remote set-url origin ${fallbackRemoteUrl}`, { cwd: projectRoot, stdio: 'pipe' });
          execSync(`git push -u origin ${targetBranch} --force`, { cwd: projectRoot, stdio: 'pipe' });
        } catch {
          throw firstPushErr;
        }
      }

      const repoUrl = `https://github.com/${finalFullName}`;
      const commitUrl = `https://github.com/${finalFullName}/commit/${commitSha}`;

      return {
        success: true,
        repoUrl,
        commitUrl,
        message: `✅ यशस्वीरीत्या संपूर्ण कोड, ३ ॲस्ट्रॉलॉजी इंजिन्स, ऑडिओ ध्वनी व फाईल्स GitHub (${finalFullName}) वर Deploy / Push करण्यात आल्या आहेत!`,
      };
    } catch (gitPushErr: any) {
      const rawStderr = gitPushErr.stderr ? gitPushErr.stderr.toString() : '';
      const rawStdout = gitPushErr.stdout ? gitPushErr.stdout.toString() : '';
      const combined = `${rawStderr}\n${rawStdout}\n${gitPushErr.message || ''}`;

      // Mask token completely
      const sanitized = combined.replace(
        new RegExp(cleanToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        '***'
      );

      console.warn('Git push command failed with message:', sanitized);

      let userFriendlyMsg = 'GitHub Deploy करताना समस्या आली.';
      if (
        sanitized.includes('Authentication failed') ||
        sanitized.includes('403') ||
        sanitized.includes('Permission to') ||
        sanitized.includes('Bad credentials')
      ) {
        userFriendlyMsg = `GitHub टोकन अवैध आहे किंवा @${username} ला '${finalFullName}' वर लिहिण्याची परवानगी नाही. कृपया Personal Access Token (classic) तयार करा आणि 'repo' व 'workflow' दोन्ही बॉक्सेस निवडा.`;
      } else if (sanitized.includes('workflow') || sanitized.includes('refusing to allow')) {
        userFriendlyMsg =
          "GitHub टोकनला 'workflow' परमिशन नाही. कृपया GitHub Settings -> Personal Access Tokens मध्ये जाऊन 'workflow' बॉक्स टिक करा.";
      } else if (sanitized.includes('Repository not found') || sanitized.includes('404')) {
        userFriendlyMsg = `GitHub रिपॉझिटरी '${finalFullName}' सापडली नाही किंवा तयार करता आली नाही. कृपया Repo नाव तपासा.`;
      } else if (sanitized.includes('Protected branch') || sanitized.includes('GH006')) {
        userFriendlyMsg = `ही शाखा (${targetBranch}) GitHub वर Protected Branch आहे. कृपया Branch चे नाव बदला (उदा. 'deploy-v1').`;
      } else {
        // Extract meaningful error line instead of header
        const lines = sanitized
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l && !l.startsWith('To https://'));
        userFriendlyMsg = `Git Push त्रुटी: ${lines[0] || 'Unknown error'}`;
      }

      return {
        success: false,
        error: userFriendlyMsg,
      };
    } finally {
      try {
        execSync('git remote remove origin', { cwd: projectRoot, stdio: 'ignore' });
      } catch {}
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'An unexpected error occurred while syncing to GitHub.',
    };
  }
}

/**
 * Pulls/fetches latest code from GitHub repository into the local project
 */
export async function pullProjectFromGitHub(params: {
  token: string;
  repoName: string;
  branch?: string;
}): Promise<{
  success: boolean;
  repoUrl?: string;
  commitUrl?: string;
  commitMessage?: string;
  commitAuthor?: string;
  commitDate?: string;
  filesChangedCount?: number;
  message?: string;
  error?: string;
}> {
  const { token, repoName, branch = 'main' } = params;
  const cleanToken = token.trim();

  try {
    // 1. Verify user & get login
    const auth = await validateGitHubToken(cleanToken);
    if (!auth.success || !auth.user) {
      return { success: false, error: auth.error || 'अवैध GitHub टोकन. कृपया योग्य टोकन प्रविष्ट करा.' };
    }

    const username = auth.user.login;

    // 2. Parse target repo name and owner
    let targetOwner = username;
    let targetRepo = repoName.trim();
    if (repoName.includes('/')) {
      const parts = repoName.split('/').map((p) => p.trim());
      targetOwner = parts[0];
      targetRepo = parts[1];
    }
    if (!targetRepo) {
      targetRepo = 'vanjarijodi';
    }

    const finalFullName = `${targetOwner}/${targetRepo}`;
    const projectRoot = process.cwd();
    const targetBranch = branch || 'main';

    // 3. Verify that the repo exists on GitHub
    const repoCheckRes = await fetch(`https://api.github.com/repos/${finalFullName}`, {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'VanjariJodi-Sync-Agent',
      },
    });

    if (!repoCheckRes.ok) {
      return {
        success: false,
        error: `GitHub रिपॉझिटरी '${finalFullName}' सापडली नाही. कृपया खात्याचे नाव व Repository Name बरोबर आहे का ते तपासा.`,
      };
    }

    // 4. Git CLI setup & Pull
    try {
      execSync('git config --global --add safe.directory ' + projectRoot, { stdio: 'pipe' });

      // Ensure git repository initialized
      if (!fs.existsSync(path.join(projectRoot, '.git'))) {
        execSync('git init', { cwd: projectRoot, stdio: 'pipe' });
      }

      execSync(`git config user.name "${auth.user.name || username}"`, { cwd: projectRoot, stdio: 'pipe' });
      execSync(`git config user.email "${auth.user.email || 'admin@vanjarijodi.web.app'}"`, { cwd: projectRoot, stdio: 'pipe' });

      // Save local backup snapshot before pull so no code is ever lost
      try {
        execSync('git add -A', { cwd: projectRoot, stdio: 'pipe' });
        execSync('git commit -m "Auto-backup before GitHub pull" --allow-empty', { cwd: projectRoot, stdio: 'pipe' });
      } catch {}

      try {
        execSync('git remote remove origin', { cwd: projectRoot, stdio: 'ignore' });
      } catch {}

      const authRemoteUrl = `https://x-access-token:${encodeURIComponent(cleanToken)}@github.com/${finalFullName}.git`;
      execSync(`git remote add origin ${authRemoteUrl}`, { cwd: projectRoot, stdio: 'pipe' });

      // Fetch target branch
      execSync(`git fetch origin ${targetBranch}`, { cwd: projectRoot, stdio: 'pipe' });

      // Check current branch or checkout
      try {
        execSync(`git checkout ${targetBranch}`, { cwd: projectRoot, stdio: 'pipe' });
      } catch {
        execSync(`git checkout -B ${targetBranch}`, { cwd: projectRoot, stdio: 'pipe' });
      }

      // Merge / pull from origin with allow-unrelated-histories
      let pullOutput = '';
      try {
        pullOutput = execSync(`git merge origin/${targetBranch} -m "Merged latest code from GitHub ${finalFullName}" --allow-unrelated-histories`, {
          cwd: projectRoot,
          stdio: 'pipe',
        }).toString();
      } catch (mergeErr: any) {
        // If merge conflicts or divergent histories, pull with ours/theirs strategy or rebase
        console.warn('Merge conflict on pull, accepting incoming origin updates:', mergeErr.message);
        execSync(`git reset --hard origin/${targetBranch}`, { cwd: projectRoot, stdio: 'pipe' });
        pullOutput = 'Reset to origin/' + targetBranch;
      }

      // Get latest commit details
      const latestSha = execSync('git rev-parse --short HEAD', { cwd: projectRoot }).toString().trim();
      const latestMsg = execSync('git log -1 --pretty=%B', { cwd: projectRoot }).toString().trim();
      const latestAuthor = execSync('git log -1 --pretty=%an', { cwd: projectRoot }).toString().trim();
      const latestDate = execSync('git log -1 --pretty=%cd --date=format:"%d-%m-%Y %H:%M"', { cwd: projectRoot }).toString().trim();

      return {
        success: true,
        repoUrl: `https://github.com/${finalFullName}`,
        commitUrl: `https://github.com/${finalFullName}/commit/${latestSha}`,
        commitMessage: latestMsg || 'Latest GitHub Commit',
        commitAuthor: latestAuthor,
        commitDate: latestDate,
        message: `✅ GitHub वरून (${finalFullName} शाखा: ${targetBranch}) सर्व नवीन कोड यशस्वीरीत्या डाऊनलोड (Pull) झाला आहे! (Commit: ${latestSha})`,
      };
    } catch (gitErr: any) {
      const rawStderr = gitErr.stderr ? gitErr.stderr.toString() : '';
      const rawStdout = gitErr.stdout ? gitErr.stdout.toString() : '';
      const combined = `${rawStderr}\n${rawStdout}\n${gitErr.message || ''}`;

      const sanitized = combined.replace(
        new RegExp(cleanToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        '***'
      );

      console.warn('Git pull command failed with message:', sanitized);

      let userFriendlyMsg = 'GitHub वरून कोड डाऊनलोड करताना समस्या आली.';
      if (sanitized.includes('couldn\'t find remote ref') || sanitized.includes('not found')) {
        userFriendlyMsg = `GitHub वर '${targetBranch}' नावाची शाखा (Branch) सापडली नाही. कृपया योग्य शाखा निवडा (उदा. main).`;
      } else if (sanitized.includes('Authentication failed') || sanitized.includes('403')) {
        userFriendlyMsg = `GitHub टोकन अवैध आहे किंवा @${username} ला '${finalFullName}' वाचण्याची परवानगी नाही.`;
      } else {
        const lines = sanitized.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('From https://'));
        userFriendlyMsg = `Git Pull त्रुटी: ${lines[0] || 'Unknown error'}`;
      }

      return {
        success: false,
        error: userFriendlyMsg,
      };
    } finally {
      try {
        execSync('git remote remove origin', { cwd: projectRoot, stdio: 'ignore' });
      } catch {}
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'An unexpected error occurred while pulling from GitHub.',
    };
  }
}

