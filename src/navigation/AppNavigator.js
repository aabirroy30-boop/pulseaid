import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import PatientHomeScreen from "../screens/PatientHomeScreen";
import BloodRequestScreen from "../screens/BloodRequestScreen";
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    
      <NavigationContainer>
  <Stack.Navigator
    initialRouteName="Login"
    screenOptions={{
      headerShown: false,
    }}
  >
      <Stack.Screen name="BloodRequest" component={BloodRequestScreen} />
      
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
        />

        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />

        <Stack.Screen
          name="Register"
          component={RegisterScreen}
        />

        <Stack.Screen
          name="PatientHome"
          component={PatientHomeScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}