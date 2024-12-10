import * as React from 'react'
import {
    Button, Portal, Dialog, TextInput,
} from 'react-native-paper'
import axios from 'axios'
import { MMKV } from 'react-native-mmkv'
import { API_URL } from '@env'
import { DatePickerModal, nl, registerTranslation } from 'react-native-paper-dates'

registerTranslation('nl', nl)

// eslint-disable-next-line import/no-unresolved
import { CalendarDate } from 'react-native-paper-dates/lib/typescript/Date/Calendar'

type Props = {
    visible: boolean;
    onDismiss: () => void;
};

function CreateVacation({ visible, onDismiss }: Props) {
    const storage = new MMKV()

    const [name, setName] = React.useState('')
    const [description, setDescription] = React.useState('')
    const [range, setRange] = React.useState<{ startDate: CalendarDate | undefined, endDate: CalendarDate | undefined }>({
        startDate: undefined,
        endDate: undefined,
    })
    const [open, setOpen] = React.useState(false)
    const [isDisabled, setIsDisabled] = React.useState(true)

    const onClose = React.useCallback(() => {
        setOpen(false)
    }, [setOpen])

    const onConfirm = React.useCallback(
        ({ startDate, endDate }: { startDate: CalendarDate, endDate: CalendarDate }) => {
            setOpen(false)
            setRange({ startDate, endDate })
        },
        [setOpen, setRange],
    )

    React.useEffect(() => {
        if (name && description && range.startDate && range.endDate) {
            setIsDisabled(false)
        } else {
            setIsDisabled(true)
        }
    }, [name, description, range.startDate, range.endDate])

    /**
   * Creates a new vacation with the given name, description, start date, and end date.
   * @param name - The name of the vacation.
   * @param description - The description of the vacation.
   * @param startDate - The start date of the vacation.
   * @param endDate - The end date of the vacation.
   * @returns A Promise that resolves to the created vacation data.
   * @throws An error if the request returns a non-200 status code.
   */
    const createVacation = async (
        startDate: CalendarDate,
        endDate: CalendarDate,
    ) => {
        const userToken = storage.getString('userToken')
        const headers = {
            'Content-Type': 'application/json',
            'X-API-Key': userToken,
        }

        const res = await axios.post(
            `${API_URL}/vacations`,
            {
                name: name,
                description: description,
                // eslint-disable-next-line camelcase
                start_date: startDate,
                // eslint-disable-next-line camelcase
                end_date: endDate,
            },
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

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss}>
                <Dialog.Title>Create New Vacation</Dialog.Title>
                <Dialog.Content>
                    <TextInput
                        label="Name"
                        value={name}
                        onChangeText={setName}
                        style={{ marginBottom: 10 }}
                    />
                    <TextInput
                        label="Description"
                        value={description}
                        onChangeText={setDescription}
                        style={{ marginBottom: 10 }}
                    />
                    <Button
                        onPress={() => setOpen(true)}
                        uppercase={false}
                        mode="outlined"
                    >
                        Pick range
                    </Button>
                    <DatePickerModal
                        locale="nl"
                        mode="range"
                        visible={open}
                        onDismiss={onClose}
                        startDate={range.startDate}
                        endDate={range.endDate}
                        onConfirm={onConfirm}
                    />
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={onDismiss}>Cancel</Button>
                    <Button
                        onPress={() => createVacation(range.startDate, range.endDate)}
                        disabled={isDisabled}
                    >
                        Create
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    )
}

export default CreateVacation
