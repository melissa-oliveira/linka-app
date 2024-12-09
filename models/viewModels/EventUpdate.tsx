import { Address } from "../Address";

export interface EventUpdate {
    title: string;
    description: string;
    imageBase64: string | null;
    address: Address;
}
