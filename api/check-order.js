import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { order_number, email } = req.body ?? {};

  if (!order_number || !email) {
    return res.status(400).json({ error: 'order_number and email are required' });
  }

  const { data, error } = await supabase
    .from('orders')
    .select('order_number, status, products, estimated_delivery, tracking_number')
    .eq('order_number', order_number.trim().toUpperCase())
    .eq('email', email.trim().toLowerCase())
    .single();

  if (error || !data) {
    return res.status(200).json({ found: false });
  }

  return res.status(200).json({ found: true, ...data });
}
