import {
  ComponentDialog,
  ConfirmPrompt,
  DialogSet,
  DialogTurnStatus,
  TextPrompt,
  WaterfallDialog
} from 'botbuilder-dialogs';

import { LuisRecognizer } from 'botbuilder-ai';
import { InputHints, MessageFactory } from 'botbuilder';

import { generate as generatePassword } from 'generate-password';
import MainRecognizer from './MainRecognizer';

import titleCase from './utils/titleCase';

async function highlightFields(context, ...names) {
  return await context.sendActivity({
    type: 'event',
    name: 'HIGHLIGHT_FIELDS',
    value: { names }
  });
}

async function setField(context, map) {
  return await Promise.all(Object.keys(map).map(async name => {
    return await context.sendActivity({
      type: 'event',
      name: 'SET_FIELD',
      value: { name, value: map[name] }
    });
  }));
}

export default class MainDialog extends ComponentDialog {
  constructor() {
    super('Main dialog');

    this.recognizer = new MainRecognizer();

    this.addDialog(new ConfirmPrompt('CONFIRM_PROMPT'));
    this.addDialog(new TextPrompt('TEXT_PROMPT'));
    this.addDialog(new WaterfallDialog('MAIN_DIALOG', [
      async stepContext => {
        await highlightFields(stepContext.context, 'romajiForeName', 'romajiFamilyName', 'middleName', 'embossName');

        return await stepContext.prompt(
          'TEXT_PROMPT',
          { prompt: MessageFactory.text('What is your name?', InputHints.ExpectingInput) }
        );
      },
      async stepContext => {
        const { context } = stepContext;
        const luisResult = await this.recognizer.executeLuisQuery(context);
        const intent = LuisRecognizer.topIntent(luisResult);

        if (intent !== 'FILL_NAME') {
          return await context.sendActivity('Sorry, could you repeat your name again');
        }

        const { personName: [personName] } = luisResult.entities;

        const names = personName.split(' ');
        const [firstName] = names.splice(0, 1) || [];
        const [familyName] = names.splice(-1) || [];
        const middleName = names.join(' ');

        await setField(context, {
          embossName: personName.toUpperCase(),
          middleName: titleCase(middleName),
          romajiFamilyName: titleCase(familyName),
          romajiForeName: titleCase(firstName)
        });

        await highlightFields(stepContext.context, 'homeTel1');

        return await stepContext.prompt(
          'TEXT_PROMPT',
          {
            prompt: MessageFactory.text('What is your phone number?', InputHints.ExpectingInput)
          }
        );
      },
      async stepContext => {
        const { context } = stepContext;
        const luisResult = await this.recognizer.executeLuisQuery(context);
        const intent = LuisRecognizer.topIntent(luisResult);

        if (intent !== 'FILL_PHONE_NUMBER') {
          return await context.sendActivity('Sorry, could you repeat your phone number again?');
        }

        const { phonenumber: [phoneNumber] } = luisResult.entities;

        await setField(context, { homeTel1: phoneNumber });
        await highlightFields(stepContext.context, 'mail', 'mailConfirm');

        return await stepContext.prompt(
          'TEXT_PROMPT',
          {
            prompt: MessageFactory.text('What is your email address?', InputHints.ExpectingInput)
          }
        );

        // return await stepContext.next();
      },
      async stepContext => {
        const { context } = stepContext;
        const luisResult = await this.recognizer.executeLuisQuery(context);
        const intent = LuisRecognizer.topIntent(luisResult);

        if (intent !== 'FILL_EMAIL') {
          await context.sendActivity('Sorry, could you repeat your email address again?');
        }

        const { email: [email] } = luisResult.entities;

        await setField(context, { mail: email });
        await highlightFields(stepContext.context, 'mailConfirm');

        return await stepContext.prompt(
          'CONFIRM_PROMPT',
          {
            prompt: `Can you confirm your email address ${ email } is correct?`
          }
        );

        // return await stepContext.next();
      },
      async stepContext => {
        const { context } = stepContext;

        if (stepContext.result) {
          // TODO: Fill in email confirm
          await highlightFields(context, 'birthMon', 'birthDay', 'birthYear');
          await context.sendActivity({
            type: 'event',
            name: 'CONFIRM_EMAIL'
          });

          return await stepContext.prompt(
            'TEXT_PROMPT',
            {
              prompt: 'What is your birthdate?'
            }
          );
        }

        return await stepContext.next();
      },
      async stepContext => {
        const { context } = stepContext;
        const luisResult = await this.recognizer.executeLuisQuery(context);
        const intent = LuisRecognizer.topIntent(luisResult);

        if (intent !== 'FILL_BIRTHDATE') {
          await context.sendActivity('Sorry, could you repeat your birthdate again?');
        }

        const [year, month, day] = luisResult.entities.datetime[0].timex[0].split('-').map(value => +value);

        await setField(context, {
          birthMon: month,
          birthDay: day,
          birthYear: year
        });

        const pin = (Math.random() + '').substr(2, 6);
        const password = generatePassword({
          length: 12,
          numbers: true
        });

        await setField(context, {
          pass: pin,
          passConfirm: pin,
          webPass: password,
          webPassConfirm: password
        });

        await highlightFields(context);
        await context.sendActivity(`I have generated your password as below. I will save it into your OneNote when you submit the form.\n\n- PIN is \`${ pin }\`\n- Password is \`${ password }\``);

        // const { datetimeV2: [birthdate] } = luisResult.entities;

        // await setField(context, { mail: email });
        // await highlightFields(stepContext.context, ['mailConfirm']);

        // return await stepContext.prompt(
        //   'CONFIRM_PROMPT',
        //   {
        //     prompt: `Can you confirm your email address ${ email } is correct?`
        //   }
        // );

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
