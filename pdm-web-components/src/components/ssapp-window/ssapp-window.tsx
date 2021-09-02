import {Component, h, State, Element, Watch, Prop, EventEmitter, Event} from '@stencil/core';
import {getInstance} from "../../utils/SSAppInstancesRegistry";

declare const $$: any;

export type MatchResults ={
  path: string;
  url: string;
  isExact: boolean;
  params: {
    [key: string]: string;
  };
}

@Component({
  tag: 'ssapp-window',
  styleUrl: 'ssapp-window.css',
  shadow: false,
})
export class SsappWindow {

  @Element() element;

  @Prop({attribute: 'app-name', mutable: false, reflect: false}) appName: string;

  @Prop({attribute: "key-ssi", mutable: false, reflect: false}) seed: string = undefined;

  @Prop() landingPath: string;
  @Prop() params: string;

  @Prop() match: MatchResults;
  @Prop() refresh;

  @State() digestKeySsiHex;
  @State() parsedParams;

  private eventHandler;
  private componentInitialized = false;

  @Event()
  windowAction: EventEmitter

  connectedCallback() {
    navigator.serviceWorker.addEventListener('message', this.__getSWOnMessageHandler());
  }

  disconnectedCallback() {
    navigator.serviceWorker.removeEventListener('message', this.__getSWOnMessageHandler());
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
    getInstance().addSSAppReference(this.appName, iframe);

    this.eventHandler = this.__ssappEventHandler.bind(this);
    window.document.addEventListener(this.digestKeySsiHex, this.eventHandler);
    window.document.addEventListener(this.parsedParams, this.eventHandler);
    // NavigatinTrackerService.getInstance().listenForSSAppHistoryChanges();
  }

  @Watch("seed")
  @Watch("params")
  @Watch("match")
  @Watch("landingPath")
  @Watch("refresh")
  loadApp(callback?) {
    if (this.__hasRelevantMatchParams()) {
      this.seed = this.match.params.keySSI;
    }

    if (this.componentInitialized) {
      this.digestKeySsiHex = this.__digestMessage(this.seed);
      // NavigatinTrackerService.getInstance().setIdentity(this.digestKeySsiHex);
      if (typeof callback === "function") {
        callback();
      }

      if (this.params != null && this.params != undefined) {
        try{
          this.parsedParams = JSON.parse(this.params);
        }catch (e) {
          console.log("Attribute called 'params' could not be parsed.")
        }
      }
    }
  };

  ___sendLoadingProgress(progress?: any, status?: any) {
    let currentWindow: any = window;
    let parentWindow: any = currentWindow.parent;

    while (currentWindow !== parentWindow) {
      currentWindow = parentWindow;
      parentWindow = currentWindow.parent;
    }

    parentWindow.document.dispatchEvent(new CustomEvent('ssapp:loading:progress', {
      detail: {
        progress,
        status
      }
    }));
  }

  __onServiceWorkerMessageHandler: (e) => void;

  __hasRelevantMatchParams() {
    return this.match && this.match.params && this.match.params.keySSI;
  }

  __ssappEventHandler(e) {
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
        this.___sendLoadingProgress(100);
        iframe.removeEventListener('load', signalFinishLoading);
      };

      iframe.addEventListener('load', signalFinishLoading);
      iframe.contentWindow.location.reload();
    }
  }

  __getSWOnMessageHandler() {
    if (this.__onServiceWorkerMessageHandler) {
      return this.__onServiceWorkerMessageHandler;
    }

    /**
     * Listen for seed requests
     */
    this.__onServiceWorkerMessageHandler = (e) => {
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
    return this.__onServiceWorkerMessageHandler;
  }

  __digestMessage(message) {
    // @ts-ignore
    const crypto = require("opendsu").loadApi("crypto");
    const hash = crypto.sha256(message);
    return hash;
  }

  render() {
    let basePath;
    let parentWindow = window.parent;
    let currentWindow = window;

    try {
      while (currentWindow !== parentWindow) {
        basePath = parentWindow.location.origin + parentWindow.location.pathname;
        // @ts-ignore
        currentWindow = parentWindow;
        parentWindow = parentWindow.parent;
      }

    }
    catch (e) {
      console.log(`Error inside weird while`, e)
    }

    basePath = currentWindow.location.origin + currentWindow.location.pathname;
    basePath = basePath.replace("index.html", "")
    if (basePath[basePath.length - 1] !== '/')
      basePath += '/';

    let queryParams = "?";
    if (this.parsedParams)
      queryParams += Object.keys(this.parsedParams)
        .map((key) => key + "=" + this.parsedParams[key])
        .join('&');


    // we are in a context in which SW are not enabled so the iframe must be identified by the seed
    const iframeKeySsi = $$.SSAPP_CONTEXT && $$.SSAPP_CONTEXT.BASE_URL && $$.SSAPP_CONTEXT.SEED ? this.seed : this.digestKeySsiHex;

    const iframeSrc = basePath + "iframe/" + iframeKeySsi + (queryParams.length > 1 ? queryParams + "&" + this.refresh : "?" + this.refresh);
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
