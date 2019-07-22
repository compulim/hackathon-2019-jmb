import { ActivityHandler } from 'botbuilder';

export default class Bot extends ActivityHandler {
  constructor() {
    super();

    this.onMessage(async (context, next) => {
      console.log(context);

      await context.sendActivity('Hello, World!');

      return await next();
    });
  }
}
