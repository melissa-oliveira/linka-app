import { EventStatus } from "@/enums/EventStatus";
import { EventJobCreate } from "./EventJobCreate";
import { Address } from "../Address";

export interface EventCreate {
    id?: string,
    title: string;
    description: string;
    startDateTime: string;
    endDateTime: string;
    imageBase64: string | null;
    status: EventStatus;
    address: Address;
    eventJobs: EventJobCreate[]
}
