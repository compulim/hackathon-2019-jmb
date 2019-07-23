import 'dotenv/config';
import { createServer } from 'restify';

import {
  BotFrameworkAdapter,
  ConversationState,
  MemoryStorage,
  UserState
} from 'botbuilder';

import Bot from './Bot';
import fetch from 'node-fetch';

const {
  DIRECT_LINE_SECRET,
  MICROSOFT_APP_ID,
  MICROSOFT_APP_PASSWORD,
  PORT = 3978
} = process.env;

const server = createServer();

const adapter = new BotFrameworkAdapter({
  appId: MICROSOFT_APP_ID,
  appPassword: MICROSOFT_APP_PASSWORD
});

const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);
const bot = new Bot(conversationState, userState);

server.post('/api/messages', (req, res) => {
  adapter.processActivity(req, res, async context => {
    await bot.run(context);
  });
});

server.get('/api/directlinetoken', async (req, res) => {
  const cres = await fetch('https://directline.botframework.com/v3/directline/tokens/generate', {
    headers: {
      authorization: `Bearer ${ DIRECT_LINE_SECRET }`
    },
    method: 'POST'
  });

  if (!cres.ok) {
    res.status(500);

    console.log(await cres.text());

    return res.end();
  }

  res.setHeader('access-control-allow-origin', '*');
  res.json(await cres.json());
});

server.listen(PORT, () => {
  console.log(`Bot is now listening to port ${ PORT }`);
});
