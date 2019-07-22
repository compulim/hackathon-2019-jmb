import 'dotenv/config';
import { createServer } from 'restify';
import { BotFrameworkAdapter } from 'botbuilder';
import Bot from './bot';

const {
  MICROSOFT_APP_ID,
  MICROSOFT_APP_PASSWORD,
  PORT = 3978
} = process.env;

const server = createServer();

const adapter = new BotFrameworkAdapter({
  appId: MICROSOFT_APP_ID,
  appPassword: MICROSOFT_APP_PASSWORD
});

const bot = new Bot();

server.post('/api/messages', (req, res) => {
  adapter.processActivity(req, res, async context => {
    await bot.run(context);
  });
});

server.listen(PORT, () => {
  console.log(`Bot is now listening to port ${ PORT }`);
});
