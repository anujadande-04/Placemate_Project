/**
 * Email Confirmation Success Page
 * Displays a thank you message after successful email confirmation
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Mail, ArrowRight, Home, User, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const EmailConfirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [confirmationStatus, setConfirmationStatus] = useState<'loading' | 'success' | 'error' | 'already_confirmed'>('loading');
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        console.log('EmailConfirmation: Starting confirmation process');
        console.log('Current URL:', window.location.href);
        console.log('URL hash:', window.location.hash);
        console.log('Search params:', Object.fromEntries(searchParams.entries()));
        
        // First try to handle any auth hash from the URL (Supabase sends tokens in URL fragment)
        const { data, error } = await supabase.auth.getSession();
        
        console.log('Current session:', { data, error });
        
        if (error) {
          console.error('Session error:', error);
          setConfirmationStatus('error');
          return;
        }

        // Check URL parameters for confirmation tokens
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        console.log('URL parameters:', { accessToken, refreshToken, tokenHash, type });

        // Handle different confirmation scenarios
        if (type === 'signup' || accessToken || tokenHash) {
          console.log('Processing confirmation link...');
          // This is a confirmation link
          if (data?.session?.user) {
            setUserEmail(data.session.user.email || '');
            setConfirmationStatus('success');
          } else {
            // Try to exchange the tokens
            const urlFragment = window.location.hash;
            if (urlFragment.includes('access_token')) {
              // Let Supabase handle the fragment automatically
              setTimeout(() => {
                window.location.reload();
              }, 1000);
              return;
            }
            setConfirmationStatus('error');
          }
        } else {
          // Check if user is already authenticated and confirmed
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            setUserEmail(user.email || '');
            if (user.email_confirmed_at) {
              setConfirmationStatus('already_confirmed');
            } else {
              setConfirmationStatus('success');
            }
          } else {
            setConfirmationStatus('error');
          }
        }
      } catch (error) {
        console.error('Error handling confirmation:', error);
        setConfirmationStatus('error');
      }
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', { event, session });
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in via email confirmation');
        setUserEmail(session.user.email || '');
        setConfirmationStatus('success');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed during confirmation');
      }
    });

    handleEmailConfirmation();

    // Cleanup subscription
    return () => subscription.unsubscribe();
  }, [searchParams]);

  const handleContinue = () => {
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (confirmationStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Confirming your email...</h2>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full space-y-6">
        {confirmationStatus === 'success' && (
          <Card className="shadow-2xl bg-white/90 backdrop-blur-sm border-0">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-700 to-blue-600 bg-clip-text text-transparent">
                Email Confirmed Successfully!
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Thank you for confirming your email address.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-green-200 bg-green-50">
                <Mail className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Verification Complete</AlertTitle>
                <AlertDescription className="text-green-700">
                  {userEmail && (
                    <>Your email address <strong>{userEmail}</strong> has been successfully verified. </>
                  )}
                  You can now access all features of your account.
                </AlertDescription>
              </Alert>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-gray-800 mb-2">What's Next?</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center">
                    <ArrowRight className="h-3 w-3 mr-2 text-blue-500" />
                    Sign in to your account
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-3 w-3 mr-2 text-blue-500" />
                    Complete your profile setup
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-3 w-3 mr-2 text-blue-500" />
                    Start your placement journey
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleContinue}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transform transition-all duration-300 hover:scale-105"
                >
                  <User className="mr-2 h-4 w-4" />
                  Continue to Login
                </Button>
                <Button 
                  onClick={handleGoHome}
                  variant="outline"
                  className="flex-1 border-2 border-gray-300 hover:bg-gray-50 py-3 rounded-xl"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {confirmationStatus === 'already_confirmed' && (
          <Card className="shadow-2xl bg-white/90 backdrop-blur-sm border-0">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent">
                Already Confirmed
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Your email address is already verified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-blue-200 bg-blue-50">
                <Mail className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Email Verified</AlertTitle>
                <AlertDescription className="text-blue-700">
                  {userEmail && (
                    <>Your email address <strong>{userEmail}</strong> was previously verified. </>
                  )}
                  You can sign in to your account anytime.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleContinue}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transform transition-all duration-300 hover:scale-105"
                >
                  <User className="mr-2 h-4 w-4" />
                  Go to Login
                </Button>
                <Button 
                  onClick={handleGoHome}
                  variant="outline"
                  className="flex-1 border-2 border-gray-300 hover:bg-gray-50 py-3 rounded-xl"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {confirmationStatus === 'error' && (
          <Card className="shadow-2xl bg-white/90 backdrop-blur-sm border-0">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-700 to-pink-600 bg-clip-text text-transparent">
                Confirmation Failed
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                We couldn't confirm your email address.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Verification Error</AlertTitle>
                <AlertDescription className="text-red-700">
                  The confirmation link may be invalid, expired, or already used. Please try signing up again or contact support if the issue persists.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => navigate('/signup')}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transform transition-all duration-300 hover:scale-105"
                >
                  Try Again
                </Button>
                <Button 
                  onClick={handleGoHome}
                  variant="outline"
                  className="flex-1 border-2 border-gray-300 hover:bg-gray-50 py-3 rounded-xl"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EmailConfirmation;