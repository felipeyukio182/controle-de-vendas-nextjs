import httpReq from "../../helpers/httpReq"; 
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import env from "../../environments/env";

export default function People() {
    const username = "admin"; // preciso pegar dps da session storage talvez (ou por contexto)

    const router = useRouter();
    const [peopleList, setPeopleList] = useState(() => [{nome: "aaa", cnpj_cpf: "", cidade: "", estado: "", id: 1}]);

    useEffect(() => {
        // getPeopleList();
    }, [])

    async function getPeopleList() {
        try {
            const response = await httpReq.get(`${env.apiBaseUrl}/people?username=${username}`);
            const list = (await response.json())?.list ?? [];
            setPeopleList(list);
            console.log(list);
        } catch (error) {
            console.log(error);
        }
    }

    function newPerson() {
        router.push(`${env.routesList.people}/new`);
    }

    function editPerson(personId: number) {
        router.push(`${env.routesList.people}/${personId}/edit`);
    }

    function deletePerson(personId: number) {
        router.push(`${env.routesList.people}/${personId}/delete`);
    }

    function renderPeopleList() {
        return peopleList.map(person => {
            return (
                <tr key={person.id}>
                    <td>
                        <button onClick={() => editPerson(person.id)}>ED</button>
                        <button onClick={() => deletePerson(person.id)}>EX</button>
                    </td>
                    <td>{person.nome}</td>
                    <td>{person.cnpj_cpf}</td>
                    <td>{person.cidade}</td>
                    <td>{person.estado}</td>
                </tr>
            )
        });
    }

    return (
        <>
            <main>
                <div>people</div>

                <button onClick={() => newPerson()}>Nova Pessoa</button>

                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Razão Social/Nome</th>
                            <th>CNPJ/CPF</th>
                            <th>Cidade</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderPeopleList()}
                    </tbody>
                </table>
            </main>
        </>
    );
}