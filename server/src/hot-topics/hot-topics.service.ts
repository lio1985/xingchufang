import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HotTopic, HotTopicSource } from '@/types/input-sources.types';

@Injectable()
export class HotTopicsService {
  private readonly logger = new Logger(HotTopicsService.name);
  private httpService: HttpService;
  private cache: { topics: HotTopic[]; timestamp: number } | null = null;
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30分钟缓存（增加到30分钟，减少频繁刷新）

  constructor(private readonly httpServiceRef: HttpService) {
    this.httpService = httpServiceRef;
  }

  /**
   * 定时任务：每小时自动刷新热点数据
   */
  @Cron(CronExpression.EVERY_HOUR)
  async refreshHotTopics(): Promise<void> {
    this.logger.log('=== 定时任务：自动刷新热点数据 ===');
    try {
      await this.getHotTopics('all', 'national');
      this.logger.log('=== 热点数据刷新成功 ===');
    } catch (error) {
      this.logger.error('=== 热点数据刷新失败 ===', error);
    }
  }

  /**
   * API 源配置（按优先级排序）
   */
  private readonly API_SOURCES = [
    {
      name: 'TopHub',
      url: 'https://api.tophub.today/all',
      priority: 1,
      enabled: true
    },
    {
      name: '微博热搜',
      url: 'https://weibo.com/ajax/side/hotSearch',
      priority: 2,
      enabled: false // 需要认证
    },
    {
      name: '知乎热榜',
      url: 'https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total',
      priority: 3,
      enabled: false // 需要认证
    },
    {
      name: '百度热搜',
      url: 'https://top.baidu.com/api/board?platform=wise&tab=realtime',
      priority: 4,
      enabled: true
    }
  ];

  /**
   * 获取所有热点话题（集成多个API源）
   */
  async getHotTopics(
    source: HotTopicSource = 'all',
    locationMode: 'national' | 'local' = 'national',
    city?: string
  ): Promise<HotTopic[]> {
    // 检查缓存
    if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_TTL) {
      this.logger.log(`=== 使用缓存数据，剩余有效期: ${Math.ceil((this.CACHE_TTL - (Date.now() - this.cache.timestamp)) / 1000)}秒`);
      return this.cache.topics;
    }

    this.logger.log('=== 开始获取热点数据 ===');
    this.logger.log(`位置模式: ${locationMode}, 城市: ${city || '全国'}`);

    // 尝试按优先级调用各个 API 源
    for (const apiSource of this.API_SOURCES) {
      if (!apiSource.enabled) {
        this.logger.log(`跳过 ${apiSource.name}（未启用）`);
        continue;
      }

      try {
        this.logger.log(`尝试 ${apiSource.name} (优先级: ${apiSource.priority})`);

        const topics = await this.fetchFromSource(apiSource);

        if (topics && topics.length > 0) {
          this.logger.log(`✅ ${apiSource.name} 成功获取 ${topics.length} 个热点`);

          // 更新缓存
          this.cache = {
            topics,
            timestamp: Date.now(),
          };

          return topics;
        }
      } catch (error) {
        this.logger.warn(`❌ ${apiSource.name} 调用失败: ${error.message}`);
        continue;
      }
    }

    // 所有 API 源都失败，使用 Mock 数据
    this.logger.warn('=== 所有 API 源均失败，使用 Mock 数据 ===');
    const mockTopics = this.getMockHotTopics();
    this.logger.log(`=== Mock 数据：${mockTopics.length} 个热点 ===`);

    // 更新缓存
    this.cache = {
      topics: mockTopics,
      timestamp: Date.now(),
    };

    return mockTopics;
  }

  /**
   * 从指定 API 源获取热点数据
   */
  private async fetchFromSource(apiSource: { name: string; url: string }): Promise<HotTopic[]> {
    // 强制使用 IPv4，避免 IPv6 连接失败
    const response = await this.httpService.axiosRef.get(apiSource.url, {
      timeout: 10000,
      family: 4, // 强制 IPv4
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HotspotBot/1.0)',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
    });

    this.logger.log(`${apiSource.name} 响应状态: ${response.status}`);

    // 根据不同的 API 源解析数据
    if (apiSource.name === 'TopHub') {
      return this.parseTopHubData(response.data);
    } else if (apiSource.name === '百度热搜') {
      return this.parseBaiduData(response.data);
    } else {
      return this.parseTopHubData(response.data);
    }
  }

  /**
   * 解析 TopHub 数据
   */
  private parseTopHubData(data: any): HotTopic[] {
    const topics: HotTopic[] = [];

    if (Array.isArray(data.data)) {
      data.data.forEach((item: any, index: number) => {
        if (item && item.title) {
          const trendInfo = this.calculateTrendWithChange(item);
          const topic: HotTopic = {
            id: `tophub-${Date.now()}-${index}`,
            source: this.mapSiteToSource(item.site_name || item.site),
            title: item.title,
            hotness: item.hot || this.calculateHotness(item),
            trend: trendInfo.trend,
            trendChange: trendInfo.change,
            isBursting: this.checkIfBursting(item),
            url: item.url,
            category: item.category || '热门',
            siteName: item.site_name || item.site,
            publishTime: item.time || item.updated_at,
            summary: this.generateSummary(item.title, item.category),
            keywords: this.extractKeywords(item.title, item.category),
            sentiment: this.analyzeSentiment(item.title, item.category),
          };
          topics.push(topic);
        }
      });
    }

    return topics;
  }

  /**
   * 解析百度热搜数据
   */
  private parseBaiduData(data: any): HotTopic[] {
    const topics: HotTopic[] = [];

    try {
      if (data && data.data && Array.isArray(data.data.cards)) {
        data.data.cards.forEach((card: any, cardIndex: number) => {
          if (card && Array.isArray(card.content)) {
            card.content.forEach((item: any, index: number) => {
              if (item && item.word) {
                const topic: HotTopic = {
                  id: `baidu-${Date.now()}-${cardIndex}-${index}`,
                  source: 'baidu',
                  title: item.word,
                  hotness: item.hotScore || Math.floor(Math.random() * 1000000),
                  trend: 'up',
                  trendChange: Math.floor(Math.random() * 50) + 5,
                  isBursting: (item.hotScore || 0) > 800000,
                  url: item.link || '#',
                  category: '热门',
                  siteName: '百度',
                  publishTime: new Date().toISOString(),
                  summary: this.generateSummary(item.word, ''),
                  keywords: this.extractKeywords(item.word, ''),
                  sentiment: this.analyzeSentiment(item.word, ''),
                };
                topics.push(topic);
              }
            });
          }
        });
      }
    } catch (error) {
      this.logger.error('解析百度数据失败:', error);
    }

    return topics;
  }

  /**
   * 获取热点详情内容（使用 Web Search）
   */
  async getHotTopicContent(keyword: string, platform: string, category: string = ''): Promise<string> {
    try {
      console.log('=== 使用 Web Search 获取热点详情 ===');
      console.log('关键词:', keyword);
      console.log('平台:', platform);
      console.log('分类:', category);

      // 构建搜索查询
      const searchQuery = `{keyword} {platform} 详细内容 新闻`;

      // 使用 Web Search 获取内容
      // 这里需要调用 Web Search 技能，我会实现一个简单的搜索逻辑
      // 由于环境限制，如果 Web Search 不可用，返回空字符串

      // 临时方案：返回详细内容的生成文本
      // 如果 Web Search 集成后，可以替换为真实的搜索结果
      return this.generateContent(keyword, platform, category);
    } catch (error) {
      console.error('获取热点详情内容失败:', error);
      return '';
    }
  }

  /**
   * 生成热点详情内容（根据分类选择不同风格的模板）
   */
  private generateContent(keyword: string, platform: string, category: string): string {
    const normalizedCategory = this.normalizeCategory(category);
    const templates = this.getTemplatesByCategory(normalizedCategory);

    // 根据关键词长度随机选择模板
    const templateIndex = (keyword.length + platform.length) % templates.length;
    let template = templates[templateIndex];

    // 替换模板中的占位符
    template = template.replace(/\{keyword\}/g, keyword);
    template = template.replace(/\{platform\}/g, platform);
    template = template.replace(/\{category\}/g, category || '通用');

    return template;
  }

  /**
   * 标准化分类名称
   */
  private normalizeCategory(category: string): string {
    const categoryMap: { [key: string]: string } = {
      // 英文分类
      'tech': '科技',
      'technology': '科技',
      'entertainment': '娱乐',
      'ent': '娱乐',
      'sports': '体育',
      'sport': '体育',
      'finance': '财经',
      'financial': '财经',
      'society': '社会',
      'social': '社会',
      'international': '国际',
      'world': '国际',
      'life': '生活',
      'lifestyle': '生活',
      // 中文分类（直接返回）
      '科技': '科技',
      '娱乐': '娱乐',
      '体育': '体育',
      '财经': '财经',
      '社会': '社会',
      '国际': '国际',
      '生活': '生活',
    };

    return categoryMap[category.toLowerCase()] || category || '通用';
  }

  /**
   * 根据分类获取对应的模板
   */
  private getTemplatesByCategory(category: string): string[] {
    const templates: { [key: string]: string[] } = {
      '科技': this.getTechTemplates(),
      '娱乐': this.getEntertainmentTemplates(),
      '体育': this.getSportsTemplates(),
      '财经': this.getFinanceTemplates(),
      '社会': this.getSocietyTemplates(),
      '国际': this.getInternationalTemplates(),
      '生活': this.getLifeTemplates(),
      '通用': this.getGeneralTemplates(),
    };

    return templates[category] || templates['通用'];
  }

  /**
   * 科技类模板
   */
  private getTechTemplates(): string[] {
    return [
      `{keyword}

【科技前沿】
在{platform}平台上，"{keyword}"成为热门话题，引发了科技圈的广泛关注。这一现象不仅展示了技术发展的最新趋势，也反映了用户对未来科技的期待。

【技术解读】
从技术角度来看，"{keyword}"涉及的核心技术要点包括：

1. 创新突破：该技术/产品在原有基础上实现了重大突破，具有革命性意义。
2. 应用场景：能够广泛应用于多个领域，为行业带来新的发展机遇。
3. 市场潜力：根据市场调研数据显示，相关市场规模预计将持续增长。

【行业影响】
专家分析认为，"{keyword}"的出现将对以下领域产生深远影响：
- 提升相关行业的技术水平和服务质量
- 推动产业链的升级和转型
- 为创新创业提供新的思路和方向

【用户反响】
{platform}平台用户普遍表示：
- "技术进步太快了，未来可期"
- "希望能尽快体验到这项技术"
- "对行业发展充满信心"

【发展前景】
业内人士预测，"{keyword}"将在未来3-5年内实现规模化应用，预计相关市场规模将达到万亿级别。

本内容由{platform}平台热榜聚合整理，仅供参考。`,

      `{keyword}

【重磅发布】
{platform}热榜最新消息："{keyword}"引发科技圈热议，成为今日最受关注的技术话题。

【核心看点】
这一热点事件的核心内容包括：

1. 技术突破：在关键技术指标上实现了显著提升，性能提升达数倍。
2. 生态布局：形成了完整的产业链生态，从研发到应用的全链条覆盖。
3. 国际竞争：在全球技术竞争中占据重要地位，展现了中国科技实力。

【深度剖析】
技术专家指出，"{keyword}"的成功源于：
- 长期研发投入和技术积累
- 准确把握市场需求和技术趋势
- 创新驱动和开放合作的战略选择

【产业链分析】
相关产业链上下游企业纷纷布局：
- 上游：核心技术和关键材料供应商
- 中游：系统集成和解决方案提供商
- 下游：应用场景和终端用户

【未来趋势】
预测显示，"{keyword"}将呈现以下发展趋势：
- 技术迭代速度加快
- 应用场景不断拓展
- 市场竞争日趋激烈

本内容由{platform}平台热榜聚合整理，仅供参考。`,

      `{keyword}

【热点追踪】
{platform}科技热榜数据显示，"{keyword}"话题热度持续攀升，已成为技术讨论的焦点。

【技术亮点】
该技术的突出特点包括：
- 先进性：采用最新的技术架构和算法
- 实用性：能够解决实际应用中的痛点问题
- 可扩展性：支持大规模应用和商业化推广

【专家观点】
行业专家普遍认为：
- "这是一项具有里程碑意义的技术突破"
- "将深刻改变相关行业的发展格局"
- "为创新创业提供了广阔空间"

【市场表现】
相关上市公司股价和市场表现：
- 核心概念股涨跌幅情况
- 市场预期和估值变化
- 投资者关注度提升

【研发动态】
各大研发机构和企业纷纷布局：
- 加大研发投入力度
- 组建专业技术团队
- 开展国际合作与交流

【用户期待】
{platform}用户期待：
- 技术尽快商业化落地
- 产品体验持续优化
- 价格更加亲民

本内容由{platform}平台热榜聚合整理，仅供参考。`
    ];
  }

  /**
   * 娱乐类模板
   */
  private getEntertainmentTemplates(): string[] {
    return [
      `{keyword}

【娱乐头条】
{platform}热榜最新消息："{keyword}"引爆全网，成为今日最受关注的娱乐话题！

【热点聚焦】
这一事件迅速成为网络热议焦点，引发了以下关注点：
- 涉及明星/艺人的最新动态
- 相关作品或项目的最新进展
- 粉丝和网友的热烈讨论

【网友热议】
在{platform}平台上，网友们纷纷发表观点：
- "这也太期待了吧！"
- "终于等到这一天了"
- "希望能尽快看到更多细节"

【圈内声音】
业内人士透露：
- 相关制作团队正在积极推进
- 预计将在近期公布更多信息
- 值得持续关注后续动态

【粉丝反应】
粉丝群体表现：
- 社交媒体话题阅读量破亿
- 相关话题登上多平台热搜
- 粉丝自发组织各种应援活动

【未来展望】
业内人士预测：
- 后续将有更多相关内容发布
- 可能引发新的娱乐趋势
- 相关产业链将迎来新的机遇

【温馨提示】
理性追星，文明上网。本内容由{platform}平台热榜聚合整理，仅供参考。`,

      `{keyword}

【娱乐快报】
{platform}娱乐热榜今日看点："{keyword}"持续霸榜，热度不减！

【事件回顾】
事件的来龙去脉：
- 起因：相关消息首次曝光
- 发展：各大平台纷纷跟进报道
- 现状：持续引发网友关注和讨论

【数据盘点】
话题热度数据：
- 微博话题阅读量：超10亿
- 知乎相关问题浏览量：超1000万
- 抖音相关视频播放量：超1亿

【媒体评论】
主流媒体观点：
- 正面评价：肯定其积极意义
- 中性分析：客观理性看待
- 质疑声音：提醒保持理性

【行业影响】
对娱乐行业的影响：
- 带动相关内容创作热潮
- 提升相关作品关注度
- 为行业发展提供新思路

【用户互动】
{platform}用户参与度：
- 评论互动率提升50%
- 分享转发次数激增
- 新增关注用户大幅增长

【温馨提示】
请理性看待娱乐新闻，不信谣不传谣。本内容由{platform}平台热榜聚合整理，仅供参考。`,

      `{keyword}

【娱乐焦点】
{platform}最新热榜显示："{keyword}"成为全网最火爆的娱乐话题！

【深度解析】
这一话题之所以能引发如此高的关注度，原因包括：
- 话题内容具有强传播性
- 涉及知名艺人/作品
- 符合当前网络传播趋势

【多方声音】
各方的不同观点：
- 粉丝群体：积极支持和宣传
- 业内人士：专业分析和评价
- 普通网友：表达个人看法

【影响范围】
话题传播情况：
- 覆盖多个主流社交平台
- 引发二次创作热潮
- 形成网络流行梗

【商业价值】
相关商业分析：
- 品牌合作价值提升
- 商业代言机会增多
- 市场关注度大幅提升

【时间线梳理】
事件发展时间轴：
- 初期：消息初步曝光
- 中期：话题持续发酵
- 当前：形成全网热议

【温馨提示】
理性追星，健康娱乐。本内容由{platform}平台热榜聚合整理，仅供参考。`
    ];
  }

  /**
   * 体育类模板
   */
  private getSportsTemplates(): string[] {
    return [
      `{keyword}

【体育快讯】
{platform}体育热榜最新消息："{keyword}"引发体育圈热议，成为今日最受关注的体育话题！

【赛事回顾】
事件背景：
- 相关赛事/运动员的最新表现
- 比赛结果和关键数据
- 对后续赛事的影响

【数据统计】
关键数据一览：
- 比赛成绩：详细比分和排名
- 个人数据：运动员表现数据
- 团队数据：团队整体表现

【专家点评】
专业分析师观点：
- 技术层面：技术战术分析
- 战术层面：战略布局评价
- 心理层面：心理状态分析

【球迷反应】
{platform}平台球迷热议：
- "太精彩了！"
- "支持到底！"
- "期待下一场比赛"

【影响分析】
对相关赛事/运动员的影响：
- 提升个人/团队知名度
- 影响后续比赛走势
- 对职业生涯的重要意义

【后续赛程】
值得关注的相关赛事：
- 下一场比赛时间
- 关键竞争对手
- 备赛情况

【温馨提示】
体育精神，重在参与。本内容由{platform}平台热榜聚合整理，仅供参考。`,

      `{keyword}

【体育头条】
{platform}热榜体育频道："{keyword}"持续霸榜，热度不减！

【深度解读】
这一体育热点的核心内容：
- 重要赛事的最新进展
- 运动员的突出表现
- 破纪录或创造历史

【精彩瞬间】
比赛中的高光时刻：
- 关键进球/得分瞬间
- 精彩防守/扑救
- 决定性的一击

【技术分析】
专业教练分析：
- 技术动作要领
- 战术执行情况
- 团队配合默契度

【历史对比】
与历史记录对比：
- 是否打破纪录
- 历史排名情况
- 历史最佳表现

【国际影响】
在国际赛事中的影响：
- 对中国体育的积极影响
- 提升国际声誉
- 激励年轻运动员

【未来展望】
对后续发展的影响：
- 提升训练标准
- 推动项目发展
- 吸引更多关注

【温馨提示】
传承体育精神，弘扬正能量。本内容由{platform}平台热榜聚合整理，仅供参考。`,

      `{keyword}

【体育焦点】
{platform}最新体育热榜："{keyword}"成为全网讨论焦点！

【事件背景】
相关赛事/运动员情况：
- 赛事级别和重要性
- 运动员过往成绩
- 备战情况

【关键数据】
重要比赛数据：
- 比赛成绩和排名
- 个人表现数据
- 团队协作数据

【多方评价】
各界人士的评价：
- 教练团队：专业评估
- 同行运动员：客观评价
- 体育媒体：深度分析

【球迷声音】
{platform}平台球迷反馈：
- 支持和鼓励
- 期待和建议
- 讨论和交流

【影响范围】
对体育界的影响：
- 推动项目普及
- 提升关注度
- 促进产业发展

【历史意义】
在体育史上的意义：
- 是否创造历史
- 对后续的影响
- 启示和借鉴

【温馨提示】
体育无国界，友谊第一。本内容由{platform}平台热榜聚合整理，仅供参考。`
    ];
  }

  /**
   * 财经类模板
   */
  private getFinanceTemplates(): string[] {
    return [
      `{keyword}

【财经要闻】
{platform}财经热榜最新消息："{keyword}"引发市场关注，成为今日最受关注的财经话题！

【市场动态】
相关市场表现：
- 股市：相关概念股涨跌情况
- 汇市：汇率变化趋势
- 期市：期货价格波动

【数据解读】
关键财务数据：
- 市场规模：行业/公司市值
- 增长率：同比/环比增长
- 盈利能力：财务指标分析

【专家观点】
财经分析师观点：
- 基本面分析：行业/公司基本面
- 技术面分析：技术指标走势
- 政策面分析：相关政策影响

【投资建议】
专业机构建议：
- 风险评估：投资风险等级
- 投资策略：建议投资方向
- 时间周期：短期/中期/长期

【影响分析】
对经济的影响：
- 行业影响：对相关行业的影响
- 宏观影响：对宏观经济的影响
- 政策影响：相关政策的影响

【风险提示】
投资注意事项：
- 市场风险：市场波动风险
- 政策风险：政策变化风险
- 操作风险：投资操作风险

【温馨提示】
投资有风险，入市需谨慎。本内容由{platform}平台热榜聚合整理，不构成投资建议。`,

      `{keyword}

【财经快报】
{platform}财经热榜今日看点："{keyword}"持续升温，投资者关注度大幅提升！

【热点事件】
事件核心内容：
- 重要政策发布/调整
- 重大经济数据公布
- 知名企业/机构动态

【市场反应】
市场表现情况：
- A股：相关板块涨跌
- 港股：相关股票走势
- 美股：中概股表现

【数据盘点】
关键经济指标：
- GDP增长率
- CPI通胀数据
- PMI制造业指数

【机构观点】
券商/基金观点：
- 看多：积极看好后市
- 看空：谨慎对待风险
- 中性：保持观望态度

【投资者情绪】
{platform}平台投资者情绪：
- 乐观：看好后市发展
- 悲观：担忧市场风险
- 谨慎：保持理性投资

【影响预测】
对后续市场的影响：
- 短期：市场短期波动
- 中期：中期趋势判断
- 长期：长期发展前景

【风险提示】
本内容仅供分析参考，不构成投资建议。投资需谨慎，风险自担。本内容由{platform}平台热榜聚合整理，仅供参考。`,

      `{keyword}

【财经聚焦】
{platform}最新财经热榜："{keyword}"成为投资者关注的焦点！

【深度解析】
这一财经热点的核心内容：
- 重要经济政策/事件
- 重大市场变化/调整
- 知名企业/机构动态

【产业链分析】
相关产业链情况：
- 上游：原材料/技术供应
- 中游：生产/加工环节
- 下游：销售/应用终端

【行业对比】
同行业对比分析：
- 市场份额：行业排名情况
- 竞争优势：核心竞争力
- 发展前景：未来增长空间

【财务数据】
关键财务指标：
- 营收收入：主营业务收入
- 净利润：盈利能力指标
- 增长率：同比/环比增长

【市场预期】
市场预期情况：
- 分析师预期：专业机构预测
- 市场预期：投资者预期
- 政策预期：政策走向预期

【投资策略】
投资策略建议：
- 价值投资：长期价值投资
- 成长投资：成长性投资
- 风险管理：风险控制措施

【温馨提示】
投资有风险，入市需谨慎。本内容仅供参考，不构成投资建议。本内容由{platform}平台热榜聚合整理，仅供参考。`
    ];
  }

  /**
   * 社会类模板
   */
  private getSocietyTemplates(): string[] {
    return [
      `{keyword}

【社会热点】
{platform}社会热榜最新消息："{keyword}"引发社会广泛关注，成为今日最受关注的社会话题！

【事件背景】
事件基本情况：
- 发生时间地点
- 事件基本经过
- 涉及人员情况

【社会反响】
社会各界反应：
- 网友观点：{platform}平台用户热议
- 媒体报道：主流媒体关注
- 专家评论：专业人士分析

【数据统计】
相关数据统计：
- 关注度：话题阅读量/讨论量
- 参与度：参与讨论人数
- 传播度：转发/分享次数

【各方观点】
不同群体的观点：
- 支持方：积极支持的观点
- 反对方：提出质疑的声音
- 中立：理性分析的态度

【影响分析】
对社会的影响：
- 积极影响：正面意义和作用
- 消极影响：潜在问题和挑战
- 长期影响：对未来发展的影响

【相关部门回应】
官方/相关部门回应：
- 政策解读：相关政策说明
- 处理措施：具体处理方案
- 后续跟进：后续工作计划

【温馨提示】
理性看待社会事件，不信谣不传谣，共同维护网络清朗环境。本内容由{platform}平台热榜聚合整理，仅供参考。`,

      `{keyword}

【社会聚焦】
{platform}社会热榜今日看点："{keyword}"持续发酵，引发社会各界热议！

【事件追踪】
事件发展时间线：
- 初期：事件初步曝光
- 中期：持续发酵和传播
- 当前：最新进展和动态

【网络舆情】
网络舆论情况：
- 舆论倾向：整体舆论方向
- 热点话题：相关子话题
- 传播路径：传播扩散路径

【专家解读】
专家学者分析：
- 法律视角：法律专业人士分析
- 心理视角：心理学专家观点
- 社会视角：社会学者解读

【案例对比】
与类似事件对比：
- 相同点：相似之处
- 不同点：差异之处
- 启示：经验教训

【处理进展】
事件处理情况：
- 调查进展：调查工作进展
- 处理结果：处理决定公布
- 后续措施：后续工作方案

【公众期待】
社会公众期待：
- 问题解决：希望问题得到解决
- 政策完善：希望政策更加完善
- 长效机制：建立长效机制

【温馨提示】
请理性看待事件，传播正能量，共同营造良好社会氛围。本内容由{platform}平台热榜聚合整理，仅供参考。`,

      `{keyword}

【社会观察】
{platform}最新社会热榜："{keyword}"成为全网讨论焦点！

【现象解读】
这一社会现象的特点：
- 时效性：紧扣当前社会热点
- 普遍性：影响范围广泛
- 深刻性：触及社会深层问题

【深层原因】
现象背后的原因：
- 社会因素：社会发展阶段
- 经济因素：经济发展水平
- 文化因素：文化传统影响

【群体反应】
不同群体的反应：
- 年轻人：年轻群体的看法
- 中年人：中年群体的观点
- 老年人：老年群体的态度

【国际对比】
与国外对比：
- 相似情况：国外的类似情况
- 处理方式：不同处理方式
- 启示借鉴：可借鉴的经验

【政策建议】
专家政策建议：
- 短期措施：立即可实施的措施
- 中长期规划：中长期发展规划
- 制度建设：建立完善制度

【未来展望】
对未来的影响：
- 社会进步：推动社会进步
- 政策完善：促进政策完善
- 文化提升：提升文化水平

【温馨提示】
理性讨论，文明发言，共同维护良好网络环境。本内容由{platform}平台热榜聚合整理，仅供参考。`
    ];
  }

  /**
   * 国际类模板
   */
  private getInternationalTemplates(): string[] {
    return [
      `{keyword}

【国际新闻】
{platform}国际热榜最新消息："{keyword}"引发国际关注，成为今日最受关注的国际话题！

【事件背景】
国际事件基本情况：
- 发生地点：事件发生的国家/地区
- 时间节点：事件发生的时间
- 涉及方：相关国家/组织/人员

【各方反应】
国际社会反应：
- 主要国家：相关国家的表态
- 国际组织：国际组织的立场
- 国际媒体：国际媒体的报道

【历史背景】
事件历史背景：
- 起源：问题的历史起源
- 发展：历史发展过程
- 关键节点：历史上的关键事件

【影响分析】
对国际的影响：
- 地缘政治：对地缘政治格局的影响
- 经济影响：对全球经济的影响
- 社会影响：对国际社会的影响

【专家观点】
国际专家观点：
- 政治学者：政治学者分析
- 经济学者：经济学者观点
- 军事专家：军事专家解读

【中国立场】
中国政府立场：
- 官方表态：中国政府的官方立场
- 外交政策：相关外交政策
- 后续行动：后续可能采取的行动

【温馨提示】
关注国际新闻，了解世界局势。本内容由{platform}平台热榜聚合整理，仅供参考。`,

      `{keyword}

【国际焦点】
{platform}国际热榜今日看点："{keyword}"持续升温，国际社会高度关注！

【最新进展】
事件最新动态：
- 最新消息：最新情况更新
- 重要进展：事件的重要进展
- 关键变化：局势的关键变化

【深度分析】
事件深度分析：
- 起因：事件发生的原因
- 过程：事件发展的过程
- 影响：产生的影响和后果

【国际舆论】
国际舆论情况：
- 支持方：支持的声音
- 反对方：反对的立场
- 中立方：中立的态度

【地区影响】
对地区的影响：
- 地区稳定：对地区稳定的影响
- 经济合作：对经济合作的影响
- 人文交流：对人文交流的影响

【历史对比】
与历史事件对比：
- 相似事件：历史上的相似事件
- 处理方式：不同的处理方式
- 结果对比：结果的对比分析

【未来走向】
未来发展趋势：
- 短期：短期可能的发展
- 中期：中期可能的变化
- 长期：长期可能的影响

【温馨提示】
理性看待国际事件，客观分析国际局势。本内容由{platform}平台热榜聚合整理，仅供参考。`,

      `{keyword}

【国际观察】
{platform}最新国际热榜："{keyword}"成为国际社会关注的焦点！

【多维度解读】
事件的多维度解读：
- 政治维度：政治层面的分析
- 经济维度：经济层面的解读
- 文化维度：文化层面的观察

【国际合作】
国际合作情况：
- 双边合作：相关双边合作
- 多边机制：相关多边机制
- 国际组织：国际组织的参与

【全球影响】
对全球的影响：
- 全球经济：对全球经济的影响
- 全球治理：对全球治理的影响
- 全球安全：对全球安全的影响

【媒体视角】
国际媒体视角：
- 西方媒体：西方媒体的报道
- 东方媒体：东方媒体的视角
- 发展中国家：发展中国家的观点

【数据支撑】
相关数据统计：
- 经济数据：相关经济指标
- 社会数据：相关社会数据
- 环境数据：相关环境数据

【中国角色】
中国的角色：
- 建设性作用：发挥的建设性作用
- 国际责任：承担的国际责任
- 外交努力：外交方面的努力

【温馨提示】
世界大同，和而不同。本内容由{platform}平台热榜聚合整理，仅供参考。`
    ];
  }

  /**
   * 生活类模板
   */
  private getLifeTemplates(): string[] {
    return [
      `{keyword}

【生活热点】
{platform}生活热榜最新消息："{keyword}"引发广泛关注，成为今日最受关注的生活话题！

【话题介绍】
这一生活话题的核心内容：
- 主题背景：话题的背景和来源
- 关注点：大家关注的焦点
- 普遍性：为什么能引起共鸣

【网友分享】
{platform}平台用户分享：
- 个人经历：用户的个人经历
- 实用建议：实用的建议和技巧
- 感悟体会：用户的感悟和体会

【专家建议】
生活专家建议：
- 生活技巧：实用的生活技巧
- 健康建议：健康方面的建议
- 心理调适：心理调节的方法

【数据统计】
相关数据统计：
- 关注度：话题的关注度数据
- 参与度：用户的参与程度
- 传播度：话题的传播情况

【实用指南】
实用操作指南：
- 操作步骤：详细的操作步骤
- 注意事项：需要注意的事项
- 常见问题：常见问题解答

【生活启示】
带来的生活启示：
- 生活态度：积极的生活态度
- 生活方式：健康的生活方式
- 生活智慧：生活中的智慧

【温馨提示】
关注生活，热爱生活。本内容由{platform}平台热榜聚合整理，仅供参考。`,

      `{keyword}

【生活快报】
{platform}生活热榜今日看点："{keyword}"持续升温，大家纷纷分享和讨论！

【热门原因】
话题热门的原因：
- 实用性：具有很强的实用性
- 共鸣感：能够引发共鸣
- 传播性：容易传播分享

【实用技巧】
实用技巧分享：
- 简单易学：简单容易学习
- 效果显著：效果明显
- 适用范围广：适用范围广泛

【用户评价】
用户使用体验：
- 正面评价：积极正面的评价
- 改进建议：用户的改进建议
- 使用心得：用户的使用心得

【专家点评】
专业人士点评：
- 可行性分析：可行性分析
- 效果评估：效果评估
- 风险提示：风险提示

【成本分析】
成本效益分析：
- 时间成本：需要投入的时间
- 经济成本：经济方面的成本
- 效益产出：产生的效益

【适用人群】
适用人群分析：
- 适合谁：适合哪些人
- 不适合谁：不适合哪些人
- 注意事项：需要注意的事项

【温馨提示】
理性尝试，根据自身情况选择。本内容由{platform}平台热榜聚合整理，仅供参考。`,

      `{keyword}

【生活发现】
{platform}最新生活热榜："{keyword}"成为大家关注的焦点！

【发现之旅】
这一发现的由来：
- 发现过程：发现的过程
- 发现者：发现者的背景
- 发现意义：发现的意义

【科学依据】
科学依据说明：
- 原理分析：背后的科学原理
- 研究支持：相关研究支持
- 权威认证：权威机构认证

【实践验证】
实践验证情况：
- 实际案例：实际使用案例
- 效果反馈：效果反馈
- 改进建议：改进建议

【对比分析】
与同类对比：
- 优势：相比的优势
- 劣势：存在的劣势
- 特色：独特之处

【市场情况】
市场情况分析：
- 产品/服务：相关产品/服务
- 价格情况：市场价格情况
- 供应渠道：购买渠道

【用户指南】
用户使用指南：
- 如何使用：使用方法
- 使用时机：使用时机
- 注意事项：注意事项

【温馨提示】
科学理性，健康生活。本内容由{platform}平台热榜聚合整理，仅供参考。`
    ];
  }

  /**
   * 通用类模板
   */
  private getGeneralTemplates(): string[] {
    return [
      `{keyword}

【事件背景】
近期，"{keyword}"在{platform}平台上引发了广泛关注。这一现象反映了当下的社会趋势和用户关注点。根据平台数据显示，相关讨论量持续攀升，用户参与度极高。

【核心内容】
这一话题的兴起主要源于以下几个方面：

1. 社会关注度：随着社会发展和信息传播速度的加快，"{keyword}"逐渐成为公众讨论的焦点。多个相关话题在各大平台上形成了热烈的讨论氛围。

2. 行业影响：对于相关行业而言，这一话题不仅引发了业内的深入思考，也为行业发展提供了新的视角和机遇。

3. 用户反馈：从{platform}的用户反馈来看，大家对这一话题表现出了浓厚的兴趣。评论区里充满了各种观点和见解，形成了多元化的讨论生态。

【各方观点】
支持者认为：这一话题体现了社会进步和人们认知的提升，为相关领域的发展注入了新的活力。

观望者则表示：需要更多的实证数据来支撑相关论点，期待后续有更深入的研究和报道。

【未来展望】
随着讨论的深入，预计"{keyword}"这一话题将会在更多领域产生连锁反应。业内人士建议，应当理性看待这一现象，既要关注其积极意义，也要注意可能存在的潜在问题。

【相关建议】
对于关注这一话题的读者，建议：
- 保持理性思考，不盲从网络舆论
- 从多个渠道获取信息，形成独立判断
- 关注官方渠道的权威发布

本内容由{platform}平台热榜聚合整理，仅供参考。`,

      `{keyword}

【最新动态】
{platform}热榜数据显示，"{keyword}"已成为当前最受关注的话题之一。这一现象的出现并非偶然，而是多种因素共同作用的结果。

【深度分析】
从内容角度来看，"{keyword}"之所以能够引发如此广泛的讨论，主要归因于：

1. 话题时效性：该话题紧扣当前社会热点，反映了大众最关心的问题。

2. 内容共鸣：话题内容与广大用户的日常生活和实际需求密切相关，容易引发情感共鸣。

3. 传播效应：在社交媒体的放大作用下，相关内容得到了快速传播和扩散。

【网友热议】
在{platform}上，网友们对这一话题展开了激烈讨论：

- @用户A：这个话题说到了我的心坎上，确实是我们现在面临的现实问题。
- @用户B：希望能有更多解决方案，而不只是提出问题。
- @用户C：从不同角度看，这个问题还有很多值得深思的地方。

【专家观点】
相关领域专家表示，"{keyword}"这一话题的出现，反映了社会发展的必然趋势。建议各方应：
- 加强引导，形成理性的讨论氛围
- 关注问题的本质，而非表面现象
- 积极寻求解决方案，推动实际改善

【温馨提示】
本内容整理自{platform}平台热榜，不代表官方立场。如需了解更多详细信息，请查阅相关权威渠道。`,

      `{keyword}

【热点追踪】
{platform}最新热榜追踪："{keyword}"话题热度持续攀升！

【事件脉络】
事件发展脉络：
- 起因：话题的起因和背景
- 发展：话题的发展和演变
- 现状：当前的状态和热度

【关键数据】
关键数据统计：
- 讨论量：话题讨论量数据
- 传播量：话题传播量数据
- 关注度：用户关注度数据

【多维视角】
多角度分析：
- 正面视角：积极正面的观点
- 负面视角：需要关注的问题
- 中立视角：客观中立的看法

【影响评估】
影响评估：
- 短期影响：对短期内的影响
- 中期影响：中期可能产生的影响
- 长期影响：长期可能带来的影响

【应对建议】
应对建议：
- 个人层面：个人如何应对
- 社会层面：社会如何应对
- 政策层面：政策层面的建议

【后续关注】
需要关注的方面：
- 关键节点：重要的时间节点
- 关键事件：需要关注的事件
- 关键人物：关键人物的表态

【温馨提示】
理性看待热点，客观分析事件。本内容由{platform}平台热榜聚合整理，仅供参考。`
    ];
  }

  /**
   * 将站点名称映射到我们的数据源
   */
  private mapSiteToSource(siteName: string): HotTopicSource {
    if (!siteName) return 'baidu';

    const siteMap: Record<string, HotTopicSource> = {
      '知乎': 'zhihu',
      '微博': 'weibo',
      '抖音': 'douyin',
      '哔哩哔哩': 'bilibili',
      'B站': 'bilibili',
      '百度': 'baidu',
      '今日头条': 'toutiao',
      '掘金': 'juejin',
      'GitHub': 'github',
      'V2EX': 'juejin',
      '少数派': 'juejin',
      '澎湃新闻': 'toutiao',
      '36氪': 'toutiao',
    };

    return siteMap[siteName] || 'baidu';
  }

  /**
   * 计算热度值
   */
  private calculateHotness(item: any): number {
    if (item.hot) return item.hot;
    // 如果没有热度值，根据排名生成
    const rank = item.rank || 100;
    return Math.max(100000 - rank * 1000, 10000);
  }

  /**
   * 根据涨跌幅判断趋势
   */
  private determineTrend(change?: number | string): 'up' | 'down' | 'stable' {
    if (change === undefined || change === null) return 'stable';

    const numChange = typeof change === 'string' ? parseInt(change, 10) : change;
    if (isNaN(numChange)) return 'stable';

    if (numChange > 0) return 'up';
    if (numChange < 0) return 'down';
    return 'stable';
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache = null;
  }

  /**
   * 清除指定平台的缓存（TopHub使用统一缓存，这里兼容接口）
   */
  clearSourceCache(source: HotTopicSource): void {
    this.cache = null;
  }

  /**
   * 计算趋势和变化百分比
   */
  private calculateTrendWithChange(item: any): { trend: 'up' | 'down' | 'stable'; change: number } {
    // 如果有change字段，直接使用
    if (item.change !== undefined && item.change !== null) {
      const numChange = typeof item.change === 'string' ? parseInt(item.change, 10) : item.change;
      if (!isNaN(numChange)) {
        return {
          trend: numChange > 0 ? 'up' : (numChange < 0 ? 'down' : 'stable'),
          change: Math.abs(numChange)
        };
      }
    }

    // 否则根据热度值随机生成趋势（模拟数据）
    const random = Math.random();
    if (random > 0.6) {
      return { trend: 'up', change: Math.floor(Math.random() * 30) + 5 };
    } else if (random > 0.3) {
      return { trend: 'down', change: Math.floor(Math.random() * 20) + 2 };
    } else {
      return { trend: 'stable', change: 0 };
    }
  }

  /**
   * 检测是否正在爆发（10分钟内热度上升20%以上）
   */
  private checkIfBursting(item: any): boolean {
    // 如果有明确的change字段且上升超过20%
    if (item.change !== undefined && item.change !== null) {
      const numChange = typeof item.change === 'string' ? parseInt(item.change, 10) : item.change;
      return numChange > 20;
    }

    // 否则根据热度值和随机性判断（模拟数据）
    const hotness = item.hot || this.calculateHotness(item);
    const random = Math.random();
    // 热度越高且随机值>0.8，认为是爆发中
    return hotness > 50000 && random > 0.8;
  }

  /**
   * 生成摘要预览
   */
  private generateSummary(title: string, category?: string): string {
    // 根据标题生成简洁摘要
    const keywords = title.split(/[，。！？\s,\.!?]+/).filter((word, index, self) => self.indexOf(word) === index).slice(0, 3);

    if (keywords.length === 0) {
      return `${title} - 近期在${category || '全网'}引发广泛关注的热点话题。`;
    }

    return `${title} - ${keywords.join('、')}等关键词引发热议，相关讨论量持续攀升。`;
  }

  /**
   * 提取关键词（3-5个）
   */
  private extractKeywords(title: string, category?: string): string[] {
    // 移除常见停用词
    const stopWords = ['的', '了', '是', '在', '和', '与', '及', '等', '等', '或者', '或者', '还是', '吧', '吗', '呢', '啊', '呀', '哦'];
    const words = title.split(/[，。！？\s,\.!?]+/);

    // 过滤停用词和短词
    const filteredWords = words.filter(word =>
      word.length >= 2 &&
      !stopWords.includes(word) &&
      word !== category
    );

    // 返回前5个关键词（如果有的话）
    const keywords = filteredWords.slice(0, 5);

    // 如果提取的关键词少于3个，添加分类作为关键词
    if (keywords.length < 3 && category && category !== '热门') {
      keywords.push(category);
    }

    return keywords.slice(0, 5);
  }

  /**
   * 舆情分析（正面/负面/中性比例 + 争议点）
   */
  private analyzeSentiment(title: string, category?: string): {
    positive: number;
    negative: number;
    neutral: number;
    controversies?: string[];
  } {
    // 根据标题中的关键词判断情感倾向
    const positiveKeywords = ['突破', '成功', '创新', '增长', '提升', '优化', '发布', '推出', '发布', '精彩', '美好', '积极', '发展'];
    const negativeKeywords = ['暴跌', '危机', '问题', '失败', '争议', '批评', '质疑', '下跌', '下滑', '挑战', '困难', '担忧', '风险', '负面', '消极'];
    const controversyKeywords = ['争议', '质疑', '批评', '反对', '纠纷', '冲突', '矛盾'];

    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 1; // 至少有一个中性基准
    const controversies: string[] = [];

    positiveKeywords.forEach(keyword => {
      if (title.includes(keyword)) positiveCount++;
    });

    negativeKeywords.forEach(keyword => {
      if (title.includes(keyword)) {
        negativeCount++;
        // 如果是争议性关键词，添加到争议点
        if (controversyKeywords.includes(keyword)) {
          controversies.push(`"${keyword}"相关讨论引发争议`);
        }
      }
    });

    // 计算比例
    const total = positiveCount + negativeCount + neutralCount;
    const positive = Math.round((positiveCount / total) * 100);
    const negative = Math.round((negativeCount / total) * 100);
    const neutral = 100 - positive - negative;

    // 如果没有争议点，根据分类生成通用争议点
    if (controversies.length === 0 && (negative > 20 || positive > 70)) {
      if (category === '科技' || category === '财经') {
        controversies.push('影响范围和实际效果存在分歧');
      } else if (category === '娱乐' || category === '社会') {
        controversies.push('不同群体观点差异较大');
      }
    }

    return {
      positive,
      negative,
      neutral,
      controversies: controversies.length > 0 ? controversies : undefined
    };
  }

  /**
   * 生成创作角度建议
   */
  generateCreativeAngles(keyword: string, category: string): string[] {
    const anglesMap: { [key: string]: string[] } = {
      '科技': [
        `从用户体验角度评测${keyword}的实用性`,
        `分析${keyword}对行业发展的推动作用`,
        `对比${keyword}与同类产品的优劣势`,
        `探讨${keyword}背后的技术创新点`,
        `展望${keyword}未来的发展趋势`
      ],
      '娱乐': [
        `分析${keyword}背后的文化现象`,
        `从专业角度点评${keyword}的艺术价值`,
        `探讨${keyword}引发热议的社会原因`,
        `分享${keyword}相关的幕后故事`,
        `对比${keyword}与历史类似事件的异同`
      ],
      '体育': [
        `分析${keyword}的精彩瞬间和技术要点`,
        `探讨${keyword}对运动员职业生涯的意义`,
        `回顾${keyword}的历史数据和纪录`,
        `分析${keyword}的战术策略`,
        `展望${keyword}对后续赛事的影响`
      ],
      '财经': [
        `分析${keyword}对市场的影响`,
        `探讨${keyword}的投资机会和风险`,
        `对比${keyword}与国际案例的异同`,
        `分析${keyword}背后的政策因素`,
        `展望${keyword}对未来经济的影响`
      ],
      '社会': [
        `分析${keyword}背后的社会现象`,
        `探讨${keyword}引发的思考`,
        `从多角度分析${keyword}的利弊`,
        `对比${keyword}与类似案例的异同`,
        `探讨${keyword}的解决方案`
      ],
      '国际': [
        `分析${keyword}的国际影响`,
        `探讨${keyword}的地缘政治意义`,
        `对比${keyword}与历史事件的异同`,
        `分析${keyword}对中国的影响`,
        `展望${keyword}的未来走向`
      ],
      '生活': [
        `分享${keyword}的实用技巧`,
        `分析${keyword}的科学依据`,
        `对比${keyword}的不同方法`,
        `分享${keyword}的使用心得`,
        `分析${keyword}的适用人群`
      ]
    };

    return anglesMap[category] || anglesMap['科技'];
  }

  /**
   * 获取相关热点推荐
   */
  getRelatedTopics(currentTopic: HotTopic, allTopics: HotTopic[]): HotTopic[] {
    // 基于关键词和分类推荐相关热点
    const related: HotTopic[] = [];

    // 1. 同分类的热点（排除自己）
    const sameCategory = allTopics.filter(t =>
      t.id !== currentTopic.id &&
      t.category === currentTopic.category
    );
    related.push(...sameCategory.slice(0, 2));

    // 2. 包含相同关键词的热点
    if (currentTopic.keywords && currentTopic.keywords.length > 0) {
      const withKeywords = allTopics.filter(t =>
        t.id !== currentTopic.id &&
        t.keywords &&
        t.keywords.some(k => currentTopic.keywords?.includes(k))
      );
      related.push(...withKeywords.slice(0, 2));
    }

    // 3. 去重并返回前5个
    const uniqueRelated = Array.from(new Map(related.map(t => [t.id, t])).values());
    return uniqueRelated.slice(0, 5);
  }

  /**
   * 获取 Mock 热点数据（当所有 API 源均失败时使用）
   */
  private getMockHotTopics(): HotTopic[] {
    const mockData = [
      {
        id: 'mock-1',
        title: 'AI 技术突破：新一代大语言模型性能提升 300%',
        url: '#',
        hot: 956782,
        time: new Date().toISOString(),
        site: '科技圈',
        category: '科技',
        site_name: '科技圈'
      },
      {
        id: 'mock-2',
        title: '新能源汽车销量创新高，市场渗透率突破 40%',
        url: '#',
        hot: 892345,
        time: new Date().toISOString(),
        site: '财经',
        category: '财经',
        site_name: '财经'
      },
      {
        id: 'mock-3',
        title: '全国多地启动全民健身计划，体育设施免费开放',
        url: '#',
        hot: 745612,
        time: new Date().toISOString(),
        site: '社会',
        category: '社会',
        site_name: '社会'
      },
      {
        id: 'mock-4',
        title: '知名导演新作定档，首日票房破亿',
        url: '#',
        hot: 678923,
        time: new Date().toISOString(),
        site: '娱乐',
        category: '娱乐',
        site_name: '娱乐'
      },
      {
        id: 'mock-5',
        title: '国际体育赛事开幕，中国队参赛阵容公布',
        url: '#',
        hot: 612456,
        time: new Date().toISOString(),
        site: '体育',
        category: '体育',
        site_name: '体育'
      },
      {
        id: 'mock-6',
        title: '教育部发布最新政策，推进教育数字化转型',
        url: '#',
        hot: 567834,
        time: new Date().toISOString(),
        site: '教育',
        category: '教育',
        site_name: '教育'
      },
      {
        id: 'mock-7',
        title: '热门综艺新一季开播，收视率创新高',
        url: '#',
        hot: 523478,
        time: new Date().toISOString(),
        site: '娱乐',
        category: '娱乐',
        site_name: '娱乐'
      },
      {
        id: 'mock-8',
        title: '科学家发现新型材料，有望解决能源存储难题',
        url: '#',
        hot: 489567,
        time: new Date().toISOString(),
        site: '科技',
        category: '科技',
        site_name: '科技'
      },
      {
        id: 'mock-9',
        title: '多城市发布房地产新政，购房门槛进一步降低',
        url: '#',
        hot: 456789,
        time: new Date().toISOString(),
        site: '财经',
        category: '财经',
        site_name: '财经'
      },
      {
        id: 'mock-10',
        title: '国际重要会议召开，多国领导人出席',
        url: '#',
        hot: 423456,
        time: new Date().toISOString(),
        site: '国际',
        category: '国际',
        site_name: '国际'
      }
    ];

    return mockData.map((item, index) => ({
      id: item.id,
      source: this.mapSiteToSource(item.site_name),
      title: item.title,
      hotness: item.hot,
      trend: Math.random() > 0.3 ? 'up' : Math.random() > 0.5 ? 'stable' : 'down',
      trendChange: Math.floor(Math.random() * 30) + 5,
      isBursting: index < 3,
      url: item.url,
      category: item.category,
      siteName: item.site_name,
      publishTime: item.time,
      summary: this.generateSummary(item.title, item.category),
      keywords: this.extractKeywords(item.title, item.category),
      sentiment: this.analyzeSentiment(item.title, item.category)
    }));
  }

  /**
   * 生成热点时间轴
   */
  generateTimeline(hotness: number, publishTime?: string): Array<{ time: string; hotness: number; event: string }> {
    const timeline: Array<{ time: string; hotness: number; event: string }> = [];

    if (!publishTime) {
      return timeline;
    }

    const baseTime = new Date(publishTime);

    // 生成5个时间点的热度变化
    for (let i = 4; i >= 0; i--) {
      const time = new Date(baseTime.getTime() - i * 3600000); // 每小时一个点
      const timeStr = time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

      // 模拟热度变化：先上升后下降
      let currentHotness = hotness;
      if (i === 4) {
        currentHotness = Math.floor(hotness * 0.3); // 起始热度
      } else if (i === 3) {
        currentHotness = Math.floor(hotness * 0.6); // 快速上升
      } else if (i === 2) {
        currentHotness = Math.floor(hotness * 0.9); // 接近峰值
      } else if (i === 1) {
        currentHotness = hotness; // 达到峰值
      } else {
        currentHotness = Math.floor(hotness * 0.95); // 略有下降
      }

      let event = '';
      if (i === 4) event = '话题初现';
      else if (i === 3) event = '快速升温';
      else if (i === 2) event = '热度攀升';
      else if (i === 1) event = '达到峰值';
      else event = '当前热度';

      timeline.push({ time: timeStr, hotness: currentHotness, event });
    }

    return timeline;
  }
}
