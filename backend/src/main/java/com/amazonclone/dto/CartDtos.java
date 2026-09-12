package com.amazonclone.dto;

import java.math.BigDecimal;
import java.util.List;

public class CartDtos {

    public static class AddToCartRequest {
        public Long productId;
        public Integer quantity;
    }

    public static class UpdateQuantityRequest {
        public Integer quantity;
    }

    public static class CartItemResponse {
        public Long cartItemId;
        public ProductDto product;
        public Integer quantity;
        public BigDecimal lineTotal;
    }

    public static class CartResponse {
        public List<CartItemResponse> items;
        public BigDecimal total;
    }
}
