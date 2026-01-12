import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HomeStack from "./HomeStack";
import GameScreen from "../screens/ComboGameScreen";
import HistoryScreen from "../screens/HistoryScreen";
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
            case "History":
              iconName = "time-outline";
              break;
            case "Settings":
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
      <Tab.Screen name="Game" component={GameScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="You" component={UserStack} />
    </Tab.Navigator>
  );
}
