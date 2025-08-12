import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';

export const useMobile = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!(Capacitor.isNativePlatform && Capacitor.isNativePlatform())) return;
    // Handle Android back button
    const handleBackButton = () => {
      if (location.pathname === '/home' || location.pathname === '/') {
        // On home page, show exit confirmation
        if (confirm('Are you sure you want to exit the app?')) {
          App.exitApp();
        }
      } else {
        // On other pages, navigate back
        navigate(-1);
      }
    };

    // Listen for hardware back button
    App.addListener('backButton', handleBackButton);

    // Keyboard handling for chat and forms
    const handleKeyboardShow = () => {
      // Add class to body to handle keyboard visibility
      document.body.classList.add('keyboard-open');
    };

    const handleKeyboardHide = () => {
      // Remove class when keyboard hides
      document.body.classList.remove('keyboard-open');
    };

    Keyboard.addListener('keyboardWillShow', handleKeyboardShow);
    Keyboard.addListener('keyboardWillHide', handleKeyboardHide);

    return () => {
      App.removeAllListeners();
      Keyboard.removeAllListeners();
    };
  }, [navigate, location.pathname]);

  return {
    isKeyboardOpen: document.body.classList.contains('keyboard-open')
  };
};