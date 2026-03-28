import { InputSourceConfig, InputSourcesResponse } from '@/types/input-sources.types';
export declare class InputSourcesController {
    private config;
    getInputSources(): Promise<InputSourcesResponse>;
    saveInputSources(body: InputSourceConfig): Promise<InputSourcesResponse>;
}
