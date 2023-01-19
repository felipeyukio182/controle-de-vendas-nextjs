import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import httpReq from "../../../helpers/httpReq";
import env from "../../../environments/env";

export default function EditPeople() {
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

    async function editPerson(event: any, personId: string) {
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
            },
            personId: personId
        };
        console.log(body)
        try {
            const response = await httpReq.put(`${env.apiBaseUrl}/people`, body);
            console.log("sucesso", response);
        } catch (error) {
            console.log(error);
        }
        router.push(env.routesList.people);
    }

    function cancelEdit(event: any) {
        event.preventDefault();
        router.push(env.routesList.people);
    }

    return (
        <>
            <form>
                <h1>Editar Pessoa</h1>
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
                <button onClick={e => editPerson(e, personId)}>Salvar</button>
                <button onClick={e => cancelEdit(e)}>Cancelar</button>
            </form>
        </>
    );
}