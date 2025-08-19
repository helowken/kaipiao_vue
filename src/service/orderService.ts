import { type Order } from '../type/types'

// const orderListUrl = 'http://localhost:8080/examples/orderList.jsp'  // 订单列表API地址
// const orderDetailUrl = 'http://localhost:8080/examples/orderDetail.jsp' // 订单详情API地址
// const createInvoiceUrl = 'http://localhost:8080/examples/createInvoice.jsp' // 开票申请API地址
const orderListUrl = 'http://183.6.70.7:16389/yxapi/list'  // 订单列表API地址
const orderDetailUrl = 'http://183.6.70.7:16389/yxapi/detail' // 订单详情API地址
const createInvoiceUrl = 'http://183.6.70.7:16389/yxapi/commit' // 开票申请API地址

export const queryOrderList = async (keyword: string): Promise<Order[]> => {
    const params = new URLSearchParams()
    if (!keyword || keyword.trim() === '') {
        throw new Error('查询关键字不能为空')
    }
    // params.append('condition', keyword.trim())
    params.append('md', 'octocm.md.YX.iML_00001_CM')
    params.append('PageSize', '20')
    params.append('PageNo', '1')
    const url = `${orderListUrl}${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = (await response.json()).CONTENT as Record<string, any>[]
    return data.map((item: Record<string, any>) => {
        const itemData = item.data;
        return {
            id: itemData?.uuid || '',
            orderNumber: itemData?.ding4Dan1Hao4 || '',
            customerName: itemData?.ke4Hu4Ming2Cheng1 || '',
            amount: itemData?.jin1E2 || 0,
            date: itemData?.createDate || '',
            status: itemData?.kai1Piao4Jhuang4Tai4 || '未开票'
        }
    }) as Order[]
}

export const queryOrderDetail = async (orderId: string): Promise<Order> => {
    const params = new URLSearchParams()
    params.append('md', 'octocm.md.YX.iML_00001_CM')
    params.append('uuid', orderId);
    const url = `${orderDetailUrl}${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = (await response.json()).CONTENT as Record<string, any>
    return {
        id: data?.uuid || '',
        orderNumber: data?.ding4Dan1Hao4 || '',
        customerName: data?.ke4Hu4Ming2Cheng1 || '',
        amount: data?.jin1E2 || 0,
        date: data?.createDate || '',
        status: data?.kai1Piao4Jhuang4Tai4 || '未开票',
        description: data?.chan3Pin3Ming2Cheng1 || '',
        items: []
    } as Order
}

export const createInvoice = async (data: Record<string, any>) => {
    const params = new URLSearchParams()
    params.append('data', JSON.stringify(data))
    
    const response = await fetch(createInvoiceUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
    })
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
}