

function get(url: string) {
    const init = {
        method: "GET",
        headers: getHeaders(null),
    }
    return fetch(url, init);
}

function post(url: string, body: any) {
    const init = {
        method: "POST",
        headers: getHeaders({ 'Content-Type': "application/json" }),
        body: JSON.stringify(body),
    }
    return fetch(url, init);
}

function put(url: string, body: any) {
    const init = {
        method: "PUT",
        headers: getHeaders({ 'Content-Type': "application/json" }),
        body: JSON.stringify(body),
    }
    return fetch(url, init);
}

function del(url: string) {
    const init = {
        method: "DELETE",
        headers: getHeaders({ 'Content-Type': "application/json" }),
    }
    return fetch(url, init);
}

function getHeaders(objInit: any) {
    let headers = objInit ? new Headers(objInit) : new Headers();

    return headers;
}

const httpReq = {
    get, post, put, del
}

export default httpReq;