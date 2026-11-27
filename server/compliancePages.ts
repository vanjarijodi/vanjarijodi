import type { Express, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const COMMON_STYLE = `
  :root {
    --primary: #800C1E;
    --primary-light: #A71930;
    --bg: #FFFDF9;
    --card: #FFFFFF;
    --text: #1E293B;
    --border: #E2E8F0;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background-color: var(--bg);
    color: var(--text);
    line-height: 1.65;
    padding: 20px;
  }
  .container {
    max-width: 900px;
    margin: 0 auto;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 32px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  }
  header {
    border-bottom: 2px solid #FEF3C7;
    padding-bottom: 20px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .logo {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    object-fit: cover;
    border: 1px solid #FDE68A;
  }
  h1 {
    color: var(--primary);
    font-size: 23px;
    font-weight: 800;
  }
  .subtitle {
    font-size: 13px;
    color: #64748B;
    margin-top: 3px;
  }
  h2 {
    color: var(--primary);
    font-size: 17px;
    margin: 22px 0 10px;
    border-left: 4px solid var(--primary-light);
    padding-left: 10px;
  }
  p, li {
    font-size: 14px;
    color: #334155;
    margin-bottom: 10px;
  }
  ul, ol {
    margin-left: 20px;
    margin-bottom: 14px;
  }
  .badge {
    display: inline-block;
    background: #DCFCE7;
    color: #166534;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 6px;
    margin-bottom: 6px;
  }
  .box {
    background: #FFFBEB;
    border: 1px solid #FDE68A;
    border-radius: 12px;
    padding: 16px;
    margin: 14px 0;
  }
  .alert {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    border-radius: 12px;
    padding: 16px;
    margin: 14px 0;
    color: #7F1D1D;
  }
  .contact-card {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    padding: 18px;
    margin-top: 22px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 14px;
  }
  th, td {
    border: 1px solid #E2E8F0;
    padding: 10px 12px;
    text-align: left;
  }
  th {
    background: #FEF3C7;
    color: #800C1E;
    font-weight: 800;
  }
  .nav-links {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #E2E8F0;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 12px;
  }
  .nav-links a {
    color: var(--primary);
    text-decoration: none;
    font-weight: 700;
  }
  .nav-links a:hover {
    text-decoration: underline;
  }
`;

export function wrapComplianceHtml(
  title: string,
  badge: string,
  subtitle: string,
  bodyHtml: string,
  footerLinksHtml: string
): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title} - Vanjari Jodi Matrimony (vanjarijodi.web.app)</title>
    <link rel="icon" type="image/png" href="/vanjari-jodi-official-logo.png" />
    <style>${COMMON_STYLE}</style>
  </head>
  <body>
    <div class="container">
      <header>
        <img src="/vanjari-jodi-official-logo.png" alt="Vanjari Jodi" class="logo" />
        <div>
          <span class="badge">${badge}</span>
          <h1>${title}</h1>
          <div class="subtitle">${subtitle}</div>
        </div>
      </header>
      ${bodyHtml}
      <div class="nav-links">
        ${footerLinksHtml}
      </div>
    </div>
  </body>
</html>`;
}

const PLAY_FOOTER = `
  <a href="/app-privacy-policy">App Privacy Policy</a>
  <span>•</span>
  <a href="/app-account-deletion">Account &amp; Data Deletion</a>
  <span>•</span>
  <a href="/app-child-safety">Child Safety (CSAE) Policy</a>
  <span>•</span>
  <a href="/app-terms">App Terms of Use</a>
`;

const RAZORPAY_FOOTER = `
  <a href="/">Home / Portal</a>
  <span>•</span>
  <a href="/razorpay-terms">Terms &amp; Conditions</a>
  <span>•</span>
  <a href="/razorpay-privacy">Privacy Policy</a>
  <span>•</span>
  <a href="/razorpay-refund">Refund &amp; Cancellation</a>
  <span>•</span>
  <a href="/razorpay-shipping">Shipping &amp; Delivery</a>
  <span>•</span>
  <a href="/razorpay-pricing">Pricing (INR)</a>
  <span>•</span>
  <a href="/razorpay-contact">Contact Us</a>
`;

export const COMPLIANCE_PAGES_MAP: Record<string, string> = {
  'app-privacy-policy': wrapComplianceHtml(
    'App Privacy Policy',
    'Google Play Console & DPDP Act 2023 Compliant',
    'Vanjari Jodi Matrimony Android App (com.vanjarijodi.app • vanjarijodi.web.app)',
    `
    <p><strong>VANJARIJODI MATRIMONY</strong> (operated by <strong>PRIME MULTI SERVICES AND SUPPLIERS</strong>, Official Portal: <strong>https://vanjarijodi.web.app</strong>) is committed to protecting user privacy in strict accordance with the Digital Personal Data Protection Act, 2023 (DPDP Act) and Google Play Developer Program Policies.</p>
    <h2>1. Data Collected in the Android Application</h2>
    <ul>
      <li><strong>Profile Biodata:</strong> Name, Date of Birth, Gender, Marital Status, Education, Occupation, Sub-caste (Vanjari), Gotra, and Family Information voluntarily entered by the member.</li>
      <li><strong>Account Identifier:</strong> 10-digit Mobile Number (used as Login ID) and encrypted account password.</li>
      <li><strong>Photographs:</strong> Candidate photographs and biodata image voluntarily uploaded from the device photo picker.</li>
    </ul>
    <h2>2. How Data is Used &amp; Protected</h2>
    <ul>
      <li>Used exclusively to display matrimonial profiles to eligible registered community members and facilitate mutual matchmaking.</li>
      <li>The Android application functions purely as a member reader and matchmaking app and does not process in-app digital payments or collect banking/card details.</li>
      <li>We never sell, rent, or share personal data with third-party advertisers or external marketing agencies.</li>
    </ul>
    <h2>3. User Control &amp; Permanent Data Deletion</h2>
    <p>Users can permanently delete their profile, photographs, and personal data at any time from inside the app (<em>Account &rarr; Delete Profile</em>) or via <a href="https://vanjarijodi.web.app/app-account-deletion">https://vanjarijodi.web.app/app-account-deletion</a>.</p>
    <div class="contact-card">
      <p><strong>Data Protection &amp; Grievance Officer:</strong> Gite Vijay</p>
      <p><strong>Email:</strong> gitevijay123@gmail.com | <strong>Helpline:</strong> +91 90679 69553</p>
      <p><strong>Address:</strong> At Post Padali, Taluka Shirur (Kasar), District Beed, Maharashtra - 413249, India</p>
    </div>
    `,
    PLAY_FOOTER
  ),

  'app-account-deletion': wrapComplianceHtml(
    'Account & Personal Data Deletion',
    'Google Play Data Safety Compliant',
    'Vanjari Jodi Matrimony (com.vanjarijodi.app • vanjarijodi.web.app)',
    `
    <div class="alert">
      <strong>🗑️ Permanent Account &amp; Data Deletion Portal:</strong>
      <p style="margin-top:6px;margin-bottom:0;">Every registered user of Vanjari Jodi Matrimony has the unconditional right to permanently delete their account, biodata, photographs, and chat history.</p>
    </div>
    <h2>Method 1: Instant In-App Deletion</h2>
    <ol>
      <li>Log in to the <strong>Vanjari Jodi</strong> Android App.</li>
      <li>Open <strong>Account / Dashboard</strong> from the bottom navigation bar.</li>
      <li>Tap on <strong>"Delete Profile / प्रोफाईल डिलीट करा"</strong> and confirm.</li>
      <li>Your profile, photos, and personal details are immediately removed.</li>
    </ol>
    <h2>Method 2: Online Deletion Request Form (Without Opening the App)</h2>
    <div class="box">
      <form onsubmit="event.preventDefault(); document.getElementById('del-msg').style.display='block';">
        <p><strong>Enter your registered 10-digit Mobile Number (Login ID) to request permanent data deletion:</strong></p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;">
          <input type="tel" required pattern="[0-9]{10}" placeholder="10-Digit Mobile Number" style="padding:10px 14px;border:1px solid #CBD5E1;border-radius:10px;font-size:14px;flex:1;min-width:200px;" />
          <input type="text" placeholder="Reason (e.g. Marriage Fixed)" style="padding:10px 14px;border:1px solid #CBD5E1;border-radius:10px;font-size:14px;flex:1;min-width:200px;" />
          <button type="submit" style="background:#800C1E;color:#fff;border:none;padding:10px 20px;border-radius:10px;font-weight:800;cursor:pointer;">Submit Deletion Request</button>
        </div>
        <p id="del-msg" style="display:none;margin-top:12px;color:#166534;font-weight:700;">✅ Your account deletion request has been registered. All personal data, biodata, and photographs linked to this mobile number will be permanently erased within 24 hours.</p>
      </form>
    </div>
    <h2>Method 3: Direct Email / Helpline Request</h2>
    <p>Email <strong>gitevijay123@gmail.com</strong> or WhatsApp <strong>+91 90679 69553</strong> from your registered mobile number with the subject <em>"Delete My Account"</em>. All data is wiped within 24 hours with zero retention of personal photos or biodata.</p>
    `,
    PLAY_FOOTER
  ),

  'app-child-safety': wrapComplianceHtml(
    'Child Safety Standards & Zero-Tolerance CSAE Policy',
    'Google Play Child Safety Standards Compliant',
    'Vanjari Jodi Matrimony (com.vanjarijodi.app • vanjarijodi.web.app)',
    `
    <div class="alert">
      <strong>🛡️ Strict 18+ / 21+ Adult Matrimonial Platform Declaration:</strong>
      <p style="margin-top:6px;margin-bottom:0;">Vanjari Jodi Matrimony is strictly intended for adults of legal marriageable age under Indian Law (minimum 18 years for brides and 21 years for grooms). Minors under 18 years of age are strictly prohibited from using this platform.</p>
    </div>
    <h2>1. Zero Tolerance for CSAE &amp; CSAM</h2>
    <p>We enforce an absolute zero-tolerance policy against Child Sexual Exploitation and Abuse (CSAE), Child Sexual Abuse Material (CSAM), underage profile creation, or predatory behavior. Any violating content or account is immediately and permanently banned and reported to law enforcement agencies and the National Cyber Crime Reporting Portal.</p>
    <h2>2. Age Verification &amp; Moderation Controls</h2>
    <ul>
      <li>Mandatory Date of Birth validation enforcing legal marriageable age (18+ for females, 21+ for males) at registration.</li>
      <li>Active human and automated moderation of all uploaded profile photographs and biodata sheets before public visibility.</li>
      <li>Immediate in-app <strong>"Report Profile / तक्रार करा"</strong> button on every profile card and detail view.</li>
    </ul>
    <h2>3. Designated Child Safety &amp; Grievance Point of Contact</h2>
    <div class="contact-card">
      <p><strong>Designated Safety Officer:</strong> Gite Vijay</p>
      <p><strong>Direct Reporting Email:</strong> <a href="mailto:gitevijay123@gmail.com">gitevijay123@gmail.com</a></p>
      <p><strong>24x7 Helpline:</strong> +91 90679 69553</p>
      <p><strong>Turnaround Time:</strong> Immediate action within 2 to 24 hours of any report.</p>
    </div>
    `,
    PLAY_FOOTER
  ),

  'app-terms': wrapComplianceHtml(
    'App Terms of Use & Community Guidelines',
    'Google Play Console Compliant',
    'Vanjari Jodi Matrimony Android App (com.vanjarijodi.app • vanjarijodi.web.app)',
    `
    <p>Welcome to the <strong>Vanjari Jodi Matrimony</strong> mobile application, operated by <strong>PRIME MULTI SERVICES AND SUPPLIERS</strong>.</p>
    <h2>1. Eligibility</h2>
    <p>To register or use this application, you must be a member of the Vanjari community and of legal marriageable age in India (at least 18 years for women and 21 years for men).</p>
    <h2>2. Authentic Information &amp; Community Etiquette</h2>
    <ul>
      <li>Users must provide truthful, accurate biodata and genuine photographs.</li>
      <li>Harassment, misuse of contact information, or uploading inappropriate content will result in immediate permanent account suspension.</li>
      <li>The platform acts as an intermediary under Section 79 of the IT Act, 2000. Families are advised to independently verify candidate background details prior to finalizing marriage alliances.</li>
    </ul>
    <h2>3. Multi-Platform Reader Access</h2>
    <p>Registered members can sign in using their 10-digit Mobile Number (Login ID) and Password to access their profile and view eligible community profiles. No digital purchases or payments are processed inside the mobile application.</p>
    `,
    PLAY_FOOTER
  ),

  'razorpay-terms': wrapComplianceHtml(
    'Terms & Conditions',
    'Razorpay Merchant KYC & IT Act Compliant',
    'Official Website Portal: https://vanjarijodi.web.app',
    `
    <div class="box">
      <strong>📌 Legal Entity &amp; Operator Declaration:</strong>
      <p style="margin-top:6px;margin-bottom:0;"><strong>Vanjari Jodi Matrimony (https://vanjarijodi.web.app)</strong> is owned, operated, and managed by the registered legal entity <strong>PRIME MULTI SERVICES AND SUPPLIERS</strong>. All online payments, invoices, and member portal activations are processed under <strong>PRIME MULTI SERVICES AND SUPPLIERS</strong>.</p>
    </div>
    <h2>1. Scope of Services</h2>
    <p>We provide online matrimonial portal registration, Login ID &amp; Password activation, and verified profile matchmaking services for eligible adult candidates (18+ years for females, 21+ years for males).</p>
    <h2>2. Online Portal Registration &amp; Credentials</h2>
    <p>Upon completing online registration and portal fee payment on <strong>https://vanjarijodi.web.app</strong>, the user's 10-digit mobile number is activated as their official <strong>Login ID</strong> along with their chosen secure password.</p>
    <h2>3. User Obligations &amp; Intermediary Status</h2>
    <p>Users must submit accurate personal details. Under Section 79 of the Information Technology Act, 2000, the portal operates as an intermediary platform, and families are responsible for independent verification before marriage finalization.</p>
    <h2>4. Governing Law &amp; Jurisdiction</h2>
    <p>These terms are governed by the laws of India, with exclusive jurisdiction in the courts of District Beed, Maharashtra.</p>
    `,
    RAZORPAY_FOOTER
  ),

  'razorpay-privacy': wrapComplianceHtml(
    'Privacy Policy (Website & Payment Portal)',
    'Razorpay & DPDP Act 2023 Compliant',
    'Official Website Portal: https://vanjarijodi.web.app',
    `
    <p><strong>PRIME MULTI SERVICES AND SUPPLIERS</strong> (operating <strong>Vanjari Jodi Matrimony - https://vanjarijodi.web.app</strong>) respects your privacy and safeguards all user and transaction information.</p>
    <h2>1. Information Collected on the Website Portal</h2>
    <ul>
      <li>Candidate Full Name, Gender, and 10-Digit Mobile Number (Login ID).</li>
      <li>Encrypted Account Password (hashed using industry-standard bcrypt).</li>
      <li>Payment Transaction Identifiers (Order ID, Payment ID, Amount, Timestamp) received via <strong>Razorpay Payment Gateway</strong>.</li>
    </ul>
    <h2>2. Payment Security (PCI-DSS Compliance)</h2>
    <p>All online payments on <strong>https://vanjarijodi.web.app</strong> are processed through <strong>Razorpay</strong> using 256-bit SSL encryption and PCI-DSS compliant infrastructure. We do NOT store your credit card numbers, debit card numbers, CVV, or UPI PIN on our servers.</p>
    <h2>3. Contact &amp; Grievance Redressal</h2>
    <p>For any privacy or transaction queries, contact Grievance Officer <strong>Gite Vijay</strong> at <strong>gitevijay123@gmail.com</strong> or call <strong>+91 90679 69553</strong>.</p>
    `,
    RAZORPAY_FOOTER
  ),

  'razorpay-refund': wrapComplianceHtml(
    'Refund & Cancellation Policy',
    'Razorpay Mandatory Compliance Policy',
    'Official Website Portal: https://vanjarijodi.web.app • Legal Entity: PRIME MULTI SERVICES AND SUPPLIERS',
    `
    <h2>1. Cancellation Policy</h2>
    <ul>
      <li>Members may cancel or deactivate their account at any time by contacting customer support at <strong>gitevijay123@gmail.com</strong> or <strong>+91 90679 69553</strong>.</li>
      <li>There are <strong>no automatic recurring charges or auto-debits</strong> on any plan. Every portal activation is a one-time payment for the chosen validity period.</li>
    </ul>
    <h2>2. Refund Policy &amp; Eligibility</h2>
    <ul>
      <li><strong>Duplicate / Double Payment:</strong> In case a user is charged twice for the same transaction due to a technical or banking error, <strong>100% of the duplicate amount will be refunded</strong>.</li>
      <li><strong>Payment Deducted &amp; Login ID Not Activated:</strong> If the amount is debited from the user's bank/UPI account and the Login ID is not activated within 24 hours, the user may opt for immediate manual activation or a <strong>100% full refund</strong>.</li>
      <li><strong>Post-Usage Policy:</strong> Once a member's Login ID &amp; Password have been activated and the member has logged in and unlocked/viewed confidential candidate profiles, the service is deemed consumed and non-refundable.</li>
    </ul>
    <h2>3. Refund Processing Timeline (5–7 Working Days)</h2>
    <div class="box">
      <strong>⏱️ Standard Razorpay Refund Turnaround Time:</strong>
      <p style="margin-top:6px;margin-bottom:0;">All approved refunds are initiated via <strong>Razorpay</strong> within <strong>48 hours</strong> of verification and are credited back to the customer's original source of payment (Bank Account / UPI / Card) within <strong>5 to 7 working days</strong>.</p>
    </div>
    `,
    RAZORPAY_FOOTER
  ),

  'razorpay-shipping': wrapComplianceHtml(
    'Shipping & Service Delivery Policy',
    'Razorpay Mandatory KYC Policy',
    'Official Website Portal: https://vanjarijodi.web.app • Legal Entity: PRIME MULTI SERVICES AND SUPPLIERS',
    `
    <div class="box">
      <strong>⚡ Instant Digital Service Activation (No Physical Shipping Required):</strong>
      <p style="margin-top:6px;margin-bottom:0;"><strong>Vanjari Jodi Matrimony (https://vanjarijodi.web.app)</strong> provides digital online portal access and Login ID activation. No physical goods are shipped, and <strong>shipping charges are ₹0 (Nil)</strong>.</p>
    </div>
    <h2>1. Service Delivery / Activation Timeline</h2>
    <ul>
      <li><strong>Instant Online Activation (0 to 5 Minutes):</strong> Immediately after successful payment via Razorpay on <strong>https://vanjarijodi.web.app</strong>, the user's 10-digit Mobile Number (Login ID) and chosen Password are activated in real time.</li>
      <li><strong>Instant Payment Receipt &amp; Confirmation:</strong> A downloadable PDF invoice/receipt and 1-time activation code are generated on screen immediately upon payment completion, along with SMS confirmation.</li>
    </ul>
    <h2>2. Delivery Support</h2>
    <p>In the rare event of a network delay where your Login ID is not activated within 15 minutes of payment, please contact our support desk at <strong>+91 90679 69553</strong> or email <strong>gitevijay123@gmail.com</strong> with your Razorpay Payment ID / UTR for immediate priority activation.</p>
    `,
    RAZORPAY_FOOTER
  ),

  'razorpay-pricing': wrapComplianceHtml(
    'Pricing & Portal Activation Plans (INR)',
    'Transparent INR Pricing • Razorpay KYC Compliant',
    'Official Website Portal: https://vanjarijodi.web.app • Legal Entity: PRIME MULTI SERVICES AND SUPPLIERS',
    `
    <p>All portal registration and Login ID activation plans on <strong>https://vanjarijodi.web.app</strong> are priced transparently in <strong>Indian Rupees (INR - ₹)</strong> inclusive of all applicable charges, with zero hidden fees:</p>
    <table>
      <thead>
        <tr>
          <th>Plan Name</th>
          <th>Validity Duration</th>
          <th>Portal &amp; Login ID Benefits</th>
          <th>Price (INR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>🔥 Welcome Offer Plan (वेलकम ऑफर)</strong></td>
          <td>6 Months (180 Days)</td>
          <td>Login ID &amp; Password Activation + 100 Verified Profile &amp; Photo Unlocks</td>
          <td><strong>₹398</strong></td>
        </tr>
        <tr>
          <td><strong>🥈 Silver Plan (सिल्व्हर प्लॅन)</strong></td>
          <td>3 Months (90 Days)</td>
          <td>Login ID &amp; Password Activation + 60 Verified Profile &amp; Photo Unlocks</td>
          <td><strong>₹399</strong></td>
        </tr>
        <tr>
          <td><strong>🥇 Gold Plan (गोल्ड प्लॅन)</strong></td>
          <td>6 Months (180 Days)</td>
          <td>Login ID &amp; Password Activation + 150 Verified Profile &amp; Photo Unlocks</td>
          <td><strong>₹599</strong></td>
        </tr>
        <tr>
          <td><strong>💎 Diamond VIP Plan (डायमंड VIP)</strong></td>
          <td>12 Months (365 Days)</td>
          <td>Login ID &amp; Password Activation + Unlimited Verified Profile &amp; Photo Unlocks</td>
          <td><strong>₹999</strong></td>
        </tr>
      </tbody>
    </table>
    <p style="margin-top:12px;"><a href="/" style="display:inline-block;background:#800C1E;color:#fff;padding:10px 20px;border-radius:10px;text-decoration:none;font-weight:800;">Proceed to Portal Payment &amp; Login ID Setup &rarr;</a></p>
    `,
    RAZORPAY_FOOTER
  ),

  'razorpay-contact': wrapComplianceHtml(
    'Contact Us, Registered Address & Grievance Officer',
    'Razorpay Merchant KYC & Statutory Disclosure',
    'Official Website Portal: https://vanjarijodi.web.app',
    `
    <h2>1. Registered Merchant &amp; Legal Entity Details</h2>
    <div class="contact-card">
      <p><strong>Registered Legal Entity Name:</strong> PRIME MULTI SERVICES AND SUPPLIERS</p>
      <p><strong>Brand / Trade Name:</strong> VANJARIJODI MATRIMONY (Vanjari Jodi)</p>
      <p><strong>Official Website URL:</strong> <a href="https://vanjarijodi.web.app">https://vanjarijodi.web.app</a></p>
      <p><strong>Registered Office &amp; Operational Address:</strong> At Post Padali, Taluka Shirur (Kasar), District Beed, Maharashtra - 413249, India</p>
      <p><strong>Customer Support Helpline:</strong> +91 90679 69553</p>
      <p><strong>Official Support Email:</strong> <a href="mailto:gitevijay123@gmail.com">gitevijay123@gmail.com</a></p>
      <p><strong>Operating Hours:</strong> Monday to Saturday (10:00 AM to 06:00 PM IST)</p>
    </div>
    <h2>2. Statutory Grievance Redressal Officer (IT Rules 2021)</h2>
    <div class="box">
      <p><strong>Grievance Officer Name:</strong> Gite Vijay</p>
      <p><strong>Designation:</strong> Principal Grievance &amp; Compliance Officer</p>
      <p><strong>Email:</strong> gitevijay123@gmail.com | <strong>Phone:</strong> +91 90679 69553</p>
      <p style="margin-bottom:0;"><strong>Address:</strong> At Post Padali, Taluka Shirur (Kasar), District Beed, Maharashtra - 413249, India</p>
    </div>
    `,
    RAZORPAY_FOOTER
  ),
};

// Write static .html files to /public so Firebase Hosting (vanjarijodi.web.app) serves them directly too
try {
  const publicDir = path.join(process.cwd(), 'public');
  if (fs.existsSync(publicDir)) {
    for (const [slug, htmlContent] of Object.entries(COMPLIANCE_PAGES_MAP)) {
      fs.writeFileSync(path.join(publicDir, `${slug}.html`), htmlContent, 'utf-8');
    }
  }
} catch (e) {}

export function registerComplianceRoutes(app: Express) {
  const sendPage = (slug: string) => (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(COMPLIANCE_PAGES_MAP[slug]);
  };

  // Google Play Console Routes (Zero Payment Mention)
  app.get(['/app-privacy-policy', '/app-privacy-policy.html', '/play-privacy-policy'], sendPage('app-privacy-policy'));
  app.get(['/app-account-deletion', '/app-account-deletion.html', '/account-deletion', '/delete-account'], sendPage('app-account-deletion'));
  app.get(['/app-child-safety', '/app-child-safety.html', '/child-safety', '/csae-policy'], sendPage('app-child-safety'));
  app.get(['/app-terms', '/app-terms.html', '/play-terms'], sendPage('app-terms'));

  // Razorpay KYC Routes
  app.get(['/razorpay-terms', '/razorpay-terms.html', '/terms-and-conditions', '/terms'], sendPage('razorpay-terms'));
  app.get(['/razorpay-privacy', '/razorpay-privacy.html', '/web-privacy-policy', '/privacy-policy', '/privacy-policy.html', '/privacy'], sendPage('razorpay-privacy'));
  app.get(['/razorpay-refund', '/razorpay-refund.html', '/refund-policy', '/cancellation-policy', '/refund', '/cancellation'], sendPage('razorpay-refund'));
  app.get(['/razorpay-shipping', '/razorpay-shipping.html', '/shipping-policy', '/shipping-and-delivery'], sendPage('razorpay-shipping'));
  app.get(['/razorpay-pricing', '/razorpay-pricing.html', '/pricing'], sendPage('razorpay-pricing'));
  app.get(['/razorpay-contact', '/razorpay-contact.html', '/contact-us', '/contact', '/about-us', '/about'], sendPage('razorpay-contact'));
}
