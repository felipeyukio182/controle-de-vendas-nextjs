import { DeleteItemCommand, DeleteItemCommandInput, PutItemCommand, PutItemCommandInput, QueryCommand, QueryCommandInput, UpdateItemCommand, UpdateItemCommandInput } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import getDynamodbClient from "../../helpers/getDynamoClient";
import type { NextApiRequest, NextApiResponse } from 'next';
import DefaultApiResponse from "../../models/DefaultApiResponse";
import isSale from "../../helpers/isSale";
import Sale from "../../models/Sale";

async function sales(req: NextApiRequest, res: NextApiResponse) {

    if (req.method === "GET") {
        const { username, saleId, initialDate, finalDate } = req.query;
        const response = await getSales(`${username}`, `${saleId ?? ""}`, `${initialDate ?? ""}`, `${finalDate ?? ""}`);
        res.status(response.status).json(response.data);

    } else if (req.method === "POST") {
        const { username, sale } = req.body;
        const response = await postSales(username, sale);
        res.status(response.status).json(response.data);

    } else if (req.method === "PUT") {
        const { username, saleId, sale } = req.body;
        const response = await putSales(username, saleId, sale);
        res.status(response.status).json(response.data);

    } else if (req.method === "DELETE") {
        const { username, saleId } = req.query;
        const response = await deleteSales(`${username}`, `${saleId ?? ""}`);
        res.status(response.status).json(response.data);

    } else {
        res.status(500).send("");
    }
};


// GET
async function getSales(username: string, saleId: string, initialDate: string, finalDate: string): Promise<DefaultApiResponse> {
    if (username) {
        const { formatedInitialDate, formatedFinalDate } = formatDateToIsoString(initialDate, finalDate);
        const sales = await getSalesDynamodb(username, saleId, formatedInitialDate, formatedFinalDate);
        if (sales?.length) {
            const list = sales;
            return { status: 200, data: { list, msg: "Consulta realizada com sucesso." } };
        }
        return { status: 200, data: { msg: "Nenhum registro foi encontrado." } };
    }
    return { status: 400, data: { msg: "Parametros inválidos! GET" } };
}

async function getSalesDynamodb(username: string, saleId: string = "", formatedInitialDate: string = "", formatedFinalDate: string = "") {
    const client = getDynamodbClient();

    const command: QueryCommandInput = {
        TableName: "controle-de-vendas-nextjs",
        KeyConditionExpression: "pk = :pk and begins_with(sk, :sk)",
        ExpressionAttributeValues: {
            ":pk": { S: username },
            ":sk": { S: "sales#" }
        },
    }
    if (saleId) {
        command.FilterExpression = "id = :saleId";
        command.ExpressionAttributeValues[":saleId"] = { N: saleId };
    } else if (formatedInitialDate && formatedFinalDate) {
        command.FilterExpression = "#data BETWEEN :initialDate AND :finalDate";
        command.ExpressionAttributeValues[":initialDate"] = { S: formatedInitialDate };
        command.ExpressionAttributeValues[":finalDate"] = { S: formatedFinalDate };
        command.ExpressionAttributeNames = { "#data": "data" };
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
async function postSales(username: string, sale: any): Promise<DefaultApiResponse> {
    if (username && isSale(sale)) {
        const salesList = await getSalesDynamodb(username);
        const lastIndex = salesList?.[salesList?.length - 1]?.id;
        if (lastIndex) {
            const response = await postSalesDynamodb(username, sale, +lastIndex);
            if (response) {
                return { status: 200, data: { msg: "Venda cadastrada com sucesso!" } };
            }
        }
        return { status: 400, data: { msg: "Erro ao realizar o cadastro!" } };
    }
    return { status: 400, data: { msg: "Parametros inválidos! POST" } };
}

async function postSalesDynamodb(username: string, sale: Sale, lastIndex: number|string) {
    const client = getDynamodbClient();

    const data = (new Date()).toISOString();
    const cliente = createPersonMapObjectForDynamodb(sale);
    const produtos = createProductsListForDynamodb(sale);
    const command: PutItemCommandInput = {
        TableName: "controle-de-vendas-nextjs",
        Item: {
            "pk":       { S: username },
            "sk":       { S: `sales#${+lastIndex + 1}` },
            "id":       { N: `${+lastIndex + 1}` },
            "cliente":  { M: cliente },
            "produtos": { L: produtos },
            "data":     { S: data }
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
async function putSales(username: string, saleId: number|string, sale: any): Promise<DefaultApiResponse> {
    if (username && saleId && isSale(sale)) {
        const salesList = await getSalesDynamodb(username, `${saleId}`);
        if (salesList?.length) {
            const response = await putSalesDynamodb(username, `${saleId}`, sale);
            if (response) {
                return { status: 200, data: { msg: "Venda atualizada com sucesso!" } };
            }
        }
        return { status: 400, data: { msg: "Erro ao atualizar o cadastro!" } };
    }
    return { status: 400, data: { msg: "Parametros inválidos! PUT" } };
}

async function putSalesDynamodb(username: string, saleId: string, sale: Sale) {
    const client = getDynamodbClient();

    const cliente = createPersonMapObjectForDynamodb(sale);
    const produtos = createProductsListForDynamodb(sale);
    const command: UpdateItemCommandInput = {
        TableName: "controle-de-vendas-nextjs",
        Key: {
            pk: { S: username },
            sk: { S: `sales#${saleId}` }
        },
        UpdateExpression: "SET cliente = :cliente, produtos = :produtos",
        ExpressionAttributeValues: {
            ":cliente":     { M: cliente },
            ":produtos":    { L: produtos }
        }
    }
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
async function deleteSales(username: string, saleId: number|string): Promise<DefaultApiResponse> {
    if (username && saleId) {
        const response = await deleteSalesDynamodb(username, `${saleId}`);
        if (response) {
            return { status: 200, data: { msg: "Venda removida com sucesso!" } };
        }
        return { status: 400, data: { msg: "Erro ao remover o cadastro!" } };
    }
    return { status: 400, data: { msg: "Parametros inválidos! DELETE" } };
}

async function deleteSalesDynamodb(username: string, saleId: string) {
    const client = getDynamodbClient();
    const command: DeleteItemCommandInput = {
        TableName: "controle-de-vendas-nextjs",
        Key: {
            pk: { S: username },
            sk: { S: `sales#${saleId}` }
        }
    }
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

// HELPERS
function formatDateToIsoString(initialDate: string, finalDate: string) {
    let formatedInitialDate = "";
    let formatedFinalDate = "";
    try {
        formatedInitialDate = (new Date(`${initialDate} 00:00:00`)).toISOString();
        formatedFinalDate = (new Date(`${finalDate} 23:59:59`)).toISOString();
        return { formatedInitialDate, formatedFinalDate };
    } catch (error) {
        return { formatedInitialDate, formatedFinalDate };
    }
}

function createPersonMapObjectForDynamodb(sale: Sale) {
    return {
        id:         { N: `${sale.cliente.id}` },
        nome:       { S: sale.cliente.nome },
        cnpj_cpf:   { S: sale.cliente.cnpj_cpf },
        insc_est:   { S: sale.cliente.insc_est ?? "" },
        cidade:     { S: sale.cliente.cidade },
        estado:     { S: sale.cliente.estado },
        bairro:     { S: sale.cliente.bairro },
        logradouro: { S: sale.cliente.logradouro },
        numero:     { S: `${sale.cliente.numero}` }
    };
}
function createProductsListForDynamodb(sale: Sale) {
    return sale.produtos.map(produto => {
        return {
            M: {
                id:         { N: `${produto.id}` },
                nome:       { S: produto.nome },
                preco:      { N: `${produto.preco}` },
                quantidade: { N: `${produto.quantidade ?? 0}`},
                desconto:   { N: `${produto.desconto ?? 0}` }
            }
        }
    });
}

export default sales;