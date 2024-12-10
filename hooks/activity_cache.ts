import { MMKV } from 'react-native-mmkv'
import { Activity } from '../screens/timeline'

const getActivity = (activityId: String) => {
    return new Promise<Activity>((resolve, reject) => {
        const storage = new MMKV()
        const cache: Map<String, Activity> = new Map(JSON.parse(storage.getString('activity-cache') || '[]'))

        const activity = cache.get(activityId)
        if (activity) {
            resolve(activity)
        } else {
            reject()
        }
    })
}

const setActivity = (activityId: String, activity: Activity) => {
    return new Promise<void>((resolve) => {
        const storage = new MMKV()
        const cache: Map<String, Activity> = new Map(JSON.parse(storage.getString('activity-cache') || '[]'))

        const cachedVacation = cache.get(activityId)
        if (cachedVacation) {
            cache.set(activityId, activity)
            storage.set('activity-cache', JSON.stringify(Array.from(cache.entries())))
            resolve()
        } else {
            cache.set(activityId, activity)
            // make sure cache doesn't infinitely grow
            if (cache.size > 5) {
                // remove oldest entry from the cache
                const oldestEntry = cache.entries().next().value
                cache.delete(oldestEntry[0])
            }
            storage.set('activity-cache', JSON.stringify(Array.from(cache.entries())))
            resolve()
        }
    })
}

export function useActivityCache() {
    return { getActivity, setActivity }
}
