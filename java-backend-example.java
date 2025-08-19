// Java 后端集成示例代码

// 1. 订单实体类
public class Order {
    private String id;
    private String orderNumber;
    private String customerName;
    private BigDecimal amount;
    private LocalDate date;
    private String status;
    private String description;
    private List<OrderItem> items;
    
    // 构造函数、getter、setter...
}

public class OrderItem {
    private String id;
    private String name;
    private Integer quantity;
    private BigDecimal price;
    
    // 构造函数、getter、setter...
}

// 2. 开票申请实体类
public class InvoiceRequest {
    private String id;
    private List<String> orderIds;
    private BigDecimal totalAmount;
    private String description;
    private String invoiceType;
    private String invoiceTitle;
    private String taxNumber;
    private String email;
    private LocalDateTime requestDate;
    private String status;
    
    // 构造函数、getter、setter...
}

// 3. 响应实体类
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    
    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setData(data);
        return response;
    }
    
    public static <T> ApiResponse<T> error(String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setMessage(message);
        return response;
    }
    
    // getter、setter...
}

// 4. 控制器类
@RestController
@RequestMapping("/api/invoice")
@CrossOrigin(origins = "*") // 根据需要配置CORS
public class InvoiceController {
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private InvoiceService invoiceService;
    
    /**
     * 获取订单列表
     */
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        
        try {
            List<Order> orders = orderService.getOrders(page, size, status, keyword);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取订单详情
     */
    @GetMapping("/orders/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable String id) {
        try {
            Order order = orderService.getOrderById(id);
            if (order != null) {
                return ResponseEntity.ok(order);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 提交开票申请
     */
    @PostMapping("/request")
    public ResponseEntity<ApiResponse<String>> submitInvoiceRequest(
            @RequestBody InvoiceRequest request) {
        
        try {
            // 验证请求数据
            if (request.getOrderIds() == null || request.getOrderIds().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("订单列表不能为空"));
            }
            
            if (StringUtils.isBlank(request.getInvoiceTitle())) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("发票抬头不能为空"));
            }
            
            if (StringUtils.isBlank(request.getEmail())) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("收票邮箱不能为空"));
            }
            
            // 如果是专用发票，验证纳税人识别号
            if ("专用发票".equals(request.getInvoiceType()) && 
                StringUtils.isBlank(request.getTaxNumber())) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("专用发票需要提供纳税人识别号"));
            }
            
            // 提交申请
            String requestId = invoiceService.submitRequest(request);
            
            return ResponseEntity.ok(
                ApiResponse.success("开票申请提交成功，申请编号：" + requestId)
            );
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("系统错误，请稍后重试"));
        }
    }
    
    /**
     * 获取开票申请状态
     */
    @GetMapping("/request/{requestId}")
    public ResponseEntity<InvoiceRequest> getInvoiceRequest(@PathVariable String requestId) {
        try {
            InvoiceRequest request = invoiceService.getRequestById(requestId);
            if (request != null) {
                return ResponseEntity.ok(request);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

// 5. 服务类接口
public interface OrderService {
    List<Order> getOrders(int page, int size, String status, String keyword);
    Order getOrderById(String id);
}

public interface InvoiceService {
    String submitRequest(InvoiceRequest request);
    InvoiceRequest getRequestById(String requestId);
    void updateRequestStatus(String requestId, String status);
}

// 6. Servlet 配置 (如果使用传统 Servlet)
@WebServlet("/api/invoice/*")
public class InvoiceServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        String pathInfo = request.getPathInfo();
        
        try {
            if ("/orders".equals(pathInfo)) {
                handleGetOrders(request, response);
            } else if (pathInfo != null && pathInfo.startsWith("/orders/")) {
                String orderId = pathInfo.substring("/orders/".length());
                handleGetOrderById(orderId, response);
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"success\":false,\"message\":\"系统错误\"}");
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        String pathInfo = request.getPathInfo();
        
        if ("/request".equals(pathInfo)) {
            handleSubmitInvoiceRequest(request, response);
        } else {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        }
    }
    
    private void handleGetOrders(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        // 实现获取订单逻辑
    }
    
    private void handleGetOrderById(String orderId, HttpServletResponse response) 
            throws IOException {
        // 实现获取订单详情逻辑
    }
    
    private void handleSubmitInvoiceRequest(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        // 实现提交开票申请逻辑
    }
}

// 7. web.xml 配置示例
/*
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://java.sun.com/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://java.sun.com/xml/ns/javaee 
         http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd"
         version="3.0">

    <!-- 开票申请静态资源 -->
    <servlet>
        <servlet-name>InvoiceStaticServlet</servlet-name>
        <servlet-class>org.eclipse.jetty.servlet.DefaultServlet</servlet-class>
        <init-param>
            <param-name>resourceBase</param-name>
            <param-value>/invoice</param-value>
        </init-param>
        <init-param>
            <param-name>pathInfoOnly</param-name>
            <param-value>true</param-value>
        </init-param>
    </servlet>
    
    <servlet-mapping>
        <servlet-name>InvoiceStaticServlet</servlet-name>
        <url-pattern>/invoice/*</url-pattern>
    </servlet-mapping>
    
    <!-- CORS 过滤器 -->
    <filter>
        <filter-name>CorsFilter</filter-name>
        <filter-class>your.package.CorsFilter</filter-class>
    </filter>
    
    <filter-mapping>
        <filter-name>CorsFilter</filter-name>
        <url-pattern>/api/*</url-pattern>
    </filter-mapping>

</web-app>
*/
