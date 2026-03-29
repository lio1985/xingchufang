import { View, Text, Image } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { ArrowLeft, Camera, User, Check, LogIn } from 'lucide-react-taro';
import { Network } from '@/network';
import { useAuthGuard } from '@/hooks/useAuthGuard';

// 全局环境变量声明（由 defineConstants 注入）
declare const PROJECT_DOMAIN: string;

export default function AvatarEditorPage() {
  // 登录状态检查
  const { isLoggedIn, loading: authLoading } = useAuthGuard({ requireLogin: false });
  
  const [userInfo, setUserInfo] = useState<{
    id?: string;
    nickname?: string;
    avatar?: string;
  } | null>(null);
  const [currentAvatar, setCurrentAvatar] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP;

  useLoad(() => {
    console.log('Avatar Editor page loaded.');
  });

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = () => {
    try {
      const user = Taro.getStorageSync('user');
      const token = Taro.getStorageSync('token');
      if (user && token) {
        setUserInfo(user);
        setCurrentAvatar(user.avatar || '');
      }
    } catch (e) {
      console.log('获取用户信息失败');
    }
  };

  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        setSelectedImage(tempFilePath);
        console.log('选择的图片路径:', tempFilePath);
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
        Taro.showToast({
          title: '选择图片失败',
          icon: 'none',
        });
      },
    });
  };

  const handleUploadAvatar = async () => {
    if (!selectedImage) {
      Taro.showToast({
        title: '请先选择图片',
        icon: 'none',
      });
      return;
    }

    setIsUploading(true);

    try {
      const token = Taro.getStorageSync('token');

      console.log('开始上传头像:', {
        url: '/api/user/upload-avatar',
        filePath: selectedImage,
        hasToken: !!token,
        isWeapp,
      });

      // H5 环境使用 fetch 手动上传（绕过 Coze SW 拦截）
      if (!isWeapp && selectedImage.startsWith('blob:')) {
        console.log('H5 环境，使用 fetch 手动上传');
        
        // 获取 blob 文件
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        const file = new File([blob], 'avatar.jpg', { type: blob.type || 'image/jpeg' });
        
        // 构建 FormData
        const formData = new FormData();
        formData.append('file', file);
        
        // 获取正确的 API URL
        const apiBaseUrl = typeof PROJECT_DOMAIN !== 'undefined' 
          ? PROJECT_DOMAIN 
          : window.location.origin;
        const uploadUrl = `${apiBaseUrl}/api/user/upload-avatar`;
        
        console.log('H5 上传 URL:', uploadUrl);
        
        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });
        
        const result = await uploadResponse.json();
        console.log('H5 上传响应:', result);
        
        if (result.code === 200 && result.data?.avatarUrl) {
          // 更新本地存储的用户信息
          const updatedUser = {
            ...userInfo,
            avatar: result.data.avatarUrl,
          };
          Taro.setStorageSync('user', updatedUser);

          setCurrentAvatar(result.data.avatarUrl);
          setSelectedImage('');

          Taro.showToast({
            title: '头像更新成功',
            icon: 'success',
          });

          // 延迟返回上一页
          setTimeout(() => {
            Taro.navigateBack();
          }, 1500);
        } else {
          throw new Error(result.msg || '上传失败');
        }
        
        setIsUploading(false);
        return;
      }

      // 小程序环境使用 Taro.uploadFile
      const res = await Network.uploadFile({
        url: '/api/user/upload-avatar',
        filePath: selectedImage,
        name: 'file',
      });

      console.log('上传响应:', res);

      if (res.statusCode === 200 && res.data) {
        const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;

        if (data.code === 200 && data.data?.avatarUrl) {
          // 更新本地存储的用户信息
          const updatedUser = {
            ...userInfo,
            avatar: data.data.avatarUrl,
          };
          Taro.setStorageSync('user', updatedUser);

          setCurrentAvatar(data.data.avatarUrl);
          setSelectedImage('');

          Taro.showToast({
            title: '头像更新成功',
            icon: 'success',
          });

          // 延迟返回上一页
          setTimeout(() => {
            Taro.navigateBack();
          }, 1500);
        } else {
          throw new Error(data.msg || '上传失败');
        }
      } else {
        // 检查 HTTP 状态码
        if (res.statusCode === 401) {
          throw new Error('登录已过期，请重新登录');
        } else if (res.statusCode === 400) {
          throw new Error('文件格式不支持或文件过大');
        } else if (res.statusCode === 500) {
          throw new Error('服务器错误，请稍后重试');
        } else {
          throw new Error(`上传失败 (${res.statusCode})`);
        }
      }
    } catch (error: any) {
      console.error('上传头像失败:', error);
      
      // 检查是否是认证错误
      if (error.message?.includes('401') || error.message?.includes('登录')) {
        Taro.showModal({
          title: '登录已过期',
          content: '请重新登录后再试',
          confirmText: '去登录',
          cancelText: '取消',
          success: (modalRes) => {
            if (modalRes.confirm) {
              Taro.navigateTo({ url: '/pages/login/index' });
            }
          },
        });
      } else {
        Taro.showToast({
          title: error.message || '上传失败',
          icon: 'none',
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleGoBack = () => {
    Taro.navigateBack();
  };

  // 未登录状态显示
  if (!authLoading && !isLoggedIn) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', padding: '20px' }}>
        {/* 导航栏 */}
        <View
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '48px 20px 16px',
            backgroundColor: '#111827',
            borderBottom: '1px solid #1e3a5f',
            marginBottom: '20px',
          }}
        >
          <View onClick={handleGoBack} style={{ display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={20} color="#38bdf8" />
          </View>
          <Text
            style={{ flex: 1, textAlign: 'center', fontSize: '18px', fontWeight: '600', color: '#ffffff' }}
          >
            修改头像
          </Text>
          <View style={{ width: '20px' }} />
        </View>
        
        <View style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          backgroundColor: '#111827',
          borderRadius: '16px',
          border: '1px solid #1e3a5f',
        }}
        >
          <LogIn size={48} color="#38bdf8" />
          <Text style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', marginTop: '20px', display: 'block' }}>
            需要登录
          </Text>
          <Text style={{ fontSize: '14px', color: '#71717a', marginTop: '8px', display: 'block', textAlign: 'center' }}>
            修改头像功能需要登录后才能使用
          </Text>
          <View
            style={{
              marginTop: '24px',
              padding: '12px 32px',
              backgroundColor: '#38bdf8',
              borderRadius: '12px',
            }}
            onClick={() => Taro.navigateTo({ url: '/pages/login/index' })}
          >
            <Text style={{ fontSize: '15px', fontWeight: '600', color: '#000' }}>去登录</Text>
          </View>
        </View>
      </View>
    );
  }

  // 加载中状态
  if (authLoading) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', padding: '20px' }}>
        <View
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '48px 20px 16px',
            backgroundColor: '#111827',
            borderBottom: '1px solid #1e3a5f',
          }}
        >
          <View onClick={handleGoBack} style={{ display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={20} color="#38bdf8" />
          </View>
          <Text
            style={{ flex: 1, textAlign: 'center', fontSize: '18px', fontWeight: '600', color: '#ffffff' }}
          >
            修改头像
          </Text>
          <View style={{ width: '20px' }} />
        </View>
        <View style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Text style={{ color: '#71717a' }}>加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a' }}>
      {/* 导航栏 */}
      <View
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          padding: '48px 20px 16px',
          backgroundColor: '#111827',
          borderBottom: '1px solid #1e3a5f',
          zIndex: 100,
        }}
      >
        <View onClick={handleGoBack} style={{ display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={20} color="#38bdf8" />
        </View>
        <Text
          style={{ flex: 1, textAlign: 'center', fontSize: '18px', fontWeight: '600', color: '#ffffff' }}
        >
          修改头像
        </Text>
        <View style={{ width: '20px' }} />
      </View>

      {/* 内容区域 */}
      <View style={{ paddingTop: '100px', padding: '100px 20px 20px' }}>
        {/* 当前头像预览 */}
        <View
          style={{
            backgroundColor: '#111827',
            border: '1px solid #1e3a5f',
            borderRadius: '16px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: '14px', color: '#71717a', marginBottom: '24px' }}>
            当前头像
          </Text>

          <View
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
            }}
          >
            {currentAvatar ? (
              <Image src={currentAvatar} style={{ width: '100%', height: '100%' }} mode="aspectFill" />
            ) : (
              <User size={48} color="#38bdf8" />
            )}
          </View>

          <Text
            style={{ fontSize: '16px', color: '#ffffff', marginTop: '16px', fontWeight: '500' }}
          >
            {userInfo?.nickname || '用户'}
          </Text>
        </View>

        {/* 选择新头像 */}
        <View
          style={{
            backgroundColor: '#111827',
            border: '1px solid #1e3a5f',
            borderRadius: '16px',
            padding: '20px',
            marginTop: '20px',
          }}
        >
          <Text
            style={{ fontSize: '16px', color: '#ffffff', fontWeight: '500', marginBottom: '16px' }}
          >
            选择新头像
          </Text>

          <View style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* 已选择的图片预览 */}
            {selectedImage ? (
              <View
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '2px solid #38bdf8',
                  position: 'relative',
                }}
              >
                <Image src={selectedImage} style={{ width: '100%', height: '100%' }} mode="aspectFill" />
                <View
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    backgroundColor: '#22c55e',
                    borderRadius: '50%',
                    padding: '2px',
                  }}
                >
                  <Check size={12} color="#ffffff" />
                </View>
              </View>
            ) : (
              <View
                onClick={handleChooseImage}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '12px',
                  border: '2px dashed #38bdf8',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(56, 189, 248, 0.05)',
                }}
              >
                <Camera size={24} color="#38bdf8" />
                <Text style={{ fontSize: '10px', color: '#38bdf8', marginTop: '4px' }}>点击选择</Text>
              </View>
            )}

            {/* 操作说明 */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: '14px', color: '#e4e4e7', marginBottom: '8px' }}>
                支持 JPG、PNG、GIF、WebP 格式
              </Text>
              <Text style={{ fontSize: '12px', color: '#71717a' }}>
                图片大小不超过 5MB
              </Text>
            </View>
          </View>
        </View>

        {/* 操作按钮 */}
        <View style={{ marginTop: '32px' }}>
          {/* 重新选择按钮 */}
          <View
            onClick={handleChooseImage}
            style={{
              backgroundColor: '#111827',
              border: '1px solid #1e3a5f',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
            }}
          >
            <Camera size={18} color="#38bdf8" />
            <Text style={{ fontSize: '14px', color: '#38bdf8', marginLeft: '8px' }}>
              {selectedImage ? '重新选择图片' : '选择图片'}
            </Text>
          </View>

          {/* 上传按钮 */}
          <View
            onClick={handleUploadAvatar}
            style={{
              backgroundColor: isUploading || !selectedImage ? 'rgba(56, 189, 248, 0.3)' : '#38bdf8',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isUploading || !selectedImage ? 0.6 : 1,
            }}
          >
            <Text style={{ fontSize: '14px', color: '#ffffff', fontWeight: '500' }}>
              {isUploading ? '上传中...' : '保存头像'}
            </Text>
          </View>
        </View>

        {/* H5 端提示 */}
        {!isWeapp && (
          <View
            style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px',
            }}
          >
            <Text style={{ fontSize: '12px', color: '#f59e0b' }}>
              提示：当前为 H5 环境，头像上传功能已适配。如在微信小程序中使用，体验更佳。
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
