import { getCurrentUser, getUserCoupons } from '@/lib/store';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { Ticket } from 'lucide-react';
import { useEffect, useState } from 'react';
import { UserCoupon } from '@/lib/types';

export default function MyCouponsPage() {
  const user = getCurrentUser();
  const [coupons, setCoupons] = useState<UserCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchCoupons() {
      try {
        if (!user) {
          if (isMounted) {
            setCoupons([]);
          }
          return;
        }

        setLoading(true);
        setError(null);
        const data = await getUserCoupons();
        if (isMounted) {
          setCoupons(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load coupons');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchCoupons();

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="font-display text-3xl font-bold mb-2">My Coupons</h1>
        <p className="text-muted-foreground mb-8">Loading your coupons...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <h1 className="font-display text-3xl font-bold mb-2">My Coupons</h1>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

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
