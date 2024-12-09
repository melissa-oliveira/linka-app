import { Address } from "./Address";
import { User } from "./User";

export interface Organization {
    id?: string;
    username: string;
    email: string;
    cnpj: string;
    companyName: string;
    tradingName: string;
    phone: string;
    pixKey?: string;
    profilePictureBase64?: string;
    profilePictureExtension?: string;
    address: Address;
    user: User;
    about?:string,
    userId?: string,
    followersCount?:number;
}
