import { useEffect, useState, useRef, useCallback } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { useApp } from '../context/AppContext';

export function useAndroidBackHandler() {
  const app = useApp();
  const [showExitToast, setShowExitToast] = useState(false);
  const lastBackPressTime = useRef<number>(0);
  const isProgrammaticBack = useRef<boolean>(false);
  const modalHistoryCount = useRef<number>(0);
  const prevModalOpenRef = useRef<boolean>(false);

  // Check if any modal or drawer is open
  const hasAnyModalOpen = Boolean(
    app.selectedProfileForModal ||
    app.activeChatUser ||
    app.activeVideoUser ||
    app.isKundaliModalOpen ||
    app.isBioDataMakerOpen ||
    app.isPaymentOpen ||
    app.isFilterOpen ||
    app.isRightDrawerOpen ||
    app.isLeftDrawerOpen ||
    app.isLoginOpen ||
    app.isRegisterOpen ||
    app.isAdminOpen ||
    app.isBusinessVendorDirectoryOpen ||
    app.isBusinessVendorRegisterModalOpen ||
    app.isVendorPortalOpen ||
    app.isSeoHubOpen ||
    app.isUserSecurityOpen ||
    app.isAdminSecurityOpen ||
    app.isPhoneAuthModalOpen ||
    app.isMarketingAdModalOpen ||
    app.isContactUnlockModalOpen ||
    app.isGuestRestrictionModalOpen ||
    app.isProfileRemovalModalOpen ||
    app.isFaceAuthModalOpen
  );

  const handleBackPress = useCallback((): boolean => {
    // Priority 1: Top-most open Modals / Views
    if (app.selectedProfileForModal) {
      app.setSelectedProfileForModal(null);
      return true;
    }
    if (app.activeChatUser) {
      app.setActiveChatUser(null);
      return true;
    }
    if (app.activeVideoUser) {
      app.setActiveVideoUser(null);
      return true;
    }
    if (app.isKundaliModalOpen) {
      app.setIsKundaliModalOpen(false);
      return true;
    }
    if (app.isBioDataMakerOpen) {
      app.setIsBioDataMakerOpen(false);
      return true;
    }
    if (app.isPaymentOpen) {
      app.setIsPaymentOpen(false);
      return true;
    }
    if (app.isFilterOpen) {
      app.setIsFilterOpen(false);
      return true;
    }
    if (app.isRightDrawerOpen) {
      app.setIsRightDrawerOpen(false);
      return true;
    }
    if (app.isLeftDrawerOpen) {
      app.setIsLeftDrawerOpen(false);
      return true;
    }
    if (app.isLoginOpen) {
      app.setIsLoginOpen(false);
      return true;
    }
    if (app.isRegisterOpen) {
      app.setIsRegisterOpen(false);
      return true;
    }
    if (app.isAdminOpen) {
      app.setIsAdminOpen(false);
      return true;
    }
    if (app.isBusinessVendorDirectoryOpen) {
      app.setIsBusinessVendorDirectoryOpen(false);
      return true;
    }
    if (app.isBusinessVendorRegisterModalOpen) {
      app.setIsBusinessVendorRegisterModalOpen(false);
      return true;
    }
    if (app.isVendorPortalOpen) {
      app.setIsVendorPortalOpen(false);
      return true;
    }
    if (app.isSeoHubOpen) {
      app.setIsSeoHubOpen(false);
      return true;
    }
    if (app.isUserSecurityOpen) {
      app.setIsUserSecurityOpen(false);
      return true;
    }
    if (app.isAdminSecurityOpen) {
      app.setIsAdminSecurityOpen(false);
      return true;
    }
    if (app.isPhoneAuthModalOpen) {
      app.setIsPhoneAuthModalOpen(false);
      return true;
    }
    if (app.isMarketingAdModalOpen) {
      app.setIsMarketingAdModalOpen(false);
      return true;
    }
    if (app.isContactUnlockModalOpen) {
      app.setIsContactUnlockModalOpen(false);
      return true;
    }
    if (app.isGuestRestrictionModalOpen) {
      app.setIsGuestRestrictionModalOpen(false);
      return true;
    }
    if (app.isProfileRemovalModalOpen) {
      app.setIsProfileRemovalModalOpen(false);
      return true;
    }
    if (app.isFaceAuthModalOpen) {
      app.setIsFaceAuthModalOpen(false);
      return true;
    }

    // Priority 2: View Navigation (If on another tab like Matches, Chat, Account, go back to Home first)
    if (app.currentView !== 'home') {
      app.setCurrentView('home');
      return true;
    }

    // Priority 3: On Home view with no open modals -> Double press to exit app
    if (app.currentView === 'home') {
      const now = Date.now();
      if (now - lastBackPressTime.current < 2000) {
        try {
          CapacitorApp.exitApp();
        } catch {
          console.log('App exit called');
        }
        return false;
      } else {
        lastBackPressTime.current = now;
        setShowExitToast(true);
        setTimeout(() => setShowExitToast(false), 2000);
        return true;
      }
    }

    return false;
  }, [app]);

  // Set up initial base state on browser history so the first Back press doesn't exit the page immediately
  useEffect(() => {
    try {
      if (!window.history.state || !window.history.state.vanjariAppBase) {
        window.history.replaceState({ vanjariAppBase: true }, '');
      }
    } catch {
      // Ignore if history state not supported
    }
  }, []);

  // Track modal open/close and push/pop browser history entries so Android/Mobile Browser Back works seamlessly
  useEffect(() => {
    try {
      if (hasAnyModalOpen && !prevModalOpenRef.current) {
        // A modal has opened! Push a state to browser history
        window.history.pushState({ vanjariModal: true, timestamp: Date.now() }, '');
        modalHistoryCount.current += 1;
      } else if (!hasAnyModalOpen && prevModalOpenRef.current) {
        // Modal was closed from UI (e.g. user clicked Close/Back on screen)
        if (modalHistoryCount.current > 0) {
          modalHistoryCount.current -= 1;
          isProgrammaticBack.current = true;
          window.history.back();
        }
      }
    } catch {
      // Ignore history state errors
    }
    prevModalOpenRef.current = hasAnyModalOpen;
  }, [hasAnyModalOpen]);

  // Listen to browser 'popstate' event (triggered by Android hardware back button, mobile browser back, or swipe back gesture)
  useEffect(() => {
    const handlePopState = () => {
      // If triggered programmatically by our own window.history.back(), skip handling
      if (isProgrammaticBack.current) {
        isProgrammaticBack.current = false;
        return;
      }

      if (modalHistoryCount.current > 0) {
        modalHistoryCount.current -= 1;
      }

      const handled = handleBackPress();
      if (handled) {
        // If we closed a modal or redirected to home, ensure we stay within the app
        if (!hasAnyModalOpen && app.currentView === 'home') {
          const now = Date.now();
          if (now - lastBackPressTime.current >= 2000) {
            try {
              window.history.pushState({ vanjariAppBase: true }, '');
            } catch {
              // Ignore
            }
          }
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasAnyModalOpen, handleBackPress, app.currentView]);

  // Listen to Capacitor native backButton and keyboard 'Escape'
  useEffect(() => {
    let backButtonListener: any = null;

    const setupListener = async () => {
      try {
        backButtonListener = await CapacitorApp.addListener('backButton', () => {
          handleBackPress();
        });
      } catch {
        // Native back listener fallback for web browser preview
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleBackPress();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    setupListener();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (backButtonListener && typeof backButtonListener.remove === 'function') {
        backButtonListener.remove();
      }
    };
  }, [handleBackPress]);

  return { showExitToast, hasAnyModalOpen, handleBackPress };
}
