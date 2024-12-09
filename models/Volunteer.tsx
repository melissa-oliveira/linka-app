import { Address } from "./Address";
import { User } from "./User";

export interface Volunteer {
    id?: string;
    cpf: string;
    name: string;
    surname: string;
    fullname: string;
    dateOfBirth: string;
    points?: number;
    allTimePoints?: number;
    profilePictureBase64?: string;
    profilePictureExtension?: string;
    address: Address;
    user: User;
    userId?: string,
    username: string;
    connectionsCount?: number;
    email: string,
}