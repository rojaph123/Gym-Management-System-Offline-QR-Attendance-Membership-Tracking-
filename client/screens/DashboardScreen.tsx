import React from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Spacing, BorderRadius } from "@/constants/theme";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Feather.glyphMap;
  color?: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const { theme } = useTheme();
  const accentColor = color || theme.primary;

  return (
    <Card style={{ ...styles.statCard, borderLeftColor: accentColor, borderLeftWidth: 4 }}>
      <View style={styles.statHeader}>
        <View style={[styles.iconContainer, { backgroundColor: accentColor + "20" }]}>
          <Feather name={icon} size={20} color={accentColor} />
        </View>
      </View>
      <ThemedText type="h2" style={styles.statValue}>
        {value}
      </ThemedText>
      <ThemedText style={[styles.statTitle, { color: theme.textSecondary }]}>
        {title}
      </ThemedText>
    </Card>
  );
}

export default function DashboardScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { 
    getActiveMembers, 
    getExpiredMembers, 
    getTodayAttendance, 
    getTodaySales,
    members 
  } = useApp();

  const activeMembers = getActiveMembers().length;
  const expiredMembers = getExpiredMembers().length;
  const todayCheckIns = getTodayAttendance().length;
  const todaySales = getTodaySales();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl },
      ]}
    >
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/gym-logo.jpg")}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <View style={styles.headerText}>
          <ThemedText type="h3">Powerlift Fitness Gym</ThemedText>
          <ThemedText style={{ color: theme.textSecondary }}>Dashboard Overview</ThemedText>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Active Members"
          value={activeMembers}
          icon="users"
          color={theme.success}
        />
        <StatCard
          title="Expired Members"
          value={expiredMembers}
          icon="user-x"
          color={theme.warning}
        />
        <StatCard
          title="Today Check-ins"
          value={todayCheckIns}
          icon="log-in"
          color={theme.primary}
        />
        <StatCard
          title="Today Sales"
          value={`₱${todaySales.toLocaleString()}`}
          icon="dollar-sign"
          color={theme.success}
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Quick Stats
        </ThemedText>
        <Card>
          <View style={styles.quickStatRow}>
            <ThemedText style={{ color: theme.textSecondary }}>Total Registered Members</ThemedText>
            <ThemedText type="h4">{members.length}</ThemedText>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.quickStatRow}>
            <ThemedText style={{ color: theme.textSecondary }}>Subscription Rate</ThemedText>
            <ThemedText type="h4">
              {members.length > 0 ? Math.round((activeMembers / members.length) * 100) : 0}%
            </ThemedText>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
    gap: Spacing.lg,
  },
  headerLogo: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
  },
  headerText: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    borderRadius: BorderRadius.lg,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    marginBottom: Spacing.xs,
  },
  statTitle: {
    fontSize: 13,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  quickStatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
});
