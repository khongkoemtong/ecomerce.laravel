import 'package:flutter/foundation.dart';

class Product {
  final String id;
  final String name;
  final String description;
  final double price;
  final String imageUrl;
  final String category;
  final List<String> availableColors;
  final List<String> availableSizes;

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.imageUrl,
    required this.category,
    this.availableColors = const [],
    this.availableSizes = const [],
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    String img = json['image'] ?? 'https://via.placeholder.com/400x500';
    if (!img.startsWith('http')) {
      String host = 'http://127.0.0.1:8000';
      if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
        host = 'http://10.0.2.2:8000';
      }
      img = img.startsWith('/') ? '$host$img' : '$host/$img';
    } else {
      if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
        img = img.replaceAll('127.0.0.1', '10.0.2.2').replaceAll('localhost', '10.0.2.2');
      }
    }

    final categoryId = json['category_id']?.toString();
    String categoryName = 'Uncategorized';
    if (categoryId == '1') categoryName = 'New Season';
    else if (categoryId == '2') categoryName = 'Outerwear';
    else if (categoryId == '3') categoryName = 'Footwear';
    else if (categoryId == '4') categoryName = 'Accessories';

    return Product(
      id: json['id'].toString(),
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: (json['final_price'] ?? json['price'] ?? 0.0).toDouble(),
      imageUrl: img,
      category: categoryName,
      availableColors: ['#000000', '#2C3539', '#DCDCDC'], // Mocked for now
      availableSizes: ['XS', 'S', 'M', 'L'], // Mocked for now
    );
  }
}
