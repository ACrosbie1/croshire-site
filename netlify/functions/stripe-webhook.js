const https = require('https');

// Send Telegram message
function sendTelegram(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  const body = JSON.stringify({
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML'
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const payload = JSON.parse(event.body);
    const stripeEvent = payload.type;
    const data = payload.data?.object;

    if (stripeEvent === 'checkout.session.completed' || stripeEvent === 'payment_intent.succeeded') {
      const amount = data.amount_total ? `$${(data.amount_total / 100).toFixed(2)}` : 
                     data.amount ? `$${(data.amount / 100).toFixed(2)}` : 'Unknown amount';
      const email = data.customer_details?.email || data.receipt_email || 'No email captured';
      const name = data.customer_details?.name || 'Unknown';
      const description = data.description || data.metadata?.product || 'Broker/Lender Access';

      const message = `
💰 <b>PAYMENT RECEIVED</b>
━━━━━━━━━━━━━━━
🏢 <b>Croshire Estates Corp</b>
━━━━━━━━━━━━━━━
💵 <b>Amount:</b> ${amount}
👤 <b>Name:</b> ${name}
📧 <b>Email:</b> ${email}
📋 <b>Product:</b> ${description}
⏰ <b>Time:</b> ${new Date().toLocaleString('en-US', {timeZone: 'America/New_York'})} EST
━━━━━━━━━━━━━━━
✅ Payment confirmed via Stripe`;

      await sendTelegram(message);
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };

  } catch (err) {
    console.error('Webhook error:', err);
    return { statusCode: 400, body: `Webhook error: ${err.message}` };
  }
};
