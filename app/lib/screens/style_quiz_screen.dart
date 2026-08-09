import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_typography.dart';
import 'style_quiz_result_screen.dart';

class StyleQuizScreen extends StatefulWidget {
  const StyleQuizScreen({super.key});

  @override
  State<StyleQuizScreen> createState() => _StyleQuizScreenState();
}

class _StyleQuizScreenState extends State<StyleQuizScreen> {
  final PageController _pageController = PageController();
  int _currentIndex = 0;
  
  final List<Map<String, dynamic>> _questions = [
    {
      'question': 'What is your preferred color palette?',
      'options': [
        {'title': 'Neutrals', 'image': 'https://i.pinimg.com/564x/cd/6d/27/cd6d2745347253574d7589d3edb0151f.jpg'},
        {'title': 'Monochromes', 'image': 'https://i.pinimg.com/736x/88/cf/98/88cf985470364575a5bb15ed6a3c0e3e.jpg'},
        {'title': 'Earth Tones', 'image': 'https://i.pinimg.com/564x/44/21/df/4421df8c2bc82084c79872be9c836ddf.jpg'},
        {'title': 'Bold & Vibrant', 'image': 'https://i.pinimg.com/564x/07/75/cd/0775cd0c8db99da40d86e92750893046.jpg'},
      ],
    },
    {
      'question': 'Which aesthetic resonates with you?',
      'options': [
        {'title': 'Minimalist', 'image': 'https://i.pinimg.com/564x/95/d3/90/95d390e98b974e68f26f46ec59121614.jpg'},
        {'title': 'Streetwear', 'image': 'https://i.pinimg.com/564x/2d/aa/a7/2daaa7408129ebac963ffaf43e7a4836.jpg'},
        {'title': 'Classic Tailoring', 'image': 'https://i.pinimg.com/564x/c6/46/ea/c646ea606567d389ffd27f0efbde2185.jpg'},
        {'title': 'Avant-Garde', 'image': 'https://i.pinimg.com/564x/fe/36/52/fe365203744ded6a4083dba981653868.jpg'},
      ],
    },
    {
      'question': 'What is your go-to weekend outfit?',
      'options': [
        {'title': 'Tailored Trousers & Polo', 'image': 'https://i.pinimg.com/564x/11/49/ea/1149ea8ca3dc7b458b0222f7ccdc79e5.jpg'},
        {'title': 'Oversized Hoodie & Sneakers', 'image': 'https://i.pinimg.com/564x/55/ab/a4/55aba43d6c93be2db06497f1fbc8fcb3.jpg'},
        {'title': 'Slip Dress & Boots', 'image': 'https://i.pinimg.com/736x/f8/10/9b/f8109b0ba53596059df9dfba8c5063f7.jpg'},
        {'title': 'Structured Coat & Denim', 'image': 'https://i.pinimg.com/564x/4d/dd/c4/4dddc40a4bfd08371d0ad039cfd87018.jpg'},
      ],
    }
  ];

  final Map<int, String> _answers = {};

  void _onOptionSelected(String title) {
    setState(() {
      _answers[_currentIndex] = title;
    });

    if (_currentIndex < _questions.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
    } else {
      _finishQuiz();
    }
  }

  void _finishQuiz() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const Center(
        child: CircularProgressIndicator(color: AppColors.white),
      ),
    );

    Future.delayed(const Duration(seconds: 2), () {
      Navigator.pop(context); // remove dialog
      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) => const StyleQuizResultScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(opacity: animation, child: child);
          },
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: AppColors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'STEP ${_currentIndex + 1} OF ${_questions.length}',
          style: AppTypography.caption,
        ),
        centerTitle: true,
      ),
      body: PageView.builder(
        controller: _pageController,
        physics: const NeverScrollableScrollPhysics(), // Disable manual swipe
        onPageChanged: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        itemCount: _questions.length,
        itemBuilder: (context, index) {
          final questionData = _questions[index];
          final options = questionData['options'] as List<Map<String, dynamic>>;

          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),
                Text(
                  questionData['question'],
                  style: AppTypography.heading2,
                ),
                const SizedBox(height: 40),
                Expanded(
                  child: GridView.builder(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      childAspectRatio: 0.75, // Taller cards
                    ),
                    itemCount: options.length,
                    itemBuilder: (context, optionIndex) {
                      final option = options[optionIndex];
                      final isSelected = _answers[index] == option['title'];
                      
                      return GestureDetector(
                        onTap: () => _onOptionSelected(option['title']),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: isSelected ? AppColors.black : Colors.transparent,
                              width: 2,
                            ),
                          ),
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              Image.network(
                                option['image'],
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => Container(color: Colors.grey[300]),
                              ),
                              Container(
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    begin: Alignment.topCenter,
                                    end: Alignment.bottomCenter,
                                    colors: [
                                      Colors.transparent,
                                      Colors.black.withOpacity(0.7),
                                    ],
                                  ),
                                ),
                              ),
                              Positioned(
                                bottom: 12,
                                left: 12,
                                right: 12,
                                child: Text(
                                  option['title'].toUpperCase(),
                                  style: AppTypography.caption.copyWith(
                                    color: AppColors.white,
                                    fontWeight: FontWeight.w600,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
