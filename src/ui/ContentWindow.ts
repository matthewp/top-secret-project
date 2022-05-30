import type { Service } from 'robot3';
import { action, createMachine, immediate, interpret, invoke, state, reduce, transition } from 'robot3';

interface MachineStates {
  idle: {},
  loading: {},
  loaded: {},
}

interface MachineContext {
  rootNode: ContentWindow;
}

interface LoadEvent {
  url: string;
}

const loadPage = (_ctx: MachineContext, ev: LoadEvent) => {
  return api.load(ev.url);
}

const r = reduce<MachineContext, any>(((ctx, ev) => ({ ...ctx, url: ev.url })))

const machine = createMachine<MachineStates, MachineContext>({
  idle: state(
    transition('load', 'loading',
      reduce<MachineContext, any>(((ctx, ev) => ({ ...ctx, url: ev.url })))
    )
  ),
  loading: invoke<MachineContext, string, LoadEvent>(loadPage,
    transition('done', 'loaded')
  ),
  loaded: state(immediate('idle', action<MachineContext, any>((ctx, ev) => {
    ctx.rootNode.content = ev.data;
  })))
}, ctx => ctx);

class ContentWindow extends HTMLElement {
  static observedAttributes = ['href'];
  #service: Service<typeof machine>;
  #frameNode: HTMLIFrameElement;

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    this.#service = interpret(machine, () => {
      
    }, { rootNode: this });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `<iframe part="frame"></iframe>`;
    this.#frameNode = this.shadowRoot.firstElementChild as HTMLIFrameElement;
    this.#frameNode.addEventListener('load', this);
  }

  attributeChangedCallback(_attr, _oldValue, newValue) {
    this.#service.send({ type: 'load', url: newValue });
  }

  handleEvent(ev: any) {
    switch(ev.type) {
      case 'keyup':
      case 'keydown': {
        this.dispatchEvent(new KeyboardEvent(ev.type, ev));
        break;
      }
      case 'load': {
        this.#frameNode.contentDocument.addEventListener('keyup', this);
        this.#frameNode.contentDocument.addEventListener('keydown', this);
        this.dispatchEvent(new CustomEvent('load', {
          detail: {
            title: ev.target.contentDocument.title,
            url: this.getAttribute('href')
          }
        }));
        break;
      }
    }

  }

  set content(value: string) {
    this.#frameNode.setAttribute('srcdoc', value);
  }
}

customElements.define('content-window', ContentWindow);