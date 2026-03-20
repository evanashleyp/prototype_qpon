import { useParams, useNavigate } from 'react-router-dom';
import { getCoupon, purchaseCoupon, getCurrentUser } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Clock, Package, Tag, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

export default function CouponDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getCurrentUser();
  const [, setTick] = useState(0);

  const coupon = getCoupon(id!);
  if (!coupon) return <div className="container py-12 text-center text-muted-foreground">Coupon not found.</div>;

  const isExpired = new Date(coupon.expiration_date) < new Date();
  const outOfStock = coupon.stock <= 0;
  const originalPrice = coupon.price / (1 - coupon.discount_percentage / 100);

  const handlePurchase = () => {
    if (!user) { navigate('/login'); return; }
    const uc = purchaseCoupon(coupon.id);
    if (uc) {
      toast({ title: 'Purchased!', description: 'Check My Coupons for your QR code.' });
      setTick(t => t + 1);
    } else {
      toast({ title: 'Failed', description: 'Could not purchase coupon.', variant: 'destructive' });
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-1.5 h-4 w-4" />Back
      </Button>

      <Card className="animate-fade-in">
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold">{coupon.title}</h1>
              <p className="text-muted-foreground">{coupon.merchant_name}</p>
            </div>
            <Badge variant={isExpired || outOfStock ? "destructive" : "default"} className="text-base px-3 py-1">
              {isExpired ? 'Expired' : outOfStock ? 'Sold Out' : `-${coupon.discount_percentage}%`}
            </Badge>
          </div>

          <p className="text-foreground">{coupon.description}</p>

          {coupon.items.length > 0 && (
            <div>
              <h3 className="font-display font-semibold mb-2">What's Included</h3>
              <div className="space-y-1.5">
                {coupon.items.map(item => (
                  <div key={item.id} className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>{item.quantity}× {item.item_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-baseline gap-3">
            <span className="font-display text-4xl font-bold text-primary">${coupon.price.toFixed(2)}</span>
            <span className="text-lg text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>
            <span className="text-sm text-muted-foreground">You save ${(originalPrice - coupon.price).toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />Expires: {new Date(coupon.expiration_date).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><Tag className="h-4 w-4" />{coupon.stock} remaining</span>
          </div>

          <Button size="lg" className="w-full" disabled={isExpired || outOfStock} onClick={handlePurchase}>
            <ShoppingCart className="mr-2 h-5 w-5" />
            {isExpired ? 'Expired' : outOfStock ? 'Sold Out' : 'Purchase Coupon (Simulated)'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
