import { ConnectionRequestStatus } from "@/enums/ConnectionRequestStatus";

export interface ConnectionRequestList {
    "id": string;
    "requesterId": string;
    "targetId": string;
    "status": ConnectionRequestStatus
}

