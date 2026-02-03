import { Audio } from 'expo-av';
import { ASMRType } from '../types';

const noiseAssets: Record<Exclude<ASMRType, 'none'>, number> = {
  white: require('../assets/sounds/white.wav'),
  pink: require('../assets/sounds/pink.wav'),
  brown: require('../assets/sounds/brown.wav'),
};

class AudioService {
  private sound: Audio.Sound | null = null;

  async play(type: ASMRType, volume: number = 0.05) {
    await this.stop();
    if (type === 'none') return;
    const source = noiseAssets[type];
    if (!source) return;
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });
      const { sound } = await Audio.Sound.createAsync(source, { isLooping: true });
      await sound.setVolumeAsync(volume);
      await sound.playAsync();
      this.sound = sound;
    } catch (_) {}
  }

  async stop() {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
      } catch (_) {}
      this.sound = null;
    }
  }

  async updateVolume(volume: number) {
    if (this.sound) {
      try {
        await this.sound.setVolumeAsync(volume);
      } catch (_) {}
    }
  }
}

export const audioService = new AudioService();
