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
  upiId: 'hangemahesh@ybl',
  payeeName: 'Mahesh Hange',
  amount: '199.00',
  transactionNote: 'Vanjari Jodi Registration',
  phonepeUpiId: 'hangemahesh@ybl',
  gpayUpiId: '',
  paytmUpiId: '',
  bhimUpiId: '',
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
        const merged: PaymentConfig = {
          upiId: data.upiId || data.upi_id || DEFAULT_PAYMENT_CONFIG.upiId,
          payeeName: data.payeeName || data.business_name || DEFAULT_PAYMENT_CONFIG.payeeName,
          amount: data.amount !== undefined ? String(data.amount) : DEFAULT_PAYMENT_CONFIG.amount,
          transactionNote: data.transactionNote || data.payment_note || DEFAULT_PAYMENT_CONFIG.transactionNote,
          updatedAt: data.updatedAt || data.updated_at || new Date().toISOString(),
          qrCodeUrl: data.qrCodeUrl || data.qr_code_url
        };
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

// Save payment config to Firestore and sync across legacy fields
export const savePaymentConfigToFirestore = async (config: PaymentConfig): Promise<boolean> => {
  try {
    const cleanConfig: PaymentConfig = {
      upiId: config.upiId?.trim() || DEFAULT_PAYMENT_CONFIG.upiId,
      payeeName: config.payeeName?.trim() || DEFAULT_PAYMENT_CONFIG.payeeName,
      amount: String(config.amount || DEFAULT_PAYMENT_CONFIG.amount).trim(),
      transactionNote: config.transactionNote?.trim() || DEFAULT_PAYMENT_CONFIG.transactionNote,
      phonepeUpiId: config.phonepeUpiId?.trim() || config.upiId?.trim() || 'hangemahesh@ybl',
      gpayUpiId: config.gpayUpiId?.trim() || '',
      paytmUpiId: config.paytmUpiId?.trim() || '',
      bhimUpiId: config.bhimUpiId?.trim() || '',
      adminMobileNumber: config.adminMobileNumber?.trim() || '',
      whatsappNumber: config.whatsappNumber?.trim() || '7083070830',
      merchantQrImageUrl: config.merchantQrImageUrl?.trim() || '',
      qrCodeUrl: config.qrCodeUrl || '',
      updatedAt: new Date().toISOString()
    };

    // Save to settings/payment_config
    await syncDocToFirestore('settings', 'payment_config', {
      ...cleanConfig,
      upi_id: cleanConfig.upiId,
      business_name: cleanConfig.payeeName,
      payment_note: cleanConfig.transactionNote,
      updated_at: cleanConfig.updatedAt
    });

    // Also update siteConfig/mainConfig
    await syncDocToFirestore('siteConfig', 'mainConfig', {
      paymentUpiId: cleanConfig.upiId,
      paymentPayeeName: cleanConfig.payeeName,
      paymentNote: cleanConfig.transactionNote,
      paymentQrUrl: cleanConfig.merchantQrImageUrl || cleanConfig.qrCodeUrl || ''
    });

    // Also send to backend API
    try {
      await fetch('/api/payment/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          upi_id: cleanConfig.upiId,
          business_name: cleanConfig.payeeName,
          payment_note: cleanConfig.transactionNote
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
