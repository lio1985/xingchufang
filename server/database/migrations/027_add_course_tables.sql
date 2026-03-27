-- ===================================
-- 课程管理相关表
-- ===================================

-- 1. 课程分类表 (course_categories)
CREATE TABLE IF NOT EXISTS course_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_course_categories_status ON course_categories(status);
CREATE INDEX IF NOT EXISTS idx_course_categories_sort ON course_categories(sort_order);

-- 2. 课程表 (courses)
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  content TEXT, -- 文字/图文内容
  category_id UUID REFERENCES course_categories(id) ON DELETE SET NULL,
  content_type VARCHAR(50) DEFAULT 'text' CHECK (content_type IN ('text', 'image_text', 'pdf', 'ppt', 'video', 'other')),
  cover_image TEXT, -- 封面图片URL
  file_url TEXT, -- 文件下载URL（PDF、PPT等）
  file_name VARCHAR(255), -- 原始文件名
  file_size BIGINT, -- 文件大小（字节）
  duration INTEGER DEFAULT 0, -- 预计学习时长（分钟）
  difficulty VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  view_count INTEGER DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  tags TEXT[],
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_content_type ON courses(content_type);
CREATE INDEX IF NOT EXISTS idx_courses_created_by ON courses(created_by);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);

-- 3. 课程学习记录表 (course_learnings)
CREATE TABLE IF NOT EXISTS course_learnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0, -- 学习进度（0-100）
  status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  last_position INTEGER DEFAULT 0, -- 最后学习位置（页码/秒数）
  time_spent INTEGER DEFAULT 0, -- 累计学习时长（分钟）
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_course_learnings_course ON course_learnings(course_id);
CREATE INDEX IF NOT EXISTS idx_course_learnings_user ON course_learnings(user_id);
CREATE INDEX IF NOT EXISTS idx_course_learnings_status ON course_learnings(status);

-- 4. 课程评论表 (course_comments)
CREATE TABLE IF NOT EXISTS course_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_course_comments_course ON course_comments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_comments_user ON course_comments(user_id);

-- 5. 课程收藏表 (course_favorites)
CREATE TABLE IF NOT EXISTS course_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_course_favorites_user ON course_favorites(user_id);

-- 触发器：自动更新 updated_at 字段
DROP TRIGGER IF EXISTS update_course_categories_updated_at ON course_categories;
CREATE TRIGGER update_course_categories_updated_at BEFORE UPDATE ON course_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_learnings_updated_at ON course_learnings;
CREATE TRIGGER update_course_learnings_updated_at BEFORE UPDATE ON course_learnings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_comments_updated_at ON course_comments;
CREATE TRIGGER update_course_comments_updated_at BEFORE UPDATE ON course_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用 RLS
ALTER TABLE course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_learnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_favorites ENABLE ROW LEVEL SECURITY;

-- 课程分类策略：所有人可读，管理员可写
CREATE POLICY "允许所有人读取课程分类" ON course_categories
  FOR SELECT USING (true);

CREATE POLICY "允许管理员管理课程分类" ON course_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'super_admin')
    )
  );

-- 课程策略：已发布的课程所有人可读，管理员可写
CREATE POLICY "允许所有人读取已发布课程" ON courses
  FOR SELECT USING (status = 'published' OR
                   created_by = auth.uid() OR
                   EXISTS (
                     SELECT 1 FROM users u
                     WHERE u.id = auth.uid()
                     AND u.role IN ('admin', 'super_admin')
                   ));

CREATE POLICY "允许管理员管理课程" ON courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'super_admin')
    )
  );

-- 课程学习记录策略：用户只能管理自己的记录
CREATE POLICY "允许用户查看自己的学习记录" ON course_learnings
  FOR SELECT USING (user_id = auth.uid() OR
                   EXISTS (
                     SELECT 1 FROM users u
                     WHERE u.id = auth.uid()
                     AND u.role IN ('admin', 'super_admin')
                   ));

CREATE POLICY "允许用户管理自己的学习记录" ON course_learnings
  FOR ALL USING (user_id = auth.uid());

-- 课程评论策略
CREATE POLICY "允许所有人查看评论" ON course_comments
  FOR SELECT USING (status = 'active' OR
                   user_id = auth.uid() OR
                   EXISTS (
                     SELECT 1 FROM users u
                     WHERE u.id = auth.uid()
                     AND u.role IN ('admin', 'super_admin')
                   ));

CREATE POLICY "允许用户创建评论" ON course_comments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "允许用户更新自己的评论" ON course_comments
  FOR UPDATE USING (user_id = auth.uid() OR
                   EXISTS (
                     SELECT 1 FROM users u
                     WHERE u.id = auth.uid()
                     AND u.role IN ('admin', 'super_admin')
                   ));

-- 课程收藏策略
CREATE POLICY "允许用户查看自己的收藏" ON course_favorites
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "允许用户管理自己的收藏" ON course_favorites
  FOR ALL USING (user_id = auth.uid());

-- 插入默认课程分类
INSERT INTO course_categories (name, description, sort_order) VALUES
  ('产品知识', '产品相关知识培训', 1),
  ('销售技巧', '销售技能提升课程', 2),
  ('管理培训', '团队管理、领导力培训', 3),
  ('技术培训', '产品使用技术培训', 4),
  ('企业文化', '企业价值观与文化培训', 5),
  ('其他', '其他类型课程', 99);

-- 完成提示
DO $$
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE '课程管理表创建完成！';
  RAISE NOTICE '====================================';
  RAISE NOTICE '已创建的表：';
  RAISE NOTICE '  - course_categories (课程分类表)';
  RAISE NOTICE '  - courses (课程表)';
  RAISE NOTICE '  - course_learnings (课程学习记录表)';
  RAISE NOTICE '  - course_comments (课程评论表)';
  RAISE NOTICE '  - course_favorites (课程收藏表)';
  RAISE NOTICE '====================================';
END $$;
