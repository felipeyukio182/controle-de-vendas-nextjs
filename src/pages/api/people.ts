import { DeleteItemCommand, DeleteItemCommandInput, PutItemCommand, PutItemCommandInput, QueryCommand, QueryCommandInput, UpdateItemCommand, UpdateItemCommandInput } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import getDynamodbClient from "../../helpers/getDynamoClient";
import type { NextApiRequest, NextApiResponse } from 'next';
import DefaultApiResponse from "../../models/DefaultApiResponse";
import Person from "../../models/Person";
import isPerson from "../../helpers/isPerson";

async function people(req: NextApiRequest, res: NextApiResponse) {

    if (req.method === "GET") {
        const { username, personId } = req.query;
        const response = await getPeople(`${username}`, `${personId ?? ""}`);
        res.status(response.status).json(response.data);

    } else if (req.method === "POST") {
        const { username, person } = req.body;
        const response = await postPeople(username, person);
        res.status(response.status).json(response.data);

    } else if (req.method === "PUT") {
        const { username, personId, person } = req.body;
        const response = await putPeople(username, personId, person);
        res.status(response.status).json(response.data);

    } else if (req.method === "DELETE") {
        const { username, personId } = req.query;
        const response = await deletePeople(`${username}`, `${personId ?? ""}`);
        res.status(response.status).json(response.data);

    } else {
        res.status(500).send("");
    }
};


// GET
async function getPeople(username: string, personId: string): Promise<DefaultApiResponse> {
    if (username) {
        const people = await getPeopleDynamodb(username, personId);
        if (people?.length) {
            const list = people;
            return { status: 200, data: { list, msg: "Consulta realizada com sucesso." } };
        }
        return { status: 200, data: { msg: "Nenhum registro foi encontrado." } };
    }
    return { status: 400, data: { msg: "Parametros inválidos! GET" } };
}

async function getPeopleDynamodb(username: string, personId: string = "") {
    const client = getDynamodbClient();

    const command: QueryCommandInput = {
        TableName: "controle-de-vendas-nextjs",
        KeyConditionExpression: "pk = :pk and begins_with(sk, :sk)",
        ExpressionAttributeValues: {
            ":pk": { S: username },
            ":sk": { S: "people#" }
        },
    };
    if (personId) {
        command.FilterExpression = "id = :personId";
        command.ExpressionAttributeValues[":personId"] = { N: personId };
    }
    const queryCommand = new QueryCommand(command);

    try {
        const response = await client.send(queryCommand);
        return response.Items?.map(item => unmarshall(item));

    } catch (error) {
        return [];

    } finally {
        client.destroy();
    }
}


// POST
async function postPeople(username: string, person: any): Promise<DefaultApiResponse> {
    if (username && isPerson(person)) {
        const peopleList = await getPeopleDynamodb(username);
        const lastIndex = peopleList?.[peopleList?.length - 1]?.id;
        if (lastIndex) {
            const response = await postPeopleDynamodb(username, person, +lastIndex);
            if (response) {
                return { status: 200, data: { msg: "Pessoa cadastrada com sucesso!" } };
            }
        }
        return { status: 400, data: { msg: "Erro ao realizar o cadastro!" } };
    }
    return { status: 400, data: { msg: "Parametros inválidos! POST" } };
}

async function postPeopleDynamodb(username: string, person: Person, lastIndex: number|string) {
    const client = getDynamodbClient();

    const command: PutItemCommandInput = {
        TableName: "controle-de-vendas-nextjs",
        Item: {
            "pk":           { S: username },
            "sk":           { S: `people#${+lastIndex + 1}` },
            "id":           { N: `${+lastIndex + 1}` },
            "nome":         { S: person.nome },
            "cnpj_cpf":     { S: person.cnpj_cpf },
            "insc_est":     { S: person.insc_est ?? "" },
            "cidade":       { S: person.cidade },
            "estado":       { S: person.estado },
            "bairro":       { S: person.bairro },
            "logradouro":   { S: person.logradouro },
            "numero":       { S: `${person.numero}` },

        }
    };
    const queryCommand = new PutItemCommand(command);

    try {
        const response = await client.send(queryCommand);
        return response;

    } catch (error) {
        return null;

    } finally {
        client.destroy();
    }
}


// PUT
async function putPeople(username: string, personId: number|string, person: any): Promise<DefaultApiResponse> {
    if (username && personId && isPerson(person)) {
        const peopleList = await getPeopleDynamodb(username, `${personId}`);
        if (peopleList?.length) {
            const response = await putPeopleDynamodb(username, `${personId}`, person);
            if (response) {
                return { status: 200, data: { msg: "Pessoa atualizada com sucesso!" } };
            }
        }
        return { status: 400, data: { msg: "Erro ao atualizar o cadastro!" } };
    }
    return { status: 400, data: { msg: "Parametros inválidos! PUT" } };
}

async function putPeopleDynamodb(username: string, personId: string, person: Person) {
    const client = getDynamodbClient();
    const command: UpdateItemCommandInput = {
        TableName: "controle-de-vendas-nextjs",
        Key: {
            pk: { S: username },
            sk: { S: `people#${personId}` }
        },
        UpdateExpression: "SET nome = :nome, cnpj_cpf = :cnpj_cpf, insc_est = :insc_est, cidade = :cidade, estado = :estado, bairro = :bairro, logradouro = :logradouro, numero = :numero",
        ExpressionAttributeValues: {
            ":nome":        { S: person.nome },
            ":cnpj_cpf":    { S: person.cnpj_cpf },
            ":insc_est":    { S: person.insc_est ?? "" },
            ":cidade":      { S: person.cidade },
            ":estado":      { S: person.estado },
            ":bairro":      { S: person.bairro },
            ":logradouro":  { S: person.logradouro },
            ":numero":      { S: `${person.numero}` },
        }
    };
    const queryCommand = new UpdateItemCommand(command);

    try {
        const response = await client.send(queryCommand);
        return response;

    } catch (error) {
        return null;

    } finally {
        client.destroy();
    }
}


// DELETE
async function deletePeople(username: string, personId: number|string): Promise<DefaultApiResponse> {
    if (username && personId) {
        const response = await deletePeopleDynamodb(username, `${personId}`);
        if (response) {
            return { status: 200, data: { msg: "Pessoa removida com sucesso!" } };
        }
        return { status: 400, data: { msg: "Erro ao remover o cadastro!" } };
    }
    return { status: 400, data: { msg: "Parametros inválidos! DELETE" } };
}

async function deletePeopleDynamodb(username: string, personId: string) {
    const client = getDynamodbClient();
    const command: DeleteItemCommandInput = {
        TableName: "controle-de-vendas-nextjs",
        Key: {
            pk: { S: username },
            sk: { S: `people#${personId}` }
        }
    };
    const queryCommand = new DeleteItemCommand(command);

    try {
        const response = await client.send(queryCommand);
        return response;

    } catch (error) {
        return null;

    } finally {
        client.destroy();
    }
}

export default people;