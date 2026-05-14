const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const payload = JSON.parse(event.body);
    const formName = payload.form_name || "Unknown Form";
    const data = payload.data || {};

    const formEmojis = {
      "broker-inquiry": "🏠",
      "yacht-inquiry": "⛵",
      "aviation-inquiry": "✈️"
    };

    const emoji = formEmojis[formName] || "📋";

    let message = `${emoji} *NEW ${formName.toUpperCase().replace("-", " ")} SUBMISSION*\n\n`;
    message += `*Form:* ${formName}\n`;
    message += `*Time:* ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })}\n\n`;

    for (const [key, value] of Object.entries(data)) {
      if (key !== "bot-field") {
        message += `*${key}:* ${value}\n`;
      }
    }

    message += `\n👑 CrosMinX Empire — Croshire Estates`;

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown"
      })
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Notification sent successfully" })
    };

  } catch (error) {
    console.error("Error sending notification:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
