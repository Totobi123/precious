
-- 1. Fix RLS for Orders to allow guest checkout
DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders" ON public.orders
  FOR INSERT WITH CHECK (true);

-- 2. Fix RLS for Order Items to allow guest checkout
DROP POLICY IF EXISTS "Insert order items" ON public.order_items;
CREATE POLICY "Anyone can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

-- 3. Ensure profiles are visible to admins for the dashboard count
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Admins and users can view profiles" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 4. Fix profile insertion to be more permissive during signup
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Allow profile insertion on signup" ON public.profiles
  FOR INSERT WITH CHECK (true);
