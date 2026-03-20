import { getCoupons } from '@/lib/store';
import CouponCard from '@/components/CouponCard';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Search } from 'lucide-react';

export default function CouponListPage() {
  const [search, setSearch] = useState('');
  const coupons = getCoupons();
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

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No coupons found.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(c => <CouponCard key={c.id} coupon={c} />)}
        </div>
      )}
    </div>
  );
}
