import { EventStatus } from "@/enums/EventStatus";

export interface EventList {
  id: string;
  eventTitle: string;
  eventStartDateTime: string;
  eventEndDateTime: string;
  eventJobs: string;
  eventFilledJobs: string;
  eventImageUrl?: string | null;
  eventStatus: EventStatus;
  latitude?: string;
  longitude?: string;
}
