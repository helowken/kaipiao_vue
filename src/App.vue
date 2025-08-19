<script setup lang="ts">
import { ref } from 'vue'
import { useOrderStore } from './config/orderStore'
import OrderList from './components/OrderList.vue'
import OrderDetail from './components/OrderDetail.vue'
import InvoiceRequest from './components/InvoiceRequest.vue'

// 使用Pinia store
const orderStore = useOrderStore()

// 页面状态
const currentPage = ref<'list' | 'detail' | 'invoice'>('list')

// 页面导航方法
const showOrderDetail = () => {
  currentPage.value = 'detail'
}

const showInvoiceRequest = () => {
  if (orderStore.selectedOrdersCount === 0) {
    alert('请先选择要开票的订单')
    return
  }
  currentPage.value = 'invoice'
}

const backToList = () => {
  currentPage.value = 'list'
}
</script>

<template>
  <div class="app">
    <OrderList 
      v-show="currentPage === 'list'"
      @view-detail="showOrderDetail"
      @proceed-to-invoice="showInvoiceRequest"
    />
    
    <OrderDetail
      v-if="currentPage === 'detail'"
      @back="backToList"
    />
    
    <InvoiceRequest
      v-if="currentPage === 'invoice'"
      @back="backToList"
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
  width: 100vh;
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
