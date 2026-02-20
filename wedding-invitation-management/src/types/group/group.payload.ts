export interface CreateGroupPayload {
    name: string;
    priorityLevel: number;
}

export interface UpdateGroupPayload {
    name?: string;
    priorityLevel?: number;
}
