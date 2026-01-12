import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  SafeAreaView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../services/auth";
import { db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const user = auth.currentUser;

  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data() as any;
        setName(data.name);
        setPhotoUrl(data.photoUrl ?? "");
      }
    };
    load();
  }, [user]);

  const save = async () => {
    if (!user) return;
    await setDoc(
      doc(db, "users", user.uid),
      { name, photoUrl },
      { merge: true }
    );
    Alert.alert("Profile updated");
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Edit profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#64748B"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Photo URL"
        placeholderTextColor="#64748B"
        value={photoUrl}
        onChangeText={setPhotoUrl}
      />

      <Pressable style={styles.saveButton} onPress={save}>
        <Text style={styles.saveText}>SAVE</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 24,
  },

  title: {
    color: "#F8FAFC",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 32,
    textAlign: "center",
  },

  input: {
    backgroundColor: "#020617",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    color: "#F8FAFC",
    fontSize: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  saveButton: {
    marginTop: 12,
    backgroundColor: "#22C55E",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },

  saveText: {
    color: "#052E16",
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 1,
  },
});

