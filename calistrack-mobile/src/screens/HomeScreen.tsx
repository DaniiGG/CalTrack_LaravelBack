import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

import { auth, db } from '../../firebase';
import { useAuth } from '../context/AuthContext';

type Routine = {
  id: string;
  name: string;
  description?: string;
  level: string;
};

export default function HomeScreen() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();
  const { logout } = useAuth();

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
    } catch (error) {
      console.log('Error cargando rutinas:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRoutines();
    }, [])
  );

  const handleLogout = async () => {
    await signOut(auth);
    logout(); // limpia estado global
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 50 }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9f9f9', padding: 16 }}>
      {/* Crear rutina */}
      <Pressable
        onPress={() => navigation.navigate('CreateRoutine')}
        style={{
          backgroundColor: '#0a7',
          padding: 14,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>
          + Nueva Rutina
        </Text>
      </Pressable>

      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 16 }}>
        Mis Rutinas 💪
      </Text>

      {/* Lista de rutinas */}
      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ color: '#666', textAlign: 'center', marginTop: 40 }}>
            Aún no tienes rutinas creadas
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate('RoutineDetail', { routineId: item.id })
            }
            style={{
              backgroundColor: '#fff',
              padding: 16,
              borderRadius: 10,
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
              {item.name}
            </Text>

            {item.description ? (
              <Text style={{ color: '#666', marginTop: 4 }}>
                {item.description}
              </Text>
            ) : null}

            <Text style={{ marginTop: 8, fontStyle: 'italic' }}>
              Nivel: {item.level}
            </Text>
          </Pressable>
        )}
      />

      {/* Logout */}
      <Pressable
        onPress={handleLogout}
        style={{
          backgroundColor: '#111',
          padding: 14,
          borderRadius: 8,
          alignItems: 'center',
          marginTop: 12,
        }}
      >
        <Text style={{ color: '#fff' }}>Logout</Text>
      </Pressable>
    </View>
  );
}
