import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

interface FilledHeaderProps {
    title: string;
}

function FilledHeader({ title }: FilledHeaderProps) {
    return (
        <View style={styles.card}>
            <Icon
                style={{ position: 'absolute', left: 20 }}
                name="circle"
                size={18}
                color="#3398d588"
            />
            <Text style={styles.title}>{title}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 50,
        overflow: 'hidden',
        height: 60,
        marginBottom: 20,
        marginHorizontal: 5,
        backgroundColor: '#0f2c3d',
        display: 'flex',
        justifyContent: 'center',
    },
    title: {
        color: 'white',
        margin: 'auto',
        marginLeft: 55,
        fontSize: 18,
        fontWeight: '600',
        alignSelf: 'flex-start',
    },
})

export default FilledHeader
