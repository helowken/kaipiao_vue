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