import React, { createContext, useEffect, useReducer } from "react";
import env from "../environments/env";
import { useRouter } from "next/router";

const AuthContext = createContext(null);

const initialState = {
    username: "",
    token: ""
};

const reducer = (state: any, action: any) => {
    switch (action.type) {
        case "username":
            return { ...state, username: action.payload };
        case "token":
            return { ...state, token: action.payload };
        default:
            return { ...state };
    }
}


export default function AuthContextProvider(props) {

    const router = useRouter();
    const [state, dispatch] = useReducer(reducer, initialState);

    const setUsername = (username: string) => {
        dispatch({type: "username", payload: username});
    };

    const setToken = (token: string) => {
        localStorage.setItem(env.localStorageLoginKey, token);
        dispatch({type: "token", payload: token});
    };

    useEffect(() => {
        const storageKey = localStorage.getItem(env.localStorageLoginKey);
        if (storageKey) {
            setToken(storageKey);
        }
        //     if (router.asPath.includes(env.routesList.login)) {
        //         router.push(env.routesList.home);
        //     }
        // } else {
        //     router.push(env.routesList.login);
        // }
    }, []);

    useEffect(() => {
        console.log("router mudou")
        const storageKey = localStorage.getItem(env.localStorageLoginKey);
        if (!storageKey && !router.asPath.includes(env.routesList.login)) {
            router.push(env.routesList.login);
        } else if (storageKey && router.asPath.includes(env.routesList.login)) {
            router.push(env.routesList.home);
        }
    }, [router]);

    const data = {
        username: state.username,
        token: state.token,
        setUsername,
        setToken
    };

    return (
        <AuthContext.Provider value={data}>
            {props.children}
        </AuthContext.Provider>
    );
}