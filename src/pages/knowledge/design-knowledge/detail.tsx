import { View, Text, ScrollView, RichText } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useEffect, useState } from 'react';
import {
  PenTool,
  Share2,
  Star,
  Clock,
  Eye,
  ChevronLeft,
  Lightbulb,
  ThumbsUp,
} from 'lucide-react-taro';

// 模拟详情数据
const knowledgeDetail = {
  id: '1',
  title: '商用厨房布局设计原则',
  category: '厨房布局',
  difficulty: '进阶',
  author: '张工',
  authorTitle: '高级设计师',
  updateTime: '2024-01-18',
  viewCount: 234,
  likeCount: 56,
  tags: ['布局设计', '空间规划', '动线优化'],
  summary: '详细讲解商用厨房的功能分区、动线设计、空间利用率优化等核心原则，帮助设计师打造高效实用的商用厨房空间。',
  content: `
    <h3>一、商用厨房布局的重要性</h3>
    <p>商用厨房的布局设计直接影响餐厅的运营效率、食品安全和员工工作体验。一个合理的厨房布局可以：</p>
    <ul>
      <li>提高工作效率，缩短菜品出品时间</li>
      <li>降低员工劳动强度，减少不必要的走动</li>
      <li>确保食品安全，避免交叉污染</li>
      <li>优化空间利用，降低装修成本</li>
    </ul>
    
    <h3>二、功能分区原则</h3>
    <p>商用厨房应按照"生进熟出"的单向流程进行功能分区：</p>
    <ol>
      <li><strong>原料接收区</strong>：靠近后门，便于原料卸货和验收</li>
      <li><strong>储藏区</strong>：包括干货库、冷藏库、冷冻库</li>
      <li><strong>粗加工区</strong>：进行原料的初步处理</li>
      <li><strong>精加工区</strong>：切配、腌制等精细加工</li>
      <li><strong>烹饪区</strong>：炒、蒸、烤、炸等热加工</li>
      <li><strong>备餐区</strong>：菜品装盘、摆盘</li>
      <li><strong>出餐区</strong>：与餐厅连接的传菜区</li>
      <li><strong>洗涤区</strong>：餐具清洗、消毒</li>
    </ol>
    
    <h3>三、动线设计要点</h3>
    <p><strong>核心原则：</strong>避免动线交叉，减少人员碰撞。</p>
    <ul>
      <li>生食与熟食通道分开</li>
      <li>人员通道与物流通道分开</li>
      <li>清洁区与污染区严格分离</li>
      <li>常用设备放置在操作便捷位置</li>
    </ul>
    
    <h3>四、空间利用率优化</h3>
    <p>在有限空间内实现功能最大化：</p>
    <ul>
      <li>合理利用立体空间，设置吊柜、置物架</li>
      <li>选用多功能组合设备</li>
      <li>预留足够的操作空间（通道宽度≥80cm）</li>
      <li>考虑设备散热和维修空间</li>
    </ul>
    
    <h3>五、常见布局类型</h3>
    <ol>
      <li><strong>直线型布局</strong>：适合狭长空间，流程清晰</li>
      <li><strong>L型布局</strong>：适合中等面积厨房</li>
      <li><strong>U型布局</strong>：适合大型厨房，功能分区完善</li>
      <li><strong>岛型布局</strong>：适合高端餐厅，视觉效果好</li>
    </ol>
    
    <h3>六、案例分析</h3>
    <p>以一家200㎡的中餐厅为例，厨房面积约60㎡：</p>
    <ul>
      <li>储藏区：12㎡（含冷藏库）</li>
      <li>粗加工区：8㎡</li>
      <li>精加工区：10㎡</li>
      <li>烹饪区：18㎡</li>
      <li>备餐出餐区：6㎡</li>
      <li>洗涤区：6㎡</li>
    </ul>
  `,
};

const DesignKnowledgeDetailPage = () => {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    // 实际项目中这里会根据 id 获取详情数据
    console.log('Knowledge ID:', router.params.id);
  }, [router.params.id]);

  const handleBack = () => {
    Taro.navigateBack();
  };

  const handleShare = () => {
    Taro.showToast({ title: '分享功能开发中', icon: 'none' });
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    Taro.showToast({ title: isFavorite ? '已取消收藏' : '已收藏', icon: 'success' });
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    Taro.showToast({ title: isLiked ? '已取消点赞' : '已点赞', icon: 'success' });
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
        <Text style={{ flex: 1, textAlign: 'center', fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>知识详情</Text>
        <View style={{ width: '24px' }} />
      </View>

      {/* 内容区域 */}
      <ScrollView scrollY style={{ marginTop: '48px', height: 'calc(100vh - 128px)' }}>
        <View style={{ padding: '20px' }}>
          {/* 标题区 */}
          <View style={{ marginBottom: '20px' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <PenTool size={24} color="#f59e0b" />
              <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>{knowledgeDetail.title}</Text>
            </View>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <View style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(245, 158, 11, 0.2)' }}>
                <Text style={{ fontSize: '12px', color: '#f59e0b' }}>{knowledgeDetail.category}</Text>
              </View>
              <View style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(168, 85, 247, 0.2)' }}>
                <Text style={{ fontSize: '12px', color: '#a855f7' }}>{knowledgeDetail.difficulty}</Text>
              </View>
            </View>
          </View>

          {/* 作者信息 */}
          <View style={{
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
          >
            <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <View style={{
                width: '40px',
                height: '40px',
                borderRadius: '20px',
                backgroundColor: '#27272a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              >
                <Text style={{ fontSize: '16px', fontWeight: '600', color: '#f59e0b' }}>{knowledgeDetail.author.charAt(0)}</Text>
              </View>
              <View>
                <Text style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>{knowledgeDetail.author}</Text>
                <Text style={{ fontSize: '12px', color: '#71717a' }}>{knowledgeDetail.authorTitle}</Text>
              </View>
            </View>
            <View style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Eye size={14} color="#71717a" />
                <Text style={{ fontSize: '12px', color: '#71717a' }}>{knowledgeDetail.viewCount}</Text>
              </View>
              <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ThumbsUp size={14} color="#71717a" />
                <Text style={{ fontSize: '12px', color: '#71717a' }}>{knowledgeDetail.likeCount}</Text>
              </View>
              <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} color="#52525b" />
                <Text style={{ fontSize: '12px', color: '#52525b' }}>{knowledgeDetail.updateTime}</Text>
              </View>
            </View>
          </View>

          {/* 标签 */}
          <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {knowledgeDetail.tags.map((tag, index) => (
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

          {/* 摘要 */}
          <View style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px'
          }}
          >
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Lightbulb size={16} color="#3b82f6" />
              <Text style={{ fontSize: '14px', fontWeight: '600', color: '#3b82f6' }}>内容摘要</Text>
            </View>
            <Text style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: '20px' }}>
              {knowledgeDetail.summary}
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
              nodes={knowledgeDetail.content}
              style={{ color: '#d4d4d8', fontSize: '14px', lineHeight: '24px' }}
            />
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
            backgroundColor: isLiked ? 'rgba(34, 197, 94, 0.2)' : '#27272a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={handleLike}
        >
          <ThumbsUp size={20} color={isLiked ? '#22c55e' : '#71717a'} />
        </View>
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
      </View>
    </View>
  );
};

export default DesignKnowledgeDetailPage;
