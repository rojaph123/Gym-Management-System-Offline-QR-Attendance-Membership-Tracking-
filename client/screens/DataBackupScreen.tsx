import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system/legacy";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { useNavigation } from "@react-navigation/native";
import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { Card } from "@/components/Card";
import { Spacing, BorderRadius } from "@/constants/theme";

const LAST_BACKUP_KEY = "powerlift_last_backup_date";
// Use the legacy API from expo-file-system
const BACKUP_FOLDER = `${FileSystem.documentDirectory}PowerliftBackups/`;

export default function DataBackupScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const {
    members,
    attendance,
    sales,
    backupAllData,
    restoreFromBackup,
    refreshData,
  } = useApp();

  const [lastBackupDate, setLastBackupDate] = useState<string>("");
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");

  useEffect(() => {
    loadLastBackupDate();
    initializeBackupFolder();
  }, []);

  const initializeBackupFolder = async () => {
    try {
      const info = await FileSystem.getInfoAsync(BACKUP_FOLDER);
      if (!info.exists) {
        await FileSystem.makeDirectoryAsync(BACKUP_FOLDER, {
          intermediates: true,
        });
        console.log("[Backup] Created backup folder");
      }
    } catch (error) {
      console.error("[Backup] Failed to initialize backup folder:", error);
    }
  };

  const loadLastBackupDate = async () => {
    try {
      const date = await AsyncStorage.getItem(LAST_BACKUP_KEY);
      if (date) {
        setLastBackupDate(date);
      }
    } catch (error) {
      console.error("Failed to load last backup date:", error);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setIsBackingUp(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Generate backup data
      const backupData = await backupAllData();

      // Create backup filename with timestamp
      const timestamp = new Date();
      const dateString = timestamp.toISOString().split("T")[0];
      const timeString = timestamp.toTimeString().split(" ")[0].replace(/:/g, "-");
      const filename = `powerlift_backup_${dateString}_${timeString}.json`;

      // Save file to temporary location first
      const fileUri = `${BACKUP_FOLDER}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, backupData, {
        encoding: "utf8",
      });

      console.log("[Backup] File saved to:", fileUri);

      // Show share dialog to let user choose where to save
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: "Save Backup File",
          UTI: "public.json",
        });
      } else {
        Alert.alert(
          "Sharing Not Available",
          "Backup file created but sharing is not available. File saved to device storage."
        );
      }

      // Save backup date
      const formattedDate = timestamp.toLocaleDateString();
      await AsyncStorage.setItem(LAST_BACKUP_KEY, formattedDate);
      setLastBackupDate(formattedDate);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Success",
        `Backup created successfully!\n\nFile: ${filename}\n\nChoose where to save it in the next dialog.`,
        [{ text: "OK", onPress: () => {} }]
      );
    } catch (error) {
      console.error("Failed to create backup:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to create backup file");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreBackup = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Pick a file
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
      });

      if (result.canceled) {
        return;
      }

      // Read the file
      const fileContent = await FileSystem.readAsStringAsync(
        result.assets[0].uri,
        {
          encoding: "utf8",
        }
      );

      // Show confirmation dialog
      Alert.alert(
        "Restore Backup?",
        "This will replace all current data with the backup. This action cannot be undone.\n\nAre you sure?",
        [
          { text: "Cancel", onPress: () => {}, style: "cancel" },
          {
            text: "Restore",
            onPress: async () => {
              await performRestore(fileContent);
            },
            style: "destructive",
          },
        ]
      );
    } catch (error) {
      console.error("Failed to restore backup:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to read backup file");
    }
  };

  const performRestore = async (backupData: string) => {
    try {
      setIsRestoring(true);
      setShowProgressModal(true);
      setRestoreProgress(0);
      setProgressMessage("Starting restore process...");

      // Parse and validate
      setProgressMessage("Validating backup file...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      setRestoreProgress(10);

      const parsed = JSON.parse(backupData);

      if (
        !parsed.members ||
        !parsed.attendance ||
        !parsed.sales ||
        !parsed.priceSettings
      ) {
        throw new Error("Invalid backup file - missing required data");
      }

      // Restore data
      setProgressMessage("Restoring members...");
      setRestoreProgress(20);
      await restoreFromBackup(backupData);

      setProgressMessage("Refreshing application...");
      setRestoreProgress(80);
      await new Promise((resolve) => setTimeout(resolve, 500));

      await refreshData();

      setRestoreProgress(100);
      setProgressMessage("Restore complete!");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setShowProgressModal(false);
      Alert.alert("Success", "Data restored successfully!", [
        {
          text: "OK",
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error("Restore error:", error);
      setShowProgressModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Error",
        `Failed to restore backup: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <>
      <KeyboardAwareScrollViewCompat
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.backButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Feather name="chevron-left" size={24} color={theme.text} />
            <ThemedText style={styles.backButtonText}>Back</ThemedText>
          </Pressable>
        </View>

        <ThemedText type="h2" style={styles.title}>
          Data Backup & Restore
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          Protect your gym data
        </ThemedText>

        <View style={{ marginTop: Spacing.xl }}>
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="info" size={20} color={theme.primary} />
              <ThemedText type="h4">How to Use</ThemedText>
            </View>

            <ThemedText
              style={[styles.infoText, { color: theme.textSecondary }]}
            >
              {`1. Tap "Create Backup" to save all your data (members, sales, attendance)\n\n2. The backup file will be saved to your device storage\n\n3. You can backup periodically to keep your data safe\n\n4. If your device is lost or damaged, use "Restore from Backup" to recover your data\n\n5. Restores replace all current data with the backup`}
            </ThemedText>
          </Card>
        </View>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="database" size={20} color={theme.primary} />
            <ThemedText type="h4">Current Data</ThemedText>
          </View>

          <View style={[styles.statsContainer, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={styles.statItem}>
              <Feather name="users" size={28} color="#ff6b6b" />
              <ThemedText style={styles.statNumber}>{members.length}</ThemedText>
              <ThemedText
                style={[styles.statLabel, { color: theme.textSecondary }]}
              >
                Members
              </ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Feather name="dollar-sign" size={28} color="#51cf66" />
              <ThemedText style={styles.statNumber}>{sales.length}</ThemedText>
              <ThemedText
                style={[styles.statLabel, { color: theme.textSecondary }]}
              >
                Sales
              </ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Feather name="log-in" size={28} color="#ff922b" />
              <ThemedText style={styles.statNumber}>
                {attendance.length}
              </ThemedText>
              <ThemedText
                style={[styles.statLabel, { color: theme.textSecondary }]}
              >
                Records
              </ThemedText>
            </View>
          </View>
        </Card>

        <Card style={styles.section}>
          <View
            style={[
              styles.lastBackupContainer,
              { backgroundColor: theme.backgroundTertiary },
            ]}
          >
            <Feather name="clock" size={20} color={theme.textSecondary} />
            <View style={styles.lastBackupInfo}>
              <ThemedText
                style={[
                  styles.lastBackupLabel,
                  { color: theme.textSecondary },
                ]}
              >
                Last Backup
              </ThemedText>
              <ThemedText style={styles.lastBackupDate}>
                {lastBackupDate || "Never"}
              </ThemedText>
            </View>
          </View>
        </Card>

        <Pressable
          onPress={handleCreateBackup}
          disabled={isBackingUp}
          style={[
            styles.createButton,
            { opacity: isBackingUp ? 0.7 : 1, backgroundColor: "#51cf66" },
          ]}
        >
          {isBackingUp ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <ThemedText style={styles.buttonText}>Creating Backup...</ThemedText>
            </>
          ) : (
            <>
              <Feather name="download" size={20} color="#FFFFFF" />
              <ThemedText style={styles.buttonText}>Create Backup</ThemedText>
            </>
          )}
        </Pressable>

        <Pressable
          onPress={handleRestoreBackup}
          disabled={isRestoring}
          style={[
            styles.restoreButton,
            { opacity: isRestoring ? 0.7 : 1, backgroundColor: "#ff6b6b" },
          ]}
        >
          {isRestoring ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <ThemedText style={styles.buttonText}>Restoring...</ThemedText>
            </>
          ) : (
            <>
              <Feather name="upload" size={20} color="#FFFFFF" />
              <ThemedText style={styles.buttonText}>Restore Backup</ThemedText>
            </>
          )}
        </Pressable>
      </KeyboardAwareScrollViewCompat>

      {/* Progress Modal */}
      <Modal visible={showProgressModal} transparent animationType="fade">
        <View style={styles.progressOverlay}>
          <View
            style={[
              styles.progressCard,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <ActivityIndicator size="large" color={theme.primary} />

            <ThemedText style={styles.progressTitle}>
              Restoring Your Data
            </ThemedText>

            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${restoreProgress}%`,
                    backgroundColor: theme.primary,
                  },
                ]}
              />
            </View>

            <ThemedText
              style={[
                styles.progressText,
                { color: theme.textSecondary },
              ]}
            >
              {restoreProgress}%
            </ThemedText>

            <ThemedText
              style={[
                styles.progressMessage,
                { color: theme.textSecondary },
              ]}
            >
              {progressMessage}
            </ThemedText>
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
  content: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  backButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
    padding: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: "row",
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    alignItems: "center",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  lastBackupContainer: {
    flexDirection: "row",
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.md,
  },
  lastBackupInfo: {
    flex: 1,
  },
  lastBackupLabel: {
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  lastBackupDate: {
    fontSize: 18,
    fontWeight: "600",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 54,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  restoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 54,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  progressOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  progressCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing["2xl"],
    alignItems: "center",
    width: "80%",
    maxWidth: 300,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  progressBar: {
    height: "100%",
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  progressMessage: {
    fontSize: 13,
    textAlign: "center",
  },
});
