<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class AbaPayWayService
{
    protected string $apiUrl;
    protected string $merchantId;
    protected string $apiKey;
    protected string $returnUrl;
    protected string $cancelUrl;
    protected string $continueSuccessUrl;

    public function __construct()
    {
        $this->apiUrl = rtrim(config('services.aba_payway.api_url', 'https://checkout-sandbox.payway.com.kh'), '/');
        $this->merchantId = (string) config('services.aba_payway.merchant_id', 'ec478203');
        $this->apiKey = (string) config('services.aba_payway.api_key', 'a05920e47371f5879901f59cb6ee2e9df0a3a76c');
        $this->returnUrl = (string) config('services.aba_payway.return_url', 'http://localhost:5173/payment/success');
        $this->cancelUrl = (string) config('services.aba_payway.cancel_url', 'http://localhost:5173/bag');
        $this->continueSuccessUrl = (string) config('services.aba_payway.continue_success_url', 'http://localhost:5173/orders');
    }

    /**
     * Compute ABA PayWay HMAC-SHA512 Base64 Hash
     */
    public function getHash(string $str): string
    {
        return base64_encode(hash_hmac('sha512', $str, $this->apiKey, true));
    }

    /**
     * Create Dynamic ABA PayWay KHQR with Auto Pre-filled Amount
     */
    public function createPurchase(
        string $tranId,
        float $amountUsd,
        array $items = [],
        string $firstName = 'Customer',
        string $lastName = 'User',
        string $email = 'customer@example.com',
        string $phone = '012345678',
        string $currency = 'KHR'
    ): array {
        $reqTime = date('YmdHis');

        // Convert USD to KHR if KHR merchant currency
        if (strtoupper($currency) === 'KHR') {
            $formattedAmount = number_format(round($amountUsd * 4000), 2, '.', '');
        } else {
            $formattedAmount = number_format($amountUsd, 2, '.', '');
        }

        $type = 'purchase';
        $paymentOption = 'abapay_khqr';
        $shipping = '0.00';
        $returnUrl = base64_encode($this->returnUrl);
        $cancelUrl = base64_encode($this->cancelUrl);
        $continueSuccessUrl = base64_encode($this->continueSuccessUrl);
        $returnParams = $tranId;

        // Prepare encoded items
        if (empty($items)) {
            $items = [
                ['name' => 'Order ' . $tranId, 'quantity' => '1', 'price' => $formattedAmount]
            ];
        }
        $itemsEncoded = base64_encode(json_encode($items));

        // Generate Hash string for PayWay Purchase API
        $hashStr = $reqTime . $this->merchantId . $tranId . $formattedAmount . $itemsEncoded . $shipping . $firstName . $lastName . $email . $phone . $type . $paymentOption . $returnUrl . $cancelUrl . $continueSuccessUrl . $returnParams;
        $hash = $this->getHash($hashStr);

        $payload = [
            'req_time' => $reqTime,
            'merchant_id' => $this->merchantId,
            'tran_id' => $tranId,
            'amount' => $formattedAmount,
            'items' => $itemsEncoded,
            'shipping' => $shipping,
            'firstname' => $firstName,
            'lastname' => $lastName,
            'email' => $email,
            'phone' => $phone,
            'type' => $type,
            'payment_option' => $paymentOption,
            'return_url' => $returnUrl,
            'cancel_url' => $cancelUrl,
            'continue_success_url' => $continueSuccessUrl,
            'return_params' => $returnParams,
            'hash' => $hash,
        ];

        try {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, "{$this->apiUrl}/api/payment-gateway/v1/payments/purchase");
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($payload));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 15);
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                Log::error('ABA PayWay cURL Error: ' . $curlError);
            }

            $result = json_decode($response, true) ?? [];

            Log::info('ABA PayWay purchase raw response', [
                'http_code' => $httpCode,
                'raw_response' => $response,
                'curl_error' => $curlError
            ]);

            if ($httpCode === 200 && isset($result['qrString'])) {
                return [
                    'success' => true,
                    'qr_string' => $result['qrString'],
                    'qr_image' => $result['qrImage'] ?? null,
                    'abapay_deeplink' => $result['abapay_deeplink'] ?? null,
                    'tran_id' => $tranId,
                    'amount' => $formattedAmount,
                    'currency' => $currency,
                    'raw' => $result,
                ];
            }

            Log::error('ABA PayWay purchase failed', ['response' => $result]);
            return [
                'success' => false,
                'message' => $result['status']['message'] ?? ($result['description'] ?? 'Unable to generate ABA PayWay QR'),
                'raw' => $result,
            ];
        } catch (\Throwable $e) {
            Log::error('ABA PayWay purchase exception: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check transaction status with ABA PayWay
     */
    public function checkTransaction(string $tranId): array
    {
        $reqTime = date('YmdHis');
        $hashStr = $reqTime . $this->merchantId . $tranId;
        $hash = $this->getHash($hashStr);

        $payload = [
            'req_time' => $reqTime,
            'merchant_id' => $this->merchantId,
            'tran_id' => $tranId,
            'hash' => $hash,
        ];

        try {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, "{$this->apiUrl}/api/payment-gateway/v1/payments/check-transaction");
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($payload));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            $response = curl_exec($ch);
            curl_close($ch);

            $result = json_decode($response, true) ?? [];
            $status = $result['status'] ?? null;

            // Status 0: APPROVED / PAID
            $isPaid = ($status === 0 || $status === '0' || (isset($result['payment_status']) && strtolower($result['payment_status']) === 'approved'));

            return [
                'success' => true,
                'paid' => $isPaid,
                'status_code' => $status,
                'description' => $result['description'] ?? ($result['message'] ?? ''),
                'raw' => $result,
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'paid' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
