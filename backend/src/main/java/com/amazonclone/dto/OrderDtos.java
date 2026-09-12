package com.amazonclone.dto;

import com.amazonclone.model.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class OrderDtos {

    public static class PlaceOrderRequest {
        public String shippingAddress;
    }

    public static class OrderItemResponse {
        public Long productId;
        public String productName;
        public String imageUrl;
        public Integer quantity;
        public BigDecimal priceAtPurchase;
    }

    public static class OrderResponse {
        public Long id;
        public String orderNumber;
        public BigDecimal total;
        public String shippingAddress;
        public OrderStatus status;
        public Instant createdAt;
        public List<OrderItemResponse> items;
    }
}
