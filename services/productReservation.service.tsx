import { ProductReservation } from '@/models/ProductReservation';
import { ApiManager } from './managers/ApiManager';

export async function getProductReservationsByOrganization(): Promise<{ "reservations": ProductReservation[] }> {
    console.log('LINKA-LOG: getProductReservationsByOrganization called');
    const response = await ApiManager.get('/productreservation/organization');
    return response.data as { "reservations": ProductReservation[] };
}

export async function getProductReservationsByVolunteer(): Promise<{ "reservations": ProductReservation[] }> {
    console.log('LINKA-LOG: getProductReservationsByVolunteer called');
    const response = await ApiManager.get('/productreservation/volunteer');
    return response.data as { "reservations": ProductReservation[] };
}

export async function addProductReservation(reservation: { "id": string, "quantity": number }): Promise<void> {
    console.log('LINKA-LOG: addProductReservation called with reservation:', reservation);
    const response = await ApiManager.post('/productreservation', JSON.stringify(reservation));
}

export async function cancelProductReservation(id: string): Promise<void> {
    console.log(`LINKA-LOG: cancelProductReservation called with id: ${id}`);
    await ApiManager.post(`/productreservation/cancel/${id}`);
}

export async function withdrawProductReservation(id: string): Promise<void> {
    console.log(`LINKA-LOG: withdrawProductReservation called with id: ${id}`);
    await ApiManager.post(`/productreservation/withdraw/${id}`);
}
