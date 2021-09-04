import {Component, Prop, State, Element, h, Event, EventEmitter, Method} from '@stencil/core';
import { VideoOverlay } from './overlays';
import audio from './audio';
import {BrowserMultiFormatReader, ChecksumException, FormatException, NotFoundException} from "@zxing/library";
import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";

const INTERVAL_ZXING_LOADED = 300;
const INTERVAL_BETWEEN_SCANS = 2000;
const DELAY_AFTER_RESULT = 500;
const STATUS = {
  IN_PROGRESS: "Camera detection in progress...",
  DONE: "Scan done.",
  NO_DETECTION: "No camera detected.",
  NO_PERMISSION: "No permission given"
}

const COMPATIBILITY = {
  STANDARD: "standard",
  IOS: "ios"
}

type CameraInterface = {
  isAvailable: () => boolean;
  bindStreamToElement: (element: HTMLElement, ...args: any[]) => void;
  getCameraStream: (...args: any[]) => any;
  closeCameraStream: (...args: any[]) => void;
  switchCamera: (...args: any[]) => void;
  getStatus: (...args: any[]) => string;
  hasPermissions: (...args: any[]) => string;
  getConstraints : (...args: any[]) => any;
}


@Component({
  tag: 'pdm-barcode-scanner',
  styleUrl: 'pdm-barcode-scanner.css',
  shadow: false,
})
export class PdmBarcodeScanner {

  @Element() element;

  /**
   * Through this event errors are passed
   */
  @Event({
    eventName: 'ssapp-send-error',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendErrorEvent: EventEmitter;

  /**
   * Through this event data is passed
   */
  @Event({
    eventName: 'ssapp-action',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendActionEvent: EventEmitter;

  @Prop({attribute: 'data', mutable: true}) data: any;

  @Prop({attribute: 'loader-type'}) loaderType?: string = SUPPORTED_LOADERS.bubbling;

  @Prop({attribute: 'compatibility-mode'}) compatibilityMode?: string = COMPATIBILITY.STANDARD;

  @Prop({attribute: 'timeout'}) timeout?: number = 500;

  @State() activeDeviceId: string | null = null;
  @State() status = STATUS.IN_PROGRESS;
  @State() isCameraAvailable = false;
  @State() hasPermissions = undefined;

  private codeReader = null;
  private overlay = null;
  private isScanDone = false;
  private isComponentDisconnected = false;

  private Camera : CameraInterface;

  constructor() {
    window.addEventListener('resize', _ => {
      this.cleanupOverlays();
      if (this.isCameraAvailable && this.hasPermissions)
        this.drawOverlays();
    });
    try {
      // @ts-ignore
      this.Camera = window.Native.Camera;
    } catch (e){
      throw new Error(`Missing native integration`);
    }
  }

  private drawOverlays() {
    if (!this.element) {
      return;
    }

    const videoElement = this.element.querySelector('#video');
    const scannerContainer = this.element.querySelector('#scanner-container');

    this.overlay = new VideoOverlay(scannerContainer, videoElement);
    this.overlay.createOverlaysCanvases('lensCanvas', 'overlayCanvas');
    this.overlay.drawLensCanvas();
  }

  private cleanupOverlays() {
    if (this.overlay) {
      this.overlay.removeOverlays();
    }
  }

  private publishResult(result){
    this.data = result;
    setTimeout(() => this.sendActionEvent.emit(result), this.timeout);
  }

  private async startScanning(videoElement) {

    if (!this.isScanDone) {
      this.cleanupOverlays();
      this.drawOverlays();

      const constraints = await this.Camera.getConstraints();

      this.codeReader.reset();
      this.codeReader.decodeFromConstraints(constraints, videoElement, (result, err) => {
        if (result && !this.isScanDone) {
          audio.play();
          this.overlay.drawOverlay(result.resultPoints);
          this.Camera.closeCameraStream();
          this.isScanDone = true;
          this.status = STATUS.DONE;
          setTimeout(_ => {
            this.codeReader.reset();
            this.overlay.removeOverlays();
            this.publishResult(result.text);
          }, DELAY_AFTER_RESULT);

        }
        if (err && !(err instanceof NotFoundException || err instanceof ChecksumException || err instanceof FormatException)) {
          console.error(err);
        }
      });
    }
  }

  @Method()
  async switchCamera() {
    this.Camera.switchCamera();
    this.isScanDone = false;
  }

  async componentWillLoad() {
    let tick = () => {
      if (!this.codeReader) {
        this.codeReader = new BrowserMultiFormatReader(null, INTERVAL_BETWEEN_SCANS);
      } else {
        setTimeout(tick, INTERVAL_ZXING_LOADED);
      }
    };

    tick();
  }

  async componentWillRender() {
    // No devices yet
    if (!this.isCameraAvailable) {
      const temp = await this.Camera.isAvailable();
      if (temp) {
        this.isCameraAvailable = true;
      } else {
        this.status = STATUS.NO_DETECTION;
      }
    }
  }

  async componentDidRender() {
    if (this.isCameraAvailable && !this.isComponentDisconnected) {
      const videoElement = this.element.querySelector('#video');
      if (videoElement){
        await this.Camera.bindStreamToElement(videoElement);
        await this.startScanning(videoElement);
      }
    }
  }

  async connectedCallback() {
    this.isComponentDisconnected = false;
  }

  async disconnectedCallback() {
    this.isComponentDisconnected = true;

    if (this.codeReader) {
      this.codeReader.reset();
    }
  }

  render() {

    const self = this;

    const getResults = function(status){
      const wrapInDiv = function(el){
        return (
          <div class="icon-wrapper ion-justify-content-center ion-align-items-center">
            {el}
          </div>
        )
      }

      const getIcon = function(){
        switch (status){
          case STATUS.IN_PROGRESS:
            return (<ion-icon class="result-icon spinning-result" color="primary" size="large" name="scan-circle-outline"></ion-icon>);
          case STATUS.DONE:
            return (<ion-icon class="result-icon" color="success" size="large" name="checkmark-circle-outline"></ion-icon>);
          case STATUS.NO_DETECTION:
            return (<ion-icon class="result-icon" color="waning" size="large" name="close-circle-outline"></ion-icon>);
          case STATUS.NO_PERMISSION:
            return (<ion-icon class="result-icon" color="danger" size="large" name="close-circle-outline"></ion-icon>);
        }
      }

      return wrapInDiv(getIcon());
    }

    const getContent = function(){
      if (!self.isCameraAvailable)
        return getResults(STATUS.IN_PROGRESS);
        if (!self.isScanDone)
          return <video id="video" muted autoplay playsinline={true}/>;
        return getResults(self.status);
    }

    return (
      <div class="barcodeWrapper">
        <div id="scanner-container" class="videoWrapper">
          {getContent()}
        </div>
      </div>
    )
  }
}
