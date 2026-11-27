import { UserProfile, Plan } from '../types';
import { generateCompactMembersPdf, getMemberPaymentStatusInfo } from './adminExportUtils';

function escapeSql(val: any): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return Number.isFinite(val) ? String(val) : '0';
  if (typeof val === 'object') {
    const jsonStr = JSON.stringify(val).replace(/'/g, "''");
    return `'${jsonStr}'::jsonb`;
  }
  const str = String(val).replace(/'/g, "''");
  return `'${str}'`;
}

/**
 * 1. Download Complete Firebase Data Backup as JSON
 */
export function downloadFullFirebaseJsonBackup(
  profiles: UserProfile[],
  plansList: Plan[],
  siteConfig: any,
  ledgerRecords: any[] = []
): void {
  const backupPayload = {
    meta: {
      app: 'Vanjari Jodi Matrimony (vanjarijodi.web.app)',
      sourceDatabase: 'Firebase Cloud Firestore (projectId: vanjarijodi)',
      exportedAt: new Date().toISOString(),
      totalProfiles: profiles.length,
      totalPaidMembers: profiles.filter((p) => getMemberPaymentStatusInfo(p).isPaid).length,
      totalFreeGrantedMembers: profiles.filter((p) => getMemberPaymentStatusInfo(p).isFreeGranted).length,
      totalUnpaidMembers: profiles.filter((p) => getMemberPaymentStatusInfo(p).isUnpaid).length,
      totalAdminCreatedProfiles: profiles.filter(
        (p) => p.isRegisteredByAdmin || p.registrationType === 'admin_direct'
      ).length,
      totalLedgerCredentials: ledgerRecords.length,
    },
    siteConfig,
    plansList,
    credentialsLedger: ledgerRecords,
    profiles,
  };

  const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `vanjari_jodi_firebase_full_backup_${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 2. Generate & Download Complete Supabase (PostgreSQL) SQL Migration Script (.sql)
 * So if Firebase limits are ever reached, Admin can import all data into Supabase in 1 click.
 */
export function downloadSupabaseSqlMigration(
  profiles: UserProfile[],
  plansList: Plan[],
  ledgerRecords: any[] = []
): void {
  const lines: string[] = [];
  lines.push('-- ============================================================================');
  lines.push('-- VANJARI JODI MATRIMONY (vanjarijodi.web.app)');
  lines.push('-- FIREBASE CLOUD FIRESTORE -> SUPABASE (POSTGRESQL) FULL MIGRATION DUMP');
  lines.push(`-- Generated At: ${new Date().toISOString()}`);
  lines.push(`-- Total Profiles: ${profiles.length} | Credentials Ledger: ${ledgerRecords.length}`);
  lines.push('-- ============================================================================');
  lines.push('');
  lines.push('BEGIN;');
  lines.push('');
  lines.push('-- 1. USERS & MOBILE MPIN AUTHENTICATION TABLE');
  lines.push(`CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  mobile_number VARCHAR(15) UNIQUE NOT NULL,
  full_name TEXT,
  gender VARCHAR(16),
  mpin_hash TEXT,
  is_phone_verified BOOLEAN DEFAULT TRUE,
  plan_id TEXT DEFAULT 'free',
  plan_name TEXT,
  is_free_admin_plan BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`);
  lines.push('');
  lines.push('-- 2. OTP VERIFICATIONS & 24-HOUR RATE LIMIT TABLE');
  lines.push(`CREATE TABLE IF NOT EXISTS public.otp_verifications (
  mobile_number VARCHAR(15) PRIMARY KEY,
  otp_code_hash TEXT,
  otp_count INT DEFAULT 0,
  window_start_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  last_sent_at TIMESTAMPTZ,
  failed_attempts INT DEFAULT 0
);`);
  lines.push('');
  lines.push('-- 3. MATRIMONY PROFILES (BIODATA) TABLE');
  lines.push(`CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  gender VARCHAR(16) NOT NULL,
  dob TEXT,
  age INT,
  mobile VARCHAR(20),
  district TEXT,
  taluka TEXT,
  city TEXT,
  education TEXT,
  occupation TEXT,
  income TEXT,
  height TEXT,
  sub_caste TEXT,
  gotra TEXT,
  mama_name TEXT,
  membership TEXT DEFAULT 'free',
  has_paid_membership BOOLEAN DEFAULT FALSE,
  is_free_admin_plan BOOLEAN DEFAULT FALSE,
  is_registered_by_admin BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  photo_url TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  raw_profile_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`);
  lines.push('');
  lines.push('-- 4. MEMBERSHIP PLANS TABLE');
  lines.push(`CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT,
  name_mr TEXT,
  price INT NOT NULL,
  duration TEXT,
  duration_months INT DEFAULT 6,
  unlock_count INT DEFAULT 50,
  is_active BOOLEAN DEFAULT TRUE,
  raw_plan_json JSONB
);`);
  lines.push('');

  // Insert Plans
  lines.push('-- ============================================================================');
  lines.push('-- INSERT MEMBERSHIP PLANS');
  lines.push('-- ============================================================================');
  for (const plan of plansList) {
    lines.push(
      `INSERT INTO public.plans (id, name, name_mr, price, duration, duration_months, unlock_count, is_active, raw_plan_json) VALUES (${escapeSql(
        plan.id
      )}, ${escapeSql(plan.name)}, ${escapeSql(plan.nameMr)}, ${escapeSql(
        Number(plan.price) || 0
      )}, ${escapeSql(plan.duration)}, ${escapeSql(Number(plan.durationMonths) || 6)}, ${escapeSql(
        Number(plan.unlockCount) || 50
      )}, ${escapeSql(plan.isActive !== false)}, ${escapeSql(plan)}) ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name_mr = EXCLUDED.name_mr, duration = EXCLUDED.duration, unlock_count = EXCLUDED.unlock_count, is_active = EXCLUDED.is_active, raw_plan_json = EXCLUDED.raw_plan_json;`
    );
  }
  lines.push('');

  // Insert Ledger Credentials into public.users
  lines.push('-- ============================================================================');
  lines.push('-- INSERT MEMBER LOGIN IDS & MPIN CREDENTIALS');
  lines.push('-- ============================================================================');
  for (const rec of ledgerRecords) {
    const cleanPhone = String(rec.loginId || rec.mobile || '').replace(/\D/g, '').slice(-10);
    if (!cleanPhone) continue;
    lines.push(
      `INSERT INTO public.users (id, mobile_number, full_name, gender, mpin_hash, is_phone_verified, plan_id, plan_name, is_free_admin_plan, updated_at) VALUES (${escapeSql(
        `usr_${cleanPhone}`
      )}, ${escapeSql(cleanPhone)}, ${escapeSql(rec.fullName || 'सदस्य')}, ${escapeSql(
        rec.gender || 'groom'
      )}, ${escapeSql(rec.passwordHash || '')}, TRUE, ${escapeSql(
        rec.planId || 'welcome_offer'
      )}, ${escapeSql(rec.planName || '')}, ${escapeSql(Boolean(rec.isFreeAdminPlan))}, NOW()) ON CONFLICT (mobile_number) DO UPDATE SET full_name = EXCLUDED.full_name, plan_id = EXCLUDED.plan_id, plan_name = EXCLUDED.plan_name, is_free_admin_plan = EXCLUDED.is_free_admin_plan, updated_at = NOW();`
    );
  }
  lines.push('');

  // Insert Profiles
  lines.push('-- ============================================================================');
  lines.push('-- INSERT ALL BIODATA PROFILES');
  lines.push('-- ============================================================================');
  for (const p of profiles) {
    const primaryPhoto = p.photos && p.photos.length > 0 ? p.photos[0] : p.photoUrl || '';
    const isAdminAdded = Boolean(p.isRegisteredByAdmin || p.registrationType === 'admin_direct');
    const st = getMemberPaymentStatusInfo(p);
    lines.push(
      `INSERT INTO public.profiles (id, full_name, gender, dob, age, mobile, district, taluka, city, education, occupation, income, height, sub_caste, gotra, mama_name, membership, has_paid_membership, is_free_admin_plan, is_registered_by_admin, is_approved, is_verified, photo_url, photos, raw_profile_json) VALUES (${escapeSql(
        p.id
      )}, ${escapeSql(p.fullName)}, ${escapeSql(p.gender)}, ${escapeSql(p.dob || '')}, ${escapeSql(
        Number(p.age) || 25
      )}, ${escapeSql(p.mobile || '')}, ${escapeSql(p.district || '')}, ${escapeSql(
        p.taluka || ''
      )}, ${escapeSql(p.city || '')}, ${escapeSql(p.education || '')}, ${escapeSql(
        p.occupation || ''
      )}, ${escapeSql(p.income || '')}, ${escapeSql(p.height || '')}, ${escapeSql(
        p.subCaste || 'वंजारी'
      )}, ${escapeSql(p.gotra || '')}, ${escapeSql(p.mamaName || '')}, ${escapeSql(
        p.membership || 'free'
      )}, ${escapeSql(st.isPaid)}, ${escapeSql(
        st.isFreeGranted
      )}, ${escapeSql(isAdminAdded)}, ${escapeSql(p.isApproved !== false)}, ${escapeSql(
        Boolean(p.isVerified)
      )}, ${escapeSql(primaryPhoto)}, ${escapeSql(p.photos || [])}, ${escapeSql(
        p
      )}) ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, mobile = EXCLUDED.mobile, district = EXCLUDED.district, education = EXCLUDED.education, occupation = EXCLUDED.occupation, membership = EXCLUDED.membership, has_paid_membership = EXCLUDED.has_paid_membership, is_free_admin_plan = EXCLUDED.is_free_admin_plan, is_registered_by_admin = EXCLUDED.is_registered_by_admin, raw_profile_json = EXCLUDED.raw_profile_json;`
    );
  }

  lines.push('');
  lines.push('COMMIT;');

  const blob = new Blob([lines.join('\n')], { type: 'application/sql;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `vanjari_jodi_supabase_migration_${dateStr}.sql`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 3. Download Members CSV (Excel-friendly UTF-8 with BOM)
 */
export function downloadMembersCsvExport(profiles: UserProfile[]): void {
  const headers = [
    'ID',
    'पूर्ण नाव (Full Name)',
    'वधू/वर (Gender)',
    'वय (Age)',
    'जन्मतारीख (DOB)',
    'मोबाईल नंबर (Mobile)',
    'जिल्हा (District)',
    'तालुका/शहर (City)',
    'शिक्षण (Education)',
    'नोकरी/व्यवसाय (Occupation)',
    'उत्पन्न (Income)',
    'उंची (Height)',
    'गोत्र/मामा (Gotra/Mama)',
    'सदस्यत्व प्रकार (Membership Status)',
    'कोणी भरले? (Added By)',
  ];

  const rows = profiles.map((p) => {
    const st = getMemberPaymentStatusInfo(p);
    const statusLabel = st.badgeTextMr;
    const addedByLabel =
      p.isRegisteredByAdmin || p.registrationType === 'admin_direct'
        ? '🛡️ ॲडमिनने भरलेला (Admin Added)'
        : 'युजरने स्वतः (Self)';

    return [
      p.id,
      p.fullName || '',
      p.gender === 'bride' ? 'वधू (मुलगी)' : 'वर (मुलगा)',
      p.age || '',
      p.dob || '',
      p.mobile || '',
      p.district || '',
      p.city || p.taluka || '',
      p.education || '',
      p.occupation || '',
      p.income || '',
      p.height || '',
      `${p.gotra || ''} ${p.mamaName ? `/ मामा: ${p.mamaName}` : ''}`.trim(),
      statusLabel,
      addedByLabel,
    ].map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`);
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `vanjari_jodi_all_members_${dateStr}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 4. Generate & Download Real Multi-Page A4 PDF Directory of Members
 */
export async function downloadCompactMembersPrintableDirectory(
  profiles: UserProfile[],
  filterTitle: string = 'सर्व नोंदणीकृत सदस्य बायोडाटा यादी'
): Promise<void> {
  await generateCompactMembersPdf(profiles, filterTitle);
}

