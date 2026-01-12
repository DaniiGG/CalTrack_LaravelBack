import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/auth";
import { db } from "../../firebase"; // asegúrate de exportar firestore desde tu config
import { doc, setDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState(""); // opcional, usuario puede subir foto
  const navigation = useNavigation<any>();

  const handleSignUp = async () => {
    if (!email || !password || !name) {
      Alert.alert("Error", "Fill all fields");
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Weak password",
        "Password must be at least 6 characters"
      );
      return;
    }

    try {
      // 1️⃣ Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = userCredential.user.uid;

      // 2️⃣ Guardar perfil en Firestore
      await setDoc(doc(db, "users", uid), {
        name,
        email,
        photoUrl: photoUrl || null,
        level: "basic", // nivel inicial
        combosCompleted: 0,
        streak: 0,
        createdAt: new Date().toISOString()
      });

      console.log("User created and profile saved:", uid);

      navigation.replace("WorkoutHome");
    } catch (error: any) {
      Alert.alert("Sign up error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>
          Start your calisthenics journey
        </Text>
      </View>

      {/* FORM */}
      <View style={styles.form}>
        <TextInput
          placeholder="Name"
          placeholderTextColor="#64748B"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <TextInput
          placeholder="Email"
          placeholderTextColor="#64748B"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#64748B"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <Pressable
          onPress={handleSignUp}
          style={styles.signUpButton}
        >
          <Text style={styles.signUpButtonText}>SIGN UP</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.replace("Login")}
          style={styles.link}
        >
          <Text style={styles.linkText}>
            Already have an account? Sign in
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/* =========================
   STYLES
========================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 24,
    justifyContent: "center"
  },

  header: {
    marginBottom: 40
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#F8FAFC",
    marginBottom: 8
  },

  subtitle: {
    fontSize: 14,
    color: "#94A3B8"
  },

  form: {
    gap: 14
  },

  input: {
    backgroundColor: "#020617",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: "#F8FAFC",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#1E293B"
  },

  signUpButton: {
    backgroundColor: "#22C55E",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10
  },

  signUpButtonText: {
    color: "#052E16",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 1
  },

  link: {
    marginTop: 16,
    alignItems: "center"
  },

  linkText: {
    color: "#38BDF8",
    fontSize: 13,
    fontWeight: "600"
  }
});
