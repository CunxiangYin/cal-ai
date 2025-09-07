#!/bin/bash

# Cal AI - Vercel部署验证脚本

echo "🔍 正在验证Cal AI部署状态..."
echo "================================"
echo ""

# 设置URL
URL="https://frontend-jasonyins-projects.vercel.app"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试健康检查端点
echo "1. 测试健康检查端点..."
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $URL/api/health)

if [ "$HEALTH_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ API健康检查: 正常 (HTTP $HEALTH_STATUS)${NC}"
    HEALTH_DATA=$(curl -s $URL/api/health | python3 -m json.tool 2>/dev/null || echo "无法解析JSON")
    echo "   响应数据:"
    echo "$HEALTH_DATA" | head -5
else
    echo -e "${RED}❌ API健康检查: 需要认证 (HTTP $HEALTH_STATUS)${NC}"
    echo -e "${YELLOW}   请先关闭Vercel部署保护${NC}"
fi

echo ""

# 测试主页
echo "2. 测试前端主页..."
MAIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $URL/)

if [ "$MAIN_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ 前端主页: 可访问 (HTTP $MAIN_STATUS)${NC}"
else
    echo -e "${RED}❌ 前端主页: 需要认证 (HTTP $MAIN_STATUS)${NC}"
    echo -e "${YELLOW}   请先关闭Vercel部署保护${NC}"
fi

echo ""

# 测试API功能
echo "3. 测试食物分析API..."
API_RESPONSE=$(curl -s -X POST $URL/api/analyze-meal \
  -H "Content-Type: application/json" \
  -d '{"message": "测试"}' \
  -w "\n%{http_code}")

API_STATUS=$(echo "$API_RESPONSE" | tail -n 1)
API_BODY=$(echo "$API_RESPONSE" | head -n -1)

if [ "$API_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ 食物分析API: 正常工作 (HTTP $API_STATUS)${NC}"
    echo "   API响应正常"
elif [ "$API_STATUS" = "401" ]; then
    echo -e "${RED}❌ 食物分析API: 需要认证 (HTTP $API_STATUS)${NC}"
    echo -e "${YELLOW}   请先关闭Vercel部署保护${NC}"
else
    echo -e "${YELLOW}⚠️  食物分析API: 状态码 $API_STATUS${NC}"
fi

echo ""
echo "================================"

# 最终状态
if [ "$HEALTH_STATUS" = "200" ] && [ "$MAIN_STATUS" = "200" ]; then
    echo -e "${GREEN}🎉 部署验证成功！${NC}"
    echo ""
    echo "您的Cal AI应用已经可以公开访问："
    echo -e "${GREEN}$URL${NC}"
    echo ""
    echo "您可以："
    echo "1. 访问应用: $URL"
    echo "2. 查看API文档: $URL/api/health"
    echo "3. 分享给其他人使用"
else
    echo -e "${RED}⚠️  部署保护仍然启用${NC}"
    echo ""
    echo "请按以下步骤操作："
    echo "1. 访问 https://vercel.com/dashboard"
    echo "2. 进入项目 'frontend'"
    echo "3. Settings → Deployment Protection"
    echo "4. 将 Vercel Authentication 设为 Disabled"
    echo "5. 保存更改"
    echo ""
    echo "完成后运行此脚本验证："
    echo -e "${YELLOW}./verify-deployment.sh${NC}"
fi