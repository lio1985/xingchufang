import { BadRequestException } from '@nestjs/common';

/**
 * UUID 验证正则表达式
 * 匹配标准 UUID 格式：xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 验证字符串是否为有效的 UUID 格式
 * @param str 要验证的字符串
 * @returns 是否为有效的 UUID
 */
export function isValidUUID(str: string | undefined | null): boolean {
  if (!str || typeof str !== 'string') {
    return false;
  }
  return UUID_REGEX.test(str.trim());
}

/**
 * 解析可选的 UUID 参数
 * 用于管理员筛选参数的处理
 * 
 * 规则：
 * - undefined/null/空字符串：返回 undefined（不加筛选）
 * - 合法 UUID：返回该 UUID
 * - 非法字符串：抛出 400 错误
 * 
 * @param value 输入值
 * @param paramName 参数名称（用于错误提示）
 * @returns 解析后的 UUID 或 undefined
 * @throws BadRequestException 当传入非法字符串时
 */
export function parseOptionalUUID(
  value: string | undefined | null,
  paramName: string = 'userId'
): string | undefined {
  // 不传参数：不加筛选
  if (value === undefined || value === null || value.trim() === '') {
    return undefined;
  }

  const trimmed = value.trim();

  // 合法 UUID：正常筛选
  if (isValidUUID(trimmed)) {
    return trimmed;
  }

  // 非法字符串：返回 400
  throw new BadRequestException(
    `参数 ${paramName} 必须是有效的 UUID 格式， received: "${trimmed}"`
  );
}

/**
 * 验证必填的 UUID 参数
 * 
 * @param value 输入值
 * @param paramName 参数名称（用于错误提示）
 * @returns 验证后的 UUID
 * @throws BadRequestException 当传入非法值时
 */
export function parseRequiredUUID(
  value: string | undefined | null,
  paramName: string = 'userId'
): string {
  if (value === undefined || value === null || value.trim() === '') {
    throw new BadRequestException(`参数 ${paramName} 不能为空`);
  }

  const trimmed = value.trim();

  if (!isValidUUID(trimmed)) {
    throw new BadRequestException(
      `参数 ${paramName} 必须是有效的 UUID 格式， received: "${trimmed}"`
    );
  }

  return trimmed;
}
