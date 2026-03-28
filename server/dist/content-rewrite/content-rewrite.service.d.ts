export declare class ContentRewriteService {
    rewriteContent(originalContent: string, prompt: string): Promise<string>;
    private simulateRewrite;
    private makeProfessional;
    private makeCasual;
    private makeHumorous;
    private makeConcise;
    private makeLonger;
    private makeDefault;
}
