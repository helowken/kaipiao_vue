<template>
  <div class="order-detail">
    <!-- 头部 -->
    <div class="header">
      <button @click="goBack" class="back-btn">← 返回</button>
      <h2>订单详情</h2>
      <div></div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">加载中...</div>

    <!-- 订单信息 -->
    <div v-else-if="order" class="order-content">
      <!-- 基本信息 -->
      <div class="info-section">
        <h3>基本信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>订单号:</label>
            <span>{{ order.orderNumber }}</span>
          </div>
          <div class="info-item">
            <label>客户名称:</label>
            <span>{{ order.customerName }}</span>
          </div>
          <div class="info-item">
            <label>订单金额:</label>
            <span class="amount">¥{{ order.amount.toFixed(2) }}</span>
          </div>
          <div class="info-item">
            <label>订单日期:</label>
            <span>{{ formatDate(order.date) }}</span>
          </div>
          <div class="info-item">
            <label>订单状态:</label>
            <span class="status" :class="getStatusClass(order.status)">
              {{ order.status }}
            </span>
          </div>
          <div class="info-item full-width">
            <label>订单描述:</label>
            <span>{{ order.description }}</span>
          </div>
        </div>
      </div>

      <!-- 商品清单 -->
      <div class="info-section">
        <h3>商品清单</h3>
        <div class="items-list">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="item-row"
          >
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-details">
                数量: {{ item.quantity }} | 单价: ¥{{ item.price.toFixed(2) }}
              </div>
            </div>
            <div class="item-total">
              ¥{{ (item.quantity * item.price).toFixed(2) }}
            </div>
          </div>
        </div>
        <div class="total-summary">
          <div class="total-row">
            <span>总计:</span>
            <span class="total-amount">¥{{ order.amount.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <button
          @click="toggleSelection"
          class="action-btn"
          :class="isSelected ? 'selected' : 'primary'"
        >
          {{ isSelected ? '取消选择' : '选择此订单' }}
        </button>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-state">
      <div class="error-icon">❌</div>
      <div class="error-text">订单信息加载失败</div>
      <button @click="loadOrderDetail" class="retry-btn">重试</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useOrderStore, type Order } from '../config/orderStore'

const orderDetailUrl = 'http://localhost:8080/examples/orderDetail.jsp' // 订单详情API地址
const orderStore = useOrderStore()

// Emits
interface Emits {
  (e: 'back'): void
  (e: 'toggleSelection', orderId: string): void
}

const emit = defineEmits<Emits>()

// 响应式数据
const order = ref<Order | null>(null)
const loading = ref(true)

// 计算属性
const isSelected = computed(() => {
  const currentOrder = orderStore.currentOrder;
  return currentOrder ? orderStore.isOrderSelected(currentOrder.id) : false;
})

// 方法
const loadOrderDetail = async () => {
  const currentOrder = orderStore.currentOrder;
  // 检查orderId是否有效
  if (!currentOrder) {
    order.value = null
    loading.value = false
    return
  }

  try {
    loading.value = true
    const params = new URLSearchParams()
    params.append('id', currentOrder.id);
    const url = `${orderDetailUrl}${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    order.value = await response.json()
  } catch (error) {
    // 静默处理错误，不显示控制台信息
    order.value = null
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  emit('back')
}

const toggleSelection = () => {
  if (orderStore.currentOrder)
    orderStore.toggleOrderSelection(orderStore.currentOrder);
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
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 生命周期
onMounted(() => {
  loadOrderDetail()
})
</script>

<style scoped>
.order-detail {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.header {
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: #007aff;
  cursor: pointer;
  padding: 8px;
  margin-left: -8px;
}

.header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.loading, .error-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #666;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-text {
  font-size: 16px;
  margin-bottom: 24px;
}

.retry-btn {
  background: #007aff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.order-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: 100px;
}

.info-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.info-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.info-item span {
  font-size: 14px;
  color: #333;
}

.amount {
  font-weight: 600;
  color: #007aff;
  font-size: 16px !important;
}

.status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px !important;
  font-weight: 500;
  display: inline-block;
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

.items-list {
  margin-bottom: 16px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.item-row:last-child {
  border-bottom: none;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.item-details {
  font-size: 12px;
  color: #666;
}

.item-total {
  font-size: 14px;
  font-weight: 600;
  color: #007aff;
}

.total-summary {
  border-top: 2px solid #eee;
  padding-top: 12px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-row span:first-child {
  font-size: 14px;
  color: #666;
}

.total-amount {
  font-size: 18px;
  font-weight: 600;
  color: #007aff;
}

.actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 16px;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}

.action-btn {
  width: 100%;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: #007aff;
  color: white;
}

.action-btn.selected {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
}

.action-btn:active {
  transform: scale(0.98);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .info-item.full-width {
    grid-column: 1;
  }
}
</style>
