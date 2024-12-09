export interface VolunteerSubscribed {
    id: string;
    cpf: string;
    fullName: string;
    profilePictureBase64: string;
    checkIn: Date | null;
    checkOut: Date | null;
}

