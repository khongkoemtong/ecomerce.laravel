import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_typography.dart';
import '../models/product.dart';
import '../widgets/product_card.dart';
import '../services/api_service.dart';
import '../services/app_state.dart';
import '../utils/toast_utils.dart';

class ProductDetailScreen extends StatefulWidget {
  final Product product;

  const ProductDetailScreen({super.key, required this.product});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  String selectedSize = 'M';
  int _currentImageIndex = 0;
  List<Product> completeTheLook = [];

  @override
  void initState() {
    super.initState();
    _fetchProducts();
  }

  Future<void> _fetchProducts() async {
    final products = await ApiService.getProducts();
    if (mounted) {
      setState(() {
        completeTheLook = products.take(4).toList();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    // Simulate a list of images for the carousel
    final images = [
      widget.product.imageUrl,
      'https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=800&q=80',
      'https://images.unsplash.com/photo-1550614000-4b95dd26b1d4?w=800&q=80',
    ];

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: AppColors.black),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          ValueListenableBuilder<List<Product>>(
            valueListenable: AppState().wishlistItems,
            builder: (context, wishlist, child) {
              final isFavorite = wishlist.any((p) => p.id == widget.product.id);
              return IconButton(
                icon: Icon(
                  isFavorite ? Icons.favorite : Icons.favorite_border, 
                  color: isFavorite ? Colors.red : AppColors.black
                ),
                onPressed: () {
                  AppState().toggleWishlist(widget.product);
                },
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.share_outlined, color: AppColors.black),
            onPressed: () {},
          ),
        ],
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.only(bottom: 100), // Space for sticky button
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Image Carousel
                SizedBox(
                  height: 500,
                  child: Stack(
                    children: [
                      PageView.builder(
                        itemCount: images.length,
                        onPageChanged: (index) {
                          setState(() {
                            _currentImageIndex = index;
                          });
                        },
                        itemBuilder: (context, index) {
                          return Image.network(images[index], fit: BoxFit.cover, width: double.infinity);
                        },
                      ),
                      // Pagination Dots
                      Positioned(
                        bottom: 16,
                        left: 0,
                        right: 0,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: List.generate(
                            images.length,
                            (index) => Container(
                              margin: const EdgeInsets.symmetric(horizontal: 4),
                              width: 8,
                              height: 8,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: _currentImageIndex == index ? AppColors.black : AppColors.border,
                              ),
                            ),
                          ),
                        ),
                      )
                    ],
                  ),
                ),
                
                // Product Details
                Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(widget.product.category.toUpperCase(), style: AppTypography.caption),
                      const SizedBox(height: 8),
                      Text(widget.product.name, style: AppTypography.heading2),
                      const SizedBox(height: 8),
                      Text('\$${widget.product.price.toStringAsFixed(2)}', style: AppTypography.heading3),
                      const SizedBox(height: 24),
                      
                      // Color Selection
                      Text('COLOR: NOIR', style: AppTypography.caption),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          _colorSwatch('#000000', true),
                          _colorSwatch('#2C3539', false),
                          _colorSwatch('#DCDCDC', false),
                        ],
                      ),
                      const SizedBox(height: 24),
                      
                      // Size Selection
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('SIZE SELECTION', style: AppTypography.caption),
                          Text('Size Guide', style: AppTypography.caption.copyWith(decoration: TextDecoration.underline)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: ['XS', 'S', 'M', 'L'].map((size) {
                          return Expanded(
                            child: GestureDetector(
                              onTap: () => setState(() => selectedSize = size),
                              child: Container(
                                margin: const EdgeInsets.only(right: 8),
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                decoration: BoxDecoration(
                                  color: selectedSize == size ? AppColors.black : AppColors.white,
                                  border: Border.all(color: AppColors.border),
                                ),
                                alignment: Alignment.center,
                                child: Text(
                                  size,
                                  style: AppTypography.bodySmall.copyWith(
                                    color: selectedSize == size ? AppColors.white : AppColors.textPrimary,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 32),
                      
                      // Accordion Sections
                      const Divider(color: AppColors.border),
                      Theme(
                        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                        child: ExpansionTile(
                          tilePadding: EdgeInsets.zero,
                          title: Text('PRODUCT DESCRIPTION', style: AppTypography.caption),
                          children: [
                            Padding(
                              padding: const EdgeInsets.only(bottom: 16.0),
                              child: Text(
                                widget.product.description,
                                style: AppTypography.bodyMedium.copyWith(color: AppColors.textSecondary, height: 1.5),
                              ),
                            )
                          ],
                        ),
                      ),
                      const Divider(color: AppColors.border),
                      Theme(
                        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                        child: ExpansionTile(
                          tilePadding: EdgeInsets.zero,
                          title: Text('MATERIAL & CARE', style: AppTypography.caption),
                          children: [
                            Padding(
                              padding: const EdgeInsets.only(bottom: 16.0),
                              child: Text(
                                'Dry clean only. Handle with care.',
                                style: AppTypography.bodyMedium.copyWith(color: AppColors.textSecondary, height: 1.5),
                              ),
                            )
                          ],
                        ),
                      ),
                      const Divider(color: AppColors.border),
                    ],
                  ),
                ),

                // Complete the look
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
                  child: Text('COMPLETE THE LOOK', style: AppTypography.heading3),
                ),
                SizedBox(
                  height: 320,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.only(left: 24.0, right: 8.0),
                    itemCount: completeTheLook.length,
                    itemBuilder: (context, index) {
                      final product = completeTheLook[index];
                      return Container(
                        width: 200,
                        margin: const EdgeInsets.only(right: 16.0),
                        child: ProductCard(
                          product: product,
                          onTap: () {
                            Navigator.pushReplacement(
                              context,
                              MaterialPageRoute(builder: (_) => ProductDetailScreen(product: product)),
                            );
                          },
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),
          
          // Sticky Bottom Add to Bag Button
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(24.0),
              decoration: BoxDecoration(
                color: AppColors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    offset: const Offset(0, -4),
                    blurRadius: 10,
                  )
                ],
              ),
              child: ElevatedButton(
                onPressed: () {
                  AppState().addToCart(widget.product);
                  ToastUtils.showTopRightToast(context, '${widget.product.name} added to cart');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.black,
                  foregroundColor: AppColors.white,
                  padding: const EdgeInsets.symmetric(vertical: 20),
                  shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                ),
                child: Text('ADD TO BAG - \$${widget.product.price.toStringAsFixed(2)}', style: AppTypography.button),
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _colorSwatch(String hexCode, bool isSelected) {
    Color color = Color(int.parse(hexCode.replaceAll('#', '0xff')));
    return Container(
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.all(2),
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: isSelected ? AppColors.black : Colors.transparent),
      ),
      child: Container(
        width: 30,
        height: 30,
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
          border: Border.all(color: AppColors.border),
        ),
      ),
    );
  }
}
