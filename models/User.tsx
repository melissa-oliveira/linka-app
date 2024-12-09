import { UserType } from "@/enums/UserType";

export interface User {
    id?: string;
    email: string;
    password: string;
    username: string;
    type: UserType;
    imageExtension?: string;
    imageBytes?: String;
}