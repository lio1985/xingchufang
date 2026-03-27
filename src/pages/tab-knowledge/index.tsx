import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  Heart,
  Building2,
  MessageSquareText,
  GraduationCap,
  Search,
  Play,
} from 'lucide-react-taro';

const TabKnowledgePage = () => {
  const handleNav = (path: string) => {
    Taro.navigateTo({ url: path });
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '60px' }}>
      {/* 页面头部 */}
      <View style={{ padding: '48px 20px 24px', backgroundColor: '#111827' }}>
        <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', display: 'block' }}>知识库</Text>
        <Text style={{ fontSize: '14px', color: '#71717a', display: 'block', marginTop: '8px' }}>企业知识沉淀与复用</Text>
      </View>

      {/* 搜索栏 */}
      <View style={{ padding: '0 20px', marginTop: '-16px' }}>
        <View 
          style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center' }}
          onClick={() => Taro.showToast({ title: '搜索功能开发中', icon: 'none' })}
        >
          <Search size={18} color="#71717a" />
          <Text style={{ marginLeft: '8px', fontSize: '14px', color: '#71717a' }}>搜索知识库内容...</Text>
        </View>
      </View>

      {/* 知识分类 */}
      <View style={{ padding: '24px 20px 0' }}>
        <Text style={{ fontSize: '12px', color: '#52525b', display: 'block', marginBottom: '12px', fontWeight: '500' }}>知识分类</Text>
        <View style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <View
            style={{ width: 'calc(50% - 6px)', backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            onClick={() => handleNav('/pages/favorite-list/index')}
          >
            <View style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={20} color="#ef4444" />
            </View>
            <Text style={{ fontSize: '16px', fontWeight: '500', color: '#ffffff', display: 'block', marginTop: '8px' }}>个人收藏</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>我的收藏内容</Text>
          </View>

          <View
            style={{ width: 'calc(50% - 6px)', backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            onClick={() => handleNav('/pages/knowledge-share/index')}
          >
            <View style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} color="#a855f7" />
            </View>
            <Text style={{ fontSize: '16px', fontWeight: '500', color: '#ffffff', display: 'block', marginTop: '8px' }}>公司资料</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>企业知识库</Text>
          </View>

          <View
            style={{ width: 'calc(50% - 6px)', backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            onClick={() => handleNav('/pages/lexicon-system/index')}
          >
            <View style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquareText size={20} color="#f59e0b" />
            </View>
            <Text style={{ fontSize: '16px', fontWeight: '500', color: '#ffffff', display: 'block', marginTop: '8px' }}>个人语料</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>个人表达风格</Text>
          </View>

          <View
            style={{ width: 'calc(50% - 6px)', backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            onClick={() => handleNav('/pages/news/index')}
          >
            <View style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={20} color="#06b6d4" />
            </View>
            <Text style={{ fontSize: '16px', fontWeight: '500', color: '#ffffff', display: 'block', marginTop: '8px' }}>课程培训</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>学习与培训</Text>
          </View>
        </View>
      </View>

      {/* 最近学习 */}
      <View style={{ padding: '24px 20px 0' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <Text style={{ fontSize: '12px', color: '#52525b', fontWeight: '500' }}>最近学习</Text>
          <Text 
            style={{ fontSize: '12px', color: '#f59e0b' }}
            onClick={() => handleNav('/pages/news/index')}
          >
            查看全部
          </Text>
        </View>
        
        <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', overflow: 'hidden' }}>
          {/* 课程项1 */}
          <View
            style={{ padding: '16px', borderBottom: '1px solid #1e3a5f' }}
            onClick={() => handleNav('/pages/news/index')}
          >
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: '16px', color: '#ffffff', fontWeight: '500' }}>内容创作入门指南</Text>
              <View style={{ display: 'flex', alignItems: 'center' }}>
                <Play size={14} color="#f59e0b" />
                <Text style={{ fontSize: '12px', color: '#f59e0b', marginLeft: '4px' }}>继续</Text>
              </View>
            </View>
            <View style={{ height: '4px', backgroundColor: '#1e3a5f', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
              <View style={{ height: '100%', width: '60%', backgroundColor: '#f59e0b', borderRadius: '2px' }} />
            </View>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '8px' }}>已完成 7/12 课时 · 60%</Text>
          </View>

          {/* 课程项2 */}
          <View
            style={{ padding: '16px' }}
            onClick={() => handleNav('/pages/news/index')}
          >
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: '16px', color: '#ffffff', fontWeight: '500' }}>客户沟通技巧</Text>
              <View style={{ display: 'flex', alignItems: 'center' }}>
                <Play size={14} color="#f59e0b" />
                <Text style={{ fontSize: '12px', color: '#f59e0b', marginLeft: '4px' }}>继续</Text>
              </View>
            </View>
            <View style={{ height: '4px', backgroundColor: '#1e3a5f', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
              <View style={{ height: '100%', width: '30%', backgroundColor: '#f59e0b', borderRadius: '2px' }} />
            </View>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '8px' }}>已完成 2/8 课时 · 30%</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TabKnowledgePage;
