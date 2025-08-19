<template>
  <div class="order-list">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-input">
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索订单号、客户名称..."
          @input="handleSearch"
        />
        <i class="search-icon">🔍</i>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">加载中...</div>

    <!-- 订单列表 -->
    <div v-else class="order-items">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="order-item"
        :class="{ selected: selectedOrders.includes(order.id) }"
        @click="toggleOrderSelection(order.id)"
      >
        <div class="order-header">
          <div class="order-number">{{ order.orderNumber }}</div>
          <div class="order-status" :class="getStatusClass(order.status)">
            {{ order.status }}
          </div>
        </div>
        <div class="order-info">
          <div class="customer-name">{{ order.customerName }}</div>
          <div class="order-amount">¥{{ order.amount.toFixed(2) }}</div>
        </div>
        <div class="order-footer">
          <div class="order-date">{{ formatDate(order.date) }}</div>
          <button
            @click.stop="viewOrderDetail(order.id)"
            class="detail-btn"
          >
            详情
          </button>
        </div>
        <div class="checkbox" :class="{ checked: selectedOrders.includes(order.id) }">
          <span v-if="selectedOrders.includes(order.id)">✓</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && filteredOrders.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <div class="empty-text">暂无订单数据</div>
    </div>

    <!-- 底部操作栏 -->
    <div v-if="selectedOrders.length > 0" class="bottom-actions">
      <div class="selected-info">
        已选择 {{ selectedOrders.length }} 个订单
        <span class="total-amount">总金额: ¥{{ selectedTotalAmount.toFixed(2) }}</span>
      </div>
      <button @click="proceedToInvoice" class="proceed-btn">
        申请开票
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Order } from '../types'
import { orderService } from '../services/orderService'

// Props
interface Props {
  selectedOrders: string[]
  needsRefresh?: boolean
}

// Emits
interface Emits {
  (e: 'update:selectedOrders', value: string[]): void
  (e: 'viewDetail', orderId: string): void
  (e: 'proceedToInvoice'): void
  (e: 'refreshComplete'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 响应式数据
const orders = ref<Order[]>([])
const loading = ref(false)
const searchKeyword = ref('')

// 计算属性
const filteredOrders = computed(() => {
  let result = orders.value

  // 关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(order =>
      order.orderNumber.toLowerCase().includes(keyword) ||
      order.customerName.toLowerCase().includes(keyword) ||
      order.description.toLowerCase().includes(keyword)
    )
  }

  return result
})

const selectedTotalAmount = computed(() => {
  return orders.value
    .filter(order => props.selectedOrders.includes(order.id))
    .reduce((total, order) => total + order.amount, 0)
})

// 方法
const loadOrders = async () => {
  // 只有在需要刷新时才重新加载数据
  if (!props.needsRefresh && orders.value.length > 0) {
    return
  }
  
  try {
    loading.value = true
    orders.value = await orderService.getOrders()
    
    // 完成刷新后通知父组件
    if (props.needsRefresh) {
      emit('refreshComplete')
    }
  } catch (error) {
    // 静默处理错误，不显示控制台信息
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // 如果还没有数据，触发数据加载
  if (orders.value.length === 0) {
    loadOrders()
  }
  // 注意：搜索逻辑通过computed属性filteredOrders自动处理
}

const toggleOrderSelection = (orderId: string) => {
  const selectedOrders = [...props.selectedOrders]
  const index = selectedOrders.indexOf(orderId)
  
  if (index > -1) {
    selectedOrders.splice(index, 1)
  } else {
    selectedOrders.push(orderId)
  }
  
  emit('update:selectedOrders', selectedOrders)
}

const viewOrderDetail = (orderId: string) => {
  emit('viewDetail', orderId)
}

const proceedToInvoice = () => {
  emit('proceedToInvoice')
}

const getStatusClass = (status: string) => {
  switch (status) {
    case '已完成': return 'status-completed'
    case '已发货': return 'status-shipped'
    case '待发货': return 'status-pending'
    default: return ''
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 生命周期和监听
onMounted(() => {
  // 首次挂载时加载数据
  loadOrders()
})

// 监听needsRefresh变化，当需要强制刷新时重新加载
watch(() => props.needsRefresh, (newValue) => {
  if (newValue === true) {
    // 强制刷新时重新加载数据
    loadOrders()
  }
})
</script>

<style scoped>
.order-list {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.search-bar {
  background: white;
  padding: 12px 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.search-input {
  width: 100%;
  position: relative;
}

.search-input input {
  width: 100%;
  padding: 10px 40px 10px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
}

.search-input input:focus {
  border-color: #007aff;
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.order-items {
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px;
  padding-bottom: 100px;
}

.order-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
}

.order-item:active {
  transform: scale(0.98);
}

.order-item.selected {
  border: 2px solid #007aff;
  background: #f0f8ff;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.order-number {
  font-weight: 600;
  font-size: 16px;
  color: #333;
}

.order-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-completed {
  background: #e7f4ea;
  color: #28a745;
}

.status-shipped {
  background: #fff3cd;
  color: #856404;
}

.status-pending {
  background: #d1ecf1;
  color: #0c5460;
}

.order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.customer-name {
  color: #666;
  font-size: 14px;
}

.order-amount {
  font-weight: 600;
  font-size: 18px;
  color: #007aff;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-date {
  color: #999;
  font-size: 12px;
}

.detail-btn {
  background: #007aff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
}

.detail-btn:active {
  background: #0056b3;
}

.checkbox {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
}

.checkbox.checked {
  background: #007aff;
  border-color: #007aff;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 16px;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-info {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.total-amount {
  display: block;
  font-weight: 600;
  color: #007aff;
  margin-top: 2px;
}

.proceed-btn {
  background: #007aff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  min-width: 100px;
}

.proceed-btn:active {
  background: #0056b3;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .search-bar {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
