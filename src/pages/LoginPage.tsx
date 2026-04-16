import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { login, register } from '@/lib/store';
import { User } from '@/lib/types';
import { Ticket } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoginPageProps {
  onAuth: (user: User) => void;
}

export default function LoginPage({ onAuth }: LoginPageProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'user' | 'merchant'>('user');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = login(loginEmail, loginPassword);
    if (user) {
      onAuth(user);
      navigate(user.role === 'merchant' ? '/merchant' : '/coupons');
    } else {
      toast({ title: 'Login failed', description: 'Demo: user@demo.com or burger@demo.com (pass: password)', variant: 'destructive' });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const user = register(regName, regEmail, regPassword, regRole);
    onAuth(user);
    navigate(user.role === 'merchant' ? '/merchant' : '/coupons');
    toast({ title: 'Welcome!', description: `Registered as ${regRole}` });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Ticket className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="font-display text-2xl">CouponHub</CardTitle>
          <CardDescription>Buy & redeem discounted coupons</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input placeholder="user@demo.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" placeholder="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                  <div className="text-right">
                    <Button 
                      type="button"
                      variant="link" 
                      onClick={() => navigate('/forgot-password')}
                      className="h-auto p-0 text-xs"
                    >
                      Forgot password?
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full">Login</Button>
                <p className="text-xs text-center text-muted-foreground">
                  Demo: user@demo.com (customer) · burger@demo.com (merchant)<br />
                  <span className="text-foreground font-medium">Password: password</span>
                </p>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input placeholder="Your name" value={regName} onChange={e => setRegName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="you@email.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" placeholder="Min 6 characters" value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>I am a</Label>
                  <div className="flex gap-2">
                    <Button type="button" variant={regRole === 'user' ? 'default' : 'outline'} className="flex-1" onClick={() => setRegRole('user')}>Customer</Button>
                    <Button type="button" variant={regRole === 'merchant' ? 'default' : 'outline'} className="flex-1" onClick={() => setRegRole('merchant')}>Merchant</Button>
                  </div>
                </div>
                <Button type="submit" className="w-full">Create Account</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
