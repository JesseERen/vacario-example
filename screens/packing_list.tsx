import * as React from 'react'
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    RefreshControl,
    TouchableWithoutFeedback,
    Alert,
} from 'react-native'
import axios from 'axios'
import { List, Checkbox, FAB } from 'react-native-paper'
import { MMKV } from 'react-native-mmkv'
import { API_URL } from '@env'
import { useVacarioAPI } from '../hooks/api'
import CreatePackingListItemDialog from '../components/item_popup'

interface PackingListItem {
    name: string
    id: string
    user_id: string
    checked: boolean
}

interface IPropsPackingListItem {
    showDeleteOption: boolean,
    itemToDelete: PackingListItem | null,
    item: PackingListItem,
    handleDelete: () => void,
    checkedList: boolean[],
    index: number,
    handleCheckboxToggle: (index: number) => void,
}

function PackingListItemComp({
    showDeleteOption,
    itemToDelete,
    item,
    handleDelete,
    checkedList,
    index,
    handleCheckboxToggle,
}: IPropsPackingListItem) {
    return (<View style={{ flexDirection: 'row' }}>
        {showDeleteOption && itemToDelete?.id === item.id ? (
            <Text
                style={{ color: 'red', marginRight: 10 }}
                onPress={handleDelete}
            >
                Delete
            </Text>
        ) : (
            <Checkbox
                status={
                    item.checked
                        ? 'checked'
                        : 'unchecked'
                        && (
                            checkedList[index]
                                ? 'checked'
                                : 'unchecked'
                        )
                }
                onPress={() => handleCheckboxToggle(index)}
            />
        )}
    </View>)
}

function PackingListScreen() {
    const api = useVacarioAPI()
    const [packingList, setPackingList] = React.useState<PackingListItem[]>([])
    const [checkedList, setCheckedList] = React.useState<boolean[]>([])
    const [refreshing, setRefreshing] = React.useState(false)
    const [dialogVisible, setDialogVisible] = React.useState(false)
    const [showDeleteOption, setShowDeleteOption] = React.useState(false)
    const [itemToDelete, setItemToDelete] = React.useState<PackingListItem | null>(
        null,
    )
    const storage = new MMKV()

    React.useEffect(() => {
        api('packing_list/items').then((_packingList) => {
            setPackingList(_packingList)
            setCheckedList(new Array(_packingList.length).fill(false))
        })
    }, [])

    const onRefresh = React.useCallback(() => {
        setRefreshing(true)
        api('packing_list/items').then((_packingList) => {
            setPackingList(_packingList)
            setRefreshing(false)
        })
    }, [])

    /**
     * Handles the toggle of a checkbox for a packing list item.
     * @param index - The index of the item in the packing list.
     * @returns void
     */
    const handleCheckboxToggle = async (index: number): Promise<void> => {
        const newCheckedList = packingList.map((item, i) => {
            if (i === index) {
                return !item.checked
            }
            return item.checked
        })

        const userToken = storage.getString('userToken')
        const item = packingList[index]
        try {
            await axios.patch(
                `${API_URL}/packing_list/items/${item.id}`,
                {
                    name: item.name,
                    checked: newCheckedList[index],
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': userToken,
                    },
                },
            )
        } catch (error) { /* empty */ }
        onRefresh()
    }

    const handleLongPress = (item: PackingListItem) => {
        setItemToDelete(item)
        setShowDeleteOption(true)
    }

    const handleDelete = async () => {
        const userToken = storage.getString('userToken')
        const url = `${API_URL}/packing_list/items/${itemToDelete?.id}`
        try {
            await axios.delete(
                url,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': userToken,
                    },
                },
            )
        } catch (error) {
            Alert.alert('Error', 'Failed to delete packing list item')
        }
        setShowDeleteOption(false)
        setItemToDelete(null)
        onRefresh()
    }

    return (
        <TouchableWithoutFeedback onPress={() => setShowDeleteOption(false)}>
            <View style={styles.container}>
                {packingList.length === 0 ? (
                    <ScrollView>
                        <Text style={styles.emptyText}>
                            inpaklijst leeg voeg een item toe!
                        </Text>
                    </ScrollView>
                ) : (
                    <ScrollView
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        contentContainerStyle={{ paddingBottom: 80 }}
                    >
                        {packingList.map((item, index) => {
                            return (
                                <TouchableWithoutFeedback
                                    key={item.id}
                                    onLongPress={() => handleLongPress(item)}
                                >
                                    <View>
                                        <List.Item
                                            style={styles.item}
                                            title={item.name}
                                            titleStyle={{ color: 'rgb(205, 199, 208)' }}
                                            // eslint-disable-next-line react/no-unstable-nested-components
                                            right={() => {
                                                return <PackingListItemComp
                                                    checkedList={checkedList}
                                                    handleCheckboxToggle={handleCheckboxToggle}
                                                    handleDelete={handleDelete}
                                                    index={index}
                                                    item={item}
                                                    itemToDelete={itemToDelete}
                                                    showDeleteOption={showDeleteOption}
                                                    key={item.id}
                                                />
                                            }}
                                        />
                                    </View>
                                </TouchableWithoutFeedback>
                            )
                        })}
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
                    <CreatePackingListItemDialog
                        visible={dialogVisible}
                        onDismiss={() => {
                            setDialogVisible(false)
                            onRefresh()
                        }}
                    />
                </View>
            </View>
        </TouchableWithoutFeedback>
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
    item: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgb(67, 64, 72)',
        paddingBottom: 10,
    },
    fab: {
        position: 'absolute',
        margin: 6,
        right: 0,
        bottom: 0,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 20,
        fontWeight: 'bold',
        color: 'rgb(205, 199, 208)',
    },
})

export default PackingListScreen
