import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Capacitor keyboard resize fix for Android
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { StatusBar, Style } from '@capacitor/status-bar';
if (typeof window !== 'undefined' && (window as any).Capacitor) {
  Keyboard.setResizeMode({ mode: KeyboardResize.Body });
  StatusBar.setOverlaysWebView({ overlay: true });
  StatusBar.setStyle({ style: Style.Dark });
  StatusBar.setBackgroundColor({ color: '#00000000' }); // transparent
}

createRoot(document.getElementById("root")!).render(<App />);
