import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserCoupon } from '@/lib/types';
import { CheckCircle, XCircle } from 'lucide-react';

interface QRCodeDisplayProps {
  userCoupon: UserCoupon;
}

export default function QRCodeDisplay({ userCoupon }: QRCodeDisplayProps) {
  const isExpired = new Date(userCoupon.expires_at) < new Date();

  return (
    <Card className="animate-fade-in">
      <CardContent className="flex flex-col items-center gap-4 pt-6">
        <h3 className="font-display text-lg font-semibold">{userCoupon.coupon.title}</h3>
        <p className="text-sm text-muted-foreground">{userCoupon.coupon.merchant_name}</p>

        <div className={`rounded-xl border-2 p-4 ${userCoupon.is_redeemed || isExpired ? 'opacity-40 grayscale' : 'border-primary'}`}>
          <QRCodeSVG value={userCoupon.qr_code} size={180} />
        </div>

        <p className="text-xs text-muted-foreground font-mono">{userCoupon.qr_code}</p>

        {userCoupon.is_redeemed ? (
          <Badge variant="default" className="gap-1 bg-success">
            <CheckCircle className="h-3 w-3" />Redeemed {userCoupon.redeemed_at ? `on ${new Date(userCoupon.redeemed_at).toLocaleDateString()}` : ''}
          </Badge>
        ) : isExpired ? (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />Expired
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 border-primary text-primary">
            Valid until {new Date(userCoupon.expires_at).toLocaleDateString()}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
