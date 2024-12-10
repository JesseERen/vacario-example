import * as React from 'react'
import { Text } from 'react-native'
import {
    Button, Portal, Dialog, TextInput,
} from 'react-native-paper'
import axios from 'axios'
import { MMKV } from 'react-native-mmkv'
import { API_URL } from '@env'

/**
 * CreatePackingListItemDialog component props
 */
interface Props {
    visible: boolean;
    onDismiss: () => void;
}

/**
 * CreatePackingListItemDialog component
 * @param {Props} props - component props
 * @returns {JSX.Element} - component elements
 */
function CreatePackingListItemDialog({
    visible,
    onDismiss,
}: Props) {
    const storage = new MMKV()

    const [name, setName] = React.useState('')
    const [nameError, setNameError] = React.useState('')

    /**
   * Create a new packing list item
   * @param {string} name - item name
   * @returns {Promise<any>} - response data
   * @throws {Error} - if request returns non-200 status code
   */
    const createPackingListItem = async (): Promise<any> => {
        const userToken = storage.getString('userToken')
        const headers = {
            'Content-Type': 'application/json',
            'X-API-Key': userToken,
        }

        const data = { name }
        const res = await axios.post(
            `${API_URL}/packing_list/items`,
            data,
            { headers },
        )

        if (res.status === 200) {
            onDismiss()
            return res.data
        }
        onDismiss()
        throw new Error(
            `Request returned non 200 status code: ${res.status}, see logs for more details`,
        )
    }

    const handleCreate = () => {
        if (name.trim() === '') {
            setNameError('Name is required')
        } else {
            createPackingListItem()
        }
    }

    const handleNameChange = (text: string) => {
        if (text.trim() === '') {
            setNameError('Name is required')
        } else {
            setNameError('')
        }
        setName(text)
    }

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss}>
                <Dialog.Title>Create New Item</Dialog.Title>
                <Dialog.Content>
                    <TextInput label="Name" value={name} onChangeText={handleNameChange} error={nameError !== ''} />
                    {nameError !== '' && <Text style={{ color: 'red' }}>{nameError}</Text>}
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={onDismiss}>Cancel</Button>
                    <Button onPress={handleCreate}>Create</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    )
}

export default CreatePackingListItemDialog
