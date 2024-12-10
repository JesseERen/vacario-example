import React from 'react'
import { View } from 'react-native'
import Animated, {
    useSharedValue, useAnimatedStyle, withTiming, withDelay,
} from 'react-native-reanimated'
import {
    Button,
} from 'react-native-paper'

function AnimatedLoader({ delay }: { delay?: number }) {
    const opacity = useSharedValue(0)

    React.useEffect(() => {
        opacity.value = withDelay(delay || 500, withTiming(1))

        return () => {
            opacity.value = 0
        }
    }, [])

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        }
    })

    return (
        <Animated.View style={animatedStyle}>
            <View
                style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}
            >
                <Button
                    mode="text"
                    loading
                    style={{ width: 160, alignSelf: 'center' }}
                >
                    Loading
                </Button>
            </View>
        </Animated.View>
    )
}

AnimatedLoader.defaultProps = {
    delay: 0,
}

export default AnimatedLoader
