import * as React from 'react'
import {
    View, Text, TouchableNativeFeedback, StyleSheet, PermissionsAndroid,
    Alert,
    Platform,
    ToastAndroid,
} from 'react-native'
import Clipboard from '@react-native-community/clipboard'
import FuzzyMatching from 'fuzzy-matching'
import { BlurView } from '@react-native-community/blur'
import LinearGradient from 'react-native-linear-gradient'
import { format } from 'date-fns'
import Mapbox from '@rnmapbox/maps'
import { useIsFocused } from '@react-navigation/native'

import { MMKV } from 'react-native-mmkv'
import { Activity } from '../timeline'
import { useVacarioAPI } from '../../hooks/api'
import { useActivityCache } from '../../hooks/activity_cache'
import flagColors from '../../assets/flag_colors.json'
import AnimatedLoader from '../../components/animated_loader'
// @ts-ignore
import MARKER from '../../assets/red_marker.png'

const fuzzyMatcher = new FuzzyMatching(flagColors.map((colorPair) => colorPair.name))
export const storage = new MMKV()

// set public mapbox token
Mapbox.setAccessToken('pk.eyJ1IjoiNTA1NDQ2IiwiYSI6ImNsMmVlaXRtOTA2ZzEzYnF6eXRzMDJwdG4ifQ.nNE44qCDY-telUEmjFB1kw')

function Restaurant({ navigation, route }: any) {
    const [activityId, setActivityId] = React.useState(
        route.params?.vacation?.id || storage.getString('selectedActivityId'),
    )
    const [locPermGranted, setLocPermGranted] = React.useState(false)
    const [initialLoad, setInitialLoad] = React.useState(true)
    const [mapCoord, setMapCoord] = React.useState({ lat: 0, lng: 0 })
    const [activity, setActivity] = React.useState<Activity | null>(null)
    const [backgroundColor, setBackgroundColor] = React.useState<string[] | null>()
    const { getActivity: getCachedActivity, setActivity: setCachedActivity } = useActivityCache()

    const api = useVacarioAPI()
    const isFocused = useIsFocused()

    const requestLocationPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Vacario App Location Permission',
                    message:
                        'Vacario App needs access to your location '
                        + 'to show your current location on the map.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                setLocPermGranted(true)
            } else {
                setLocPermGranted(false)
            }
        } catch (err) {
            setLocPermGranted(false)
        }
    }

    const copyToClipboard = (value: string) => {
        Clipboard.setString(value)
        if (Platform.OS === 'android') {
            ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT)
        } else {
            Alert.alert('', 'Copied to clipboard')
        }
    }

    React.useEffect(() => {
        requestLocationPermission()
    }, [])

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
            navigation.setOptions({ title: activity?.restaurant?.name })
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
            <View style={styles.header}>
                {initialLoad && <AnimatedLoader />}
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
                    {activity?.restaurant?.name || 'Activity'}
                </Text>
                <Text style={styles.headerSubTitle}>
                    {format(new Date(new Date(route.params?.date)), 'd LLLL yyyy') || 'N/A'}
                </Text>
            </View>
            <View style={styles.addressContainer}>
                <Text style={styles.addressText}>Address</Text>
                <View style={styles.touchableNativeFeedback}>
                    <TouchableNativeFeedback
                        onPress={() => {
                            const address = activity?.restaurant?.address
                            if (address) {
                                copyToClipboard(address)
                            }
                        }}
                    >
                        <View style={styles.addressDetailsContainer}>
                            <Text>{activity?.restaurant?.address || 'N/A'}</Text>
                        </View>
                    </TouchableNativeFeedback>
                </View>
            </View>
            <View style={styles.mapContainer}>
                <Text style={styles.addressText}>Map</Text>
                {isFocused && <Mapbox.MapView style={styles.map} styleJSON="mapbox://styles/505446/ckv6nvowh7sd614p8oee7bhb5" scaleBarEnabled={false}>
                    {locPermGranted && <Mapbox.UserLocation onUpdate={(location) => { setMapCoord({ lat: location.coords.latitude, lng: location.coords.longitude }) }} />}
                    {activity?.restaurant?.coordinates?.x && <Mapbox.Camera centerCoordinate={[activity.restaurant.coordinates.x, activity.restaurant.coordinates.y]} animationMode="none" />}
                    {(activity?.restaurant?.coordinates?.x
                        && <Mapbox.ShapeSource
                            id="markerSource"
                            shape={{
                                type: 'Point',
                                coordinates: [
                                    activity?.restaurant?.coordinates.x,
                                    activity?.restaurant?.coordinates.y,
                                ],
                            }}
                        >
                            <Mapbox.Images images={{ redMarker: MARKER }} />
                            <Mapbox.SymbolLayer
                                id="markerLayer"
                                style={{
                                    iconImage: 'redMarker',
                                    iconSize: 0.3,
                                    iconAnchor: 'bottom',
                                }}
                            />
                        </Mapbox.ShapeSource>)
                        || (mapCoord && <Mapbox.Camera centerCoordinate={[mapCoord.lng, mapCoord.lat]} animationMode="none" />)}
                </Mapbox.MapView>}
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
    addressContainer: {
        marginTop: 20,
    },
    addressText: {
        marginLeft: 15,
    },
    addressDetailsContainer: {
        borderRadius: 16,
        backgroundColor: '#2b2a2e',
        width: '100%',
        height: 'auto',
        padding: 10,
    },
    mapContainer: {
        display: 'flex',
        width: '100%',
        height: 'auto',
        marginBottom: -16,
        flex: 1,
        marginTop: 30,
    },
    map: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: 'hidden',
        flex: 1,
    },
    touchableNativeFeedback: {
        borderRadius: 16,
        overflow: 'hidden',
    },
})

export default Restaurant