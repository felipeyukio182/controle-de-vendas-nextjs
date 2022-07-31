import Sale from "../models/Sale";
import isPerson from "./isPerson";
import isProduct from "./isProduct";

function isSale(sale: any): sale is Sale {
    return "cliente" in sale
        && "produtos" in sale
        && isPerson(sale?.["cliente"])
        && allItemsAreProducts(sale?.["produtos"]);
}

function allItemsAreProducts(items: any[]): boolean {
    if (Array.isArray(items)) {
        return items?.reduce((previousValue, currentValue) => previousValue && isProduct(currentValue), true);
    }
    return false;
}

export default isSale;