import { Address } from "../Address";


export interface OrganizationRequest {
    username: string;
    password: string;
    email: string;
    cnpj: string;
    companyName: string;
    tradingName: string;
    profilePictureBase64?: string;
    phone: string;
    address: Address;
}