import { Injectable, Logger } from '@nestjs/common';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { HotTopicsService } from '../hot-topics/hot-topics.service';

@Injectable()
export class HotService {
  private readonly logger = new Logger(HotService.name);
  private llmClient: LLMClient;
  private isLLMAvailable = false;
  // 缓存
  private cache: any = null;
  private cacheTime: number = 0;
  private readonly CACHE_TTL = 60 * 1000; // 60秒缓存

  constructor(
    private readonly hotTopicsService: HotTopicsService
  ) {
    try {
      const config = new Config();
      this.llmClient = new LLMClient(config);
      this.isLLMAvailable = true;
      this.logger.log('LLM服务初始化成功');
    } catch (error) {
      this.logger.warn('LLM服务初始化失败', error);
      this.isLLMAvailable = false;
    }
  }

  /**
   * 获取所有平台热点（按平台分组）
   */
  async getAllHot() {
    console.log('[HotService] 获取所有平台热点');

    const now = Date.now();

    // 检查缓存
    if (this.cache && now - this.cacheTime < this.CACHE_TTL) {
      console.log('[HotService] 使用缓存数据');
      return this.cache;
    }

    console.log('[HotService] 缓存过期，重新获取数据');

    try {
      // 使用 getHotList 获取所有热点数据
      const result = await this.getHotList('national', 'all');

      if (!result || !result.list || result.list.length === 0) {
        throw new Error('获取热点数据失败');
      }

      // 平台名称映射（英文 -> 中文）
      const platformNameMap: Record<string, string> = {
        'weibo': '微博',
        'zhihu': '知乎',
        'douyin': '抖音',
        'bilibili': '哔哩哔哩',
        'baidu': '百度',
        'toutiao': '今日头条',
        'github': 'GitHub',
        'juejin': '掘金',
        'all': '综合'
      };

      // 按平台分组
      const platformMap = new Map<string, any[]>();

      result.list.forEach((item: any) => {
        // 将英文平台名映射为中文平台名
        // 优先使用 platform 字段，如果没有则使用 site_name 或 site
        const platformName = platformNameMap[item.platform] || item.platform || item.site_name || item.site || '综合';

        if (!platformMap.has(platformName)) {
          platformMap.set(platformName, []);
        }
        platformMap.get(platformName)?.push({
          rank: item.rank,
          title: item.title,
          hot: this.formatHotness(item.hotness),
          url: item.url,
          summary: item.summary,
          category: item.category,
          trend: item.trend,
          isBursting: item.isBursting
        });
      });

      // 构建平台列表
      const platforms: any[] = [];

      // 添加主要平台（即使没有数据也显示）
      const mainPlatforms = [
        { name: '微博', icon: 'weibo' },
        { name: '知乎', icon: 'zhihu' },
        { name: '抖音', icon: 'douyin' },
        { name: '哔哩哔哩', icon: 'bilibili' },
        { name: '百度', icon: 'baidu' },
        { name: '今日头条', icon: 'toutiao' },
        { name: '综合', icon: 'all' }
      ];

      mainPlatforms.forEach(p => {
        const list = platformMap.get(p.name) || [];
        platforms.push({
          platform: p.name,
          icon: p.icon,
          list: list
        });
      });

      // 添加其他平台
      platformMap.forEach((list, platform) => {
        if (!mainPlatforms.find(p => p.name === platform)) {
          platforms.push({
            platform: platform,
            icon: 'other',
            list: list
          });
        }
      });

      const finalResult = {
        updateTime: new Date().toISOString(),
        platforms: platforms
      };

      // 更新缓存
      this.cache = finalResult;
      this.cacheTime = now;

      console.log('[HotService] 获取成功，平台数量:', platforms.length);
      return finalResult;
    } catch (error: any) {
      console.error('[HotService] 获取所有平台热点失败:', error);

      // 如果有缓存，即使过期也返回缓存数据
      if (this.cache) {
        console.log('[HotService] 使用过期缓存数据');
        return this.cache;
      }

      throw error;
    }
  }

  /**
   * 格式化热度值
   */
  private formatHotness(hotness: number): string {
    if (hotness >= 10000) {
      return (hotness / 10000).toFixed(1) + 'w';
    }
    if (hotness >= 1000) {
      return (hotness / 1000).toFixed(1) + 'k';
    }
    return hotness.toString();
  }

  /**
   * 获取热点列表
   */
  async getHotList(
    scope: 'national' | 'city' = 'national',
    platform: 'all' | 'weibo' | 'zhihu' | 'douyin' | 'bilibili' = 'all'
  ) {
    console.log('[HotService] 获取热点列表');
    console.log('scope:', scope);
    console.log('platform:', platform);

    try {
      // 调用 HotTopicsService 获取数据
      // 注意：HotTopicsService 期望 locationMode 为 'national' | 'local'
      const locationMode = scope === 'city' ? 'local' : 'national';

      const hotTopics = await this.hotTopicsService.getHotTopics(
        'all',
        locationMode,
        scope === 'city' ? '全国' : undefined
      );

      // 转换为统一格式
      const list = hotTopics.map((item: any, index: number) => {
        // 计算趋势
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (item.trendChange && item.trendChange > 5) {
          trend = 'up';
        } else if (item.trendChange && item.trendChange < -5) {
          trend = 'down';
        }

        // 计算排名变化
        const rankChange = item.rankChange || 0;

        return {
          id: item.id || `hot_${index}`,
          rank: index + 1,
          rankChange: rankChange,
          title: item.keyword || item.title,
          hotness: item.hotness || item.score,
          trend: trend,
          platform: item.platform || item.site_name || item.site || '综合',
          url: item.url || '',
          summary: item.summary || item.description,
          publishTime: item.publishTime || item.time,
          category: item.category || '',
          keywords: item.keywords || [],
          isBursting: item.isBursting || false
        };
      });

      return {
        source: 'server_proxy' as const,
        scope: scope,
        platform: platform,
        list: list
      };
    } catch (error: any) {
      console.error('[HotService] 获取热点列表失败:', error);

      // 如果获取失败，返回空列表而不是抛出异常
      return {
        source: 'server_proxy' as const,
        scope: scope,
        platform: platform,
        list: []
      };
    }
  }

  /**
   * 生成AI选题
   */
  async generateTopic(title: string, platform?: string, hot?: string) {
    this.logger.log('生成AI选题');
    this.logger.log('热点标题:', title);
    this.logger.log('平台:', platform);
    this.logger.log('热度:', hot);

    if (!this.isLLMAvailable) {
      // 降级：返回模板选题
      return this.getTopicTemplate(title);
    }

    try {
      const prompt = `你是一名短视频内容策划专家，现在请根据以下热点信息，为"星厨房"生成适合抖音/视频号的内容选题。

品牌背景：
星厨房是一家提供新旧商用厨具、二手商厨、整店回收、后厨整体解决方案的公司，服务对象主要是餐饮创业者、开店老板、二手设备需求客户、清场回收客户。

热点信息：
标题：${title}
平台：${platform || '未知'}
热度：${hot || '未知'}

请输出5个短视频选题，每个选题包含以下内容：
1. 选题标题（简洁有力，适合抖音）
2. 内容角度（具体的切入点）
3. 适合账号人设（华哥/奇哥/七七/星级回收）
4. 适合形式（短视频/直播）
5. 爆点关键词（3-5个）
6. 建议发布时间（例如：上午9-11点、晚上7-9点）

要求：
1. 贴近餐饮创业、开店预算、商用厨房设备、二手设备、整店回收
2. 语言口语化，适合抖音表达
3. 要有传播感和实操感
4. 不要空泛
5. 必须以JSON格式返回，格式如下：
[
  {
    "id": "1",
    "title": "选题标题",
    "contentAngle": "内容角度",
    "suitableAccount": "适合账号",
    "format": "short",
    "keywords": ["关键词1", "关键词2", "关键词3"],
    "suggestedTime": "建议发布时间"
  }
]`;

      const response = await this.llmClient.invoke([
        { role: 'user' as const, content: prompt }
      ], {
        temperature: 0.7
      });

      const content = response.content || '';
      this.logger.log('LLM生成选题内容:', content);

      // 解析JSON响应
      try {
        const topics = JSON.parse(content);
        return { topics };
      } catch (error) {
        this.logger.warn('解析JSON失败，使用模板', error);
        return this.getTopicTemplate(title);
      }
    } catch (error: any) {
      this.logger.error('LLM生成选题失败:', error);
      return this.getTopicTemplate(title);
    }
  }

  /**
   * 生成AI脚本
   */
  async generateScript(title: string, contentAngle?: string) {
    this.logger.log('生成AI脚本');
    this.logger.log('选题标题:', title);
    this.logger.log('内容角度:', contentAngle);

    if (!this.isLLMAvailable) {
      // 降级：返回模板脚本
      return this.getScriptTemplate(title, contentAngle);
    }

    try {
      const prompt = `你是一名短视频文案策划专家，请根据以下选题，为"星厨房"生成短视频脚本。

品牌背景：
星厨房主营新旧商用厨具、二手商厨、整店回收、后厨整体解决方案。

选题：${title}
内容方向：${contentAngle || '通用'}

请输出以下内容：
1. 15秒短视频脚本（快节奏，开头3秒有钩子）
2. 30秒短视频脚本（标准口播，开头有观点，中间有案例，结尾有转化）
3. 60秒口播脚本（深度讲解，完整阐述观点和案例）
4. 抖音标题3条（吸引眼球，包含关键词）
5. 评论区互动引导3条（引导用户评论和互动）
6. 直播间可延展话题3条（适合直播讨论的话题）
7. 推荐话题标签5-7个

要求：
1. 语言自然、口语化
2. 开头3秒有钩子
3. 中间有观点或案例
4. 结尾要有互动或转化意识
5. 适合真实拍摄，不要太虚
6. 必须以JSON格式返回，格式如下：
{
  "id": "xxx",
  "fifteenSecond": "15秒脚本内容",
  "thirtySecond": "30秒脚本内容",
  "sixtySecond": "60秒脚本内容",
  "douyinTitles": ["标题1", "标题2", "标题3"],
  "commentGuidance": ["引导1", "引导2", "引导3"],
  "liveTopics": ["话题1", "话题2", "话题3"],
  "suggestedHashtags": ["#标签1", "#标签2", "#标签3"]
}`;

      const response = await this.llmClient.invoke([
        { role: 'user' as const, content: prompt }
      ], {
        temperature: 0.8
      });

      const content = response.content || '';
      this.logger.log('LLM生成脚本内容:', content);

      // 解析JSON响应
      try {
        const script = JSON.parse(content);
        return { ...script, id: Date.now().toString() };
      } catch (error) {
        this.logger.warn('解析JSON失败，使用模板', error);
        return this.getScriptTemplate(title, contentAngle);
      }
    } catch (error: any) {
      this.logger.error('LLM生成脚本失败:', error);
      return this.getScriptTemplate(title, contentAngle);
    }
  }

  /**
   * 获取选题模板（降级方案）
   */
  private getTopicTemplate(title: string) {
    return {
      topics: [
        {
          id: '1',
          title: `从${title}看餐饮创业的真相`,
          contentAngle: '从热点事件切入，分析餐饮创业中的关键问题，结合开店预算和设备选择',
          suitableAccount: '华哥',
          format: 'short',
          keywords: ['餐饮创业', '开店预算', '避坑', '设备选择'],
          suggestedTime: '晚上7-9点'
        },
        {
          id: '2',
          title: '餐饮设备怎么买才不踩坑？',
          contentAngle: '从热点延伸到设备选购，讲解二手设备的价值和新旧设备的取舍',
          suitableAccount: '奇哥',
          format: 'short',
          keywords: ['商用厨具', '二手设备', '设备选购', '性价比'],
          suggestedTime: '上午9-11点'
        },
        {
          id: '3',
          title: '新手开店的三个设备误区',
          contentAngle: '针对新手老板，讲解设备预算的常见错误和正确做法',
          suitableAccount: '七七',
          format: 'short',
          keywords: ['新手开店', '设备误区', '预算控制', '后厨规划'],
          suggestedTime: '中午12-2点'
        },
        {
          id: '4',
          title: '关店后设备怎么处理最划算',
          contentAngle: '从热点中提炼出设备回收的话题，讲解整店回收和散件出售的区别',
          suitableAccount: '星级回收',
          format: 'live',
          keywords: ['整店回收', '设备处理', '资产变现', '清场'],
          suggestedTime: '直播时段'
        },
        {
          id: '5',
          title: '餐饮赚钱的秘密不在菜品，在后厨',
          contentAngle: '从热点引发对后厨效率的思考，讲解设备配置对利润的影响',
          suitableAccount: '华哥',
          format: 'short',
          keywords: ['后厨效率', '设备配置', '利润管理', '老板认知'],
          suggestedTime: '晚上8-10点'
        }
      ]
    };
  }

  /**
   * 获取脚本模板（降级方案）
   */
  private getScriptTemplate(title: string, contentAngle?: string) {
    const angle = contentAngle || '从热点切入，讲解相关内容';
    return {
      id: Date.now().toString(),
      fifteenSecond: `3秒钩子：${title}背后藏着一个秘密\n\n正文：很多老板不知道，设备选对了，一天能省两千块。华哥今天告诉你真相。\n\n结尾：关注我，避开99%的设备坑！`,
      thirtySecond: `开头：${title}让很多餐饮老板慌了，其实根本没必要。\n\n中间：我见过太多老板，新店开业买全套新设备，结果三个月就亏了二十万。其实二手设备一样用，省下来的钱可以做营销、请厨师。\n\n结尾：想知道怎么选设备？评论区留言"设备"，我给你发清单。`,
      sixtySecond: `开头：${title}这个事儿，我必须跟餐饮老板说清楚。\n\n第一，开店预算不是先算装修，而是先算设备。很多老板一开始就错了。\n\n第二，新设备不一定好，二手设备不一定差。关键是看什么？看成色、看品牌、看性价比。\n\n第三，设备回收也有门道。关店的时候，整店回收比散件出售更省事。\n\n结尾：我是华哥，十年餐饮设备经验，关注我，教你避坑。`,
      douyinTitles: [
        `${title}，餐饮老板必看！`,
        `设备选不对，开业就亏钱！`,
        `餐饮设备选购的3个真相`
      ],
      commentGuidance: [
        '你的店铺买了哪些设备？花了多少钱？评论区聊聊',
        '有同感的老板扣个1，我给你发设备清单',
        '想看具体设备选择的，评论区扣"设备"'
      ],
      liveTopics: [
        '如何评估二手设备的价值？',
        '开店预算中，设备应该占多少？',
        '关店后设备回收的注意事项'
      ],
      suggestedHashtags: ['#餐饮创业', '#开店预算', '#商用厨具', '#二手设备', '#餐饮避坑']
    };
  }

  /**
   * 添加收藏
   */
  async addFavorite(data: {
    hotTitle: string;
    platform?: string;
    hot?: string;
    topicTitle?: string;
    scriptSummary?: string;
    account?: string;
    responsible?: string;
    status?: string;
  }) {
    console.log('[HotService] 添加收藏');
    console.log('数据:', JSON.stringify(data));

    // 使用内存存储（生产环境应该使用数据库）
    // 这里使用简单的文件系统存储
    const fs = require('fs');
    const path = require('path');

    const favoritesFile = path.join(process.cwd(), 'data', 'favorites.json');
    const dataDir = path.join(process.cwd(), 'data');

    // 确保目录存在
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // 读取现有数据
    let favorites: any[] = [];
    if (fs.existsSync(favoritesFile)) {
      try {
        const content = fs.readFileSync(favoritesFile, 'utf-8');
        favorites = JSON.parse(content);
      } catch (error) {
        console.error('[HotService] 读取收藏文件失败:', error);
        favorites = [];
      }
    }

    // 添加新收藏
    const newFavorite = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString()
    };

    favorites.push(newFavorite);

    // 保存数据
    fs.writeFileSync(favoritesFile, JSON.stringify(favorites, null, 2), 'utf-8');

    this.logger.log(`收藏添加成功: ${newFavorite.id}`);

    return newFavorite;
  }

  /**
   * 获取收藏列表
   */
  async getFavoriteList() {
    console.log('[HotService] 获取收藏列表');

    const fs = require('fs');
    const path = require('path');

    const favoritesFile = path.join(process.cwd(), 'data', 'favorites.json');

    // 读取数据
    if (!fs.existsSync(favoritesFile)) {
      return [];
    }

    try {
      const content = fs.readFileSync(favoritesFile, 'utf-8');
      const favorites = JSON.parse(content);

      // 格式化日期
      return favorites.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      }));
    } catch (error) {
      console.error('[HotService] 读取收藏文件失败:', error);
      return [];
    }
  }

  /**
   * 删除收藏
   */
  async deleteFavorite(id: string) {
    console.log('[HotService] 删除收藏');
    console.log('收藏ID:', id);

    const fs = require('fs');
    const path = require('path');

    const favoritesFile = path.join(process.cwd(), 'data', 'favorites.json');

    // 读取现有数据
    let favorites: any[] = [];
    if (fs.existsSync(favoritesFile)) {
      try {
        const content = fs.readFileSync(favoritesFile, 'utf-8');
        favorites = JSON.parse(content);
      } catch (error) {
        console.error('[HotService] 读取收藏文件失败:', error);
        return;
      }
    }

    // 删除指定收藏
    const originalLength = favorites.length;
    favorites = favorites.filter((item: any) => item.id !== id);

    if (favorites.length === originalLength) {
      throw new Error('收藏不存在');
    }

    // 保存数据
    fs.writeFileSync(favoritesFile, JSON.stringify(favorites, null, 2), 'utf-8');

    this.logger.log(`收藏删除成功: ${id}`);
  }

  /**
   * 更新收藏状态
   */
  async updateFavoriteStatus(id: string, status: string) {
    console.log('[HotService] 更新收藏状态');
    console.log('收藏ID:', id);
    console.log('新状态:', status);

    const fs = require('fs');
    const path = require('path');

    const favoritesFile = path.join(process.cwd(), 'data', 'favorites.json');

    // 读取现有数据
    let favorites: any[] = [];
    if (fs.existsSync(favoritesFile)) {
      try {
        const content = fs.readFileSync(favoritesFile, 'utf-8');
        favorites = JSON.parse(content);
      } catch (error) {
        console.error('[HotService] 读取收藏文件失败:', error);
        throw new Error('读取收藏数据失败');
      }
    }

    // 更新状态
    let found = false;
    favorites = favorites.map((item: any) => {
      if (item.id === id) {
        found = true;
        return { ...item, status };
      }
      return item;
    });

    if (!found) {
      throw new Error('收藏不存在');
    }

    // 保存数据
    fs.writeFileSync(favoritesFile, JSON.stringify(favorites, null, 2), 'utf-8');

    this.logger.log(`收藏状态更新成功: ${id} -> ${status}`);
  }
}
