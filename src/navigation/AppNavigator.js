import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

import PatientHomeScreen from "../screens/patient/PatientHomeScreen";
import BloodRequestScreen from "../screens/patient/BloodRequestScreen";
import MyRequestsScreen from "../screens/patient/MyRequestsScreen";
import RequestDetailsScreen from "../screens/patient/RequestDetailsScreen";
import LiveTrackingScreen from "../screens/patient/LiveTrackingScreen";
import RealTimeChatScreen from "../screens/patient/RealTimeChatScreen";
import ProfileScreen from "../screens/patient/ProfileScreen";

import HospitalHomeScreen from "../screens/hospital/HospitalHomeScreen";
import HospitalBloodRequestScreen from "../screens/hospital/HospitalBloodRequestScreen";
import HospitalInventoryScreen from "../screens/hospital/HospitalInventoryScreen";
import HospitalRequestsScreen from "../screens/hospital/HospitalRequestsScreen";
import HospitalProfileScreen from "../screens/hospital/HospitalProfileScreen";

import DonorNavigator from "./DonorNavigator";
const Stack = createNativeStackNavigator();
export default function AppNavigator() {
  return (
    
      <NavigationContainer>
  <Stack.Navigator
    initialRouteName="Splash"
    screenOptions={{ headerShown: false }}
  >
    {/* Auth */}
    <Stack.Screen name="Splash" component={SplashScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />

    {/* Patient Module */}
    <Stack.Screen name="PatientHome" component={PatientHomeScreen} />
    <Stack.Screen name="BloodRequest" component={BloodRequestScreen} />
    <Stack.Screen name="MyRequests" component={MyRequestsScreen} />
    <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} />
    <Stack.Screen name="LiveTracking" component={LiveTrackingScreen} />
    <Stack.Screen name="RealTimeChat" component={RealTimeChatScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />

    {/* Hospital Module */}
    <Stack.Screen name="HospitalHome" component={HospitalHomeScreen} />
    <Stack.Screen name="HospitalRequests" component={HospitalRequestsScreen} />
    <Stack.Screen name="HospitalInventory" component={HospitalInventoryScreen} />
    <Stack.Screen name="HospitalBloodRequest" component={HospitalBloodRequestScreen} />
    <Stack.Screen name="HospitalProfile" component={HospitalProfileScreen} />
    {/* Donor Module */}
<Stack.Screen name="DonorHome" component={DonorNavigator} />
  </Stack.Navigator>
</NavigationContainer>
  );
}