import { useState } from 'react';
import { Network } from '@/network';
import './index.less';

type ImportMethod = 'manual' | 'excel' | 'screenshot';
type AccordionKey = 'basic' | 'traffic' | 'interaction' | 'commerce' | null;

interface LiveData {
  title: string;
  startTime: string;
  endTime: string;
  totalViews: number;
  peakOnline: number;
  avgOnline: number;
  newFollowers: number;
  totalComments: number;
  totalLikes: number;
  shareCount: number;
  totalGifts: number;
  productClicks: number;
  productExposures: number;
  ordersCount: number;
  gmv: number;
}

const defaultFormData: LiveData = {
  title: '',
  startTime: '',
  endTime: '',
  totalViews: 0,
  peakOnline: 0,
  avgOnline: 0,
  newFollowers: 0,
  totalComments: 0,
  totalLikes: 0,
  shareCount: 0,
  totalGifts: 0,
  productClicks: 0,
  productExposures: 0,
  ordersCount: 0,
  gmv: 0,
};

const LiveDataImportPage = () => {
  const [method, setMethod] = useState<ImportMethod>('manual');
  const [formData, setFormData] = useState<LiveData>({ ...defaultFormData });
  const [expanded, setExpanded] = useState<AccordionKey>('basic');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const toggleAccordion = (key: AccordionKey) => {
    setExpanded(expanded === key ? null : key);
  };

  const calculateDuration = () => {
    if (!formData.startTime || !formData.endTime) return 0;
    const start = new Date(formData.startTime).getTime();
    const end = new Date(formData.endTime).getTime();
    return Math.round((end - start) / 1000);
  };

  // 截图识别
  const handleScreenshotUpload = async () => {
    try {
      const res = await chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      });

      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        const tempPath = res.tempFilePaths[0];
        setIsAnalyzing(true);
        showLoading({ title: '识别中...' });

        // 上传图片到存储
        const uploadRes = await Network.uploadFile({
          url: '/api/upload',
          filePath: tempPath,
          name: 'file',
        });

        const imageUrl = (uploadRes as any).data?.data?.url || (uploadRes as any).data?.url;
        if (!imageUrl) {
          throw new Error('图片上传失败');
        }

        setScreenshotUrl(imageUrl);

        // 调用图片分析接口
        const analysisRes = await Network.request({
          url: '/api/image-analysis',
          method: 'POST',
          data: { imageUrl },
        });

        if (analysisRes.data?.code === 200) {
          // 解析分析结果并填充表单
          parseAnalysisResult(analysisRes.data.data.analysis);
          showToast({ title: '识别成功', icon: 'success' });
        } else {
          throw new Error(analysisRes.data?.msg || '识别失败');
        }
      }
    } catch (error: any) {
      showToast({ title: error.message || '上传失败', icon: 'none' });
    } finally {
      setIsAnalyzing(false);
      hideLoading();
    }
  };

  // 解析分析结果并填充表单
  const parseAnalysisResult = (analysis: string) => {
    // 从分析文本中提取数字
    const extractNumber = (text: string, keywords: string[]): number => {
      for (const keyword of keywords) {
        const regex = new RegExp(`${keyword}[\\s:：]*(\\d+[\\.,]?\\d*)`, 'i');
        const match = text.match(regex);
        if (match) {
          return parseInt(match[1].replace(/,/g, '')) || 0;
        }
      }
      return 0;
    };

    setFormData(prev => ({
      ...prev,
      totalViews: extractNumber(analysis, ['观看人数', '观看', '总观看', 'view']),
      peakOnline: extractNumber(analysis, ['最高在线', '峰值', 'peak', '最高']),
      avgOnline: extractNumber(analysis, ['平均在线', '平均', 'average']),
      newFollowers: extractNumber(analysis, ['新增粉丝', '涨粉', '关注', 'follower']),
      totalComments: extractNumber(analysis, ['评论', 'comment', '弹幕']),
      totalLikes: extractNumber(analysis, ['点赞', '赞', 'like']),
      shareCount: extractNumber(analysis, ['分享', 'share']),
      ordersCount: extractNumber(analysis, ['订单', '成交量', 'order']),
      gmv: extractNumber(analysis, ['GMV', '成交额', '金额', '成交', '销售额']),
    }));
  };

  // Excel 上传
  const handleExcelUpload = async () => {
    try {
      // 在实际小程序环境中，这里需要调用文件选择 API
      // 这里演示接口调用逻辑
      showToast({ title: '请选择 Excel 文件', icon: 'none' });
      // 实际实现时，上传后设置 excelFile 状态
    } catch (error: any) {
      showToast({ title: error.message || '上传失败', icon: 'none' });
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!formData.title) {
      showToast({ title: '请输入直播标题', icon: 'none' });
      return;
    }

    const duration = calculateDuration();
    if (duration <= 0 && method === 'manual') {
      showToast({ title: '请设置正确的直播时间', icon: 'none' });
      return;
    }

    showLoading({ title: '保存中...' });

    try {
      const submitData = {
        ...formData,
        durationSeconds: duration || 3600, // 默认1小时
      };

      console.log('Submit data:', submitData);

      const response = await Network.request({
        url: '/api/live-data/import',
        method: 'POST',
        data: submitData,
      });

      console.log('Response:', response);

      if (response.data?.success) {
        showToast({ title: '导入成功', icon: 'success' });
        setTimeout(() => navigateBack(), 1500);
      } else {
        throw new Error(response.data?.message || '导入失败');
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      showToast({ title: error.message || '导入失败', icon: 'none' });
    } finally {
      hideLoading();
    }
  };

  const methodTabs: { key: ImportMethod; label: string; icon: React.ReactNode; desc: string }[] = [
  ];

  const InputField = ({ 
    label, 
    value, 
    onChange, 
    type = 'number',
    placeholder = '',
    unit = '' 
  }: { 
    label: string; 
    value: number | string; 
    onChange: (val: string) => void;
    type?: 'text' | 'number';
    placeholder?: string;
    unit?: string;
  }) => (
    <View className="input-field">
      <Text className="input-label">{label}</Text>
      <View className="input-wrapper">
        <Input
          className="input"
          type={type}
          placeholder={placeholder}
          value={String(value || '')}
          onInput={(e) => onChange(e.detail.value)}
        />
        {unit && <Text className="input-unit">{unit}</Text>}
      </View>
    </View>
  );

  const AccordionItem = ({ 
    title, 
    icon, 
    id, 
    children 
  }: { 
    title: string; 
    icon: React.ReactNode; 
    id: AccordionKey; 
    children: React.ReactNode 
  }) => (
    <View className={`accordion-item ${expanded === id ? 'expanded' : ''}`}>
      <View className="accordion-header" onClick={() => toggleAccordion(id)}>
        <View className="accordion-title-group">
          <View className="accordion-icon">{icon}</View>
          <Text className="accordion-title">{title}</Text>
        </View>
        {expanded === id ? <Text>⌃</Text> : <Text>⌄</Text>}
      </View>
      {expanded === id && (
        <View className="accordion-content">
          {children}
        </View>
      )}
    </View>
  );

  return (
    <View className="live-import-page">
      {/* 页面头部 */}
      <View className="page-header">
        <Text className="page-title">导入直播数据</Text>
        <Text className="page-subtitle">选择适合的方式记录您的直播表现</Text>
      </View>

      <ScrollView className="content-container" scrollY>
        {/* 导入方式选择 */}
        <View className="method-tabs">
          {methodTabs.map((tab) => (
            <View 
              key={tab.key}
              className={`method-tab ${method === tab.key ? 'active' : ''}`}
              onClick={() => setMethod(tab.key)}
            >
              <View className={`method-icon ${method === tab.key ? 'active' : ''}`}>
                {tab.icon}
              </View>
              <Text className="method-label">{tab.label}</Text>
              <Text className="method-desc">{tab.desc}</Text>
            </View>
          ))}
        </View>

        {/* 手动填写 */}
        {method === 'manual' && (
          <View className="form-section">
            <AccordionItem title="基本信息" icon={<Text className="accordion-icon-text">1</Text>} id="basic">
              <InputField 
                label="直播标题" 
                value={formData.title} 
                onChange={(v) => setFormData(p => ({ ...p, title: v }))}
                type="text"
                placeholder="例如：双11大促直播专场"
              />
              <View className="input-row">
                <View className="input-field half">
                  <Text className="input-label">开始时间</Text>
                  <Input
                    className="input"
                    type="text"
                    placeholder="2024-01-01 20:00"
                    value={formData.startTime}
                    onInput={(e) => setFormData(p => ({ ...p, startTime: e.detail.value }))}
                  />
                </View>
                <View className="input-field half">
                  <Text className="input-label">结束时间</Text>
                  <Input
                    className="input"
                    type="text"
                    placeholder="2024-01-01 22:00"
                    value={formData.endTime}
                    onInput={(e) => setFormData(p => ({ ...p, endTime: e.detail.value }))}
                  />
                </View>
              </View>
            </AccordionItem>

            <AccordionItem title="流量数据" icon={<Text className="accordion-icon-text">2</Text>} id="traffic">
              <View className="input-grid">
                <InputField 
                  label="观看人数" 
                  value={formData.totalViews} 
                  onChange={(v) => setFormData(p => ({ ...p, totalViews: parseInt(v) || 0 }))}
                  unit="人"
                />
                <InputField 
                  label="最高在线" 
                  value={formData.peakOnline} 
                  onChange={(v) => setFormData(p => ({ ...p, peakOnline: parseInt(v) || 0 }))}
                  unit="人"
                />
                <InputField 
                  label="平均在线" 
                  value={formData.avgOnline} 
                  onChange={(v) => setFormData(p => ({ ...p, avgOnline: parseInt(v) || 0 }))}
                  unit="人"
                />
              </View>
            </AccordionItem>

            <AccordionItem title="互动数据" icon={<Text className="accordion-icon-text">3</Text>} id="interaction">
              <View className="input-grid">
                <InputField 
                  label="新增粉丝" 
                  value={formData.newFollowers} 
                  onChange={(v) => setFormData(p => ({ ...p, newFollowers: parseInt(v) || 0 }))}
                  unit="人"
                />
                <InputField 
                  label="评论数" 
                  value={formData.totalComments} 
                  onChange={(v) => setFormData(p => ({ ...p, totalComments: parseInt(v) || 0 }))}
                  unit="条"
                />
                <InputField 
                  label="点赞数" 
                  value={formData.totalLikes} 
                  onChange={(v) => setFormData(p => ({ ...p, totalLikes: parseInt(v) || 0 }))}
                  unit="次"
                />
                <InputField 
                  label="分享数" 
                  value={formData.shareCount} 
                  onChange={(v) => setFormData(p => ({ ...p, shareCount: parseInt(v) || 0 }))}
                  unit="次"
                />
              </View>
            </AccordionItem>

            <AccordionItem title="电商数据" icon={<Text className="accordion-icon-text">4</Text>} id="commerce">
              <View className="input-grid">
                <InputField 
                  label="成交金额 (GMV)" 
                  value={formData.gmv} 
                  onChange={(v) => setFormData(p => ({ ...p, gmv: parseFloat(v) || 0 }))}
                  unit="元"
                />
                <InputField 
                  label="订单数量" 
                  value={formData.ordersCount} 
                  onChange={(v) => setFormData(p => ({ ...p, ordersCount: parseInt(v) || 0 }))}
                  unit="单"
                />
                <InputField 
                  label="商品曝光" 
                  value={formData.productExposures} 
                  onChange={(v) => setFormData(p => ({ ...p, productExposures: parseInt(v) || 0 }))}
                  unit="次"
                />
                <InputField 
                  label="商品点击" 
                  value={formData.productClicks} 
                  onChange={(v) => setFormData(p => ({ ...p, productClicks: parseInt(v) || 0 }))}
                  unit="次"
                />
              </View>
            </AccordionItem>
          </View>
        )}

        {/* Excel 导入 */}
        {method === 'excel' && (
          <View className="upload-section">
            <View className="upload-card" onClick={handleExcelUpload}>
              <View className="upload-icon-large">
                <Text>📁</Text>
              </View>
              <Text className="upload-title">点击上传 Excel 文件</Text>
              <Text className="upload-desc">支持 .xlsx, .xls 格式</Text>
              <Text className="upload-hint">请确保表格包含：标题、时间、观看人数、成交金额等字段</Text>
            </View>
            
            <View className="template-section">
              <Text className="template-title">下载导入模板</Text>
              <View className="template-card">
                <Text>📁</Text>
                <View className="template-info">
                  <Text className="template-name">直播数据导入模板.xlsx</Text>
                  <Text className="template-size">12 KB</Text>
                </View>
                <View className="template-btn">
                  <Text className="template-btn-text">下载</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 截图识别 */}
        {method === 'screenshot' && (
          <View className="upload-section">
            {!screenshotUrl ? (
              <View className="upload-card" onClick={handleScreenshotUpload}>
                <View className="upload-icon-large">
                  <Text>C</Text>
                </View>
                <Text className="upload-title">点击上传截图</Text>
                <Text className="upload-desc">支持抖音直播复盘数据截图</Text>
                <Text className="upload-hint">系统将自动识别截图中的直播数据</Text>
              </View>
            ) : (
              <View className="screenshot-preview">
                <Image className="screenshot-image" src={screenshotUrl} mode="aspectFit" />
                <View className="screenshot-actions">
                  <View className="screenshot-btn secondary" onClick={() => { setScreenshotUrl(''); setFormData({ ...defaultFormData }); }}>
                    <Text>✕</Text>
                    <Text>重新上传</Text>
                  </View>
                  {isAnalyzing ? (
                    <View className="screenshot-btn analyzing">
                      <Text>识别中...</Text>
                    </View>
                  ) : (
                    <View className="screenshot-btn success">
                      <Text>✓</Text>
                      <Text>识别完成</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* 识别结果预览 */}
            {screenshotUrl && !isAnalyzing && (
              <View className="recognized-data">
                <Text className="section-title">识别结果</Text>
                <View className="data-preview">
                  <View className="preview-item">
                    <Text className="preview-label">观看人数</Text>
                    <Text className="preview-value">{formData.totalViews?.toLocaleString() || '-'}</Text>
                  </View>
                  <View className="preview-item">
                    <Text className="preview-label">最高在线</Text>
                    <Text className="preview-value">{formData.peakOnline?.toLocaleString() || '-'}</Text>
                  </View>
                  <View className="preview-item">
                    <Text className="preview-label">成交金额</Text>
                    <Text className="preview-value">{formData.gmv ? `¥${formData.gmv.toFixed(2)}` : '-'}</Text>
                  </View>
                  <View className="preview-item">
                    <Text className="preview-label">订单数量</Text>
                    <Text className="preview-value">{formData.ordersCount?.toLocaleString() || '-'}</Text>
                  </View>
                </View>
                <Text className="edit-hint">* 识别结果可能不准确，请核对后保存</Text>
              </View>
            )}
          </View>
        )}

        {/* 底部占位 */}
        <View style={{ height: '120px' }} />
      </ScrollView>

      {/* 底部操作栏 */}
      <View className="bottom-bar">
        <View className="btn-secondary" onClick={() => navigateBack()}>
          <Text>取消</Text>
        </View>
        <View className="btn-primary" onClick={handleSubmit}>
          <Text>💾</Text>
          <Text className="btn-primary-text">保存数据</Text>
        </View>
      </View>
    </View>
  );
};

export default LiveDataImportPage;
