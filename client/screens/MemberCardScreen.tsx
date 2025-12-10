import React, { useRef } from "react";
import { View, StyleSheet, Image, Pressable, Platform, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, RouteProp } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import ViewShot from "react-native-view-shot";
import * as FileSystem from "expo-file-system";
import QRCode from "react-native-qrcode-svg";

import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type RouteParams = RouteProp<RootStackParamList, "MemberCard">;

export default function MemberCardScreen() {
  const { theme } = useTheme();
  const route = useRoute<RouteParams>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { getMember } = useApp();
  const viewShotRef = useRef<ViewShot>(null);

  const member = getMember(route.params.memberId);

  if (!member) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ThemedText>Member not found</ThemedText>
      </ThemedView>
    );
  }

  const handleShare = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Info", "Sharing is not available on web. Please use Expo Go on your mobile device.");
      return;
    }

    try {
      if (viewShotRef.current?.capture) {
        const uri = await viewShotRef.current.capture();
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to share membership card.");
    }
  };

  return (
    <ThemedView
      style={[
        styles.container,
        { paddingTop: headerHeight + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl },
      ]}
    >
      <ViewShot
        ref={viewShotRef}
        options={{ format: "png", quality: 1 }}
        style={styles.cardContainer}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Image
              source={require("../../assets/images/gym-logo.jpg")}
              style={styles.cardLogo}
              resizeMode="contain"
            />
            <View style={styles.cardHeaderText}>
              <ThemedText
                style={styles.cardGymName}
                lightColor="#FFFFFF"
                darkColor="#FFFFFF"
              >
                POWERLIFT
              </ThemedText>
              <ThemedText
                style={styles.cardGymSubtitle}
                lightColor="#CCCCCC"
                darkColor="#CCCCCC"
              >
                FITNESS GYM
              </ThemedText>
            </View>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.memberSection}>
              {member.photo ? (
                <Image source={{ uri: member.photo }} style={styles.cardPhoto} />
              ) : (
                <View style={styles.cardPhotoPlaceholder}>
                  <Feather name="user" size={30} color="#666" />
                </View>
              )}
              <View style={styles.memberDetails}>
                <ThemedText
                  style={styles.memberName}
                  lightColor="#FFFFFF"
                  darkColor="#FFFFFF"
                >
                  {member.firstname} {member.lastname}
                </ThemedText>
                <ThemedText
                  style={styles.memberType}
                  lightColor="#DC2626"
                  darkColor="#DC2626"
                >
                  {member.membership_type.toUpperCase()} MEMBER
                </ThemedText>
              </View>
            </View>

            <View style={styles.qrSection}>
              <View style={styles.qrContainer}>
                <QRCode
                  value={member.qr_code}
                  size={120}
                  backgroundColor="#FFFFFF"
                  color="#000000"
                />
              </View>
              <ThemedText
                style={styles.qrCode}
                lightColor="#CCCCCC"
                darkColor="#CCCCCC"
              >
                {member.qr_code}
              </ThemedText>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <ThemedText
              style={styles.footerText}
              lightColor="#999999"
              darkColor="#999999"
            >
              Present this card upon entry
            </ThemedText>
          </View>
        </View>
      </ViewShot>

      <Pressable
        onPress={handleShare}
        style={[styles.shareButton, { backgroundColor: theme.primary }]}
      >
        <Feather name="share-2" size={20} color="#FFFFFF" />
        <ThemedText style={styles.shareButtonText}>Share Card</ThemedText>
      </Pressable>

      <ThemedText style={[styles.hint, { color: theme.textSecondary }]}>
        Save or share your membership card to show when entering the gym
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  cardContainer: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#1A1A1A",
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#DC2626",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.xl,
    backgroundColor: "#0F0F0F",
    gap: Spacing.md,
  },
  cardLogo: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.sm,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardGymName: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 2,
  },
  cardGymSubtitle: {
    fontSize: 12,
    letterSpacing: 3,
  },
  cardBody: {
    padding: Spacing.xl,
  },
  memberSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  cardPhoto: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#DC2626",
  },
  cardPhotoPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#DC2626",
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  memberType: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  qrSection: {
    alignItems: "center",
  },
  qrContainer: {
    padding: Spacing.md,
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  qrCode: {
    fontSize: 14,
    fontFamily: "monospace",
    letterSpacing: 2,
  },
  cardFooter: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    backgroundColor: "#0F0F0F",
  },
  footerText: {
    fontSize: 11,
    letterSpacing: 1,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  shareButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  hint: {
    textAlign: "center",
    marginTop: Spacing.xl,
    fontSize: 14,
  },
});
