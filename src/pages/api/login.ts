import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import getDynamodbClient from "../../helpers/getDynamoClient";
import type { NextApiRequest, NextApiResponse } from 'next';
import DefaultApiResponse from "../../models/DefaultApiResponse";

async function login(req: NextApiRequest, res: NextApiResponse) {

    if (req.method === "POST") {
        const { username, password } = req.body;
        const response = await postLogin(username, password);
        res.status(response.status).json(response.data);
    } else {
        res.status(500).send("");
    }
};

async function postLogin(username: string, password: string): Promise<DefaultApiResponse> {
    
    if (username && password) {
        const users = await getUsersDynamodb(username, password);
        if (users?.length) {
            const user = {
                username: users[0]?.pk,
            };
            return { status: 200, data: { user, msg: "Login autorizado!" } };
        } else {
            return { status: 200, data: { msg: "Usuario ou senha inválidos!" } };
        }
    } else {
        return { status: 400, data: { msg: "Parametros inválidos!" } };
    }
}

async function getUsersDynamodb(username: string, password: string) {

    const client = getDynamodbClient();

    const queryCommand = new QueryCommand({
        TableName: "controle-de-vendas-nextjs",
        KeyConditionExpression: "pk = :pk and begins_with(sk, :sk)",
        FilterExpression: "password = :password",
        ExpressionAttributeValues: {
            ":pk": { S: username },
            ":sk": { S: "user#" },
            ":password": { S: password }
        },
    });

    try {
        const response = await client.send(queryCommand);
        return response.Items?.map(item => unmarshall(item));
    
    } catch (error) {
        return [];
    
    } finally {
        client.destroy();
    }
}

export default login;