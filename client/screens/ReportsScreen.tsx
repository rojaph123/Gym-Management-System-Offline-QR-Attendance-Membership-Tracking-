import React, { useState, useMemo } from "react";
import { View, StyleSheet, ScrollView, Pressable, Share, Platform, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";

import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Spacing, BorderRadius } from "@/constants/theme";

type FilterPeriod = "daily" | "weekly" | "monthly" | "annual";

const SALE_TYPE_LABELS: Record<string, string> = {
  membership_fee: "Membership Fee",
  monthly_student: "Monthly (Student)",
  monthly_regular: "Monthly (Regular)",
  monthly_senior: "Monthly (Senior)",
  session_member: "Session (Member)",
  session_nonmember: "Session (Non-member)",
};

export default function ReportsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { sales, attendance, members } = useApp();
  const [filter, setFilter] = useState<FilterPeriod>("daily");

  const getDateRange = (period: FilterPeriod): { start: string; end: string } => {
    const today = new Date();
    const end = today.toISOString().split("T")[0];
    let start: string;

    switch (period) {
      case "daily":
        start = end;
        break;
      case "weekly":
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        start = weekAgo.toISOString().split("T")[0];
        break;
      case "monthly":
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        start = monthAgo.toISOString().split("T")[0];
        break;
      case "annual":
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        start = yearAgo.toISOString().split("T")[0];
        break;
      default:
        start = end;
    }

    return { start, end };
  };

  const { filteredSales, filteredAttendance, totalEarnings, salesByType, earningsByDate } = useMemo(() => {
    const { start, end } = getDateRange(filter);
    
    const fSales = sales.filter(s => s.date >= start && s.date <= end);
    const fAttendance = attendance.filter(a => a.date >= start && a.date <= end);
    
    const total = fSales.reduce((sum, s) => sum + s.amount, 0);
    
    const byType: Record<string, number> = {};
    fSales.forEach(s => {
      byType[s.type] = (byType[s.type] || 0) + s.amount;
    });

    const byDate: Record<string, number> = {};
    fSales.forEach(s => {
      byDate[s.date] = (byDate[s.date] || 0) + s.amount;
    });

    return {
      filteredSales: fSales,
      filteredAttendance: fAttendance,
      totalEarnings: total,
      salesByType: byType,
      earningsByDate: byDate,
    };
  }, [sales, attendance, filter]);

  const maxEarning = useMemo(() => {
    const values = Object.values(earningsByDate);
    return values.length > 0 ? Math.max(...values) : 1;
  }, [earningsByDate]);

  const generateCSV = (): string => {
    let csv = "Date,Type,Amount,Note\n";
    filteredSales.forEach(s => {
      csv += `${s.date},${SALE_TYPE_LABELS[s.type] || s.type},${s.amount},"${s.note}"\n`;
    });
    return csv;
  };

  const handleExportCSV = async () => {
    const csv = generateCSV();
    
    if (Platform.OS === "web") {
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gym_report_${filter}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    try {
      await Share.share({
        message: csv,
        title: `gym_report_${filter}.csv`,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to export report.");
    }
  };

  const handleExportMembersList = async () => {
    let csv = "ID,First Name,Last Name,Age,Gender,Email,Phone,Membership Type,Status,Subscription End\n";
    members.forEach(m => {
      const today = new Date().toISOString().split("T")[0];
      const status = m.subscription_end && m.subscription_end >= today ? "Active" : "Expired";
      csv += `${m.id},${m.firstname},${m.lastname},${m.age},${m.gender},${m.email},${m.phone},${m.membership_type},${status},${m.subscription_end || "N/A"}\n`;
    });

    if (Platform.OS === "web") {
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "members_list.csv";
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    try {
      await Share.share({
        message: csv,
        title: "members_list.csv",
      });
    } catch {
      Alert.alert("Error", "Failed to export members list.");
    }
  };

  const renderFilterButton = (period: FilterPeriod, label: string) => (
    <Pressable
      onPress={() => setFilter(period)}
      style={[
        styles.filterButton,
        { borderColor: theme.border },
        filter === period && { backgroundColor: theme.primary, borderColor: theme.primary },
      ]}
    >
      <ThemedText style={filter === period ? { color: "#FFFFFF" } : undefined}>
        {label}
      </ThemedText>
    </Pressable>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl },
      ]}
    >
      <ThemedText type="h3" style={styles.title}>
        Reports
      </ThemedText>

      <View style={styles.filterRow}>
        {renderFilterButton("daily", "Daily")}
        {renderFilterButton("weekly", "Weekly")}
        {renderFilterButton("monthly", "Monthly")}
        {renderFilterButton("annual", "Annual")}
      </View>

      <View style={styles.summaryRow}>
        <Card style={{ ...styles.summaryCard, borderLeftColor: theme.success, borderLeftWidth: 4 }}>
          <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
            Total Earnings
          </ThemedText>
          <ThemedText type="h3">₱{totalEarnings.toLocaleString()}</ThemedText>
        </Card>
        <Card style={{ ...styles.summaryCard, borderLeftColor: theme.primary, borderLeftWidth: 4 }}>
          <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
            Total Attendance
          </ThemedText>
          <ThemedText type="h3">{filteredAttendance.length}</ThemedText>
        </Card>
      </View>

      <Card style={styles.chartCard}>
        <ThemedText type="h4" style={styles.chartTitle}>
          Earnings Overview
        </ThemedText>
        {Object.keys(earningsByDate).length > 0 ? (
          <View style={styles.chartContainer}>
            {Object.entries(earningsByDate)
              .sort(([a], [b]) => a.localeCompare(b))
              .slice(-7)
              .map(([date, amount]) => (
                <View key={date} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${(amount / maxEarning) * 100}%`,
                          backgroundColor: theme.primary,
                        },
                      ]}
                    />
                  </View>
                  <ThemedText style={[styles.barLabel, { color: theme.textSecondary }]}>
                    {date.slice(5)}
                  </ThemedText>
                </View>
              ))}
          </View>
        ) : (
          <ThemedText style={{ color: theme.textSecondary, textAlign: "center", paddingVertical: Spacing.xl }}>
            No data for selected period
          </ThemedText>
        )}
      </Card>

      <Card style={styles.breakdownCard}>
        <ThemedText type="h4" style={styles.breakdownTitle}>
          Sales Breakdown
        </ThemedText>
        {Object.entries(salesByType).length > 0 ? (
          Object.entries(salesByType).map(([type, amount]) => (
            <View key={type} style={styles.breakdownRow}>
              <ThemedText>{SALE_TYPE_LABELS[type] || type}</ThemedText>
              <ThemedText style={{ fontWeight: "600" }}>₱{amount.toLocaleString()}</ThemedText>
            </View>
          ))
        ) : (
          <ThemedText style={{ color: theme.textSecondary }}>
            No sales for selected period
          </ThemedText>
        )}
      </Card>

      <View style={styles.exportSection}>
        <ThemedText type="h4" style={styles.exportTitle}>
          Export Reports
        </ThemedText>
        <View style={styles.exportButtons}>
          <Pressable
            onPress={handleExportCSV}
            style={[styles.exportButton, { backgroundColor: theme.backgroundSecondary }]}
          >
            <Feather name="download" size={18} color={theme.text} />
            <ThemedText>Sales Report (CSV)</ThemedText>
          </Pressable>
          <Pressable
            onPress={handleExportMembersList}
            style={[styles.exportButton, { backgroundColor: theme.backgroundSecondary }]}
          >
            <Feather name="users" size={18} color={theme.text} />
            <ThemedText>Members List (CSV)</ThemedText>
          </Pressable>
        </View>
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
  title: {
    marginBottom: Spacing.xl,
  },
  filterRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing["2xl"],
    flexWrap: "wrap",
  },
  filterButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  summaryCard: {
    flex: 1,
    padding: Spacing.lg,
  },
  summaryLabel: {
    marginBottom: Spacing.xs,
  },
  chartCard: {
    marginBottom: Spacing["2xl"],
    padding: Spacing.xl,
  },
  chartTitle: {
    marginBottom: Spacing.xl,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 150,
    alignItems: "flex-end",
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
  },
  barWrapper: {
    flex: 1,
    width: "60%",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    marginTop: Spacing.xs,
  },
  breakdownCard: {
    marginBottom: Spacing["2xl"],
    padding: Spacing.xl,
  },
  breakdownTitle: {
    marginBottom: Spacing.lg,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
  },
  exportSection: {
    marginBottom: Spacing.xl,
  },
  exportTitle: {
    marginBottom: Spacing.lg,
  },
  exportButtons: {
    gap: Spacing.md,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
});
