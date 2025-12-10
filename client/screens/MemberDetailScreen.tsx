import React, { useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Image, Alert, TextInput, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useHeaderHeight } from "@react-navigation/elements";

import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type RouteParams = RouteProp<RootStackParamList, "MemberDetail">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MemberDetailScreen() {
  const { theme } = useTheme();
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { getMember, renewSubscription, paySession, attendance, priceSettings, deleteMember, updateMember } = useApp();

  const member = getMember(route.params.memberId);
  const [showDateModal, setShowDateModal] = useState(false);
  const [editingField, setEditingField] = useState<"start" | "end">("end");
  const [dateInput, setDateInput] = useState("");

  const isActive = useMemo(() => {
    if (!member?.subscription_end) return false;
    const today = new Date().toISOString().split("T")[0];
    return member.subscription_end >= today;
  }, [member?.subscription_end]);

  const memberAttendance = useMemo(() => {
    if (!member) return [];
    return attendance
      .filter((a) => a.member_id === member.id)
      .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
      .slice(0, 10);
  }, [member, attendance]);

  if (!member) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText>Member not found</ThemedText>
      </View>
    );
  }

  const handleRenew = () => {
    const priceKey = `${member.membership_type}_monthly` as keyof typeof priceSettings;
    const amount = priceSettings[priceKey] as number;
    
    Alert.alert(
      "Renew Subscription",
      `Renew monthly subscription for ₱${amount}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            renewSubscription(member.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Success", "Subscription renewed successfully!");
          },
        },
      ]
    );
  };

  const handlePaySession = () => {
    Alert.alert(
      "Pay Per Session",
      `Record session payment of ₱${priceSettings.session_member}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            paySession(member.id, true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Success", "Session payment recorded!");
          },
        },
      ]
    );
  };

  const handleViewCard = () => {
    navigation.navigate("MemberCard", { memberId: member.id });
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Member",
      `Are you sure you want to delete ${member.firstname} ${member.lastname}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteMember(member.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleEditDate = (field: "start" | "end") => {
    setEditingField(field);
    const currentDate = field === "start" ? member.subscription_start : member.subscription_end;
    setDateInput(currentDate || "");
    setShowDateModal(true);
  };

  const isValidDate = (dateString: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const handleSaveDate = () => {
    if (!isValidDate(dateInput)) {
      Alert.alert("Invalid Date", "Please enter a valid date in YYYY-MM-DD format (e.g., 2024-12-31)");
      return;
    }

    if (editingField === "start") {
      updateMember(member.id, { subscription_start: dateInput });
    } else {
      updateMember(member.id, { subscription_end: dateInput });
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowDateModal(false);
    Alert.alert("Success", `Subscription ${editingField} date updated!`);
  };

  const handleQuickExtend = (days: number) => {
    const currentEnd = member.subscription_end 
      ? new Date(member.subscription_end) 
      : new Date();
    
    const newEnd = new Date(currentEnd);
    newEnd.setDate(newEnd.getDate() + days);
    
    const newDateStr = newEnd.toISOString().split("T")[0];
    updateMember(member.id, { subscription_end: newDateStr });
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Success", `Subscription extended by ${days} days!`);
  };

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <View style={styles.header}>
          {member.photo ? (
            <Image source={{ uri: member.photo }} style={styles.photo} />
          ) : (
            <View style={[styles.photoPlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="user" size={40} color={theme.textSecondary} />
            </View>
          )}
          <ThemedText type="h2" style={styles.name}>
            {member.firstname} {member.lastname}
          </ThemedText>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isActive ? theme.success + "20" : theme.warning + "20" },
            ]}
          >
            <Feather
              name={isActive ? "check-circle" : "alert-circle"}
              size={16}
              color={isActive ? theme.success : theme.warning}
            />
            <ThemedText style={{ color: isActive ? theme.success : theme.warning, fontWeight: "500" }}>
              {isActive ? "Active" : "Expired"}
            </ThemedText>
          </View>
        </View>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <ThemedText style={{ color: theme.textSecondary }}>Membership Type</ThemedText>
            <ThemedText style={styles.infoValue}>
              {member.membership_type.charAt(0).toUpperCase() + member.membership_type.slice(1)}
            </ThemedText>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.infoRow}>
            <ThemedText style={{ color: theme.textSecondary }}>Age</ThemedText>
            <ThemedText style={styles.infoValue}>{member.age} years old</ThemedText>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.infoRow}>
            <ThemedText style={{ color: theme.textSecondary }}>Gender</ThemedText>
            <ThemedText style={styles.infoValue}>
              {member.gender.charAt(0).toUpperCase() + member.gender.slice(1)}
            </ThemedText>
          </View>
          {member.email ? (
            <>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <View style={styles.infoRow}>
                <ThemedText style={{ color: theme.textSecondary }}>Email</ThemedText>
                <ThemedText style={styles.infoValue}>{member.email}</ThemedText>
              </View>
            </>
          ) : null}
          {member.phone ? (
            <>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <View style={styles.infoRow}>
                <ThemedText style={{ color: theme.textSecondary }}>Phone</ThemedText>
                <ThemedText style={styles.infoValue}>{member.phone}</ThemedText>
              </View>
            </>
          ) : null}
        </Card>

        <Card style={styles.subscriptionCard}>
          <View style={styles.subscriptionHeader}>
            <ThemedText type="h4">Subscription</ThemedText>
          </View>
          
          <View style={styles.infoRow}>
            <ThemedText style={{ color: theme.textSecondary }}>Start Date</ThemedText>
            <View style={styles.dateRow}>
              <ThemedText style={styles.infoValue}>{member.subscription_start || "N/A"}</ThemedText>
              <Pressable 
                onPress={() => handleEditDate("start")} 
                style={[styles.editButton, { backgroundColor: theme.primary + "20" }]}
              >
                <Feather name="edit-2" size={14} color={theme.primary} />
              </Pressable>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.infoRow}>
            <ThemedText style={{ color: theme.textSecondary }}>End Date</ThemedText>
            <View style={styles.dateRow}>
              <ThemedText style={styles.infoValue}>{member.subscription_end || "N/A"}</ThemedText>
              <Pressable 
                onPress={() => handleEditDate("end")} 
                style={[styles.editButton, { backgroundColor: theme.primary + "20" }]}
              >
                <Feather name="edit-2" size={14} color={theme.primary} />
              </Pressable>
            </View>
          </View>

          <View style={styles.quickExtendSection}>
            <ThemedText style={[styles.quickExtendLabel, { color: theme.textSecondary }]}>
              Quick Extend:
            </ThemedText>
            <View style={styles.quickExtendButtons}>
              <Pressable 
                onPress={() => handleQuickExtend(7)} 
                style={[styles.quickExtendButton, { backgroundColor: theme.backgroundSecondary }]}
              >
                <ThemedText style={styles.quickExtendButtonText}>+7 days</ThemedText>
              </Pressable>
              <Pressable 
                onPress={() => handleQuickExtend(30)} 
                style={[styles.quickExtendButton, { backgroundColor: theme.backgroundSecondary }]}
              >
                <ThemedText style={styles.quickExtendButtonText}>+30 days</ThemedText>
              </Pressable>
              <Pressable 
                onPress={() => handleQuickExtend(90)} 
                style={[styles.quickExtendButton, { backgroundColor: theme.backgroundSecondary }]}
              >
                <ThemedText style={styles.quickExtendButtonText}>+90 days</ThemedText>
              </Pressable>
            </View>
          </View>
        </Card>

        <View style={styles.actionButtons}>
          <Pressable
            onPress={handleRenew}
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
          >
            <Feather name="refresh-cw" size={18} color="#FFFFFF" />
            <ThemedText style={styles.actionButtonText}>Renew Subscription</ThemedText>
          </Pressable>
          <Pressable
            onPress={handlePaySession}
            style={[styles.actionButton, { backgroundColor: theme.success }]}
          >
            <Feather name="dollar-sign" size={18} color="#FFFFFF" />
            <ThemedText style={styles.actionButtonText}>Pay Per Session</ThemedText>
          </Pressable>
          <Pressable
            onPress={handleViewCard}
            style={[styles.actionButton, { backgroundColor: theme.backgroundSecondary }]}
          >
            <Feather name="credit-card" size={18} color={theme.text} />
            <ThemedText>View Membership Card</ThemedText>
          </Pressable>
        </View>

        <Card style={styles.attendanceCard}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Recent Attendance
          </ThemedText>
          {memberAttendance.length > 0 ? (
            memberAttendance.map((a, index) => (
              <View key={a.id}>
                {index > 0 ? <View style={[styles.divider, { backgroundColor: theme.border }]} /> : null}
                <View style={styles.attendanceRow}>
                  <Feather name="log-in" size={16} color={theme.textSecondary} />
                  <ThemedText style={{ color: theme.textSecondary }}>{a.date}</ThemedText>
                  <ThemedText>{a.time}</ThemedText>
                </View>
              </View>
            ))
          ) : (
            <ThemedText style={{ color: theme.textSecondary }}>No attendance records</ThemedText>
          )}
        </Card>

        <Pressable onPress={handleDelete} style={styles.deleteButton}>
          <Feather name="trash-2" size={18} color={theme.error} />
          <ThemedText style={{ color: theme.error }}>Delete Member</ThemedText>
        </Pressable>
      </ScrollView>

      <Modal
        visible={showDateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="h4" style={styles.modalTitle}>
              Edit {editingField === "start" ? "Start" : "End"} Date
            </ThemedText>
            
            <ThemedText style={[styles.modalHint, { color: theme.textSecondary }]}>
              Enter date in YYYY-MM-DD format
            </ThemedText>
            
            <TextInput
              style={[
                styles.dateInput,
                { 
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                  borderColor: theme.border,
                }
              ]}
              value={dateInput}
              onChangeText={setDateInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numbers-and-punctuation"
              autoFocus
            />
            
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setShowDateModal(false)}
                style={[styles.modalButton, { backgroundColor: theme.backgroundSecondary }]}
              >
                <ThemedText>Cancel</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleSaveDate}
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
              >
                <ThemedText style={{ color: "#FFFFFF" }}>Save</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: Spacing.lg,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  name: {
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  infoCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.xl,
  },
  subscriptionCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.xl,
  },
  subscriptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  editButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  infoValue: {
    fontWeight: "500",
  },
  divider: {
    height: 1,
  },
  quickExtendSection: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  quickExtendLabel: {
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  quickExtendButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  quickExtendButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  quickExtendButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  actionButtons: {
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  attendanceCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.xl,
  },
  attendanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  modalTitle: {
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  modalHint: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  dateInput: {
    height: 50,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 18,
    textAlign: "center",
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
