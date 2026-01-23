import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";

type TimerParams = {
  hours?: number;
  minutes?: number;
  seconds?: number;
  mode?: "countdown" | "stopwatch";
};

export default function TrainingTimerScreen() {
  const route = useRoute();
  const { hours = 0, minutes = 0, seconds = 0, mode = "countdown" } =
    route.params as TimerParams;

  const [running, setRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tiempo en milisegundos
  const initialMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
  const [remaining, setRemaining] = useState(initialMs);

  // Stopwatch solo si quieres tenerlo
  const [time, setTime] = useState(0);

  // Timer engine
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!running) return;

      if (mode === "countdown") {
        setRemaining((t) => {
          if (t <= 100) {
            stopTimer();
            return 0;
          }
          return t - 100;
        });
      } else if (mode === "stopwatch") {
        setTime((t) => t + 100);
      }
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const stopTimer = () => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const resetTimer = () => {
    stopTimer();
    setRemaining(initialMs);
    setTime(0);
    setRunning(true);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⏱ Timer</Text>

      <Text style={styles.time}>
        {mode === "countdown" ? formatTime(remaining) : formatTime(time)}
      </Text>

      <View style={styles.controls}>
        <Pressable onPress={() => setRunning(!running)}>
          <Ionicons
            name={running ? "pause-circle" : "play-circle"}
            size={80}
            color="#22C55E"
          />
        </Pressable>

        <Pressable onPress={resetTimer}>
          <Ionicons name="refresh-circle" size={80} color="#64748B" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#F8FAFC",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 40,
  },
  time: {
    color: "#22C55E",
    fontSize: 72,
    fontWeight: "800",
  },
  controls: {
    flexDirection: "row",
    gap: 40,
    marginTop: 50,
  },
});
