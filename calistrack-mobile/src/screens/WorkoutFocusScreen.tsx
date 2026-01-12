import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

type Phase = "set" | "rest";

export default function WorkoutFocusScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const routine = route.params?.routine;

  if (!routine) {
    return (
      <View style={styles.center}>
        <Text style={styles.textMuted}>Routine not found</Text>
      </View>
    );
  }

  const exercises = routine.exercises ?? [];

  if (!exercises.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.textMuted}>No exercises</Text>
      </View>
    );
  }

  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [phase, setPhase] = useState<Phase>("set");
  const [timer, setTimer] = useState(0);
  const [finished, setFinished] = useState(false);

  const startTime = useRef(Date.now());
  const finishAnim = useRef(new Animated.Value(0)).current;

  const currentExercise = exercises[exerciseIndex];
  const totalSets = currentExercise.sets;
  const repsTarget = currentExercise.reps;
  const restRecommended = currentExercise.rest_seconds ?? 60;

  const exerciseName =
    currentExercise.exercise?.name ??
    currentExercise.name ??
    "Exercise";

  // TIMER
  useEffect(() => {
    startTime.current = Date.now();
    setTimer(0);

    const interval = setInterval(() => {
      setTimer(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, currentSet, exerciseIndex]);

  const completeSet = () => {
    if (currentSet < totalSets) {
      setPhase("rest");
    } else {
      if (exerciseIndex < exercises.length - 1) {
        setExerciseIndex(prev => prev + 1);
        setCurrentSet(1);
        setPhase("set");
      } else {
        setFinished(true);
        Animated.timing(finishAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        }).start(() => {
          setTimeout(() => {
            navigation.replace("WorkoutSummary", { routine });
          }, 900);
        });
      }
    }
  };

  const finishRest = () => {
    setCurrentSet(prev => prev + 1);
    setPhase("set");
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Text style={styles.exercise}>{exerciseName}</Text>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          SET {currentSet} / {totalSets}
        </Text>
      </View>

      {/* TIMER CIRCLE */}
      <View
        style={[
          styles.timerCircle,
          phase === "rest" && { borderColor: "#F59E0B" }
        ]}
      >
        <Text
          style={[
            styles.timer,
            phase === "rest" && { color: "#F59E0B" }
          ]}
        >
          {timer}s
        </Text>
        {phase === "set" && (
          <Text style={styles.reps}>{repsTarget} reps</Text>
        )}
      </View>

      {/* ACTION */}
      {phase === "set" ? (
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.9}
          onPress={completeSet}
        >
          <Text style={styles.primaryButtonText}>
            SET COMPLETED
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.9}
          onPress={finishRest}
        >
          <Text style={styles.secondaryButtonText}>
            CONTINUE ({restRecommended}s)
          </Text>
        </TouchableOpacity>
      )}

      {/* FINISH OVERLAY */}
      {finished && (
        <Animated.View
          style={[
            styles.finishOverlay,
            { opacity: finishAnim }
          ]}
        >
          <Text style={styles.finishTitle}>
            WORKOUT COMPLETED
          </Text>
          <Text style={styles.finishSub}>
            Strong session 💪
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

/* =========================
   STYLES
========================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 60,
    paddingHorizontal: 24
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617"
  },

  exercise: {
    color: "#F8FAFC",
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center"
  },

  badge: {
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1E293B",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999
  },

  badgeText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700"
  },

  timerCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 6,
    borderColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center"
  },

  timer: {
    color: "#22C55E",
    fontSize: 56,
    fontWeight: "800"
  },

  reps: {
    color: "#94A3B8",
    fontSize: 16,
    marginTop: 4
  },

  primaryButton: {
    backgroundColor: "#22C55E",
    paddingVertical: 20,
    paddingHorizontal: 60,
    borderRadius: 999
  },

  primaryButtonText: {
    color: "#052E16",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 1
  },

  secondaryButton: {
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#F59E0B",
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 999
  },

  secondaryButtonText: {
    color: "#F59E0B",
    fontWeight: "700",
    fontSize: 14
  },

  finishOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center"
  },

  finishTitle: {
    color: "#22C55E",
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 8
  },

  finishSub: {
    color: "#94A3B8",
    fontSize: 16
  },

  textMuted: {
    color: "#94A3B8"
  }
});
