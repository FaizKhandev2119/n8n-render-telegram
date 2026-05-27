const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Telegram Relay Running");
});

app.post("/send", async (req, res) => {
  try {
    const { botToken, chatIds, text } = req.body;

    if (!botToken) {
      return res.status(400).json({
        success: false,
        error: "botToken is required"
      });
    }

    if (!chatIds || !Array.isArray(chatIds) || chatIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "chatIds array is required"
      });
    }

    if (!text) {
      return res.status(400).json({
        success: false,
        error: "text is required"
      });
    }

    const results = [];

    for (const chatId of chatIds) {
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            chat_id: chatId,
            text
          })
        }
      );

      const data = await response.json();

      results.push({
        chatId,
        success: response.ok,
        telegramResponse: data
      });
    }

    return res.json({
      success: true,
      totalRecipients: chatIds.length,
      results
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
