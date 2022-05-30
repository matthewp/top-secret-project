
export default class Tab extends EventTarget {
  constructor(btnNode, frameNode) {
    super();
    this.btnNode = btnNode;
    this.frameNode = frameNode;

    /* State variables */
    this.content = null;
    this.href = null;

    /* Init functionality */
    this.connect();
  }

  setTabNodeTitle(value) {
    this.btnNode.textContent = value;
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

  /* EventListeners */
  onContentLoaded = (ev) => {
    this.setTabNodeTitle(ev.detail.title);
    this.href = ev.detail.url; // TODO make this better
    this.dispatchEvent(new CustomEvent('load', { detail: ev.detail }));
  }

  connect() {
    this.frameNode.addEventListener('load', this.onContentLoaded);
  }

  update(data = {}) {
    if(data.href != null) this.setHref(data.href);
  }
}