import { EventStatus } from "@/enums/EventStatus";
import { Address } from "./Address";
import { EventJob } from "./EventJob";
import { Organization } from "./Organization";

export interface Event {
  id?: string;
  organizationId: string;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  imageBase64?: string | null;
  status: EventStatus;
  address: Address;
  eventJobs: EventJob[];
}
