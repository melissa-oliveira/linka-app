import { Event } from "./Event";
import { VolunteerSubscribed } from "./viewModels/VolunteerSubscribed";

export interface EventJob {
    id: string;
    title: string;
    description: string;
    maxVolunteers: number;
    event: Event;
    volunteersCount: number;
    volunteersSubscribed: VolunteerSubscribed[]
}

