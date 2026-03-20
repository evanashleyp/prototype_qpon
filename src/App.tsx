import { useState } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from '@/components/Navbar';
import Index from "./pages/Index";
import LoginPage from './pages/LoginPage';
import CouponListPage from './pages/CouponListPage';
import CouponDetailPage from './pages/CouponDetailPage';
import MyCouponsPage from './pages/MyCouponsPage';
import MerchantDashboard from './pages/MerchantDashboard';
import NotFound from "./pages/NotFound";
import { User } from '@/lib/types';
import { getCurrentUser } from '@/lib/store';

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<User | null>(getCurrentUser());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar user={user} onLogout={() => setUser(null)} />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage onAuth={setUser} />} />
            <Route path="/coupons" element={<CouponListPage />} />
            <Route path="/coupons/:id" element={<CouponDetailPage />} />
            <Route path="/my-coupons" element={<MyCouponsPage />} />
            <Route path="/merchant" element={<MerchantDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
