// src/components/Auth/GoogleLogin.jsx
import { useEffect } from 'react';

const GoogleLogin = ({ onSuccess }) => {
  useEffect(() => {
    // Load Google script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    window.handleGoogleCredentialResponse = (response) => {
      // Send token to your backend
      fetch('http://localhost:3000/api/v1/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential })
      })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem('token', data.token);
          onSuccess();
        }
      })
      .catch(err => console.error('Google login failed', err));
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [onSuccess]);

  return (
    <div className="flex justify-center mt-4">
      <div id="g_id_onload"
        data-client_id="272663397972-2e1kmp39tdtmraqlee2rsccs1ius2481.apps.googleusercontent.com"
        data-callback="handleGoogleCredentialResponse"
        data-auto_prompt="false">
      </div>
      <div className="g_id_signin"
        data-type="standard"
        data-size="large"
        data-theme="outline"
        data-text="sign_in_with"
        data-shape="rectangular"
        data-logo_alignment="left">
      </div>
    </div>
  );
};

export default GoogleLogin;