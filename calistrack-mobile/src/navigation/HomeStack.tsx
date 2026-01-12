import { createNativeStackNavigator } from '@react-navigation/native-stack';

//import RoutineListScreen from '../screens/RoutineScreen';
import HomeScreen from '../screens/HomeScreen';
import AddRoutineExerciseScreen from '../screens/AddRoutineExerciseScreen';
import CreateRoutineScreen from '../screens/CreateRoutineScreen';
import RoutineDetailScreen from '../screens/RoutineDetailScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import WorkoutFocusScreen from '../screens/WorkoutFocusScreen';
import SignUpScreen from '../screens/SignUpScreen';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="AddRoutineExercise" component={AddRoutineExerciseScreen} />
      <Stack.Screen name="CreateRoutine" component={CreateRoutineScreen} />
      <Stack.Screen name="RoutineDetail" component={RoutineDetailScreen} />
      <Stack.Screen name="Workout" component={WorkoutScreen} />
      <Stack.Screen
        name="WorkoutFocus"
        component={WorkoutFocusScreen}
        options={{
          headerShown: false,
          gestureEnabled: false, // evita swipe back accidental
        }}
      />
    </Stack.Navigator>
  );
}
