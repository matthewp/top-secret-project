
export default class Tab extends EventTarget {
  constructor(btnNode, frameNode) {
    super();
    this.btnNode = btnNode;
    this.btnTextNode = btnNode.querySelector('.tab-content-text');
    this.btnSvgNode = btnNode.querySelector('svg');
    this.frameNode = frameNode;

    /* State variables */
    this.content = null;
    this.href = null;

    /* Init functionality */
    this.connect();
  }

  /* DOM update functions */
  setTabNodeTitle(value) {
    this.btnTextNode.textContent = value;
  }

  setFrameHref(value) {
    this.frameNode.setAttribute('href', value);
  }

  setHref(value) {
    if(value !== this.href) {
      this.href = value;
    }
    this.setFrameHref(value);
  }

  removeDOMContents() {
    this.frameNode.remove();
    this.btnNode.remove();
  }

  /* EventListeners */
  onContentLoaded = (ev) => {
    this.setTabNodeTitle(ev.detail.title);
    this.href = ev.detail.url; // TODO make this better
    this.dispatchEvent(new CustomEvent('load', { detail: ev.detail }));
  }

  onCloseClick = ev => {
    this.dispatchEvent(new CustomEvent('close', { detail: this }));
  }

  onTeardown() {
    this.removeDOMContents();
    this.disconnect();
  }

  connect() {
    this.frameNode.addEventListener('load', this.onContentLoaded);
    this.btnSvgNode.addEventListener('click', this.onCloseClick);
  }

  disconnect() {
    this.frameNode.removeEventListener('load', this.onContentLoaded);
    this.btnSvgNode.removeEventListener('click', this.onCloseClick);
  }

  update(data = {}) {
    if(data.href != null) this.setHref(data.href);
    if(data.teardown != null) this.onTeardown();
  }
}