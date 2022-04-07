import {Component, h, State, Element, Watch, Prop, EventEmitter, Event} from '@stencil/core';
// import {getInstanceRegistry} from "../../utils/SSAppInstancesRegistry";

declare const $$: any;

@Component({
  tag: 'ssapp-window',
  styleUrl: 'ssapp-window.css',
  shadow: false,
})
export class SsappWindow {

  @Element() element;

  @Prop({attribute: 'app-name', mutable: false, reflect: false}) appName: string;

  @Prop({attribute: "key-ssi", mutable: false, reflect: false}) seed: string = undefined;

  @Prop({attribute: 'landing-path', mutable: false, reflect: false}) landingPath: string = "/";

  @Prop({attribute: 'params', mutable: false, reflect: false}) params: {[indexer: string]: string,};

  @State() digestKeySsiHex;
  @State() parsedParams;

  private eventHandler;
  private componentInitialized = false;

  @Event({
    bubbles: true,
    cancelable: true
  })
  windowAction: EventEmitter

  connectedCallback() {
    if (navigator.serviceWorker)
      navigator.serviceWorker.addEventListener('message', this.getSWOnMessageHandler());
  }

  disconnectedCallback() {
    if (navigator.serviceWorker)
      navigator.serviceWorker.removeEventListener('message', this.getSWOnMessageHandler());
  }

  componentShouldUpdate(newValue, oldValue, changedState) {
    if (newValue !== oldValue && (changedState === "digestKeySsiHex" || changedState === "parsedParams")) {
      window.document.removeEventListener(oldValue, this.eventHandler);
      window.document.addEventListener(newValue, this.eventHandler);
      return true;
    }
    return false;
  }

  componentWillLoad(): Promise<any> {
    if (!this.element.isConnected) {
      return;
    }
    return new Promise((resolve) => {
      this.componentInitialized = true;
      this.loadApp(resolve)
    });
  }

  componentDidLoad() {
    let iframe = this.element.querySelector("iframe");
    console.log("#### Trying to register ssapp reference");
    // getInstanceRegistry().addSSAppReference(this.appName, iframe);

    this.eventHandler = this.ssappEventHandler.bind(this);
    window.document.addEventListener(this.digestKeySsiHex, this.eventHandler);
    window.document.addEventListener(this.parsedParams, this.eventHandler);

    console.log(`### Trying to add listener to iframe document`);
    const self = this;
    iframe.addEventListener('load', () => {
      iframe.contentWindow.addEventListener('ssapp-action', self.handleActionFromWindow.bind(self));
    });
  }

  private handleActionFromWindow(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const {detail} = evt;
    this.windowAction.emit(detail);
  }

  @Watch("seed")
  @Watch("params")
  @Watch("landingPath")
  loadApp(callback?) {
    if (!this.seed)
      return;
    if (this.componentInitialized) {
      this.digestKeySsiHex = this.digestMessage(this.seed);
      if (typeof callback === "function") {
        callback();
      }

      if (!!this.params) {
        try{
          this.parsedParams = Object.assign({}, this.params);
        }catch (e) {
          console.log("Attribute called 'params' could not be parsed.")
        }
      }
    }
  };

  private onServiceWorkerMessageHandler: (e) => void;

  private getWindows(){
    let currentWindow: any = window;
    let parentWindow: any = currentWindow.parent;

    while (currentWindow !== parentWindow) {
      currentWindow = parentWindow;
      parentWindow = currentWindow.parent;
    }

    return {currentWindow, parentWindow}
  }

  private sendLoadingProgress(progress?: any, status?: any) {
    const {parentWindow} = this.getWindows();

    parentWindow.document.dispatchEvent(new CustomEvent('ssapp:loading:progress', {
      detail: {
        progress,
        status
      }
    }));
  }

  private ssappEventHandler(e) {
    const data = e.detail || {};
    let iframe = this.element.querySelector("iframe");

    if (data.query === 'seed') {
      iframe.contentWindow.document.dispatchEvent(new CustomEvent(this.digestKeySsiHex, {
        detail: {
          seed: this.seed
        }
      }));
      return;
    }

    if (data.status === 'completed') {
      const signalFinishLoading = () => {
        this.sendLoadingProgress(100);
        iframe.removeEventListener('load', signalFinishLoading);
      };

      iframe.addEventListener('load', signalFinishLoading);
      iframe.contentWindow.location.reload();
    }
  }

  private getSWOnMessageHandler() {
    if (this.onServiceWorkerMessageHandler) {
      return this.onServiceWorkerMessageHandler;
    }

    /**
     * Listen for seed requests
     */
    this.onServiceWorkerMessageHandler = (e) => {
      if (!e.data || e.data.query !== 'seed') {
        return;
      }

      const swWorkerIdentity = e.data.identity;
      if (swWorkerIdentity === this.digestKeySsiHex) {
        e.source.postMessage({
          seed: this.seed
        });
      }
    };
    return this.onServiceWorkerMessageHandler;
  }

  private digestMessage(message) {
    // @ts-ignore
    const crypto = require("opendsu").loadApi("crypto");
    const hash = crypto.sha256(message);
    return hash;
  }

  private getQueryParams(){
    let queryParams = "";
    if (this.parsedParams)
      queryParams += Object.keys(this.parsedParams)
        .map((key) => key + "=" + this.parsedParams[key])
        .join('&');

    return queryParams ? '?' + encodeURI(queryParams) : '';
  }

  private getIFrameSrc(){
    let basePath;
    const {currentWindow} = this.getWindows();

    basePath = currentWindow.location.origin + currentWindow.location.pathname;
    basePath = basePath.replace("index.html", "")
    if (basePath[basePath.length - 1] !== '/')
      basePath += '/';

    // we are in a context in which SW are not enabled so the iframe must be identified by the seed
    const iframeKeySsi = $$.SSAPP_CONTEXT && $$.SSAPP_CONTEXT.BASE_URL && $$.SSAPP_CONTEXT.SEED ? this.seed : this.digestKeySsiHex;

    return basePath + "iframe/" + iframeKeySsi + this.getQueryParams();
  }

  render() {
    if (!this.seed)
      return;
    const iframeSrc = this.getIFrameSrc();
    console.log("Loading sssap in: " + iframeSrc);
    return (
      <iframe
        landing-page={this.landingPath}
        frameborder="0"
        style={{
          overflow: "hidden",
          height: "100%",
          width: "100%"
        }}
        src={iframeSrc} />
    )
  }
}
