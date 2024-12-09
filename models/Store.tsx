export interface Store {
    organizationId: string;
    organizationName: string;
    products: {
        id: string;
        name: string;
        description: string;
        cost: number;
        availableQuantity: number;
        imageBase64: string;
    }[];
}
