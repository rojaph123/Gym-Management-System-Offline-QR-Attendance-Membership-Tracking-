import React, { useState } from "react";
import { View, StyleSheet, useWindowDimensions, Pressable, ScrollView, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";

import DashboardScreen from "@/screens/DashboardScreen";
import RegisterScreen from "@/screens/RegisterScreen";
import ScanQRScreen from "@/screens/ScanQRScreen";
import MembersScreen from "@/screens/MembersScreen";
import ReportsScreen from "@/screens/ReportsScreen";
import SettingsScreen from "@/screens/SettingsScreen";

type NavItem = {
  key: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
};

const navItems: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: "grid" },
  { key: "register", label: "Register", icon: "user-plus" },
  { key: "scan", label: "Scan QR", icon: "camera" },
  { key: "members", label: "Members", icon: "users" },
  { key: "reports", label: "Reports", icon: "bar-chart-2" },
  { key: "settings", label: "Settings", icon: "settings" },
];

export default function MainNavigator() {
  const { theme, isDark } = useTheme();
  const { toggleTheme } = useApp();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  
  const [activeScreen, setActiveScreen] = useState("dashboard");
  const [isExpanded, setIsExpanded] = useState(width > 768);
  
  const sidebarWidth = useSharedValue(isExpanded ? Spacing.sidebarExpanded : Spacing.sidebarCollapsed);

  const toggleSidebar = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    sidebarWidth.value = withSpring(
      newExpanded ? Spacing.sidebarExpanded : Spacing.sidebarCollapsed,
      { damping: 20, stiffness: 200 }
    );
  };

  const animatedSidebarStyle = useAnimatedStyle(() => ({
    width: sidebarWidth.value,
  }));

  const renderScreen = () => {
    switch (activeScreen) {
      case "dashboard":
        return <DashboardScreen />;
      case "register":
        return <RegisterScreen />;
      case "scan":
        return <ScanQRScreen />;
      case "members":
        return <MembersScreen />;
      case "reports":
        return <ReportsScreen />;
      case "settings":
        return <SettingsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <Animated.View
        style={[
          styles.sidebar,
          { backgroundColor: theme.backgroundDefault },
          animatedSidebarStyle,
          { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.lg },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sidebarContent}
        >
          <Pressable onPress={toggleSidebar} style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/gym-logo.jpg")}
              style={styles.logo}
              resizeMode="contain"
            />
          </Pressable>

          <View style={styles.navItems}>
            {navItems.map((item) => {
              const isActive = activeScreen === item.key;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => setActiveScreen(item.key)}
                  style={[
                    styles.navItem,
                    isActive && { backgroundColor: theme.primary + "20" },
                  ]}
                >
                  <Feather
                    name={item.icon}
                    size={22}
                    color={isActive ? theme.primary : theme.textSecondary}
                  />
                  {isExpanded ? (
                    <ThemedText
                      style={[
                        styles.navLabel,
                        { color: isActive ? theme.primary : theme.text },
                      ]}
                    >
                      {item.label}
                    </ThemedText>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <Pressable
          onPress={toggleTheme}
          style={[styles.themeToggle, { borderTopColor: theme.border }]}
        >
          <Feather
            name={isDark ? "sun" : "moon"}
            size={22}
            color={theme.textSecondary}
          />
          {isExpanded ? (
            <ThemedText style={[styles.navLabel, { color: theme.textSecondary }]}>
              {isDark ? "Light Mode" : "Dark Mode"}
            </ThemedText>
          ) : null}
        </Pressable>
      </Animated.View>

      <View style={styles.content}>{renderScreen()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    borderRightWidth: 1,
    borderRightColor: "rgba(0,0,0,0.1)",
  },
  sidebarContent: {
    flex: 1,
  },
  logoContainer: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.sm,
  },
  navItems: {
    flex: 1,
    paddingTop: Spacing.xl,
    gap: Spacing.xs,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginHorizontal: Spacing.sm,
    gap: Spacing.md,
  },
  navLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  themeToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
    gap: Spacing.md,
  },
  content: {
    flex: 1,
  },
});
