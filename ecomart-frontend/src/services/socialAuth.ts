/**
 * Helper hỗ trợ xác thực Google Identity Services và Facebook SDK phía Client
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (notification?: (notification: unknown) => void) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: string;
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              width?: string | number;
            }
          ) => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (tokenResponse: { access_token: string; id_token?: string }) => void;
            error_callback?: (error: unknown) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
    FB?: {
      init: (options: {
        appId: string;
        cookie?: boolean;
        xfbml?: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: {
          authResponse?: {
            accessToken: string;
            userID: string;
            expiresIn: number;
          };
          status: string;
        }) => void,
        options?: { scope: string }
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

/**
 * Tải Google Identity Services SDK script
 */
export const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts) {
      resolve();
      return;
    }
    const existingScript = document.getElementById('google-jssdk');
    if (existingScript) {
      existingScript.onload = () => resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-jssdk';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(new Error('Không thể tải Google Identity Services SDK: ' + err));
    document.body.appendChild(script);
  });
};

/**
 * Tải Facebook SDK script
 */
export const loadFacebookScript = (appId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.FB) {
      resolve();
      return;
    }
    const existingScript = document.getElementById('facebook-jssdk');
    if (existingScript) {
      existingScript.onload = () => resolve();
      return;
    }

    window.fbAsyncInit = function () {
      window.FB?.init({
        appId,
        cookie: true,
        xfbml: true,
        version: 'v19.0',
      });
      resolve();
    };

    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = 'https://connect.facebook.net/vi_VN/sdk.js';
    script.async = true;
    script.defer = true;
    script.onerror = (err) => reject(new Error('Không thể tải Facebook SDK: ' + err));
    document.body.appendChild(script);
  });
};
