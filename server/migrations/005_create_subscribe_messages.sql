-- 订阅消息表
CREATE TABLE IF NOT EXISTS subscribe_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id VARCHAR(50) NOT NULL COMMENT '系统内部模板ID',
  wx_template_id VARCHAR(50) NOT NULL COMMENT '微信模板ID',
  openid VARCHAR(100) NOT NULL COMMENT '用户openid',
  subscribed_at TIMESTAMPTZ DEFAULT NOW() COMMENT '订阅时间',
  used BOOLEAN DEFAULT FALSE COMMENT '是否已使用',
  used_at TIMESTAMPTZ COMMENT '使用时间',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_subscribe_messages_user_id ON subscribe_messages(user_id);
CREATE INDEX idx_subscribe_messages_template_id ON subscribe_messages(template_id);
CREATE INDEX idx_subscribe_messages_used ON subscribe_messages(used);
CREATE INDEX idx_subscribe_messages_openid ON subscribe_messages(openid);

-- 注释
COMMENT ON TABLE subscribe_messages IS '订阅消息记录表';
COMMENT ON COLUMN subscribe_messages.user_id IS '用户ID';
COMMENT ON COLUMN subscribe_messages.template_id IS '系统内部模板ID，如 live_reminder';
COMMENT ON COLUMN subscribe_messages.wx_template_id IS '微信公众平台的模板ID';
COMMENT ON COLUMN subscribe_messages.openid IS '用户微信openid';
COMMENT ON COLUMN subscribe_messages.subscribed_at IS '订阅时间';
COMMENT ON COLUMN subscribe_messages.used IS '是否已使用（一次性订阅用完即标记为true）';
COMMENT ON COLUMN subscribe_messages.used_at IS '消息发送时间';

-- 触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscribe_messages_updated_at
    BEFORE UPDATE ON subscribe_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
