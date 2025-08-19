// 订单接口
export interface Order {
  id: string
  orderNumber: string
  customerName: string
  amount: number
  date: string
  status: '已完成' | '待发货' | '已发货'
  description: string
  items: OrderItem[]
}

// 订单项接口
export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

// 开票申请接口
export interface InvoiceRequest {
  id: string
  orderIds: string[]
  totalAmount: number
  description: string
  requestDate: string
  status: '待处理' | '已提交' | '已开票'
}

// 搜索筛选条件
export interface SearchFilter {
  keyword: string
  status: string
  dateRange: [string, string] | null
}
