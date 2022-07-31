import Person from "../models/Person";

function isPerson(person: any): person is Person {
    return "nome" in person
        && "cnpj_cpf" in person
        && "cidade" in person
        && "estado" in person
        && "bairro" in person
        && "logradouro" in person
        && "numero" in person;
}

export default isPerson;