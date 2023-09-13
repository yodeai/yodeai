export type Question = {
    id: string;
    question_text: string;
    generated_answer: string;
    asked_on_whatsapp: boolean;
    whatsapp_message_id: string | null;
    whatsapp_phone_number: string | null;
};
