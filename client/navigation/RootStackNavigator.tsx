import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "@/screens/HomeScreen";
import GameSetupScreen from "@/screens/GameSetupScreen";
import GamePlayScreen from "@/screens/GamePlayScreen";
import ResultsScreen from "@/screens/ResultsScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import ShopScreen from "@/screens/ShopScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import PartySetupScreen from "@/screens/PartySetupScreen";
import DailyChallengeScreen from "@/screens/DailyChallengeScreen";
import MultiplayerLobbyScreen from "@/screens/MultiplayerLobbyScreen";
import MultiplayerGameScreen from "@/screens/MultiplayerGameScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { GameColors } from "@/constants/theme";

export type RootStackParamList = {
  Home: undefined;
  GameSetup: undefined;
  GamePlay: undefined;
  Results: undefined;
  Profile: undefined;
  Shop: undefined;
  Settings: undefined;
  PartySetup: undefined;
  DailyChallenge: undefined;
  MultiplayerLobby: undefined;
  MultiplayerGame: undefined;
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
      <Stack.Screen
        name="Shop"
        component={ShopScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen name="PartySetup" component={PartySetupScreen} />
      <Stack.Screen name="DailyChallenge" component={DailyChallengeScreen} />
      <Stack.Screen name="MultiplayerLobby" component={MultiplayerLobbyScreen} />
      <Stack.Screen name="MultiplayerGame" component={MultiplayerGameScreen} />
    </Stack.Navigator>
  );
}
