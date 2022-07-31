import Person from "./Person";
import Product from "./Product";

interface Sale {
    id?: number,
    cliente: Person,
    produtos: Product[],
    data?: string
}

export default Sale;