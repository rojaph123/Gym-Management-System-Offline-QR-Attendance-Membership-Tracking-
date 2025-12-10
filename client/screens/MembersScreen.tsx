import React, { useState, useMemo } from "react";
import { View, StyleSheet, TextInput, FlatList, Pressable, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { useApp, Member } from "@/context/AppContext";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function MemberCard({ member }: { member: Member }) {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const isActive = useMemo(() => {
    if (!member.subscription_end) return false;
    const today = new Date().toISOString().split("T")[0];
    return member.subscription_end >= today;
  }, [member.subscription_end]);

  return (
    <Card
      style={styles.memberCard}
      onPress={() => navigation.navigate("MemberDetail", { memberId: member.id })}
    >
      <View style={styles.cardContent}>
        {member.photo ? (
          <Image source={{ uri: member.photo }} style={styles.memberPhoto} />
        ) : (
          <View style={[styles.memberPhotoPlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
            <Feather name="user" size={24} color={theme.textSecondary} />
          </View>
        )}
        <View style={styles.memberInfo}>
          <ThemedText style={styles.memberName} numberOfLines={1}>
            {member.firstname} {member.lastname}
          </ThemedText>
          <ThemedText style={[styles.memberType, { color: theme.textSecondary }]}>
            {member.membership_type.charAt(0).toUpperCase() + member.membership_type.slice(1)}
          </ThemedText>
        </View>
        <View style={[styles.statusDot, { backgroundColor: isActive ? theme.success : theme.warning }]} />
      </View>
    </Card>
  );
}

export default function MembersScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { members } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const query = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.firstname.toLowerCase().includes(query) ||
        m.lastname.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.phone.includes(query)
    );
  }, [members, searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + Spacing.lg, backgroundColor: theme.backgroundRoot },
        ]}
      >
        <ThemedText type="h3">Members</ThemedText>
        <ThemedText style={{ color: theme.textSecondary }}>
          {members.length} registered members
        </ThemedText>

        <View
          style={[
            styles.searchContainer,
            { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
          ]}
        >
          <Feather name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search members..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery("")}>
              <Feather name="x" size={20} color={theme.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        renderItem={({ item }) => <MemberCard member={item} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="users" size={50} color={theme.textSecondary} />
            <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
              {searchQuery ? "No members found" : "No members registered yet"}
            </ThemedText>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  memberCard: {
    flex: 0.48,
    padding: Spacing.lg,
  },
  cardContent: {
    alignItems: "center",
  },
  memberPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: Spacing.md,
  },
  memberPhotoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  memberInfo: {
    alignItems: "center",
  },
  memberName: {
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 2,
  },
  memberType: {
    fontSize: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: "absolute",
    top: 0,
    right: 0,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["5xl"],
  },
  emptyText: {
    marginTop: Spacing.lg,
    textAlign: "center",
  },
});
