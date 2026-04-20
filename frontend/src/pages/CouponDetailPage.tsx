import { useParams, useNavigate } from 'react-router-dom';
import { getCoupon, purchaseCoupon, getCurrentUser, deleteCoupon } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Clock, Package, Tag, ShoppingCart, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Coupon } from '@/lib/types';

export default function CouponDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getCurrentUser();

  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCoupon() {
      try {
        setLoading(true);
        setError(null);
        if (id) {
          const data = await getCoupon(id);
          if (isMounted) {
            if (data) {
              setCoupon(data);
            } else {
              setError('Coupon not found');
            }
          }
        } else {
          setError('Invalid coupon ID');
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load coupon');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadCoupon();
    } else {
      navigate(-1); // Navigate back to previous page if id is not provided
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handlePurchase = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!coupon) return;

    setPurchasing(true);
    try {
      const uc = await purchaseCoupon(coupon.id);
      if (uc) {
        toast({ title: 'Purchased!', description: 'Check My Coupons for your QR code.' });
        // Refresh coupon data to update stock
        const updated = await getCoupon(coupon.id);
        if (updated) setCoupon(updated);
      } else {
        toast({ title: 'Failed', description: 'Could not purchase coupon.', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Purchase failed', variant: 'destructive' });
    } finally {
      setPurchasing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    
    setDeleting(true);
    try {
      const success = await deleteCoupon(coupon!.id);
      if (success) {
        toast({ title: 'Deleted!', description: 'Coupon has been deleted.' });
        navigate(-1);
      } else {
        toast({ title: 'Error', description: 'Failed to delete coupon.', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Delete failed', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="container py-12 text-center text-muted-foreground">Loading coupon...</div>;
  }

  if (error || !coupon) {
    return <div className="container py-12 text-center text-destructive">{error || 'Coupon not found.'}</div>;
  }

  const isExpired = new Date(coupon.expiration_date) < new Date();
  const outOfStock = coupon.stock <= 0;
  const price = Number(coupon.price) || 0;
  const discountPercentage = Number(coupon.discount_percentage) || 0;
  const originalPrice = price / (1 - discountPercentage / 100);

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
              {isExpired ? 'Expired' : outOfStock ? 'Sold Out' : `-${discountPercentage}%`}
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
            <span className="font-display text-4xl font-bold text-primary">${price.toFixed(2)}</span>
            <span className="text-lg text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>
            <span className="text-sm text-muted-foreground">You save ${(originalPrice - price).toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />Expires: {new Date(coupon.expiration_date).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><Tag className="h-4 w-4" />{coupon.stock} remaining</span>
          </div>

          <Button size="lg" className="w-full" disabled={isExpired || outOfStock || purchasing} onClick={handlePurchase}>
            <ShoppingCart className="mr-2 h-5 w-5" />
            {purchasing ? 'Processing...' : isExpired ? 'Expired' : outOfStock ? 'Sold Out' : 'Purchase Coupon'}
          </Button>

          {user?.role === 'merchant' && (
            <Button 
              size="lg" 
              variant="destructive" 
              className="w-full mt-2" 
              disabled={deleting} 
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-5 w-5" />
              {deleting ? 'Deleting...' : 'Delete Coupon'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
