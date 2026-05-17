import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { items, shipping } = req.body ?? {};

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items in cart' });
  }

  const protocol = req.headers.host?.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${req.headers.host}`;

  const lineItems = items.map(item => ({
    price_data: {
      currency: 'gbp',
      product_data: { name: item.name },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.qty,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    customer_email: shipping?.email || undefined,
    metadata: {
      name:     shipping?.name     || '',
      address:  shipping?.address  || '',
      city:     shipping?.city     || '',
      postcode: shipping?.postcode || '',
    },
    success_url: `${baseUrl}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${baseUrl}/`,
  });

  return res.status(200).json({ url: session.url });
}
