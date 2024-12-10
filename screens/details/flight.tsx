import * as React from 'react'
import {
    View, Text, TouchableNativeFeedback, StyleSheet,
    Dimensions,
    Alert,
    Platform,
    ToastAndroid,
} from 'react-native'
import Clipboard from '@react-native-community/clipboard'
import FuzzyMatching from 'fuzzy-matching'
import { BlurView } from '@react-native-community/blur'
import LinearGradient from 'react-native-linear-gradient'
import { format } from 'date-fns'

import { MMKV } from 'react-native-mmkv'
import { Activity } from '../timeline'
import { useVacarioAPI } from '../../hooks/api'
import { useActivityCache } from '../../hooks/activity_cache'
import flagColors from '../../assets/flag_colors.json'
import AnimatedLoader from '../../components/animated_loader'

const fuzzyMatcher = new FuzzyMatching(flagColors.map((colorPair) => colorPair.name))
export const storage = new MMKV()

function Flight({ navigation, route }: any) {
    const [activityId, setActivityId] = React.useState(
        route.params?.vacation?.id || storage.getString('selectedActivityId'),
    )
    const [activity, setActivity] = React.useState<Activity | null>(null)
    const [initialLoad, setInitialLoad] = React.useState(true)
    const [backgroundColor, setBackgroundColor] = React.useState<string[] | null>()
    const { getActivity: getCachedActivity, setActivity: setCachedActivity } = useActivityCache()

    const api = useVacarioAPI()

    const copyToClipboard = (value: string) => {
        Clipboard.setString(value)
        if (Platform.OS === 'android') {
            ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT)
        } else {
            Alert.alert('', 'Copied to clipboard')
        }
    }

    React.useEffect(() => {
        const { vacation: { id: vacationId }, dayId } = route.params

        if (
            !route.params?.activityId
            && !storage.getString('selectedActivityId')
        ) {
            navigation.navigate('Timeline')
            return
        }
        const newActivityId = route.params?.activityId || storage.getString('selectedActivityId')

        if ((route.params?.activityId || storage.getString('selectedActivityId')) !== activityId || !activity) {
            storage.set('selectedActivityId', newActivityId)
            // request vacation days from api
            api(`vacations/${vacationId}/days/${dayId}/activities/${newActivityId}`).then((newActivity: Activity) => {
                // update cache
                setCachedActivity(newActivityId, newActivity)
                // set data
                setInitialLoad(false)
                setActivity(newActivity)
                setActivityId(newActivityId)
            }).catch(() => {
                getCachedActivity(newActivityId).then((newActivity: Activity) => {
                    // set data
                    setInitialLoad(false)
                    setActivity(newActivity)
                    setActivityId(newActivityId)
                }).catch(() => {
                    setInitialLoad(false)
                    navigation.navigate('Timeline')
                })
            })
        } else {
            setInitialLoad(false)
        }
    }, [route.params])

    React.useEffect(() => {
        if (activity) {
            navigation.setOptions({ title: activity?.flight?.name })
        }
    }, [activity])

    React.useEffect(() => {
        const match = fuzzyMatcher.get(route.params.vacation.name)
        if (match) {
            const countryColors = flagColors.find((colorPair) => colorPair.name === match.value)
            if (countryColors) {
                setBackgroundColor(countryColors.colors.map((color) => color.hex))
            }
        }
    }, [route?.params?.vacation?.name])

    return (
        <View style={styles.container}>
            {initialLoad && <AnimatedLoader />}
            <View style={styles.header}>
                <View style={styles.gradient} />
                {backgroundColor && <LinearGradient colors={backgroundColor} style={styles.gradient} useAngle angle={150} />}
                {backgroundColor && <BlurView
                    style={{ ...styles.gradient, backgroundColor: 'transparent' }}
                    blurType="dark"
                    blurAmount={32}
                    reducedTransparencyFallbackColor="rgb(33, 31, 38)"
                />}
                {backgroundColor && <LinearGradient colors={['#00000000', 'rgb(26, 25, 30)']} style={styles.gradientOverlay} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.8 }} />}
                <Text style={styles.headerTitle}>
                    {activity?.flight?.name || 'Activity'}
                </Text>
                <Text style={styles.headerSubTitle}>
                    {format(new Date(new Date(route.params?.date)), 'd LLLL yyyy') || 'N/A'}
                </Text>
            </View>
            <View style={styles.infoCardContainer}>
                <View style={styles.infoCard}>
                    <TouchableNativeFeedback
                        onPress={() => {
                            const value = activity?.flight?.flight
                            if (value) {
                                copyToClipboard(value)
                            }
                        }}
                    >
                        <View style={styles.infoCardTouchable}>
                            <Text style={styles.infoCardHeader}>Flight</Text>
                            <Text style={styles.infoCardDetails}>{activity?.flight?.flight || 'N/A'}</Text>
                        </View>
                    </TouchableNativeFeedback>
                </View>
                <View style={styles.infoCard}>
                    <TouchableNativeFeedback
                        onPress={() => {
                            // eslint-disable-next-line camelcase
                            const check_in = activity?.flight?.check_in
                            // eslint-disable-next-line camelcase
                            if (check_in) {
                                copyToClipboard(check_in)
                            }
                        }}
                    >
                        <View style={styles.infoCardTouchable}>
                            <Text style={styles.infoCardHeader}>Check-in</Text>
                            <Text style={styles.infoCardDetails}>{activity?.flight?.check_in ? activity?.flight?.check_in.substring(0, 5) : 'N/A'}</Text>
                        </View>
                    </TouchableNativeFeedback>
                </View>
                <View style={styles.infoCard}>
                    <TouchableNativeFeedback
                        onPress={() => {
                            const value = activity?.flight?.gate
                            if (value) {
                                copyToClipboard(value)
                            }
                        }}
                    >
                        <View style={styles.infoCardTouchable}>
                            <Text style={styles.infoCardHeader}>Gate</Text>
                            <Text style={styles.infoCardDetails}>{activity?.flight?.gate || 'N/A'}</Text>
                        </View>
                    </TouchableNativeFeedback>
                </View>
                <View style={styles.infoCard}>
                    <TouchableNativeFeedback
                        onPress={() => {
                            const value = activity?.flight?.terminal
                            if (value) {
                                copyToClipboard(value)
                            }
                        }}
                    >
                        <View style={styles.infoCardTouchable}>
                            <Text style={styles.infoCardHeader}>Terminal</Text>
                            <Text style={styles.infoCardDetails}>{activity?.flight?.terminal || 'N/A'}</Text>
                        </View>
                    </TouchableNativeFeedback>
                </View>
            </View>
            <View style={styles.infoCardContainer}>
                <View style={styles.infoCard}>
                    <TouchableNativeFeedback
                        onPress={() => {
                            const value = activity?.flight?.departure
                            if (value) {
                                copyToClipboard(value)
                            }
                        }}
                    >
                        <View style={styles.infoCardTouchable}>
                            <Text style={styles.infoCardHeader}>Departure</Text>
                            <Text style={{ ...styles.infoCardDetails, fontSize: 26 }}>{activity?.flight?.departure || 'N/A'}</Text>
                        </View>
                    </TouchableNativeFeedback>
                </View>
                <View style={styles.infoCard}>
                    <TouchableNativeFeedback
                        onPress={() => {
                            const value = activity?.flight?.arrival
                            if (value) {
                                copyToClipboard(value)
                            }
                        }}
                    >
                        <View style={styles.infoCardTouchable}>
                            <Text style={styles.infoCardHeader}>Arrival</Text>
                            <Text style={{ ...styles.infoCardDetails, fontSize: 26 }}>{activity?.flight?.arrival || 'N/A'}</Text>
                        </View>
                    </TouchableNativeFeedback>
                </View>
                <View style={styles.infoCard}>
                    <TouchableNativeFeedback
                        onPress={() => {
                            const value = activity?.flight?.departure_time
                            if (value) {
                                copyToClipboard(value)
                            }
                        }}
                    >
                        <View style={styles.infoCardTouchable}>
                            <Text style={styles.infoCardHeader}>Departure time</Text>
                            <Text style={styles.infoCardDetails}>{activity?.flight?.departure_time ? activity?.flight?.departure_time.substring(0, 5) : 'N/A'}</Text>
                        </View>
                    </TouchableNativeFeedback>
                </View>
                <View style={styles.infoCard}>
                    <TouchableNativeFeedback
                        onPress={() => {
                            const value = activity?.flight?.arrival_time
                            if (value) {
                                copyToClipboard(value)
                            }
                        }}
                    >
                        <View style={styles.infoCardTouchable}>
                            <Text style={styles.infoCardHeader}>Arrival time</Text>
                            <Text style={styles.infoCardDetails}>{activity?.flight?.arrival_time ? activity?.flight?.arrival_time.substring(0, 5) : 'N/A'}</Text>
                        </View>
                    </TouchableNativeFeedback>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        display: 'flex',
        height: '100%',
    },
    header: {
        // marginHorizontal: 10,
        height: 150,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        marginBottom: -10,
        width: '100%',
        overflow: 'hidden',
    },
    headerTitle: {
        fontSize: 24,
        alignSelf: 'center',
        marginTop: 30,
    },
    headerSubTitle: {
        fontSize: 20,
        alignSelf: 'center',
        marginTop: 20,
    },
    gradient: {
        height: 150,
        backgroundColor: 'rgb(33, 31, 38)',
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
    },
    gradientOverlay: {
        height: 150,
        backgroundColor: 'transparent',
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
    },
    content: {
        padding: 15,
        height: 150,
        backgroundColor: 'transparent',
    },
    textContainer: {
        backgroundColor: 'transparent',
        position: 'absolute',
        bottom: 10,
        padding: 15,
    },
    infoCardContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        height: 'auto',
        flexWrap: 'wrap',
        flexDirection: 'row',
        gap: 10,
        marginBottom: 30,
        marginTop: 30,
    },
    infoCard: {
        borderRadius: 16,
        height: 90,
        overflow: 'hidden',
        width: 'auto',
        minWidth: (Dimensions.get('window').width / 10) * 4,
        flex: 1,
        backgroundColor: '#2b2a2e',
    },
    infoCardTouchable: {
        height: '100%',
        width: '100%',
        padding: 10,
    },
    infoCardHeader: {
        fontSize: 14,
    },
    infoCardDetails: {
        fontSize: 30,
        position: 'absolute',
        alignSelf: 'center',
        margin: 'auto',
        top: '50%',
    },
})

export default Flight
