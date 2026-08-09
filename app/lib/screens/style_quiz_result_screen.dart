import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_typography.dart';
import '../models/product.dart';
import '../services/api_service.dart';
import '../widgets/product_card.dart';
import 'product_detail_screen.dart';

class StyleQuizResultScreen extends StatefulWidget {
  const StyleQuizResultScreen({super.key});

  @override
  State<StyleQuizResultScreen> createState() => _StyleQuizResultScreenState();
}

class _StyleQuizResultScreenState extends State<StyleQuizResultScreen> {
  List<Product> recommendedProducts = [];
  bool isLoading = true;
  final String _styleProfile = "THE MODERN MINIMALIST";

  @override
  void initState() {
    super.initState();
    _fetchRecommendations();
  }

  Future<void> _fetchRecommendations() async {
    final allProducts = await ApiService.getProducts();
    if (mounted) {
      setState(() {
        // Just take a curated selection or random products for now
        // In a real app, this would use the user's answers to filter
        allProducts.shuffle();
        recommendedProducts = allProducts.take(4).toList();
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: AppBar(
        backgroundColor: AppColors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: AppColors.black),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.black))
          : SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(height: 20),
                  Text('YOUR SARTORIAL DNA', style: AppTypography.caption),
                  const SizedBox(height: 16),
                  Text(
                    _styleProfile,
                    style: AppTypography.heading2.copyWith(fontSize: 28),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32.0),
                    child: Text(
                      'Based on your choices, we have curated a selection of refined pieces that align with your aesthetic vision. Effortless, clean, and uncompromisingly modern.',
                      style: AppTypography.bodyMedium.copyWith(color: AppColors.textSecondary, height: 1.5),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  const SizedBox(height: 48),
                  
                  // Product Grid
                  Container(
                    color: AppColors.background,
                    padding: const EdgeInsets.symmetric(vertical: 40.0, horizontal: 24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('CURATED FOR YOU', style: AppTypography.heading3),
                        const SizedBox(height: 24),
                        GridView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            childAspectRatio: 0.55,
                            crossAxisSpacing: 16,
                            mainAxisSpacing: 24,
                          ),
                          itemCount: recommendedProducts.length,
                          itemBuilder: (context, index) {
                            final product = recommendedProducts[index];
                            return ProductCard(
                              product: product,
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => ProductDetailScreen(product: product),
                                  ),
                                );
                              },
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
