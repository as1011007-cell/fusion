import React, { useEffect } from "react";
import { StyleSheet, Dimensions, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";

import { GameColors } from "@/constants/theme";

const { width, height } = Dimensions.get("window");

interface BubbleProps {
  size: number;
  color: string;
  initialX: number;
  initialY: number;
  duration: number;
  delay: number;
}

function Bubble({ size, color, initialX, initialY, duration, delay }: BubbleProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [0, -30]);
    const translateX = interpolate(progress.value, [0, 0.5, 1], [0, 15, 0]);
    const scale = interpolate(progress.value, [0, 0.5, 1], [1, 1.1, 1]);
    const opacity = interpolate(progress.value, [0, 0.5, 1], [0.3, 0.6, 0.3]);

    return {
      transform: [
        { translateY },
        { translateX },
        { scale },
      ],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left: initialX,
          top: initialY,
        },
        animatedStyle,
      ]}
    />
  );
}

export function FloatingBubbles() {
  const bubbles = [
    { size: 100, color: GameColors.primary, x: -30, y: height * 0.2, duration: 4000, delay: 0 },
    { size: 80, color: GameColors.secondary, x: width - 50, y: height * 0.15, duration: 5000, delay: 500 },
    { size: 60, color: GameColors.accent, x: width * 0.3, y: height * 0.7, duration: 3500, delay: 1000 },
    { size: 120, color: GameColors.primary + "40", x: width - 80, y: height * 0.6, duration: 4500, delay: 1500 },
    { size: 50, color: GameColors.secondary + "60", x: 20, y: height * 0.5, duration: 3000, delay: 2000 },
  ];

  return (
    <View style={styles.container} pointerEvents="none">
      {bubbles.map((bubble, index) => (
        <Bubble
          key={index}
          size={bubble.size}
          color={bubble.color}
          initialX={bubble.x}
          initialY={bubble.y}
          duration={bubble.duration}
          delay={bubble.delay}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  bubble: {
    position: "absolute",
  },
});
