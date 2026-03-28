"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LexiconService = void 0;
const common_1 = require("@nestjs/common");
const coze_coding_dev_sdk_1 = require("coze-coding-dev-sdk");
const supabase_client_1 = require("../../storage/database/supabase-client");
const user_service_1 = require("../../user/user.service");
let LexiconService = class LexiconService {
    constructor(userService) {
        this.userService = userService;
        this.client = (0, supabase_client_1.getSupabaseClient)();
        const config = new coze_coding_dev_sdk_1.Config();
        this.asrClient = new coze_coding_dev_sdk_1.ASRClient(config);
        this.llmClient = new coze_coding_dev_sdk_1.LLMClient(config);
    }
    async validateAccess(userId, lexiconId) {
        const { data: lexicon, error } = await this.client
            .from('lexicons')
            .select('user_id, is_shared, shared_with_users, share_scope')
            .eq('id', lexiconId)
            .single();
        if (error) {
            throw new common_1.NotFoundException('语料库不存在');
        }
        if (lexicon.user_id === userId) {
            return;
        }
        const isAdmin = await this.userService.isAdmin(userId);
        if (!isAdmin && lexicon.user_id !== userId) {
            const canAccess = await this.canAccessLexicon(userId, lexiconId);
            if (!canAccess.canAccess) {
                throw new common_1.ForbiddenException(canAccess.reason || '无权访问此语料库');
            }
        }
    }
    async getAll(userId, category, type, product_id, targetUserId, page, pageSize, search, viewAll) {
        const isAdmin = await this.userService.isAdmin(userId);
        if (viewAll && isAdmin) {
            let query = this.client
                .from('lexicons')
                .select('*')
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
            const currentPage = page || 1;
            const currentPageSize = pageSize || 50;
            const from = (currentPage - 1) * currentPageSize;
            const to = from + currentPageSize - 1;
            query = query.range(from, to);
            const { data, error } = await query;
            if (error)
                throw new Error(error.message);
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
        if (!isAdmin && targetUserId && targetUserId !== userId) {
            throw new common_1.ForbiddenException('无权查看其他用户的语料库');
        }
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
        const currentPage = page || 1;
        const currentPageSize = pageSize || 50;
        const from = (currentPage - 1) * currentPageSize;
        const to = from + currentPageSize - 1;
        query = query.range(from, to);
        const { data, error } = await query;
        if (error)
            throw new Error(error.message);
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
    async getById(userId, id) {
        await this.validateAccess(userId, id);
        const { data, error } = await this.client
            .from('lexicons')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async create(userId, body) {
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
        if (error)
            throw new Error(error.message);
        return data;
    }
    async update(userId, id, body) {
        await this.validateAccess(userId, id);
        const updateData = {};
        if (body.title !== undefined)
            updateData.title = body.title;
        if (body.content !== undefined)
            updateData.content = body.content;
        if (body.category !== undefined)
            updateData.category = body.category;
        if (body.tags !== undefined)
            updateData.tags = body.tags;
        const { data, error } = await this.client
            .from('lexicons')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async delete(userId, id) {
        await this.validateAccess(userId, id);
        const { data, error } = await this.client
            .from('lexicons')
            .delete()
            .eq('id', id)
            .select();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async uploadFile(userId, file) {
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
        const { data: urlData } = this.client.storage
            .from('files')
            .getPublicUrl(filePath);
        const fileUrl = urlData.publicUrl;
        const fileExt = file.originalname.split('.').pop()?.toLowerCase();
        let fileType;
        if (['doc', 'docx'].includes(fileExt || '')) {
            fileType = 'word';
        }
        else if (fileExt === 'pdf') {
            fileType = 'pdf';
        }
        else if (['mp3', 'wav', 'm4a', 'ogg'].includes(fileExt || '')) {
            fileType = 'audio';
        }
        else if (['mp4', 'webm', 'avi', 'mov'].includes(fileExt || '')) {
            fileType = 'video';
        }
        else {
            fileType = 'other';
        }
        return {
            fileKey: filePath,
            fileUrl,
            fileType,
        };
    }
    async speechToText(userId, audioUrl) {
        const result = await this.asrClient.recognize({
            uid: userId,
            url: audioUrl,
        });
        return {
            text: result.text,
            duration: result.duration,
        };
    }
    async correctText(userId, text) {
        const messages = [
            {
                role: 'system',
                content: '你是一个专业的文本校对助手。你的任务是检查并纠正文本中的错别字、语法错误和标点符号错误，保持原文的意思和风格不变。',
            },
            {
                role: 'user',
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
    async generateProfile(userId, type) {
        const result = await this.getAll(userId, undefined, type);
        const lexicons = result.items;
        const allContent = lexicons.map(l => l.content).join('\n\n');
        const messages = [
            {
                role: 'system',
                content: '你是一个专业的AI内容分析师。请基于提供的语料库内容，进行深度分析，生成详细的IP画像、语料风格、常用语、语气特点和语义分析。返回JSON格式的数据。',
            },
            {
                role: 'user',
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
        let parsedData;
        try {
            parsedData = JSON.parse(response.content);
        }
        catch (error) {
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
    async optimize(userId, inputText, lexiconIds) {
        const lexicons = await Promise.all(lexiconIds.map(id => this.getById(userId, id)));
        const lexiconContent = lexicons.map(l => l.content).join('\n\n');
        const messages = [
            {
                role: 'system',
                content: '你是一个专业的文本优化助手。你的任务是根据提供的语料库内容，优化用户输入的文本，使其更自然、更专业、更符合目标风格。',
            },
            {
                role: 'user',
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
    async canAccessLexicon(userId, lexiconId) {
        const { data: lexicon, error } = await this.client
            .from('lexicons')
            .select('user_id, is_shared, shared_with_users, share_scope')
            .eq('id', lexiconId)
            .single();
        if (error || !lexicon) {
            return { canAccess: false, reason: '语料库不存在' };
        }
        if (lexicon.user_id === userId) {
            return { canAccess: true };
        }
        const { data: sharePermission } = await this.client
            .from('share_permissions')
            .select('is_globally_shared')
            .eq('resource_type', 'lexicon')
            .eq('resource_id', lexiconId)
            .single();
        if (sharePermission && sharePermission.is_globally_shared) {
            return { canAccess: true };
        }
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
    async shareLexicon(userId, lexiconId, shareScope, sharedWithUsers) {
        const { data: lexicon, error } = await this.client
            .from('lexicons')
            .select('user_id')
            .eq('id', lexiconId)
            .single();
        if (error || !lexicon) {
            throw new common_1.NotFoundException('语料库不存在');
        }
        if (lexicon.user_id !== userId) {
            throw new common_1.ForbiddenException('只有语料库所有者可以共享');
        }
        const updateData = {
            is_shared: true,
            share_scope: shareScope,
            shared_at: new Date().toISOString(),
            shared_by: userId,
        };
        if (shareScope === 'custom') {
            updateData.shared_with_users = sharedWithUsers || [];
        }
        else {
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
        await this.recordShareHistory(lexiconId, userId, 'user_share', shareScope, sharedWithUsers || [], false, 'share', null, { shareScope, sharedWithUsers });
        return {
            isShared: true,
            shareScope: updated.share_scope,
            sharedWithUsers: updated.shared_with_users || [],
            sharedAt: updated.shared_at,
            sharedBy: updated.shared_by,
        };
    }
    async unshareLexicon(userId, lexiconId) {
        const { data: lexicon, error } = await this.client
            .from('lexicons')
            .select('user_id')
            .eq('id', lexiconId)
            .single();
        if (error || !lexicon) {
            throw new common_1.NotFoundException('语料库不存在');
        }
        if (lexicon.user_id !== userId) {
            throw new common_1.ForbiddenException('只有语料库所有者可以取消共享');
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
        await this.recordShareHistory(lexiconId, userId, 'user_share', 'custom', [], false, 'unshare', null, null);
    }
    async getSharedWithMe(userId, page, pageSize) {
        const currentPage = page || 1;
        const currentPageSize = pageSize || 20;
        const from = (currentPage - 1) * currentPageSize;
        const to = from + currentPageSize - 1;
        const { data, error, count } = await this.client
            .from('lexicons')
            .select('*', { count: 'exact' })
            .neq('user_id', userId)
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
    async getMySharedLexicons(userId, page, pageSize) {
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
    async forceShareLexicon(adminId, lexiconId, isGloballyShared) {
        const isAdmin = await this.userService.isAdmin(adminId);
        if (!isAdmin) {
            throw new common_1.ForbiddenException('需要管理员权限');
        }
        const { data: lexicon, error } = await this.client
            .from('lexicons')
            .select('id')
            .eq('id', lexiconId)
            .single();
        if (error || !lexicon) {
            throw new common_1.NotFoundException('语料库不存在');
        }
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
        await this.recordShareHistory(lexiconId, adminId, 'admin_share', 'global', [], isGloballyShared, isGloballyShared ? 'share' : 'unshare', null, { isGloballyShared });
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
    async getAllShareRecords(userId, page, pageSize) {
        const isAdmin = await this.userService.isAdmin(userId);
        if (!isAdmin) {
            throw new common_1.ForbiddenException('需要管理员权限');
        }
        const currentPage = page || 1;
        const currentPageSize = pageSize || 50;
        const from = (currentPage - 1) * currentPageSize;
        const to = from + currentPageSize - 1;
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
        const { data: globalShares } = await this.client
            .from('share_permissions')
            .select('resource_id')
            .eq('is_globally_shared', true)
            .eq('resource_type', 'lexicon');
        const globallySharedIds = globalShares?.map(g => g.resource_id) || [];
        const records = await Promise.all((sharedLexicons || []).map(async (lexicon) => {
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
        }));
        return records;
    }
    async recordShareHistory(lexiconId, operatorId, shareType, shareScope, sharedWithUsers, isGlobalShare, action, previousConfig, newConfig) {
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
    async getShareHistory(userId, lexiconId, page, pageSize) {
        const isAdmin = await this.userService.isAdmin(userId);
        if (!isAdmin) {
            throw new common_1.ForbiddenException('需要管理员权限');
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
            items: (data || []).map((item) => ({
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
};
exports.LexiconService = LexiconService;
exports.LexiconService = LexiconService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService])
], LexiconService);
//# sourceMappingURL=lexicon.service.js.map