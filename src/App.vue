<script setup lang="ts">
import { ref } from 'vue'
import OrderList from './components/OrderList.vue'
import OrderDetail from './components/OrderDetail.vue'
import InvoiceRequest from './components/InvoiceRequest.vue'

// 页面状态管理
type PageType = 'list' | 'detail' | 'invoice'

const currentPage = ref<PageType>('list')
const selectedOrders = ref<string[]>([])
const currentOrderId = ref<string>('') // 确保初始值为空字符串
const forceRefreshOrders = ref(true) // 初始需要加载数据

// 页面导航方法
const showOrderDetail = (orderId: string) => {
  currentOrderId.value = orderId
  currentPage.value = 'detail'
}

const showInvoiceRequest = () => {
  currentPage.value = 'invoice'
}

const backToList = () => {
  // 从详情页返回时不刷新数据，保持原有状态
  currentPage.value = 'list'
}

const backToListFromInvoice = () => {
  currentPage.value = 'list'
}

// 订单选择相关方法
const updateSelectedOrders = (orders: string[]) => {
  selectedOrders.value = orders
}

const toggleOrderSelection = (orderId: string) => {
  const index = selectedOrders.value.indexOf(orderId)
  if (index > -1) {
    selectedOrders.value.splice(index, 1)
  } else {
    selectedOrders.value.push(orderId)
  }
}

const removeOrderFromInvoice = (orderId: string) => {
  const index = selectedOrders.value.indexOf(orderId)
  if (index > -1) {
    selectedOrders.value.splice(index, 1)
  }
}

const handleInvoiceSuccess = () => {
  selectedOrders.value = []
  forceRefreshOrders.value = true // 开票成功后需要刷新订单状态
  currentPage.value = 'list'
}
</script>

<template>
  <div class="app">
    <!-- 订单列表页 -->
    <OrderList
      v-show="currentPage === 'list'"
      :selectedOrders="selectedOrders"
      :needsRefresh="forceRefreshOrders"
      @update:selectedOrders="updateSelectedOrders"
      @viewDetail="showOrderDetail"
      @proceedToInvoice="showInvoiceRequest"
      @refreshComplete="forceRefreshOrders = false"
    />

    <!-- 订单详情页 -->
    <OrderDetail
      v-show="currentPage === 'detail' && currentOrderId"
      :orderId="currentOrderId"
      :selectedOrders="selectedOrders"
      @back="backToList"
      @toggleSelection="toggleOrderSelection"
    />

    <!-- 开票申请页 -->
    <InvoiceRequest
      v-show="currentPage === 'invoice'"
      :selectedOrderIds="selectedOrders"
      @back="backToListFromInvoice"
      @removeOrder="removeOrderFromInvoice"
      @success="handleInvoiceSuccess"
    />
  </div>
</template>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background: #f5f5f5;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100vh;
  overflow: hidden;
}

.app {
  height: 100%;
}

/* 移动端适配 */
@media (max-width: 768px) {
  body {
    font-size: 14px;
  }
}

/* 禁止文字选择 */
.app {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* 输入框允许选择 */
input, textarea {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}

/* 移动端触摸优化 */
button, .clickable {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>
