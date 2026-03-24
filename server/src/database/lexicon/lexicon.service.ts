import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ASRClient, LLMClient, Config } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '../../storage/database/supabase-client';
import { UserService } from '../../user/user.service';
import {
  ShareLexiconRequest,
  SharedLexiconInfo,
  SharePermission,
  ShareRecord,
  CanAccessResult,
  ShareHistory,
} from '../../share/types';

@Injectable()
export class LexiconService {
  private client = getSupabaseClient();
  private asrClient: ASRClient;
  private llmClient: LLMClient;

  constructor(private readonly userService: UserService) {
    const config = new Config();
    this.asrClient = new ASRClient(config);
    this.llmClient = new LLMClient(config);
  }

  /**
   * 验证用户是否有权访问语料库（支持共享）
   */
  private async validateAccess(userId: string, lexiconId: string): Promise<void> {
    const { data: lexicon, error } = await this.client
      .from('lexicons')
      .select('user_id, is_shared, shared_with_users, share_scope')
      .eq('id', lexiconId)
      .single();

    if (error) {
      throw new NotFoundException('语料库不存在');
    }

    // 拥有者可以访问
    if (lexicon.user_id === userId) {
      return;
    }

    // 检查用户是否是管理员
    const isAdmin = await this.userService.isAdmin(userId);

    // 如果不是管理员且不是所有者，检查共享权限
    if (!isAdmin && lexicon.user_id !== userId) {
      const canAccess = await this.canAccessLexicon(userId, lexiconId);
      if (!canAccess.canAccess) {
        throw new ForbiddenException(canAccess.reason || '无权访问此语料库');
      }
    }
  }

  async getAll(
    userId: string,
    category?: string,
    type?: string,
    product_id?: string,
    targetUserId?: string,
    page?: number,
    pageSize?: number,
    search?: string,
    viewAll?: boolean,
  ) {
    const isAdmin = await this.userService.isAdmin(userId);

    // 管理员可以选择查看所有用户的语料库
    if (viewAll && isAdmin) {
      // 查询所有用户的语料库，不需要 user_id 过滤
      let query = this.client
        .from('lexicons')
        .select('*')
        .order('created_at', { ascending: false });

      // 添加筛选条件
      if (type && type !== 'all') {
        query = query.eq('type', type);
      }

      if (category) {
        query = query.eq('category', category);
      }

      if (product_id) {
        query = query.eq('product_id', product_id);
      }

      // 搜索功能（标题或内容包含关键词）
      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      }

      // 分页
      const currentPage = page || 1;
      const currentPageSize = pageSize || 50;
      const from = (currentPage - 1) * currentPageSize;
      const to = from + currentPageSize - 1;

      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw new Error(error.message);

      // 获取总数
      let countQuery = this.client
        .from('lexicons')
        .select('*', { count: 'exact', head: true });

      if (type && type !== 'all') {
        countQuery = countQuery.eq('type', type);
      }
      if (category) {
        countQuery = countQuery.eq('category', category);
      }
      if (search) {
        countQuery = countQuery.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      }

      const { count } = await countQuery;

      return {
        items: data || [],
        total: count || 0,
        page: currentPage,
        pageSize: currentPageSize,
      };
    }

    // 普通用户或查看特定用户的语料库
    if (!isAdmin && targetUserId && targetUserId !== userId) {
      throw new ForbiddenException('无权查看其他用户的语料库');
    }

    // 确定要查询的用户ID
    // targetUserId 在 controller 层已验证，如果是非法字符串会抛出 400
    // 如果 targetUserId 是 undefined，表示不传参数，查询当前用户的语料库
    const queryUserId = targetUserId || userId;

    let query = this.client
      .from('lexicons')
      .select('*')
      .eq('user_id', queryUserId)
      .order('created_at', { ascending: false });

    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (product_id) {
      query = query.eq('product_id', product_id);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // 分页
    const currentPage = page || 1;
    const currentPageSize = pageSize || 50;
    const from = (currentPage - 1) * currentPageSize;
    const to = from + currentPageSize - 1;

    query = query.range(from, to);

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    // 获取总数
    let countQuery = this.client
      .from('lexicons')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', queryUserId);

    if (type && type !== 'all') {
      countQuery = countQuery.eq('type', type);
    }
    if (category) {
      countQuery = countQuery.eq('category', category);
    }
    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { count } = await countQuery;

    return {
      items: data || [],
      total: count || 0,
      page: currentPage,
      pageSize: currentPageSize,
    };
  }

  async getById(userId: string, id: string) {
    // 使用共享支持的权限验证
    await this.validateAccess(userId, id);

    const { data, error } = await this.client
      .from('lexicons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);

    return data;
  }

  async create(
    userId: string,
    body: { title: string; content: string; category: string; type?: string; tags?: string[] },
  ) {
    const { data, error } = await this.client
      .from('lexicons')
      .insert({
        user_id: userId,
        title: body.title,
        content: body.content,
        category: body.category,
        type: body.type || 'personal',
        tags: body.tags,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(userId: string, id: string, body: { title?: string; content?: string; category?: string; tags?: string[] }) {
    // 验证访问权限
    await this.validateAccess(userId, id);

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.tags !== undefined) updateData.tags = body.tags;

    const { data, error } = await this.client
      .from('lexicons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(userId: string, id: string) {
    // 验证访问权限
    await this.validateAccess(userId, id);

    const { data, error } = await this.client
      .from('lexicons')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw new Error(error.message);
    return data;
  }

  async uploadFile(userId: string, file: Express.Multer.File) {
    // 使用 Supabase Storage 上传文件
    const fileName = `${Date.now()}_${file.originalname}`;
    const filePath = `lexicons/${userId}/${fileName}`;

    const { data: uploadData, error: uploadError } = await this.client.storage
      .from('files')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`文件上传失败: ${uploadError.message}`);
    }

    // 获取文件的公开访问 URL
    const { data: urlData } = this.client.storage
      .from('files')
      .getPublicUrl(filePath);

    const fileUrl = urlData.publicUrl;

    // 判断文件类型
    const fileExt = file.originalname.split('.').pop()?.toLowerCase();
    let fileType: 'word' | 'pdf' | 'audio' | 'video' | 'other';

    if (['doc', 'docx'].includes(fileExt || '')) {
      fileType = 'word';
    } else if (fileExt === 'pdf') {
      fileType = 'pdf';
    } else if (['mp3', 'wav', 'm4a', 'ogg'].includes(fileExt || '')) {
      fileType = 'audio';
    } else if (['mp4', 'webm', 'avi', 'mov'].includes(fileExt || '')) {
      fileType = 'video';
    } else {
      fileType = 'other';
    }

    return {
      fileKey: filePath,
      fileUrl,
      fileType,
    };
  }

  async speechToText(userId: string, audioUrl: string) {
    const result = await this.asrClient.recognize({
      uid: userId,
      url: audioUrl,
    });

    return {
      text: result.text,
      duration: result.duration,
    };
  }

  async correctText(userId: string, text: string) {
    const messages = [
      {
        role: 'system' as const,
        content: '你是一个专业的文本校对助手。你的任务是检查并纠正文本中的错别字、语法错误和标点符号错误，保持原文的意思和风格不变。',
      },
      {
        role: 'user' as const,
        content: `请校对以下文本，纠正其中的错误：\n\n${text}`,
      },
    ];

    const response = await this.llmClient.invoke(messages, {
      temperature: 0.3,
    });

    return {
      correctedText: response.content,
    };
  }

  async generateProfile(userId: string, type: 'enterprise' | 'personal') {
    // 获取语料库中的所有数据
    const result = await this.getAll(userId, undefined, type);
    const lexicons = result.items;

    // 合并所有语料内容
    const allContent = lexicons.map(l => l.content).join('\n\n');

    const messages = [
      {
        role: 'system' as const,
        content: '你是一个专业的AI内容分析师。请基于提供的语料库内容，进行深度分析，生成详细的IP画像、语料风格、常用语、语气特点和语义分析。返回JSON格式的数据。',
      },
      {
        role: 'user' as const,
        content: `请基于以下${type === 'enterprise' ? '企业' : '个人IP'}语料库内容，进行深度分析：

${allContent}

请返回以下格式的JSON数据（确保是合法的JSON格式）：
{
  "profile": {
    "position": "定位描述",
    "characteristics": ["特点1", "特点2"],
    "values": ["价值观1", "价值观2"]
  },
  "style": {
    "writingStyle": "写作风格描述",
    "languageFeatures": "语言特点",
    "structure": "结构特点"
  },
  "commonPhrases": ["常用语1", "常用语2", "常用语3"],
  "tone": {
    "mainTone": "主要语气",
    "emotionalTone": "情感基调",
    "variety": ["语气变体1", "语气变体2"]
  },
  "semantics": {
    "coreThemes": ["核心主题1", "核心主题2"],
    "keywords": ["关键词1", "关键词2"],
    "semanticFields": ["语义领域1", "语义领域2"]
  }
}`,
      },
    ];

    const response = await this.llmClient.invoke(messages, {
      temperature: 0.7,
    });

    // 尝试解析 JSON
    let parsedData;
    try {
      parsedData = JSON.parse(response.content);
    } catch (error) {
      // 如果解析失败，返回原始文本
      parsedData = {
        profile: { position: '解析失败，请查看原文', characteristics: [], values: [] },
        style: { writingStyle: '解析失败', languageFeatures: '', structure: '' },
        commonPhrases: [],
        tone: { mainTone: '解析失败', emotionalTone: '', variety: [] },
        semantics: { coreThemes: [], keywords: [], semanticFields: [] },
        rawText: response.content,
      };
    }

    return parsedData;
  }

  async optimize(userId: string, inputText: string, lexiconIds: string[]) {
    // 获取选中的语料库内容
    const lexicons = await Promise.all(
      lexiconIds.map(id => this.getById(userId, id))
    );

    // 合并所有语料内容
    const lexiconContent = lexicons.map(l => l.content).join('\n\n');

    const messages = [
      {
        role: 'system' as const,
        content: '你是一个专业的文本优化助手。你的任务是根据提供的语料库内容，优化用户输入的文本，使其更自然、更专业、更符合目标风格。',
      },
      {
        role: 'user' as const,
        content: `请基于以下语料库内容，优化用户输入的文本：

【语料库内容】
${lexiconContent}

【用户输入文本】
${inputText}

请优化上述文本，使其：
1. 保持原意不变
2. 使用语料库中的表达方式和风格
3. 使表达更自然、更专业
4. 去除AI味，使其更接近人类真实表达

请直接返回优化后的文本，不要包含其他说明。`,
      },
    ];

    const response = await this.llmClient.invoke(messages, {
      temperature: 0.7,
    });

    return {
      optimizedText: response.content,
    };
  }

  /**
   * 检查用户是否有权访问语料库（考虑共享）
   */
  async canAccessLexicon(userId: string, lexiconId: string): Promise<CanAccessResult> {
    const { data: lexicon, error } = await this.client
      .from('lexicons')
      .select('user_id, is_shared, shared_with_users, share_scope')
      .eq('id', lexiconId)
      .single();

    if (error || !lexicon) {
      return { canAccess: false, reason: '语料库不存在' };
    }

    // 拥有者可以访问
    if (lexicon.user_id === userId) {
      return { canAccess: true };
    }

    // 检查是否全局共享（管理员设置）
    const { data: sharePermission } = await this.client
      .from('share_permissions')
      .select('is_globally_shared')
      .eq('resource_type', 'lexicon')
      .eq('resource_id', lexiconId)
      .single();

    if (sharePermission && sharePermission.is_globally_shared) {
      return { canAccess: true };
    }

    // 检查用户共享
    if (lexicon.is_shared) {
      if (lexicon.share_scope === 'all') {
        return { canAccess: true };
      }

      if (lexicon.share_scope === 'custom' && lexicon.shared_with_users) {
        const sharedWithUsers = Array.isArray(lexicon.shared_with_users)
          ? lexicon.shared_with_users
          : JSON.parse(lexicon.shared_with_users);

        if (sharedWithUsers.includes(userId)) {
          return { canAccess: true };
        }
      }
    }

    return { canAccess: false, reason: '无权访问此语料库' };
  }

  /**
   * 共享语料库给其他用户
   */
  async shareLexicon(
    userId: string,
    lexiconId: string,
    shareScope: 'custom' | 'all' | 'department',
    sharedWithUsers?: string[]
  ): Promise<SharedLexiconInfo> {
    // 验证所有权
    const { data: lexicon, error } = await this.client
      .from('lexicons')
      .select('user_id')
      .eq('id', lexiconId)
      .single();

    if (error || !lexicon) {
      throw new NotFoundException('语料库不存在');
    }

    // 只有所有者可以共享
    if (lexicon.user_id !== userId) {
      throw new ForbiddenException('只有语料库所有者可以共享');
    }

    const updateData: any = {
      is_shared: true,
      share_scope: shareScope,
      shared_at: new Date().toISOString(),
      shared_by: userId,
    };

    if (shareScope === 'custom') {
      updateData.shared_with_users = sharedWithUsers || [];
    } else {
      updateData.shared_with_users = [];
    }

    const { data: updated, error: updateError } = await this.client
      .from('lexicons')
      .update(updateData)
      .eq('id', lexiconId)
      .select()
      .single();

    if (updateError) {
      throw new Error('共享失败：' + updateError.message);
    }

    // 记录共享历史
    await this.recordShareHistory(
      lexiconId,
      userId,
      'user_share',
      shareScope,
      sharedWithUsers || [],
      false,
      'share',
      null,
      { shareScope, sharedWithUsers }
    );

    return {
      isShared: true,
      shareScope: updated.share_scope,
      sharedWithUsers: updated.shared_with_users || [],
      sharedAt: updated.shared_at,
      sharedBy: updated.shared_by,
    };
  }

  /**
   * 取消共享语料库
   */
  async unshareLexicon(userId: string, lexiconId: string): Promise<void> {
    // 验证所有权
    const { data: lexicon, error } = await this.client
      .from('lexicons')
      .select('user_id')
      .eq('id', lexiconId)
      .single();

    if (error || !lexicon) {
      throw new NotFoundException('语料库不存在');
    }

    // 只有所有者可以取消共享
    if (lexicon.user_id !== userId) {
      throw new ForbiddenException('只有语料库所有者可以取消共享');
    }

    const { error: updateError } = await this.client
      .from('lexicons')
      .update({
        is_shared: false,
        share_scope: 'custom',
        shared_with_users: [],
        shared_at: null,
        shared_by: null,
      })
      .eq('id', lexiconId);

    if (updateError) {
      throw new Error('取消共享失败：' + updateError.message);
    }

    // 记录共享历史
    await this.recordShareHistory(
      lexiconId,
      userId,
      'user_share',
      'custom',
      [],
      false,
      'unshare',
      null,
      null
    );
  }

  /**
   * 获取共享给我的语料库
   */
  async getSharedWithMe(userId: string, page?: number, pageSize?: number) {
    // 查询共享给当前用户的语料库
    const currentPage = page || 1;
    const currentPageSize = pageSize || 20;
    const from = (currentPage - 1) * currentPageSize;
    const to = from + currentPageSize - 1;

    const { data, error, count } = await this.client
      .from('lexicons')
      .select('*', { count: 'exact' })
      .neq('user_id', userId) // 不是自己的
      .or(`share_scope.eq.all,shared_with_users.cs.{${userId}}`)
      .order('shared_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error('获取共享语料库失败：' + error.message);
    }

    return {
      items: data || [],
      total: count || 0,
      page: currentPage,
      pageSize: currentPageSize,
    };
  }

  /**
   * 获取我共享的语料库
   */
  async getMySharedLexicons(userId: string, page?: number, pageSize?: number) {
    const currentPage = page || 1;
    const currentPageSize = pageSize || 20;
    const from = (currentPage - 1) * currentPageSize;
    const to = from + currentPageSize - 1;

    const { data, error, count } = await this.client
      .from('lexicons')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_shared', true)
      .order('shared_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error('获取共享语料库失败：' + error.message);
    }

    return {
      items: data || [],
      total: count || 0,
      page: currentPage,
      pageSize: currentPageSize,
    };
  }

  /**
   * 管理员：设置全局共享
   */
  async forceShareLexicon(
    adminId: string,
    lexiconId: string,
    isGloballyShared: boolean
  ): Promise<SharePermission> {
    // 验证管理员权限
    const isAdmin = await this.userService.isAdmin(adminId);
    if (!isAdmin) {
      throw new ForbiddenException('需要管理员权限');
    }

    // 检查语料库是否存在
    const { data: lexicon, error } = await this.client
      .from('lexicons')
      .select('id')
      .eq('id', lexiconId)
      .single();

    if (error || !lexicon) {
      throw new NotFoundException('语料库不存在');
    }

    // 使用 upsert 更新或创建权限记录
    const { data, error: upsertError } = await this.client
      .from('share_permissions')
      .upsert({
        resource_type: 'lexicon',
        resource_id: lexiconId,
        is_globally_shared: isGloballyShared,
        updated_at: new Date().toISOString(),
        created_by: adminId,
      }, {
        onConflict: 'resource_type,resource_id',
      })
      .select()
      .single();

    if (upsertError) {
      throw new Error('设置全局共享失败：' + upsertError.message);
    }

    // 记录共享历史
    await this.recordShareHistory(
      lexiconId,
      adminId,
      'admin_share',
      'global',
      [],
      isGloballyShared,
      isGloballyShared ? 'share' : 'unshare',
      null,
      { isGloballyShared }
    );

    return {
      id: data.id,
      resourceType: data.resource_type,
      resourceId: data.resource_id,
      isGloballyShared: data.is_globally_shared,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
    };
  }

  /**
   * 获取所有共享记录
   */
  async getAllShareRecords(userId: string, page?: number, pageSize?: number): Promise<ShareRecord[]> {
    // 验证管理员权限
    const isAdmin = await this.userService.isAdmin(userId);
    if (!isAdmin) {
      throw new ForbiddenException('需要管理员权限');
    }

    const currentPage = page || 1;
    const currentPageSize = pageSize || 50;
    const from = (currentPage - 1) * currentPageSize;
    const to = from + currentPageSize - 1;

    // 获取共享记录
    const { data: sharedLexicons, error } = await this.client
      .from('lexicons')
      .select(`
        id,
        title,
        user_id,
        is_shared,
        share_scope,
        shared_with_users,
        shared_at
      `)
      .or(`is_shared.eq.true`)
      .order('shared_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error('获取共享记录失败：' + error.message);
    }

    // 获取所有全局共享的语料库
    const { data: globalShares } = await this.client
      .from('share_permissions')
      .select('resource_id')
      .eq('is_globally_shared', true)
      .eq('resource_type', 'lexicon');

    const globallySharedIds = globalShares?.map(g => g.resource_id) || [];

    // 合并数据
    const records: ShareRecord[] = await Promise.all(
      (sharedLexicons || []).map(async (lexicon: any) => {
        // 获取用户信息
        const { data: user } = await this.client
          .from('users')
          .select('nickname')
          .eq('id', lexicon.user_id)
          .single();

        return {
          lexiconId: lexicon.id,
          lexiconTitle: lexicon.title,
          userId: lexicon.user_id,
          userName: user?.nickname || '未知用户',
          isShared: lexicon.is_shared,
          shareScope: lexicon.share_scope,
          sharedWithUsers: lexicon.shared_with_users || [],
          isGloballyShared: globallySharedIds.includes(lexicon.id),
          sharedAt: lexicon.shared_at,
        };
      })
    );

    return records;
  }

  /**
   * 记录共享历史
   */
  private async recordShareHistory(
    lexiconId: string,
    operatorId: string,
    shareType: 'user_share' | 'admin_share',
    shareScope: string,
    sharedWithUsers: string[],
    isGlobalShare: boolean,
    action: 'share' | 'unshare',
    previousConfig: any,
    newConfig: any
  ): Promise<void> {
    // 获取操作人姓名
    const { data: operator } = await this.client
      .from('users')
      .select('nickname')
      .eq('id', operatorId)
      .single();

    const { error } = await this.client
      .from('share_history')
      .insert({
        lexicon_id: lexiconId,
        operator_id: operatorId,
        operator_name: operator?.nickname || '未知用户',
        share_type: shareType,
        share_scope: shareScope,
        shared_with_users: sharedWithUsers,
        is_global_share: isGlobalShare,
        action: action,
        previous_config: previousConfig,
        new_config: newConfig,
      });

    if (error) {
      console.error('记录共享历史失败:', error);
    }
  }

  /**
   * 获取共享历史记录
   */
  async getShareHistory(
    userId: string,
    lexiconId?: string,
    page?: number,
    pageSize?: number
  ): Promise<{ items: ShareHistory[]; total: number; page: number; pageSize: number }> {
    // 验证管理员权限
    const isAdmin = await this.userService.isAdmin(userId);
    if (!isAdmin) {
      throw new ForbiddenException('需要管理员权限');
    }

    const currentPage = page || 1;
    const currentPageSize = pageSize || 20;
    const from = (currentPage - 1) * currentPageSize;
    const to = from + currentPageSize - 1;

    let query = this.client
      .from('share_history')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (lexiconId) {
      query = query.eq('lexicon_id', lexiconId);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error('获取共享历史失败：' + error.message);
    }

    return {
      items: (data || []).map((item: any) => ({
        id: item.id,
        lexiconId: item.lexicon_id,
        operatorId: item.operator_id,
        operatorName: item.operator_name,
        shareType: item.share_type,
        shareScope: item.share_scope,
        sharedWithUsers: item.shared_with_users || [],
        isGlobalShare: item.is_global_share,
        action: item.action,
        previousConfig: item.previous_config,
        newConfig: item.new_config,
        createdAt: item.created_at,
      })),
      total: count || 0,
      page: currentPage,
      pageSize: currentPageSize,
    };
  }
}
