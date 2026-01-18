import { View, Text, TextInput, Pressable, Alert, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';

type Level = 'beginner' | 'intermediate' | 'advanced';

export default function CreateRoutineScreen() {
  const navigation = useNavigation<any>();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<Level>('beginner');
  const [isPublic, setIsPublic] = useState(false);

  const createRoutine = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    if (!auth.currentUser) {
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }

    try {
      await addDoc(collection(db, 'routines'), {
        userId: auth.currentUser.uid,
        name: name.trim(),
        description: description.trim(),
        level,
        isPublic,
        likesCount: 0,
        createdAt: serverTimestamp(),
      });

      Alert.alert('Rutina creada', 'Se ha guardado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.log(error);
      Alert.alert('Error al crear rutina');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nueva Rutina</Text>

      <TextInput
        placeholder="Nombre de la rutina"
        placeholderTextColor="#94A3B8"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="Descripción (opcional)"
        placeholderTextColor="#94A3B8"
        value={description}
        onChangeText={setDescription}
        style={[styles.input, { height: 80 }]}
        multiline
      />

      {/* NIVEL */}
      <Text style={styles.sectionLabel}>Nivel</Text>
      <View style={styles.levelRow}>
        {(['beginner', 'intermediate', 'advanced'] as Level[]).map(l => (
          <Pressable
            key={l}
            onPress={() => setLevel(l)}
            style={[
              styles.levelButton,
              level === l && styles.levelButtonActive,
            ]}
          >
            <Text
              style={[
                styles.levelText,
                level === l && styles.levelTextActive,
              ]}
            >
              {l.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* VISIBILIDAD */}
      <Text style={styles.sectionLabel}>Visibilidad</Text>
      <Pressable
        onPress={() => setIsPublic(p => !p)}
        style={[
          styles.visibilityButton,
          isPublic && styles.visibilityPublic,
        ]}
      >
        <Text
          style={[
            styles.visibilityText,
            isPublic && styles.visibilityTextPublic,
          ]}
        >
          {isPublic ? '🌍 Rutina pública' : '🔒 Rutina privada'}
        </Text>
      </Pressable>

      {/* GUARDAR */}
      <Pressable onPress={createRoutine} style={styles.saveButton}>
        <Text style={styles.saveText}>Guardar Rutina</Text>
      </Pressable>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 20,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    color: '#F8FAFC',
    marginBottom: 14,
  },
  sectionLabel: {
    color: '#94A3B8',
    marginBottom: 8,
    marginTop: 8,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  levelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  levelButtonActive: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  levelText: {
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: 12,
  },
  levelTextActive: {
    color: '#022C22',
  },
  visibilityButton: {
    borderWidth: 1,
    borderColor: '#22C55E',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  visibilityPublic: {
    backgroundColor: '#22C55E',
  },
  visibilityText: {
    color: '#22C55E',
    fontWeight: '700',
  },
  visibilityTextPublic: {
    color: '#022C22',
  },
  saveButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveText: {
    color: '#022C22',
    fontWeight: '800',
    fontSize: 15,
  },
});
