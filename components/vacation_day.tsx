import React from 'react'
import { Text, View, TouchableOpacity } from 'react-native'
import Animated, {
    useSharedValue, useAnimatedStyle, withTiming, withDelay,
} from 'react-native-reanimated'
import {
    Button,
} from 'react-native-paper'
import TimelineComponent from 'react-native-timeline-flatlist'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { format } from 'date-fns'
import { Day, ActivityType } from '../screens/timeline'
import FilledHeader from './filled_header'

const activityIcon = (type: ActivityType) => {
    switch (type) {
        case ActivityType.Accommodation:
            return 'hotel'
        case ActivityType.Flight:
            return 'flight-takeoff'
        case ActivityType.Restaurant:
            return 'local-restaurant'
        default:
            return 'fmd-good'
    }
}

function VacationDay({
    delay,
    day,
    navigation,
    vacationId,
    onActivityPressed = () => {},
}: { vacationId: string, navigation: any, day: Day, delay: number, onActivityPressed?: (id: string, activityType: number) => void }) {
    const opacity = useSharedValue(0)

    React.useEffect(() => {
        opacity.value = withDelay(delay, withTiming(1))
    }, [])

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        }
    })

    return (
        <Animated.View style={animatedStyle}>
            <View key={day.id}>
                <FilledHeader
                    title={format(new Date(day.date), 'd LLLL yyyy')}
                />
                <View style={{ height: 'auto' }}>
                    {day.activities.length > 0 ? (
                        <View>
                            <TimelineComponent
                                data={day.activities.map((activity) => {
                                    return {
                                        id: activity.id,
                                        type: activity.activity_type,
                                        title: activity.name,
                                        time: {
                                            start: activity.start_time?.substring(0, 5),
                                            end: activity.end_time?.substring(0, 5),
                                        },
                                        icon: (
                                            <Icon
                                                style={{
                                                    marginLeft: -1,
                                                    marginTop: -1,
                                                    backgroundColor: '#19181c',
                                                    paddingVertical: 10,
                                                }}
                                                name={activityIcon(activity.activity_type)}
                                                size={18}
                                                color="white"
                                            />
                                        ),
                                    }
                                })}
                                timeStyle={{
                                    color: 'white',
                                }}
                                circleStyle={{
                                    backgroundColor: 'transparent',
                                    height: 42,
                                }}
                                renderTime={(rowData) => {
                                    return (
                                        <View style={{ display: 'flex' }}>
                                            <Text>{rowData.time.start}</Text>
                                            <View
                                                style={{
                                                    backgroundColor: '#AAAAAA',
                                                    height: 1,
                                                    width: 4,
                                                    borderRadius: 2,
                                                    alignSelf: 'center',
                                                }}
                                            />
                                            <Text>{rowData.time.end}</Text>
                                        </View>
                                    )
                                }}
                                renderDetail={(rowData) => {
                                    return (
                                        <TouchableOpacity
                                            style={{ display: 'flex', marginVertical: -15, paddingVertical: 15 }}
                                            onPress={() => {
                                                onActivityPressed(rowData.id, rowData.type)
                                            }}
                                        >
                                            <Text>{rowData.title}</Text>
                                        </TouchableOpacity>
                                    )
                                }}
                                lineColor="#216289"
                                isUsingFlatlist={false}
                                innerCircle="icon"
                                separator
                                style={{ height: '100%', paddingHorizontal: 20 }}
                            />
                            <Button
                                mode="elevated"
                                onPress={() => {
                                    navigation.navigate('New activity', { dayId: day.id, vacationId: vacationId })
                                }}
                                style={{
                                    marginTop: 10,
                                    marginBottom: 20,
                                    width: 'auto',
                                    alignSelf: 'center',
                                }}
                            >
                                New Activity
                            </Button>
                        </View>
                    ) : (
                        <View style={{ margin: 10 }}>
                            <Text style={{ alignSelf: 'center', marginVertical: 20 }}>
                                You have no activities for this day yet
                            </Text>
                            <Button
                                mode="elevated"
                                onPress={() => navigation.navigate('New activity', { dayId: day.id, vacationId: vacationId })}
                                style={{
                                    marginBottom: 50,
                                    width: 'auto',
                                    alignSelf: 'center',
                                }}
                            >
                                New Activity
                            </Button>
                        </View>
                    )}
                </View>
            </View>
        </Animated.View>
    )
}

VacationDay.defaultProps = {
    onActivityPressed: () => { },
}

export default VacationDay
