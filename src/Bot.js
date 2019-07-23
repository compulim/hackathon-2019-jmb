import { ActivityHandler } from 'botbuilder';

import MainDialog from './MainDialog';

export default class Bot extends ActivityHandler {
  constructor(conversationState, userState) {
    super();

    const dialog = new MainDialog();
    const dialogState = conversationState.createProperty('DIALOG_STATE');

    this.onEvent(async (context, next) => {
      await context.sendActivity({
        type: 'message',
        text: '![JAL Logo](/jallogo-small.png)\n\nThank you for joining JAL Mileage Bank. Let me help you to fill out the form.'
      });

      await dialog.run(context, dialogState);

      await next();
    });

    this.onDialog(async (context, next) => {
      await conversationState.saveChanges(context, false);
      await userState.saveChanges(context, false);

      await next();
    });

    this.onMessage(async (context, next) => {
      await dialog.run(context, dialogState);

      await next();
    });
  }
}
