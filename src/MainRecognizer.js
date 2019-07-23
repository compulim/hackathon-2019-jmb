import { LuisRecognizer } from 'botbuilder-ai';

const {
  LUIS_APP_ID,
  LUIS_ENDPOINT_KEY,
  LUIS_ENDPOINT_URL
} = process.env;

export default class MainRecognizer {
  constructor() {
    this.recognizer = new LuisRecognizer(
      {
        applicationId: LUIS_APP_ID,
        endpointKey: LUIS_ENDPOINT_KEY,
        endpoint: LUIS_ENDPOINT_URL
      },
      {},
      true
    );
  }

  async executeLuisQuery(context) {
    return await this.recognizer.recognize(context);
  }
}
