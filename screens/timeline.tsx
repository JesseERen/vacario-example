import * as React from 'react'
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    RefreshControl,
} from 'react-native'
import {
    Button,
} from 'react-native-paper'
import { MMKV } from 'react-native-mmkv'
// import CreateVacation from '../components/vacation_create_popup'
import { useVacarioAPI } from '../hooks/api'
import { useDayCache } from '../hooks/day_cache'
import VacationDay from '../components/vacation_day'
import AnimatedLoader from '../components/animated_loader'

export enum ActivityType {
    Accommodation,
    Flight,
    POI,
    Restaurant,
}

export type Activity = {
    id: string;
    name: string;
    start_time: string;
    end_time: string;
    activity_type: ActivityType;
    accommodation?: { name: string, address: string, booking: string, check_in: string, coordinates: { x: number, y: number } };
    flight?: { name: string, departure: string, arrival: string, departure_time: string, arrival_time: string, check_in: string, gate: string, terminal: string, flight: string };
    poi?: { name: string, coordinates: { x: number, y: number }, notes: string };
    restaurant?: { name: string, coordinates: { x: number, y: number }, address: string };
};

export type Day = {
    id: string;
    date: string;
    activities: Activity[];
};

type DayState = {
    vacationId: String;
    days: Day[];
}

function getActivityTypeName(activityType: number): string {
    switch (activityType) {
        case 0:
            return 'Accommodation'
        case 1:
            return 'Flight'
        case 2:
            return 'POI'
        case 3:
            return 'Restaurant'
        default:
            return 'Accommodation'
    }
}

function Timeline({ navigation, route }: any) {
    const storage = new MMKV()
    const { getVacationDays, setVacationDays } = useDayCache()
    // const [dialogVisible, setDialogVisible] = React.useState(false)
    const [dayState, setDayState] = React.useState<DayState | null>(null)
    const [refreshing, setRefreshing] = React.useState(false)
    const [initialLoad, setInitialLoad] = React.useState(true)
    const [vacationId, setVacationId] = React.useState(
        route.params?.vacation?.id || storage.getString('selectedVacationId'),
    )
    // const [open, setOpen] = React.useState(false)
    // const [value, setValue] = React.useState(null)
    // const [activityName, setActivityName] = React.useState([
    //     { label: 'Accomodation', value: 0 },
    //     { label: 'Flight', value: 1 },
    // ])
    // const [activityStartTime, setActivityStartTime] = React.useState('')
    // const [activityEndTime, setActivityEndTime] = React.useState('')

    const api = useVacarioAPI()

    const init = React.useCallback(() => {
        if (
            !route.params?.vacation?.id
            && !storage.getString('selectedVacationId')
        ) {
            navigation.navigate('Home')
            return
        }
        const newVacationId = route.params?.vacation?.id || storage.getString('selectedVacationId')

        if (route.params?.vacation?.name) {
            navigation.setOptions({ title: route.params?.vacation?.name })
        }

        if ((route.params?.vacation?.id || storage.getString('selectedVacationId')) !== vacationId || !dayState) {
            storage.set('selectedVacationId', newVacationId)
            // check cache
            getVacationDays(newVacationId).then((days: Day[]) => {
                // set data
                setInitialLoad(false)
                setDayState({
                    vacationId: newVacationId,
                    days: days.sort(
                        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
                    ),
                })
                setVacationId(newVacationId)
            }).catch(() => {
                // request vacation days from api
                api(`vacations/${newVacationId}/days`).then((days: Day[]) => {
                    // update cache
                    setVacationDays(newVacationId, days)
                    // set data
                    setInitialLoad(false)
                    setDayState({
                        vacationId: newVacationId,
                        days:
                            days.sort(
                                (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
                            ),
                    })
                    setVacationId(newVacationId)
                })
            })
        } else {
            setInitialLoad(false)
        }
    }, [navigation, route, vacationId])

    React.useEffect(() => {
        init()
        const unsubscribeFocus = navigation.addListener('focus', () => {
            init()
        })

        const unsubscribe = navigation.addListener('blur', () => {
            setInitialLoad(true)
        })

        return () => {
            unsubscribeFocus()
            unsubscribe()
            setInitialLoad(true)
        }
    }, [route?.params])

    /**
    * Function to refresh the vacation list.
    * @returns void
    */
    const onRefresh = React.useCallback(() => {
        setRefreshing(true)
        api(`vacations/${vacationId}/days`).then((days: Day[]) => {
            // update cache
            setVacationDays(vacationId, days)
            setDayState({
                vacationId: vacationId,
                days:
                    days.sort(
                        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
                    ),
            })
            setRefreshing(false)
        })
    }, [vacationId])

    // const createActivity = (
    //     day_id: string,
    //     activity_type: ActivityType,
    //     start_time: string,
    //     end_time: string,
    // ) => {
    //     const formData = new FormData()
    //     formData.append('activity_type', activity_type.toString())
    //     formData.append('start_time', start_time)
    //     formData.append('end_time', end_time)

    //     axios
    //         .post(`vacations/${vacationId}/days/${day_id}/activities`, formData, {
    //             headers: {
    //                 'Content-Type': 'multipart/form-data',
    //             },
    //         })
    // }

    return (
        <View style={styles.container}>
            {dayState && dayState.days.length === 0 && !initialLoad && (
                <View
                    style={{ height: '100%', display: 'flex', justifyContent: 'center' }}
                >
                    <Text style={{ fontSize: 30, alignSelf: 'center', marginBottom: 50 }}>
                        This vacation doesn&apos;t have any activities yet.
                    </Text>
                    <View
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignSelf: 'center',
                        }}
                    >
                        <Button
                            mode="contained"
                            style={{ marginBottom: 50, width: 'auto', alignSelf: 'center' }}
                        >
                            New Activity
                        </Button>
                        <Button
                            mode="elevated"
                            style={{
                                marginBottom: 50,
                                marginLeft: 10,
                                width: 'auto',
                                alignSelf: 'center',
                            }}
                            onPress={onRefresh}
                            loading={refreshing}
                        >
                            Refresh
                        </Button>
                    </View>
                </View>
            )}
            {(dayState == null || initialLoad) && <AnimatedLoader />}
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={{ height: 10 }} />
                {dayState
                    && !initialLoad
                    && dayState.days.map((day, index) => {
                        return (
                            <VacationDay
                                key={day.id}
                                day={day}
                                vacationId={vacationId}
                                navigation={navigation}
                                delay={index * 100}
                                onActivityPressed={(id, activityType) => {
                                    navigation.navigate(
                                        `Details-${getActivityTypeName(activityType)}`,
                                        {
                                            activityId: id,
                                            date: day.date,
                                            vacation: { id: vacationId, name: route.params?.vacation?.name || '' },
                                            dayId: day.id,
                                        },
                                    )
                                }}
                            />
                        )
                    })}
                <View style={{ height: 20 }} />
            </ScrollView>

            {/* <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>New Activity</Dialog.Title>
          <Dialog.Content>
          <Picker
              selectedValue={activityName}
              onValueChange={(itemValue, itemIndex) => setActivityName(itemValue)}
              style={{ marginBottom: 10 }}
            >
                <Picker.Item label="Accommodation" value={0} />
                <Picker.Item label="Flight" value={1} />
                <Picker.Item label="POI" value={2} />
                <Picker.Item label="Restaurant" value={3} />
            </Picker>
            <TextInput
              label='Start Time'
              value={activityStartTime}
              onChangeText={setActivityStartTime}
              style={{ marginBottom: 10 }}
            />
            <TextInput
              label='End Time'
              value={activityEndTime}
              onChangeText={setActivityEndTime}
              style={{ marginBottom: 10 }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={() => createActivity("1", activityName,activityStartTime,activityEndTime)}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal> */}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
})

export default Timeline
