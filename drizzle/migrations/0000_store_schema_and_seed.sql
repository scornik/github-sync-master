create type public.app_role as enum ('admin','customer');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, role public.app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated; grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role public.app_role) returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.products (id text primary key, slug text unique not null, name text not null, sku text unique not null, description text not null default '', category text not null, gender text not null, occasion text not null, fabric text not null, price integer not null, sale_price integer, image_key text not null, alt_image_key text not null, is_new boolean not null default false, is_bestseller boolean not null default false, popularity integer not null default 0, is_active boolean not null default true, created_at timestamptz not null default now());
create table public.product_variants (id text primary key, product_id text not null references public.products(id) on delete cascade, color text not null, color_hex text not null, size text not null, stock integer not null default 0 check (stock >= 0));
create index on public.product_variants(product_id);
grant select on public.products, public.product_variants to anon, authenticated;
grant insert, update, delete on public.products, public.product_variants to authenticated;
grant all on public.products, public.product_variants to service_role;
alter table public.products enable row level security; alter table public.product_variants enable row level security;
create policy "public read" on public.products for select using (is_active or public.has_role(auth.uid(),'admin'));
create policy "admin write" on public.products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "public read" on public.product_variants for select using (true);
create policy "admin write" on public.product_variants for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.coupons (code text primary key, kind text not null check (kind in ('percent','flat')), value integer not null, min_subtotal integer not null default 0, active boolean not null default true, created_at timestamptz not null default now());
grant select, insert, update, delete on public.coupons to authenticated; grant all on public.coupons to service_role;
alter table public.coupons enable row level security;
create policy "admin all" on public.coupons for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.coupons (code,kind,value,min_subtotal) values ('PETAL10','percent',10,0),('EID500','flat',500,3000);

create table public.orders (id uuid primary key default gen_random_uuid(), order_number text unique not null, user_id uuid, customer_name text not null, phone text not null, email text, district text not null, address text not null, payment_method text not null, coupon_code text, subtotal integer not null, discount integer not null default 0, delivery_fee integer not null, total integer not null, status text not null default 'placed', courier text, tracking_code text, created_at timestamptz not null default now());
create table public.order_items (id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade, product_id text not null, variant_id text not null, name text not null, color text not null, size text not null, unit_price integer not null, qty integer not null check (qty > 0));
create table public.order_status_history (id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade, status text not null, note text, created_at timestamptz not null default now());
grant select, update on public.orders to authenticated; grant select, insert on public.order_status_history to authenticated; grant select on public.order_items to authenticated;
grant all on public.orders, public.order_items, public.order_status_history to service_role;
alter table public.orders enable row level security; alter table public.order_items enable row level security; alter table public.order_status_history enable row level security;
create policy "own or admin" on public.orders for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admin update" on public.orders for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "own or admin" on public.order_items for select to authenticated using (exists (select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or public.has_role(auth.uid(),'admin'))));
create policy "own or admin" on public.order_status_history for select to authenticated using (exists (select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or public.has_role(auth.uid(),'admin'))));
create policy "admin insert" on public.order_status_history for insert to authenticated with check (public.has_role(auth.uid(),'admin'));

create table public.wishlist (user_id uuid not null, product_id text not null references public.products(id) on delete cascade, created_at timestamptz not null default now(), primary key (user_id, product_id));
grant select, insert, delete on public.wishlist to authenticated; grant all on public.wishlist to service_role;
alter table public.wishlist enable row level security;
create policy "own" on public.wishlist for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

insert into public.products (id,slug,name,sku,description,category,gender,occasion,fabric,price,sale_price,image_key,alt_image_key,is_new,is_bestseller,popularity,created_at) values
('rose-petal-dress','rose-petal-dress','Rose Petal Dress','LP-D001','Tulle dress scattered with hand-applied petals.','dresses','girl','party','tulle',3450,null,'rose','lavender',true,true,98,now()-interval '1 day'),
('lilac-bow-tutu','lilac-bow-tutu','Lilac Bow Tutu Dress','LP-D002','Satin bodice with a generous bow and layered tulle skirt.','occasionwear','girl','party','satin',4200,3600,'lavender','rose',true,true,91,now()-interval '2 days'),
('buttercup-smock','buttercup-smock','Buttercup Smocked Dress','LP-D003','Hand-smocked cotton with soft puff sleeves.','dresses','girl','everyday','cotton',2650,null,'butter','rose',true,false,77,now()-interval '3 days'),
('sage-linen-romper','sage-linen-romper','Sage Linen Romper','LP-R001','Peter Pan collar romper in breathable washed linen.','outfits','boy','everyday','linen',1950,null,'sage','boy',true,true,88,now()-interval '4 days'),
('little-gent-set','little-gent-set','Little Gent Set','LP-S001','Shirt and shorts set for small celebrations.','outfits','boy','party','cotton',2850,2400,'boy','sage',true,false,70,now()-interval '5 days'),
('cloud-newborn-set','cloud-newborn-set','Cloud Newborn Set','LP-N001','Organic cotton bodysuit, bonnet and mittens.','newborn','unisex','everyday','organic cotton',1650,null,'newborn','sage',true,true,95,now()-interval '6 days'),
('blossom-everyday-dress','blossom-everyday-dress','Blossom Everyday Dress','LP-D004','Easy cotton dress for long sunny days.','dresses','girl','everyday','cotton',1850,1500,'butter','lavender',false,false,60,now()-interval '20 days'),
('eid-princess-gown','eid-princess-gown','Eid Princess Gown','LP-D005','Occasion gown with petal appliqué for festive days.','occasionwear','girl','festive','tulle',5200,null,'rose','butter',false,true,85,now()-interval '25 days'),
('meadow-romper','meadow-romper','Meadow Romper','LP-R002','Soft muslin romper with wooden buttons.','outfits','unisex','everyday','muslin',1450,null,'sage','newborn',false,false,55,now()-interval '30 days'),
('lavender-dream-dress','lavender-dream-dress','Lavender Dream Dress','LP-D006','Flutter sleeves and a satin sash.','occasionwear','girl','wedding','satin',4600,null,'lavender','rose',false,false,66,now()-interval '35 days'),
('first-smile-bodysuit','first-smile-bodysuit','First Smile Bodysuit','LP-N002','Everyday organic bodysuit in gentle tones.','newborn','unisex','everyday','organic cotton',850,null,'newborn','sage',false,true,80,now()-interval '40 days'),
('festive-kurta-set','festive-kurta-set','Festive Kurta Set','LP-S002','Cotton kurta and pyjama set for Eid and family days.','outfits','boy','festive','cotton',2950,null,'boy','sage',false,false,62,now()-interval '45 days');

insert into public.product_variants (id,product_id,color,color_hex,size,stock)
select c.pid||'-'||c.color||'-'||s.size, c.pid, c.color, c.hex, s.size, c.stocks[s.ord]
from (values
('rose-petal-dress','Blush','#F3D8D6',array[11,5,11,3,12,15,5,7]),('rose-petal-dress','Ivory','#FFF9F5',array[10,4,10,0,11,14,4,6]),
('lilac-bow-tutu','Lavender','#E8E0F1',array[11,5,11,3,12,15,5,7]),('lilac-bow-tutu','Blush','#F3D8D6',array[12,6,12,4,13,0,6,8]),
('buttercup-smock','Butter','#F6E7BD',array[13,7,13,5,14,3,7,0]),('buttercup-smock','Ivory','#FFF9F5',array[4,12,4,10,5,8,12,14]),
('sage-linen-romper','Sage','#DCE8D9',array[4,12,4,10,5,8,12,14]),('sage-linen-romper','Taupe','#9B8B83',array[5,13,5,11,6,0,13,15]),
('little-gent-set','Sky','#D8E4EE',array[0,10,0,8,3,6,10,12]),('little-gent-set','Sage','#DCE8D9',array[5,13,5,11,6,0,13,15]),
('cloud-newborn-set','Ivory','#FFF9F5',array[8,0,8,14,0,12,0,4]),('cloud-newborn-set','Sage','#DCE8D9',array[0,3,0,15,10,13,3,5]),
('blossom-everyday-dress','Butter','#F6E7BD',array[12,6,12,4,13,0,6,8]),('blossom-everyday-dress','Ivory','#FFF9F5',array[3,11,3,0,4,7,11,13]),
('eid-princess-gown','Blush','#F3D8D6',array[13,7,13,5,14,3,7,0]),('eid-princess-gown','Ivory','#FFF9F5',array[12,6,12,4,13,0,6,8]),
('meadow-romper','Sage','#DCE8D9',array[10,4,10,0,11,14,4,6]),('meadow-romper','Taupe','#9B8B83',array[11,5,11,3,12,15,5,7]),
('lavender-dream-dress','Lavender','#E8E0F1',array[13,7,13,5,14,3,7,0]),('lavender-dream-dress','Blush','#F3D8D6',array[14,8,14,6,15,4,8,10]),
('first-smile-bodysuit','Ivory','#FFF9F5',array[15,0,15,7,0,5,0,11]),('first-smile-bodysuit','Sage','#DCE8D9',array[0,10,0,8,3,6,10,12]),
('festive-kurta-set','Sky','#D8E4EE',array[3,11,3,0,4,7,11,13]),('festive-kurta-set','Sage','#DCE8D9',array[6,14,6,12,7,10,14,0])
) as c(pid,color,hex,stocks)
cross join unnest(array['Newborn','0-3M','3-6M','6-12M','12-18M','18-24M','2-3Y','3-4Y']) with ordinality as s(size,ord);