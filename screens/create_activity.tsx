import * as React from 'react'
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Alert,
} from 'react-native'
import {
    FAB,
    Button,
    TextInput,
    RadioButton,
} from 'react-native-paper'
import { TimePickerModal } from 'react-native-paper-dates'
import { MMKV } from 'react-native-mmkv'
import axios from 'axios'
import { API_URL } from '@env'

function CreateActivityScreen({ navigation, route }: any) {
    const [activityType, setActivityType] = React.useState('')
    const [activityStartTime, setActivityStartTime] = React.useState('')
    const [activityEndTime, setActivityEndTime] = React.useState('')
    const [activityName, setActivityName] = React.useState('')
    const [address, setAddress] = React.useState<string | null>(null)
    const [notes, setNotes] = React.useState<string | null>(null)
    const [booking, setBooking] = React.useState<string | null>(null)
    const [checkIn, setCheckIn] = React.useState<string | null>(null)
    const [placeOfArrival, setPlaceOfArrival] = React.useState('')
    const [placeOfDeparture, setPlaceOfDeparture] = React.useState('')
    const [arrivalTime, setArrivalTime] = React.useState('')
    const [departureTime, setDepartureTime] = React.useState('')
    const [gate, setGate] = React.useState('')
    const [flight, setFlight] = React.useState('')
    const [terminal, setTerminal] = React.useState('')
    const [visibleStartTime, setVisibleStartTime] = React.useState(false)
    const [visibleEndTime, setVisibleEndTime] = React.useState(false)
    const [visibleArrivalTime, setVisibleArrivalTime] = React.useState(false)
    const [visibleDepartureTime, setVisibleDepartureTime] = React.useState(false)

    const storage = new MMKV()

    const onDismiss = React.useCallback(() => {
        setVisibleStartTime(false)
        setVisibleEndTime(false)
        setVisibleArrivalTime(false)
        setVisibleDepartureTime(false)
    }, [setVisibleStartTime, setVisibleEndTime, setVisibleArrivalTime, setVisibleDepartureTime])

    const onConfirmStartTime = React.useCallback(
        ({ hours, minutes }: { hours: number, minutes: number }) => {
            setVisibleStartTime(false)
            const time = `${hours}:${minutes}:00`

            setActivityStartTime(time)
        },
        [setVisibleStartTime],
    )

    const onConfirmEndTime = React.useCallback(
        ({ hours, minutes }: { hours: number, minutes: number }) => {
            setVisibleEndTime(false)
            const time = `${hours}:${minutes}:00`
            setActivityEndTime(time)
        },
        [setVisibleEndTime],
    )

    const onConfirmArrivalTime = React.useCallback(
        ({ hours, minutes }: { hours: number, minutes: number }) => {
            setVisibleArrivalTime(false)
            const time = `${hours}:${minutes}:00`
            setArrivalTime(time)
        },
        [setVisibleArrivalTime],
    )

    const onConfirmDepartureTime = React.useCallback(
        ({ hours, minutes }: { hours: number, minutes: number }) => {
            setVisibleDepartureTime(false)
            const time = `${hours}:${minutes}:00`
            setDepartureTime(time)
        },
        [setVisibleDepartureTime],
    )

    const handleAddActivity = async () => {
        try {
            const formData = new FormData()
            formData.append('activity_type', activityType)
            formData.append('start_time', activityStartTime)
            formData.append('end_time', activityEndTime)

            if (activityType === '0') {
                const accommodation = {
                    name: activityName,
                    address,
                    booking,
                    // eslint-disable-next-line camelcase
                    check_in: checkIn,
                }
                formData.append('accommodation', JSON.stringify(accommodation))
            } else if (activityType === '1') {
                const _flight = {
                    departure: placeOfDeparture,
                    arrival: placeOfArrival,
                    // eslint-disable-next-line camelcase
                    departure_time: departureTime,
                    // eslint-disable-next-line camelcase
                    arrival_time: arrivalTime,
                    gate,
                    terminal,
                    // eslint-disable-next-line camelcase
                    check_in: checkIn,
                    flight,
                }
                formData.append('flight', JSON.stringify(_flight))
            } else if (activityType === '2') {
                const poi = {
                    name: activityName,
                    notes,
                    address,
                }
                formData.append('poi', JSON.stringify(poi))
            } else if (activityType === '3') {
                const restaurant = {
                    name: activityName,
                    address,
                }
                formData.append('restaurant', JSON.stringify(restaurant))
            }

            const userToken = storage.getString('userToken')
            await axios.post(
                `${API_URL}/vacations/${route.params?.vacationId}/days/${route.params.dayId}/activities`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'X-API-Key': userToken,
                    },
                },
            )
            navigation.goBack()
        } catch (error) {
            Alert.alert('Error', 'Failed to create activity')
        }
    }

    return (
        <View style={styles.container}>
            <ScrollView>
                <RadioButton.Group
                    onValueChange={(value) => setActivityType(value)}
                    value={activityType}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 10,
                        }}
                    >
                        <RadioButton value="0" />
                        <Text style={{ marginLeft: 10 }}>Accommodation</Text>
                    </View>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 10,
                        }}
                    >
                        <RadioButton value="1" />
                        <Text style={{ marginLeft: 10 }}>Flight</Text>
                    </View>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 10,
                        }}
                    >
                        <RadioButton value="2" />
                        <Text style={{ marginLeft: 10 }}>POI</Text>
                    </View>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 10,
                        }}
                    >
                        <RadioButton value="3" />
                        <Text style={{ marginLeft: 10 }}>Restaurant</Text>
                    </View>
                </RadioButton.Group>
                {activityType && (
                    <>
                        {/* <TextInput
            label='Start Time'
            value={activityStartTime}
            onChangeText={setActivityStartTime}
            style={{ marginBottom: 10 }}
          /> */}
                        <Button
                            onPress={() => setVisibleStartTime(true)}
                            uppercase={false}
                            mode="outlined"
                            style={{ marginBottom: 10 }}
                        >
                            Pick start time
                        </Button>
                        <TimePickerModal
                            visible={visibleStartTime}
                            onDismiss={onDismiss}
                            onConfirm={onConfirmStartTime}
                            hours={0}
                            minutes={0}
                        />
                        <Button
                            onPress={() => setVisibleEndTime(true)}
                            uppercase={false}
                            mode="outlined"
                            style={{ marginBottom: 10 }}
                        >
                            Pick end time
                        </Button>
                        <TimePickerModal
                            visible={visibleEndTime}
                            onDismiss={onDismiss}
                            onConfirm={onConfirmEndTime}
                            hours={0}
                            minutes={0}
                        />
                    </>
                )}

                {activityType === '0' && (
                    <>
                        <TextInput
                            label="Activity Name"
                            value={activityName}
                            onChangeText={setActivityName}
                            style={{ marginBottom: 10 }}
                        />
                        <TextInput
                            label="Address"
                            value={address || ''}
                            onChangeText={setAddress}
                            style={{ marginBottom: 10 }}
                        />
                        <TextInput
                            label="Booking nr."
                            value={booking || ''}
                            onChangeText={setBooking}
                            style={{ marginBottom: 10 }}
                        />
                        <TextInput
                            label="Check in"
                            value={checkIn || ''}
                            onChangeText={setCheckIn}
                            style={{ marginBottom: 10 }}
                        />
                    </>
                )}
                {activityType === '1' && (
                    <>
                        <TextInput
                            label="Flight Number"
                            value={flight}
                            onChangeText={setFlight}
                            style={{ marginBottom: 10 }}
                        />
                        <TextInput
                            label="Check in"
                            value={checkIn || ''}
                            onChangeText={setCheckIn}
                            style={{ marginBottom: 10 }}
                        />
                        <TextInput
                            label="Place of Arrival"
                            value={placeOfArrival}
                            onChangeText={setPlaceOfArrival}
                            style={{ marginBottom: 10 }}
                        />
                        <TextInput
                            label="Place of departure"
                            value={placeOfDeparture}
                            onChangeText={setPlaceOfDeparture}
                            style={{ marginBottom: 10 }}
                        />
                        <Button
                            onPress={() => setVisibleStartTime(true)}
                            uppercase={false}
                            mode="outlined"
                            style={{ marginBottom: 10 }}
                        >
                            Pick arrival time
                        </Button>
                        <TimePickerModal
                            visible={visibleArrivalTime}
                            onDismiss={onDismiss}
                            onConfirm={onConfirmArrivalTime}
                            hours={0}
                            minutes={0}
                        />
                        <Button
                            onPress={() => setVisibleEndTime(true)}
                            uppercase={false}
                            mode="outlined"
                            style={{ marginBottom: 10 }}
                        >
                            Pick departure time
                        </Button>
                        <TimePickerModal
                            visible={visibleDepartureTime}
                            onDismiss={onDismiss}
                            onConfirm={onConfirmDepartureTime}
                            hours={0}
                            minutes={0}
                        />
                        <TextInput
                            label="Gate"
                            value={gate}
                            onChangeText={setGate}
                            style={{ marginBottom: 10 }}
                        />
                        <TextInput
                            label="Terminal"
                            value={terminal || ''}
                            onChangeText={setTerminal}
                            style={{ marginBottom: 10 }}
                        />
                    </>
                )}
                {activityType === '2' && (
                    <>
                        <TextInput
                            label="Place of interest name"
                            value={activityName}
                            onChangeText={setActivityName}
                            style={{ marginBottom: 10 }}
                        />
                        <TextInput
                            label="Address"
                            value={address || ''}
                            onChangeText={setAddress}
                            style={{ marginBottom: 10 }}
                        />
                        <TextInput
                            label="Notes"
                            value={notes || ''}
                            onChangeText={setNotes}
                            style={{ marginBottom: 10 }}
                        />
                    </>
                )}
                {activityType === '3' && (
                    <>
                        <TextInput
                            label="Restaurant name"
                            value={activityName}
                            onChangeText={setActivityName}
                            style={{ marginBottom: 10 }}
                        />
                        <TextInput
                            label="Address"
                            value={address || ''}
                            onChangeText={setAddress}
                            style={{ marginBottom: 10 }}
                        />
                    </>
                )}
            </ScrollView>
            {activityType && (
                <FAB style={styles.fab} icon="check" onPress={handleAddActivity} />
            )}

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
})

export default CreateActivityScreen
