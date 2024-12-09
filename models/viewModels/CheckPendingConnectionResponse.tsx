export interface CheckPendingConnectionResponse {
    "isPending": boolean;
    "isCurrentUserRequester": boolean
    "connectionRequestId": string
}