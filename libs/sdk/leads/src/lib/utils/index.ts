import {LeadAnswers} from "../types";
import {questions} from "../data";

export const calculateQualification = (answers: LeadAnswers): boolean => {
    let disqualifyingAnswers = 0;

    Object.entries(answers).forEach(([questionID, answer]) => {
        const question = questions.find(q => q.id === parseInt(questionID));
        if (!question) return;

        if (Array.isArray(answer)) {
            answer.forEach(value => {
                const cleanValue = value.startsWith('other:') ? 'other' : value;
                const option = question.options?.find(opt => opt.value === cleanValue);
                if (option?.disqualifies) {
                    disqualifyingAnswers++;
                }
            });
        } else {
            const cleanValue = answer.startsWith('other:') ? 'other' : answer;
            const option = question.options?.find(opt => opt.value === cleanValue);
            if (option?.disqualifies) {
                disqualifyingAnswers++;
            }
        }
    });

    return disqualifyingAnswers < 3;
};

export const hashString = (str: string): string => {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
        hash = hash & 0xffffffff;
    }

    return (hash >>> 0).toString(16);
};
