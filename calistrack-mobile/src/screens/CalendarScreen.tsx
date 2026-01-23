import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import { useEffect, useState, useLayoutEffect } from "react";
import { Calendar, LocaleConfig } from "react-native-calendars";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

/* 🇪🇸 CALENDARIO EN ESPAÑOL */
LocaleConfig.locales["es"] = {
  monthNames: [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
  ],
  monthNamesShort: ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"],
  dayNames: ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"],
  dayNamesShort: ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"],
  today: "Hoy",
};
LocaleConfig.defaultLocale = "es";

/* ===================== TYPES ===================== */
type Routine = { id: string; name: string };
type Workout = {
  id: string;
  routineName: string;
  routineId: string;
  date: string;
  completed: boolean;
};
type WeeklyPlan = {
  userId: string;
  days: { [key: string]: { routineId: string; routineName: string } | null };
};

const DAY_KEYS = [
  "monday","tuesday","wednesday","thursday","friday","saturday","sunday"
];

/* ===================== COMPONENT ===================== */
export default function CalendarScreen() {
  const user = auth.currentUser;
  const navigation = useNavigation<any>();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);

  /* ===================== LOAD DATA ===================== */
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const rq = query(collection(db, "routines"), where("userId", "==", user.uid));
      const routinesSnap = await getDocs(rq);
      setRoutines(routinesSnap.docs.map(d => ({ id: d.id, name: d.data().name })));

      const wq = query(collection(db, "workouts"), where("userId", "==", user.uid));
      const workoutsSnap = await getDocs(wq);
      setWorkouts(workoutsSnap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Workout, "id">) })));

      const planSnap = await getDoc(doc(db, "weeklyPlans", user.uid));
      if (planSnap.exists()) setWeeklyPlan(planSnap.data() as WeeklyPlan);
    };

    loadData();
  }, []);

  /* ===================== HELPERS ===================== */
  const getNextMonday = () => {
    const today = new Date();
    const day = today.getDay(); // 0 = domingo
    const diff = (9 - day) % 7 || 7; // días hasta el próximo lunes
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + diff);
    nextMonday.setHours(0,0,0,0);
    return nextMonday;
  };

  const workoutsForDay = workouts.filter(w => w.date === selectedDate);

  const markedDates = workouts.reduce((acc: any, w) => {
    acc[w.date] = { marked: true, dotColor: w.completed ? "#22C55E" : "#F59E0B" };
    return acc;
  }, {});

  /* ===================== VOLCAR PLAN SEMANAL DESDE PRÓXIMO LUNES ===================== */
  const applyWeeklyPlan = async () => {
    if (!weeklyPlan || !user) return;

    const nextMonday = getNextMonday();
    const newWorkouts: Workout[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(nextMonday);
      date.setDate(nextMonday.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      if (workouts.some(w => w.date === dateStr)) continue;

      const routine = weeklyPlan.days[DAY_KEYS[i]];
      if (!routine) continue;

      const docRef = await addDoc(collection(db, "workouts"), {
        userId: user.uid,
        routineId: routine.routineId,
        routineName: routine.routineName,
        date: dateStr,
        completed: false,
      });

      newWorkouts.push({
        id: docRef.id,
        routineId: routine.routineId,
        routineName: routine.routineName,
        date: dateStr,
        completed: false,
      });
    }

    setWorkouts(prev => [...prev, ...newWorkouts]);
  };

  /* ===================== CRUD ===================== */
  const toggleCompleted = async (workout: Workout) => {
    await updateDoc(doc(db, "workouts", workout.id), { completed: !workout.completed });
    setWorkouts(prev => prev.map(w => w.id === workout.id ? { ...w, completed: !w.completed } : w));
  };

  const deleteWorkout = async (workoutId: string) => {
    Alert.alert("Eliminar entreno", "¿Seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        await deleteDoc(doc(db, "workouts", workoutId));
        setWorkouts(prev => prev.filter(w => w.id !== workoutId));
      }},
    ]);
  };

  const assignRoutine = async (routine: Routine) => {
    if (!user || !selectedDate) return;

    const docRef = await addDoc(collection(db, "workouts"), {
      userId: user.uid,
      routineId: routine.id,
      routineName: routine.name,
      date: selectedDate,
      completed: false,
    });

    setWorkouts(prev => [...prev, {
      id: docRef.id,
      routineId: routine.id,
      routineName: routine.name,
      date: selectedDate,
      completed: false
    }]);

    setModalVisible(false);
  };

  /* ===================== HEADER ===================== */
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate("WeeklyPlan")} style={{ marginRight: 10 }}>
          <Ionicons name="calendar-outline" size={22} color="#22C55E" />
        </Pressable>
      ),
    });
  }, []);

  /* ===================== RENDER ===================== */
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>📅 Calendario</Text>
      <Text style={styles.subtitle}>Planifica tu semana / mes</Text>

      <Pressable style={styles.applyButton} onPress={applyWeeklyPlan}>
        <Ionicons name="download-outline" size={20} color="#22C55E" />
        <Text style={styles.applyText}>Volcar plan semanal</Text>
      </Pressable>

      <Calendar
        firstDay={1}
        onDayPress={d => setSelectedDate(d.dateString)}
        markedDates={{
          ...markedDates,
          ...(selectedDate ? { [selectedDate]: { selected: true, selectedColor: "#22C55E" } } : {}),
        }}
        theme={{
          backgroundColor: "#020617",
          calendarBackground: "#020617",
          dayTextColor: "#F8FAFC",
          monthTextColor: "#F8FAFC",
          arrowColor: "#22C55E",
          todayTextColor: "#22C55E",
        }}
      />

      <View style={styles.bottomBox}>
        {!selectedDate ? (
          <Text style={styles.muted}>Selecciona un día</Text>
        ) : (
          <>
            <Text style={styles.label}>Entrenos del día</Text>

            {workoutsForDay.length === 0 ? (
              <Text style={styles.muted}>Descanso</Text>
            ) : (
              <ScrollView style={{ maxHeight: 200 }}>
                {workoutsForDay.map(w => (
                  <View key={w.id} style={styles.workoutRow}>
                    <View style={styles.workoutLeft}>
                      <Pressable onPress={() => toggleCompleted(w)}>
                        <Ionicons name={w.completed ? "checkmark-circle" : "ellipse-outline"} size={22} color={w.completed ? "#22C55E" : "#64748B"} />
                      </Pressable>
                      <Text style={styles.workoutName}>{w.routineName}</Text>
                    </View>
                    <Pressable onPress={() => deleteWorkout(w.id)}>
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            )}

            <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Ionicons name="add-circle-outline" size={20} color="#22C55E" />
              <Text style={styles.addText}>Añadir entreno</Text>
            </Pressable>
          </>
        )}
      </View>

      {/* MODAL */}
      <Modal transparent animationType="fade" visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Elegir rutina</Text>
            <FlatList
              data={routines}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <Pressable style={styles.routineButton} onPress={() => assignRoutine(item)}>
                  <Ionicons name="fitness-outline" size={18} color="#22C55E" />
                  <Text style={styles.routineText}>{item.name}</Text>
                </Pressable>
              )}
            />
            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={styles.cancel}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617", padding: 20 },
  title: { color: "#F8FAFC", fontSize: 26, fontWeight: "800" },
  subtitle: { color: "#94A3B8", marginBottom: 12 },
  applyButton: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#22C55E",
    marginBottom: 10,
  },
  applyText: { color: "#22C55E", fontWeight: "700" },
  bottomBox: {
    marginTop: 15,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  muted: { color: "#94A3B8", textAlign: "center", marginVertical: 8 },
  label: { color: "#94A3B8", marginBottom: 10 },
  workoutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  workoutLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  workoutName: { color: "#F8FAFC", fontSize: 16, fontWeight: "600" },
  addButton: {
    marginTop: 12,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#22C55E",
  },
  addText: { color: "#22C55E", fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 20 },
  modal: { backgroundColor: "#020617", borderRadius: 18, padding: 20, borderWidth: 1, borderColor: "#1E293B" },
  modalTitle: { color: "#F8FAFC", fontSize: 18, fontWeight: "700", marginBottom: 12 },
  routineButton: { flexDirection: "row", alignItems: "center", gap: 8, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "#1E293B", marginBottom: 10 },
  routineText: { color: "#F8FAFC", fontWeight: "600" },
  cancel: { color: "#94A3B8", textAlign: "center", marginTop: 12 },
});
