# 用药记录管理

一个用于记录每日用药情况的 Web 应用。

![药品记录管理](https://github.com/ZeroOneCN/Medication/blob/main/image/%E8%8D%AF%E5%93%81%E8%AE%B0%E5%BD%95%E7%AE%A1%E7%90%86.png "药品记录管理")

## 功能特点

- 记录每日用药情况（早餐、午餐、晚餐）
- 支持添加、编辑、删除记录
- 支持导出数据为 CSV 格式
- 支持导入 CSV 数据
- 支持按日期、药品名称、用量范围筛选数据
- 提供用药统计功能（今日、本周、本月）
- 提供用药趋势图表
- 响应式设计，适配移动端

## 技术栈

### 前端

- Vue 3
- Ant Design Vue
- Vite
- Pinia
- Axios
- Dayjs (日期处理)
- ECharts (图表展示)

### 后端

- Node.js
- Express
- MySQL

## 开发环境设置

### 前端

```bash
cd Medication
npm install
npm run dev
```

### 后端

```bash
cd Medication/server
npm install
npm run dev
```

### 数据库配置

1. 确保 MySQL 服务已启动

2. 修改 `server/config/db.js` 文件中的数据库配置：
   
   ```javascript
   const dbConfig = {
   host: 'localhost',     // 数据库主机地址
   user: 'your_db_user',  // 数据库用户名
   password: 'your_db_password', // 数据库密码
   database: 'medication_db'     // 数据库名称
   }
   ```

3. 执行 `server/config/init.sql` 脚本创建数据库和表

## 部署说明

### 前端部署

1. 构建生产环境代码：
   
   ```bash
   cd Medication
   npm run build
   ```

2. 将 `dist` 目录下的文件部署到 Web 服务器（如 Nginx）

### 后端部署

1. 安装 PM2 进程管理工具：
   
   ```bash
   npm install -g pm2
   ```

2. 启动后端服务：
   
   ```bash
   cd Medication/server
   pm2 start server.js --name medication-server
   ```

3. 配置 Nginx 反向代理（可选）：
   
   ```nginx
   server {
    listen 80;
    server_name your_domain.com;
   
    location / {
        root /path/to/your/dist;
        try_files $uri $uri/ /index.html;
    }
   
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
   }
   ```

## 使用说明

1. 启动后端服务（默认端口 3001）
2. 启动前端开发服务器（默认端口 3000）
3. 访问 http://localhost:3000 使用应用

## 数据导入模板

CSV 文件应包含以下列：

- date (日期，格式：YYYY-MM-DD)
- medicineName (药品名称)
- breakfast (早餐用量)
- lunch (午餐用量)
- dinner (晚餐用量)

## 项目结构

```
Medication/
├── src/                    # 前端源代码
│   ├── components/         # Vue 组件
│   ├── views/             # 页面视图
│   ├── api/               # API 接口
│   ├── store/             # Pinia 状态管理
│   └── App.vue            # 根组件
├── server/                 # 后端源代码
│   ├── config/            # 配置文件
│   │   ├── db.js          # 数据库配置
│   │   └── init.sql       # 数据库初始化脚本
│   ├── routes/            # 路由处理
│   └── server.js          # 服务器入口
└── README.md              # 项目文档
```
