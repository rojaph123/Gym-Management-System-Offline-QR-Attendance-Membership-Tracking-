import React from "react";
import { View, StyleSheet, Modal, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";

interface SessionTypeOption {
  id: string;
  label: string;
  subtitle: string;
  price: number;
  isSenior?: boolean;
}

interface SessionTypeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (option: SessionTypeOption) => void;
  options: SessionTypeOption[];
  title: string;
  memberName?: string;
  defaultOptionId?: string;
}

export const SessionTypeModal = ({
  visible,
  onClose,
  onSelect,
  options,
  title,
  memberName,
  defaultOptionId,
}: SessionTypeModalProps) => {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.7)" }]}>
        <View
          style={[
            styles.container,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <ThemedText type="h4" style={styles.title}>
                {title}
              </ThemedText>
              {memberName && (
                <ThemedText
                  style={[styles.subtitle, { color: theme.textSecondary }]}
                >
                  {memberName}
                </ThemedText>
              )}
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Feather
                name="x"
                size={24}
                color={theme.text}
              />
            </Pressable>
          </View>

          {/* Options Grid */}
          <View style={styles.optionsContainer}>
            {options.map((option) => {
              const isDefault = option.id === defaultOptionId;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => {
                    onSelect(option);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.optionButton,
                    {
                      backgroundColor: isDefault ? theme.primary + "20" : theme.backgroundSecondary,
                      borderWidth: isDefault ? 2 : 0,
                      borderColor: isDefault ? theme.primary : "transparent",
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.optionIcon}>
                      <Feather
                        name={
                          option.isSenior
                            ? "shield"
                            : option.id.includes("member")
                              ? "users"
                              : "user-plus"
                        }
                        size={28}
                        color={theme.primary}
                      />
                    </View>
                    <View style={styles.optionText}>
                      <ThemedText style={styles.optionLabel}>
                        {option.label}
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.optionSubtitle,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {option.subtitle}
                      </ThemedText>
                    </View>
                    <View style={styles.priceContainer}>
                      <ThemedText style={styles.priceLabel}>₱</ThemedText>
                      <ThemedText style={styles.price}>
                        {option.price}
                      </ThemedText>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Cancel Button */}
          <Pressable
            onPress={onClose}
            style={[
              styles.cancelButton,
              { borderColor: theme.textSecondary },
            ]}
          >
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  container: {
    width: "100%",
    maxWidth: 400,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.sm,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
  },
  closeButton: {
    padding: Spacing.sm,
    marginRight: -Spacing.sm,
  },
  optionsContainer: {
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  optionButton: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(220, 38, 38, 0.1)",
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 12,
    fontWeight: "400",
  },
  priceContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.sm,
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
  },
  cancelButton: {
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
