export type Level = "basic" | "intermediate" | "advanced";

export type ExerciseType = "push" | "pull" | "core";

export type Exercise = {
  id: string;
  name: string;
  level: Level;
  repMin: number;
  repMax: number;
  type: ExerciseType;
};

export const exercises: Exercise[] = [
  {
    id: "pullups",
    name: "Pull Ups",
    level: "basic",
    repMin: 1,
    repMax: 5,
    type: "pull"
  },
  {
    id: "chinups",
    name: "Chin Ups",
    level: "basic",
    repMin: 1,
    repMax: 5,
    type: "pull"
  },
  {
    id: "neutral",
    name: "Neutral grip pull ups",
    level: "basic",
    repMin: 1,
    repMax: 5,
    type: "pull"
  },
  {
    id: "pushups",
    name: "Push Ups",
    level: "basic",
    repMin: 5,
    repMax: 15,
    type: "push"
  },
  {
    id: "plank",
    name: "Plank (sec)",
    level: "basic",
    repMin: 20,
    repMax: 60,
    type: "core"
  },
  {
    id: "muscle_up",
    name: "Muscle Up",
    level: "intermediate",
    repMin: 1,
    repMax: 5,
    type: "pull"
  },
  {
    id: "dips",
    name: "Dips",
    level: "intermediate",
    repMin: 2,
    repMax: 10,
    type: "push"
  },
  

  {
    id: "pullups",
    name: "Archer Pull Ups",
    level: "intermediate",
    repMin: 2,
    repMax: 8,
    type: "pull"
  }
];
