import { registerAs } from '@nestjs/config';

export default registerAs('telegram', () => ({
  botToken: process.env.TELEGRAM_BOT_TOKEN || "",
  chatId: process.env.TELEGRAM_CHAI_ID || "",
  enableTelegram: process.env.ENABLE_TELEGRAM == "true"
}));
