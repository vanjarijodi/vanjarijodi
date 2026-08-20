import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import { UserProfile, SiteConfig, ChatMessage, SuccessStory, PaymentRequest, ContactRequest, AdminSupportMessage, NotificationItem, PaymentConfig } from '../types';

export const DEFAULT_PAYMENT_CONFIG: PaymentConfig = {
  upiId: 'hange.usha@ybl',
  payeeName: 'Usha Hange',
  amount: '199.00',
  transactionNote: 'Vanjari Jodi Registration',
  phonepeUpiId: 'hange.usha@ybl',
  gpayUpiId: '',
  paytmUpiId: 'hange.usha@ybl',
  bhimUpiId: 'hange.usha@ybl',
  adminMobileNumber: '',
  whatsappNumber: '7083070830',
  merchantQrImageUrl: '',
  updatedAt: new Date().toISOString()
};

// Generic document write helper with graceful error handling
export const syncDocToFirestore = async (colName: string, docId: string, data: any) => {
  try {
    if (!colName || !docId || !data) return;
    const docRef = doc(db, colName, docId);
    await setDoc(docRef, JSON.parse(JSON.stringify(data)), { merge: true });
  } catch (err) {
    console.warn(`Firestore sync error for ${colName}/${docId}:`, err);
  }
};

// Generic document delete helper
export const deleteDocFromFirestore = async (colName: string, docId: string) => {
  try {
    if (!colName || !docId) return;
    const docRef = doc(db, colName, docId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn(`Firestore delete error for ${colName}/${docId}:`, err);
  }
};

// Profiles real-time listener
export const listenToProfiles = (
  onUpdate: (profiles: UserProfile[]) => void,
  initialSeed: UserProfile[]
) => {
  try {
    const colRef = collection(db, 'profiles');
    return onSnapshot(colRef, async (snapshot) => {
      if (snapshot.empty && initialSeed && initialSeed.length > 0) {
        // Seed initial profiles to Firestore if database is fresh/empty
        for (const p of initialSeed) {
          if (p && p.id) {
            syncDocToFirestore('profiles', p.id, p);
          }
        }
        onUpdate(initialSeed);
      } else {
        const items: UserProfile[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as UserProfile;
          if (data && data.id) {
            items.push(data);
          }
        });
        if (items.length > 0) {
          onUpdate(items);
        }
      }
    }, (err) => {
      console.warn('Firestore snapshot error for profiles:', err);
    });
  } catch (err) {
    console.warn('Firestore listen error:', err);
    return () => {};
  }
};

// Site Config listener
export const listenToSiteConfig = (
  onUpdate: (config: SiteConfig) => void,
  initialConfig: SiteConfig
) => {
  try {
    const docRef = doc(db, 'siteConfig', 'mainConfig');
    return onSnapshot(docRef, async (snapshot) => {
      if (!snapshot.exists() && initialConfig) {
        syncDocToFirestore('siteConfig', 'mainConfig', initialConfig);
        onUpdate(initialConfig);
      } else if (snapshot.exists()) {
        const data = snapshot.data() as SiteConfig;
        onUpdate(data);
      }
    }, (err) => {
      console.warn('Firestore snapshot error for siteConfig:', err);
    });
  } catch (err) {
    console.warn('Firestore listen error:', err);
    return () => {};
  }
};

// Chat messages listener
export const listenToChatMessages = (onUpdate: (messages: ChatMessage[]) => void) => {
  try {
    const colRef = collection(db, 'chatMessages');
    return onSnapshot(colRef, (snapshot) => {
      const items: ChatMessage[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as ChatMessage;
        if (data && data.id) {
          items.push(data);
        }
      });
      if (items.length > 0) {
        onUpdate(items);
      }
    }, (err) => {
      console.warn('Firestore snapshot error for chatMessages:', err);
    });
  } catch (err) {
    console.warn('Firestore listen error:', err);
    return () => {};
  }
};

// Admin support chat listener
export const listenToAdminSupport = (onUpdate: (messages: AdminSupportMessage[]) => void) => {
  try {
    const colRef = collection(db, 'adminSupportMessages');
    return onSnapshot(colRef, (snapshot) => {
      const items: AdminSupportMessage[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as AdminSupportMessage;
        if (data && data.id) {
          items.push(data);
        }
      });
      if (items.length > 0) {
        onUpdate(items);
      }
    }, (err) => {
      console.warn('Firestore snapshot error for adminSupportMessages:', err);
    });
  } catch (err) {
    console.warn('Firestore listen error:', err);
    return () => {};
  }
};

// Real-time notifications listener
export const listenToNotifications = (onUpdate: (notifications: NotificationItem[]) => void) => {
  try {
    const colRef = collection(db, 'notifications');
    return onSnapshot(colRef, (snapshot) => {
      const items: NotificationItem[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as NotificationItem;
        if (data && data.id) {
          items.push(data);
        }
      });
      items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      if (items.length > 0) {
        onUpdate(items);
      }
    }, (err) => {
      console.warn('Firestore snapshot error for notifications:', err);
    });
  } catch (err) {
    console.warn('Firestore listen error for notifications:', err);
    return () => {};
  }
};

// Real-time Payment Settings listener (Collection: settings, Doc: payment_config)
export const listenToPaymentConfig = (
  onUpdate: (config: PaymentConfig) => void
) => {
  try {
    const docRef = doc(db, 'settings', 'payment_config');
    return onSnapshot(docRef, async (snapshot) => {
      if (!snapshot.exists()) {
        await syncDocToFirestore('settings', 'payment_config', DEFAULT_PAYMENT_CONFIG);
        onUpdate(DEFAULT_PAYMENT_CONFIG);
      } else {
        const data = snapshot.data();
        const upi = (data.upiId || data.upi_id || DEFAULT_PAYMENT_CONFIG.upiId).trim();
        const merged: PaymentConfig = {
          upiId: upi,
          payeeName: (data.payeeName || data.business_name || DEFAULT_PAYMENT_CONFIG.payeeName).trim(),
          amount: data.amount !== undefined ? String(data.amount).trim() : DEFAULT_PAYMENT_CONFIG.amount,
          transactionNote: (data.transactionNote || data.payment_note || DEFAULT_PAYMENT_CONFIG.transactionNote).trim(),
          phonepeUpiId: (data.phonepeUpiId || upi || DEFAULT_PAYMENT_CONFIG.phonepeUpiId).trim(),
          gpayUpiId: (data.gpayUpiId || '').trim(),
          paytmUpiId: (data.paytmUpiId || upi).trim(),
          bhimUpiId: (data.bhimUpiId || upi).trim(),
          adminMobileNumber: (data.adminMobileNumber || '').trim(),
          whatsappNumber: (data.whatsappNumber || DEFAULT_PAYMENT_CONFIG.whatsappNumber).trim(),
          merchantQrImageUrl: (data.merchantQrImageUrl || data.qrCodeUrl || data.qr_code_url || '').trim(),
          qrCodeUrl: (data.qrCodeUrl || data.qr_code_url || data.merchantQrImageUrl || '').trim(),
          updatedAt: data.updatedAt || data.updated_at || new Date().toISOString()
        };
        try {
          localStorage.setItem('vanjari_jodi_payment_config', JSON.stringify(merged));
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('payment_config_updated', { detail: merged }));
          }
        } catch (e) {}
        onUpdate(merged);
      }
    }, (err) => {
      console.warn('Firestore snapshot error for settings/payment_config:', err);
    });
  } catch (err) {
    console.warn('Firestore listen error for payment_config:', err);
    return () => {};
  }
};

// Save payment config to Firestore and sync across legacy fields & site config
export const savePaymentConfigToFirestore = async (config: PaymentConfig): Promise<boolean> => {
  try {
    const cleanUpi = (config.upiId || DEFAULT_PAYMENT_CONFIG.upiId).trim();
    const qrImg = (config.merchantQrImageUrl || config.qrCodeUrl || '').trim();

    const cleanConfig: PaymentConfig = {
      upiId: cleanUpi,
      payeeName: (config.payeeName || DEFAULT_PAYMENT_CONFIG.payeeName).trim(),
      amount: String(config.amount || DEFAULT_PAYMENT_CONFIG.amount).trim(),
      transactionNote: (config.transactionNote || DEFAULT_PAYMENT_CONFIG.transactionNote).trim(),
      phonepeUpiId: (config.phonepeUpiId || cleanUpi).trim(),
      gpayUpiId: (config.gpayUpiId || '').trim(),
      paytmUpiId: (config.paytmUpiId || cleanUpi).trim(),
      bhimUpiId: (config.bhimUpiId || cleanUpi).trim(),
      adminMobileNumber: (config.adminMobileNumber || '').trim(),
      whatsappNumber: (config.whatsappNumber || '7083070830').trim(),
      merchantQrImageUrl: qrImg,
      qrCodeUrl: qrImg,
      updatedAt: new Date().toISOString()
    };

    // Instant local broadcast & storage update
    try {
      localStorage.setItem('vanjari_jodi_payment_config', JSON.stringify(cleanConfig));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('payment_config_updated', { detail: cleanConfig }));
      }
    } catch (e) {}

    // 1. Save to settings/payment_config
    await syncDocToFirestore('settings', 'payment_config', {
      ...cleanConfig,
      upi_id: cleanConfig.upiId,
      business_name: cleanConfig.payeeName,
      payment_note: cleanConfig.transactionNote,
      qr_code_url: cleanConfig.merchantQrImageUrl,
      updated_at: cleanConfig.updatedAt
    });

    // 2. Also update siteConfig/mainConfig for instant backward compatibility
    await syncDocToFirestore('siteConfig', 'mainConfig', {
      paymentUpiId: cleanConfig.upiId,
      paymentPayeeName: cleanConfig.payeeName,
      paymentNote: cleanConfig.transactionNote,
      paymentQrUrl: qrImg,
      paymentQrCodeUrl: qrImg
    });

    // 3. Also send to backend API to update in-memory server state
    try {
      await fetch('/api/payment/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          upi_id: cleanConfig.upiId,
          business_name: cleanConfig.payeeName,
          payment_note: cleanConfig.transactionNote,
          qr_code_url: qrImg
        })
      });
    } catch (e) {
      // Backend API call optional
    }

    return true;
  } catch (err) {
    console.error('Error saving payment config to Firestore:', err);
    return false;
  }
};
