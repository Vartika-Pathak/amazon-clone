package com.amazonclone.controller;

import com.amazonclone.dto.OrderDtos.*;
import com.amazonclone.model.*;
import com.amazonclone.repository.CartItemRepository;
import com.amazonclone.repository.OrderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;

    public OrderController(CartItemRepository cartItemRepository, OrderRepository orderRepository) {
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> placeOrder(@AuthenticationPrincipal User user, @RequestBody PlaceOrderRequest req) {
        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cart is empty"));
        }

        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(req.shippingAddress != null ? req.shippingAddress : user.getShippingAddress());
        order.setStatus(OrderStatus.PLACED);

        BigDecimal total = BigDecimal.ZERO;
        for (CartItem ci : cartItems) {
            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProduct(ci.getProduct());
            oi.setProductNameSnapshot(ci.getProduct().getName());
            oi.setQuantity(ci.getQuantity());
            oi.setPriceAtPurchase(ci.getProduct().getPrice());
            order.getItems().add(oi);
            total = total.add(ci.getProduct().getPrice().multiply(BigDecimal.valueOf(ci.getQuantity())));
        }
        order.setTotal(total);

        orderRepository.save(order);
        cartItemRepository.deleteByUser(user);

        return ResponseEntity.ok(toResponse(order));
    }

    @GetMapping
    public List<OrderResponse> myOrders(@AuthenticationPrincipal User user) {
        return orderRepository.findByUserOrderByCreatedAtDesc(user).stream().map(this::toResponse).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return orderRepository.findById(id)
                .filter(o -> o.getUser().getId().equals(user.getId()))
                .map(o -> ResponseEntity.ok(toResponse(o)))
                .orElse(ResponseEntity.notFound().build());
    }

    private OrderResponse toResponse(Order order) {
        OrderResponse r = new OrderResponse();
        r.id = order.getId();
        r.orderNumber = String.format("405-5881612-%07d", 9904350L + order.getId());
        r.total = order.getTotal();
        r.shippingAddress = order.getShippingAddress();
        r.status = order.getStatus();
        r.createdAt = order.getCreatedAt();
        r.items = order.getItems().stream().map(oi -> {
            OrderItemResponse ir = new OrderItemResponse();
            ir.productId = oi.getProduct().getId();
            ir.productName = oi.getProductNameSnapshot();
            ir.imageUrl = oi.getProduct().getImageUrl();
            ir.quantity = oi.getQuantity();
            ir.priceAtPurchase = oi.getPriceAtPurchase();
            return ir;
        }).toList();
        return r;
    }
}