import { getCurrentUser, getUserCoupons } from '@/lib/store';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { Ticket } from 'lucide-react';

export default function MyCouponsPage() {
  const user = getCurrentUser();
  const coupons = user ? getUserCoupons(user.id) : [];

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold mb-2">My Coupons</h1>
      <p className="text-muted-foreground mb-8">Show the QR code at the merchant to redeem</p>

      {coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Ticket className="h-12 w-12 mb-4" />
          <p>You haven't purchased any coupons yet.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map(uc => <QRCodeDisplay key={uc.id} userCoupon={uc} />)}
        </div>
      )}
    </div>
  );
}
