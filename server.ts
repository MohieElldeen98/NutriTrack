import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import url from "url";
import crypto from "crypto";
import 'dotenv/config';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Paymob and general requests use JSON body
  app.use(express.json());

  // Webhook for Paymob
  app.post('/api/paymob-webhook', (req, res) => {
    // To secure this in production, calculate HMAC matching Paymob docs:
    // using process.env.PAYMOB_HMAC and comparing against req.query.hmac
    const incomingHmac = req.query.hmac;
    
    if (req.body && req.body.obj && req.body.obj.success === true) {
         const merchantOrderId = req.body.obj.order.merchant_order_id;
         console.log('Paymob payment successful for order:', merchantOrderId);
         // Here we would typically update the user's status in Firestore via Admin SDK
    } else {
         console.log('Paymob payment failed or invalid callback:', req.body?.obj?.order?.merchant_order_id);
    }
    
    // Paymob expects 200 OK
    res.json({ received: true });
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post('/api/create-paymob-iframe', async (req, res) => {
    const { PAYMOB_API_KEY, PAYMOB_INTEGRATION_ID, PAYMOB_IFRAME_ID } = process.env;
    
    if (!PAYMOB_API_KEY || !PAYMOB_INTEGRATION_ID || !PAYMOB_IFRAME_ID) {
      return res.status(500).json({ error: 'Paymob is not configured in this environment' });
    }

    try {
      const { plan, userId, email, displayName } = req.body; // e.g. plan: 'vip_monthly'
      const amountCents = 49900; // 499 EGP

      // 1. Authentication Request
      const authReq = await fetch('https://accept.paymob.com/api/auth/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: PAYMOB_API_KEY })
      });
      const authData = await authReq.json() as any;
      const authToken = authData.token;

      // 2. Order Registration Request
      const orderReq = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_token: authToken,
          delivery_needed: "false",
          amount_cents: amountCents,
          currency: "EGP",
          merchant_order_id: `VIP_${userId}_${Date.now()}`,
          items: []
        })
      });
      const orderData = await orderReq.json() as any;
      const orderId = orderData.id;

      // 3. Payment Key Request
      const keyReq = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_token: authToken,
          amount_cents: amountCents,
          expiration: 3600,
          order_id: orderId,
          billing_data: {
            apartment: "NA", 
            email: email || "vip@nutritrack.com", 
            floor: "NA", 
            first_name: displayName || "Doctor",
            street: "NA", 
            building: "NA", 
            phone_number: "+201000000000", 
            shipping_method: "NA",
            postal_code: "NA", 
            city: "Cairo", 
            country: "EG", 
            last_name: "VIP", 
            state: "Cairo"
          },
          currency: "EGP",
          integration_id: PAYMOB_INTEGRATION_ID,
        })
      });
      const keyData = await keyReq.json() as any;
      const paymentToken = keyData.token;

      // 4. Send iframe URL back to client
      const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`;
      res.json({ url: iframeUrl });
    } catch (error: any) {
      console.error('Error creating Paymob session:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // For Express v4, use '*'
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
