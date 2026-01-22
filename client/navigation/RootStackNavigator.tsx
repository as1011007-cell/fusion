import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "@/screens/HomeScreen";
import GameSetupScreen from "@/screens/GameSetupScreen";
import GamePlayScreen from "@/screens/GamePlayScreen";
import ResultsScreen from "@/screens/ResultsScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { GameColors } from "@/constants/theme";

export type RootStackParamList = {
  Home: undefined;
  GameSetup: undefined;
  GamePlay: undefined;
  Results: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator
      screenOptions={{
        ...screenOptions,
        headerShown: false,
        contentStyle: {
          backgroundColor: GameColors.backgroundDark,
        },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="GameSetup" component={GameSetupScreen} />
      <Stack.Screen name="GamePlay" component={GamePlayScreen} />
      <Stack.Screen
        name="Results"
        component={ResultsScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ presentation: "modal" }}
      />
    </Stack.Navigator>
  );
}
