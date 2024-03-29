import MotionDetector from './motionDetector';
import VideoMonitor from './videoMonitor';

interface IVideoControllerType {
  node: HTMLElement;
  videoCanvas: HTMLCanvasElement;
  audioCanvas: HTMLCanvasElement;
  canvasMotion: HTMLCanvasElement;
  closeButton: HTMLElement;
  inputBrightness: HTMLInputElement;
  inputContrast: HTMLInputElement;
  illuminationOutput: HTMLElement;
}

export default class VideoController {
  public node: HTMLElement;
  public closeButton: HTMLElement;
  public inputBrightness: HTMLInputElement;
  public inputContrast: HTMLInputElement;
  public illuminationOutput: HTMLElement;

  public brightnessValue: number;
  public contrastValue: number;
  public illuminationValue: number | null;

  public intervalID: number | undefined;
  public audioIntervalID: number | undefined;
  public videoIntervalID: number | undefined;
  public motionIntervalID: number | undefined;

  public TICK: number;
  public ANALYSER_FFTSIZE: number;

  public mediaElement: VideoMonitor | null;
  public videoCanvas: HTMLCanvasElement;
  public videoCanvasCtx: CanvasRenderingContext2D;

  public canvasMotion: HTMLCanvasElement;

  public audioCanvas: HTMLCanvasElement;
  public audioCanvasCtx: CanvasRenderingContext2D;
  public audioCtx: AudioContext;
  public analyser: AnalyserNode;
  public audioNode: MediaElementAudioSourceNode | null;
  public sourceNodes: { [s: string]: MediaElementAudioSourceNode };
  public dataArrayAlt: Uint8Array;
  public bufferLengthAlt: number;

  public motionDetector: MotionDetector;

  constructor({
    node,
    videoCanvas,
    audioCanvas,
    canvasMotion,
    closeButton,
    inputBrightness,
    inputContrast,
    illuminationOutput,
  }: IVideoControllerType) {
    this.node = node;
    this.closeButton = closeButton;
    this.inputBrightness = inputBrightness;
    this.inputContrast = inputContrast;
    this.illuminationOutput = illuminationOutput;

    this.brightnessValue = 100;
    this.contrastValue = 100;
    this.illuminationValue = null;

    this.intervalID = undefined;
    this.videoIntervalID = undefined;
    this.audioIntervalID = undefined;
    this.motionIntervalID = undefined;

    this.TICK = 50;
    this.ANALYSER_FFTSIZE = 64;

    this.mediaElement = null;
    this.videoCanvas = videoCanvas;
    this.videoCanvasCtx = <CanvasRenderingContext2D>this.videoCanvas.getContext('2d');

    this.canvasMotion = canvasMotion;

    this.audioCanvas = audioCanvas;
    this.audioCanvasCtx = <CanvasRenderingContext2D>this.audioCanvas.getContext('2d');
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioCtx.createAnalyser();
    this.audioNode = null;
    this.sourceNodes = {};
    this.dataArrayAlt = new Uint8Array(0);
    this.bufferLengthAlt = 0;

    this.motionDetector = new MotionDetector(this.videoCanvas, this.canvasMotion);

    this.init();
  }

  public init(): void {
    this.analyser.fftSize = this.ANALYSER_FFTSIZE;

    // Закрывает popup на клавишу Esc
    window.addEventListener('keydown', (e) => {
      if (e.keyCode === 27) this.close();
    });
    this.closeButton.addEventListener('click', this.close.bind(this));

    this.inputBrightness.addEventListener('input', (e: Event) => {
      this.brightnessValue = +(e.target as HTMLInputElement).value;
      this.applyFilter();
    });

    this.inputContrast.addEventListener('input', (e) => {
      this.contrastValue = +(e.target as HTMLInputElement).value;
      this.applyFilter();
    });
  }

  public open(mediaElement: VideoMonitor): void {
    this.mediaElement = mediaElement;

    this.videoCanvas.width = mediaElement.video.offsetWidth;
    this.videoCanvas.height = mediaElement.video.offsetHeight;
    this.canvasMotion.width = mediaElement.video.offsetWidth;
    this.canvasMotion.height = mediaElement.video.offsetHeight;

    document.body.classList.add('opened-video');
    this.node.classList.add('open');
    this.mediaElement.container.classList.add('open');
    this.closeButton.classList.add('open');
    this.inputBrightness.value = this.mediaElement.brightnessValue.toString();
    this.inputContrast.value = this.mediaElement.contrastValue.toString();

    this.motionDetector.init(mediaElement.video.offsetWidth, mediaElement.video.offsetHeight);

    this.intervalID = setInterval(() => this.calcIllumination(), this.TICK);
    this.videoIntervalID = setInterval(() => this.drawVideo(), this.TICK);
    this.motionIntervalID = setInterval(() => this.motionDetector.update(), this.TICK);
    this.initAnalyser();
  }

  public close(): void {
    clearInterval(this.intervalID);
    clearInterval(this.videoIntervalID);
    clearInterval(this.motionIntervalID);
    clearInterval(this.audioIntervalID);
    if (this.audioNode) this.audioNode.disconnect(this.analyser);

    this.node.classList.remove('open');
    this.closeButton.classList.remove('open');
    document.body.classList.remove('opened-video');

    if (!this.mediaElement) return;
    this.mediaElement.container.classList.remove('open');
    this.mediaElement.close();
    this.mediaElement = null;
  }

  public applyFilter(): void {
    if (!this.mediaElement) return;

    this.mediaElement.video.style.filter =
      `brightness(${this.brightnessValue}%) contrast(${this.contrastValue}%)`;
    this.mediaElement.brightnessValue = this.brightnessValue;
    this.mediaElement.contrastValue = this.contrastValue;
  }

  /**
   * Рендерит видео-поток в canvas
   * Используется для вычисления уровня освещенности и определения движения
   */
  public drawVideo(): void {
    if (!this.mediaElement) return;

    const { width, height } = this.videoCanvas;
    this.videoCanvasCtx.drawImage(this.mediaElement.video, 0, 0, width, height);
  }

  /**
   * Рассчитывает уровень освещенности
   * по формуле https://www.w3.org/TR/AERT/#color-contrast
   */
  public calcIllumination(): void {
    const { width, height } = this.videoCanvas;
    const imageData = this.videoCanvasCtx.getImageData(0, 0, width, height);
    const { data } = imageData;

    let illumination = 0;
    for (let i = 0; i < data.length; i += 4) {
      illumination += (299 * data[i] + 587 * data[i + 1] + 114 * data[i + 2]) / 1000;
    }
    illumination /= data.length;
    this.illuminationValue = illumination;
    this.illuminationOutput.innerText = (Math.round(illumination * 10) / 10).toString();
  }

  public initAnalyser(): void {
    if (!this.mediaElement) return;

    const id = this.mediaElement.video.getAttribute('id') || '';
    if (!this.audioNode) {
      this.audioNode = this.audioCtx.createMediaElementSource(this.mediaElement.video);
      this.sourceNodes[id] = this.audioNode;
    }
    this.audioNode.connect(this.analyser).connect(this.audioCtx.destination);

    this.bufferLengthAlt = this.analyser.frequencyBinCount;
    this.dataArrayAlt = new Uint8Array(this.bufferLengthAlt);

    this.audioIntervalID = setInterval(this.audioVisualizing.bind(this), this.TICK);
  }

  /**
   * Рисует громкость звука в виде столбчатой диаграммы
   */
  public audioVisualizing(): void {
    const { width, height } = this.audioCanvas;

    this.analyser.getByteFrequencyData(this.dataArrayAlt);

    this.audioCanvasCtx.fillStyle = 'rgb(0, 0, 0)';
    this.audioCanvasCtx.clearRect(0, 0, width, height);

    const barWidth: number = (width / this.bufferLengthAlt) * 2.5;
    let barHeight: number = 0;
    let x: number = 0;

    for (let i = 0; i < this.bufferLengthAlt; i++) {
      barHeight = this.dataArrayAlt[i];

      this.audioCanvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ', 50, 50)';
      this.audioCanvasCtx.fillRect(x, height - barHeight / 2, barWidth, barHeight / 2);

      x += barWidth + 1;
    }
  }
}
