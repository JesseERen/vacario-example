import * as React from 'react'
import {
    View, StyleSheet,
} from 'react-native'
import { Button } from 'react-native-paper'
import { MMKV } from 'react-native-mmkv'
import AuthContext from '../hooks/account'

export const storage = new MMKV()

function SettingsScreen({ navigation }: any) {
    const { setIsLoggedIn } = React.useContext(AuthContext)

    const handleLogoutPress = () => {
        storage.clearAll()
        setIsLoggedIn(false)
    }

    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <Button mode="contained" onPress={() => navigation.navigate('Profile')}>Profile</Button>
                <View style={styles.buttonPadding} />
                <Button mode="contained" onPress={handleLogoutPress}>Logout</Button>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'flex-start',
    },
    buttonContainer: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    buttonPadding: {
        height: 10,
    },
})

export default SettingsScreen
