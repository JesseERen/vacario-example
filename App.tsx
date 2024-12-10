import * as React from 'react'
import {
    View, StyleSheet, TouchableOpacity,
} from 'react-native'
import { NavigationContainer, useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import {
    PaperProvider, MD3DarkTheme,
} from 'react-native-paper'

import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import IconMD from 'react-native-vector-icons/MaterialIcons'

import { MMKV } from 'react-native-mmkv'

import HomeScreen from './screens/home'
import Timeline from './screens/timeline'
import PackingListScreen from './screens/packing_list'
import LoginScreen from './screens/login'
import RegisterScreen from './screens/register'
import VacarioTheme from './theme'
import SettingsScreen from './screens/settings'
import ProfileScreen from './screens/profile'
import CreateActivityScreen from './screens/create_activity'
import Accommodation from './screens/details/accommodation'
import POI from './screens/details/poi'
import Flight from './screens/details/flight'
import Restaurant from './screens/details/restaurant'
import AuthContext from './hooks/account'

const Stack = createNativeStackNavigator()

const Tab = createBottomTabNavigator()

export const storage = new MMKV()

const theme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: '#6EC8FD',
        text: '#FFFFFF',
        primaryContainer: '#216289',
        secondary: '#F1F1F1',
        secondaryContainer: '#1F2B32',
        surfaceVariant: '#222226',
        background: '#1a191e',
        surface: '#1a191e',
        elevation: {
            level0: 'transparent',
            level1: '#24252C',
            level2: '#2D2D35',
            level3: '#2D2D35',
            level4: '#2D2D35',
            level5: '#31313A',
        },
    },
}

function App() {
    return (
        <PaperProvider theme={theme}>
            <NavigationContainer theme={VacarioTheme}>
                <StackNavigator />
            </NavigationContainer>
        </PaperProvider>
    )
}

function StackNavigator() {
    const [isLoggedIn, setIsLoggedIn] = React.useState(storage.contains('userToken'))

    const authContext = React.useMemo(() => {
        return { isLoggedIn, setIsLoggedIn }
    }, [isLoggedIn, setIsLoggedIn])

    return (
        <AuthContext.Provider value={authContext}>
            <Stack.Navigator>
                {isLoggedIn ? (<>
                    <Stack.Screen
                        name="Tabs"
                        component={TabNavigator}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen name="Settings" component={SettingsScreen} />
                    <Stack.Screen name="Details-Accommodation" component={Accommodation} />
                    <Stack.Screen name="Details-Flight" component={Flight} />
                    <Stack.Screen name="Details-POI" component={POI} />
                    <Stack.Screen name="Details-Restaurant" component={Restaurant} />
                    <Stack.Screen name="New activity" component={CreateActivityScreen} />
                    <Stack.Screen name="Profile" component={ProfileScreen} />
                </>) : (<>
                    <Stack.Screen name="Register" component={RegisterScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                </>)}
            </Stack.Navigator>
        </AuthContext.Provider>
    )
}

function SettingsButton({ handleSettingsPress }: { handleSettingsPress: () => void }) {
    return (
        <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={handleSettingsPress}>
                <Icon
                    style={{ marginRight: 20 }}
                    name="cog"
                    size={20}
                    color="#cac4d0"
                />
            </TouchableOpacity>
        </View>
    )
}

function TabNavigator() {
    const navigation = useNavigation<NavProps>()

    const handleSettingsPress = () => {
        navigation.navigate('Settings')
    }

    return (
        <Tab.Navigator
            screenOptions={{
                // eslint-disable-next-line react/no-unstable-nested-components
                headerRight: () => {
                    return <SettingsButton handleSettingsPress={handleSettingsPress} />
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    // eslint-disable-next-line react/no-unstable-nested-components
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="format-list-bulleted" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Timeline"
                component={Timeline}
                options={{
                    // eslint-disable-next-line react/no-unstable-nested-components
                    tabBarIcon: ({ color, size }) => (
                        <IconMD name="view-timeline" color={color} size={size} />
                    ),
                    tabBarItemStyle: {
                        display: storage.getString('selectedVacationId') ? 'flex' : 'none',
                    },
                }}
            />
            <Tab.Screen
                name="PackingList"
                component={PackingListScreen}
                options={{
                    // eslint-disable-next-line react/no-unstable-nested-components
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="playlist-edit" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    )
}

const styles = StyleSheet.create({
    mainBackGround: {
        backgroundColor: '#19181c',
    },
})

export default App
