import { Injectable, BadRequestException } from '@nestjs/common';
import { ASRClient, LLMClient, Config, SearchClient } from 'coze-coding-dev-sdk';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ViralService {
  private asrClient: ASRClient;
  private llmClient: LLMClient;
  private searchClient: SearchClient;

  constructor(private databaseService: DatabaseService) {
    const config = new Config();
    this.asrClient = new ASRClient(config);
    this.llmClient = new LLMClient(config);
    this.searchClient = new SearchClient(config);
  }

  async extractVideo(url: string) {
    console.log('📥 [viral] 开始提取视频:', url);

    // 注意：抖音视频提取需要使用第三方解析 API
    // 由于抖音的反爬机制，直接获取真实视频 URL 需要专业服务
    //
    // 常见的解决方案：
    // 1. 使用第三方抖音解析 API（如 douyin.wtf、douyin.cc 等）
    // 2. 使用无头浏览器（如 Puppeteer）模拟用户行为
    // 3. 使用专业的视频解析服务
    //
    // 在实际应用中，建议：
    // - 调用第三方 API 获取真实视频链接
    // - 下载视频文件
    // - 提取音频（或直接使用视频 URL，ASR 支持视频格式）
    // - 返回音频 URL 供 ASR 使用

    // 这里提供一个模拟的实现，返回说明信息
    // 在生产环境中，需要集成真实的抖音解析服务

    throw new BadRequestException(
      '抖音视频提取功能需要集成第三方解析 API。\n' +
      '请提供直接的音频/视频 URL（如 https://example.com/video.mp3），\n' +
      '或者联系管理员集成抖音解析服务。'
    );

    // 以下是集成示例（伪代码）：
    /*
    try {
      // 调用第三方解析 API
      const parseResponse = await axios.post('https://api.douyin-parser.com/parse', {
        url: url
      });

      const realVideoUrl = parseResponse.data.video_url;
      const audioUrl = realVideoUrl; // ASR 支持直接处理视频文件

      return {
        videoUrl: realVideoUrl,
        audioUrl: audioUrl
      };
    } catch (error) {
      throw new BadRequestException('视频提取失败，请检查链接是否有效');
    }
    */
  }

  async transcribeAudio(audioUrl: string) {
    console.log('🎤 [viral] 开始语音识别:', audioUrl);

    if (!audioUrl) {
      throw new BadRequestException('音频 URL 不能为空');
    }

    try {
      // 使用真实的 ASR 技能进行语音识别
      const result = await this.asrClient.recognize({
        uid: 'user_' + Date.now(),
        url: audioUrl
      });

      console.log('🎤 [viral] 语音识别成功，文本长度:', result.text.length);

      return {
        transcript: result.text,
        duration: result.duration
      };
    } catch (error) {
      console.error('🎤 [viral] 语音识别失败:', error);
      throw new BadRequestException(
        `语音识别失败: ${error.message || '请检查音频 URL 是否有效'}`
      );
    }
  }

  async transcribeAudioFromBase64(base64Audio: string) {
    console.log('🎤 [viral] 开始语音识别（Base64）');

    if (!base64Audio) {
      throw new BadRequestException('音频数据不能为空');
    }

    try {
      // 使用真实的 ASR 技能进行语音识别
      const result = await this.asrClient.recognize({
        uid: 'user_' + Date.now(),
        base64Data: base64Audio
      });

      console.log('🎤 [viral] 语音识别成功，文本长度:', result.text.length);

      return {
        transcript: result.text,
        duration: result.duration
      };
    } catch (error) {
      console.error('🎤 [viral] 语音识别失败:', error);
      throw new BadRequestException(
        `语音识别失败: ${error.message || '请检查音频数据是否有效'}`
      );
    }
  }

  async analyzeContent(transcript: string, platform: string) {
    console.log('🔍 [viral] 开始内容分析:', { platform, transcriptLength: transcript.length });

    if (!transcript || transcript.trim().length === 0) {
      throw new BadRequestException('分析内容不能为空');
    }

    try {
      // 使用豆包大模型进行真实的爆款内容分析
      const systemPrompt = `你是一位专业的短视频内容分析师，擅长分析爆款视频的内容结构和传播逻辑。

请对用户提供的视频文字内容进行深入分析，输出以下结构化信息：

1. **hook（钩子）**：提取视频开头的吸引人的话术或问题（前50字左右）
2. **body（主体要点）**：提取3-5个核心观点或论点，每个要点用一句话概括
3. **climax（高潮）**：提取视频中的情绪高潮或总结性段落
4. **callToAction（行动号召）**：提取视频结尾的引导性话术或号召
5. **framework（框架类型）**：判断内容使用的爆款框架类型（如痛点型、故事型、干货型、情绪型等）
6. **frameworkDescription（框架描述）**：用一句话描述这个框架的特点
7. **keyPoints（关键要点）**：列出3-5个这个内容的成功要素或技巧

请严格按照以下JSON格式输出（不要输出其他内容）：
{
  "structure": {
    "hook": "钩子内容",
    "body": ["要点1", "要点2", "要点3"],
    "climax": "高潮内容",
    "callToAction": "行动号召"
  },
  "framework": {
    "type": "框架类型",
    "description": "框架描述",
    "keyPoints": ["关键要点1", "关键要点2", "关键要点3"]
  }
}`;

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: transcript }
      ];

      console.log('🔍 [viral] 调用豆包大模型分析内容');
      const response = await this.llmClient.invoke(messages, {
        model: 'doubao-seed-1-8-251228',
        temperature: 0.7
      });

      console.log('🔍 [viral] 豆包大模型返回结果:', response.content);

      // 解析 JSON 响应
      let analysisResult;
      try {
        // 提取 JSON 部分（可能包含在代码块中）
        let jsonStr = response.content.trim();
        
        // 移除可能存在的 markdown 代码块标记
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.substring(7);
        }
        if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.substring(3);
        }
        if (jsonStr.endsWith('```')) {
          jsonStr = jsonStr.substring(0, jsonStr.length - 3);
        }
        jsonStr = jsonStr.trim();

        analysisResult = JSON.parse(jsonStr);
      } catch (error) {
        console.error('🔍 [viral] JSON 解析失败:', error);
        console.log('🔍 [viral] 原始响应:', response.content);
        throw new BadRequestException('内容分析失败，AI 返回格式错误');
      }

      // 验证返回的数据结构
      if (!analysisResult.structure || !analysisResult.framework) {
        throw new BadRequestException('内容分析失败，数据结构不完整');
      }

      console.log('🔍 [viral] 内容分析成功:', { 
        frameworkType: analysisResult.framework.type,
        hookLength: analysisResult.structure.hook?.length
      });

      return analysisResult;
    } catch (error) {
      console.error('🔍 [viral] 内容分析失败:', error);
      throw new BadRequestException(
        `内容分析失败: ${error.message || '请稍后重试'}`
      );
    }
  }

  async analyzeDouyinContent(url: string) {
    console.log('📥 [viral] 开始分析抖音链接:', url);

    if (!url || url.trim().length === 0) {
      throw new BadRequestException('抖音链接不能为空');
    }

    try {
      // 第一步：使用 search 获取视频相关信息
      console.log('📥 [viral] 使用 Search 搜索视频信息');
      const searchResponse = await this.searchClient.webSearch(
        `抖音视频 ${url} 文案 内容 文字稿`,
        5,
        true
      );

      console.log('📥 [viral] WebSearch 搜索结果:', searchResponse.web_items?.length || 0, '条');

      // 提取搜索结果中的有用信息
      const searchContext = searchResponse.web_items
        ?.map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}`)
        .join('\n\n') || '';

      // 第二步：使用豆包大模型分析搜索到的真实信息
      const systemPrompt = `你是一位专业的短视频内容分析师，擅长分析抖音视频并提取文字内容。

我会提供：
1. 抖音视频链接
2. 通过搜索引擎获取的该视频相关信息（包括标题、描述、片段等）

你的任务是基于这些真实信息，提取并整理出：

1. **transcript（文字内容）**：根据搜索结果还原视频的完整文字稿（逐字稿）
2. **structure（爆款结构）**：分析视频的内容结构，包括：
   - hook（钩子）：视频开头的吸引人的话术或问题
   - body（主体要点）：3-5个核心观点或论点
   - climax（高潮）：情绪高潮或总结性段落
   - callToAction（行动号召）：结尾的引导性话术或号召
3. **framework（爆款框架）**：判断内容使用的框架类型：
   - type（框架类型）：如痛点型、故事型、干货型、情绪型等
   - description（框架描述）：用一句话描述框架特点
   - keyPoints（关键要点）：3-5个成功要素或技巧

重要提示：
- 请基于提供的搜索结果提取真实内容，不要编造
- 如果搜索结果信息不足，请在transcript中注明"根据搜索结果，该视频主要内容关于..."
- 确保返回的JSON格式正确

请严格按照以下JSON格式输出（不要输出其他内容）：
{
  "transcript": "视频讲述的完整文字内容（基于搜索结果）",
  "structure": {
    "hook": "钩子内容",
    "body": ["要点1", "要点2", "要点3"],
    "climax": "高潮内容",
    "callToAction": "行动号召"
  },
  "framework": {
    "type": "框架类型",
    "description": "框架描述",
    "keyPoints": ["关键要点1", "关键要点2", "关键要点3"]
  }
}`;

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: `抖音视频链接：${url}\n\n搜索获取的相关信息：\n${searchContext}` }
      ];

      console.log('📥 [viral] 调用豆包大模型分析搜索信息');
      const response = await this.llmClient.invoke(messages, {
        model: 'doubao-seed-1-8-251228',
        temperature: 0.3  // 降低温度，让输出更基于事实
      });

      console.log('📥 [viral] 豆包大模型返回结果:', response.content);

      // 解析 JSON 响应
      let analysisResult;
      try {
        // 提取 JSON 部分（可能包含在代码块中）
        let jsonStr = response.content.trim();
        
        // 移除可能存在的 markdown 代码块标记
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.substring(7);
        }
        if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.substring(3);
        }
        if (jsonStr.endsWith('```')) {
          jsonStr = jsonStr.substring(0, jsonStr.length - 3);
        }
        jsonStr = jsonStr.trim();

        analysisResult = JSON.parse(jsonStr);
      } catch (error) {
        console.error('📥 [viral] JSON 解析失败:', error);
        console.log('📥 [viral] 原始响应:', response.content);
        throw new BadRequestException('抖音链接分析失败，AI 返回格式错误');
      }

      // 验证返回的数据结构
      if (!analysisResult.transcript || !analysisResult.structure || !analysisResult.framework) {
        throw new BadRequestException('抖音链接分析失败，数据结构不完整');
      }

      console.log('📥 [viral] 抖音链接分析成功:', { 
        transcriptLength: analysisResult.transcript.length,
        frameworkType: analysisResult.framework.type
      });

      return analysisResult;
    } catch (error) {
      console.error('📥 [viral] 抖音链接分析失败:', error);
      throw new BadRequestException(
        `抖音链接分析失败: ${error.message || '请稍后重试'}`
      );
    }
  }

  // 收藏爆款框架
  async favoriteFramework(userId: string | null | undefined, title: string, structure: any, framework: any) {
    console.log('❤️ [viral] 收藏爆款框架:', { userId, title });

    if (!title || !structure || !framework) {
      throw new BadRequestException('收藏数据不完整');
    }

    try {
      const client = this.databaseService.getClient();

      // 生成 UUID
      const id = crypto.randomUUID();

      const { data, error } = await client
        .from('viral_favorites')
        .insert({
          id,
          user_id: userId,
          title,
          structure,
          framework
        })
        .select()
        .single();

      if (error) {
        console.error('❤️ [viral] 收藏失败:', error);
        throw new BadRequestException(`收藏失败: ${error.message}`);
      }

      console.log('❤️ [viral] 收藏成功:', data.id);

      return { id: data.id };
    } catch (error) {
      console.error('❤️ [viral] 收藏异常:', error);
      throw new BadRequestException(
        `收藏失败: ${error.message || '请稍后重试'}`
      );
    }
  }

  // 获取收藏列表
  async getFavorites(userId: string | null | undefined) {
    console.log('📋 [viral] 获取收藏列表:', { userId });

    try {
      const client = this.databaseService.getClient();

      const { data, error } = await client
        .from('viral_favorites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('📋 [viral] 获取收藏列表失败:', error);
        throw new BadRequestException(`获取失败: ${error.message}`);
      }

      console.log('📋 [viral] 收藏列表数量:', data?.length || 0);

      return data || [];
    } catch (error) {
      console.error('📋 [viral] 获取收藏列表异常:', error);
      throw new BadRequestException(
        `获取失败: ${error.message || '请稍后重试'}`
      );
    }
  }

  // 二创改写 - 生成2个方案
  async remixContent(data: {
    transcript: string
    structure: any
    framework: any
    remixIdea: string
    lexiconContents: string
    style?: 'douyin' | 'xiaohongshu' | 'shipinhao' | 'gongzhonghao' | 'pyq'
  }) {
    const { transcript, structure, framework, remixIdea, lexiconContents, style } = data

    console.log('🚀 [viral] 开始二创改写:', {
      transcriptLength: transcript.length,
      frameworkType: framework.type,
      ideaLength: remixIdea.length,
      lexiconContentLength: lexiconContents?.length || 0,
      style: style
    });

    if (!transcript || !structure || !framework || !remixIdea) {
      throw new BadRequestException('二创改写数据不完整');
    }

    try {
      // 结合语料库内容生成2个不同的二创方案
      let lexiconContext = ''
      if (lexiconContents && lexiconContents.trim()) {
        lexiconContext = `\n\n【可参考的语料库内容】：\n${lexiconContents}`
      }

      // 风格映射
      const styleMap: Record<string, string> = {
        douyin: '抖音风格',
        xiaohongshu: '小红书风格',
        shipinhao: '视频号风格',
        gongzhonghao: '公众号文章风格',
        pyq: '微信朋友圈风格'
      };

      // 标题字数限制和特点
      const titleConfigMap: Record<string, { min: number; max: number; tips: string }> = {
        douyin: { 
          min: 15, 
          max: 25, 
          tips: '抖音标题要简洁有力，使用悬念、数字、疑问句等吸引点击，避免过长被截断' 
        },
        xiaohongshu: { 
          min: 15, 
          max: 30, 
          tips: '小红书标题要突出关键词，使用emoji表情，展示干货或价值，吸引点击收藏' 
        },
        shipinhao: { 
          min: 10, 
          max: 30, 
          tips: '视频号标题要简洁明了，直接传达核心信息，适合中老年用户群体' 
        },
        gongzhonghao: { 
          min: 20, 
          max: 30, 
          tips: '公众号标题要专业、有价值，避免标题党，体现文章核心观点，最多64字' 
        },
        pyq: { 
          min: 20, 
          max: 30, 
          tips: '朋友圈没有严格标题，开头要吸引眼球，建议用一两句话作为"标题"吸引注意力' 
        }
      };

      const selectedStyle = style ? styleMap[style] : '通用风格';
      const titleConfig = style ? titleConfigMap[style] : { min: 10, max: 30, tips: '标题要简洁有力，吸引人注意' };

      const systemPrompt = `你是一位专业的新媒体内容创作专家，擅长基于爆款内容进行二创改写。

你的任务：基于提取的文案、爆款框架和改写想法，生成2个不同的二创方案。

要求：
1. 方案A和方案B要有明显区别，侧重不同角度或表达方式
2. 方案A：保留原有情感基调，优化表达，增强感染力
3. 方案B：采用新的角度或风格，创造新鲜感
4. 两个方案都要符合改写想法的指导方向
5. 适当融入语料库中的优质表达方式
6. 保持爆款框架的核心逻辑结构
7. 按照${selectedStyle}的写作特点进行创作
8. 每个方案控制在300-500字之间
9. 标题字数严格控制在${titleConfig.min}-${titleConfig.max}字之间
10. ${selectedStyle}标题特点：${titleConfig.tips}

输出格式（必须严格按照此格式输出，使用JSON）：
{
  "schemes": [
    {
      "title": "方案的吸引人标题（${titleConfig.min}-${titleConfig.max}字）",
      "content": "方案的完整文案内容",
      "tags": ["标签1", "标签2", "标签3"]
    },
    {
      "title": "方案的吸引人标题（${titleConfig.min}-${titleConfig.max}字）",
      "content": "方案的完整文案内容",
      "tags": ["标签1", "标签2", "标签3"]
    }
  ]
}

注意：
- 标题必须严格控制在${titleConfig.min}-${titleConfig.max}字之间，超出会被平台截断
- ${selectedStyle}标题特点：${titleConfig.tips}
- 内容要生动有趣，有感染力
- 标签要准确概括内容特点，3-5个
- 必须返回合法的JSON格式，不要有其他文字`;

      const userPrompt = `【提取的文案】：
${transcript}

【爆款框架】：
类型：${framework.type}
描述：${framework.description}
关键点：${framework.keyPoints?.join('、') || ''}

【改写想法】：
${remixIdea}${lexiconContext}

请基于以上信息，生成2个二创方案。确保返回的是合法的JSON格式。`;

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: userPrompt }
      ];

      console.log('🚀 [viral] 调用豆包大模型生成二创内容');
      const response = await this.llmClient.invoke(messages, {
        model: 'doubao-seed-1-8-251228',
        temperature: 0.8
      });

      console.log('🚀 [viral] 豆包大模型返回结果:', response.content);

      // 解析返回的 JSON 格式方案
      let parsedResponse;
      try {
        // 尝试直接解析 JSON
        const content = response.content.trim();

        // 尝试提取 JSON 部分（如果有 Markdown 代码块）
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
        const jsonString = jsonMatch ? jsonMatch[1] : content;

        parsedResponse = JSON.parse(jsonString);

        console.log('🚀 [viral] 方案解析成功:', parsedResponse);
      } catch (error) {
        console.error('🚀 [viral] JSON 解析失败:', error, response.content);

        // 如果 JSON 解析失败，尝试从文本中提取方案（兼容旧格式）
        const content = response.content.trim();
        const schemeA = content.match(/【方案 A】([\s\S]*?)(?=【方案 B】|$)/)?.[1]?.trim() || '';
        const schemeB = content.match(/【方案 B】([\s\S]*?)$/)?.[1]?.trim() || '';

        if (!schemeA && !schemeB) {
          throw new BadRequestException('二创内容解析失败');
        }

        parsedResponse = {
          schemes: [
            {
              title: `方案 A`,
              content: schemeA,
              tags: ['二创', '改写']
            },
            {
              title: `方案 B`,
              content: schemeB,
              tags: ['二创', '改写']
            }
          ]
        };
      }

      if (!parsedResponse.schemes || !Array.isArray(parsedResponse.schemes)) {
        throw new BadRequestException('二创内容格式错误');
      }

      console.log('🚀 [viral] 二创内容生成成功:', {
        schemesCount: parsedResponse.schemes.length
      });

      return {
        schemes: parsedResponse.schemes
      };
    } catch (error) {
      console.error('🚀 [viral] 二创改写失败:', error);
      throw new BadRequestException(
        `二创改写失败: ${error.message || '请稍后重试'}`
      );
    }
  }

  // AI 优化改写想法表述
  async optimizeIdea(idea: string, transcript?: string, style?: 'douyin' | 'xiaohongshu' | 'shipinhao' | 'gongzhonghao' | 'pyq') {
    console.log('🪄 [viral] 开始优化改写想法:', { ideaLength: idea.length, transcriptLength: transcript?.length || 0, style });

    if (!idea || idea.trim().length === 0) {
      throw new BadRequestException('改写想法不能为空');
    }

    try {
      // 风格映射
      const styleMap: Record<string, string> = {
        douyin: '抖音',
        xiaohongshu: '小红书',
        shipinhao: '视频号',
        gongzhonghao: '公众号',
        pyq: '朋友圈'
      };

      const selectedStyle = style ? styleMap[style] : null;

      const systemPrompt = `你是一位专业的内容策划专家，擅长优化和润色改写想法的表述。

你的任务：优化用户的改写想法，使其更加清晰、具体、可执行。

要求：
1. 保持原意，但表述更专业、更明确
2. 增加具体的执行方向或角度
3. 使用更精准的词汇和表达
4. 优化后的想法要便于AI理解和执行
5. 长度控制在100-200字之间
${selectedStyle ? `6. 针对${selectedStyle}平台的特点进行优化\n7. 考虑${selectedStyle}用户的喜好和阅读习惯` : ''}

直接输出优化后的想法（不需要其他说明）：`;

      const userPrompt = `原始改写想法：${idea}
${transcript ? `\n参考文案：\n${transcript.substring(0, 500)}...` : ''}
${selectedStyle ? `\n目标平台风格：${selectedStyle}` : ''}

请优化这个改写想法。`;

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: userPrompt }
      ];

      console.log('🪄 [viral] 调用豆包大模型优化改写想法');
      const response = await this.llmClient.invoke(messages, {
        model: 'doubao-seed-1-8-251228',
        temperature: 0.3
      });

      console.log('🪄 [viral] 优化结果:', response.content);

      // 清理返回的内容
      let optimizedIdea = response.content.trim();
      
      // 移除可能存在的 markdown 代码块标记
      if (optimizedIdea.startsWith('```')) {
        const lines = optimizedIdea.split('\n');
        lines.shift();
        if (lines[lines.length - 1].trim() === '```') {
          lines.pop();
        }
        optimizedIdea = lines.join('\n').trim();
      }

      return { optimizedIdea };
    } catch (error) {
      console.error('🪄 [viral] 优化改写想法失败:', error);
      throw new BadRequestException(
        `优化失败: ${error.message || '请稍后重试'}`
      );
    }
  }
}
