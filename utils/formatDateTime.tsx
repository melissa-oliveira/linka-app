/**
 * Formats a timestamp into a string representing the date in "DD/MM/YYYY" format.
 * @param timestamp - The timestamp string to format.
 * @returns A formatted date string in "DD/MM/YYYY" format.
 */
export function formatDate(timestamp: string): string {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};

/**
 * Formats a timestamp into a string representing the time in "HH:mm" format.
 * @param timestamp - The timestamp string to format.
 * @returns A formatted time string in "HH:mm" format.
 */
export function formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
};

/**
 * Formats a timestamp into a string representing both date and time in "DD/MM/YYYY HH:mm" format.
 * @param timestamp - The timestamp string to format.
 * @returns A formatted date and time string in "DD/MM/YYYY HH:mm" format.
 */
export function formatDateTime(timestamp: string): string {
    const date = formatDate(timestamp);
    const time = formatTime(timestamp);

    return `${date} ${time}`;
}

/**
 * Converts a date and time string in "DD/MM/YYYY HH:mm" format to a timestamp.
 * @param dateTime - The date and time string to convert.
 * @returns A timestamp representing the date and time.
 */
export function toTimestamp(dateTime: string): string {
    const [datePart, timePart] = dateTime.split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);

    const date = new Date(year, month - 1, day, hours, minutes);
    return (date.getTime()).toString();
}

/**
 * Converte um objeto Date para um timestamp.
 * @param date - O objeto Date a ser convertido.
 * @returns O timestamp em milissegundos.
 */
export function dateToTimestamp(date: Date): number {
    return date.getTime();
}

/**
 * Converte um objeto Date para um timestamp no formato ISO 8601.
 * @param date - O objeto Date a ser convertido.
 * @returns O timestamp em formato ISO 8601.
 */
export function dateToISOFormat(date: Date): string {
    return date.toISOString();
}

/**
 * Combina um objeto de data e um objeto de hora em uma string de data e hora no formato ISO 8601.
 * A função assume que ambos os objetos estão na mesma zona horária (America/Sao_Paulo).
 *
 * @param dateObj - Um objeto Date representando a data.
 * @param timeObj - Um objeto Date representando a hora.
 * @returns Uma string formatada no padrão ISO 8601 (YYYY-MM-DDTHH:mm:ss-03:00), 
 *          onde a data e a hora são extraídas dos objetos fornecidos.
 */
export function combineDateTimeString(dateObj: Date, timeObj: Date) {
    const datePart = dateObj.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const timePart = timeObj.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour12: false });

    const [day, month, year] = datePart.split('/');
    return `${year}-${month}-${day}T${timePart}-03:00`;
}

