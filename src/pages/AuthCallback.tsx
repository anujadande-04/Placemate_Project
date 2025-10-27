import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback: Processing auth callback');
        console.log('Current URL:', window.location.href);
        console.log('URL hash:', window.location.hash);
        
        // Let Supabase handle the auth callback automatically
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          return;
        }

        if (data?.session?.user) {
          console.log('Auth callback successful, user authenticated');
          setStatus('success');
          // Redirect to email confirmation page to show success message
          setTimeout(() => {
            navigate('/confirm-email');
          }, 1000);
        } else {
          console.log('No session found in auth callback');
          setStatus('error');
        }
      } catch (error) {
        console.error('Auth callback processing error:', error);
        setStatus('error');
      }
    };

    // Listen for auth state changes during callback processing
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth callback state change:', { event, session });
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User authenticated during callback');
        setStatus('success');
        setTimeout(() => {
          navigate('/confirm-email');
        }, 1000);
      }
    });

    handleAuthCallback();

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 flex items-center justify-center p-6">
      <div className="text-center">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Confirming your email...</h2>
            <p className="text-gray-600">Please wait while we verify your account.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Email Confirmed!</h2>
            <p className="text-gray-600">Redirecting you to the confirmation page...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Confirmation Failed</h2>
            <p className="text-gray-600 mb-4">There was an issue confirming your email.</p>
            <button
              onClick={() => navigate('/confirm-email')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Go to Confirmation Page
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;