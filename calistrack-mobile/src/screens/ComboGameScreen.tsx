import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet
} from "react-native";

import { exercises, Exercise, Level } from "../data/exercises";

/* =========================
   TYPES
========================= */
type ComboMove = {
  id: string;
  name: string;
  reps: number;
};

/* =========================
   RULES
========================= */
const rulesByLevel: Record<Level, number> = {
  basic: 5,
  intermediate: 8,
  advanced: 10
};

/* =========================
   UTILS
========================= */
const random = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/* =========================
   LOGIC (BALANCED & NO REPEATS)
========================= */
function generateCombo(level: Level): ComboMove[] {
  const totalMoves = rulesByLevel[level];

  const pool = exercises.filter(
    e => e.level === level || e.level === "basic"
  );

  const combo: ComboMove[] = [];
  let lastType: Exercise["type"] | null = null;

  const typeCount: Record<Exercise["type"], number> = {
    pull: 0,
    push: 0,
    core: 0
  };

  const typeLimits =
    level === "basic"
      ? { pull: 2, push: 2, core: 1 }
      : level === "intermediate"
      ? { pull: 3, push: 3, core: 2 }
      : { pull: 4, push: 4, core: 3 };

  for (let i = 0; i < totalMoves; i++) {
    const validPool = pool.filter(e => {
      if (typeCount[e.type] >= typeLimits[e.type]) return false;
      if (e.type === lastType) return false;
      return true;
    });

    const usablePool =
      validPool.length > 0
        ? validPool
        : pool.filter(e => e.type !== lastType);

    const exercise =
      usablePool[random(0, usablePool.length - 1)];

    const reps =
      level === "basic"
        ? Math.min(
            random(exercise.repMin, exercise.repMax),
            exercise.type === "pull"
              ? 8
              : exercise.type === "push"
              ? 15
              : 40
          )
        : random(exercise.repMin, exercise.repMax);

    combo.push({
      id: `${exercise.id}-${i}`,
      name: exercise.name,
      reps
    });

    lastType = exercise.type;
    typeCount[exercise.type]++;
  }

  return combo;
}

/* =========================
   SCREEN
========================= */
export default function HomeScreen() {
  const [level, setLevel] = useState<Level>("basic");
  const [combo, setCombo] = useState<ComboMove[]>([]);

  const LevelButton = ({ value }: { value: Level }) => (
    <Pressable
      onPress={() => setLevel(value)}
      style={[
        styles.levelButton,
        level === value && styles.levelButtonActive
      ]}
    >
      <Text
        style={[
          styles.levelButtonText,
          level === value && styles.levelButtonTextActive
        ]}
      >
        {value.toUpperCase()}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔥 Calisthenics Combo</Text>
      <Text style={styles.subtitle}>
        Balanced workout flow
      </Text>

      <View style={styles.levelContainer}>
        <LevelButton value="basic" />
        <LevelButton value="intermediate" />
        <LevelButton value="advanced" />
      </View>

      <Pressable
        style={styles.generateButton}
        onPress={() => setCombo(generateCombo(level))}
      >
        <Text style={styles.generateButtonText}>
          GENERATE COMBO
        </Text>
      </Pressable>

      <FlatList
        data={combo}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Text style={styles.cardIndex}>
              {index + 1}
            </Text>
            <View>
              <Text style={styles.cardReps}>
                {item.reps} reps
              </Text>
              <Text style={styles.cardName}>
                {item.name}
              </Text>
            </View>
          </View>
        )}
      />
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
    padding: 20
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#F8FAFC",
    textAlign: "center"
  },
  subtitle: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 20
  },

  levelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20
  },
  levelButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: "#1E293B",
    alignItems: "center"
  },
  levelButtonActive: {
    backgroundColor: "#22C55E"
  },
  levelButtonText: {
    color: "#CBD5F5",
    fontWeight: "600",
    fontSize: 12
  },
  levelButtonTextActive: {
    color: "#052E16"
  },

  generateButton: {
    backgroundColor: "#38BDF8",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20
  },
  generateButtonText: {
    color: "#082F49",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 1
  },

  list: {
    paddingBottom: 40
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12
  },
  cardIndex: {
    color: "#22C55E",
    fontWeight: "800",
    fontSize: 20,
    marginRight: 16
  },
  cardReps: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "700"
  },
  cardName: {
    color: "#94A3B8",
    fontSize: 14
  }
});
