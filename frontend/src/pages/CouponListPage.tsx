import { getCoupons } from '@/lib/store';
import CouponCard from '@/components/CouponCard';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Coupon } from '@/lib/types';

export default function CouponListPage() {
  const [search, setSearch] = useState('');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchCoupons() {
      try {
        setLoading(true);
        setError(null);
        const data = await getCoupons();
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
  }, []);

  const filtered = coupons.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.merchant_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">Browse Deals</h1>
        <p className="text-muted-foreground">Grab discounted coupons from your favorite places</p>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search coupons..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading coupons...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No coupons found.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(c => <CouponCard key={c.id} coupon={c} />)}
        </div>
      )}
    </div>
  );
}
