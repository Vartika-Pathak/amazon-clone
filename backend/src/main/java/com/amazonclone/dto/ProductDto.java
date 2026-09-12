package com.amazonclone.dto;

import com.amazonclone.model.Product;

import java.math.BigDecimal;

public class ProductDto {
    public Long id;
    public String name;
    public String description;
    public BigDecimal price;
    public String category;
    public String imageUrl;
    public Double rating;
    public Integer reviewCount;
    public Integer stock;

    public static ProductDto from(Product p) {
        ProductDto d = new ProductDto();
        d.id = p.getId();
        d.name = p.getName();
        d.description = p.getDescription();
        d.price = p.getPrice();
        d.category = p.getCategory();
        d.imageUrl = p.getImageUrl();
        d.rating = p.getRating();
        d.reviewCount = p.getReviewCount();
        d.stock = p.getStock();
        return d;
    }
}
