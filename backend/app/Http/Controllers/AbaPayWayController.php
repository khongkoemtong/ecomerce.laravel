<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Services\AbaPayWayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AbaPayWayController extends Controller
{
    protected AbaPayWayService $abaService;

    public function __construct(AbaPayWayService $abaService)
    {
        $this->abaService = $abaService;
    }

    /**
     * Generate ABA PayWay Dynamic KHQR with Auto-Price
     */
    public function generateQr(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'order_number' => 'nullable|string',
            'order_id' => 'nullable|integer',
            'items' => 'nullable|array',
            'firstname' => 'nullable|string',
            'lastname' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
        ]);

        $amount = (float) $request->input('amount');
        $tranId = $request->input('order_number') ?: ('ORD-' . date('Ymd') . '-' . rand(1000, 9999));
        $items = $request->input('items') ?: [];
        $firstName = $request->input('firstname') ?: 'Customer';
        $lastName = $request->input('lastname') ?: 'User';
        $phone = $request->input('phone') ?: '012345678';
        $email = $request->input('email') ?: 'customer@example.com';

        $result = $this->abaService->createPurchase(
            $tranId,
            $amount,
            $items,
            $firstName,
            $lastName,
            $email,
            $phone,
            'KHR' // Sandbox merchant account is KHR
        );

        if (!$result['success']) {
            return new JsonResponse([
                'success' => false,
                'message' => $result['message'] ?? 'Failed to generate ABA PayWay QR',
                'raw' => $result['raw'] ?? null,
            ], 400);
        }

        return new JsonResponse([
            'success' => true,
            'tran_id' => $tranId,
            'amount_usd' => $amount,
            'amount_khr' => round($amount * 4000),
            'qr_string' => $result['qr_string'],
            'qr_image' => $result['qr_image'],
            'abapay_deeplink' => $result['abapay_deeplink'],
        ]);
    }

    /**
     * Check Transaction Status with ABA PayWay
     */
    public function checkStatus(Request $request): JsonResponse
    {
        $request->validate([
            'tran_id' => 'required|string',
            'order_id' => 'nullable|integer',
        ]);

        $tranId = $request->input('tran_id');
        $orderId = $request->input('order_id');

        $result = $this->abaService->checkTransaction($tranId);

        if ($result['paid']) {
            // Find and update Order
            $order = $orderId ? Order::find($orderId) : Order::where('order_number', $tranId)->first();
            if ($order && $order->payment_status !== 'paid') {
                $order->update([
                    'payment_status' => 'paid',
                    'status' => 'processing',
                ]);

                Payment::firstOrCreate(
                    ['order_id' => $order->id, 'transaction_id' => $tranId],
                    [
                        'payment_method' => 'ABA PayWay Dynamic KHQR',
                        'amount' => $order->total_amount,
                        'currency' => 'USD',
                        'status' => 'completed',
                        'payload' => json_encode($result),
                    ]
                );
            }
        }

        return new JsonResponse([
            'success' => true,
            'paid' => $result['paid'],
            'status_code' => $result['status_code'] ?? null,
            'description' => $result['description'] ?? '',
        ]);
    }

    /**
     * Webhook / Callback Handler from ABA Server
     */
    public function handleCallback(Request $request): JsonResponse
    {
        Log::info('ABA PayWay Webhook Received', $request->all());

        $tranId = $request->input('tran_id');
        $status = $request->input('status');

        if ($tranId && ($status === 0 || $status === '0')) {
            $order = Order::where('order_number', $tranId)->first();
            if ($order) {
                $order->update([
                    'payment_status' => 'paid',
                    'status' => 'processing',
                ]);
            }
        }

        return new JsonResponse(['status' => 'ok']);
    }
}
