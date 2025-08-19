<template>
  <div class="invoice-request">
    <!-- 头部 -->
    <div class="header">
      <button @click="goBack" class="back-btn">← 返回</button>
      <h2>申请开票</h2>
      <div></div>
    </div>

    <div class="content">
      <!-- 选中订单列表 -->
      <div class="section">
        <h3>选中订单 ({{ selectedOrdersData.length }})</h3>
        <div class="selected-orders">
          <div
            v-for="order in selectedOrdersData"
            :key="order.id"
            class="order-card"
          >
            <div class="order-header">
              <div class="order-number">{{ order.orderNumber }}</div>
              <button
                @click="removeOrder(order.id)"
                class="remove-btn"
              >
                ×
              </button>
            </div>
            <div class="order-info">
              <div class="customer">{{ order.customerName }}</div>
              <div class="amount">¥{{ order.amount.toFixed(2) }}</div>
            </div>
          </div>
        </div>
        
        <div class="total-section">
          <div class="total-amount">
            总金额: ¥{{ totalAmount.toFixed(2) }}
          </div>
        </div>
      </div>

      <!-- 开票信息 -->
      <div class="section">
        <h3>开票信息</h3>
        <form @submit.prevent="submitRequest" class="invoice-form">
          <div class="form-group">
            <label>开票类型</label>
            <div class="radio-group">
              <label class="radio-option">
                <input
                  type="radio"
                  v-model="invoiceType"
                  value="普通发票"
                  name="invoiceType"
                />
                <span class="radio-label">普通发票</span>
              </label>
              <label class="radio-option">
                <input
                  type="radio"
                  v-model="invoiceType"
                  value="专用发票"
                  name="invoiceType"
                />
                <span class="radio-label">增值税专用发票</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>发票抬头</label>
            <input
              type="text"
              v-model="invoiceTitle"
              placeholder="请输入发票抬头"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label>申请人</label>
            <input
              type="text"
              v-model="applicantName"
              placeholder="请输入申请人姓名"
              class="form-input"
              required
            />
          </div>

          <div v-if="invoiceType === '专用发票'" class="form-group">
            <label>纳税人识别号</label>
            <input
              type="text"
              v-model="taxNumber"
              placeholder="请输入纳税人识别号"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label for="description">备注说明</label>
            <textarea
              id="description"
              v-model="invoiceDescription"
              placeholder="请输入开票相关的备注信息（选填）"
              rows="4"
              class="form-textarea"
            ></textarea>
            <div class="char-count">{{ invoiceDescription.length }}/500</div>
          </div>
        </form>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="bottom-actions">
      <button
        @click="submitRequest"
        class="submit-btn"
        :disabled="!canSubmit || isSubmitting"
      >
        {{ isSubmitting ? '提交中...' : '提交申请' }}
      </button>
    </div>

    <!-- 成功提示弹窗 -->
    <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
      <div class="modal-content" @click.stop>
        <div class="success-icon">✓</div>
        <h3>申请提交成功</h3>
        <p>您的开票申请已成功提交，我们会尽快处理</p>
        <button @click="closeSuccessModal" class="modal-btn">确定</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Order } from '../types'
import { orderService } from '../services/orderService'

// Props
interface Props {
  selectedOrderIds: string[]
}

// Emits
interface Emits {
  (e: 'back'): void
  (e: 'removeOrder', orderId: string): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 响应式数据
const selectedOrdersData = ref<Order[]>([])
const invoiceDescription = ref('')
const invoiceType = ref('普通发票')
const invoiceTitle = ref('')
const taxNumber = ref('')
const applicantName = ref('')
const isSubmitting = ref(false)
const showSuccessModal = ref(false)

// 计算属性
const totalAmount = computed(() => {
  return selectedOrdersData.value.reduce((total, order) => total + order.amount, 0)
})

const canSubmit = computed(() => {
  const basicRequirements = selectedOrdersData.value.length > 0 && 
                           invoiceTitle.value.trim() && 
                           applicantName.value.trim()
  
  if (invoiceType.value === '专用发票') {
    return basicRequirements && taxNumber.value.trim()
  }
  
  return basicRequirements
})

// 方法
const loadSelectedOrders = async () => {
  try {
    const allOrders = await orderService.getOrders()
    selectedOrdersData.value = allOrders.filter(order => 
      props.selectedOrderIds.includes(order.id)
    )
  } catch (error) {
    // 静默处理错误，不显示控制台信息
  }
}

const goBack = () => {
  emit('back')
}

const removeOrder = (orderId: string) => {
  emit('removeOrder', orderId)
  selectedOrdersData.value = selectedOrdersData.value.filter(order => order.id !== orderId)
}

const submitRequest = async () => {
  if (!canSubmit.value || isSubmitting.value) {
    return
  }

  try {
    isSubmitting.value = true
    
    const requestData = {
      orderIds: props.selectedOrderIds,
      totalAmount: totalAmount.value,
      description: invoiceDescription.value.trim(),
      invoiceType: invoiceType.value,
      invoiceTitle: invoiceTitle.value.trim(),
      taxNumber: invoiceType.value === '专用发票' ? taxNumber.value.trim() : '',
      applicantName: applicantName.value.trim()
    }

    const result = await orderService.submitInvoiceRequest(requestData)
    
    if (result.success) {
      showSuccessModal.value = true
    } else {
      alert('提交失败: ' + result.message)
    }
  } catch (error) {
    alert('提交失败，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  emit('success')
}

// 生命周期
onMounted(() => {
  loadSelectedOrders()
})

// 监听selectedOrderIds变化，重新加载订单数据
watch(() => props.selectedOrderIds, (newOrderIds) => {
  if (newOrderIds && newOrderIds.length > 0) {
    loadSelectedOrders()
  }
}, { immediate: true })
</script>

<style scoped>
.invoice-request {
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

.content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: 100px;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.selected-orders {
  margin-bottom: 16px;
}

.order-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  background: #f9f9f9;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.order-number {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.remove-btn {
  background: #ff4757;
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.customer {
  color: #666;
  font-size: 13px;
}

.amount {
  font-weight: 600;
  color: #007aff;
  font-size: 14px;
}

.total-section {
  border-top: 1px solid #eee;
  padding-top: 12px;
  text-align: right;
}

.total-amount {
  font-size: 18px;
  font-weight: 600;
  color: #007aff;
}

.invoice-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-input, .form-textarea {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;
}

.form-input:focus, .form-textarea:focus {
  border-color: #007aff;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.char-count {
  font-size: 12px;
  color: #999;
  text-align: right;
  margin-top: 4px;
}

.radio-group {
  display: flex;
  gap: 20px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.radio-option input[type="radio"] {
  margin: 0;
}

.radio-label {
  font-size: 14px;
  color: #333;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 16px;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}

.submit-btn {
  width: 100%;
  background: #007aff;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.submit-btn:not(:disabled):active {
  transform: scale(0.98);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 32px 24px;
  margin: 20px;
  text-align: center;
  max-width: 300px;
  width: 100%;
}

.success-icon {
  width: 60px;
  height: 60px;
  background: #28a745;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  margin: 0 auto 16px;
}

.modal-content h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #333;
}

.modal-content p {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.modal-btn {
  background: #007aff;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .radio-group {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
