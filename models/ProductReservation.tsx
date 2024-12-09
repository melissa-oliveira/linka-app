export interface ProductReservation {
    id: string;
    withdrawn: boolean;
    cancelled: boolean;
    cost: number;
    volunteerId: string;
    volunteerFullName: string;
    productId: string;
    productName: string;
    redeemDate: string;
    dateCreated: string;
}
