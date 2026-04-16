import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { requestPasswordReset } from '@/lib/store';
import { Ticket, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      const result = await requestPasswordReset(email);

      if (result.success) {
        setResetCode(result.code || '');
        setResetSent(true);
        toast({ 
          title: 'Success', 
          description: 'Check your email for password reset instructions.' 
        });
      } else {
        setError(result.message);
        toast({ 
          title: 'Error', 
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process password reset';
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

  if (resetSent) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="font-display text-2xl">Check Your Email</CardTitle>
            <CardDescription>Password reset link sent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p>We've sent a password reset link to:</p>
              <p className="font-semibold text-primary">{email}</p>
            </div>

            {resetCode && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <p className="font-semibold mb-2">Demo Mode - Reset Code:</p>
                  <p className="font-mono text-lg font-bold tracking-wider">{resetCode}</p>
                  <p className="text-xs mt-2">This code expires in 1 hour</p>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✓ Check your email (including spam folder)</p>
              <p>✓ Click the link or enter the code above</p>
              <p>✓ Create your new password</p>
            </div>

            <Button 
              onClick={() => navigate('/reset-password/' + resetCode)} 
              className="w-full"
            >
              Enter Reset Code
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

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Ticket className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="font-display text-2xl">Reset Password</CardTitle>
          <CardDescription>Enter your email to receive a reset code</CardDescription>
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
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@demo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </Button>

            <div className="text-center">
              <Button 
                type="button"
                variant="link" 
                onClick={() => navigate('/login')}
                className="text-sm"
              >
                Remember your password? Back to login
              </Button>
            </div>

            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              <p className="font-semibold mb-2">Demo Accounts:</p>
              <p>• user@demo.com (Customer)</p>
              <p>• burger@demo.com (Merchant)</p>
              <p>• coffee@demo.com (Merchant)</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
