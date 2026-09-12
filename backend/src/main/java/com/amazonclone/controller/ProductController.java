package com.amazonclone.controller;

import com.amazonclone.dto.ProductDto;
import com.amazonclone.model.Product;
import com.amazonclone.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public List<ProductDto> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice
    ) {
        return productRepository.search(q, category, minPrice, maxPrice)
                .stream().map(ProductDto::from).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> get(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(p -> ResponseEntity.ok(ProductDto.from(p)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/categories")
    public List<String> categories() {
        return productRepository.findAll().stream()
                .map(Product::getCategory).distinct().toList();
    }
}
