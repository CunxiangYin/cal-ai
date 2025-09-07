# 🍽️ Cal AI - 智能卡路里追踪应用

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black" alt="Next.js"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Claude-AI-purple" alt="Claude AI"/>
  <img src="https://img.shields.io/badge/Vercel-Ready-black" alt="Vercel"/>
</p>

一个基于AI的智能卡路里追踪应用，支持自然语言输入和语音识别，自动分析食物营养成分。

## ✨ 功能特点

- 🤖 **AI智能分析** - 使用Claude/OpenAI分析食物描述，自动计算卡路里
- 🎤 **语音输入** - 支持语音转文字，方便快速记录
- 📊 **营养分析** - 详细的营养成分分解（卡路里、蛋白质、碳水、脂肪）
- 💬 **对话界面** - 自然的聊天式交互体验
- 📱 **移动优先** - 响应式设计，完美支持手机端
- 🌏 **双语支持** - 支持中文和英文食物描述

## 🛠️ 技术栈

### 前端
- **Next.js 14** - React框架
- **TypeScript** - 类型安全
- **shadcn/ui** - 现代UI组件库
- **Tailwind CSS** - 样式框架
- **Zustand** - 状态管理

### 后端
- **FastAPI** - 高性能Python Web框架
- **SQLAlchemy** - ORM数据库管理
- **Pydantic** - 数据验证
- **Claude/OpenAI API** - AI营养分析

## 🚀 快速开始

### 本地开发

```bash
# 1. 克隆项目
git clone YOUR_REPO_URL
cd cal-app

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，添加你的 ANTHROPIC_API_KEY

# 3. 一键启动
./start.sh
```

应用将自动启动在：
- 前端：http://localhost:3000
- 后端API：http://localhost:8000
- API文档：http://localhost:8000/docs

### 🌐 部署到Vercel

```bash
# 快速部署
./deploy.sh
```

或手动部署：
1. Fork这个仓库到GitHub
2. 访问 [Vercel](https://vercel.com/new)
3. 导入GitHub仓库
4. 添加环境变量 `ANTHROPIC_API_KEY`
5. 点击Deploy

详细说明见 [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)

### 方式二：分别启动

#### 启动后端

```bash
cd backend

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，添加API密钥

# 启动服务
python main.py
```

#### 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 📖 使用指南

1. **记录食物**
   - 在输入框中输入你吃的食物，例如："我吃了两个鸡蛋和一片吐司"
   - 或按住语音按钮说话

2. **查看分析**
   - AI会自动分析并显示：
     - 总卡路里
     - 蛋白质、碳水化合物、脂肪含量
     - 每种食物的详细分解
     - 营养建议

3. **查看历史**
   - 所有对话记录自动保存
   - 可以查看之前的饮食记录和分析

## 🔧 配置说明

### 后端配置 (backend/.env)

```env
# AI服务配置（选择其一）
ANTHROPIC_API_KEY=your_claude_api_key
OPENAI_API_KEY=your_openai_api_key

# 数据库配置
DATABASE_URL=sqlite:///./cal_ai.db

# 服务配置
HOST=0.0.0.0
PORT=8000
```

### 前端配置 (frontend/.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_USE_BACKEND=true  # false使用模拟数据
```

## 📁 项目结构

```
cal-app/
├── frontend/               # Next.js前端应用
│   ├── app/               # 页面和布局
│   ├── components/        # React组件
│   │   ├── chat/         # 聊天相关组件
│   │   ├── layout/       # 布局组件
│   │   └── nutrition/    # 营养显示组件
│   ├── lib/              # 工具函数和API客户端
│   └── hooks/            # 自定义React Hooks
│
├── backend/               # FastAPI后端服务
│   ├── app/
│   │   ├── api/          # API路由
│   │   ├── models/       # 数据库模型
│   │   ├── schemas/      # Pydantic模式
│   │   └── services/     # 业务逻辑
│   └── main.py          # 应用入口
│
└── start.sh             # 一键启动脚本
```

## 🧪 测试

```bash
# 测试后端API
cd backend
python test_api.py

# 测试前端
cd frontend
npm test
```

## 🐳 Docker部署

```bash
# 使用Docker Compose
cd backend
docker-compose up
```

## 📝 API文档

启动后端服务后，访问 http://localhost:8000/docs 查看完整的API文档。

主要接口：
- `POST /api/analyze-meal` - 分析餐食卡路里
- `GET /api/chat-history` - 获取聊天历史
- `POST /api/voice-to-text` - 语音转文字

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License