import * as React from 'react'
import {
    View, Text, StyleSheet,
} from 'react-native'
import { TextInput, Button, Snackbar } from 'react-native-paper'
import axios from 'axios'
import { MMKV } from 'react-native-mmkv'
import { API_URL } from '@env'
import AuthContext from '../hooks/account'
import Turnstile from '../components/turnstile'

const emailRegex = /\S+@\S+\.\S+/
export const storage = new MMKV()

/**
 * Renders a screen for user registration.
 * @param {object} navigation - The navigation object used to navigate between screens.
 * @returns {JSX.Element} - A JSX element representing the RegisterScreen component.
 */

function RegisterScreen({ navigation }: any) {
    const [turnstileToken, setTurnstileToken] = React.useState<string | null>(null)
    const [name, setName] = React.useState<string | null>(null)
    const [email, setEmail] = React.useState<string | null>(null)
    const [password, setPassword] = React.useState<string | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)
    const [snackbarVisible, setSnackbarVisible] = React.useState(false)
    const [snackbarMessage, setSnackbarMessage] = React.useState('')
    const { setIsLoggedIn } = React.useContext(AuthContext)

    const handleButtonPress = () => {
        if (!email || (email && !emailRegex.test(email))) {
            setSnackbarVisible(true)
            setSnackbarMessage('Invalid email')
            return
        }
        if (!name || (name && name.length === 0)) {
            setSnackbarVisible(true)
            setSnackbarMessage('Name cannot be empty')
            return
        }
        if (!password || (password && password.length < 8)) {
            setSnackbarMessage('Password must be at least 8 characters long')
            setSnackbarVisible(true)
            return
        }
        if (!turnstileToken) {
            setSnackbarVisible(true)
            setSnackbarMessage('Captcha not passed')
            return
        }

        setIsLoading(true)

        const url = `${API_URL}/users`
        const data = {
            name: name,
            email: email,
            password: password,
            // eslint-disable-next-line camelcase
            cf_turnstile_token: turnstileToken,
        }

        axios.post(url, data)
            .then(() => {
                const loginUrl = `${API_URL}/login`
                const loginData = {
                    email: email,
                    password: password,
                    // eslint-disable-next-line camelcase
                    cf_turnstile_token: turnstileToken,
                }
                axios.post(loginUrl, loginData)
                    .then(async (loginRes) => {
                        storage.set('userToken', await loginRes.data)
                        setIsLoading(false)
                        setIsLoggedIn(true)
                    })
                    .catch(() => {
                        setIsLoading(false)
                    })
            })
            .catch(() => {
                setIsLoading(false)
            })
    }

    const handleSnackbarDismiss = () => {
        setSnackbarVisible(false)
    }

    const handleNameChange = (text: string) => {
        setName(text)
        if (text.length === 0) {
            setSnackbarVisible(true)
            setSnackbarMessage('Name cannot be empty')
        } else {
            setSnackbarVisible(false)
        }
    }

    const handleEmailChange = (text: string) => {
        setEmail(text)
        if (text.length === 0) {
            setSnackbarMessage('Invalid email address')
            setSnackbarVisible(true)
        } else {
            setSnackbarVisible(false)
        }
    }

    const handlePasswordChange = (text: string) => {
        setPassword(text)
        if (text.length < 8) {
            setSnackbarMessage('Password must be at least 8 characters long')
            setSnackbarVisible(true)
        } else {
            setSnackbarVisible(false)
        }
    }

    return (
        <View style={styles.container}>
            <Text style={{ fontSize: 24, alignSelf: 'center', marginBottom: 60 }}>Start your new adventure!</Text>
            <TextInput
                mode="outlined"
                label="Name"
                value={name || undefined}
                disabled={isLoading}
                error={!!name && name.length === 0}
                onChangeText={handleNameChange}
                style={styles.input}
            />
            <TextInput
                mode="outlined"
                label="Email"
                value={email || undefined}
                disabled={isLoading}
                autoCapitalize="none"
                onChangeText={handleEmailChange}
                style={styles.input}
                error={!!email && email.length === 0}
            />
            <TextInput
                mode="outlined"
                label="Password"
                value={password || undefined}
                disabled={isLoading}
                autoCapitalize="none"
                onChangeText={handlePasswordChange}
                secureTextEntry
                style={styles.input}
                error={!!password && password.length < 8}
            />
            <Turnstile
                onToken={(token) => {
                    setTurnstileToken(token)
                }}
            />
            <Button mode="contained" style={styles.button} onPress={handleButtonPress} loading={isLoading}>
                Register
            </Button>
            <Button mode="outlined" style={styles.button} onPress={() => navigation.navigate('Login')} disabled={isLoading}>
                Login instead
            </Button>
            <Snackbar
                visible={snackbarVisible}
                onDismiss={handleSnackbarDismiss}
                duration={3000}
            >
                {snackbarMessage}
            </Snackbar>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
    },
    input: {
        marginBottom: 10,
    },
    button: {
        marginTop: 10,
    },
})

export default RegisterScreen
