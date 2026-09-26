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

    // 3. Check if target repository exists on GitHub and whether authenticated user can push to it
    let repoCheckRes = await fetch(`https://api.github.com/repos/${targetOwner}/${targetRepo}`, {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'VanjariJodi-Sync-Agent',
      },
    });

    let hasPushPermission = false;
    if (repoCheckRes.ok) {
      const repoData: any = await repoCheckRes.json().catch(() => ({}));
      if (repoData.permissions && repoData.permissions.push === true) {
        hasPushPermission = true;
      }
    }

    // If target repo exists under a different account/org but current user lacks push permission,
    // do NOT silently divert to another account! Explicitly warn the user with actionable instructions.
    if (targetOwner.toLowerCase() !== username.toLowerCase() && !hasPushPermission) {
      return {
        success: false,
        error: `❌ खाते विसंगती (GitHub Account Mismatch):
तुम्ही टाकलेला Personal Access Token हा '@${username}' या खात्याचा आहे, परंतु तुम्ही कोड '${targetOwner}/${targetRepo}' या दुसऱ्या खात्यावर पाठवण्याचा प्रयत्न करत आहात.

GitHub सुरक्षा नियमांनुसार '@${username}' चे टोकन वापरून '${targetOwner}' च्या खात्यात परस्पर बदल करता येत नाहीत.

👉 उपाय:
१. जर तुम्हाला '${targetOwner}' खात्यामध्येच कोड पाठवायचा असेल:
   - प्रथम तुमच्या ब्राऊझरमध्ये '${targetOwner}' या GitHub खात्यामध्ये लॉगिन करा.
   - Settings > Developer Settings > Personal access tokens (classic) मध्ये जाऊन नवीन टोकन (repo, workflow परमिशनसह) तयार करा.
   - ॲपमध्ये 'खाते बदला' बटण दाबून तो नवीन टोकन टाका.
२. जर तुम्हाला सध्याच्या '@${username}' या खात्यावरच कोड पाठवायचा असेल:
   - तर Repository Name मध्ये '${username}/${targetRepo}' निवडा.`,
      };
    }

    // If repository not found (404), create it automatically!
    if (repoCheckRes.status === 404) {
      let created = false;

      // If specified owner is the user itself
      if (targetOwner.toLowerCase() === username.toLowerCase()) {
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
        } else {
          const errData: any = await createRes.json().catch(() => ({}));
          const rawErr = JSON.stringify(errData);
          if (rawErr.toLowerCase().includes('already exists')) {
            return {
              success: false,
              error: `GitHub वर '${targetRepo}' ही रिपॉझिटरी नुकतीच डिलीट केली असल्याने किंवा रिस्टोअर कॅशमुळे GitHub ने हे नाव अजून तात्पुरते राखीव ठेवले आहे.\n\n👉 त्वरित उपाय:\n१. खाली Repository Name मध्ये किंचित वेगळे नाव टाका (उदा. '${targetRepo}-app' किंवा 'vanjarijodi-app') आणि 'GitHub वर कोड पाठवा' वर क्लिक करा. ते त्वरित तयार होईल!\n२. किंवा GitHub वर जाऊन Settings > Repositories > Deleted repositories मध्ये ती 'Restore' करा.`,
            };
          }
          return {
            success: false,
            error: `GitHub वर नवीन रिपॉझिटरी (${targetRepo}) तयार करताना त्रुटी: ${errData.message || 'Error creating repo'}. कृपया तुमच्या टोकनला 'repo' परमिशन आहे का ते तपासा.`,
          };
        }
      } else {
        // Try creating under the organization
        const orgRes = await fetch(`https://api.github.com/orgs/${targetOwner}/repos`, {
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

        if (orgRes.ok) {
          created = true;
        } else {
          const orgErr: any = await orgRes.json().catch(() => ({}));
          return {
            success: false,
            error: `GitHub वर '${targetOwner}' या खात्यामध्ये/ऑर्गनायझेशनमध्ये नवीन रिपॉझिटरी तयार करता आली नाही (${orgErr.message || 'Permission denied'}).

तुमचा टोकन '@${username}' या खात्याचा आहे. जर तुम्हाला '@${username}' याच खात्यामध्ये रिपॉझिटरी बनवायची असेल, तर Repository Name मध्ये '${username}/${targetRepo}' निवडा किंवा '${targetOwner}' या खात्याचा टोकन वापरा.`,
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
          rawErr.includes('failed to push some refs')
        ) {
          const workflowsDir = path.join(projectRoot, '.github', 'workflows');
          if (fs.existsSync(workflowsDir)) {
            try {
              console.warn('Attempting push without .github/workflows due to token permission constraints...');
              execSync('git rm -r --cached .github/workflows', { cwd: projectRoot, stdio: 'pipe' });
              execSync('git commit -m "Deploy VanjariJodi core app and astrology engines" --allow-empty', {
                cwd: projectRoot,
                stdio: 'pipe',
              });
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
        // If still failing, throw to the main error handler
        throw firstPushErr;
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
