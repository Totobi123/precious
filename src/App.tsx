import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import AdminLayout from "@/components/admin/AdminLayout";
import Index from "./pages/Index";
import Collections from "./pages/Collections";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import SizingGuide from "./pages/SizingGuide";
import ShippingReturns from "./pages/ShippingReturns";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import GiftSets from "./pages/GiftSets";
import Login from "./pages/Login";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/admin/Dashboard";
import Orders from "./pages/admin/Orders";
import Products from "./pages/admin/Products";
import UsersManagement from "./pages/admin/UsersManagement";
import StaffManagement from "./pages/admin/StaffManagement";
import SiteSettings from "./pages/admin/SiteSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const StorefrontLayout = ({ children }: { children: React.ReactNode }) => (
  <Layout>{children}</Layout>
);

const App = () => {
  const [adminPath, setAdminPath] = useState("admin");

  useEffect(() => {
    const fetchAdminPath = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "admin_route_path")
        .single();
      if (data?.value) setAdminPath(data.value);
    };
    fetchAdminPath();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Storefront */}
                <Route path="/" element={<StorefrontLayout><Index /></StorefrontLayout>} />
                <Route path="/collections/all" element={<StorefrontLayout><Collections /></StorefrontLayout>} />
                <Route path="/product/:id" element={<StorefrontLayout><ProductDetail /></StorefrontLayout>} />
                <Route path="/about" element={<StorefrontLayout><About /></StorefrontLayout>} />
                <Route path="/sizing-guide" element={<StorefrontLayout><SizingGuide /></StorefrontLayout>} />
                <Route path="/shipping-returns" element={<StorefrontLayout><ShippingReturns /></StorefrontLayout>} />
                <Route path="/faq" element={<StorefrontLayout><FAQ /></StorefrontLayout>} />
                <Route path="/contact" element={<StorefrontLayout><Contact /></StorefrontLayout>} />
                <Route path="/gift-sets" element={<StorefrontLayout><GiftSets /></StorefrontLayout>} />
                <Route path="/profile" element={<StorefrontLayout><Profile /></StorefrontLayout>} />
                <Route path="/checkout" element={<StorefrontLayout><Checkout /></StorefrontLayout>} />

                {/* Auth */}
                <Route path={`/${adminPath}/login`} element={<Login />} />
                <Route path="/auth" element={<Auth />} />

                {/* Admin */}
                <Route path={`/${adminPath}`} element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="products" element={<Products />} />
                  <Route path="users" element={<UsersManagement />} />
                  <Route path="staff" element={<StaffManagement />} />
                  <Route path="settings" element={<SiteSettings />} />
                </Route>

                <Route path="*" element={<StorefrontLayout><NotFound /></StorefrontLayout>} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
