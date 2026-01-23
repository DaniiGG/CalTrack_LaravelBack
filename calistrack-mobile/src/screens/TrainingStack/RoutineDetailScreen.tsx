import {
  View,
  Text,
  Pressable,
  Alert,
  FlatList,
  Modal,
  TextInput,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState, useMemo } from "react";
import { doc, onSnapshot, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { exercises as BASE_EXERCISES } from "../../data/exercises";

const EXERCISE_MAP = Object.fromEntries(
  BASE_EXERCISES.map(e => [e.id, e])
);

export default function RoutineDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { routineId } = route.params;

  const [routine, setRoutine] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [editModal, setEditModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [editSets, setEditSets] = useState("");
  const [editReps, setEditReps] = useState("");
  const [editRest, setEditRest] = useState("");

  /* 🔥 ESCUCHAR RUTINA */
  useEffect(() => {
    const ref = doc(db, "routines", routineId);
    const unsub = onSnapshot(ref, snap => {
      setRoutine(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    });
    return unsub;
  }, [routineId]);

  /* 🔗 JOIN LOCAL */
  const enrichedExercises = useMemo(() => {
    if (!routine?.exercises) return [];

    return routine.exercises.map((item: any) => {
      if (item.type === "base") {
        return {
          ...item,
          exercise: EXERCISE_MAP[item.exerciseId],
        };
      }

      return {
        ...item,
        exercise: {
          name: item.name,
          muscle_group: item.muscle_group,
        },
      };
    });
  }, [routine?.exercises]);

  const openEdit = (item: any, index: number) => {
    setEditingIndex(index);
    setEditSets(String(item.sets));
    setEditReps(String(item.reps));
    setEditRest(String(item.rest_seconds));
    setEditModal(true);
  };

  const saveEdit = async () => {
    if (editingIndex === null) return;

    const updated = [...routine.exercises];
    updated[editingIndex] = {
      ...updated[editingIndex],
      sets: Number(editSets),
      reps: Number(editReps),
      rest_seconds: Number(editRest),
    };

    await updateDoc(doc(db, "routines", routineId), {
      exercises: updated,
    });

    setEditModal(false);
  };

  const deleteRoutine = () => {
    Alert.alert("Eliminar rutina", "¿Seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "routines", routineId));
          navigation.goBack();
        },
      },
    ]);
  };

  if (loading || !routine) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#94A3B8" }}>Cargando rutina...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Text style={styles.title}>{routine.name}</Text>
      {routine.description && (
        <Text style={styles.desc}>{routine.description}</Text>
      )}
      <Text style={styles.level}>Nivel: {routine.level}</Text>

      {/* EJERCICIOS */}
      <FlatList
        data={enrichedExercises}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                {item.exercise?.name ?? "Ejercicio"}
              </Text>

              <Pressable onPress={() => openEdit(item, index)}>
                <Text style={{ fontSize: 18 }}>✏️</Text>
              </Pressable>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.stat}>Series: {item.sets}</Text>
              <Text style={styles.stat}>Reps: {item.reps}</Text>
              <Text style={styles.stat}>
                Descanso: {item.rest_seconds}s
              </Text>
            </View>
          </View>
        )}
      />

      {/* ACCIONES */}
      <Pressable
        style={styles.primary}
        onPress={() =>
          navigation.navigate("WorkoutFocus", {
            routine: { ...routine, exercises: enrichedExercises },
          })
        }
      >
        <Text style={styles.primaryText}>▶️ Empezar entrenamiento</Text>
      </Pressable>

      <Pressable
        style={styles.secondary}
        onPress={() =>
          navigation.navigate("AddRoutineExercise", { routineId })
        }
      >
        <Text style={styles.secondaryText}>+ Añadir ejercicio</Text>
      </Pressable>

      <Pressable style={styles.danger} onPress={deleteRoutine}>
        <Text style={styles.dangerText}>Eliminar rutina</Text>
      </Pressable>

      {/* MODAL EDIT */}
      <Modal visible={editModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Editar ejercicio</Text>

            <TextInput
              placeholder="Series"
              value={editSets}
              onChangeText={setEditSets}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              placeholder="Reps"
              value={editReps}
              onChangeText={setEditReps}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              placeholder="Descanso (s)"
              value={editRest}
              onChangeText={setEditRest}
              keyboardType="numeric"
              style={styles.input}
            />

            <Pressable style={styles.primary} onPress={saveEdit}>
              <Text style={styles.primaryText}>Guardar cambios</Text>
            </Pressable>

            <Pressable onPress={() => setEditModal(false)}>
              <Text style={styles.cancel}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
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

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F172A",
  },

  title: {
    color: "#F8FAFC",
    fontSize: 28,
    fontWeight: "900",
  },

  desc: {
    color: "#94A3B8",
    marginTop: 6,
  },

  level: {
    color: "#64748B",
    fontStyle: "italic",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cardTitle: {
    color: "#F8FAFC",
    fontWeight: "700",
    fontSize: 16,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  stat: {
    color: "#94A3B8",
    fontSize: 12,
  },

  primary: {
    backgroundColor: "#22C55E",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 10,
  },

  primaryText: {
    color: "#052E16",
    fontWeight: "900",
  },

  secondary: {
    backgroundColor: "#020617",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 10,
  },

  secondaryText: {
    color: "#F8FAFC",
    fontWeight: "700",
  },

  danger: {
    backgroundColor: "#7F1D1D",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  dangerText: {
    color: "#FECACA",
    fontWeight: "900",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },

  modal: {
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 20,
  },

  modalTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },

  input: {
    backgroundColor: "#0F172A",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
    color: "#F8FAFC",
    marginBottom: 10,
  },

  cancel: {
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 10,
  },
});
