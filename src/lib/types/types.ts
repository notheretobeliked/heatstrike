export interface PersonResponse {
    given_name: string;
    family_name: string;
    email: string;
}


export interface ActionData {
    status: number;
    success: boolean;
    error?: {
        message: string;
    };
    data?: PersonResponse;
}