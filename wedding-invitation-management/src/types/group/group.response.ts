export interface Group {
    _id: string;
    name: string;
    priorityLevel: number;
    createdAt?: string;
    updatedAt?: string;
}

// Response for create / get-by-id / update / delete
export interface GroupResponse {
    success: boolean;
    message?: string;
    data?: {
        group: Group;
    };
}

// Response for get-all
export interface GroupsResponse {
    success: boolean;
    message?: string;
    data?: {
        groups: Group[];
        count: number;
    };
}
