import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  FlatList,
} from "react-native";
import { useEffect, useState } from "react";
import { Calendar } from "react-native-calendars";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../../firebase";

type Routine = {
  id: string;
  name: string;
};

type Workout = {
  id: string;
  routineName: string;
  routineId: string;
  date: string;
};

export default function CalendarScreen() {
  const user = auth.currentUser;

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [routines, setRoutines] = useState<Routine[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  /* =====================
     LOAD DATA
  ===================== */
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      // Rutinas
      const rq = query(
        collection(db, "routines"),
        where("userId", "==", user.uid)
      );
      const routinesSnap = await getDocs(rq);
      setRoutines(
        routinesSnap.docs.map((d) => ({
          id: d.id,
          name: d.data().name,
        }))
      );

      // Entrenos programados
      const wq = query(
        collection(db, "workouts"),
        where("userId", "==", user.uid)
      );
      const workoutsSnap = await getDocs(wq);
      setWorkouts(
        workoutsSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Workout, "id">),
        }))
      );
    };

    loadData();
  }, []);

  /* =====================
     HELPERS
  ===================== */
  const workoutForDay = workouts.find(
    (w) => w.date === selectedDate
  );

  const markedDates = workouts.reduce((acc, w) => {
    acc[w.date] = { marked: true, dotColor: "#22C55E" };
    return acc;
  }, {} as any);

  /* =====================
     ASSIGN ROUTINE
  ===================== */
  const assignRoutine = async (routine: Routine) => {
    if (!user || !selectedDate) return;

    const doc = await addDoc(collection(db, "workouts"), {
      userId: user.uid,
      routineId: routine.id,
      routineName: routine.name,
      date: selectedDate,
      completed: false,
    });

    setWorkouts((prev) => [
      ...prev,
      {
        id: doc.id,
        routineId: routine.id,
        routineName: routine.name,
        date: selectedDate,
      },
    ]);

    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Calendario</Text>
      <Text style={styles.subtitle}>
        Planifica tus entrenamientos
      </Text>

      {/* CALENDARIO */}
      <Calendar
        firstDay={1} // LUNES PRIMERO
        theme={{
          backgroundColor: "#020617",
          calendarBackground: "#020617",
          dayTextColor: "#F8FAFC",
          monthTextColor: "#F8FAFC",
          arrowColor: "#22C55E",
          todayTextColor: "#22C55E",
        }}
        markedDates={{
          ...markedDates,
          ...(selectedDate
            ? {
                [selectedDate]: {
                  selected: true,
                  selectedColor: "#22C55E",
                },
              }
            : {}),
        }}
        onDayPress={(day) => setSelectedDate(day.dateString)}
      />

      {/* ZONA INFERIOR */}
      <View style={styles.bottomBox}>
        {!selectedDate ? (
          <Text style={styles.muted}>
            Selecciona un día
          </Text>
        ) : workoutForDay ? (
          <>
            <Text style={styles.label}>Entrenamiento</Text>
            <Text style={styles.workoutName}>
              {workoutForDay.routineName}
            </Text>

            <Pressable style={styles.startButton}>
              <Text style={styles.startText}>
                ▶️ Empezar
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.muted}>
              No hay entreno este día
            </Text>

            <Pressable
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.addText}>
                + Programar entrenamiento
              </Text>
            </Pressable>
          </>
        )}
      </View>

      {/* MODAL */}
      <Modal transparent animationType="fade" visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              Elegir rutina
            </Text>

            <FlatList
              data={routines}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.routineButton}
                  onPress={() => assignRoutine(item)}
                >
                  <Text style={styles.routineText}>
                    {item.name}
                  </Text>
                </Pressable>
              )}
            />

            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={styles.cancel}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
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
    marginBottom: 16,
  },
  bottomBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  muted: {
    color: "#94A3B8",
    textAlign: "center",
  },
  label: {
    color: "#94A3B8",
    marginBottom: 6,
  },
  workoutName: {
    color: "#F8FAFC",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  startButton: {
    backgroundColor: "#22C55E",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  startText: {
    color: "#022C22",
    fontWeight: "800",
  },
  addButton: {
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#22C55E",
    alignItems: "center",
  },
  addText: {
    color: "#22C55E",
    fontWeight: "700",
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
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 10,
  },
  routineText: {
    color: "#F8FAFC",
    fontWeight: "600",
  },
  cancel: {
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 12,
  },
});
