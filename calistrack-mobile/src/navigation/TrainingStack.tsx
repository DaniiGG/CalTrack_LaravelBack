import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyRoutinesScreen from '../screens/TrainingStack/MyRoutinesScreen';
import RoutineDetailScreen from '../screens/TrainingStack/RoutineDetailScreen';
import AddRoutineScreen from '../screens/TrainingStack/AddRoutineExerciseScreen';
import CreateRoutineScreen from '../screens/TrainingStack/CreateRoutineScreen';
import TrainingTimerScreen from '../screens/TrainingStack/TrainingTimerScreen';
import ConfigTimerScreen from '../screens/TrainingStack/ConfigTimerScreen';


const Stack = createNativeStackNavigator();

export default function TrainingStack() {
  return (
    <Stack.Navigator
    screenOptions={{
        headerStyle: { backgroundColor: "#020617" },
        headerTintColor: "#F8FAFC",
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Stack.Screen name="RoutinesScreen" component={MyRoutinesScreen} />
        <Stack.Screen name="RoutineDetail" component={RoutineDetailScreen} />
        <Stack.Screen name="CreateRoutine" component={CreateRoutineScreen} />
        <Stack.Screen name="AddRoutineExercise" component={AddRoutineScreen} />
        <Stack.Screen name="TrainingTimer" component={TrainingTimerScreen} />
        <Stack.Screen name="ConfigTimer" component={ConfigTimerScreen} />
    </Stack.Navigator>
  );
}
