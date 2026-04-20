import { useEffect, useState } from 'react';
import { getCurrentUser, getMerchantCoupons, createCoupon, editCoupon, deleteCoupon, redeemCoupon } from '@/lib/store';
import CouponCard from '@/components/CouponCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, ScanLine, Trash2 } from 'lucide-react';
import { Coupon } from '@/lib/types';

export default function MerchantDashboard() {
  const user = getCurrentUser();
  const { toast } = useToast();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrInput, setQrInput] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Create form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [expDate, setExpDate] = useState('');
  const [stock, setStock] = useState('');
  const [itemsRaw, setItemsRaw] = useState('');

  // Fetch merchant coupons
  useEffect(() => {
    let isMounted = true;

    async function loadCoupons() {
      try {
        if (!user || user.role !== 'merchant') {
          if (isMounted) {
            setCoupons([]);
          }
          return;
        }

        setLoading(true);
        setError(null);
        const data = await getMerchantCoupons();
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

    loadCoupons();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !price || !discount || !expDate || !stock) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    const items = itemsRaw.split('\n').filter(Boolean).map(line => {
      const [qty, ...rest] = line.split(' ');
      return { item_name: rest.join(' ') || 'Item', quantity: parseInt(qty) || 1 };
    });

    setCreating(true);
    try {
      const result = await createCoupon({
        title, description,
        price: parseFloat(price), 
        discount_percentage: parseInt(discount),
        expiration_date: expDate, 
        stock: parseInt(stock),
        items,
      });

      if (result) {
        toast({ title: 'Coupon created!', description: 'Your new coupon is now available' });
        setCreateOpen(false);
        setTitle('');
        setDescription('');
        setPrice('');
        setDiscount('');
        setExpDate('');
        setStock('');
        setItemsRaw('');
        // Refresh coupons
        const updated = await getMerchantCoupons();
        setCoupons(updated);
      } else {
        toast({ title: 'Error', description: 'Failed to create coupon', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to create coupon', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleRedeem = async () => {
    if (!user) return;
    
    setRedeeming(true);
    try {
      const result = await redeemCoupon(qrInput.trim());
      toast({ title: result.success ? 'Success' : 'Failed', description: result.message, variant: result.success ? 'default' : 'destructive' });
      if (result.success) {
        setQrInput('');
      }
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Redemption failed', variant: 'destructive' });
    } finally {
      setRedeeming(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await deleteCoupon(id);
      if (success) {
        toast({ title: 'Coupon deleted' });
        // Remove from local state
        setCoupons(coupons.filter(c => c.id !== id));
      } else {
        toast({ title: 'Error', description: 'Failed to delete coupon', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to delete coupon', variant: 'destructive' });
    }
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setTitle(coupon.title);
    setDescription(coupon.description);
    setPrice(String(coupon.price));
    setDiscount(String(coupon.discount_percentage));
    setExpDate(coupon.expiration_date);
    setStock(String(coupon.stock));
    setItemsRaw(coupon.items.map(item => `${item.quantity} ${item.item_name}`).join('\n'));
    setEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon || !title || !description || !price || !discount || !expDate || !stock) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    const items = itemsRaw.split('\n').filter(Boolean).map(line => {
      const [qty, ...rest] = line.split(' ');
      return { item_name: rest.join(' ') || 'Item', quantity: parseInt(qty) || 1 };
    });

    setEditing(true);
    try {
      const result = await editCoupon(editingCoupon.id, {
        title, description,
        price: parseFloat(price), 
        discount_percentage: parseInt(discount),
        expiration_date: expDate, 
        stock: parseInt(stock),
        items,
      });

      if (result) {
        toast({ title: 'Coupon updated!', description: 'Your changes have been saved' });
        setEditOpen(false);
        setEditingCoupon(null);
        setTitle('');
        setDescription('');
        setPrice('');
        setDiscount('');
        setExpDate('');
        setStock('');
        setItemsRaw('');
        // Refresh coupons
        const updated = await getMerchantCoupons();
        setCoupons(updated);
      } else {
        toast({ title: 'Error', description: 'Failed to update coupon', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to update coupon', variant: 'destructive' });
    } finally {
      setEditing(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Merchant Dashboard</h1>
          <p className="text-muted-foreground">{user?.name || 'Merchant'}</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button disabled={creating}><Plus className="mr-1.5 h-4 w-4" />New Coupon</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create Coupon</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} disabled={creating} required /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} disabled={creating} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Price ($)</Label><Input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} disabled={creating} required /></div>
                <div className="space-y-2"><Label>Discount %</Label><Input type="number" value={discount} onChange={e => setDiscount(e.target.value)} disabled={creating} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Expiration</Label><Input type="date" value={expDate} onChange={e => setExpDate(e.target.value)} disabled={creating} required /></div>
                <div className="space-y-2"><Label>Stock</Label><Input type="number" value={stock} onChange={e => setStock(e.target.value)} disabled={creating} required /></div>
              </div>
              <div className="space-y-2">
                <Label>Bundle Items (one per line: "qty name")</Label>
                <Textarea placeholder={"1 Large Burger\n1 Fries\n1 Drink"} value={itemsRaw} onChange={e => setItemsRaw(e.target.value)} disabled={creating} />
              </div>
              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? 'Creating...' : 'Create Coupon'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Edit Coupon</DialogTitle></DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} disabled={editing} required /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} disabled={editing} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Price ($)</Label><Input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} disabled={editing} required /></div>
                <div className="space-y-2"><Label>Discount %</Label><Input type="number" value={discount} onChange={e => setDiscount(e.target.value)} disabled={editing} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Expiration</Label><Input type="date" value={expDate} onChange={e => setExpDate(e.target.value)} disabled={editing} required /></div>
                <div className="space-y-2"><Label>Stock</Label><Input type="number" value={stock} onChange={e => setStock(e.target.value)} disabled={editing} required /></div>
              </div>
              <div className="space-y-2">
                <Label>Bundle Items (one per line: "qty name")</Label>
                <Textarea placeholder={"1 Large Burger\n1 Fries\n1 Drink"} value={itemsRaw} onChange={e => setItemsRaw(e.target.value)} disabled={editing} />
              </div>
              <Button type="submit" className="w-full" disabled={editing}>
                {editing ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* QR Scanner simulation */}
      <Card className="mb-8">
        <CardHeader><CardTitle className="flex items-center gap-2"><ScanLine className="h-5 w-5" />Redeem Coupon</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input placeholder="Paste QR code string here..." value={qrInput} onChange={e => setQrInput(e.target.value)} disabled={redeeming} className="flex-1" />
            <Button onClick={handleRedeem} disabled={!qrInput.trim() || redeeming}>
              {redeeming ? 'Validating...' : 'Validate'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <h2 className="font-display text-xl font-semibold mb-4">Your Coupons</h2>
      {loading ? (
        <p className="text-muted-foreground text-center py-12">Loading coupons...</p>
      ) : error ? (
        <p className="text-destructive text-center py-12">{error}</p>
      ) : coupons.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No coupons yet. Create your first one!</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map(c => (
            <CouponCard
              key={c.id}
              coupon={c}
              showMerchantActions
              onEdit={() => handleOpenEdit(c)}
              onDelete={() => handleDelete(c.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
