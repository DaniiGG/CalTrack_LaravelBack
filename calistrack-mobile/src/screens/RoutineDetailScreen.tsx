import { View, Text, Pressable, Alert, FlatList, Image, Modal, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState, useMemo } from 'react';
import {
  doc,
  onSnapshot,
  deleteDoc,
  getDocs,
  collection,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { updateDoc } from 'firebase/firestore';

export default function RoutineDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { routineId } = route.params;

  const [routine, setRoutine] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [editModal, setEditModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [editSets, setEditSets] = useState('');
  const [editReps, setEditReps] = useState('');
  const [editRest, setEditRest] = useState('');

  // 🔥 ejercicios globales por id
  const [globalExercises, setGlobalExercises] = useState<Record<string, any>>(
    {}
  );
  const openEdit = (item: any, index: number) => {
    setEditingIndex(index);
    setEditSets(String(item.sets));
    setEditReps(String(item.reps));
    setEditRest(String(item.rest_seconds));
    setEditModal(true);
  };

  const saveEdit = async () => {
    if (editingIndex === null) return;

    const updatedExercises = [...routine.exercises];

    updatedExercises[editingIndex] = {
      ...updatedExercises[editingIndex],
      sets: Number(editSets),
      reps: Number(editReps),
      rest_seconds: Number(editRest),
    };

    await updateDoc(doc(db, 'routines', routineId), {
      exercises: updatedExercises,
    });

    setEditModal(false);
  };

  // 🔥 cargar ejercicios globales una vez
  useEffect(() => {
    const loadGlobalExercises = async () => {
      const snap = await getDocs(collection(db, 'exercises'));
      const map: Record<string, any> = {};

      snap.docs.forEach(d => {
        map[d.id] = d.data();
      });

      setGlobalExercises(map);
    };

    loadGlobalExercises();
  }, []);

  // 🔥 escuchar rutina en tiempo real
  useEffect(() => {
    if (!routineId) return;

    const ref = doc(db, 'routines', routineId);

    const unsubscribe = onSnapshot(ref, snapshot => {
      if (snapshot.exists()) {
        setRoutine({ id: snapshot.id, ...snapshot.data() });
      } else {
        setRoutine(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [routineId]);

  const deleteRoutine = () => {
    Alert.alert('Eliminar rutina', '¿Seguro que quieres eliminar esta rutina?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'routines', routineId));
          navigation.goBack();
        },
      },
    ]);
  };

  // 🔥 ejercicios enriquecidos (JOIN manual)
  const enrichedExercises = useMemo(() => {
    if (!routine?.exercises) return [];

    return routine.exercises.map((item: any) => {
      if (item.type === 'global') {
        return {
          ...item,
          exercise: globalExercises[item.exerciseId],
        };
      }

      // custom
      return {
        ...item,
        exercise: {
          name: item.name,
          muscle_group: item.muscle_group,
          image_url: item.image_url,
        },
      };
    });
  }, [routine?.exercises, globalExercises]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Cargando rutina...</Text>
      </View>
    );
  }

  if (!routine) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No se pudo cargar la rutina</Text>
      </View>
    );
  }



  return (
    <><Modal visible={editModal} animationType="slide" transparent>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 20,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>
            Editar ejercicio
          </Text>

          <TextInput
            placeholder="Series"
            value={editSets}
            onChangeText={setEditSets}
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 10,
              padding: 12,
              marginBottom: 10,
            }}
          />

          <TextInput
            placeholder="Reps"
            value={editReps}
            onChangeText={setEditReps}
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 10,
              padding: 12,
              marginBottom: 10,
            }}
          />

          <TextInput
            placeholder="Descanso (s)"
            value={editRest}
            onChangeText={setEditRest}
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 10,
              padding: 12,
              marginBottom: 10,
            }}
          />

          <Pressable
            onPress={saveEdit}
            style={{
              backgroundColor: '#0a7',
              padding: 14,
              borderRadius: 10,
              marginTop: 10,
            }}
          >
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
              Guardar cambios
            </Text>
          </Pressable>

          <Pressable onPress={() => setEditModal(false)}>
            <Text style={{ textAlign: 'center', marginTop: 10 }}>
              Cancelar
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
      <View style={{ flex: 1, padding: 20, backgroundColor: '#f9f9f9' }}>
        <Text style={{ fontSize: 30, fontWeight: 'bold', marginBottom: 8 }}>
          {routine.name}
        </Text>

        {routine.description && (
          <Text style={{ fontSize: 16, color: '#666', marginBottom: 8 }}>
            {routine.description}
          </Text>
        )}

        <Text style={{ fontStyle: 'italic', marginBottom: 20 }}>
          Nivel: {routine.level}
        </Text>

        <FlatList
          data={enrichedExercises}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={cardStyle}>
              <View style={cardHeader}>
                <Text style={cardTitle}>
                  {item.exercise?.name ?? 'Ejercicio'}
                </Text>

                <Pressable onPress={() => openEdit(item, index)}>
                  <Text style={{ fontSize: 18 }}>✏️</Text>
                </Pressable>
              </View>

              <View style={statsRow}>
                <Text style={statText}>Series: {item.sets}</Text>
                <Text style={statText}>Reps: {item.reps}</Text>
                <Text style={statText}>
                  Descanso: {item.rest_seconds}s
                </Text>
              </View>

              {item.exercise?.image_url && (
                <Image
                  source={{ uri: item.exercise.image_url }}
                  style={imageStyle}
                />
              )}
            </View>
          )}
        />

        {/* ▶️ ENTRENAR */}
        <Pressable
          onPress={() =>
            navigation.navigate('WorkoutFocus', {
              routine: {
                ...routine,
                exercises: enrichedExercises, 
              },
            })
          }
          style={{
            backgroundColor: '#0a7',
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
            ▶️ Empezar entrenamiento
          </Text>
        </Pressable>

        {/* ➕ AÑADIR EJERCICIO */}
        <Pressable
          onPress={() =>
            navigation.navigate('AddRoutineExercise', { routineId: routine.id })
          }
          style={{
            backgroundColor: '#111',
            padding: 14,
            borderRadius: 8,
            marginBottom: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>
            + Añadir ejercicio
          </Text>
        </Pressable>

        {/* 🗑️ ELIMINAR */}
        <Pressable
          onPress={deleteRoutine}
          style={{
            backgroundColor: '#c00',
            padding: 16,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>
            Eliminar Rutina
          </Text>
        </Pressable>
      </View>
    </>
  );


}
const inputStyle = {
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 10,
  padding: 12,
  marginBottom: 10,
};

const cardStyle = {
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: 16,
  marginBottom: 14,
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 3,
};

const cardHeader = {
  flexDirection: 'row' as const,
  justifyContent: 'space-between' as const,
  alignItems: 'center' as const,
};

const cardTitle = {
  fontSize: 18,
  fontWeight: '700' as const,
};

const statsRow = {
  flexDirection: 'row' as const,
  justifyContent: 'space-between' as const,
  marginTop: 10,
};

const statText = {
  color: '#555',
};

const imageStyle = {
  width: '100%' as const,
  height: 140,
  borderRadius: 12,
  marginTop: 12,
};


