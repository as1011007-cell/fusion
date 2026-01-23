import React, { useEffect } from "react";
import { StyleSheet, Dimensions, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from "react-native-reanimated";

import { useTheme, ThemeId } from "@/context/ThemeContext";

const { width, height } = Dimensions.get("window");

type ShapeType = "circle" | "star" | "leaf" | "diamond" | "wave";

interface ElementProps {
  size: number;
  color: string;
  initialX: number;
  initialY: number;
  duration: number;
  shape: ShapeType;
  rotation?: number;
}

function FloatingElement({ size, color, initialX, initialY, duration, shape, rotation = 0 }: ElementProps) {
  const progress = useSharedValue(0);
  const rotateValue = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    if (shape === "leaf" || shape === "star") {
      rotateValue.value = withRepeat(
        withSequence(
          withTiming(15, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(-15, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [0, -40]);
    const translateX = interpolate(progress.value, [0, 0.5, 1], [0, 20, 0]);
    const scale = interpolate(progress.value, [0, 0.5, 1], [1, 1.15, 1]);
    const opacity = interpolate(progress.value, [0, 0.5, 1], [0.25, 0.5, 0.25]);

    return {
      transform: [
        { translateY },
        { translateX },
        { scale },
        { rotate: `${rotation + rotateValue.value}deg` },
      ],
      opacity,
    };
  });

  const getShapeStyle = () => {
    switch (shape) {
      case "star":
        return {
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: 2,
          transform: [{ rotate: "45deg" }],
        };
      case "leaf":
        return {
          width: size,
          height: size * 1.5,
          backgroundColor: color,
          borderRadius: size,
          borderTopLeftRadius: 0,
          borderBottomRightRadius: 0,
        };
      case "diamond":
        return {
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: size / 6,
          transform: [{ rotate: "45deg" }],
        };
      case "wave":
        return {
          width: size * 1.5,
          height: size,
          backgroundColor: color,
          borderRadius: size,
          borderTopLeftRadius: size * 2,
          borderTopRightRadius: size * 2,
        };
      default:
        return {
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: size / 2,
        };
    }
  };

  return (
    <Animated.View
      style={[
        styles.element,
        { left: initialX, top: initialY },
        getShapeStyle(),
        animatedStyle,
      ]}
    />
  );
}

export function FloatingBubbles() {
  const { currentTheme } = useTheme();
  const themeId = currentTheme.id as ThemeId;
  const colors = currentTheme.colors;

  const getThemeElements = (): ElementProps[] => {
    const circle: ShapeType = "circle";
    const wave: ShapeType = "wave";
    const leaf: ShapeType = "leaf";
    const star: ShapeType = "star";
    const diamond: ShapeType = "diamond";

    switch (themeId) {
      case "electric":
        return [
          { size: 100, color: colors.primary + "30", initialX: -30, initialY: height * 0.2, duration: 4000, shape: circle },
          { size: 80, color: colors.secondary + "25", initialX: width - 50, initialY: height * 0.15, duration: 5000, shape: circle },
          { size: 60, color: colors.accent + "20", initialX: width * 0.3, initialY: height * 0.7, duration: 3500, shape: circle },
          { size: 120, color: colors.primary + "15", initialX: width - 80, initialY: height * 0.6, duration: 4500, shape: circle },
          { size: 50, color: colors.secondary + "30", initialX: 20, initialY: height * 0.5, duration: 3000, shape: circle },
          { size: 40, color: colors.accent + "25", initialX: width * 0.6, initialY: height * 0.3, duration: 3800, shape: circle },
        ];

      case "sunset":
        return [
          { size: 120, color: colors.primary + "25", initialX: -40, initialY: height * 0.15, duration: 5000, shape: circle },
          { size: 90, color: colors.accent + "30", initialX: width - 60, initialY: height * 0.2, duration: 4500, shape: circle },
          { size: 70, color: colors.secondary + "20", initialX: width * 0.4, initialY: height * 0.65, duration: 4000, shape: circle },
          { size: 100, color: colors.primary + "15", initialX: width - 100, initialY: height * 0.55, duration: 5500, shape: circle },
          { size: 60, color: colors.accent + "25", initialX: 30, initialY: height * 0.45, duration: 3500, shape: circle },
          { size: 80, color: "#FF8C00" + "20", initialX: width * 0.7, initialY: height * 0.35, duration: 4200, shape: circle },
        ];

      case "ocean":
        return [
          { size: 60, color: colors.primary + "30", initialX: 20, initialY: height * 0.2, duration: 3000, shape: wave },
          { size: 50, color: colors.secondary + "25", initialX: width - 80, initialY: height * 0.25, duration: 3500, shape: circle },
          { size: 40, color: colors.accent + "30", initialX: width * 0.3, initialY: height * 0.6, duration: 2800, shape: circle },
          { size: 70, color: colors.primary + "20", initialX: width - 100, initialY: height * 0.5, duration: 4000, shape: wave },
          { size: 35, color: colors.secondary + "35", initialX: 50, initialY: height * 0.4, duration: 2500, shape: circle },
          { size: 45, color: colors.accent + "25", initialX: width * 0.6, initialY: height * 0.7, duration: 3200, shape: circle },
          { size: 55, color: colors.primary + "20", initialX: width * 0.5, initialY: height * 0.3, duration: 3800, shape: wave },
        ];

      case "forest":
        return [
          { size: 50, color: colors.primary + "30", initialX: -20, initialY: height * 0.2, duration: 4500, shape: leaf, rotation: -30 },
          { size: 40, color: colors.secondary + "25", initialX: width - 40, initialY: height * 0.15, duration: 5000, shape: leaf, rotation: 30 },
          { size: 35, color: colors.accent + "30", initialX: width * 0.25, initialY: height * 0.65, duration: 4000, shape: leaf, rotation: -45 },
          { size: 55, color: colors.primary + "20", initialX: width - 70, initialY: height * 0.55, duration: 5500, shape: leaf, rotation: 20 },
          { size: 30, color: colors.secondary + "35", initialX: 40, initialY: height * 0.45, duration: 3800, shape: leaf, rotation: -15 },
          { size: 45, color: "#2ED573" + "25", initialX: width * 0.7, initialY: height * 0.3, duration: 4800, shape: leaf, rotation: 45 },
        ];

      case "galaxy":
        return [
          { size: 8, color: colors.primary + "60", initialX: 30, initialY: height * 0.15, duration: 2500, shape: star },
          { size: 12, color: colors.secondary + "50", initialX: width - 50, initialY: height * 0.2, duration: 3000, shape: star },
          { size: 6, color: colors.accent + "70", initialX: width * 0.4, initialY: height * 0.3, duration: 2200, shape: star },
          { size: 10, color: colors.primary + "55", initialX: width - 100, initialY: height * 0.5, duration: 2800, shape: star },
          { size: 14, color: colors.secondary + "45", initialX: 60, initialY: height * 0.6, duration: 3200, shape: star },
          { size: 8, color: colors.accent + "60", initialX: width * 0.7, initialY: height * 0.4, duration: 2600, shape: star },
          { size: 50, color: colors.primary + "15", initialX: width * 0.2, initialY: height * 0.25, duration: 5000, shape: diamond },
          { size: 40, color: colors.secondary + "10", initialX: width * 0.8, initialY: height * 0.65, duration: 5500, shape: diamond },
          { size: 6, color: "#FFA502" + "70", initialX: width * 0.5, initialY: height * 0.7, duration: 2400, shape: star },
          { size: 10, color: colors.primary + "50", initialX: width * 0.15, initialY: height * 0.45, duration: 2900, shape: star },
        ];

      default:
        return [
          { size: 100, color: colors.primary + "30", initialX: -30, initialY: height * 0.2, duration: 4000, shape: circle },
          { size: 80, color: colors.secondary + "25", initialX: width - 50, initialY: height * 0.15, duration: 5000, shape: circle },
        ];
    }
  };

  const elements = getThemeElements();

  return (
    <View style={styles.container} pointerEvents="none">
      {elements.map((element, index) => (
        <FloatingElement
          key={`${themeId}-${index}`}
          size={element.size}
          color={element.color}
          initialX={element.initialX}
          initialY={element.initialY}
          duration={element.duration}
          shape={element.shape}
          rotation={element.rotation}
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
  element: {
    position: "absolute",
  },
});
