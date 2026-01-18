import {
  View,
  Text,
  FlatList,
  Pressable,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useState, useMemo } from "react";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase";
import { useRoute, useNavigation } from "@react-navigation/native";
import { exercises as BASE_EXERCISES } from "../data/exercises";

export default function AddRoutineExerciseScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const routineId = route.params.routineId;

  const [search, setSearch] = useState("");
  const [showCustomModal, setShowCustomModal] = useState(false);

  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [rest, setRest] = useState("60");

  const [custom, setCustom] = useState({
    name: "",
    description: "",
    muscle_group: "",
    equipment: "",
  });

  /* 🔎 FILTRO LOCAL */
  const filteredExercises = useMemo(() => {
    return BASE_EXERCISES.filter(e =>
      e.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  /* ➕ AÑADIR EJERCICIO BASE */
  const addGlobalExercise = async (exerciseId: string) => {
    await updateDoc(doc(db, "routines", routineId), {
      exercises: arrayUnion({
        type: "base",
        exerciseId,
        sets: Number(sets),
        reps: Number(reps),
        rest_seconds: Number(rest),
      }),
    });

    navigation.goBack();
  };

  /* ➕ AÑADIR PERSONALIZADO */
  const addCustomExercise = async () => {
    if (!custom.name.trim()) {
      Alert.alert("Error", "El nombre es obligatorio");
      return;
    }

    await updateDoc(doc(db, "routines", routineId), {
      exercises: arrayUnion({
        type: "custom",
        ...custom,
        sets: Number(sets),
        reps: Number(reps),
        rest_seconds: Number(rest),
      }),
    });

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* BUSCADOR */}
      <TextInput
        placeholder="Buscar ejercicio"
        placeholderTextColor="#64748B"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {/* LISTA */}
      <FlatList
        data={filteredExercises}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <Pressable
            onPress={() => setShowCustomModal(true)}
            style={styles.createCustom}
          >
            <Text style={styles.createCustomText}>
              + Crear ejercicio personalizado
            </Text>
          </Pressable>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => addGlobalExercise(item.id)}
            style={styles.exerciseCard}
          >
            <Text style={styles.exerciseName}>{item.name}</Text>
            <Text style={styles.exerciseMeta}>
              {item.type.toUpperCase()} · {item.level}
            </Text>
          </Pressable>
        )}
      />

      {/* MODAL PERSONALIZADO */}
      <Modal visible={showCustomModal} animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modal}
        >
          <Text style={styles.modalTitle}>Ejercicio personalizado</Text>

          <TextInput
            placeholder="Nombre"
            style={styles.input}
            onChangeText={t => setCustom(p => ({ ...p, name: t }))}
          />
          <TextInput
            placeholder="Descripción"
            style={styles.input}
            onChangeText={t => setCustom(p => ({ ...p, description: t }))}
          />
          <TextInput
            placeholder="Grupo muscular"
            style={styles.input}
            onChangeText={t => setCustom(p => ({ ...p, muscle_group: t }))}
          />
          <TextInput
            placeholder="Equipo"
            style={styles.input}
            onChangeText={t => setCustom(p => ({ ...p, equipment: t }))}
          />

          <View style={styles.row}>
            <TextInput
              placeholder="Series"
              value={sets}
              onChangeText={setSets}
              keyboardType="numeric"
              style={[styles.input, styles.smallInput]}
            />
            <TextInput
              placeholder="Reps"
              value={reps}
              onChangeText={setReps}
              keyboardType="numeric"
              style={[styles.input, styles.smallInput]}
            />
            <TextInput
              placeholder="Descanso"
              value={rest}
              onChangeText={setRest}
              keyboardType="numeric"
              style={[styles.input, styles.smallInput]}
            />
          </View>

          <Pressable onPress={addCustomExercise} style={styles.saveButton}>
            <Text style={styles.saveText}>Guardar</Text>
          </Pressable>

          <Pressable onPress={() => setShowCustomModal(false)}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
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
    padding: 16,
  },

  search: {
    backgroundColor: "#020617",
    borderRadius: 14,
    padding: 14,
    color: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 12,
  },

  exerciseCard: {
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  exerciseName: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "700",
  },

  exerciseMeta: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 4,
  },

  createCustom: {
    backgroundColor: "#020617",
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#22C55E",
    alignItems: "center",
    marginTop: 20,
  },

  createCustomText: {
    color: "#22C55E",
    fontWeight: "700",
  },

  /* MODAL */
  modal: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 20,
  },

  modalTitle: {
    color: "#F8FAFC",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 16,
  },

  input: {
    backgroundColor: "#020617",
    borderRadius: 14,
    padding: 14,
    color: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    gap: 8,
  },

  smallInput: {
    flex: 1,
  },

  saveButton: {
    backgroundColor: "#22C55E",
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
  },

  saveText: {
    color: "#052E16",
    fontWeight: "900",
    textAlign: "center",
  },

  cancelText: {
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 12,
  },
});
