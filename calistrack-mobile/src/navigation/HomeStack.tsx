import { createNativeStackNavigator } from '@react-navigation/native-stack';

//import RoutineListScreen from '../screens/RoutineScreen';
import HomeScreen from '../screens/HomeScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import WorkoutFocusScreen from '../screens/WorkoutFocusScreen';
import SignUpScreen from '../screens/SignUpScreen';
import CalendarScreen from '../screens/CalendarScreen';
import WeeklyPlanScreen from "../screens/WeeklyPlanScreen";

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator 
    screenOptions={{
        headerStyle: { backgroundColor: "#020617" },
        headerTintColor: "#F8FAFC",
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="Workout" component={WorkoutScreen} />
      <Stack.Screen
        name="WorkoutFocus"
        component={WorkoutFocusScreen}
        options={{
          headerShown: false,
          gestureEnabled: false, // evita swipe back accidental
        }}
      />
      <Stack.Screen
        name="WeeklyPlan"
        component={WeeklyPlanScreen}
      />
      <Stack.Screen name="Calendar" component={CalendarScreen} />
    </Stack.Navigator>
  );
}
