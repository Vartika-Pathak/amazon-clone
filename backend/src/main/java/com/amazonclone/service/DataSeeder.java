package com.amazonclone.service;

import com.amazonclone.model.Product;
import com.amazonclone.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;

    public DataSeeder(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) return;

        seed("Wireless Noise-Cancelling Headphones", "Over-ear headphones with 30-hour battery life and adaptive noise cancellation.",
                new BigDecimal("129.99"), "Electronics", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", 4.5, 2130, 50);
        seed("Mechanical Keyboard - RGB Backlit", "Hot-swappable mechanical keyboard with tactile brown switches and per-key RGB.",
                new BigDecimal("89.99"), "Electronics", "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500", 4.6, 890, 35);
        seed("4K Ultra HD Smart TV - 55 inch", "Crisp 4K display with built-in streaming apps and voice remote.",
                new BigDecimal("449.00"), "Electronics", "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500", 4.3, 1520, 20);
        seed("Espresso Machine with Milk Frother", "15-bar pump espresso machine with automatic milk frother for lattes and cappuccinos.",
                new BigDecimal("199.99"), "Home & Kitchen", "https://images.unsplash.com/photo-1517914309068-f9226e0f9a29?w=500", 4.4, 640, 15);
        seed("Non-Stick Cookware Set (10-Piece)", "Durable non-stick cookware set including pots, pans, and lids.",
                new BigDecimal("119.99"), "Home & Kitchen", "https://images.unsplash.com/photo-1584990347449-a5d9f800a783?w=500", 4.7, 980, 40);
        seed("Robot Vacuum Cleaner", "Smart robot vacuum with app control, mapping, and auto-recharge.",
                new BigDecimal("249.99"), "Home & Kitchen", "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500", 4.2, 2310, 25);
        seed("Running Shoes - Men's", "Lightweight breathable running shoes with cushioned sole.",
                new BigDecimal("69.99"), "Fashion", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", 4.5, 3200, 100);
        seed("Classic Leather Jacket", "Genuine leather jacket with a timeless biker-style cut.",
                new BigDecimal("159.99"), "Fashion", "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500", 4.4, 410, 30);
        seed("Minimalist Analog Watch", "Stainless steel minimalist watch with leather strap.",
                new BigDecimal("59.99"), "Fashion", "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500", 4.6, 780, 60);
        seed("The Midnight Library (Novel)", "A bestselling novel about infinite possibilities and choices.",
                new BigDecimal("14.99"), "Books", "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500", 4.8, 15200, 200);
        seed("Atomic Habits (Book)", "A practical guide to building good habits and breaking bad ones.",
                new BigDecimal("16.99"), "Books", "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500", 4.9, 22000, 180);
        seed("Yoga Mat - Extra Thick", "Non-slip extra thick yoga mat with carrying strap.",
                new BigDecimal("24.99"), "Sports & Outdoors", "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500", 4.5, 1340, 90);
        seed("Adjustable Dumbbell Set", "Space-saving adjustable dumbbells, 5-52.5 lbs per dumbbell.",
                new BigDecimal("299.99"), "Sports & Outdoors", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500", 4.7, 560, 12);
        seed("Stainless Steel Water Bottle", "Insulated water bottle that keeps drinks cold for 24 hours.",
                new BigDecimal("19.99"), "Sports & Outdoors", "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500", 4.6, 4200, 150);
        seed("Wireless Charging Pad", "Fast wireless charger compatible with all Qi-enabled devices.",
                new BigDecimal("22.99"), "Electronics", "https://images.unsplash.com/photo-1591290619762-c5bd6a44dfa6?w=500", 4.3, 990, 70);
        seed("Bluetooth Portable Speaker", "Waterproof portable speaker with 20-hour battery and deep bass.",
                new BigDecimal("49.99"), "Electronics", "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500", 4.5, 1780, 45);
    }

    private void seed(String name, String desc, BigDecimal price, String category, String img, double rating, int reviews, int stock) {
        Product p = new Product();
        p.setName(name);
        p.setDescription(desc);
        p.setPrice(price);
        p.setCategory(category);
        p.setImageUrl(img);
        p.setRating(rating);
        p.setReviewCount(reviews);
        p.setStock(stock);
        productRepository.save(p);
    }
}
