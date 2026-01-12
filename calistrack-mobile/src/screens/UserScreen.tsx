import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { auth } from "../services/auth";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const user = auth.currentUser;

  const [profile, setProfile] = useState({
    name: "",
    photoUrl: "",
    combosCompleted: 0,
    streak: 0,
    level: "BASIC",
  });

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setProfile(snap.data() as any);
    };

    fetchProfile();
  }, [user]);

  const logout = async () => {
    await signOut(auth);
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <View style={styles.container}>
      {/* AVATAR */}
      <View style={styles.header}>
        {profile.photoUrl ? (
          <Image source={{ uri: profile.photoUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>
              {profile.name?.[0]?.toUpperCase() ?? "U"}
            </Text>
          </View>
        )}

        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.subtitle}>Calisthenics athlete</Text>
      </View>

      {/* STATS */}
      <View style={styles.stats}>
        <Stat label="Workouts" value={profile.combosCompleted} />
        <Stat label="Streak" value={profile.streak} />
        <Stat label="Level" value={profile.level} />
      </View>

      {/* ACTIONS */}
      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate("History")}
      >
        <Text style={styles.buttonText}>Training history</Text>
      </Pressable>

      {/* LOGOUT */}
      <Pressable onPress={logout} style={styles.logout}>
        <Text style={styles.logoutText}>LOG OUT</Text>
      </Pressable>
    </View>
  );
}

function Stat({ label, value }: any) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 20,
  },

  header: {
    alignItems: "center",
    marginBottom: 32,
  },

  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
  },

  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  avatarText: {
    color: "#22C55E",
    fontSize: 36,
    fontWeight: "800",
  },

  name: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "700",
  },

  subtitle: {
    color: "#94A3B8",
    fontSize: 13,
  },

  stats: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 32,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#020617",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },

  statValue: {
    color: "#22C55E",
    fontSize: 18,
    fontWeight: "800",
  },

  statLabel: {
    color: "#94A3B8",
    fontSize: 12,
  },

  button: {
    backgroundColor: "#020617",
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },

  buttonText: {
    color: "#F8FAFC",
    fontWeight: "600",
    textAlign: "center",
  },

  logout: {
    marginTop: "auto",
    backgroundColor: "#7F1D1D",
    padding: 16,
    borderRadius: 14,
  },

  logoutText: {
    color: "#FECACA",
    fontWeight: "700",
    textAlign: "center",
  },
});