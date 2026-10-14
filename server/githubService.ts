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
  }>;
  error?: string;
}

/**
 * Validates a GitHub Personal Access Token or credentials
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

    // Fetch user repositories
    const reposRes = await fetch('https://api.github.com/user/repos?sort=updated&per_page=50', {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'VanjariJodi-Sync-Agent',
      },
    });

    let repos: any[] = [];
    if (reposRes.ok) {
      const reposData = await reposRes.json();
      if (Array.isArray(reposData)) {
        repos = reposData.map((r) => ({
          name: r.name,
          full_name: r.full_name,
          private: r.private,
          html_url: r.html_url,
          default_branch: r.default_branch || 'main',
        }));
      }
    }

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
 * Creates or syncs the repository on GitHub using Git CLI with pre-check and auto-create
 */
export async function syncProjectToGitHub(params: {
  token: string;
  repoName: string;
  isPrivate?: boolean;
  commitMessage?: string;
  branch?: string;
  owner?: string;
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
    commitMessage = '🚀 Deploy VanjariJodi Matrimony with 3-Astrology Engines & Full-Stack Engine',
    branch = 'main',
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

    // 2. Parse target repo name and owner with smart cleaning
    let cleanRepo = repoName.trim()
      .replace(/^https?:\/\/github\.com\//i, '')
      .replace(/\.git$/i, '')
      .replace(/^\/+|\/+$/g, '');

    let targetOwner = username;
    let targetRepo = cleanRepo;
    if (cleanRepo.includes('/')) {
      const parts = cleanRepo.split('/').map((p) => p.trim());
      targetOwner = parts[0] || username;
      targetRepo = parts[1] || 'vanjarijodi';
    }
    if (!targetRepo) {
      targetRepo = 'vanjarijodi';
    }

    // 3. Check if target repository exists on GitHub and whether authenticated user can push to it
    let repoCheckRes = await fetch(`https://api.github.com/repos/${targetOwner}/${targetRepo}`, {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'VanjariJodi-Sync-Agent',
      },
    });

    // If 404 and targetOwner was different from username, also check if it exists under username/targetRepo!
    if (repoCheckRes.status === 404 && targetOwner.toLowerCase() !== username.toLowerCase()) {
      const userRepoCheck = await fetch(`https://api.github.com/repos/${username}/${targetRepo}`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'VanjariJodi-Sync-Agent',
        },
      });
      if (userRepoCheck.ok) {
        targetOwner = username;
        repoCheckRes = userRepoCheck;
      }
    }

    let hasPushPermission = false;
    if (repoCheckRes.ok) {
      const repoData: any = await repoCheckRes.json().catch(() => ({}));
      if (repoData.permissions && repoData.permissions.push === true) {
        hasPushPermission = true;
      } else if (targetOwner.toLowerCase() === username.toLowerCase()) {
        hasPushPermission = true;
      }
    }

    // If target repo exists under a different account/org but current user lacks push permission,
    // fallback to user's own repository rather than erroring out!
    if (targetOwner.toLowerCase() !== username.toLowerCase() && !hasPushPermission && repoCheckRes.ok) {
      targetOwner = username;
      repoCheckRes = await fetch(`https://api.github.com/repos/${targetOwner}/${targetRepo}`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'VanjariJodi-Sync-Agent',
        },
      });
    }

    // If repository not found (404), create it automatically!
    if (repoCheckRes.status === 404) {
      let created = false;

      // Create under authenticated user
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
            '🚩 Vanjari Jodi Matrimony - Official Community Portal with 3 Vedic Astrology Engines & Full-Stack Engine',
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
          // Repo already exists under user's account
          targetOwner = username;
        } else {
          return {
            success: false,
            error: `GitHub वर नवीन रिपॉझिटरी (${targetRepo}) तयार करताना त्रुटी: ${errData.message || 'Error creating repo'}. कृपया तुमच्या टोकनला 'repo' परमिशन आहे का ते तपासा.`,
          };
        }
      }

      if (created) {
        // Wait 2.5 seconds for GitHub to set up the repository's git transport endpoints
        await new Promise((resolve) => setTimeout(resolve, 2500));
      }
    }

    const finalFullName = `${targetOwner}/${targetRepo}`;
    const projectRoot = process.cwd();
    const targetBranch = branch || 'main';

    // 4. Fast Git CLI push with auto-fallback for workflow scope
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

      // Official GitHub PAT auth format
      const authRemoteUrl = `https://${encodeURIComponent(cleanToken)}@github.com/${finalFullName}.git`;
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
          rawErr.includes('failed to push some refs') ||
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
                message: `✅ यशस्वीरीत्या संपूर्ण कोड, ३ ॲस्ट्रॉलॉजी इंजिन्स व सर्व फाईल्स GitHub (${finalFullName}) वर Deploy झाल्या! (सूचना: Actions Workflows समाविष्ट करण्यासाठी टोकनला 'workflow' स्कोप निवडा).`,
              };
            } catch (fallbackErr) {
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
        } catch (secondPushErr: any) {
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

