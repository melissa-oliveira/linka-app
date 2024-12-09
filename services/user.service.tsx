import { ApiManager } from "./managers/ApiManager";

export function getUser(id: string) {
    console.log(`LINKA-LOG: getUser called with id: ${id}`);
    return ApiManager.get('/user/' + id);
}