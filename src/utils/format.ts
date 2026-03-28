/**
 * 公共格式化工具函数
 * 统一管理数据格式化逻辑
 */

/**
 * 格式化日期
 * @param dateStr 日期字符串
 * @returns 格式化后的日期（如：1月15日）
 */
export const formatDate = (dateStr: string | Date): string => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
};

/**
 * 格式化完整日期
 * @param dateStr 日期字符串
 * @returns 格式化后的日期（如：2025年1月15日）
 */
export const formatFullDate = (dateStr: string | Date): string => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
};

/**
 * 格式化时间
 * @param dateStr 日期字符串
 * @returns 格式化后的时间（如：14:30）
 */
export const formatTime = (dateStr: string | Date): string => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours}:${String(minutes).padStart(2, '0')}`;
};

/**
 * 格式化日期时间
 * @param dateStr 日期字符串
 * @returns 格式化后的日期时间（如：1月15日 14:30）
 */
export const formatDateTime = (dateStr: string | Date): string => {
  return `${formatDate(dateStr)} ${formatTime(dateStr)}`;
};

/**
 * 格式化完整日期时间
 * @param dateStr 日期字符串
 * @returns 格式化后的日期时间（如：2025-01-15 14:30:00）
 */
export const formatFullDateTime = (dateStr: string | Date): string => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * 格式化相对时间
 * @param dateStr 日期字符串
 * @returns 相对时间（如：刚刚、5分钟前、昨天、3天前）
 */
export const formatRelativeTime = (dateStr: string | Date): string => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) {
    return '刚刚';
  }
  if (minutes < 60) {
    return `${minutes}分钟前`;
  }
  if (hours < 24) {
    return `${hours}小时前`;
  }
  if (days === 1) {
    return '昨天';
  }
  if (days < 7) {
    return `${days}天前`;
  }
  return formatDate(date);
};

/**
 * 格式化数字
 * @param num 数字
 * @returns 格式化后的数字（如：1,234）
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('zh-CN');
};

/**
 * 格式化金额
 * @param amount 金额
 * @param decimals 小数位数
 * @returns 格式化后的金额（如：¥1,234.56）
 */
export const formatMoney = (amount: number, decimals: number = 2): string => {
  return `¥${amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小（如：1.5 MB）
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * 格式化手机号
 * @param phone 手机号
 * @returns 格式化后的手机号（如：138****8888）
 */
export const formatPhone = (phone: string): string => {
  if (!phone || phone.length !== 11) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(7)}`;
};

/**
 * 格式化百分比
 * @param value 数值
 * @param decimals 小数位数
 * @returns 格式化后的百分比（如：12.5%）
 */
export const formatPercent = (value: number, decimals: number = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * 格式化持续时间
 * @param seconds 秒数
 * @returns 格式化后的时间（如：1小时30分钟）
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}小时${minutes > 0 ? `${minutes}分钟` : ''}`;
  }
  if (minutes > 0) {
    return `${minutes}分钟${secs > 0 ? `${secs}秒` : ''}`;
  }
  return `${secs}秒`;
};

/**
 * 格式化录制时间（录音/视频）
 * @param seconds 秒数
 * @returns 格式化后的时间（如：01:30）
 */
export const formatRecordingTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * 截断文本
 * @param text 文本
 * @param maxLength 最大长度
 * @returns 截断后的文本（如：这是一段很长的文...）
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * 验证手机号
 * @param phone 手机号
 * @returns 是否有效
 */
export const isValidPhone = (phone: string): boolean => {
  return /^1[3-9]\d{9}$/.test(phone);
};

/**
 * 验证邮箱
 * @param email 邮箱
 * @returns 是否有效
 */
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * 验证身份证号
 * @param idCard 身份证号
 * @returns 是否有效
 */
export const isValidIdCard = (idCard: string): boolean => {
  return /^\d{17}[\dXx]$/.test(idCard);
};
