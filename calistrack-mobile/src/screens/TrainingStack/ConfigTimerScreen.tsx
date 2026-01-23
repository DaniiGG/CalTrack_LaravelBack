import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const ITEM_HEIGHT = 60; // Volvemos al height original

type TimerMode = "countdown" | "emom";

export default function TimerConfigScreen() {
  const [mode, setMode] = useState<TimerMode>("countdown");

  // Cuenta atrás
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(10);
  const [seconds, setSeconds] = useState(0);
  const navigation = useNavigation<any>();

  // EMOM
  const [emomMinutes, setEmomMinutes] = useState(1);
  const [emomSeconds, setEmomSeconds] = useState(0);

  const hoursRef = useRef<FlatList<number> | null>(null);
  const minutesRef = useRef<FlatList<number> | null>(null);
  const secondsRef = useRef<FlatList<number> | null>(null);

  /* ===================== Helpers ===================== */
  const generateValues = (max: number) => {
    const arr = [];
    for (let i = 0; i <= max; i++) arr.push(i);
    return arr;
  };

  const snapToValue = (
    ev: NativeSyntheticEvent<NativeScrollEvent>,
    values: number[],
    onSelect: (v: number) => void
  ) => {
    const index = Math.round(ev.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const value = values[index % values.length];
    if (value !== undefined) onSelect(value);
  };

  const renderPicker = (
    values: number[],
    selectedValue: number,
    onSelect: (v: number) => void,
    ref?: React.RefObject<FlatList<number> | null>
  ) => {
    const circularValues = [...values, ...values, ...values];
    const middleIndex = values.length;

    return (
      <FlatList
        ref={ref}
        data={circularValues}
        keyExtractor={(v, i) => i.toString()}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        initialScrollIndex={middleIndex + selectedValue}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        onMomentumScrollEnd={(ev) => snapToValue(ev, values, onSelect)}
        style={{ height: ITEM_HEIGHT * 3 }}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT,
          alignItems: "center",
        }}
        renderItem={({ item, index }) => {
          const isSelected = index % values.length === selectedValue;
          return (
            <View style={styles.pickerItem}>
              <Text
                style={[styles.pickerText, isSelected && styles.pickerTextSelected]}
              >
                {item.toString().padStart(2, "0")}
              </Text>
            </View>
          );
        }}
      />
    );
  };

  /* Opciones rápidas */
  const quickMinutes = [10, 15, 20];

  return (
    <View style={styles.container}>
      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        <Pressable
          style={[styles.modeButton, mode === "countdown" && styles.modeActive]}
          onPress={() => setMode("countdown")}
        >
          <Text style={[styles.modeText, mode === "countdown" && styles.modeTextActive]}>
            Cuenta atrás
          </Text>
        </Pressable>
        <Pressable
          style={[styles.modeButton, mode === "emom" && styles.modeActive]}
          onPress={() => setMode("emom")}
        >
          <Text style={[styles.modeText, mode === "emom" && styles.modeTextActive]}>
            EMOM
          </Text>
        </Pressable>
      </View>

      {/* PICKERS */}
      {mode === "countdown" && (
        <>
          <View style={styles.pickerContainer}>
            <View style={styles.column}>
              {renderPicker(generateValues(99), hours, setHours, hoursRef)}
            </View>
            <View style={styles.column}>
              {renderPicker(generateValues(59), minutes, setMinutes, minutesRef)}
            </View>
            <View style={styles.column}>
              {renderPicker(generateValues(59), seconds, setSeconds, secondsRef)}
            </View>
          </View>

          {/* Opciones rápidas */}
          <View style={styles.quickOptions}>
            {quickMinutes.map((m) => (
              <Pressable
                key={m}
                style={styles.quickButton}
                onPress={() => {
                  setHours(0);
                  setMinutes(m);
                  setSeconds(0);
                }}
              >
                <Text style={styles.quickText}>{m} min</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {mode === "emom" && (
        <View style={styles.pickerContainer}>
          <View style={styles.column}>
            {renderPicker(generateValues(59), emomMinutes, setEmomMinutes, hoursRef)}
          </View>
          <View style={styles.column}>
            {renderPicker(generateValues(59), emomSeconds, setEmomSeconds, minutesRef)}
          </View>
        </View>
      )}

      {/* Botón para ir al reloj */}
      <Pressable style={styles.startButton} onPress={() => navigation.navigate("TrainingTimer", {
  hours,
  minutes,
  seconds,
  mode: "countdown", // o "stopwatch" si quieres
})}>
        <Text style={styles.startText}>Ir al reloj</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingTop: 50,
    alignItems: "center",
  },
  modeSelector: {
    flexDirection: "row",
    marginBottom: 20,
  },
  modeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 12,
    marginHorizontal: 6,
  },
  modeActive: {
    borderColor: "#22C55E",
    backgroundColor: "#022C22",
  },
  modeText: {
    color: "#94A3B8",
    fontWeight: "600",
  },
  modeTextActive: {
    color: "#22C55E",
    fontWeight: "700",
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  column: {
    marginHorizontal: 12, // espacio horizontal entre columnas
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    width: 60,
  },
  pickerText: {
    color: "#64748B",
    fontSize: 35,
  },
  pickerTextSelected: {
    color: "#22C55E",
    fontWeight: "800",
    fontSize: 50,
  },
  quickOptions: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "center",
    gap: 10,
  },
  quickButton: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  quickText: {
    color: "#94A3B8",
    fontWeight: "600",
  },
  startButton: {
    marginTop: 30,
    backgroundColor: "#22C55E",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  startText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
});
