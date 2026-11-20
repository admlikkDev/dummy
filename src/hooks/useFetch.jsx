import axios from "axios"
import { useAuth } from "./useAuth"

const formatError = (error) => {
    if (!error?.response) return 'Network error'

    const errors = error?.response?.data?.errors
    return !errors ? error.response.data.message : errors
}

export default function useFetch() {
    const { user } = useAuth()
    // console.log(user.token)
    // axios.defaults.baseURL = 'https://api.adevron.my.id'
    // axios.defaults.withCredentials = true
    // axios.defaults.withXSRFToken = true
    const axiosUse = axios.create({
        // 'baseURL': 'https://supersignificant-thalia-back.ngrok-free.dev/api/v1/',
        baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/`,
        // withCredentials: true,
        // withXSRFToken: true,
        'headers': {
            Authorization: 'Bearer ' + user?.token,
            // 'ngrok-skip-browser-warning': 'true',
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json',
        }
    })

    return {
        post: async (path, value) => {
            try {
                const resp = await axiosUse.post(path, value)
                return { status: true, data: resp.data }
            } catch (error) {
                return { status: false, message: formatError(error) }
            }
        },
        get: async (path, value) => {
            try {
                const resp = await axiosUse.get(path, value)
                return { status: true, data: resp.data }
            } catch (error) {
                return { status: false, message: formatError(error) }
            }
        },
        put: async (path, value) => {
            try {
                const resp = await axiosUse.put(path, value)
                return { status: true, data: resp.data }
            } catch (error) {
                return { status: false, message: formatError(error) }
            }
        },
        destroy: async (path, value) => {
            try {
                const resp = await axiosUse.delete(path, value)
                return { status: true, data: resp.data }
            } catch (error) {
                return { status: false, message: formatError(error) }
            }
        },
        getBlob: async (path, value = {}) => {
            try {
                const resp = await axiosUse.get(path, {
                    params: value,
                    responseType: "blob"
                });

                return {
                    status: true,
                    data: resp.data
                };
            } catch (error) {
                return {
                    status: false,
                    message: formatError(error)
                };
            }
        },
    }
}