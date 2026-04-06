# 火锅外卖H5商城项目

## 项目路径
`c:/Users/wanme/WorkBuddy/Claw/`

## 项目结构
- `server.js` - Node.js后端服务器 (端口3000)
- `index.html` - 商城首页 (动态数据)
- `admin.html` - 管理员后台
- `database.json` - SQLite数据库
- `images/` - 商品图片目录

## 图片来源
`C:/Users/wanme/Downloads/火锅外卖H5/images/`

## 功能
- 动态加载轮播图、商品、分类
- 购物车功能
- 订单系统
- 管理员后台 (账号:admin 密码:admin123)
- 会员系统（按手机号识别）
- 权限分级：管理员 vs 会员

## 权限分级
- **管理员**: 可访问 admin.html 全部功能（概览/订单/商品/库存/财务/配送/会员/轮播）
- **会员**: 通过 index.html 登录，只能查看自己的订单和个人信息

## 登录入口（统一入口）
- **统一登录页**: index.html 登录页只有一个登录表单
  - 输入手机号/邮箱/管理员账号
  - 系统自动识别身份：先尝试管理员，再尝试会员
  - 管理员 admin/admin123 登录后跳转 admin.html
  - 会员登录后进入会员中心
- **admin.html**: 不再有独立登录页，未登录自动跳转回 index.html

## 部署
- 本地: http://localhost:3000
- Cloudflare Tunnel: https://deemed-lid-badly-broader.trycloudflare.com

## 版本管理策略
- **main**: 开发分支（继续开发/修复）
- **release**: 稳定发布分支（只合并确认没问题的代码）
- **v1.0-stable**: 稳定版本标签（页面导航修复后的快照）

### 合并流程
1. 功能/修复在 main 开发
2. 测试通过后合并到 release
3. 如需回退：`git checkout release` 或 `git checkout v1.0-stable`

### 注意事项
- 修改页面导航相关逻辑（showPage/goBack/popstate/localStorage）时影响范围广
- 改完后需要测试：所有页面的刷新、返回、前进/后退组合
- 建议先说明改动范围，让老徐帮忙把关
