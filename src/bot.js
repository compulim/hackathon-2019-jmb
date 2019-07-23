import { ActivityHandler } from 'botbuilder';

import MainDialog from './MainDialog';

export default class Bot extends ActivityHandler {
  constructor(conversationState, userState) {
    super();

    const dialog = new MainDialog();
    const dialogState = conversationState.createProperty('DIALOG_STATE');

    this.onEvent(async (context, next) => {
      await context.sendActivity('Welcome to JAL Mileage Bank bot.');
      await dialog.run(context, dialogState);

      await next();
    });

    this.onDialog(async (context, next) => {
      await conversationState.saveChanges(context, false);
      await userState.saveChanges(context, false);

      await next();
    });

    this.onMessage(async (context, next) => {
      // await context.sendActivity('Hello, John!');

      // await context.sendActivity({
      //   type: 'event',
      //   name: 'SET_FIELD',
      //   value: {
      //     name: 'romajiForeName',
      //     value: 'John'
      //   }
      // });

      await dialog.run(context, dialogState);

      await next();
    });
  }
}
