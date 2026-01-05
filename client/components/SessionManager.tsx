import React, { useEffect, useRef, useState, ReactNode, useCallback } from "react";
import { AppState, Pressable, Text, View, Modal, PanResponder, GestureResponderEvent } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Image } from "react-native";
import { useApp } from "@/context/AppContext";

const IDLE_TIME = 2 * 60 * 1000; // 2 minutes
const COUNTDOWN_SECONDS = 10;

// Global ref to track if user is currently in a photo picker operation
// This persists across navigation changes (in-memory) and we also
// set a persistent AsyncStorage key so the flag survives process
// restarts during camera intent on some Android devices.
const isInPhotoPickerRef = { current: false };

export function setIsInPhotoPicker(value: boolean) {
  isInPhotoPickerRef.current = value;
  console.log('[SessionManager] Photo picker operation (ref):', value);
  if (value) {
    AsyncStorage.setItem("photo_picker_active", "1").catch(() => {});
  } else {
    AsyncStorage.removeItem("photo_picker_active").catch(() => {});
  }
}

export default function SessionManager({ children }: { children: ReactNode }) {
  const { isAuthenticated, setAuthenticated, timeoutDisabled } = useApp();
  const navigation = useNavigation();

  const idleTimer = useRef<NodeJS.Timeout | null>(null);
  const countdownTimer = useRef<NodeJS.Timeout | null>(null);
  const appStateSubscription = useRef<any>(null);

  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  /** Safe logout without triggering setState during render */
  const safeLogout = useCallback(() => {
    setShowModal(false);

    setTimeout(() => {
      setAuthenticated(false);

      setTimeout(() => {
        navigation.dispatch(
          CommonActions.navigate("Pin")
        );
      }, 150);
    }, 0);
  }, [navigation, setAuthenticated]);

  /** Countdown timer */
  const startCountdown = useCallback(() => {
    setCountdown(COUNTDOWN_SECONDS);

    countdownTimer.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 2) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        if (prev <= 1) {
          clearInterval(countdownTimer.current!);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          safeLogout();
        }
        return prev - 1;
      });
    }, 1000);
  }, [safeLogout]);

  /** Idle timer reset */
  const resetIdleTimer = useCallback(() => {
    if (!isAuthenticated || timeoutDisabled) return;

    if (idleTimer.current) clearTimeout(idleTimer.current);

    idleTimer.current = setTimeout(() => {
      setShowModal(true);
      startCountdown();
    }, IDLE_TIME);
  }, [isAuthenticated, timeoutDisabled, startCountdown]);

  /** Handle user interaction - reset idle timer */
  const handleUserInteraction = useCallback(() => {
    if (!isAuthenticated || timeoutDisabled) return;
    
    // Only reset if modal is not showing (user is actively using app)
    if (!showModal) {
      resetIdleTimer();
    }
  }, [isAuthenticated, timeoutDisabled, showModal, resetIdleTimer]);

  /** App state listener - handle background/foreground transitions */
  useEffect(() => {
    if (!isAuthenticated) return;

    const subscription = AppState.addEventListener("change", async (state) => {
      console.log('[SessionManager] AppState changed:', state);

      if (state === "background") {
        // App is going to background - stop the idle timer
        if (idleTimer.current) clearTimeout(idleTimer.current);
        if (countdownTimer.current) clearInterval(countdownTimer.current);
        setShowModal(false);
      } else if (state === "active") {
        // App is coming back to foreground

        // First, check in-memory ref
        if (isInPhotoPickerRef.current) {
          console.log('[SessionManager] In photo picker operation (ref) - skipping PIN screen');
          return;
        }

        // Next, check persistent AsyncStorage flag in case the process was restarted
        try {
          const persistent = await AsyncStorage.getItem("photo_picker_active");
          if (persistent === "1") {
            console.log('[SessionManager] In photo picker operation (storage) - skipping PIN screen');
            // clear it so future transitions behave normally
            await AsyncStorage.removeItem("photo_picker_active");
            return;
          }
        } catch (e) {
          // ignore storage errors and continue
        }

        // Get current route name from navigation state
        const state = (navigation as any).getState?.();
        const routes = state?.routes || [];
        const currentRoute = routes[routes.length - 1];
        const currentRouteName = currentRoute?.name || '';

        console.log('[SessionManager] Current route:', currentRouteName);

        // Skip PIN if user is on photo operation screens (Register or MemberDetail)
        if (currentRouteName === 'Register' || currentRouteName === 'MemberDetail') {
          console.log('[SessionManager] User is on photo operation screen - skipping PIN screen');
          return;
        }

        // Otherwise require re-authentication
        console.log('[SessionManager] App returned from background - forcing PIN screen');
        safeLogout();
      }
    });

    appStateSubscription.current = subscription;
    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, safeLogout, navigation]);

  /** Start timer when logged in */
  useEffect(() => {
    if (!isAuthenticated) {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (countdownTimer.current) clearInterval(countdownTimer.current);
      return;
    }

    resetIdleTimer();
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (countdownTimer.current) clearInterval(countdownTimer.current);
    };
  }, [isAuthenticated, timeoutDisabled, resetIdleTimer]);

  /** "I'm Still Here" — safely close modal + reset timer */
  const handleStay = () => {
    setShowModal(false);

    if (countdownTimer.current) clearInterval(countdownTimer.current);

    setTimeout(() => {
      resetIdleTimer();
    }, 50);
  };

  return (
    <Pressable 
      style={{ flex: 1 }} 
      onPress={handleUserInteraction}
      onLongPress={handleUserInteraction}
    >
      {children}

      <Modal visible={showModal} transparent animationType="fade">
        <BlurView intensity={60} tint="dark" style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 20,
            }}
          >
            <View
              style={{
                width: "100%",
                maxWidth: 350,
                backgroundColor: "white",
                borderRadius: 12,
                padding: 20,
                alignItems: "center",
              }}
            >
              <Image
                source={require("../../assets/images/gym-logo.jpg")}
                style={{ width: 80, height: 80, marginBottom: 15 }}
                resizeMode="contain"
              />

              <Text style={{ fontSize: 22, fontWeight: "bold", color: "#222" }}>
                POWERLIFT GYM
              </Text>

              <Text style={{ fontSize: 16, color: "#444", marginBottom: 15 }}>
                Session Ending Due to Inactivity
              </Text>

              <Text
                style={{
                  fontSize: 40,
                  fontWeight: "bold",
                  color: "#d32f2f",
                  marginBottom: 20,
                }}
              >
                {countdown}
              </Text>

              <Pressable
                onPress={handleStay}
                style={{
                  backgroundColor: "#d21919ff",
                  paddingHorizontal: 25,
                  paddingVertical: 10,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "white", fontSize: 16 }}>I'm Still Here</Text>
              </Pressable>
            </View>
          </View>
        </BlurView>
      </Modal>
    </Pressable>
  );
}
