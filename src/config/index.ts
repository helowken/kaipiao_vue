// 生产环境配置
export const config = {
  // API 基础路径
  apiBaseUrl: import.meta.env.PROD ? '/api' : 'http://localhost:8080/api',
  
  // 应用基础路径  
  basePath: import.meta.env.PROD ? '/invoice/' : '/',
  
  // 是否启用调试
  debug: import.meta.env.DEV,
  
  // API 接口路径
  api: {
    orders: '/invoice/orders',
    orderDetail: '/invoice/orders',
    submitInvoice: '/invoice/request'
  },
  
  // 分页配置
  pagination: {
    pageSize: 20
  },
  
  // 文件上传配置
  upload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['jpg', 'jpeg', 'png', 'pdf']
  }
}
