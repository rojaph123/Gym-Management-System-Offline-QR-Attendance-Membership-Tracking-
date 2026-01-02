import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useApp } from "@/context/AppContext";

import PinScreen from "@/screens/PinScreen";
import MainNavigator from "@/navigation/MainNavigator";
import MemberDetailScreen from "@/screens/MemberDetailScreen";
import MemberCardScreen from "@/screens/MemberCardScreen";
import DataBackupScreen from "@/screens/DataBackupScreen";

export type RootStackParamList = {
  Pin: undefined;
  Main: undefined;
  MemberDetail: { memberId: number };
  MemberCard: { memberId: number };
  DataBackup: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { isAuthenticated } = useApp();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!isAuthenticated ? (
        <Stack.Screen
          name="Pin"
          component={PinScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Main"
            component={MainNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MemberDetail"
            component={MemberDetailScreen}
            options={{
              headerTitle: "Member Details",
              presentation: "card",
            }}
          />
          <Stack.Screen
            name="MemberCard"
            component={MemberCardScreen}
            options={{
              headerTitle: "Membership Card",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="DataBackup"
            component={DataBackupScreen}
            options={{
              headerTitle: "Data Backup & Restore",
              presentation: "card",
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
