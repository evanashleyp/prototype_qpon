import { useState } from 'react';
import { getCurrentUser, getMerchantCoupons, getMerchantSalesCount, createCoupon, deleteCoupon, redeemCoupon } from '@/lib/store';
import CouponCard from '@/components/CouponCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, ScanLine, Trash2 } from 'lucide-react';

export default function MerchantDashboard() {
  const user = getCurrentUser();
  const { toast } = useToast();
  const [, setTick] = useState(0);
  const refresh = () => setTick(t => t + 1);

  const [qrInput, setQrInput] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  // Create form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [expDate, setExpDate] = useState('');
  const [stock, setStock] = useState('');
  const [itemsRaw, setItemsRaw] = useState('');

  const coupons = user ? getMerchantCoupons(user.id) : [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const items = itemsRaw.split('\n').filter(Boolean).map(line => {
      const [qty, ...rest] = line.split(' ');
      return { item_name: rest.join(' ') || 'Item', quantity: parseInt(qty) || 1 };
    });
    createCoupon({
      title, description,
      price: parseFloat(price), discount_percentage: parseInt(discount),
      expiration_date: expDate, stock: parseInt(stock),
      items,
    });
    setCreateOpen(false);
    setTitle(''); setDescription(''); setPrice(''); setDiscount(''); setExpDate(''); setStock(''); setItemsRaw('');
    refresh();
    toast({ title: 'Coupon created!' });
  };

  const handleRedeem = () => {
    if (!user) return;
    const result = redeemCoupon(qrInput.trim(), user.id);
    toast({ title: result.success ? 'Success' : 'Failed', description: result.message, variant: result.success ? 'default' : 'destructive' });
    if (result.success) setQrInput('');
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteCoupon(id);
    refresh();
    toast({ title: 'Coupon deleted' });
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Merchant Dashboard</h1>
          <p className="text-muted-foreground">{user?.name}</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-1.5 h-4 w-4" />New Coupon</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create Coupon</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Price ($)</Label><Input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required /></div>
                <div className="space-y-2"><Label>Discount %</Label><Input type="number" value={discount} onChange={e => setDiscount(e.target.value)} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Expiration</Label><Input type="date" value={expDate} onChange={e => setExpDate(e.target.value)} required /></div>
                <div className="space-y-2"><Label>Stock</Label><Input type="number" value={stock} onChange={e => setStock(e.target.value)} required /></div>
              </div>
              <div className="space-y-2">
                <Label>Bundle Items (one per line: "qty name")</Label>
                <Textarea placeholder={"1 Large Burger\n1 Fries\n1 Drink"} value={itemsRaw} onChange={e => setItemsRaw(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">Create Coupon</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* QR Scanner simulation */}
      <Card className="mb-8">
        <CardHeader><CardTitle className="flex items-center gap-2"><ScanLine className="h-5 w-5" />Redeem Coupon</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input placeholder="Paste QR code string here..." value={qrInput} onChange={e => setQrInput(e.target.value)} className="flex-1" />
            <Button onClick={handleRedeem} disabled={!qrInput.trim()}>Validate</Button>
          </div>
        </CardContent>
      </Card>

      <h2 className="font-display text-xl font-semibold mb-4">Your Coupons</h2>
      {coupons.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No coupons yet. Create your first one!</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map(c => (
            <CouponCard
              key={c.id}
              coupon={c}
              showMerchantActions
              salesCount={getMerchantSalesCount(c.id)}
              onDelete={() => handleDelete(c.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
