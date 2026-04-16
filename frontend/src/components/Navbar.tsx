import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getCurrentUser, logout } from '@/lib/store';
import { LogOut, Ticket, Store, ShoppingBag } from 'lucide-react';

interface NavbarProps {
  user: ReturnType<typeof getCurrentUser>;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onLogout();
    navigate('/');
  };

  return (
    <nav className="border-b bg-card sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary">
          <Ticket className="h-6 w-6" />
          CouponHub
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.role === 'user' && (
                <>
                  <Link to="/coupons">
                    <Button variant="ghost" size="sm"><ShoppingBag className="mr-1.5 h-4 w-4" />Browse</Button>
                  </Link>
                  <Link to="/my-coupons">
                    <Button variant="ghost" size="sm"><Ticket className="mr-1.5 h-4 w-4" />My Coupons</Button>
                  </Link>
                </>
              )}
              {user.role === 'merchant' && (
                <Link to="/merchant">
                  <Button variant="ghost" size="sm"><Store className="mr-1.5 h-4 w-4" />Dashboard</Button>
                </Link>
              )}
              <span className="text-sm text-muted-foreground hidden sm:inline">{user.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-1.5 h-4 w-4" />Logout
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button size="sm">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
