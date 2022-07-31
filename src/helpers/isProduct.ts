import Product from "../models/Product";

function isProduct(product: any): product is Product {
    return "nome" in product
        && "preco" in product;
}

export default isProduct;