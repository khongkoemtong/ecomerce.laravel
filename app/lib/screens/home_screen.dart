import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_typography.dart';
import '../widgets/product_card.dart';
import '../services/api_service.dart';
import '../models/product.dart';
import 'product_detail_screen.dart';
import 'placeholder_screen.dart';
import 'category_screen.dart';
import 'style_quiz_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Product> newArrivals = [];
  List<Product> trending = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchProducts();
  }

  Future<void> _fetchProducts() async {
    final products = await ApiService.getProducts();
    if (mounted) {
      setState(() {
        newArrivals = products.take(4).toList();
        trending = products.skip(4).take(4).toList();
        if (trending.isEmpty) trending = List.from(newArrivals);
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Center(child: CircularProgressIndicator(color: AppColors.black));
    }

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Hero Section
          Container(
            height: 500,
            width: double.infinity,
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: NetworkImage('https://i.pinimg.com/736x/88/cf/98/88cf985470364575a5bb15ed6a3c0e3e.jpg'),
                fit: BoxFit.cover,
              ),
            ),
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.transparent, Colors.black.withOpacity(0.5)],
                ),
              ),
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'NEW COLLECTION',
                    style: AppTypography.caption.copyWith(color: AppColors.white),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Elevate Your\nEveryday.',
                    style: AppTypography.heading1.copyWith(color: AppColors.white, fontSize: 36),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const PlaceholderScreen(title: 'Shop Now')),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.white,
                      foregroundColor: AppColors.black,
                      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                    ),
                    child: Text('SHOP NOW', style: AppTypography.button),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 40),

          // New Arrivals (Horizontal Carousel)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('NEW ARRIVALS', style: AppTypography.heading3),
                Text('View All', style: AppTypography.caption.copyWith(decoration: TextDecoration.underline)),
              ],
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            height: 320,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.only(left: 24.0, right: 8.0),
              itemCount: newArrivals.length,
              itemBuilder: (context, index) {
                final product = newArrivals[index];
                return Container(
                  width: 200,
                  margin: const EdgeInsets.only(right: 16.0),
                  child: ProductCard(
                    product: product,
                    onTap: () {
                      Navigator.push(
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
          
          // Categories (Horizontal scroll)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0),
            child: Text('SHOP BY CATEGORY', style: AppTypography.heading3),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 120,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.only(left: 24.0, right: 8.0),
              children: [
                _buildCategoryItem(context, 'New Season', 'https://i.pinimg.com/736x/27/8c/ab/278cabcc30624538662c9409417f6b50.jpg'),
                _buildCategoryItem(context, 'Outerwear', 'https://i.pinimg.com/1200x/40/0f/13/400f13c201cdb8f0dce30c0914aef482.jpg'),
                _buildCategoryItem(context, 'Accessories', 'https://i.pinimg.com/736x/f3/fb/ac/f3fbacee2ebada21395d358b8c77871d.jpg'),
                _buildCategoryItem(context, 'Footwear', 'https://i.pinimg.com/736x/ea/3e/08/ea3e08ca0edac942f63552aff1757f6d.jpg'),
              ],
            ),
          ),

          const SizedBox(height: 40),

          // Trending (Horizontal Carousel)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('TRENDING NOW', style: AppTypography.heading3),
                Text('View All', style: AppTypography.caption.copyWith(decoration: TextDecoration.underline)),
              ],
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            height: 320,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.only(left: 24.0, right: 8.0),
              itemCount: trending.length,
              itemBuilder: (context, index) {
                final product = trending[index];
                return Container(
                  width: 200,
                  margin: const EdgeInsets.only(right: 16.0),
                  child: ProductCard(
                    product: product,
                    onTap: () {
                      Navigator.push(
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

          // Define Your Sartorial DNA
          Container(
            color: AppColors.darkSection,
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 40.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('ATELIER INTELLIGENCE', style: AppTypography.caption.copyWith(color: AppColors.white)),
                const SizedBox(height: 16),
                Text('Define Your\nSartorial DNA.', style: AppTypography.heading2.copyWith(color: AppColors.white, fontSize: 28)),
                const SizedBox(height: 16),
                Text(
                  'Our algorithm crafts a personalized style profile based on your aesthetic preferences.',
                  style: AppTypography.bodyMedium.copyWith(color: AppColors.white.withOpacity(0.8)),
                ),
                const SizedBox(height: 24),
                OutlinedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const StyleQuizScreen()),
                    );
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.white,
                    side: const BorderSide(color: AppColors.white),
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                  ),
                  child: Text('TAKE THE STYLE QUIZ', style: AppTypography.button.copyWith(color: AppColors.white)),
                )
              ],
            ),
          ),

          // Wear the Vision (Lookbook)
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('THE LOOKBOOK', style: AppTypography.caption),
                const SizedBox(height: 16),
                Text('Wear the Vision', style: AppTypography.heading3),
                const SizedBox(height: 24),
                SizedBox(
                  height: 300,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: [
                      Container(
                        width: 250,
                        margin: const EdgeInsets.only(right: 16),
                        child: Image.network('https://i.pinimg.com/1200x/95/d3/90/95d390e98b974e68f26f46ec59121614.jpg', fit: BoxFit.cover, errorBuilder: (context, error, stackTrace) => const Center(child: Icon(Icons.image_not_supported, color: Colors.grey))),
                      ),
                      Container(
                        width: 250,
                        margin: const EdgeInsets.only(right: 16),
                        child: Image.network('https://i.pinimg.com/736x/2d/aa/a7/2daaa7408129ebac963ffaf43e7a4836.jpg', fit: BoxFit.cover, errorBuilder: (context, error, stackTrace) => const Center(child: Icon(Icons.image_not_supported, color: Colors.grey))),
                      ),
                      Container(
                        width: 250,
                        margin: const EdgeInsets.only(right: 16),
                        child: Image.network('https://i.pinimg.com/736x/fe/36/52/fe365203744ded6a4083dba981653868.jpg', fit: BoxFit.cover, errorBuilder: (context, error, stackTrace) => const Center(child: Icon(Icons.image_not_supported, color: Colors.grey))),
                      ),
                      Container(
                        width: 250,
                        margin: const EdgeInsets.only(right: 16),
                        child: Image.network('https://i.pinimg.com/736x/55/ab/a4/55aba43d6c93be2db06497f1fbc8fcb3.jpg', fit: BoxFit.cover, errorBuilder: (context, error, stackTrace) => const Center(child: Icon(Icons.image_not_supported, color: Colors.grey))),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildCategoryItem(BuildContext context, String title, String imageUrl) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => CategoryScreen(categoryName: title)),
        );
      },
      child: Container(
        width: 100,
        margin: const EdgeInsets.only(right: 16.0),
        child: Column(
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                image: DecorationImage(
                  image: NetworkImage(imageUrl),
                  fit: BoxFit.cover,
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              title.toUpperCase(),
              style: AppTypography.caption.copyWith(fontWeight: FontWeight.w600),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
