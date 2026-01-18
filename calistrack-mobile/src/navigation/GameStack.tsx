import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GameScreen from '../screens/ComboGameScreen';


const Stack = createNativeStackNavigator();

export default function GameStack() {
  return (
    <Stack.Navigator
    screenOptions={{
        headerStyle: { backgroundColor: "#020617" },
        headerTintColor: "#F8FAFC",
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Stack.Screen name="GameScreen" component={GameScreen} />
    </Stack.Navigator>
  );
}
