/**
 * 数据脱敏工具类
 * 用于对敏感数据进行脱敏处理
 */
export class DataMaskUtil {
  /**
   * 手机号脱敏
   * 将中间4位替换为****
   * @param phone 手机号
   * @returns 脱敏后的手机号
   * @example
   * maskPhone('13812345678') => '138****5678'
   */
  static maskPhone(phone: string): string {
    if (!phone || phone.length < 7) {
      return phone;
    }
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }

  /**
   * 姓名脱敏
   * 保留第一个字符，其余替换为*
   * @param name 姓名
   * @returns 脱敏后的姓名
   * @example
   * maskName('张三') => '张*'
   * maskName('欧阳锋') => '欧**'
   */
  static maskName(name: string): string {
    if (!name || name.length < 2) {
      return name;
    }
    return name.charAt(0) + '*'.repeat(name.length - 1);
  }

  /**
   * 身份证号脱敏
   * 保留前4位和后4位，中间替换为****
   * @param idCard 身份证号
   * @returns 脱敏后的身份证号
   * @example
   * maskIdCard('110101199001011234') => '1101********1234'
   */
  static maskIdCard(idCard: string): string {
    if (!idCard || idCard.length < 8) {
      return idCard;
    }
    const start = idCard.slice(0, 4);
    const end = idCard.slice(-4);
    const middleLength = idCard.length - 8;
    return start + '*'.repeat(middleLength) + end;
  }

  /**
   * 银行卡号脱敏
   * 保留前4位和后4位，中间替换为****
   * @param bankCard 银行卡号
   * @returns 脱敏后的银行卡号
   * @example
   * maskBankCard('6222021234567890123') => '6222********0123'
   */
  static maskBankCard(bankCard: string): string {
    if (!bankCard || bankCard.length < 8) {
      return bankCard;
    }
    const start = bankCard.slice(0, 4);
    const end = bankCard.slice(-4);
    const middleLength = bankCard.length - 8;
    return start + '*'.repeat(middleLength) + end;
  }

  /**
   * 邮箱脱敏
   * 保留第一个字符和@后的域名，中间替换为****
   * @param email 邮箱地址
   * @returns 脱敏后的邮箱
   * @example
   * maskEmail('example@domain.com') => 'e****@domain.com'
   */
  static maskEmail(email: string): string {
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

  /**
   * 地址脱敏
   * 只保留省市信息，详细地址替换为****
   * @param address 地址
   * @param keepLength 保留的字符长度（从开头）
   * @returns 脱敏后的地址
   * @example
   * maskAddress('北京市朝阳区某某街道某某小区1号楼') => '北京市朝阳区***'
   */
  static maskAddress(address: string, keepLength: number = 6): string {
    if (!address || address.length <= keepLength) {
      return address;
    }
    return address.slice(0, keepLength) + '****';
  }

  /**
   * 微信号脱敏
   * 保留前2位和后2位，中间替换为****
   * @param wechat 微信号
   * @returns 脱敏后的微信号
   * @example
   * maskWechat('wxid_abc123xyz') => 'wx****yz'
   */
  static maskWechat(wechat: string): string {
    if (!wechat || wechat.length < 5) {
      return wechat;
    }
    const start = wechat.slice(0, 2);
    const end = wechat.slice(-2);
    const middleLength = wechat.length - 4;
    return start + '*'.repeat(middleLength) + end;
  }

  /**
   * 通用脱敏方法
   * @param value 需要脱敏的值
   * @param startKeep 开头保留的字符数
   * @param endKeep 结尾保留的字符数
   * @param maskChar 脱敏字符，默认为 '*'
   * @returns 脱敏后的值
   */
  static mask(
    value: string,
    startKeep: number = 2,
    endKeep: number = 2,
    maskChar: string = '*',
  ): string {
    if (!value) {
      return value;
    }
    if (value.length <= startKeep + endKeep) {
      // 如果值太短，只保留开头
      return value.slice(0, startKeep) + maskChar.repeat(Math.max(1, value.length - startKeep));
    }
    const start = value.slice(0, startKeep);
    const end = value.slice(-endKeep);
    const middleLength = value.length - startKeep - endKeep;
    return start + maskChar.repeat(middleLength) + end;
  }

  /**
   * 根据字段名自动选择脱敏方法
   * @param fieldName 字段名
   * @param value 字段值
   * @returns 脱敏后的值
   */
  static maskByFieldName(fieldName: string, value: string): string {
    if (!value) {
      return value;
    }

    const lowerFieldName = fieldName.toLowerCase();

    // 根据字段名匹配脱敏规则
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

    // 默认不脱敏
    return value;
  }
}
