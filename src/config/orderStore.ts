import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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


export const useOrderStore = defineStore('order', () => {
  // 状态
  const selectedOrders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)

  const selectedOrdersCount = computed(() => {
    return selectedOrders.value.length
  })

  const selectedTotalAmount = computed(() => {
    return selectedOrders.value.reduce((total, order) => total + order.amount, 0)
  })

  const isOrderSelected = computed(() => {
    return (orderId: string) => selectedOrders.value.map(order => order.id).includes(orderId)
  })

  // 动作
  const toggleOrderSelection = (order: Order) => {
    const index = selectedOrders.value.findIndex(o => o.id === order.id)
    if (index > -1) {
      selectedOrders.value.splice(index, 1)
    } else {
      selectedOrders.value.push(order)
    }
  }

  const deselectedOrder = (orderId: string) => {
    const index = selectedOrders.value.findIndex(order => order.id === orderId)
    if (index > -1) {
      selectedOrders.value.splice(index, 1)
    }
  };

  // 移除选中的订单（用于开票后清理）
  const clearSelectedOrders = () => {
    selectedOrders.value = []
  }

  const getSelectedOrderIds = () => {
    return selectedOrders.value.map(order => order.id)
  }

  return {
    // State
    currentOrder,
    selectedOrders,

    // Getters
    selectedOrdersCount,
    selectedTotalAmount,
    isOrderSelected,
    
    // Actions
    toggleOrderSelection,
    deselectedOrder,
    clearSelectedOrders,
    getSelectedOrderIds
  }
})
