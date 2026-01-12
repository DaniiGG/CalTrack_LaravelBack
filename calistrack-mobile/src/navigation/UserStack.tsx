import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UserScreen from '../screens/UserScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


const Stack = createNativeStackNavigator();


export default function UserStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#020617" },
        headerTintColor: "#F8FAFC",
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Stack.Screen
        name="Profile"
        component={UserScreen}
        options={({ navigation }) => ({
          title: "Perfil",
          headerRight: () => (
            <Pressable
              onPress={() => navigation.navigate("EditProfile")}
              style={{ marginRight: 12 }}
            >
              <Ionicons
                name="settings-outline"
                size={22}
                color="#F8FAFC"
              />
            </Pressable>
          ),
        })}
      />

      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: "Editar perfil" }}
      />
    </Stack.Navigator>
  );
}