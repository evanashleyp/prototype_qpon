import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validateResetCode, resetPassword } from '@/lib/store';
import { Ticket, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { code: codeFromUrl } = useParams<{ code: string }>();
  const { toast } = useToast();

  const [code, setCode] = useState(codeFromUrl || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(true);
  const [codeValid, setCodeValid] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Validate reset code on mount
  useEffect(() => {
    let isMounted = true;

    async function validateCode() {
      if (!code) {
        if (isMounted) {
          setValidationError('No reset code provided');
          setValidating(false);
        }
        return;
      }

      try {
        const validation = await validateResetCode(code);
        if (isMounted) {
          if (validation.valid) {
            setCodeValid(true);
          } else {
            setValidationError(validation.message);
          }
          setValidating(false);
        }
      } catch (err) {
        if (isMounted) {
          setValidationError(err instanceof Error ? err.message : 'Failed to validate reset code');
          setValidating(false);
        }
      }
    }

    validateCode();

    return () => {
      isMounted = false;
    };
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(code, newPassword);

      if (result.success) {
        setResetSuccess(true);
        toast({ 
          title: 'Success', 
          description: 'Your password has been reset successfully.' 
        });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.message);
        toast({ 
          title: 'Error', 
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset password';
      setError(message);
      toast({ 
        title: 'Error', 
        description: message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 text-center">
            <div className="animate-spin">
              <Ticket className="h-8 w-8 text-primary mx-auto" />
            </div>
            <p className="mt-4 text-muted-foreground">Validating reset code...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!codeValid) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="font-display text-2xl">Invalid Reset Code</CardTitle>
            <CardDescription>{validationError}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The reset code is invalid, expired, or has already been used. Please request a new one.
            </p>
            <Button 
              onClick={() => navigate('/forgot-password')} 
              className="w-full"
            >
              Request New Reset Code
            </Button>
            <Button 
              onClick={() => navigate('/login')} 
              variant="outline" 
              className="w-full"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="font-display text-2xl">Password Reset</CardTitle>
            <CardDescription>Your password has been successfully reset</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              You can now login with your new password. Redirecting to login page...
            </p>
            <Button 
              onClick={() => navigate('/login')} 
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Ticket className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="font-display text-2xl">Create New Password</CardTitle>
          <CardDescription>Enter your reset code and new password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="code">Reset Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter your reset code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError('');
                }}
                disabled={loading || codeFromUrl}
                className="font-mono tracking-widest"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError('');
                  }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </Button>

            <div className="text-center">
              <Button 
                type="button"
                variant="link" 
                onClick={() => navigate('/login')}
                className="text-sm"
              >
                Back to login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
