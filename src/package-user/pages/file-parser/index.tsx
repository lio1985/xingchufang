import { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  ChevronLeft,
  FileText,
  Upload,
  Copy,
  CircleCheck,
  CircleAlert,
  File,
  Trash2,
} from 'lucide-react-taro';
import { Network } from '@/network';

interface ParsedResult {
  filename: string;
  size: number;
  content: string;
  mimeType: string;
}

export default function FileParserPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParsedResult | null>(null);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleChooseFile = async () => {
    setError('');
    setResult(null);

    try {
      const res = await Taro.chooseMessageFile({
        count: 1,
        type: 'file',
        extension: ['pdf', 'doc', 'docx', 'txt'],
      });

      if (res.tempFiles && res.tempFiles.length > 0) {
        const file = res.tempFiles[0];
        await uploadAndParse(file.path, file.name, file.size);
      }
    } catch (err: any) {
      if (!err.errMsg?.includes('cancel')) {
        console.error('选择文件失败:', err);
        setError('选择文件失败，请重试');
      }
    }
  };

  const uploadAndParse = async (filePath: string, fileName: string, _fileSize: number) => {
    setLoading(true);
    setError('');

    try {
      console.log('[FileParser] 开始上传文件:', fileName);

      const uploadRes = await Network.uploadFile({
        url: '/api/file-parser/parse',
        filePath: filePath,
        name: 'file',
      });

      console.log('[FileParser] 上传响应:', uploadRes);

      if (uploadRes.statusCode === 200) {
        const data = typeof uploadRes.data === 'string' ? JSON.parse(uploadRes.data) : uploadRes.data;
        
        if (data.code === 200) {
          setResult(data.data);
          Taro.showToast({ title: '解析成功', icon: 'success' });
        } else {
          setError(data.msg || '解析失败');
        }
      } else {
        setError('服务器响应异常');
      }
    } catch (err: any) {
      console.error('[FileParser] 解析失败:', err);
      setError(err.message || '文件解析失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.content) return;

    try {
      await Taro.setClipboardData({
        data: result.content,
      });
      setCopied(true);
      Taro.showToast({ title: '已复制', icon: 'success' });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleClear = () => {
    setResult(null);
    setError('');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '#ef4444';
    if (mimeType.includes('word') || mimeType.includes('document')) return '#3b82f6';
    return '#64748b';
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a' }}>
      {/* 顶部导航 */}
      <View style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '56px',
        backgroundColor: '#111827',
        borderBottomWidth: 1,
        borderBottomColor: '#1e3a5f',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 16,
        paddingRight: 16,
        zIndex: 100,
      }}
      >
        <View
          onClick={() => Taro.navigateBack()}
          style={{ padding: 8, marginLeft: -8 }}
        >
          <ChevronLeft size={24} color="#f1f5f9" />
        </View>
        <Text style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: '#f1f5f9' }}>
          文件解析
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* 主内容区 */}
      <ScrollView
        scrollY
        style={{ marginTop: 56, padding: 16, paddingBottom: 100 }}
      >
        {/* 说明卡片 */}
        <View style={{
          backgroundColor: '#111827',
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#1e3a5f',
        }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            >
              <FileText size={20} color="#38bdf8" />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={{ color: '#f1f5f9', fontSize: 16, fontWeight: '600' }}>
                支持的文件格式
              </Text>
              <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
                PDF、Word (.doc/.docx)、TXT 文本文件
              </Text>
            </View>
          </View>
          <Text style={{ color: '#94a3b8', fontSize: 13, lineHeight: 20 }}>
            上传文件后，系统将自动提取文本内容，方便您进行后续处理。文件大小限制为 10MB。
          </Text>
        </View>

        {/* 上传按钮 */}
        <View
          onClick={handleChooseFile}
          style={{
            backgroundColor: loading ? '#1e3a5f' : '#1e40af',
            borderRadius: 16,
            padding: 24,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            borderWidth: 2,
            borderColor: loading ? '#334155' : '#3b82f6',
            borderStyle: 'dashed',
          }}
        >
          {loading ? (
            <>
              <Text style={{ color: '#38bdf8', fontSize: 16 }}>解析中...</Text>
              <Text style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>请稍候</Text>
            </>
          ) : (
            <>
              <Upload size={32} color="#38bdf8" />
              <Text style={{ color: '#f1f5f9', fontSize: 16, marginTop: 12, fontWeight: '500' }}>
                点击选择文件
              </Text>
              <Text style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>
                支持从聊天记录或本地选择文件
              </Text>
            </>
          )}
        </View>

        {/* 错误提示 */}
        {error && (
          <View style={{
            backgroundColor: 'rgba(248, 113, 113, 0.15)',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
          }}
          >
            <CircleAlert size={20} color="#f87171" />
            <Text style={{ color: '#f87171', fontSize: 14, marginLeft: 12, flex: 1 }}>
              {error}
            </Text>
          </View>
        )}

        {/* 解析结果 */}
        {result && (
          <View style={{
            backgroundColor: '#111827',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#1e3a5f',
            overflow: 'hidden',
          }}
          >
            {/* 文件信息 */}
            <View style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#1e3a5f',
              flexDirection: 'row',
              alignItems: 'center',
            }}
            >
              <View style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: `rgba(59, 130, 246, 0.15)`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              >
                <File size={22} color={getFileIcon(result.mimeType)} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: '#f1f5f9', fontSize: 15, fontWeight: '500' }} numberOfLines={1}>
                  {result.filename}
                </Text>
                <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
                  {formatFileSize(result.size)} · {result.content.length} 字符
                </Text>
              </View>
              <CircleCheck size={20} color="#4ade80" />
            </View>

            {/* 操作栏 */}
            <View style={{
              flexDirection: 'row',
              padding: 12,
              gap: 8,
              borderBottomWidth: 1,
              borderBottomColor: '#1e3a5f',
            }}
            >
              <View
                onClick={handleCopy}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  borderRadius: 8,
                  paddingTop:  10,
                }}
              >
                {copied ? (
                  <>
                    <CircleCheck size={16} color="#4ade80" />
                    <Text style={{ color: '#4ade80', fontSize: 13, marginLeft: 6 }}>已复制</Text>
                  </>
                ) : (
                  <>
                    <Copy size={16} color="#38bdf8" />
                    <Text style={{ color: '#38bdf8', fontSize: 13, marginLeft: 6 }}>复制内容</Text>
                  </>
                )}
              </View>
              <View
                onClick={handleClear}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(248, 113, 113, 0.15)',
                  borderRadius: 8,
                  paddingTop:  10,
                }}
              >
                <Trash2 size={16} color="#f87171" />
                <Text style={{ color: '#f87171', fontSize: 13, marginLeft: 6 }}>清空</Text>
              </View>
            </View>

            {/* 内容展示 */}
            <View style={{ padding: 16 }}>
              <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>
                解析内容：
              </Text>
              <ScrollView
                scrollY
                style={{
                  maxHeight: 400,
                  backgroundColor: '#0a0f1a',
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <Text style={{ color: '#e2e8f0', fontSize: 14, lineHeight: 22 }}>
                  {result.content}
                </Text>
              </ScrollView>
            </View>
          </View>
        )}

        {/* 使用说明 */}
        <View style={{ marginTop: 24, padding: 16 }}>
          <Text style={{ color: '#64748b', fontSize: 12, textAlign: 'center' }}>
            上传的文件仅用于内容提取，不会被存储
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
