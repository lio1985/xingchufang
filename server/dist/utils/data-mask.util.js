"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataMaskUtil = void 0;
class DataMaskUtil {
    static maskPhone(phone) {
        if (!phone || phone.length < 7) {
            return phone;
        }
        return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    }
    static maskName(name) {
        if (!name || name.length < 2) {
            return name;
        }
        return name.charAt(0) + '*'.repeat(name.length - 1);
    }
    static maskIdCard(idCard) {
        if (!idCard || idCard.length < 8) {
            return idCard;
        }
        const start = idCard.slice(0, 4);
        const end = idCard.slice(-4);
        const middleLength = idCard.length - 8;
        return start + '*'.repeat(middleLength) + end;
    }
    static maskBankCard(bankCard) {
        if (!bankCard || bankCard.length < 8) {
            return bankCard;
        }
        const start = bankCard.slice(0, 4);
        const end = bankCard.slice(-4);
        const middleLength = bankCard.length - 8;
        return start + '*'.repeat(middleLength) + end;
    }
    static maskEmail(email) {
        if (!email || !email.includes('@')) {
            return email;
        }
        const [username, domain] = email.split('@');
        if (username.length <= 1) {
            return email;
        }
        const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 1);
        return `${maskedUsername}@${domain}`;
    }
    static maskAddress(address, keepLength = 6) {
        if (!address || address.length <= keepLength) {
            return address;
        }
        return address.slice(0, keepLength) + '****';
    }
    static maskWechat(wechat) {
        if (!wechat || wechat.length < 5) {
            return wechat;
        }
        const start = wechat.slice(0, 2);
        const end = wechat.slice(-2);
        const middleLength = wechat.length - 4;
        return start + '*'.repeat(middleLength) + end;
    }
    static mask(value, startKeep = 2, endKeep = 2, maskChar = '*') {
        if (!value) {
            return value;
        }
        if (value.length <= startKeep + endKeep) {
            return value.slice(0, startKeep) + maskChar.repeat(Math.max(1, value.length - startKeep));
        }
        const start = value.slice(0, startKeep);
        const end = value.slice(-endKeep);
        const middleLength = value.length - startKeep - endKeep;
        return start + maskChar.repeat(middleLength) + end;
    }
    static maskByFieldName(fieldName, value) {
        if (!value) {
            return value;
        }
        const lowerFieldName = fieldName.toLowerCase();
        if (lowerFieldName.includes('phone') || lowerFieldName.includes('mobile') || lowerFieldName.includes('tel')) {
            return this.maskPhone(value);
        }
        if (lowerFieldName.includes('name') || lowerFieldName.includes('姓名')) {
            return this.maskName(value);
        }
        if (lowerFieldName.includes('idcard') || lowerFieldName.includes('id_card') || lowerFieldName.includes('身份证')) {
            return this.maskIdCard(value);
        }
        if (lowerFieldName.includes('email') || lowerFieldName.includes('邮箱')) {
            return this.maskEmail(value);
        }
        if (lowerFieldName.includes('bank') || lowerFieldName.includes('银行卡')) {
            return this.maskBankCard(value);
        }
        if (lowerFieldName.includes('wechat') || lowerFieldName.includes('微信')) {
            return this.maskWechat(value);
        }
        if (lowerFieldName.includes('address') || lowerFieldName.includes('地址')) {
            return this.maskAddress(value);
        }
        return value;
    }
}
exports.DataMaskUtil = DataMaskUtil;
//# sourceMappingURL=data-mask.util.js.map