import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import AppRoutes from './routes/AppRoutes';

const App: React.FC = () => {
  // Bắt token trả về từ OAuth popup (Facebook / Google) trên bất kỳ route nào
  React.useEffect(() => {
    if (window.opener && window.location.hash) {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1));
      const googleIdToken = params.get('id_token');
      const fbAccessToken = params.get('access_token');

      if (googleIdToken) {
        window.opener.postMessage(
          { type: 'GOOGLE_AUTH_SUCCESS', token: googleIdToken },
          window.location.origin
        );
        window.close();
      } else if (fbAccessToken) {
        window.opener.postMessage(
          { type: 'FACEBOOK_AUTH_SUCCESS', token: fbAccessToken },
          window.location.origin
        );
        window.close();
      }
    }
  }, []);

  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
