<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\ProductModel;

class ChatController extends Controller
{
    public function chat(Request $request)
    {
        $messages = $request->input('messages', []);
        $groqToken = env('GROQ_API_KEY');
        $userName = $request->input('userName');

        try {
            $dbProducts = ProductModel::get(['id', 'name', 'price', 'discount_price', 'description', 'image', 'slug']);
            $productCatalog = "";
            foreach ($dbProducts as $product) {
                $displayPrice = $product->discount_price ? "$".$product->discount_price : "$".$product->price;
                $prodId = $product->slug ?: $product->id;
                $imageUrl = $product->image ? (str_starts_with($product->image, 'http') ? $product->image : url($product->image)) : 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80';
                $productCatalog .= "- {$product->name} (Price: {$displayPrice}, Link: /product/{$prodId}, Image: {$imageUrl})\n";
            }
        } catch (\Exception $e) {
            $dbProducts = collect([]);
            $productCatalog = "- Sculptural Wool Overcoat (Price: $240, Link: /product/sculptural-wool-overcoat, Image: https://images.unsplash.com/photo-1515886657613-9f3515b0c78f)\n";
        }

        // If GROQ_API_KEY is not set, provide an intelligent in-character stylist response using DB products
        if (empty($groqToken)) {
            $lastUserMsg = '';
            foreach (array_reverse($messages) as $msg) {
                if (($msg['role'] ?? '') === 'user') {
                    $lastUserMsg = strtolower(trim($msg['content'] ?? ''));
                    break;
                }
            }

            $isFirstMessage = count($messages) <= 1;
            $isGreeting = preg_match('/\b(hi|hello|hey|greetings|good morning|good evening)\b/i', $lastUserMsg);
            $greetingPrefix = ($userName && ($isFirstMessage || $isGreeting)) ? "Hello {$userName}. " : "";

            // 1. Greetings & Positive feedback
            if (preg_match('/\b(hi|hello|hey|greetings|good morning|good evening)\b/i', $lastUserMsg)) {
                $reply = "{$greetingPrefix}Welcome to Atelier. As your personal digital stylist, how can I refine your wardrobe today?";
            } elseif (preg_match('/\b(good|great|nice|awesome|cool|thanks|thank you|love it|perfect|amazing)\b/i', $lastUserMsg)) {
                $reply = "{$greetingPrefix}I am delighted to hear that! Would you like to explore matching accessories or our latest luxury arrivals?";
            }
            // 2. Budget & Pricing queries
            elseif (str_contains($lastUserMsg, 'money') || str_contains($lastUserMsg, 'price') || str_contains($lastUserMsg, 'budget') || str_contains($lastUserMsg, 'cost') || str_contains($lastUserMsg, 'how much')) {
                $reply = "{$greetingPrefix}Atelier curates high-end fashion with varying investment tiers. Our ready-to-wear essentials begin around $120, tailored trousers and premium knitwear range from $160 - $240, while our handcrafted outerwear ranges from $280 to $310.";
            } 
            // 3. New arrivals
            elseif (str_contains($lastUserMsg, 'arrival') || str_contains($lastUserMsg, 'new') || str_contains($lastUserMsg, 'season')) {
                $reply = "{$greetingPrefix}Our latest arrivals feature sculptural virgin wool overcoats, bias-cut silk dresses, and Mongolian cashmere turtlenecks designed for timeless luxury.";
            }
            // 4. Product / Category keyword matching against DB products
            else {
                $matchedProduct = null;
                foreach ($dbProducts as $prod) {
                    $prodName = strtolower($prod->name);
                    $prodDesc = strtolower($prod->description ?? '');
                    // Check if any word in product name matches user message
                    $words = explode(' ', $lastUserMsg);
                    foreach ($words as $word) {
                        if (strlen($word) >= 3 && (str_contains($prodName, $word) || str_contains($prodDesc, $word))) {
                            $matchedProduct = $prod;
                            break 2;
                        }
                    }
                }

                if ($matchedProduct) {
                    $prodId = $matchedProduct->slug ?: $matchedProduct->id;
                    $displayPrice = $matchedProduct->discount_price ? "$".$matchedProduct->discount_price : "$".$matchedProduct->price;
                    $imgUrl = $matchedProduct->image ? (str_starts_with($matchedProduct->image, 'http') ? $matchedProduct->image : url($matchedProduct->image)) : 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80';
                    $reply = "{$greetingPrefix}Here is a curated piece that matches your interest: **{$matchedProduct->name}** ({$displayPrice}).\n\n[![{$matchedProduct->name}]({$imgUrl})](/product/{$prodId})";
                } elseif (str_contains($lastUserMsg, 'recommend') || str_contains($lastUserMsg, 'look') || str_contains($lastUserMsg, 'tailor') || str_contains($lastUserMsg, 'style') || str_contains($lastUserMsg, 'outfit') || str_contains($lastUserMsg, 'dress') || str_contains($lastUserMsg, 'coat')) {
                    $featured = $dbProducts->first();
                    if ($featured) {
                        $prodId = $featured->slug ?: $featured->id;
                        $displayPrice = $featured->discount_price ? "$".$featured->discount_price : "$".$featured->price;
                        $imgUrl = $featured->image ? (str_starts_with($featured->image, 'http') ? $featured->image : url($featured->image)) : 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80';
                        $reply = "{$greetingPrefix}For a refined, modern statement, I recommend the **{$featured->name}** ({$displayPrice}).\n\n[![{$featured->name}]({$imgUrl})](/product/{$prodId})";
                    } else {
                        $reply = "{$greetingPrefix}For an elevated daily uniform, I suggest pairing a structured wool overcoat with tailored trousers and minimal leather footwear.";
                    }
                } else {
                    $reply = "{$greetingPrefix}I would be happy to help with that. Are you looking for tailored outerwear, evening dresses, or casual luxury knitwear?";
                }
            }

            return response()->json([
                'choices' => [
                    [
                        'message' => [
                            'content' => $reply
                        ]
                    ]
                ]
            ]);
        }

        $userGreeting = $userName ? "The user you are speaking to is named {$userName}. Address them by their name occasionally." : "";

        $systemPrompt = "You are a professional, high-end digital stylist for 'Atelier', a luxury fashion brand featuring quiet luxury, clean lines, and architectural tailoring. Answer the user politely, in character as an elegant personal stylist. {$userGreeting}

CRITICAL RULES:
1. Keep your answers EXTREMELY short and concise. Do NOT write paragraphs. Limit responses to 1 or 2 sentences maximum.
2. NEVER mention that you are an AI, a chatbot, or a large language model.
3. You MUST only recommend products that are actually available in our store catalog:
{$productCatalog}
4. When recommending products, ALWAYS provide a Markdown link wrapping the product image, like this: [![Product Name](Image URL)](/product/id). Do not output a separate text link.";

        $formattedMessages = array_merge([
            ['role' => 'system', 'content' => $systemPrompt]
        ], $messages);

        try {
            $response = Http::timeout(60)->withHeaders([
                'Authorization' => "Bearer $groqToken",
                'Content-Type' => 'application/json',
            ])->post('https://api.groq.com/openai/v1/chat/completions', [
                'model' => 'llama-3.1-8b-instant',
                'messages' => $formattedMessages,
                'max_tokens' => 250,
                'temperature' => 0.7
            ]);

            if ($response->failed()) {
                $featured = $dbProducts->first();
                $reply = "Atelier curates high-end fashion with varying investment tiers. Ready-to-wear essentials begin from $120, tailored suits and knitwear range from $160-$240, while outerwear ranges from $280-$310.";
                return response()->json([
                    'choices' => [
                        [
                            'message' => [
                                'content' => $reply
                            ]
                        ]
                    ]
                ]);
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            $reply = "Welcome to Atelier. I am here to assist you with curated tailoring and luxury recommendations.";
            return response()->json([
                'choices' => [
                    [
                        'message' => [
                            'content' => $reply
                        ]
                    ]
                ]
            ]);
        }
    }
}
