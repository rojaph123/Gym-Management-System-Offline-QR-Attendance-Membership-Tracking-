import React, { useRef, useState } from "react";
import { View, StyleSheet, Image, Pressable, Platform, Alert, ScrollView, ActivityIndicator, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, RouteProp } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import * as Print from "expo-print";
import ViewShot from "react-native-view-shot";
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
  const [isDownloading, setIsDownloading] = useState(false);
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();

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

  const handleDownloadPNG = async () => {
    if (Platform.OS === "web") {
      try {
        if (viewShotRef.current?.capture) {
          const uri = await viewShotRef.current.capture();
          const link = document.createElement("a");
          link.href = uri;
          link.download = `${member.firstname}_${member.lastname}_membership_card.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          Alert.alert("Success", "Membership card downloaded as PNG!");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to download PNG on web.");
      }
      return;
    }

    setIsDownloading(true);
    try {
      if (!mediaPermission?.granted) {
        const permission = await requestMediaPermission();
        if (!permission.granted) {
          if (permission.status === "denied" && !permission.canAskAgain && Platform.OS !== ("web" as any)) {
 
            Alert.alert(
              "Permission Required",
              "Media library permission is required to save images. Please enable it in your device settings.",
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Open Settings", 
                  onPress: async () => {
                    try {
                      await Linking.openSettings();
                    } catch {
                      // Settings not available
                    }
                  }
                },
              ]
            );
          } else {
            Alert.alert("Permission Required", "Please grant media library permission to save images.");
          }
          setIsDownloading(false);
          return;
        }
      }

      if (viewShotRef.current?.capture) {
        const uri = await viewShotRef.current.capture();
        const fileName = `${member.firstname}_${member.lastname}_membership_card.png`;
        const fileUri = FileSystem.documentDirectory + fileName;
        
        await FileSystem.copyAsync({
          from: uri,
          to: fileUri,
        });

        const asset = await MediaLibrary.createAssetAsync(fileUri);
        await MediaLibrary.createAlbumAsync("Powerlift Gym", asset, false);
        
        Alert.alert("Success", "Membership card saved to your photo library!");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to download membership card as PNG.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      let imageBase64 = "";
      
      if (viewShotRef.current?.capture) {
        const capturedUri = await viewShotRef.current.capture();
        
        if (Platform.OS !== "web") {
          // On native platforms, capture returns a file URI
          // Read the file and convert to base64
          const fileContent = await FileSystem.readAsStringAsync(capturedUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          imageBase64 = `data:image/png;base64,${fileContent}`;
        } else {
          // On web, capturedUri is already a data URI
          imageBase64 = capturedUri;
        }
      }

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Membership Card - ${member.firstname} ${member.lastname}</title>
            <style>
              body {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                padding: 20px;
                background-color: #f0f0f0;
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
              }
              .card-container {
                max-width: 500px;
                width: 100%;
              }
              .card-image {
                width: 100%;
                border-radius: 16px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
              }
              .qr-section {
                text-align: center;
                margin-top: 30px;
                padding: 20px;
                background: #FFFFFF;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }
              .qr-label {
                color: #1A1A1A;
                font-size: 16px;
                font-weight: 600;
                letter-spacing: 2px;
                margin: 0 0 20px 0;
              }
              .qr-image {
                display: inline-block;
                padding: 15px;
                background: #FFFFFF;
                border-radius: 12px;
                border: 2px solid #DC2626;
                margin-bottom: 15px;
              }
              .qr-image img {
                display: block;
                width: 280px;
                height: 280px;
              }
              .qr-code-text {
                color: #666666;
                font-size: 13px;
                font-family: 'Courier New', monospace;
                letter-spacing: 1px;
                word-break: break-all;
                margin: 0;
                margin-top: 15px;
                padding: 10px;
                background: #f5f5f5;
                border-radius: 6px;
              }
            </style>
          </head>
          <body>
            <div class="card-container">
              ${imageBase64 ? `
                <img src="${imageBase64}" class="card-image" alt="Membership Card" />
                <div class="qr-section">
                  <p class="qr-label">MEMBER ID</p>
                  <div class="qr-image">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(member.qr_code)}&errorCorrection=H" alt="QR Code" />
                  </div>
                  <p class="qr-code-text">${member.qr_code}</p>
                </div>
              ` : `
                <div style="background: #1A1A1A; border-radius: 16px; border: 2px solid #DC2626; overflow: hidden;">
                  <div style="display: flex; align-items: center; padding: 20px; background: #0F0F0F; gap: 12px;">
                    <div style="width: 50px; height: 50px; background: #333; border-radius: 8px;"></div>
                    <div>
                      <p style="color: #FFFFFF; font-size: 20px; font-weight: 700; letter-spacing: 2px; margin: 0;">POWERLIFT</p>
                      <p style="color: #CCCCCC; font-size: 12px; letter-spacing: 3px; margin: 0;">FITNESS GYM</p>
                    </div>
                  </div>
                  <div style="padding: 20px;">
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
                      <div style="width: 70px; height: 70px; border-radius: 35px; background: #333; border: 2px solid #DC2626; display: flex; align-items: center; justify-content: center; color: #666; font-size: 30px;">U</div>
                      <div>
                        <p style="color: #FFFFFF; font-size: 18px; font-weight: 600; margin: 0 0 4px 0;">${member.firstname} ${member.lastname}</p>
                        <p style="color: #DC2626; font-size: 12px; font-weight: 700; letter-spacing: 1px; margin: 0;">${member.membership_type.toUpperCase()} MEMBER</p>
                      </div>
                    </div>
                    <div style="text-align: center; margin-top: 25px;">
                      <p style="color: #FFFFFF; font-size: 14px; font-weight: 600; letter-spacing: 2px; margin: 0 0 15px 0;">MEMBER ID</p>
                      <div style="background: #FFFFFF; padding: 15px; border-radius: 12px; border: 2px solid #DC2626; display: inline-block; margin-bottom: 15px;">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(member.qr_code)}&errorCorrection=H" alt="QR Code" style="display: block; width: 280px; height: 280px;" />
                      </div>
                      <p style="color: #CCCCCC; font-size: 12px; font-family: 'Courier New', monospace; letter-spacing: 1px; margin: 15px 0; padding: 10px; background: #333; border-radius: 6px;">${member.qr_code}</p>
                    </div>
                  </div>
                  <div style="text-align: center; padding: 16px; background: #0F0F0F;">
                    <p style="color: #999999; font-size: 11px; letter-spacing: 1px; margin: 0;">Present this card upon entry</p>
                  </div>
                </div>
              `}
            </div>
          </body>
        </html>
      `;

      if (Platform.OS === "web") {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.print();
        }
        Alert.alert("Success", "PDF ready for printing!");
      } else {
        await Print.printAsync({ html });
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to generate PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.contentContainer,
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
                  size={200}
                  backgroundColor="#FFFFFF"
                  color="#000000"
                  ecl="H"
                  quietZone={10}
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

      <View style={styles.buttonContainer}>
        <Pressable
          onPress={handleDownloadPNG}
          disabled={isDownloading}
          style={[styles.downloadButton, { backgroundColor: theme.primary }]}
        >
          {isDownloading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Feather name="image" size={20} color="#FFFFFF" />
              <ThemedText style={styles.buttonText}>Download PNG</ThemedText>
            </>
          )}
        </Pressable>

        <Pressable
          onPress={handleDownloadPDF}
          disabled={isDownloading}
          style={[styles.downloadButton, { backgroundColor: theme.success }]}
        >
          {isDownloading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Feather name="file-text" size={20} color="#FFFFFF" />
              <ThemedText style={styles.buttonText}>Download PDF</ThemedText>
            </>
          )}
        </Pressable>

        <Pressable
          onPress={handleShare}
          style={[styles.downloadButton, { backgroundColor: theme.backgroundSecondary }]}
        >
          <Feather name="share-2" size={20} color={theme.text} />
          <ThemedText>Share Card</ThemedText>
        </Pressable>
      </View>

      <ThemedText style={[styles.hint, { color: theme.textSecondary }]}>
        Save or share your membership card to show when entering the gym
      </ThemedText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
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
    marginTop: Spacing.lg,
  },
  qrContainer: {
    padding: Spacing.lg,
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  qrCode: {
    fontSize: 12,
    fontFamily: "monospace",
    letterSpacing: 2,
    fontWeight: "500",
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
  buttonContainer: {
    gap: Spacing.md,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  buttonText: {
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
