import { useRouter } from "next/router";
import { useState } from "react";
import httpReq from "../../helpers/httpReq";
import env from "../../environments/env";

export default function CreatePeople() {
    const username = "admin"; // preciso pegar dps da session storage talvez

    const [nome, setNome] = useState(() => "");
    const [cnpjCpf, setCnpjCpf] = useState(() => "");
    const [inscEst, setInscEst] = useState(() => "");
    const [cidade, setCidade] = useState(() => "");
    const [estado, setEstado] = useState(() => "");
    const [bairro, setBairro] = useState(() => "");
    const [logradouro, setLogradouro] = useState(() => "");
    const [numero, setNumero] = useState(() => "");

    const router = useRouter();

    async function createPerson(event: any) {
        event.preventDefault();
        const body = {
            username: username,
            person: {
                nome: nome,
                cnpj_cpf: cnpjCpf,
                insc_est: inscEst,
                cidade: cidade,
                estado: estado,
                bairro: bairro,
                logradouro: logradouro,
                numero: numero
            }
        };
        console.log(body)
        try {
            const response = await httpReq.post(`${env.apiBaseUrl}/people`, body);
            console.log("sucesso", response);
        } catch (error) {
            console.log(error);
        }
        router.push(env.routesList.people);
    }

    function cancelCreate(event: any) {
        event.preventDefault();
        router.push(env.routesList.people);
    }

    return (
        <>
            <form>
                <h1>Nova Pessoa</h1>
                <h2>Dados Principais</h2>
                <div>
                    <div>
                        <label>Razão Social/Nome</label>
                        <input id="nome" type="text" value={nome} onChange={e => setNome(e.target.value)}/>
                    </div>
                    <div>
                        <label>CNPJ/CPF</label>
                        <input id="cnpjCpf" type="text" value={cnpjCpf} onChange={e => setCnpjCpf(e.target.value)}/>
                    </div>
                    <div>
                        <label>IE</label>
                        <input id="ie" type="text" value={inscEst} onChange={e => setInscEst(e.target.value)}/>
                    </div>
                </div>
                <h2>Endereço</h2>
                <div>
                    <div>
                        <label>Logradouro</label>
                        <input id="logradouro" type="text" value={logradouro} onChange={e => setLogradouro(e.target.value)}/>
                    </div>
                    <div>
                        <label>Numero</label>
                        <input id="numero" type="text" value={numero} onChange={e => setNumero(e.target.value)}/>
                    </div>
                </div>
                <div>
                    <div>
                        <label>Bairro</label>
                        <input id="bairro"type="text" value={bairro} onChange={e => setBairro(e.target.value)}/>
                    </div>
                    <div>
                        <label>Cidade</label>
                        <input id="cidade"type="text" value={cidade} onChange={e => setCidade(e.target.value)}/>
                    </div>
                    <div>
                        <label>Estado</label>
                        <select id="estado" value={estado} onChange={e => setEstado(e.target.value)}>
                            <option value=""></option>
                            <option>estado</option>
                        </select>
                    </div>
                </div>
                <button onClick={e => createPerson(e)}>Salvar</button>
                <button onClick={e => cancelCreate(e)}>Cancelar</button>
            </form>
        </>
    );
}