import React, { useState } from "react";
import { View, StyleSheet, Pressable, Modal, FlatList, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";

interface DatePickerModalProps {
  visible: boolean;
  selectedDate: string; // YYYY-MM-DD format
  onDateSelect: (date: string) => void;
  onClose: () => void;
  theme: any;
}

export function DatePickerModal({
  visible,
  selectedDate,
  onDateSelect,
  onClose,
  theme,
}: DatePickerModalProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = selectedDate ? new Date(selectedDate + "T00:00:00") : new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  // Generate days for the current month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{ date: string | null; day: number }> = [];

    // Add empty days for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, day: 0 });
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      days.push({ date: dateStr, day });
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date().toISOString().split("T")[0];
    onDateSelect(today);
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: "rgba(0, 0, 0, 0.5)" }]}>
        <View style={[styles.content, { backgroundColor: theme.backgroundDefault }]}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="h4">{monthName}</ThemedText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={theme.text} />
            </Pressable>
          </View>

          {/* Navigation */}
          <View style={styles.navigation}>
            <Pressable onPress={handlePrevMonth} style={[styles.navButton, { borderColor: theme.border }]}>
              <Feather name="chevron-left" size={20} color={theme.text} />
            </Pressable>
            <Pressable onPress={handleToday} style={[styles.todayButton, { backgroundColor: theme.primary }]}>
              <ThemedText style={{ color: "#FFFFFF", fontSize: 12 }}>Today</ThemedText>
            </Pressable>
            <Pressable onPress={handleNextMonth} style={[styles.navButton, { borderColor: theme.border }]}>
              <Feather name="chevron-right" size={20} color={theme.text} />
            </Pressable>
          </View>

          {/* Weekday Headers */}
          <View style={styles.weekdayHeader}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <View key={day} style={styles.weekdayCell}>
                <ThemedText style={[styles.weekdayText, { color: theme.textSecondary }]}>
                  {day}
                </ThemedText>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendar}>
            {days.map((item, index) => {
              const isSelected = item.date === selectedDate;
              const isToday = item.date === new Date().toISOString().split("T")[0];
              const isCurrentMonth = item.date !== null;

              return (
                <Pressable
                  key={index}
                  onPress={() => {
                    if (item.date) {
                      onDateSelect(item.date);
                    }
                  }}
                  style={[
                    styles.dayCell,
                    isSelected && { backgroundColor: theme.primary },
                    isToday && !isSelected && { borderColor: theme.primary, borderWidth: 2 },
                  ]}
                  disabled={!isCurrentMonth}
                >
                  <ThemedText
                    style={[
                      styles.dayText,
                      isSelected && { color: "#FFFFFF" },
                      !isCurrentMonth && { color: theme.textSecondary, opacity: 0.3 },
                    ]}
                  >
                    {item.day > 0 ? item.day : ""}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          {/* Selected Date Display */}
          <View style={styles.selectedDateContainer}>
            <ThemedText style={styles.selectedDateLabel}>Selected Date:</ThemedText>
            <ThemedText type="h4" style={[styles.selectedDate, { color: theme.primary }]}>
              {selectedDate ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }) : "No date selected"}
            </ThemedText>
          </View>

          {/* Close Button */}
          <Pressable
            onPress={onClose}
            style={[styles.closeButton2, { backgroundColor: theme.primary }]}
          >
            <ThemedText style={{ color: "#FFFFFF" }}>Done</ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: "90%",
    maxWidth: 380,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  navButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  todayButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  weekdayHeader: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: "600",
  },
  calendar: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: Spacing.lg,
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
  },
  selectedDateContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  selectedDateLabel: {
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  selectedDate: {
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton2: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
});
