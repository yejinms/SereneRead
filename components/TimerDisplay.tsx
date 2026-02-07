import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors } from '../theme';

const { height: screenHeight } = Dimensions.get('window');
const fontSize = screenHeight < 700 ? 112 : 128;
const colonSize = Math.round(fontSize * 0.48);

interface TimerDisplayProps {
  secondsRemaining: number;
  isRunning: boolean;
}

export default function TimerDisplay({ secondsRemaining, isRunning }: TimerDisplayProps) {
  const minutes = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const format = (n: number) => String(n).padStart(2, '0');

  const scale = React.useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.timing(scale, {
      toValue: isRunning ? 1.05 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isRunning]);

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.inner, { transform: [{ scale }] }]}>
        <View style={styles.row}>
          <Text style={[styles.number, { fontSize, lineHeight: fontSize + 8 }]}>{format(minutes)}</Text>
          <Text style={[styles.colon, { fontSize: colonSize }]}>:</Text>
          <Text style={[styles.number, { fontSize, lineHeight: fontSize + 8 }]}>{format(secs)}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 28,
    paddingBottom: 0,
    overflow: 'visible',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  number: {
    fontFamily: 'InstrumentSerif_400Regular',
    letterSpacing: -3,
    color: colors.stone[800],
    minWidth: 76,
    textAlign: 'center',
    includeFontPadding: false,
  },
  colon: {
    fontFamily: 'InstrumentSerif_400Regular',
    color: colors.stone[600],
    opacity: 0.4,
    marginHorizontal: 2,
  },
});
