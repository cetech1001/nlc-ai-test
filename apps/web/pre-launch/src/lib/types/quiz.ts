export interface Question {
    id: number;
    text: string;
    subtitle?: string;
    options?: QuestionOption[];
    multiSelect?: boolean;
    textOnly?: boolean;
    placeholder?: string;
}

export interface QuestionOption {
    text: string;
    value: string;
    disqualifies?: boolean;
    qualifies?: boolean;
    points?: number;
}

export type Answers = Record<number, string | string[]>;

export interface LeadInfo {
    name: string;
    email: string;
    phone: string;
}
