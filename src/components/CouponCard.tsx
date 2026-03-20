import { Coupon } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Clock, Package, Tag } from 'lucide-react';

interface CouponCardProps {
  coupon: Coupon;
  showMerchantActions?: boolean;
  salesCount?: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function CouponCard({ coupon, showMerchantActions, salesCount, onEdit, onDelete }: CouponCardProps) {
  const isExpired = new Date(coupon.expiration_date) < new Date();
  const outOfStock = coupon.stock <= 0;
  const originalPrice = coupon.price / (1 - coupon.discount_percentage / 100);

  return (
    <Card className="flex flex-col animate-fade-in overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold leading-tight">{coupon.title}</h3>
          <Badge variant={isExpired || outOfStock ? "destructive" : "default"} className="shrink-0">
            {isExpired ? 'Expired' : outOfStock ? 'Sold Out' : `-${coupon.discount_percentage}%`}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{coupon.merchant_name}</p>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{coupon.description}</p>

        {coupon.items.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {coupon.items.map(item => (
              <span key={item.id} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
                <Package className="h-3 w-3" />{item.quantity}× {item.item_name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold text-primary">${coupon.price.toFixed(2)}</span>
          <span className="text-sm text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Exp: {new Date(coupon.expiration_date).toLocaleDateString()}</span>
          <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{coupon.stock} left</span>
        </div>

        {showMerchantActions && salesCount !== undefined && (
          <p className="text-sm font-medium text-primary">{salesCount} sold</p>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        {showMerchantActions ? (
          <div className="flex w-full gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>Edit</Button>
            <Button variant="destructive" size="sm" className="flex-1" onClick={onDelete}>Delete</Button>
          </div>
        ) : (
          <Link to={`/coupons/${coupon.id}`} className="w-full">
            <Button className="w-full" disabled={isExpired || outOfStock}>
              {isExpired ? 'Expired' : outOfStock ? 'Sold Out' : 'View Deal'}
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
