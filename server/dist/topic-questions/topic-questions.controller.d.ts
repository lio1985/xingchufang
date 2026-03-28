export declare class TopicQuestionsController {
    getTopicQuestions(query: {
        platforms?: string;
        questionType?: string;
    }): Promise<{
        code: number;
        msg: string;
        data: never[];
    }>;
}
