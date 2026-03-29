import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAuth } from '@/lib/auth';
import { S3Storage } from 'coze-coding-dev-sdk';

// 初始化对象存储
const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: '',
  secretKey: '',
  bucketName: process.env.COZE_BUCKET_NAME,
  region: 'cn-beijing',
});

// 获取用户收藏列表
export async function GET(request: NextRequest) {
  console.log('[Favorites API] GET request received');
  const auth = requireAuth(request);
  console.log('[Favorites API] Auth result:', JSON.stringify(auth));
  
  if (!auth.authorized) {
    console.log('[Favorites API] Unauthorized, returning 401');
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const client = getSupabaseClient();
    
    // 如果没有用户ID，需要先查询
    let userId = auth.user?.id;
    console.log('[Favorites API] User ID from auth:', userId, 'Username:', auth.user?.username);
    
    if (!userId && auth.user?.username) {
      const { data: userData } = await client
        .from('admin_users')
        .select('id')
        .eq('username', auth.user.username)
        .single();
      userId = userData?.id;
      console.log('[Favorites API] User ID from DB:', userId);
    }

    if (!userId) {
      console.log('[Favorites API] User not found');
      return NextResponse.json({ success: false, error: '用户不存在' }, { status: 400 });
    }

    // 获取收藏列表，关联商品信息
    const { data, error } = await client
      .from('favorites')
      .select(`
        id,
        created_at,
        product_id,
        products (
          id,
          name,
          brand,
          spec,
          params,
          price,
          supplier,
          level1_category,
          level2_category,
          product_code,
          origin,
          warranty,
          selling_points,
          remarks
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`获取收藏列表失败: ${error.message}`);

    // 获取每个商品的主图
    const favoritesWithImages = await Promise.all(
      (data || []).map(async (fav: any) => {
        const product = fav.products;
        if (!product) return { ...fav, primary_image_url: null };

        // 查询主图
        const { data: images } = await client
          .from('product_images')
          .select('image_key')
          .eq('product_id', product.id)
          .eq('is_primary', true)
          .limit(1);

        let primaryImageUrl = null;
        if (images && images.length > 0) {
          try {
            primaryImageUrl = await storage.generatePresignedUrl({
              key: images[0].image_key,
              expireTime: 86400,
            });
          } catch (e) {
            console.warn('生成图片URL失败:', e);
          }
        }

        return {
          ...fav,
          primary_image_url: primaryImageUrl,
        };
      })
    );

    return NextResponse.json({ 
      success: true, 
      data: favoritesWithImages,
      count: favoritesWithImages.length,
    });
  } catch (error: any) {
    console.error('获取收藏列表失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 添加收藏
export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const { productId } = await request.json();
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: '缺少商品ID' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();
    
    // 获取用户ID
    let userId = auth.user?.id;
    if (!userId && auth.user?.username) {
      const { data: userData } = await client
        .from('admin_users')
        .select('id')
        .eq('username', auth.user.username)
        .single();
      userId = userData?.id;
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: '用户不存在' }, { status: 400 });
    }

    // 检查商品是否存在
    const { data: product, error: productError } = await client
      .from('products')
      .select('id')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { success: false, error: '商品不存在' },
        { status: 404 }
      );
    }

    // 添加收藏（如果已存在会触发唯一约束错误，忽略）
    const { data, error } = await client
      .from('favorites')
      .insert({
        user_id: userId,
        product_id: productId,
      })
      .select()
      .single();

    if (error) {
      // 如果是唯一约束冲突，说明已收藏
      if (error.code === '23505') {
        return NextResponse.json({ 
          success: true, 
          message: '已收藏',
          alreadyExists: true,
        });
      }
      throw new Error(`添加收藏失败: ${error.message}`);
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: '收藏成功',
    });
  } catch (error: any) {
    console.error('添加收藏失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 取消收藏
export async function DELETE(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: '缺少商品ID' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();
    
    // 获取用户ID
    let userId = auth.user?.id;
    if (!userId && auth.user?.username) {
      const { data: userData } = await client
        .from('admin_users')
        .select('id')
        .eq('username', auth.user.username)
        .single();
      userId = userData?.id;
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: '用户不存在' }, { status: 400 });
    }

    // 删除收藏
    const { error } = await client
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', parseInt(productId));

    if (error) throw new Error(`取消收藏失败: ${error.message}`);

    return NextResponse.json({ 
      success: true, 
      message: '已取消收藏',
    });
  } catch (error: any) {
    console.error('取消收藏失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
