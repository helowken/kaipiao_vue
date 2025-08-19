<template>
  <div class="order-list">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-input-group">
        <div class="search-input">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索订单号、客户名称..."
            @keyup.enter="handleSearch"
          />
          <i class="search-icon">🔍</i>
        </div>
        <button @click="handleSearch" class="search-btn">搜索</button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">加载中...</div>

    <!-- 订单列表 -->
    <div v-else class="order-items">
      <div
        v-for="order in orders"
        :key="order.id"
        class="order-item"
        :class="{ selected: orderStore.isOrderSelected(order.id) }"
        @click="orderStore.toggleOrderSelection(order)"
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
            @click.stop="viewOrderDetail(order)"
            class="detail-btn"
          >
            详情
          </button>
        </div>
        <div class="checkbox" :class="{ checked: orderStore.isOrderSelected(order.id) }">
          <span v-if="orderStore.isOrderSelected(order.id)">✓</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && orders.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <div class="empty-text">暂无订单数据</div>
    </div>

    <!-- 底部操作栏 -->
    <div v-if="orderStore.selectedOrdersCount > 0" class="bottom-actions">
      <div class="selected-info">
        已选择 {{ orderStore.selectedOrdersCount }} 个订单
        <span class="total-amount">总金额: ¥{{ orderStore.selectedTotalAmount.toFixed(2) }}</span>
      </div>
      <button @click="proceedToInvoice" class="proceed-btn">
        申请开票
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useOrderStore, type Order } from '../config/orderStore'

const orderStore = useOrderStore()

// Emits
interface Emits {
  (e: 'viewDetail'): void
  (e: 'proceedToInvoice'): void
  (e: 'refreshComplete'): void
}

const emit = defineEmits<Emits>()

// 响应式数据
const orders = ref<Order[]>([])
const loading = ref(false)
const searchKeyword = ref('')

// URL配置
const orderListUrl = 'http://localhost:8080/examples/orderList.jsp'  // 订单列表API地址

// 方法
const loadOrders = async (searchParams?: { keyword?: string }) => {
  try {
    loading.value = true
    
    // 构建请求参数
    const params = new URLSearchParams()
    if (searchParams?.keyword) {
      params.append('keyword', searchParams.keyword)
    }
    
    const url = `${orderListUrl}${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    orders.value = await response.json()
  } catch (error) {
    // 处理错误
    console.error('加载订单数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  loadOrders({ keyword: searchKeyword.value.trim() })
}

const viewOrderDetail = async (order: Order) => {
  orderStore.currentOrder = order;
  emit('viewDetail');
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

.search-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input {
  flex: 1;
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

.search-btn {
  background: #007aff;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  min-width: 60px;
  transition: background-color 0.3s ease;
}

.search-btn:hover {
  background: #0056b3;
}

.search-btn:active {
  background: #004494;
  transform: scale(0.98);
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
  padding-bottom: 20px;
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
  z-index: 200;
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
  .search-input-group {
    gap: 6px;
  }
  
  .search-btn {
    padding: 10px 12px;
    min-width: 50px;
  }
}
</style>
