import * as React from 'react'
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    RefreshControl,
    Alert,
} from 'react-native'
import { FAB } from 'react-native-paper'
import { MMKV } from 'react-native-mmkv'
import axios from 'axios'
import { API_URL } from '@env'
import CreateVacation from '../components/vacation_create_popup'
import { useVacarioAPI } from '../hooks/api'
import VacationCard from '../components/vacation_card'

type Vacation = {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
};

function HomeScreen({ navigation }: any) {
    const [dialogVisible, setDialogVisible] = React.useState(false)
    const [vacationList, setVacationList] = React.useState<Vacation[]>([])
    const [refreshing, setRefreshing] = React.useState(false)

    const storage = new MMKV()

    const api = useVacarioAPI()

    React.useEffect(() => {
        api('vacations').then((_vacationList: Vacation[]) => {
            setVacationList(_vacationList)
        })
    }, [])

    /**
   * Function to refresh the vacation list.
   * @returns void
   */
    const onRefresh = React.useCallback(() => {
        setRefreshing(true)
        api('vacations').then((_vacationList: Vacation[]) => {
            setVacationList(_vacationList)
            setRefreshing(false)
        })
    }, [])

    /**
   * Function to delete a vacation.
   * @param id The id of the vacation to delete.
   * @returns void
   */

    const deleteVacation = (id: string) => {
        const userToken = storage.getString('userToken')
        axios.delete(`${API_URL}/vacations/${id}`, {
            headers: {
                'X-API-Key': userToken,
            },
        })
            .then(() => {
                setVacationList((prevList) => prevList.filter((vacation) => vacation.id !== id))
                storage.delete('selectedVacationId')
            })
            .catch(() => {
                Alert.alert('Error', 'Failed to delete vacation')
            })
    }

    return (
        <View style={styles.container}>
            {vacationList.length === 0 ? (
                <ScrollView>
                    <Text style={styles.emptyText}>
                        Voeg nu een vakantie toe!
                    </Text>
                </ScrollView>
            ) : (
                <ScrollView
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {vacationList.map((vacation) => (
                        <VacationCard
                            key={vacation.id}
                            name={vacation.name}
                            description={vacation.description}
                            startDate={new Date(vacation.start_date)}
                            endDate={new Date(vacation.end_date)}
                            onPress={() => {
                                navigation.navigate('Timeline', { vacation })
                            }}
                            onLongPress={() => {
                                Alert.alert(
                                    'Delete Vacation',
                                    'Are you sure you want to delete this vacation?',
                                    [
                                        {
                                            text: 'Cancel',
                                            style: 'cancel',
                                        },
                                        {
                                            text: 'Delete',
                                            style: 'destructive',
                                            onPress: () => deleteVacation(vacation.id),
                                        },
                                    ],
                                )
                            }}
                        />
                    ))}
                </ScrollView>
            )}
            <View>
                <FAB
                    style={styles.fab}
                    icon="plus"
                    onPress={() => {
                        setDialogVisible(true)
                    }}
                />
                <CreateVacation
                    visible={dialogVisible}
                    onDismiss={() => {
                        setDialogVisible(false)
                        onRefresh()
                    }}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    card: {
        backgroundColor: '#ffffff',
        marginBottom: 10,
        padding: 15,
        borderRadius: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    guestsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    guestsText: {
        marginLeft: 5,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        marginLeft: 5,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: -10,
        bottom: -10,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 20,
        fontWeight: 'bold',
        color: 'rgb(205, 199, 208)',
    },
})

export default HomeScreen
