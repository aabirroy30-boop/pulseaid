import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DonorLoginScreen from "../screens/donor/DonorLoginScreen";
import DonorRegisterScreen from "../screens/donor/DonorRegisterScreen";
import DonorDashboardScreen from "../screens/donor/DonorDashboardScreen";
import BloodRequestsScreen from "../screens/donor/BloodRequestsScreen";
import DonationHistoryScreen from "../screens/donor/DonationHistoryScreen";
import DigitalVaultScreen from "../screens/donor/DigitalVaultScreen";
import NotificationsScreen from "../screens/donor/NotificationsScreen";
import DonorProfileScreen from "../screens/donor/DonorProfileScreen";

const Stack = createNativeStackNavigator();

export default function DonorNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerStyle: {
          backgroundColor: "#D62828",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="Login"
        component={DonorLoginScreen}
      />

      <Stack.Screen
        name="Register"
        component={DonorRegisterScreen}
      />

      <Stack.Screen
        name="Dashboard"
        component={DonorDashboardScreen}
      />

      <Stack.Screen
        name="Blood Requests"
        component={BloodRequestsScreen}
      />

      <Stack.Screen
        name="Donation History"
        component={DonationHistoryScreen}
      />

      <Stack.Screen
        name="Digital Vault"
        component={DigitalVaultScreen}
      />

      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
      />

      <Stack.Screen
        name="Profile"
        component={DonorProfileScreen}
      />
    </Stack.Navigator>
  );
}