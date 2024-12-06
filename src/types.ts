// Global types and interfaces are stored here.
export interface Margin {
    readonly left: number;
    readonly right: number;
    readonly top: number;
    readonly bottom: number;
}

export interface HappinessDataBase {
    country: string;
    ladderScore: number;
    GDP: number;
    social_support: number;
    healthy_life_expectency: number;
    freedom: number;
    generosity: number;
    corruption:	number;
}  