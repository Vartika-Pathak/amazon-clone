package com.amazonclone.controller;

import com.amazonclone.model.CartItem;
import com.amazonclone.model.Order;
import com.amazonclone.model.OrderItem;
import com.amazonclone.model.OrderStatus;
import com.amazonclone.model.User;
import com.amazonclone.repository.CartItemRepository;
import com.amazonclone.repository.OrderRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;

    @Value("${stripe.secret-key:}")
    private String stripeSecretKey;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public PaymentController(CartItemRepository cartItemRepository, OrderRepository orderRepository) {
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
    }

    @PostMapping("/checkout-session")
    public ResponseEntity<?> createCheckoutSession(@AuthenticationPrincipal User user,
                                                   @RequestBody Map<String, String> request) {
        if (stripeSecretKey.isBlank()) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Stripe is not configured on the backend."));
        }

        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cart is empty"));
        }

        try {
            Stripe.apiKey = stripeSecretKey;
            SessionCreateParams.Builder sessionBuilder = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(frontendUrl + "/checkout?payment=success&session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(frontendUrl + "/checkout?payment=cancelled");
                    sessionBuilder.putMetadata("userId", String.valueOf(user.getId()));
                    sessionBuilder.putMetadata("shippingAddress", request.getOrDefault("shippingAddress", user.getShippingAddress()));

            for (CartItem item : cartItems) {
                long amountInCents = item.getProduct().getPrice().movePointRight(2).longValueExact();
                SessionCreateParams.LineItem.PriceData.ProductData productData =
                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                .setName(item.getProduct().getName())
                                .build();
                SessionCreateParams.LineItem.PriceData priceData =
                        SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("usd")
                                .setUnitAmount(amountInCents)
                                .setProductData(productData)
                                .build();
                sessionBuilder.addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(Long.valueOf(item.getQuantity()))
                        .setPriceData(priceData)
                        .build());
            }

            Session session = Session.create(sessionBuilder.build());
            return ResponseEntity.ok(Map.of("sessionId", session.getId(), "url", session.getUrl()));
        } catch (StripeException | ArithmeticException exception) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Could not create Stripe Checkout session."));
        }
    }

    @PostMapping("/checkout-session/{sessionId}/complete")
    @Transactional
    public ResponseEntity<?> completeCheckout(@AuthenticationPrincipal User user,
                                               @PathVariable String sessionId) {
        try {
            Stripe.apiKey = stripeSecretKey;
            Session session = Session.retrieve(sessionId);
            if (!"paid".equals(session.getPaymentStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Stripe payment has not been completed."));
            }
            if (!String.valueOf(user.getId()).equals(session.getMetadata().get("userId"))) {
                return ResponseEntity.status(403).body(Map.of("error", "Payment does not belong to this account."));
            }

            List<CartItem> cartItems = cartItemRepository.findByUser(user);
            if (cartItems.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Cart is empty"));
            }

            Order order = new Order();
            order.setUser(user);
            order.setShippingAddress(session.getMetadata().get("shippingAddress"));
            order.setStatus(OrderStatus.PLACED);
            BigDecimal total = BigDecimal.ZERO;
            for (CartItem cartItem : cartItems) {
                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setProduct(cartItem.getProduct());
                orderItem.setProductNameSnapshot(cartItem.getProduct().getName());
                orderItem.setQuantity(cartItem.getQuantity());
                orderItem.setPriceAtPurchase(cartItem.getProduct().getPrice());
                order.getItems().add(orderItem);
                total = total.add(cartItem.getProduct().getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
            }
            order.setTotal(total);
            orderRepository.save(order);
            cartItemRepository.deleteByUser(user);
            return ResponseEntity.ok(Map.of("orderId", order.getId()));
        } catch (StripeException exception) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Could not verify Stripe payment."));
        }
    }
}