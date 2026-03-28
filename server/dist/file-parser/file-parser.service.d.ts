export declare class FileParserService {
    parseFile(file: Express.Multer.File): Promise<string>;
    private parsePdf;
    private parseWord;
    private parseText;
    private cleanText;
}
