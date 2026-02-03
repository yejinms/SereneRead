import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../theme';

const { width } = Dimensions.get('window');

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.blob, styles.blobRose]} />
      <View style={[styles.blob, styles.blobEmerald]} />
      <View style={[styles.blob, styles.blobAmber]} />
      <View style={styles.overlay} />
      <View style={styles.main}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  blob: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.5,
  },
  blobRose: {
    top: '-15%',
    left: '-10%',
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: colors.rose[200],
  },
  blobEmerald: {
    bottom: '-15%',
    right: '-10%',
    width: width * 0.7,
    height: width * 0.7,
    backgroundColor: colors.emerald[100],
  },
  blobAmber: {
    top: '20%',
    right: '-15%',
    width: width * 0.4,
    height: width * 0.4,
    backgroundColor: colors.amber[100],
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  main: {
    flex: 1,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    zIndex: 10,
  },
});
