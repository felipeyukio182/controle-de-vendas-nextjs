import { DeleteItemCommand, DeleteItemCommandInput, PutItemCommand, PutItemCommandInput, QueryCommand, QueryCommandInput, UpdateItemCommand, UpdateItemCommandInput } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import getDynamodbClient from "../../helpers/getDynamoClient";
import type { NextApiRequest, NextApiResponse } from 'next';
import DefaultApiResponse from "../../models/DefaultApiResponse";
import Product from "../../models/Product";
import isProduct from "../../helpers/isProduct";

async function products(req: NextApiRequest, res: NextApiResponse) {

    if (req.method === "GET") {
        const { username, productId } = req.query;
        const response = await getProducts(`${username}`, `${productId ?? ""}`);
        res.status(response.status).json(response.data);

    } else if (req.method === "POST") {
        const { username, product } = req.body;
        const response = await postProducts(username, product);
        res.status(response.status).json(response.data);

    } else if (req.method === "PUT") {
        const { username, productId, product } = req.body;
        const response = await putProducts(username, productId, product);
        res.status(response.status).json(response.data);

    } else if (req.method === "DELETE") {
        const { username, productId } = req.query;
        const response = await deleteProducts(`${username}`, `${productId ?? ""}`);
        res.status(response.status).json(response.data);

    } else {
        res.status(500).send("");
    }
};


// GET
async function getProducts(username: string, personId: string): Promise<DefaultApiResponse> {
    if (username) {
        const product = await getProductsDynamodb(username, personId);
        if (product?.length) {
            const list = product;
            return { status: 200, data: { list, msg: "Consulta realizada com sucesso." } };
        }
        return { status: 200, data: { msg: "Nenhum registro foi encontrado." } };
    }
    return { status: 400, data: { msg: "Parametros inválidos! GET" } };
}

async function getProductsDynamodb(username: string, productId: string = "") {
    const client = getDynamodbClient();

    const command: QueryCommandInput = {
        TableName: "controle-de-vendas-nextjs",
        KeyConditionExpression: "pk = :pk and begins_with(sk, :sk)",
        ExpressionAttributeValues: {
            ":pk": { S: username },
            ":sk": { S: "products#" }
        },
    };
    if (productId) {
        command.FilterExpression = "id = :productId";
        command.ExpressionAttributeValues[":productId"] = { N: productId };
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
async function postProducts(username: string, product: any): Promise<DefaultApiResponse> {
    if (username && isProduct(product)) {
        const productsList = await getProductsDynamodb(username);
        const lastIndex = productsList?.[productsList?.length - 1]?.id;
        if (lastIndex) {
            const response = await postProductsDynamodb(username, product, +lastIndex);
            if (response) {
                return { status: 200, data: { msg: "Produto cadastrado com sucesso!" } };
            }
        }
        return { status: 400, data: { msg: "Erro ao realizar o cadastro!" } };
    }
    return { status: 400, data: { msg: "Parametros inválidos! POST" } };
}

async function postProductsDynamodb(username: string, product: Product, lastIndex: number|string) {
    const client = getDynamodbClient();

    const command: PutItemCommandInput = {
        TableName: "controle-de-vendas-nextjs",
        Item: {
            "pk":       { S: username },
            "sk":       { S: `products#${+lastIndex + 1}` },
            "id":       { N: `${+lastIndex + 1}` },
            "nome":     { S: product.nome },
            "preco":    { N: `${product.preco}` }
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
async function putProducts(username: string, productId: number|string, product: any): Promise<DefaultApiResponse> {
    if (username && productId && isProduct(product)) {
        const productsList = await getProductsDynamodb(username, `${productId}`);
        if (productsList?.length) {
            const response = await putProductsDynamodb(username, `${productId}`, product);
            if (response) {
                return { status: 200, data: { msg: "Produto atualizado com sucesso!" } };
            }
        }
        return { status: 400, data: { msg: "Erro ao atualizar o cadastro!" } };
    }
    return { status: 400, data: { msg: "Parametros inválidos! PUT" } };
}

async function putProductsDynamodb(username: string, productId: string, product: Product) {
    const client = getDynamodbClient();
    const command: UpdateItemCommandInput = {
        TableName: "controle-de-vendas-nextjs",
        Key: {
            pk: { S: username },
            sk: { S: `products#${productId}` }
        },
        UpdateExpression: "SET nome = :nome, preco = :preco",
        ExpressionAttributeValues: {
            ":nome":    { S: product.nome },
            ":preco":   { N: `${product.preco}` }
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
async function deleteProducts(username: string, productId: number|string): Promise<DefaultApiResponse> {
    if (username && productId) {
        const response = await deleteProductsDynamodb(username, `${productId}`);
        if (response) {
            return { status: 200, data: { msg: "Produto removido com sucesso!" } };
        }
        return { status: 400, data: { msg: "Erro ao remover o cadastro!" } };
    }
    return { status: 400, data: { msg: "Parametros inválidos! DELETE" } };
}

async function deleteProductsDynamodb(username: string, productId: string) {
    const client = getDynamodbClient();
    const command: DeleteItemCommandInput = {
        TableName: "controle-de-vendas-nextjs",
        Key: {
            pk: { S: username },
            sk: { S: `products#${productId}` }
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

export default products;