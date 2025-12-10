import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Pressable, Alert, Image, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { useApp, Member } from "@/context/AppContext";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function ScanQRScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { getMemberByQR, addAttendance, renewSubscription, paySession, priceSettings } = useApp();

  const [permission, requestPermission] = useCameraPermissions();
  const [scannedMember, setScannedMember] = useState<Member | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playBeep = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: "https://actions.google.com/sounds/v1/alarms/beep_short.ogg" },
        { shouldPlay: true }
      );
      soundRef.current = sound;
    } catch {
    }
  };

  const isSubscriptionActive = (member: Member): boolean => {
    if (!member.subscription_end) return false;
    const today = new Date().toISOString().split("T")[0];
    return member.subscription_end >= today;
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    const now = Date.now();
    if (now - lastScanTime < 5000) return;
    setLastScanTime(now);

    if (!data.startsWith("GYM-")) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Invalid QR", "QR code not recognized. Must be a valid gym member QR.");
      return;
    }

    const member = getMemberByQR(data);
    if (!member) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Not Found", "Member not found in the system.");
      return;
    }

    playBeep();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setScannedMember(member);
    setShowResult(true);
  };

  const handleRecordAttendance = () => {
    if (scannedMember) {
      addAttendance(scannedMember.id);
      Alert.alert("Success", "Attendance recorded successfully!");
      setShowResult(false);
      setScannedMember(null);
    }
  };

  const handleRenewSubscription = () => {
    if (scannedMember) {
      renewSubscription(scannedMember.id);
      addAttendance(scannedMember.id);
      Alert.alert("Success", "Subscription renewed and attendance recorded!");
      setShowResult(false);
      setScannedMember(null);
    }
  };

  const handlePaySession = () => {
    if (scannedMember) {
      paySession(scannedMember.id, true);
      Alert.alert("Success", "Session payment recorded and attendance logged!");
      setShowResult(false);
      setScannedMember(null);
    }
  };

  const handleWalkIn = () => {
    paySession(0, false);
    Alert.alert("Success", `Walk-in session recorded. Amount: ₱${priceSettings.session_nonmember}`);
  };

  const handleClose = () => {
    setShowResult(false);
    setScannedMember(null);
  };

  if (!permission) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedText>Requesting camera permission...</ThemedText>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView
        style={[
          styles.container,
          styles.centered,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <Feather name="camera-off" size={60} color={theme.textSecondary} />
        <ThemedText type="h4" style={styles.permissionTitle}>
          Camera Permission Required
        </ThemedText>
        <ThemedText style={[styles.permissionText, { color: theme.textSecondary }]}>
          We need camera access to scan member QR codes
        </ThemedText>
        <Pressable
          onPress={requestPermission}
          style={[styles.permissionButton, { backgroundColor: theme.primary }]}
        >
          <ThemedText style={{ color: "#FFFFFF", fontWeight: "600" }}>
            Enable Camera
          </ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  if (Platform.OS === "web") {
    return (
      <ThemedView
        style={[
          styles.container,
          styles.centered,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <Feather name="smartphone" size={60} color={theme.textSecondary} />
        <ThemedText type="h4" style={styles.permissionTitle}>
          Run in Expo Go
        </ThemedText>
        <ThemedText style={[styles.permissionText, { color: theme.textSecondary }]}>
          QR scanning requires running on a mobile device.{"\n"}
          Scan the QR code to open in Expo Go.
        </ThemedText>
        <View style={styles.walkInSection}>
          <ThemedText style={[styles.walkInLabel, { color: theme.textSecondary }]}>
            Or record a walk-in session:
          </ThemedText>
          <Pressable
            onPress={handleWalkIn}
            style={[styles.walkInButton, { backgroundColor: theme.primary }]}
          >
            <Feather name="user-plus" size={20} color="#FFFFFF" />
            <ThemedText style={{ color: "#FFFFFF", fontWeight: "600" }}>
              Walk-in Session (₱{priceSettings.session_nonmember})
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={showResult ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      />

      <View style={[styles.overlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.scanArea}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>

        <ThemedText style={styles.scanText}>
          Point camera at member QR code
        </ThemedText>

        <Pressable
          onPress={handleWalkIn}
          style={[styles.walkInFloating, { backgroundColor: theme.backgroundDefault }]}
        >
          <Feather name="user" size={18} color={theme.text} />
          <ThemedText>Walk-in Session</ThemedText>
        </Pressable>
      </View>

      {showResult && scannedMember ? (
        <View style={[styles.resultOverlay, { backgroundColor: "rgba(0,0,0,0.85)" }]}>
          <Card style={styles.resultCard}>
            <View style={styles.memberHeader}>
              {scannedMember.photo ? (
                <Image source={{ uri: scannedMember.photo }} style={styles.memberPhoto} />
              ) : (
                <View style={[styles.memberPhotoPlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
                  <Feather name="user" size={30} color={theme.textSecondary} />
                </View>
              )}
              <View style={styles.memberInfo}>
                <ThemedText type="h4">
                  {scannedMember.firstname} {scannedMember.lastname}
                </ThemedText>
                <ThemedText style={{ color: theme.textSecondary, textTransform: "capitalize" }}>
                  {scannedMember.membership_type} Member
                </ThemedText>
              </View>
            </View>

            <View style={[styles.statusBadge, { 
              backgroundColor: isSubscriptionActive(scannedMember) ? theme.success + "20" : theme.warning + "20" 
            }]}>
              <Feather
                name={isSubscriptionActive(scannedMember) ? "check-circle" : "alert-circle"}
                size={18}
                color={isSubscriptionActive(scannedMember) ? theme.success : theme.warning}
              />
              <ThemedText style={{ 
                color: isSubscriptionActive(scannedMember) ? theme.success : theme.warning,
                fontWeight: "600"
              }}>
                {isSubscriptionActive(scannedMember) ? "Active Subscription" : "Subscription Expired"}
              </ThemedText>
            </View>

            {scannedMember.subscription_end ? (
              <ThemedText style={[styles.expiryText, { color: theme.textSecondary }]}>
                {isSubscriptionActive(scannedMember) ? "Expires" : "Expired"}: {scannedMember.subscription_end}
              </ThemedText>
            ) : null}

            <View style={styles.actionButtons}>
              {isSubscriptionActive(scannedMember) ? (
                <Pressable
                  onPress={handleRecordAttendance}
                  style={[styles.actionButton, { backgroundColor: theme.success }]}
                >
                  <Feather name="check" size={20} color="#FFFFFF" />
                  <ThemedText style={styles.actionButtonText}>Record Attendance</ThemedText>
                </Pressable>
              ) : (
                <>
                  <Pressable
                    onPress={handleRenewSubscription}
                    style={[styles.actionButton, { backgroundColor: theme.primary }]}
                  >
                    <Feather name="refresh-cw" size={18} color="#FFFFFF" />
                    <ThemedText style={styles.actionButtonText}>Renew Monthly</ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={handlePaySession}
                    style={[styles.actionButton, { backgroundColor: theme.success }]}
                  >
                    <Feather name="dollar-sign" size={18} color="#FFFFFF" />
                    <ThemedText style={styles.actionButtonText}>Pay Session</ThemedText>
                  </Pressable>
                </>
              )}
            </View>

            <Pressable onPress={handleClose} style={styles.closeButton}>
              <ThemedText style={{ color: theme.textSecondary }}>Close</ThemedText>
            </Pressable>
          </Card>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  permissionTitle: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  permissionText: {
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
  permissionButton: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing["3xl"],
    borderRadius: BorderRadius.full,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  scanArea: {
    width: 250,
    height: 250,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#FFFFFF",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  scanText: {
    color: "#FFFFFF",
    marginTop: Spacing["2xl"],
    fontSize: 16,
  },
  walkInFloating: {
    position: "absolute",
    bottom: 100,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  walkInSection: {
    marginTop: Spacing["3xl"],
    alignItems: "center",
  },
  walkInLabel: {
    marginBottom: Spacing.lg,
  },
  walkInButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing["2xl"],
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  resultOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  resultCard: {
    width: "100%",
    maxWidth: 400,
    padding: Spacing["2xl"],
  },
  memberHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  memberPhoto: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  memberPhotoPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
  },
  memberInfo: {
    flex: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  expiryText: {
    marginBottom: Spacing.xl,
  },
  actionButtons: {
    gap: Spacing.md,
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
  closeButton: {
    alignItems: "center",
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
  },
});
