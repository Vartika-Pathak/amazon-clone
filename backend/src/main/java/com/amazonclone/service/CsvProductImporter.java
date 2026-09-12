package com.amazonclone.service;

import com.amazonclone.model.Product;
import com.amazonclone.repository.ProductRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.Reader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

@Component
public class CsvProductImporter implements CommandLineRunner {

    private final ProductRepository productRepository;

    @Value("${amazon.catalog-import.path:data/raw/amazon_products_sales_data_cleaned.csv}")
    private String csvPath;

    @Value("${amazon.catalog-import.limit:500}")
    private int importLimit;

    public CsvProductImporter(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        normalizeExistingCategories();
        if (productRepository.count() >= importLimit) {
            return;
        }

        Path path = Path.of(csvPath);
        if (!Files.exists(path)) {
            System.out.println("Catalog CSV not found at " + path + "; keeping seeded products.");
            return;
        }

        int imported = 0;
        try (Reader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
            CSVFormat format = CSVFormat.DEFAULT.builder()
                    .setHeader()
                    .setSkipHeaderRecord(true)
                    .setIgnoreEmptyLines(true)
                    .build();

            for (CSVRecord row : format.parse(reader)) {
                if (productRepository.count() >= importLimit) {
                    break;
                }

                String title = value(row, "product_title");
                BigDecimal price = decimal(value(row, "discounted_price"));
                if (title.isBlank() || price == null) {
                    continue;
                }

                Product product = new Product();
                product.setName(title);
                product.setDescription("Amazon catalog product in " + value(row, "product_category") + ".");
                product.setPrice(price);
                String sourceCategory = value(row, "product_category");
                product.setCategory(normalizeCategory(title, sourceCategory.isBlank() ? "Other" : sourceCategory));
                product.setImageUrl(value(row, "product_image_url"));
                BigDecimal rating = decimal(value(row, "product_rating"));
                product.setRating(rating == null ? 0 : rating.doubleValue());
                product.setReviewCount(integer(value(row, "total_reviews")));
                product.setStock(Math.max(1, integer(value(row, "purchased_last_month"))));
                productRepository.save(product);
                imported++;
            }
        }

        System.out.println("Imported " + imported + " catalog products from " + path + ".");
    }

    private void normalizeExistingCategories() {
        for (Product product : productRepository.findAll()) {
            String normalized = normalizeCategory(product.getName(), product.getCategory());
            if (!normalized.equals(product.getCategory())) {
                product.setCategory(normalized);
                productRepository.save(product);
            }
        }
    }

    private String normalizeCategory(String title, String sourceCategory) {
        String searchable = (title + " " + sourceCategory).toLowerCase();
        if (searchable.matches(".*\\b(headphones?|earbuds?|earphones?|headsets?)\\b.*")) {
            return "Headphones";
        }
        if (searchable.matches(".*\\b(iphone|smartphone|mobile phone|cell phone|galaxy|pixel phone|oneplus|redmi|realme)\\b.*")) {
            return "Phones";
        }
        if (searchable.matches(".*\\b(laptop|notebook|macbook|chromebook|gaming laptop)\\b.*")) {
            return "Laptops";
        }
        if (searchable.matches(".*\\b(desktop|monitor|keyboard|mouse|computer|pc tower|workstation)\\b.*")) {
            return "Computers";
        }
        if (searchable.matches(".*\\b(camera|webcam|gopro|dslr)\\b.*")) {
            return "Cameras";
        }
        if (searchable.matches(".*\\b(printer|scanner|toner|ink)\\b.*")) {
            return "Printers & Scanners";
        }
        if (searchable.matches(".*\\b(charger|charging|power bank|battery|batteries|cable|usb cable|adapter)\\b.*")) {
            return "Chargers & Cables";
        }
        if (searchable.matches(".*\\b(power station|surge protector|extension cord|aa battery|aaa battery)\\b.*")) {
            return "Power & Batteries";
        }
        if (searchable.matches(".*\\b(tv|television|roku|projector)\\b.*")) {
            return "TV & Display";
        }
        if (searchable.matches(".*\\b(router|wifi|wi-fi|modem|ethernet|network switch)\\b.*")) {
            return "Networking";
        }
        if (searchable.matches(".*\\b(speaker|soundbar|home audio|bluetooth audio)\\b.*")) {
            return "Speakers";
        }
        if (searchable.matches(".*\\b(hard drive|ssd|flash drive|usb drive|memory card|microsd|storage)\\b.*")) {
            return "Storage";
        }
        if (searchable.matches(".*\\b(smartwatch|smart watch|fitbit|fitness tracker|apple watch|galaxy watch)\\b.*")) {
            return "Wearables";
        }
        if (searchable.matches(".*\\b(playstation|xbox|nintendo|gaming console|video game|game controller)\\b.*")) {
            return "Gaming";
        }
        if (searchable.matches(".*\\b(alexa|echo|airtag|smart home|security camera|doorbell|smart plug|robot vacuum)\\b.*")) {
            return "Smart Home";
        }
        if (searchable.matches(".*\\b(yoga|dumbbell|treadmill|fitness|running shoe|sports|water bottle|camping)\\b.*")) {
            return "Sports & Outdoors";
        }
        if (searchable.matches(".*\\b(shirt|dress|jacket|jeans|shoes|sneakers|clothing|apparel|watch)\\b.*")) {
            return "Fashion";
        }
        if (searchable.matches(".*\\b(book|novel|paperback|hardcover|kindle)\\b.*")) {
            return "Books";
        }
        if (searchable.matches(".*\\b(espresso|cookware|kitchen|furniture|bedding|decor|lamp|storage bin)\\b.*")) {
            return "Home & Kitchen";
        }
        return sourceCategory;
    }

    private String value(CSVRecord row, String column) {
        return row.isMapped(column) && row.get(column) != null ? row.get(column).trim() : "";
    }

    private BigDecimal decimal(String value) {
        try {
            return value.isBlank() ? null : new BigDecimal(value.replaceAll("[^0-9.-]", ""));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private int integer(String value) {
        BigDecimal number = decimal(value);
        return number == null ? 0 : number.intValue();
    }
}