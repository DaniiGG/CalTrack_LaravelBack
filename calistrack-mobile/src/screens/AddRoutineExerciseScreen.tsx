import {
  View,
  Text,
  FlatList,
  Pressable,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function AddRoutineExerciseScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const routineId = route.params.routineId;

  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCustomModal, setShowCustomModal] = useState(false);

  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [rest, setRest] = useState('60');

  const [search, setSearch] = useState('');

  const [custom, setCustom] = useState({
    name: '',
    description: '',
    muscle_group: '',
    equipment: '',
    difficulty: 'beginner',
  });

  useEffect(() => {
    const loadExercises = async () => {
      const snapshot = await getDocs(collection(db, 'exercises'));
      setExercises(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    loadExercises();
  }, []);

  const addGlobalExercise = async (exerciseId: string) => {
    await updateDoc(doc(db, 'routines', routineId), {
      exercises: arrayUnion({
        type: 'global',
        exerciseId,
        sets: Number(sets),
        reps: Number(reps),
        rest_seconds: Number(rest),
      }),
    });
    navigation.goBack();
  };

  const addCustomExercise = async () => {
    if (!custom.name) {
      Alert.alert('Nombre obligatorio');
      return;
    }

    await updateDoc(doc(db, 'routines', routineId), {
      exercises: arrayUnion({
        type: 'custom',
        ...custom,
        sets: Number(sets),
        reps: Number(reps),
        rest_seconds: Number(rest),
      }),
    });

    navigation.goBack();
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  const filteredExercises = exercises.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        placeholder="Buscar ejercicio"
        value={search}
        onChangeText={setSearch}
        style={{
          marginHorizontal: 16,
          padding: 10,
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
        }}
      />
      {filteredExercises.length === 0 && (
        <Pressable
          onPress={() => setShowCustomModal(true)}
          style={{
            backgroundColor: '#111',
            padding: 14,
            margin: 16,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff' }}>
            + Crear ejercicio personalizado
          </Text>
        </Pressable>
      )}

      <FlatList
        data={filteredExercises}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => addGlobalExercise(item.id)}
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderColor: '#ddd',
            }}
          >
            <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
            <Text style={{ color: '#666' }}>{item.muscle_group}</Text>
          </Pressable>
        )}
      />

      {/* 🔥 MODAL EJERCICIO PERSONALIZADO */}
      <Modal visible={showCustomModal} animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, padding: 20 }}
        >
          <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>
            Ejercicio personalizado
          </Text>

          <TextInput placeholder="Nombre" onChangeText={t => setCustom(p => ({ ...p, name: t }))} />
          <TextInput placeholder="Descripción" onChangeText={t => setCustom(p => ({ ...p, description: t }))} />
          <TextInput placeholder="Grupo muscular" onChangeText={t => setCustom(p => ({ ...p, muscle_group: t }))} />
          <TextInput placeholder="Equipo" onChangeText={t => setCustom(p => ({ ...p, equipment: t }))} />

          <TextInput placeholder="Series" value={sets} onChangeText={setSets} keyboardType="numeric" />
          <TextInput placeholder="Reps" value={reps} onChangeText={setReps} keyboardType="numeric" />
          <TextInput placeholder="Descanso (s)" value={rest} onChangeText={setRest} keyboardType="numeric" />

          <Pressable onPress={addCustomExercise} style={{ backgroundColor: '#0a7', padding: 14 }}>
            <Text style={{ color: '#fff', textAlign: 'center' }}>Guardar</Text>
          </Pressable>

          <Pressable onPress={() => setShowCustomModal(false)}>
            <Text style={{ textAlign: 'center', marginTop: 10 }}>Cancelar</Text>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
