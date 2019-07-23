import {
  ComponentDialog,
  DialogSet,
  DialogTurnStatus,
  TextPrompt,
  WaterfallDialog
} from 'botbuilder-dialogs';

import { LuisRecognizer } from 'botbuilder-ai';
import { InputHints, MessageFactory } from 'botbuilder';

import MainRecognizer from './MainRecognizer';

import titleCase from './utils/titleCase';

export default class MainDialog extends ComponentDialog {
  constructor() {
    super('Main dialog');

    this.recognizer = new MainRecognizer();

    this.addDialog(new TextPrompt('TEXT_PROMPT'));
    this.addDialog(new WaterfallDialog('MAIN_DIALOG', [
      async stepContext => await stepContext.prompt(
        'TEXT_PROMPT',
        {
          prompt: MessageFactory.text('What is your name?', InputHints.ExpectingInput)
        }
      ),
      async stepContext => {
        const { context } = stepContext;
        const luisResult = await this.recognizer.executeLuisQuery(context);
        const intent = LuisRecognizer.topIntent(luisResult);

        switch (intent) {
          case 'FILL_NAME':
            const { personName: [personName] } = luisResult.entities;

            if (personName) {
              const names = personName.split(' ');
              const [firstName] = names.splice(0, 1) || [];
              const [familyName] = names.splice(-1) || [];
              const middleName = names.join(' ');

              await context.sendActivity({
                type: 'event',
                name: 'SET_FIELD',
                value: {
                  name: 'romajiForeName',
                  value: titleCase(firstName)
                }
              });

              if (familyName) {
                await context.sendActivity({
                  type: 'event',
                  name: 'SET_FIELD',
                  value: {
                    name: 'romajiFamilyName',
                    value: titleCase(familyName)
                  }
                });
              }

              if (names.length) {
                await context.sendActivity({
                  type: 'event',
                  name: 'SET_FIELD',
                  value: {
                    name: 'middleName',
                    value: titleCase(middleName)
                  }
                });
              }

              await context.sendActivity({
                type: 'event',
                name: 'SET_FIELD',
                value: {
                  name: 'embossName',
                  value: personName.toUpperCase()
                }
              });
            }

            break;

          default:
            await context.sendActivity(
              'Sorry, I don\'t understand.'
            );

            break;
        }

        return await stepContext.prompt(
          'TEXT_PROMPT',
          {
            prompt: MessageFactory.text('What is your phone number?', InputHints.ExpectingInput)
          }
        );

        // return await stepContext.next();
      },
      async stepContext => {
        const { context } = stepContext;
        const luisResult = await this.recognizer.executeLuisQuery(context);
        const intent = LuisRecognizer.topIntent(luisResult);

        console.log(luisResult.entities);

        switch (intent) {
          case 'FILL_PHONE_NUMBER':
            const { phonenumber: [phoneNumber] } = luisResult.entities;

            console.log(phoneNumber);

            if (phoneNumber) {
              await context.sendActivity({
                type: 'event',
                name: 'SET_FIELD',
                value: {
                  name: 'homeTel1',
                  value: phoneNumber
                }
              });
            }

            break;
        }

        return await stepContext.next();
      }
    ]));

    this.initialDialogId = 'MAIN_DIALOG';
  }

  async run(turnContext, accessor) {
    const dialogSet = new DialogSet(accessor);

    dialogSet.add(this);

    const dialogContext = await dialogSet.createContext(turnContext);
    const results = await dialogContext.continueDialog();

    if (results.status === DialogTurnStatus.empty) {
      await dialogContext.beginDialog(this.id);
    }
  }
}
