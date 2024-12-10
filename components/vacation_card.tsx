import React from 'react'
import {
    View, Text, StyleSheet, TouchableOpacity,
} from 'react-native'
import FuzzyMatching from 'fuzzy-matching'
import { BlurView } from '@react-native-community/blur'
import LinearGradient from 'react-native-linear-gradient'
import flagColors from '../assets/flag_colors.json'

const fuzzyMatcher = new FuzzyMatching(flagColors.map((colorPair) => colorPair.name))

interface VacationCardProps {
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    onPress?: () => void;
    onLongPress?: () => void;
}

function VacationCard({
    name,
    description,
    startDate,
    endDate,
    onPress,
    onLongPress,
}: VacationCardProps) {
    const [backgroundColor, setBackgroundColor] = React.useState<string[] | null>()

    React.useEffect(() => {
        const match = fuzzyMatcher.get(name)
        if (match) {
            const countryColors = flagColors.find((colorPair) => colorPair.name === match.value)
            if (countryColors) {
                setBackgroundColor(countryColors.colors.map((color) => color.hex))
            }
        }
    }, [name])

    return (
        <TouchableOpacity onPress={onPress} onLongPress={onLongPress}>
            <View style={styles.card}>
                <View style={styles.gradient} />
                {backgroundColor && <LinearGradient colors={backgroundColor} style={styles.gradient} useAngle angle={150} />}
                {backgroundColor && <BlurView
                    style={{ ...styles.gradient, backgroundColor: 'transparent' }}
                    blurType="dark"
                    blurAmount={32}
                    reducedTransparencyFallbackColor="rgb(33, 31, 38)"
                />}
                <View style={styles.content}>
                    <View style={styles.textContainer}>
                        <Text style={styles.name}>{name}</Text>
                        <Text style={styles.description}>{description}</Text>
                    </View>
                    <Text style={styles.date}>
                        {startDate.toLocaleDateString()}
                        {' '}
                        -
                        {' '}
                        {endDate.toLocaleDateString()}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

/**
 * Styles for the vacation card component.
 */
const styles = StyleSheet.create({
    card: {
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 20,
        height: 140,
        backgroundColor: 'transparent',
    },
    gradient: {
        height: 140,
        backgroundColor: 'rgb(33, 31, 38)',
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
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 5,
        marginTop: 10,
    },
    description: {
        fontSize: 16,
        color: '#ffffff',
    },
    date: {
        fontSize: 16,
        color: '#ffffff',
        position: 'absolute',
        top: 10,
        right: 20,
    },
})

VacationCard.defaultProps = {
    onPress: () => { },
    onLongPress: () => { },
}

export default VacationCard
