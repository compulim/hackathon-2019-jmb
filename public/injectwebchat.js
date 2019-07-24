const AUTO_ANSWERS = {
  'What is your name?': 'John Lennon.',
  'What is your phone number?': 'My number is 425-882-8080.',
  'What is your email address?': 'My email is john.lennon@microsoft.com',
  'What is your birthday?': 'My birthday is 1940-10-09.'
};

function setTimeoutWithAsync(fn, delay) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(fn());
      } catch (err) {
        reject(err);
      }
    }, delay);
  });
}

async function setSendBox(dispatch, answer) {
  await setTimeoutWithAsync(() => 0, 600);

  for (let i = 0; i < answer.length; i++) {
    await setTimeoutWithAsync(() => {
      dispatch({
        type: 'WEB_CHAT/SET_SEND_BOX',
        payload: { text: answer.substr(0, i + 1) }
      });
    }, 70 + ~~(Math.random() * 20));
  }
}

function createElement(tag, attributes = {}, ...children) {
  const element = document.createElement(tag);

  Object.keys(attributes).forEach(name => {
    if (name === 'className') {
      element.className = attributes.className;
    } else if (name === 'style') {
      const style = attributes.style;
      const styleStrings = [];

      Object.keys(style).forEach(name => {
        let value = style[name];
        const normalizedName = name.replace(/[A-Z]/gu, c => `-${ c.toLowerCase() }`);

        if (normalizedName === 'flex') {
          value += '';
        }

        styleStrings.push(`${ normalizedName }: ${ typeof value === 'number' ? `${ value }px` : value }`);
      });

      element.setAttribute(name, styleStrings.join('; '));
    } else {
      element.setAttribute(name, attributes[name]);
    }
  });

  if (children.length) {
    const fragment = document.createDocumentFragment();

    for (let child of children) {
      if (typeof child === 'string') {
        fragment.appendChild(document.createTextNode(child));
      } else {
        fragment.appendChild(child);
      }
    }

    element.appendChild(fragment);
  }

  return element;
}

async function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');

    script.addEventListener('load', resolve);
    script.addEventListener('error', ({ error, message }) => reject(error || new Error(message)));
    script.setAttribute('src', src);

    document.body.appendChild(script);
  });
}

async function main() {
  await loadScript('https://cdn.botframework.com/botframework-webchat/4.5.0/webchat.js');

  const { createDirectLine, createStore, renderWebChat } = window.WebChat;
  const { token } = await (await fetch('/api/directlinetoken')).json();
  const webChatHostElement = createElement(
    'div', {
      style: {
        flex: 1,
        overflowY: 'auto'
      }
    }
  );

  const webChatElement = createElement(
    'div',
    {
      className: 'webchat',
      style: {
        bottom: 10,
        boxShadow: '0 0 10px rgba(0, 0, 0, .1)',
        display: 'flex',
        flexDirection: 'column',
        fontSize: 16,
        maxWidth: 360,
        minWidth: 320,
        position: 'fixed',
        right: 10,
        top: 10,
      }
    },
    createElement(
      'div',
      {
        style: {
          backgroundColor: '#CB0000',
          color: 'White',
          padding: 10
        }
      },
      'JAL Mileage Bank'
    ),
    webChatHostElement
  );

  const store = createStore({}, ({ dispatch }) => next => action => {
    const { type } = action;

    if (type === 'DIRECT_LINE/CONNECT_FULFILLED') {
      dispatch({
        type: 'WEB_CHAT/SEND_EVENT',
        payload: {
          name: 'welcome'
        }
      });

      document.querySelector('[data-id="webchat-sendbox-input"]').focus();
    } else if (type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
      const { activity } = action.payload;
      const { type: activityType } = activity;

      if (activityType === 'event') {
        const { name: eventName } = activity;

        if (eventName === 'SET_FIELD') {
          const { name, value } = activity.value;
          const input = document.querySelector(`form [name="${ name }"]`);

          if (!input) {
            throw new Error(`Cannot find input element named "${ name }"`);
          }

          input.value = value;
        } else if (eventName === 'HIGHLIGHT_FIELDS') {
          const { names } = activity.value;

          document.querySelectorAll(`form [name]`).forEach(element => {
            element.style.background = '';
            element.style.border = '';
          });

          names.forEach((name, index) => {
            const element = document.querySelector(`form [name="${ name }"]`);

            if (element) {
              element.style.background = 'rgba(255, 0, 0, .1)';
              element.style.border = 'dotted 2px rgba(255, 0, 0)';

              index || element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          });
        } else if (eventName === 'CONFIRM_EMAIL') {
          const { value: email } = document.querySelector('form [name="mail"]');

          document.querySelector('form [name="mailConfirm"]').value = email;
        }
      } else if (activityType === 'message') {
        const answer = AUTO_ANSWERS[activity.text];

        answer && setSendBox(dispatch, answer);

        // if (/^Looks\slike/.test(activity.text)) {
        //   document.body.scrollIntoView({ behavior: 'smooth' })
        // }
      }
    }

    return next(action);
  });

  renderWebChat({
    directLine: createDirectLine({
      token
    }),
    store,
    styleOptions: {
      backgroundColor: 'rgba(255, 255, 255, .9)'
    }
  }, webChatHostElement);

  document.body.appendChild(webChatElement);
}

window.addEventListener('load', () => {
  main().catch(err => console.error(err));
});
