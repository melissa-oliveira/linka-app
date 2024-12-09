import { SearchResponse } from "@/models/viewModels/SearchResponse";
import { ApiManager } from "./managers/ApiManager";

export async function getSearch(searchTerm: string): Promise<SearchResponse[]> {
    console.log(`LINKA-LOG: getSearch called with searchTerm: ${searchTerm}`);
    const params = new URLSearchParams({ searchTerm });
    const response = await ApiManager.get(`/search/search?${params.toString()}`);
    return response.data as SearchResponse[];
}

