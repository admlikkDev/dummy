import { createContext, useContext, useState } from "react";

const authContext = createContext({
    user: null,
    login: () => {},
    logout: () => {}
})

export default function UseAuthProvider({children}) {
    const [user, setUser] = useState(() => {
        if(localStorage.getItem('user')) return JSON.parse(localStorage.getItem('user'))
        })
        // console.log(user.user)

    const login = (userData) => {
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('user')
    }

    return <authContext.Provider value={{user, login, logout}}>
        {children}
    </authContext.Provider>
}

export const useAuth = () => useContext(authContext)