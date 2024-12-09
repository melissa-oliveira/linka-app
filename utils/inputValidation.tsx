/**
 * Validates a Brazilian CPF (Cadastro de Pessoas Físicas)
 * @param cpf - The CPF number as a string (with or without dots and dashes)
 * @returns Returns true if the CPF is valid, otherwise false
 */
export function validCpf(cpf: string): boolean {
    cpf = cpf.replace(/[^\d]+/g, '');

    if (cpf.length !== 11) return false;

    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let firstCheck = (sum * 10) % 11;
    if (firstCheck === 10 || firstCheck === 11) firstCheck = 0;
    if (firstCheck !== parseInt(cpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    let secondCheck = (sum * 10) % 11;
    if (secondCheck === 10 || secondCheck === 11) secondCheck = 0;
    if (secondCheck !== parseInt(cpf.charAt(10))) return false;

    return true;
}

/**
 * Validates a Brazilian CNPJ (Cadastro Nacional de Pessoa Jurídica)
 * @param cnpj - The CNPJ number as a string (with or without dots and dashes)
 * @returns Returns true if the CNPJ is valid, otherwise false
 */
export function validCnpj(cnpj: string): boolean {
    cnpj = cnpj.replace(/[^\d]+/g, '');

    if (cnpj.length !== 14) return false;

    if (/^(\d)\1{13}$/.test(cnpj)) return false;

    const validateDigit = (cnpj: string, length: number, weights: number[]) => {
        let sum = 0;
        for (let i = 0; i < length; i++) {
            sum += parseInt(cnpj.charAt(i)) * weights[i];
        }
        let check = sum % 11;
        return check < 2 ? 0 : 11 - check;
    };

    const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const secondWeights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    const firstCheck = validateDigit(cnpj, 12, firstWeights);
    if (firstCheck !== parseInt(cnpj.charAt(12))) return false;

    const secondCheck = validateDigit(cnpj, 13, secondWeights);
    if (secondCheck !== parseInt(cnpj.charAt(13))) return false;

    return true;
}

/**
 * Validates a Brazilian postal code (CEP - Código de Endereçamento Postal)
 * @param cep - The postal code as a string (with or without dashes)
 * @returns Returns true if the postal code is valid, otherwise false
 */
export function validCep(cep: string): boolean {
    cep = cep.replace(/[^\d]+/g, '');

    return cep.length === 8;
}

/**
 * Validates a Brazilian mobile phone number in the international format
 * Expected format example: +5542999999999
 * @param phone - The phone number in international format as a string
 * @returns Returns true if the mobile phone number is valid, otherwise false
 */
export function validPhone(phone: string): boolean {
    phone = phone.replace(/[^\d+]+/g, '');

    if (!phone.startsWith('+55')) return false;

    phone = phone.slice(3);
    if (phone.length !== 11) return false;
    if (phone.charAt(2) !== '9') return false;

    return true;
}

/**
 * Validates an email address
 * @param email - The email address as a string
 * @returns Returns true if the email is valid, otherwise false
 */
export function validEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

/**
 * Validates if a given date is in the future
 * @param date - The date as a Date object
 * @returns Returns true if the date is in the future, otherwise false
 */
export function isFutureDate(date: Date): boolean {
    const currentDate = new Date();

    currentDate.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    return date > currentDate;
}

/**
 * Validates if a given date is in the past
 * @param date - The date as a Date object
 * @returns Returns true if the date is in the past, otherwise false
 */
export function isPastDate(date: Date): boolean {
    const currentDate = new Date();

    currentDate.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    return date < currentDate;
}

/**
 * Validates if a given date is at least 18 years ago
 * @param date - The date as a Date object
 * @returns Returns true if the person is 18 or older, otherwise false
 */
export function isAtLeast18YearsOld(date: Date): boolean {
    const currentDate = new Date();
    const date18YearsAgo = new Date();

    date18YearsAgo.setFullYear(currentDate.getFullYear() - 18);

    return date <= date18YearsAgo;
}


