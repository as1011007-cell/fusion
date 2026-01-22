import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing } from "@/constants/theme";

export default function ModalScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <ThemedText>Modal Screen</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GameColors.backgroundDark,
    paddingHorizontal: Spacing.lg,
  },
});
