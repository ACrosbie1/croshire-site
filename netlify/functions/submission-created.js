const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

exports.handler = async function(event, context) {
  try {
    const payload = JSON.parse(event.body).payload;
    const formName = payload.form_name || "Unknown Form";
    const data = payload.data || {};

    const formEmojis = {
      "broker-inquiry": "🏠",
      "yacht-inquiry": "⛵",
      "aviation-inquiry": "✈️"
    };

    const emoji = formEmojis[formName] || "📋";

    let message = `${emoji} *NEW ${formName.toUpperCase().replace(/-/g, " ")} SUBMISSION*\n\n`;
    message += `*Time:* ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })}\n\n`;

    for (const [key, value] of Object.entries(data)) {
      if (key !== "bot-field") {
        message += `*${key}:* ${value}\n`;
      }
    }

    message += `\n👑 CrosMinX Empire — Croshire Estates`;

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown"
      })
    });

    return { statusCode: 200, body: "OK" };

  } catch (error) {
    console.error("Error:", error);
    return { statusCode: 500, body: error.message };
  }
};
