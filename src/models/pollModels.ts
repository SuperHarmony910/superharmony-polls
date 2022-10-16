export interface pollQuestion {
    id: number,
    name: string,
    description: string,
    options: string[]
}

export interface pollSubmission {
    choice: number,
    discord?: {
        id: number,
        username: string,
        discriminator: number
    }
}