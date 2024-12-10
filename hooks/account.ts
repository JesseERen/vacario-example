import React from 'react'

// @ts-ignore
const AuthContext = React.createContext<{ isLoggedIn: boolean, setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>> }>()

export default AuthContext
