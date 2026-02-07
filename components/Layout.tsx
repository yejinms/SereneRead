import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors } from '../theme';

const { width, height } = Dimensions.get('window');

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <View style={styles.container}>
      {/* Mesh Gradient Background Layer */}
      <View style={styles.backgroundLayer}>
        <LinearGradient
          colors={[
            colors.pastel.cream,
            colors.pastel.blush,
            colors.pastel.coral,
            colors.pastel.apricot,
            colors.pastel.cream,
          ]}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        
        {/* 오렌지/레드/핑크 계열 오브 - 밝고 따뜻하게 */}
        <LinearGradient
          colors={[colors.pastel.peach, 'transparent']}
          style={[styles.orb, styles.orbPeach]}
          start={{ x: 0.2, y: 0.2 }}
          end={{ x: 0.8, y: 0.8 }}
        />
        <LinearGradient
          colors={[colors.pastel.coral, 'transparent']}
          style={[styles.orb, styles.orbCoral]}
          start={{ x: 0.6, y: 0.6 }}
          end={{ x: 0.2, y: 0.2 }}
        />
        <LinearGradient
          colors={[colors.pastel.apricot, 'transparent']}
          style={[styles.orb, styles.orbApricot]}
          start={{ x: 0.8, y: 0.8 }}
          end={{ x: 0.2, y: 0.2 }}
        />
        <LinearGradient
          colors={[colors.pastel.blush, 'transparent']}
          style={[styles.orb, styles.orbBlush]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
        />

        {/* Blur overlay - 부드럽게 블렌딩 */}
        <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
      </View>

      <View style={styles.main}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pastel.cream,
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: 9999,
    opacity: 0.4,
  },
  orbPeach: {
    top: -width * 0.15,
    left: -width * 0.15,
  },
  orbCoral: {
    top: height * 0.3,
    right: -width * 0.2,
    width: width,
    height: width,
  },
  orbApricot: {
    bottom: -width * 0.25,
    left: -width * 0.1,
  },
  orbBlush: {
    top: height * 0.08,
    left: width * 0.2,
  },
  main: {
    flex: 1,
    zIndex: 10,
  },
});
