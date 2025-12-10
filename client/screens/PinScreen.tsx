import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, TextInput, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Spacing, BorderRadius } from "@/constants/theme";

const PIN_KEY = "powerlift_gym_pin";

export default function PinScreen() {
  const { theme } = useTheme();
  const { setAuthenticated, setHasPin, hasPin } = useApp();
  const insets = useSafeAreaInsets();

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [storedPin, setStoredPin] = useState<string | null>(null);

  useEffect(() => {
    checkExistingPin();
  }, []);

  const checkExistingPin = async () => {
    try {
      if (Platform.OS === "web") {
        const webPin = localStorage.getItem(PIN_KEY);
        if (webPin) {
          setStoredPin(webPin);
          setHasPin(true);
        } else {
          setIsCreating(true);
        }
      } else {
        const existingPin = await SecureStore.getItemAsync(PIN_KEY);
        if (existingPin) {
          setStoredPin(existingPin);
          setHasPin(true);
        } else {
          setIsCreating(true);
        }
      }
    } catch {
      setIsCreating(true);
    }
  };

  const handlePinChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 4);
    setPin(numericValue);
    setError("");
  };

  const handleConfirmPinChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 4);
    setConfirmPin(numericValue);
    setError("");
  };

  const handleSubmit = async () => {
    if (isCreating) {
      if (pin.length !== 4) {
        setError("PIN must be 4 digits");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      if (pin !== confirmPin) {
        setError("PINs do not match");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      try {
        if (Platform.OS === "web") {
          localStorage.setItem(PIN_KEY, pin);
        } else {
          await SecureStore.setItemAsync(PIN_KEY, pin);
        }
        setHasPin(true);
        setAuthenticated(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        setError("Failed to save PIN");
      }
    } else {
      if (pin === storedPin) {
        setAuthenticated(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setError("Incorrect PIN");
        setPin("");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  const renderPinDots = (value: string) => {
    return (
      <View style={styles.pinDots}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.pinDot,
              {
                backgroundColor: i < value.length ? theme.primary : "transparent",
                borderColor: theme.primary,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <ThemedView
      style={[
        styles.container,
        { paddingTop: insets.top + Spacing["3xl"], paddingBottom: insets.bottom + Spacing.xl },
      ]}
    >
      <View style={styles.content}>
        <Image
          source={require("../../assets/images/gym-logo.jpg")}
          style={styles.logo}
          resizeMode="contain"
        />

        <ThemedText type="h3" style={styles.title}>
          Welcome to Powerlift Fitness Gym
        </ThemedText>

        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          {isCreating ? "Create your 4-digit PIN" : "Enter your PIN to continue"}
        </ThemedText>

        <View style={styles.inputContainer}>
          {renderPinDots(pin)}
          <TextInput
            style={[styles.hiddenInput]}
            value={pin}
            onChangeText={handlePinChange}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            autoFocus
          />
        </View>

        {isCreating ? (
          <View style={styles.inputContainer}>
            <ThemedText style={[styles.confirmLabel, { color: theme.textSecondary }]}>
              Confirm PIN
            </ThemedText>
            {renderPinDots(confirmPin)}
            <TextInput
              style={[styles.hiddenInput]}
              value={confirmPin}
              onChangeText={handleConfirmPinChange}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />
          </View>
        ) : null}

        {error ? (
          <ThemedText style={[styles.error, { color: theme.error }]}>{error}</ThemedText>
        ) : null}

        <Pressable
          onPress={handleSubmit}
          style={[styles.button, { backgroundColor: theme.primary }]}
        >
          <ThemedText style={[styles.buttonText, { color: "#FFFFFF" }]}>
            {isCreating ? "Create PIN" : "Unlock"}
          </ThemedText>
        </Pressable>
      </View>

      <ThemedText style={[styles.footer, { color: theme.textSecondary }]}>
        Developed by Rov - 2025
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: Spacing["2xl"],
    borderRadius: BorderRadius.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: Spacing["3xl"],
  },
  inputContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  confirmLabel: {
    marginBottom: Spacing.md,
  },
  pinDots: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 200,
    height: 50,
  },
  error: {
    marginBottom: Spacing.lg,
  },
  button: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing["4xl"],
    borderRadius: BorderRadius.full,
    marginTop: Spacing.lg,
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
  },
});
