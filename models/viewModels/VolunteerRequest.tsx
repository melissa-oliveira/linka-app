import { Address } from "../Address";

export interface VolunteerRequest {
  username: string;
  email: string;
  password: string;
  cpf: string;
  name: string;
  surname: string;
  profilePictureBase64?: string;
  address: Address;
  dathOfBirth: string;
}