import axios from 'axios'
import { MMKV } from 'react-native-mmkv'

const API_BASE_URL = __DEV__ ? 'https://test.vacario.nl/api' : 'https://test.vacario.nl/api'

/**
 * Makes an API request to the backend server.
 * @param path - The path of the API endpoint to call. (no leading slash)
 * @param options - Optional request options such as body and headers.
 * @returns The response data from the API endpoint.
 * @throws An error if the user token is not available or if the request returns a non-200 status code.
 */
const apiRequest = async (path: string, options?: { body: unknown, headers: { header: string, value: string } } | undefined) => {
    const storage = new MMKV()
    const userToken = storage.getString('userToken')

    if (!userToken) throw new Error('No user token available, this should be set in storage as \'userToken\'')

    const res = await axios.get(`${API_BASE_URL}/${path}`, {
        data: options?.body,
        headers: {
            ...options?.headers,
            'X-API-Key': userToken,
        },
    })

    if (res.status === 200) {
        return res.data
    }
    throw new Error(`Request returned non 200 status code: ${res.status}, see logs for more details`)
}

/**
 * Hook for making Vacario API requests with token injection
 * @returns Returns a function that wraps api calls which returns the response data from the API endpoint.
 */
export function useVacarioAPI() {
    return apiRequest
}
