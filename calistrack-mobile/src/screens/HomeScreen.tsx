import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { auth, db } from '../../firebase';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const user = auth.currentUser;

  const today = new Date().toISOString().split('T')[0];

  const [todayWorkout, setTodayWorkout] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);

      const q = query(
        collection(db, 'workouts'),
        where('userId', '==', user.uid)
      );

      const snap = await getDocs(q);
      const workouts = snap.docs.map(d => d.data());

      setTodayWorkout(workouts.find(w => w.date === today));
      setStreak(workouts.filter(w => w.completed).length);

      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Text style={styles.greeting}>👋 Hola</Text>
      <Text style={styles.subtitle}>Hoy toca moverse</Text>

      {/* CTA */}
      <Pressable
        style={styles.mainButton}
        onPress={() => {
          if (todayWorkout) {
            navigation.navigate('WorkoutFocus', {
              workout: todayWorkout,
            });
          } else {
            navigation.navigate('Calendar');
          }
        }}
      >
        <Text style={styles.mainButtonText}>
          {todayWorkout
            ? '▶️ Empezar entrenamiento'
            : '📅 Programar entreno'}
        </Text>
      </Pressable>

      {/* INFO HOY */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Hoy</Text>

        {todayWorkout ? (
          <Text style={styles.cardValue}>
            {todayWorkout.routineName}
          </Text>
        ) : (
          <Text style={styles.muted}>
            No hay entreno programado
          </Text>
        )}
      </View>

      {/* STREAK */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Racha</Text>
        <Text style={styles.cardValue}>🔥 {streak} entrenos</Text>
      </View>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('CreateRoutine')}
      >
        <Text style={styles.secondaryText}>
          📅 Crear rutina
        </Text>
      </Pressable>

      {/* CALENDAR NAV */}
      <Pressable
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('Calendar')}
      >
        <Text style={styles.secondaryText}>
          📅 Ver calendario
        </Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#020617',
  },
  greeting: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: '#94A3B8',
    marginBottom: 20,
  },
  mainButton: {
    backgroundColor: '#22C55E',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  mainButtonText: {
    color: '#022C22',
    fontWeight: '800',
    fontSize: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#94A3B8',
    marginBottom: 6,
  },
  cardValue: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  muted: {
    color: '#64748B',
  },
  secondaryButton: {
    marginTop: 'auto',
    borderWidth: 1,
    borderColor: '#22C55E',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#22C55E',
    fontWeight: '700',
  },
});
