import * as React from 'react'
import {
    View, StyleSheet, Alert,
} from 'react-native'
import { TextInput, Button, Snackbar } from 'react-native-paper'
import { MMKV } from 'react-native-mmkv'
import jwtDecode from 'jwt-decode'
import axios from 'axios'

export const storage = new MMKV()

function ProfileScreen() {
    const [name, setName] = React.useState('')
    const [email, setEmail] = React.useState<string>('')
    const [showSnackbar, setShowSnackbar] = React.useState(false)
    const [showError, setShowError] = React.useState(false)

    React.useEffect(() => {
        // Get user data from MMKV storage
        const token = storage.getString('userToken')
        if (token) {
            const decoded: any = jwtDecode(token)
            setName(decoded.name)
            setEmail(decoded.email)
        }
    }, [])

    const handleNameChange = (text: string) => {
        setName(text)
    }

    const handleEmailChange = (text: string) => {
        setEmail(text)
    }
  
    const handleSubmit = () => {
        if (name === '' || email === '') {
            setShowError(true)
            return
        }
        const token = storage.getString('userToken')
        if (!token) {
            return
        }
        axios.patch('/users/@me', {
            name: name,
            email: email,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': token,
            },
        })
            .then(() => {
                setShowSnackbar(true)
            })
            .catch(() => {
                Alert.alert('Error', 'Failed to update user details')
            })
    }

    const onDismissSnackBar = () => setShowSnackbar(false)
    const onDismissError = () => setShowError(false)

    return (
        <View style={styles.container}>
            <TextInput
                label="Name"
                value={name}
                onChangeText={handleNameChange}
                style={styles.input}
            />
            <TextInput
                label="Email"
                value={email}
                onChangeText={handleEmailChange}
                style={styles.input}
            />
            <Button mode="contained" onPress={handleSubmit}>
                Save
            </Button>
            <Snackbar
                visible={showSnackbar}
                onDismiss={onDismissSnackBar}
                duration={3000}
            >
                Account aangepast
            </Snackbar>
            <Snackbar
                visible={showError}
                onDismiss={onDismissError}
                duration={3000}
            >
                Please fill in both name and email fields
            </Snackbar>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    input: {
        marginBottom: 16,
    },
})

export default ProfileScreen
