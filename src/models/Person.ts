interface Person {
    id?: number,
    nome: string,
    cnpj_cpf: string,
    insc_est?: string,
    cidade: string,
    estado: string,
    bairro: string,
    logradouro: string,
    numero: number|string
}

export default Person;