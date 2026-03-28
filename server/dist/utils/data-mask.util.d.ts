export declare class DataMaskUtil {
    static maskPhone(phone: string): string;
    static maskName(name: string): string;
    static maskIdCard(idCard: string): string;
    static maskBankCard(bankCard: string): string;
    static maskEmail(email: string): string;
    static maskAddress(address: string, keepLength?: number): string;
    static maskWechat(wechat: string): string;
    static mask(value: string, startKeep?: number, endKeep?: number, maskChar?: string): string;
    static maskByFieldName(fieldName: string, value: string): string;
}
