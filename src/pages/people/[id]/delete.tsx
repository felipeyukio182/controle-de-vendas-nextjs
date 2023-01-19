import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import httpReq from "../../../helpers/httpReq";
import env from "../../../environments/env";

export default function DeletePeople() {
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
    const personId = router.query?.id as string;

    useEffect(() => {
        if (personId) {
            getPerson(personId);
        }
    }, [personId]);

    async function getPerson(personId: string) {
        try {           
            const response = await httpReq.get(`${env.apiBaseUrl}/people?username=${username}&personId=${personId}`);
            const personResponse = (await response.json())?.list?.[0] ?? {};
            setNome(personResponse.nome ?? "");
            setCnpjCpf(personResponse.cnpj_cpf ?? "");
            setInscEst(personResponse.insc_est ?? "");
            setCidade(personResponse.cidade ?? "");
            setEstado(personResponse.estado ?? "");
            setBairro(personResponse.bairro ?? "");
            setLogradouro(personResponse.logradouro ?? "");
            setNumero(personResponse.numero ?? "");
        } catch (error) {
            console.log(error);
        }
    }

    async function deletePerson(event: any, personId: string) {
        event.preventDefault();
        try {
            const response = await httpReq.del(`${env.apiBaseUrl}/people?username=${username}&personId${personId}`);
            console.log("sucesso", response);
        } catch (error) {
            console.log(error);
        }
        router.push(env.routesList.people);
    }

    function cancelDelete(event: any) {
        event.preventDefault();
        router.push(env.routesList.people);
    }

    return (
        <>
            <form>
                <h1>Excluir Pessoa</h1>
                <h2>Dados Principais</h2>
                <div>
                    <div>
                        <label>Razão Social/Nome</label>
                        <input id="nome" type="text" value={nome} disabled={true} onChange={e => setNome(e.target.value)}/>
                    </div>
                    <div>
                        <label>CNPJ/CPF</label>
                        <input id="cnpjCpf" type="text" value={cnpjCpf} disabled={true} onChange={e => setCnpjCpf(e.target.value)}/>
                    </div>
                    <div>
                        <label>IE</label>
                        <input id="ie" type="text" value={inscEst} disabled={true} onChange={e => setInscEst(e.target.value)}/>
                    </div>
                </div>
                <h2>Endereço</h2>
                <div>
                    <div>
                        <label>Logradouro</label>
                        <input id="logradouro" type="text" value={logradouro} disabled={true} onChange={e => setLogradouro(e.target.value)}/>
                    </div>
                    <div>
                        <label>Numero</label>
                        <input id="numero" type="text" value={numero} disabled={true} onChange={e => setNumero(e.target.value)}/>
                    </div>
                </div>
                <div>
                    <div>
                        <label>Bairro</label>
                        <input id="bairro"type="text" value={bairro} disabled={true} onChange={e => setBairro(e.target.value)}/>
                    </div>
                    <div>
                        <label>Cidade</label>
                        <input id="cidade"type="text" value={cidade} disabled={true} onChange={e => setCidade(e.target.value)}/>
                    </div>
                    <div>
                        <label>Estado</label>
                        <select id="estado" value={estado} disabled={true} onChange={e => setEstado(e.target.value)}>
                            <option value=""></option>
                            <option>estado</option>
                        </select>
                    </div>
                </div>
                <button onClick={e => deletePerson(e, personId)}>Excluir</button>
                <button onClick={e => cancelDelete(e)}>Cancelar</button>
            </form>
        </>
    );
}