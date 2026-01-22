import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Typography } from "@/constants/theme";

interface TimerProps {
  duration: number;
  onComplete: () => void;
  isActive: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function Timer({ duration, onComplete, isActive }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const progress = useSharedValue(1);

  const size = 60;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(duration);
      progress.value = 1;
      return;
    }

    progress.value = withTiming(0, {
      duration: duration * 1000,
      easing: Easing.linear,
    });

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, duration]);

  const animatedCircleStyle = useAnimatedStyle(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const getColor = () => {
    if (timeLeft <= 5) return GameColors.wrong;
    if (timeLeft <= 10) return GameColors.warning;
    return GameColors.secondary;
  };

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={animatedCircleStyle}
        />
      </Svg>
      <View style={styles.textContainer}>
        <ThemedText style={[styles.time, { color: getColor() }]}>
          {timeLeft}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  svg: {
    position: "absolute",
  },
  textContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  time: {
    ...Typography.h4,
    fontWeight: "700",
  },
});
