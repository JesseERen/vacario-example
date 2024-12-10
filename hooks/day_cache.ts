import { MMKV } from 'react-native-mmkv'
import { Day } from '../screens/timeline'

const getVacationDays = (vacationId: String) => {
    return new Promise<Day[]>((resolve, reject) => {
        const storage = new MMKV()
        const cache: Map<String, Day[]> = new Map(JSON.parse(storage.getString('day-cache') || '[]'))

        const vacationDays = cache.get(vacationId)
        if (vacationDays) {
            resolve(vacationDays)
        } else {
            reject()
        }
    })
}

const setVacationDays = (vacationId: String, vacationDays: Day[]) => {
    return new Promise<void>((resolve) => {
        const storage = new MMKV()
        const cache: Map<String, Day[]> = new Map(JSON.parse(storage.getString('day-cache') || '[]'))

        const cachedVacation = cache.get(vacationId)
        if (cachedVacation) {
            cache.set(vacationId, vacationDays)
            storage.set('day-cache', JSON.stringify(Array.from(cache.entries())))
            resolve()
        } else {
            cache.set(vacationId, vacationDays)
            // make sure cache doesn't infinitely grow
            if (cache.size > 5) {
                // remove oldest entry from the cache
                const oldestEntry = cache.entries().next().value
                cache.delete(oldestEntry[0])
            }
            storage.set('day-cache', JSON.stringify(Array.from(cache.entries())))
            resolve()
        }
    })
}

export function useDayCache() {
    return { getVacationDays, setVacationDays }
}
