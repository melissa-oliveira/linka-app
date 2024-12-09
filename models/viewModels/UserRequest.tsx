import { UserType } from "@/enums/UserType";

export interface UserRequest {
    id: string;
    email: string;
    username: string;
    type: UserType;
}