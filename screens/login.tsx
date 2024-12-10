import React from 'react'
import {
    View, Text, StyleSheet,
} from 'react-native'
import {
    TextInput, Button, Snackbar, Dialog, Paragraph,
} from 'react-native-paper'
import { MMKV } from 'react-native-mmkv'
import { useNavigation } from '@react-navigation/native'
import { API_URL } from '@env'
import Turnstile from '../components/turnstile'
import AuthContext from '../hooks/account'

export const storage = new MMKV()

/**
* Login screen component.
* @param {} props - Component props.
* @returns {JSX.Element} - Rendered component.
*/
function LoginScreen() {
    const navigation = useNavigation<NavProps>()
    const [email, setEmail] = React.useState('')
    const [turnstileToken, setTurnstileToken] = React.useState<string | null>(null)
    const [password, setPassword] = React.useState('')
    const [isLoading, setIsLoading] = React.useState(false)
    const [snackbarVisible, setSnackbarVisible] = React.useState(false)
    const [snackbarMessage, setSnackbarMessage] = React.useState('')
    const [dialogVisible, setDialogVisible] = React.useState(false)
    const [dialogTitle, setDialogTitle] = React.useState('')
    const [dialogContent, setDialogContent] = React.useState('')
    const { setIsLoggedIn } = React.useContext(AuthContext)

    /**
    * Handle login button press.
    */
    function handleLogin() {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length > 0) {
            setSnackbarVisible(true)
            setSnackbarMessage('Not a valid email address')
            return
        }

        if (!turnstileToken) {
            setSnackbarVisible(true)
            setSnackbarMessage('Captcha not passed')
            return
        }

        setIsLoading(true)

        // http://api.vacario.nl/api/login
        const url = `${API_URL}/login`
        const data = {
            email: email,
            password: password,
            // eslint-disable-next-line camelcase
            cf_turnstile_token: turnstileToken,
        }

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(response.status.toString())
                }
                return response.json()
            })
            .then(async (token) => {
                // Save the user token in MMKV
                storage.set('userToken', token)
                setIsLoading(false)
                setIsLoggedIn(true)
            })
            .catch((error) => {
                if (error.message === '401') {
                    setDialogTitle('Invalid credentials')
                    setDialogContent('Please check your email and password and try again.')
                    setDialogVisible(true)
                    setIsLoading(false)
                } else if (error.message === '500') {
                    setDialogTitle('Server error')
                    setDialogContent('Please try again later.')
                    setDialogVisible(true)
                    setIsLoading(false)
                }
            })
    }

    return (
        <View style={styles.container}>
            <Text style={{ fontSize: 40, alignSelf: 'center', marginBottom: 60 }}>Welcome back!</Text>
            <TextInput
                mode="outlined"
                label="Email"
                value={email}
                onChangeText={(text) => setEmail(text)}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                disabled={isLoading}
                error={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length > 0}
            />
            <TextInput
                mode="outlined"
                label="Password"
                value={password}
                onChangeText={(text) => setPassword(text)}
                secureTextEntry
                autoCapitalize="none"
                disabled={isLoading}
                style={styles.input}
            />
            <Turnstile
                onToken={(token) => {
                    setTurnstileToken(token)
                }}
            />
            <Button mode="contained" style={styles.button} onPress={() => handleLogin()} loading={isLoading}>
                Login
            </Button>
            <Button mode="outlined" style={styles.button} onPress={() => navigation.navigate('Register')} disabled={isLoading}>
                Register instead
            </Button>
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
            >
                {snackbarMessage}
            </Snackbar>
            <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
                <Dialog.Title>{dialogTitle}</Dialog.Title>
                <Dialog.Content>
                    <Paragraph>{dialogContent}</Paragraph>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={() => setDialogVisible(false)}>OK</Button>
                </Dialog.Actions>
            </Dialog>
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
        zIndex: -1,
    },
    button: {
        marginTop: 10,
    },
})

export default LoginScreen
