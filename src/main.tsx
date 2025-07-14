import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Capacitor keyboard resize fix for Android
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { StatusBar, Style } from '@capacitor/status-bar';
// import { EdgeToEdge } from '@capacitor/edge-to-edge';

if (typeof window !== 'undefined' && (window as any).Capacitor) {
  // Wait for the app to be fully loaded, then force overlaysWebView to true
  setTimeout(() => {
    StatusBar.setOverlaysWebView({ overlay: true });
  }, 2000);
  // Re-apply fix every time the keyboard opens
  Keyboard.addListener('keyboardWillShow', () => {
    StatusBar.setOverlaysWebView({ overlay: true });
  });
}

// IMPORTANT: In AndroidManifest.xml, ensure:
// <activity android:name="com.getcapacitor.BridgeActivity" android:windowSoftInputMode="adjustResize" ... />
createRoot(document.getElementById("root")!).render(<App />);
