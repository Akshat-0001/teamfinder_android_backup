import { App } from '@capacitor/app';
import { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';

const AuthPage = () => {
  const [deepLinkMessage, setDeepLinkMessage] = useState('');

  useEffect(() => {
    if (!(Capacitor.isNativePlatform && Capacitor.isNativePlatform())) return;
    let handler: PluginListenerHandle | null = null;
    (async () => {
      handler = await App.addListener('appUrlOpen', (data) => {
      const url = data.url;
      if (url && url.startsWith('teamfinder://auth/callback')) {
        setDeepLinkMessage('Email verified! Please return to the app to continue.');
        // Optionally, handle token/callback logic here
      }
    });
    })();
    return () => { handler && handler.remove(); };
  }, []);

  return (
    <Card className="w-full max-w-md glass-card">
      <CardHeader className="text-center space-y-2">
        {deepLinkMessage && (
          <div className="bg-green-100 text-green-800 rounded-lg p-3 mt-2 text-sm">
            {deepLinkMessage}
          </div>
        )}
      </CardHeader>
    </Card>
  );
};

export default AuthPage; 