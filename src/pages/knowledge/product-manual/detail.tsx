import { View, Text, ScrollView, RichText } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useEffect, useState } from 'react';
import {
  FileText,
  Download,
  Share2,
  Star,
  Clock,
  Eye,
  ChevronLeft,
  CircleAlert,
} from 'lucide-react-taro';

// 模拟详情数据
const manualDetail = {
  id: '1',
  title: '商用燃气炒灶使用说明书',
  brand: '星厨',
  model: 'XC-ZC-1200',
  updateTime: '2024-01-15',
  downloadCount: 156,
  viewCount: 324,
  category: '灶具',
  tags: ['燃气灶', '商用', '安全操作'],
  content: `
    <h3>一、产品概述</h3>
    <p>XC-ZC-1200型商用燃气炒灶是我司专为餐饮行业设计的高性能烹饪设备，采用先进的燃烧技术和优质不锈钢材质，具有热效率高、操作简便、安全可靠等特点。</p>
    
    <h3>二、技术参数</h3>
    <ul>
      <li>额定功率：12kW</li>
      <li>燃气类型：天然气/液化气</li>
      <li>燃气压力：2.8kPa</li>
      <li>外形尺寸：1200×800×850mm</li>
      <li>重量：85kg</li>
    </ul>
    
    <h3>三、安全注意事项</h3>
    <p><strong>警告：</strong>使用前请务必仔细阅读本说明书，不正确的操作可能导致人身伤害或设备损坏。</p>
    <ul>
      <li>确保安装位置通风良好</li>
      <li>定期检查燃气管道连接是否牢固</li>
      <li>禁止在设备附近存放易燃物品</li>
      <li>使用完毕后务必关闭燃气阀门</li>
    </ul>
    
    <h3>四、操作步骤</h3>
    <ol>
      <li>打开燃气总阀门</li>
      <li>按下点火按钮，同时调节风门</li>
      <li>火焰稳定后即可开始烹饪</li>
      <li>使用完毕后先关闭燃气阀门，再关闭风机</li>
    </ol>
    
    <h3>五、日常维护</h3>
    <ul>
      <li>每日清洁灶台表面油污</li>
      <li>每周检查燃烧器是否堵塞</li>
      <li>每月检查燃气管道密封性</li>
      <li>每季度请专业人员全面检修</li>
    </ul>
  `,
};

const ProductManualDetailPage = () => {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // 实际项目中这里会根据 id 获取详情数据
    console.log('Manual ID:', router.params.id);
  }, [router.params.id]);

  const handleBack = () => {
    Taro.navigateBack();
  };

  const handleDownload = () => {
    Taro.showToast({ title: '开始下载PDF...', icon: 'success' });
  };

  const handleShare = () => {
    Taro.showToast({ title: '分享功能开发中', icon: 'none' });
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    Taro.showToast({ title: isFavorite ? '已取消收藏' : '已收藏', icon: 'success' });
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0a0b', paddingBottom: '80px' }}>
      {/* 导航栏 */}
      <View style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '48px',
        backgroundColor: '#141416',
        borderBottom: '1px solid #27272a',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        zIndex: 100
      }}
      >
        <View onClick={handleBack} style={{ display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={24} color="#ffffff" />
        </View>
        <Text style={{ flex: 1, textAlign: 'center', fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>说明书详情</Text>
        <View style={{ width: '24px' }} />
      </View>

      {/* 内容区域 */}
      <ScrollView scrollY style={{ marginTop: '48px', height: 'calc(100vh - 128px)' }}>
        <View style={{ padding: '20px' }}>
          {/* 标题区 */}
          <View style={{ marginBottom: '20px' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <FileText size={24} color="#f59e0b" />
              <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>{manualDetail.title}</Text>
            </View>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <View style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(245, 158, 11, 0.2)' }}>
                <Text style={{ fontSize: '12px', color: '#f59e0b' }}>{manualDetail.category}</Text>
              </View>
              <Text style={{ fontSize: '13px', color: '#71717a' }}>{manualDetail.brand} | {manualDetail.model}</Text>
            </View>
            <View style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Eye size={14} color="#71717a" />
                <Text style={{ fontSize: '12px', color: '#71717a' }}>{manualDetail.viewCount} 次浏览</Text>
              </View>
              <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Download size={14} color="#71717a" />
                <Text style={{ fontSize: '12px', color: '#71717a' }}>{manualDetail.downloadCount} 次下载</Text>
              </View>
              <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} color="#52525b" />
                <Text style={{ fontSize: '12px', color: '#52525b' }}>{manualDetail.updateTime}</Text>
              </View>
            </View>
          </View>

          {/* 标签 */}
          <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
            {manualDetail.tags.map((tag, index) => (
              <View key={index} style={{
                padding: '6px 12px',
                borderRadius: '16px',
                backgroundColor: '#27272a'
              }}
              >
                <Text style={{ fontSize: '12px', color: '#a1a1aa' }}>#{tag}</Text>
              </View>
            ))}
          </View>

          {/* 重要提示 */}
          <View style={{
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px'
          }}
          >
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <CircleAlert size={16} color="#f59e0b" />
              <Text style={{ fontSize: '14px', fontWeight: '600', color: '#f59e0b' }}>重要提示</Text>
            </View>
            <Text style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: '20px' }}>
              请在使用设备前仔细阅读本说明书，确保安全操作。如有疑问请联系技术支持。
            </Text>
          </View>

          {/* 正文内容 */}
          <View style={{
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '12px',
            padding: '20px'
          }}
          >
            <RichText
              nodes={manualDetail.content}
              style={{ color: '#d4d4d8', fontSize: '14px', lineHeight: '24px' }}
            />
          </View>

          {/* 文档信息 */}
          <View style={{
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '16px'
          }}
          >
            <Text style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>文档信息</Text>
            <View style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <View style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: '13px', color: '#71717a' }}>文件格式</Text>
                <Text style={{ fontSize: '13px', color: '#ffffff' }}>PDF</Text>
              </View>
              <View style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: '13px', color: '#71717a' }}>文件大小</Text>
                <Text style={{ fontSize: '13px', color: '#ffffff' }}>2.4 MB</Text>
              </View>
              <View style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: '13px', color: '#71717a' }}>版本</Text>
                <Text style={{ fontSize: '13px', color: '#ffffff' }}>V2.1</Text>
              </View>
              <View style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: '13px', color: '#71717a' }}>更新时间</Text>
                <Text style={{ fontSize: '13px', color: '#ffffff' }}>{manualDetail.updateTime}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 底部操作栏 */}
      <View style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#141416',
        borderTop: '1px solid #27272a',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}
      >
        <View
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: isFavorite ? 'rgba(245, 158, 11, 0.2)' : '#27272a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={handleFavorite}
        >
          <Star size={20} color={isFavorite ? '#f59e0b' : '#71717a'} />
        </View>
        <View
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: '#27272a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={handleShare}
        >
          <Share2 size={20} color="#71717a" />
        </View>
        <View
          style={{
            flex: 1,
            height: '44px',
            borderRadius: '12px',
            backgroundColor: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onClick={handleDownload}
        >
          <Download size={18} color="#0a0a0b" />
          <Text style={{ fontSize: '15px', fontWeight: '600', color: '#0a0a0b' }}>下载PDF</Text>
        </View>
      </View>
    </View>
  );
};

export default ProductManualDetailPage;
