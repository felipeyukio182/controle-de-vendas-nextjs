import { useState } from "react";
import httpReq from "../../helpers/httpReq";
import { useRouter } from "next/router";
import env from "../../environments/env";

export interface LoginResponse {
    user?: {
        username: string
    },
    msg: string
}

export default function Login() {
    const [ user, setUser ] = useState("");
    const [ password, setPassword ] = useState("");

    const router = useRouter();

    const login = async (e: any) => {
        e.preventDefault();
        console.log(user, password);
        const body = {
            username: user,
            password: password
        };
        const resp = await httpReq.post(`${env.apiBaseUrl}/login`, body);
        const responseData = await resp.json();
        validateLogin(responseData);
    }

    const validateLogin = (responseData: LoginResponse) => {
        if (responseData.user?.username) {
            console.log("valido");
            localStorage.setItem(env.localStorageLoginKey, "123");
            router.push(`${env.routesList.home}`);
        } else {
            console.log("invalido");
        }
    }

    return (
        <div>
            <form onSubmit={login}>
                <div>
                    <label>Usuario</label>
                    <input type="text" value={user} onChange={(e) => setUser(e.target.value)} />
                </div>
                <div>
                    <label>Senha</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <button>Acessar sistema</button>
            </form>
        </div>
    );
}