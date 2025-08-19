# 开票申请系统 - Jetty 集成指南

## 📦 打包构建

### 1. 生产环境打包
```bash
npm run build:prod
```

构建完成后，会在 `dist` 目录生成以下文件结构：
```
dist/
├── index.html              # 主页面
├── static/
│   ├── js/
│   │   ├── index-[hash].js    # 主应用代码
│   │   └── vendor-[hash].js   # Vue.js 等依赖库
│   └── css/
│       └── index-[hash].css   # 样式文件
└── vite.svg                # 图标文件
```

## 🚀 Jetty 集成方案

### 方案一：独立部署（推荐）

#### 1. 静态资源部署
将 `dist` 目录下的所有文件复制到 Jetty 的 webapps 目录：

```bash
# 假设您的 Jetty 应用路径为 /your-jetty-app
cp -r dist/* /path/to/jetty/webapps/your-app/invoice/
```

#### 2. 访问路径
应用将可通过以下路径访问：
```
http://your-domain/your-app/invoice/
```

#### 3. Jetty 配置示例
在您的 `web.xml` 中添加静态资源映射：

```xml
<!-- 静态资源配置 -->
<servlet>
    <servlet-name>DefaultServlet</servlet-name>
    <servlet-class>org.eclipse.jetty.servlet.DefaultServlet</servlet-class>
    <init-param>
        <param-name>resourceBase</param-name>
        <param-value>/invoice</param-value>
    </init-param>
    <init-param>
        <param-name>pathInfoOnly</param-name>
        <param-value>true</param-value>
    </init-param>
</servlet>

<servlet-mapping>
    <servlet-name>DefaultServlet</servlet-name>
    <url-pattern>/invoice/*</url-pattern>
</servlet-mapping>
```

### 方案二：嵌入到现有页面

#### 1. 提取关键文件
从构建产物中提取以下文件到您的 Jetty 应用：
- `static/js/index-[hash].js`
- `static/js/vendor-[hash].js` 
- `static/css/index-[hash].css`

#### 2. 在现有页面中引入
```html
<!DOCTYPE html>
<html>
<head>
    <title>您的应用 - 开票申请</title>
    <link rel="stylesheet" href="/static/css/index-[hash].css">
</head>
<body>
    <!-- 您的现有页面内容 -->
    
    <!-- 开票申请应用容器 -->
    <div id="invoice-app"></div>
    
    <!-- 引入 Vue 应用 -->
    <script src="/static/js/vendor-[hash].js"></script>
    <script src="/static/js/index-[hash].js"></script>
    
    <script>
        // 初始化应用到指定容器
        // Vue 应用会自动挂载到 #app，需要修改挂载点
    </script>
</body>
</html>
```

#### 3. 修改挂载点（如需要）
如果需要修改应用挂载点，编辑 `src/main.ts`：

```typescript
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#invoice-app') // 修改为您想要的容器ID
```

### 方案三：iframe 嵌入

#### 1. 独立部署应用
按方案一部署应用

#### 2. 在现有页面中嵌入 iframe
```html
<iframe 
    src="/invoice/" 
    width="100%" 
    height="600px" 
    frameborder="0"
    style="border: none; border-radius: 8px;">
</iframe>
```

## 🔧 后端 API 集成

### 1. 创建 Java API 接口

```java
@RestController
@RequestMapping("/api/invoice")
public class InvoiceController {
    
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getOrders() {
        // 返回订单列表
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/orders/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable String id) {
        // 返回订单详情
        Order order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }
    
    @PostMapping("/request")
    public ResponseEntity<InvoiceResponse> submitInvoiceRequest(
            @RequestBody InvoiceRequest request) {
        // 处理开票申请
        boolean success = invoiceService.submitRequest(request);
        InvoiceResponse response = new InvoiceResponse(success, "申请提交成功");
        return ResponseEntity.ok(response);
    }
}
```

### 2. 配置 CORS（如果前后端分离）

```java
@Configuration
public class CorsConfig {
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOriginPattern("*");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

### 3. 修改前端 API 基础路径

创建环境配置文件：

```typescript
// src/config/api.ts
const API_BASE_URL = import.meta.env.PROD 
    ? '/api'  // 生产环境使用相对路径
    : 'http://localhost:8080/api'  // 开发环境跨域请求

export { API_BASE_URL }
```

更新服务文件以使用真实 API：

```typescript
// src/services/orderService.ts
import { API_BASE_URL } from '../config/api'

export const orderService = {
    async getOrders(): Promise<Order[]> {
        const response = await fetch(`${API_BASE_URL}/invoice/orders`)
        return response.json()
    },
    
    async getOrderById(id: string): Promise<Order | null> {
        const response = await fetch(`${API_BASE_URL}/invoice/orders/${id}`)
        return response.json()
    },
    
    async submitInvoiceRequest(request: any) {
        const response = await fetch(`${API_BASE_URL}/invoice/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request)
        })
        return response.json()
    }
}
```

## 📋 部署检查清单

### 打包前检查
- [ ] 确认所有功能正常工作
- [ ] 移除或禁用调试代码
- [ ] 检查 API 路径配置
- [ ] 测试移动端兼容性

### 部署时检查
- [ ] 确认静态资源路径正确
- [ ] 测试 API 接口连通性
- [ ] 验证 CORS 配置
- [ ] 检查权限设置

### 部署后验证
- [ ] 功能完整性测试
- [ ] 移动端测试
- [ ] 性能测试
- [ ] 跨浏览器测试

## 🔍 故障排除

### 常见问题

1. **静态资源 404**
   - 检查文件路径是否正确
   - 确认 Jetty 静态资源配置

2. **API 调用失败**
   - 检查 CORS 配置
   - 验证 API 路径
   - 查看网络请求日志

3. **页面空白**
   - 检查 JavaScript 控制台错误
   - 确认 Vue 应用挂载点
   - 验证依赖加载

4. **移动端显示异常**
   - 检查 viewport 设置
   - 验证 CSS 媒体查询
   - 测试触摸事件

## 📞 技术支持

如遇到集成问题，请提供：
- Jetty 版本信息
- 错误日志截图
- 网络请求详情
- 浏览器控制台信息
