# 部署Cal AI到Vercel

## 前置要求
- Vercel账号 (https://vercel.com)
- GitHub账号
- Claude API密钥 (从Anthropic获取)

## 部署步骤

### 1. 准备代码仓库

首先，将代码推送到GitHub:

```bash
cd cal-app
git init
git add .
git commit -m "Initial commit for Cal AI"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. 在Vercel部署

#### 方法一：通过Vercel CLI（推荐）

1. 安装Vercel CLI:
```bash
npm i -g vercel
```

2. 在项目根目录运行:
```bash
cd cal-app
vercel
```

3. 按照提示操作:
- 选择账号
- 链接到项目
- 选择部署设置

#### 方法二：通过Vercel网站

1. 访问 https://vercel.com/new
2. 导入GitHub仓库
3. 选择 `cal-app` 文件夹作为根目录
4. 框架预设选择 "Next.js"
5. 点击 "Deploy"

### 3. 配置环境变量

在Vercel Dashboard中添加以下环境变量:

1. 进入项目设置 -> Environment Variables
2. 添加以下变量:

```env
# 必需 - Claude API密钥
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# 可选 - OpenAI API密钥（备用）
OPENAI_API_KEY=sk-xxxxx

# AI提供商
AI_PROVIDER=anthropic

# 应用设置
APP_NAME=Cal AI
APP_VERSION=1.0.0
NODE_ENV=production
```

### 4. 更新前端配置

部署成功后，获取你的Vercel URL（例如：https://cal-ai.vercel.app），然后：

1. 在Vercel环境变量中添加:
```env
NEXT_PUBLIC_API_URL=https://cal-ai.vercel.app
NEXT_PUBLIC_USE_BACKEND=true
```

2. 重新部署以应用更改

### 5. 验证部署

访问以下URL验证部署:
- 主页: `https://your-app.vercel.app`
- 健康检查: `https://your-app.vercel.app/api/health`

## 项目结构说明

```
cal-app/
├── api/                    # Vercel Serverless Functions
│   ├── analyze-meal.js    # 食物分析API
│   ├── chat-history.js    # 聊天历史API
│   └── health.js          # 健康检查API
├── frontend/              # Next.js前端
│   ├── app/              # App Router页面
│   ├── components/       # React组件
│   └── lib/             # 工具函数
├── vercel.json           # Vercel配置
└── package.json          # 项目依赖
```

## API端点

部署后的API端点:
- `POST /api/analyze-meal` - 分析食物营养
- `GET /api/chat-history` - 获取聊天历史
- `GET /api/health` - 健康检查

## 故障排除

### 1. API调用失败
- 检查环境变量是否正确设置
- 查看Vercel Functions日志

### 2. CORS错误
- API已配置允许所有来源
- 如需限制，修改api文件中的CORS设置

### 3. 构建失败
- 检查package.json依赖
- 查看Vercel构建日志

### 4. 数据持久化
- 当前使用内存存储（开发用）
- 生产环境建议使用:
  - Vercel KV (Redis)
  - Vercel Postgres
  - Supabase
  - PlanetScale

## 生产环境优化建议

1. **数据库**: 使用Vercel Postgres或Supabase替代内存存储
2. **缓存**: 启用Vercel Edge Cache
3. **监控**: 集成Vercel Analytics
4. **域名**: 绑定自定义域名
5. **环境**: 分离development/staging/production环境

## 本地开发

继续使用本地开发环境:
```bash
cd cal-app
./start.sh
```

## 支持

- Vercel文档: https://vercel.com/docs
- Next.js文档: https://nextjs.org/docs
- 项目问题: 在GitHub仓库提Issue