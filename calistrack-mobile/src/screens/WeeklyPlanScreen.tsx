import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  FlatList,
} from "react-native";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { Ionicons } from "@expo/vector-icons";

const DAYS = [
  { key: "monday", label: "Lunes" },
  { key: "tuesday", label: "Martes" },
  { key: "wednesday", label: "Miércoles" },
  { key: "thursday", label: "Jueves" },
  { key: "friday", label: "Viernes" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
];

type Routine = {
  id: string;
  name: string;
};

type WeeklyPlan = {
  userId: string;
  days: {
    [key: string]:
      | {
          routineId: string;
          routineName: string;
        }
      | null;
  };
};

export default function WeeklyPlanScreen() {
  const user = auth.currentUser;

  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  /* =====================
     LOAD DATA
  ===================== */
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      // Rutinas
      const rq = query(
        collection(db, "routines"),
        where("userId", "==", user.uid)
      );
      const snap = await getDocs(rq);
      setRoutines(
        snap.docs.map(d => ({
          id: d.id,
          name: d.data().name,
        }))
      );

      // Plan semanal
      const ref = doc(db, "weeklyPlans", user.uid);
      const planSnap = await getDoc(ref);

      if (planSnap.exists()) {
        setPlan(planSnap.data() as WeeklyPlan);
      } else {
        const emptyPlan: WeeklyPlan = {
          userId: user.uid,
          days: {},
        };
        setPlan(emptyPlan);
        await setDoc(ref, emptyPlan);
      }
    };

    load();
  }, []);

  /* =====================
     ASSIGN ROUTINE
  ===================== */
  const assignRoutine = async (routine: Routine) => {
    if (!user || !selectedDay || !plan) return;

    const updatedPlan: WeeklyPlan = {
      ...plan,
      userId: user.uid,
      days: {
        ...plan.days,
        [selectedDay]: {
          routineId: routine.id,
          routineName: routine.name,
        },
      },
    };

    setPlan(updatedPlan);
    await setDoc(doc(db, "weeklyPlans", user.uid), updatedPlan);
    setSelectedDay(null);
  };

  const clearDay = async () => {
    if (!user || !selectedDay || !plan) return;

    const updatedPlan: WeeklyPlan = {
      ...plan,
      days: {
        ...plan.days,
        [selectedDay]: null,
      },
    };

    setPlan(updatedPlan);
    await setDoc(doc(db, "weeklyPlans", user.uid), updatedPlan);
    setSelectedDay(null);
  };

  const routineNameForDay = (dayKey: string) =>
    plan?.days?.[dayKey]?.routineName ?? "Descanso";

  if (!plan) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📆 Plan semanal</Text>
      <Text style={styles.subtitle}>
        Configura tu base de entrenamientos
      </Text>

      {DAYS.map(day => (
        <Pressable
          key={day.key}
          style={styles.dayRow}
          onPress={() => setSelectedDay(day.key)}
        >
          <Text style={styles.dayText}>{day.label}</Text>

          <View style={styles.right}>
            <Text style={styles.routineText}>
              {routineNameForDay(day.key)}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="#94A3B8"
            />
          </View>
        </Pressable>
      ))}

      {/* MODAL */}
      <Modal transparent animationType="fade" visible={!!selectedDay}>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              Elegir rutina
            </Text>

            <FlatList
              data={routines}
              keyExtractor={i => i.id}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.routineButton}
                  onPress={() => assignRoutine(item)}
                >
                  <Ionicons
                    name="fitness-outline"
                    size={18}
                    color="#22C55E"
                  />
                  <Text style={styles.routineName}>
                    {item.name}
                  </Text>
                </Pressable>
              )}
            />

            <Pressable
              style={styles.clearButton}
              onPress={clearDay}
            >
              <Ionicons
                name="bed-outline"
                size={18}
                color="#94A3B8"
              />
              <Text style={styles.clearText}>
                Marcar descanso
              </Text>
            </Pressable>

            <Pressable onPress={() => setSelectedDay(null)}>
              <Text style={styles.cancel}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* =====================
   STYLES
===================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 20,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 26,
    fontWeight: "800",
  },
  subtitle: {
    color: "#94A3B8",
    marginBottom: 20,
  },
  dayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 10,
  },
  dayText: {
    color: "#F8FAFC",
    fontWeight: "700",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  routineText: {
    color: "#94A3B8",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#020617",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  modalTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  routineButton: {
    flexDirection: "row",
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 10,
  },
  routineName: {
    color: "#F8FAFC",
    fontWeight: "600",
  },
  clearButton: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    padding: 14,
    marginTop: 6,
  },
  clearText: {
    color: "#94A3B8",
  },
  cancel: {
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 12,
  },
});
