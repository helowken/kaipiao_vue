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

    <!-- 底部操作栏 - 固定显示 -->
    <div class="bottom-actions">
      <button 
        @click="toggleSelectedList" 
        class="cart-btn"
        :class="{ disabled: orderStore.selectedOrdersCount === 0 }"
        :disabled="orderStore.selectedOrdersCount === 0"
      >
        <span class="cart-icon">🛒</span>
        <span v-if="orderStore.selectedOrdersCount > 0" class="cart-count">{{ orderStore.selectedOrdersCount }}</span>
      </button>
      <div class="selected-info">
        <span v-if="orderStore.selectedOrdersCount > 0">
          已选择 {{ orderStore.selectedOrdersCount }} 个订单
          <span class="total-amount">总金额: ¥{{ orderStore.selectedTotalAmount.toFixed(2) }}</span>
        </span>
        <span v-else class="no-selection">
          请选择需要开票的订单
        </span>
      </div>
      <button 
        @click="proceedToInvoice" 
        class="proceed-btn"
        :class="{ disabled: orderStore.selectedOrdersCount === 0 }"
        :disabled="orderStore.selectedOrdersCount === 0"
      >
        申请开票
      </button>
    </div>

    <!-- 选中订单列表弹窗 -->
    <div v-if="showSelectedList" class="selected-list-overlay" @click="closeSelectedList">
      <div class="selected-list-modal" @click.stop>
        <div class="modal-header">
          <h3>已选择的订单</h3>
          <button @click="closeSelectedList" class="close-btn">×</button>
        </div>
        <div class="modal-content">
          <div v-if="orderStore.selectedOrders.length === 0" class="empty-selected">
            暂无选择的订单
          </div>
          <div v-else class="selected-orders">
            <div
              v-for="order in orderStore.selectedOrders"
              :key="order.id"
              class="selected-order-item"
            >
              <div class="order-main-info">
                <div class="order-number">{{ order.orderNumber }}</div>
                <div class="order-amount">¥{{ order.amount.toFixed(2) }}</div>
              </div>
              <div class="order-sub-info">
                <span class="customer-name">{{ order.customerName }}</span>
                <span class="order-status" :class="getStatusClass(order.status)">
                  {{ order.status }}
                </span>
              </div>
              <button
                @click="removeFromSelection(order.id)"
                class="remove-btn"
              >
                ×
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <div class="total-summary">
            总计: {{ orderStore.selectedOrdersCount }} 个订单，
            金额: ¥{{ orderStore.selectedTotalAmount.toFixed(2) }}
          </div>
          <div class="modal-actions">
            <button @click="clearAllSelections" class="clear-btn">清空</button>
            <button @click="proceedToInvoiceFromModal" class="invoice-btn"
              :disabled="orderStore.selectedOrdersCount === 0"
            >申请开票</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { type Order } from '../type/types'
import { useOrderStore } from '../config/orderStore'
import { queryOrderList } from '../service/orderService'

const orderStore = useOrderStore()

// Emits
interface Emits {
  (e: 'viewDetail'): void
  (e: 'proceedToInvoice'): void
}

const emit = defineEmits<Emits>()

// 响应式数据
const orders = ref<Order[]>([])
const loading = ref(false)
const searchKeyword = ref('')
const showSelectedList = ref(false)

// 方法
const loadOrders = async (keyword: string) => {
  try {
    orders.value = []
    loading.value = true
    const list: Order[] = await queryOrderList(keyword)
    orders.value = list
  } catch (error) {
    // 处理错误
    console.error('加载订单数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  loadOrders(searchKeyword.value.trim())
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

// 选中订单列表相关方法
const toggleSelectedList = () => {
  showSelectedList.value = !showSelectedList.value
}

const closeSelectedList = () => {
  showSelectedList.value = false
}

const removeFromSelection = (orderId: string) => {
  orderStore.deselectedOrder(orderId)
  if (orderStore.selectedOrdersCount === 0) {
    closeSelectedList()
  }
}

const clearAllSelections = () => {
  orderStore.clearSelectedOrders()
  closeSelectedList()
}

const proceedToInvoiceFromModal = () => {
  closeSelectedList()
  emit('proceedToInvoice')
}

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
  border-radius: 18px;
  font-size: 14px;
  cursor: pointer;
  min-width: 60px;
  transition: background-color 0.3s ease;
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
  padding: 18px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  position: relative;
  cursor: pointer;
}

.order-item.selected {
  padding: 14px;
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
  align-items: center;
  gap: 12px;
  z-index: 200;
}

.cart-btn {
  position: relative;
  background: #007aff;
  color: white;
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cart-icon {
  font-size: 20px;
}

.cart-count {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ff3b30;
  color: white;
  font-size: 12px;
  font-weight: bold;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.selected-info {
  flex: 1;
  font-size: 14px;
  color: #333;
  margin-left: 8px;
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
  transition: all 0.3s ease;
}

.proceed-btn.disabled,
.proceed-btn:disabled {
  background: #cccccc;
  color: #888888;
  cursor: not-allowed;
}

.invoice-btn {
  flex: 2;
  background: #007aff;
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.invoice-btn.disabled,
.invoice-btn:disabled {
  background: #cccccc;
  color: #888888;
  cursor: not-allowed;
}

/* 选中订单列表弹窗样式 */
.selected-list-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.selected-list-modal {
  background: white;
  width: 100%;
  max-width: 500px;
  max-height: 70vh;
  border-radius: 16px 16px 0 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.empty-selected {
  text-align: center;
  color: #999;
  padding: 40px 20px;
}

.selected-orders {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.selected-order-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px 35px 12px 12px; /* 增加右侧padding为X按钮留出空间 */
  position: relative;
}

.order-main-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-right: 8px; /* 避免与X按钮重叠 */
}

.order-main-info .order-number {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.order-main-info .order-amount {
  font-weight: 600;
  font-size: 16px;
  color: #007aff;
}

.order-sub-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  padding-right: 8px; /* 避免与X按钮重叠 */
}

.order-sub-info .customer-name {
  color: #666;
}

.remove-btn {
  position: absolute;
  top: 8px; /* 放到顶部 */
  right: 4px; /* 保持右侧 */
  background: transparent;
  color: #ff3b30;
  border: none;
  width: 32px; /* 增加宽度 */
  height: 32px; /* 增加高度 */
  font-size: 24px; /* 增大字体 */
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  line-height: 1;
}

.modal-footer {
  border-top: 1px solid #eee;
  padding: 16px 20px;
}

.total-summary {
  font-size: 14px;
  color: #333;
  margin-bottom: 12px;
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: 8px;
}

.clear-btn {
  flex: 1;
  background: #f5f5f5;
  color: #666;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.invoice-btn {
  flex: 2;
  background: #007aff;
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
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
  
  .bottom-actions {
    padding: 12px 16px;
  }
  
  .cart-btn {
    width: 44px;
    height: 44px;
  }
  
  .cart-icon {
    font-size: 18px;
  }
  
  .selected-list-modal {
    max-height: 80vh;
  }
}
</style>
