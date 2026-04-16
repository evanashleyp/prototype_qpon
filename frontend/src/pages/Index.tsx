import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Ticket, ShoppingBag, Store, QrCode } from 'lucide-react';

export default function Index() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      <div className="animate-fade-in space-y-6 max-w-xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary">
          <Ticket className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="font-display text-5xl font-bold tracking-tight">
          CouponHub
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover amazing deals from local merchants. Buy discounted coupons and redeem them instantly with QR codes.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/coupons">
            <Button size="lg"><ShoppingBag className="mr-2 h-5 w-5" />Browse Deals</Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline">Get Started</Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-6 pt-8">
          {[
            { icon: ShoppingBag, label: 'Browse & Buy', desc: 'Find deals from local merchants' },
            { icon: QrCode, label: 'Get QR Code', desc: 'Unique code for each purchase' },
            { icon: Store, label: 'Redeem', desc: 'Show QR at the store' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="space-y-2">
              <Icon className="mx-auto h-8 w-8 text-primary" />
              <p className="font-display font-semibold text-sm">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
