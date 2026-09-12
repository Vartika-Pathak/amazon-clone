package com.amazonclone.controller;

import com.amazonclone.dto.CartDtos.*;
import com.amazonclone.dto.ProductDto;
import com.amazonclone.model.CartItem;
import com.amazonclone.model.Product;
import com.amazonclone.model.User;
import com.amazonclone.repository.CartItemRepository;
import com.amazonclone.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartController(CartItemRepository cartItemRepository, ProductRepository productRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    @GetMapping
    public CartResponse getCart(@AuthenticationPrincipal User user) {
        return buildCartResponse(user);
    }

    @PostMapping
    public ResponseEntity<?> addToCart(@AuthenticationPrincipal User user, @RequestBody AddToCartRequest req) {
        Product product = productRepository.findById(req.productId).orElse(null);
        if (product == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Product not found"));
        }

        CartItem item = cartItemRepository.findByUserAndProduct(user, product).orElse(null);
        if (item == null) {
            item = new CartItem();
            item.setUser(user);
            item.setProduct(product);
            item.setQuantity(req.quantity == null ? 1 : req.quantity);
        } else {
            item.setQuantity(item.getQuantity() + (req.quantity == null ? 1 : req.quantity));
        }
        cartItemRepository.save(item);
        return ResponseEntity.ok(buildCartResponse(user));
    }

    @PutMapping("/{cartItemId}")
    public ResponseEntity<?> updateQuantity(@AuthenticationPrincipal User user,
                                             @PathVariable Long cartItemId,
                                             @RequestBody UpdateQuantityRequest req) {
        CartItem item = cartItemRepository.findById(cartItemId).orElse(null);
        if (item == null || !item.getUser().getId().equals(user.getId())) {
            return ResponseEntity.notFound().build();
        }
        if (req.quantity == null || req.quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(req.quantity);
            cartItemRepository.save(item);
        }
        return ResponseEntity.ok(buildCartResponse(user));
    }

    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<?> removeItem(@AuthenticationPrincipal User user, @PathVariable Long cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId).orElse(null);
        if (item == null || !item.getUser().getId().equals(user.getId())) {
            return ResponseEntity.notFound().build();
        }
        cartItemRepository.delete(item);
        return ResponseEntity.ok(buildCartResponse(user));
    }

    private CartResponse buildCartResponse(User user) {
        List<CartItem> items = cartItemRepository.findByUser(user);
        CartResponse response = new CartResponse();
        response.items = items.stream().map(ci -> {
            CartItemResponse r = new CartItemResponse();
            r.cartItemId = ci.getId();
            r.product = ProductDto.from(ci.getProduct());
            r.quantity = ci.getQuantity();
            r.lineTotal = ci.getProduct().getPrice().multiply(BigDecimal.valueOf(ci.getQuantity()));
            return r;
        }).toList();
        response.total = response.items.stream()
                .map(i -> i.lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return response;
    }
}
