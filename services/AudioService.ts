
import { ASMRType } from '../types';

class AudioService {
  private audioContext: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;

  private initContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private createWhiteNoise(): AudioBuffer {
    const bufferSize = 2 * this.audioContext!.sampleRate;
    const buffer = this.audioContext!.createBuffer(1, bufferSize, this.audioContext!.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private createBrownNoise(): AudioBuffer {
    const bufferSize = 2 * this.audioContext!.sampleRate;
    const buffer = this.audioContext!.createBuffer(1, bufferSize, this.audioContext!.sampleRate);
    const output = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // volume compensation
    }
    return buffer;
  }

  private createPinkNoise(): AudioBuffer {
    const bufferSize = 2 * this.audioContext!.sampleRate;
    const buffer = this.audioContext!.createBuffer(1, bufferSize, this.audioContext!.sampleRate);
    const output = buffer.getChannelData(0);
    let b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11; // volume compensation
      b6 = white * 0.115926;
    }
    return buffer;
  }

  public play(type: ASMRType, volume: number = 0.1) {
    this.stop();
    if (type === 'none') return;

    this.initContext();
    if (this.audioContext!.state === 'suspended') {
      this.audioContext!.resume();
    }

    let buffer: AudioBuffer;
    switch (type) {
      case 'white': buffer = this.createWhiteNoise(); break;
      case 'brown': buffer = this.createBrownNoise(); break;
      case 'pink': buffer = this.createPinkNoise(); break;
      default: return;
    }

    const source = this.audioContext!.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    this.gainNode = this.audioContext!.createGain();
    this.gainNode.gain.setValueAtTime(volume, this.audioContext!.currentTime);

    source.connect(this.gainNode);
    this.gainNode.connect(this.audioContext!.destination);

    source.start();
    this.noiseNode = source;
  }

  public stop() {
    if (this.noiseNode) {
      try {
        (this.noiseNode as AudioBufferSourceNode).stop();
      } catch (e) {}
      this.noiseNode = null;
    }
  }

  public updateVolume(volume: number) {
    if (this.gainNode && this.audioContext) {
      this.gainNode.gain.setTargetAtTime(volume, this.audioContext.currentTime, 0.1);
    }
  }
}

export const audioService = new AudioService();
