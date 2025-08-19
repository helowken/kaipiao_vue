import type { Order, InvoiceRequest } from '../types'

// 模拟订单数据
export const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD20250818001',
    customerName: '张三公司',
    amount: 1280.50,
    date: '2025-08-15',
    status: '已完成',
    description: '办公用品采购',
    items: [
      { id: '1', name: '办公椅', quantity: 2, price: 560.00 },
      { id: '2', name: '办公桌', quantity: 1, price: 720.50 }
    ]
  },
  {
    id: '2',
    orderNumber: 'ORD20250818002',
    customerName: '李四科技',
    amount: 2450.00,
    date: '2025-08-16',
    status: '已完成',
    description: '电脑配件采购',
    items: [
      { id: '3', name: '显示器', quantity: 2, price: 1200.00 },
      { id: '4', name: '键盘鼠标套装', quantity: 5, price: 250.00 }
    ]
  },
  {
    id: '3',
    orderNumber: 'ORD20250818003',
    customerName: '王五贸易',
    amount: 850.80,
    date: '2025-08-17',
    status: '已发货',
    description: '文具用品',
    items: [
      { id: '5', name: '笔记本', quantity: 20, price: 680.00 },
      { id: '6', name: '签字笔', quantity: 50, price: 170.80 }
    ]
  },
  {
    id: '4',
    orderNumber: 'ORD20250818004',
    customerName: '赵六集团',
    amount: 5680.00,
    date: '2025-08-18',
    status: '已完成',
    description: '会议室设备',
    items: [
      { id: '7', name: '投影仪', quantity: 1, price: 3500.00 },
      { id: '8', name: '音响设备', quantity: 1, price: 2180.00 }
    ]
  },
  {
    id: '5',
    orderNumber: 'ORD20250818005',
    customerName: '钱七实业',
    amount: 1950.25,
    date: '2025-08-14',
    status: '已完成',
    description: '清洁用品采购',
    items: [
      { id: '9', name: '吸尘器', quantity: 2, price: 1600.00 },
      { id: '10', name: '清洁剂', quantity: 15, price: 350.25 }
    ]
  }
]

// 模拟 API 调用
export const orderService = {
  // 获取订单列表
  async getOrders(): Promise<Order[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockOrders)
      }, 500)
    })
  },

  // 根据ID获取订单详情
  async getOrderById(id: string): Promise<Order | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const order = mockOrders.find(o => o.id === id)
        resolve(order || null)
      }, 300)
    })
  },

  // 提交开票申请
  async submitInvoiceRequest(_request: Omit<InvoiceRequest, 'id' | 'requestDate' | 'status'>): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: '开票申请提交成功！'
        })
      }, 1000)
    })
  }
}
