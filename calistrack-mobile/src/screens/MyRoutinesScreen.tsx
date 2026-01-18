import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, where } from 'firebase/firestore';

import { auth, db } from '../../firebase';

type Routine = {
  id: string;
  name: string;
  description?: string;
  level: string;
};

export default function MyRoutinesScreen() {
  const navigation = useNavigation<any>();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRoutines = async () => {
    if (!auth.currentUser) return;

    try {
      setLoading(true);

      const q = query(
        collection(db, 'routines'),
        where('userId', '==', auth.currentUser.uid)
      );

      const snapshot = await getDocs(q);

      const data: Routine[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Routine, 'id'>),
      }));

      setRoutines(data);
    } catch (e) {
      console.log('Error cargando rutinas', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRoutines();
    }, [])
  );

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
      <View style={styles.header}>
        <Text style={styles.title}>Mis Rutinas</Text>
        <Pressable
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateRoutine')}
        >
          <Text style={styles.createButtonText}>+ Nueva</Text>
        </Pressable>
      </View>

      {/* LISTA */}
      <FlatList
        data={routines}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No tienes rutinas todavía
            </Text>
            <Pressable
              style={styles.emptyButton}
              onPress={() => navigation.navigate('CreateRoutine')}
            >
              <Text style={styles.emptyButtonText}>
                Crear mi primera rutina
              </Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              navigation.navigate('RoutineDetail', {
                routineId: item.id,
              })
            }
          >
            <Text style={styles.cardTitle}>{item.name}</Text>

            {item.description ? (
              <Text style={styles.cardDescription}>
                {item.description}
              </Text>
            ) : null}

            <Text style={styles.cardLevel}>
              Nivel: {item.level}
            </Text>
          </Pressable>
        )}
      />
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
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* HEADER */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '800',
  },
  createButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  createButtonText: {
    color: '#022C22',
    fontWeight: '700',
  },

  /* CARD */
  card: {
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  cardDescription: {
    color: '#94A3B8',
    marginTop: 6,
  },
  cardLevel: {
    color: '#64748B',
    marginTop: 8,
    fontStyle: 'italic',
  },

  /* EMPTY */
  empty: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    color: '#64748B',
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#022C22',
    fontWeight: '700',
  },
});
