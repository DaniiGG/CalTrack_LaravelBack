import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HomeStack from "./HomeStack";
import GameStack from "./GameStack";
import RoutinesStack from "./TrainingStack";
import UserStack from "./UserStack";

const Tab = createBottomTabNavigator();

export default function TabsNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: "#22C55E",
        tabBarInactiveTintColor: "#64748B",

        tabBarStyle: {
          backgroundColor: "#020617",
          borderTopColor: "#1E293B",
          height: 64 + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600"
        },

        tabBarIcon: ({ color }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case "Home":
              iconName = "home-outline";
              break;
            case "Game":
              iconName = "flash-outline";
              break;
            case "Training":
              iconName = "barbell-outline";
              break;
            case "You":
              iconName = "settings-outline";
              break;
            default:
              iconName = "ellipse-outline";
          }

          return (
            <Ionicons
              name={iconName}
              size={22}
              color={color}
            />
          );
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Game" component={GameStack} />
      <Tab.Screen name="Training" component={RoutinesStack} />
      <Tab.Screen name="You" component={UserStack} />
    </Tab.Navigator>
  );
}
