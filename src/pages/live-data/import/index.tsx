import { useState } from 'react';
import { showToast, showLoading, hideLoading } from '@tarojs/taro';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import { Network } from '@/network';
import { Upload } from 'lucide-react-taro';
import './index.less';

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
  ordersCount: number;
  gmv: number;
}

const LiveDataImportPage = () => {
  const [formData, setFormData] = useState<LiveData>({
    title: '',
    startTime: '',
    endTime: '',
    totalViews: 0,
    peakOnline: 0,
    avgOnline: 0,
    newFollowers: 0,
    totalComments: 0,
    totalLikes: 0,
    ordersCount: 0,
    gmv: 0,
  });

  const calculateDuration = () => {
    if (!formData.startTime || !formData.endTime) return 0;
    const start = new Date(formData.startTime).getTime();
    const end = new Date(formData.endTime).getTime();
    return Math.round((end - start) / 1000);
  };

  // 添加商品
  // const addProduct = () => {
  //   if (!currentProduct.productName) {
  //     showToast({ title: '请输入商品名称', icon: 'none' });
  //     return;
  //   }
  //   setFormData(prev => ({
  //     ...prev,
  //     products: [...prev.products, currentProduct],
  //   }));
  //   setCurrentProduct({ productName: '', productPrice: 0, exposures: 0, clicks: 0, orders: 0, gmv: 0 });
  // };

  // 删除商品
  // const removeProduct = (index: number) => {
  //   setFormData(prev => ({
  //     ...prev,
  //     products: prev.products.filter((_, i) => i !== index),
  //   }));
  // };

  const handleSubmit = async () => {
    if (!formData.title) {
      showToast({ title: '请输入直播标题', icon: 'none' });
      return;
    }

    const duration = calculateDuration();
    if (duration <= 0) {
      showToast({ title: '时间设置不正确', icon: 'none' });
      return;
    }

    showLoading({ title: '导入中...' });

    try {
      const submitData = {
        ...formData,
        durationSeconds: duration,
        products: [],
        productClicks: 0,
        productExposures: 0,
        shareCount: 0,
        totalGifts: 0,
      };

      const response = await Network.request({
        url: '/api/live-data/import',
        method: 'POST',
        data: submitData,
      });

      if (response.data?.success) {
        showToast({ title: '导入成功', icon: 'success' });
        setFormData({
          title: '', startTime: '', endTime: '', totalViews: 0, peakOnline: 0,
          avgOnline: 0, newFollowers: 0, totalComments: 0, totalLikes: 0,
          ordersCount: 0, gmv: 0,
        });
      } else {
        throw new Error(response.data?.message || '导入失败');
      }
    } catch (error: any) {
      showToast({ title: error.message || '导入失败', icon: 'none' });
    } finally {
      hideLoading();
    }
  };

  return (
    <View className="live-import-page">
      <View className="header">
        <Text className="title">导入直播数据</Text>
      </View>
      <ScrollView className="form-container" scrollY>
        <View className="section">
          <Text className="section-title">基本信息</Text>
          <Input
            className="input"
            placeholder="直播标题"
            value={formData.title}
            onInput={(e) => setFormData(prev => ({ ...prev, title: e.detail.value }))}
          />
          <View className="form-row">
            <Input
              className="input half"
              value={formData.startTime}
              onInput={(e) => setFormData(prev => ({ ...prev, startTime: e.detail.value }))}
            />
            <Input
              className="input half"
              value={formData.endTime}
              onInput={(e) => setFormData(prev => ({ ...prev, endTime: e.detail.value }))}
            />
          </View>
        </View>

        <View className="section">
          <Text className="section-title">流量数据</Text>
          <View className="form-row">
            <Input
              className="input half"
              placeholder="观看人数"
              value={String(formData.totalViews || '')}
              onInput={(e) => setFormData(prev => ({ ...prev, totalViews: parseInt(e.detail.value) || 0 }))}
            />
            <Input
              className="input half"
              placeholder="最高在线"
              value={String(formData.peakOnline || '')}
              onInput={(e) => setFormData(prev => ({ ...prev, peakOnline: parseInt(e.detail.value) || 0 }))}
            />
          </View>
        </View>

        <View className="submit-btn" onClick={handleSubmit}>
          <Upload size={20} />
          <Text>导入数据</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default LiveDataImportPage;
