import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyRoutinesScreen from '../screens/MyRoutinesScreen';
import RoutineDetailScreen from '../screens/RoutineDetailScreen';
import AddRoutineScreen from '../screens/AddRoutineExerciseScreen';
import CreateRoutineScreen from '../screens/CreateRoutineScreen';


const Stack = createNativeStackNavigator();

export default function RoutinesStack() {
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
    </Stack.Navigator>
  );
}
