import * as Haptics from 'expo-haptics';

export function triggerHaptic(style: 'light' | 'medium' | 'heavy' = 'light') {
  try {
    Haptics.impactAsync(
      style === 'heavy' ? Haptics.ImpactFeedbackStyle.Heavy
      : style === 'medium' ? Haptics.ImpactFeedbackStyle.Medium
      : Haptics.ImpactFeedbackStyle.Light
    );
  } catch {}
}
