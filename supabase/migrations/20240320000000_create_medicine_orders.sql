-- Create a new storage bucket for prescriptions
insert into storage.buckets (id, name, public) values ('prescriptions', 'prescriptions', false);

-- Create a policy to allow authenticated users to upload their own prescriptions
create policy "Users can upload their own prescriptions"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'prescriptions' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create a policy to allow users to read their own prescriptions
create policy "Users can read their own prescriptions"
on storage.objects for select
to authenticated
using (
  bucket_id = 'prescriptions' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create the medicine_orders table
create table public.medicine_orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  patient_id uuid references auth.users(id) on delete cascade not null,
  doctor_name text not null,
  prescription_file text not null,
  patient_details text not null,
  delivery_address text not null,
  status text not null default 'pending'::text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint medicine_orders_status_check check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled'))
);

-- Enable Row Level Security
alter table public.medicine_orders enable row level security;

-- Create policies for medicine_orders
create policy "Users can view their own orders"
on public.medicine_orders for select
to authenticated
using (auth.uid() = patient_id);

create policy "Users can insert their own orders"
on public.medicine_orders for insert
to authenticated
with check (auth.uid() = patient_id);

-- Create an index on patient_id for faster queries
create index medicine_orders_patient_id_idx on public.medicine_orders(patient_id);

-- Create a function to update the updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create a trigger to automatically update the updated_at timestamp
create trigger handle_medicine_orders_updated_at
  before update on public.medicine_orders
  for each row
  execute procedure public.handle_updated_at(); 