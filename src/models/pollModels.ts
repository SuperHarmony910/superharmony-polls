export interface pollQuestion {
    id: number,
    name: string,
    description: string,
    options: string[]
}

export interface pollSubmission {
    choice: number,
    who?: {
        discord_id?: number,
        username: string | undefined,
        discriminator?: number
    }
}