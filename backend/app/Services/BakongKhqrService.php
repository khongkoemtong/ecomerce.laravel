<?php

namespace App\Services;

use Throwable;

class BakongKhqrService
{
    private string $bakongId;
    private string $merchantName;
    private string $merchantCity;
    private string $accountNumber;
    private string $acquiringBank;
    private ?string $apiToken;

    public function __construct(
        ?string $bakongId = null,
        ?string $merchantName = null,
        ?string $merchantCity = null,
        ?string $accountNumber = null,
        ?string $acquiringBank = null,
        ?string $apiToken = null
    ) {
        $this->bakongId = $bakongId ?: (config('services.bakong.merchant_id') ?: env('BAKONG_MERCHANT_ID', 'abaakhppxxx@abaa'));
        $this->merchantName = $merchantName ?: (config('services.bakong.merchant_name') ?: env('BAKONG_MERCHANT_NAME', 'KHONG KOEMTONG'));
        $this->merchantCity = $merchantCity ?: (config('services.bakong.merchant_city') ?: env('BAKONG_MERCHANT_CITY', 'Phnom Penh'));
        $this->accountNumber = $accountNumber ?: (config('services.bakong.account_number') ?: env('BAKONG_ACCOUNT_NUMBER', '126090615275613'));
        $this->acquiringBank = $acquiringBank ?: (config('services.bakong.acquiring_bank') ?: env('BAKONG_ACQUIRING_BANK', 'ABA Bank'));
        $this->apiToken = $apiToken ?: (config('services.bakong.api_token') ?: env('BAKONG_API_TOKEN'));
    }

    /**
     * Format EMVCo TLV (Tag-Length-Value) element
     */
    private function formatTlv(string $tag, string $value): string
    {
        $len = str_pad((string) strlen($value), 2, '0', STR_PAD_LEFT);
        return $tag . $len . $value;
    }

    /**
     * Generate Official Universal USD Merchant KHQR with Auto-Price ($ USD)
     * Compatible with Bakong App, ABA Mobile, ACLEDA Unity, Wing, Canadia, Sathapana, etc.
     */
    public function generateDynamicKhqr(float $amount, string $billNumber, string $currency = 'USD', ?string $bakongAccount = null, ?string $merchantName = null): array
    {
        $amountUsd = round((float) $amount, 2);
        $name = $merchantName ?: $this->merchantName;
        $account = $bakongAccount ?: $this->bakongId;
        $cleanBill = $billNumber ? substr(preg_replace('/[^A-Za-z0-9_-]/', '', $billNumber), 0, 16) : ('ORD' . date('ymdHis'));

        // 1. Generate Universal USD KHQR with Auto Pre-filled Amount (Tag 54)
        $payload = '';
        $payload .= $this->formatTlv('00', '01');
        $payload .= $this->formatTlv('01', '11'); // 11 = Static Merchant Initiation (Universal NBC Acceptance)
        
        // Tag 30: ABA Bank Merchant Info
        $sub30_00 = $this->formatTlv('00', $account);
        $sub30_01 = $this->formatTlv('01', $this->accountNumber);
        $sub30_02 = $this->formatTlv('02', $this->acquiringBank);
        $payload .= $this->formatTlv('30', $sub30_00 . $sub30_01 . $sub30_02);
        
        // Tag 52: Merchant Category Code (5814)
        $payload .= $this->formatTlv('52', '5814');
        $payload .= $this->formatTlv('53', '840'); // 840 = USD ($)
        $payload .= $this->formatTlv('54', number_format($amountUsd, 2, '.', ''));
        $payload .= $this->formatTlv('58', 'KH');
        $payload .= $this->formatTlv('59', $name);
        $payload .= $this->formatTlv('60', $this->merchantCity);
        
        // Tag 62: Official ABA Merchant Routing Info
        $sub68 = $this->formatTlv('00', 'PAYWAY@ABA') . $this->formatTlv('01', '1957114') . $this->formatTlv('02', '142492502');
        $payload .= $this->formatTlv('62', $this->formatTlv('68', $sub68));
        
        $payload .= '6304';
        $crc = $this->calculateCrc16($payload);
        $qrWithPrice = $payload . $crc;
        $md5 = md5($qrWithPrice);

        // 2. Exact Raw Static QR (Direct from ABA USD Account)
        $rawStaticUsd = "00020101021130510016abaakhppxxx@abaa01151260906152756130208ABA Bank5204581453038405802KH5914KHONG KOEMTONG6010Phnom Penh624268380010PAYWAY@ABA0107195711402091424925026304356F";

        return [
            'qr_string' => $qrWithPrice,
            'md5' => $md5,
            'amount' => $amountUsd,
            'amount_usd' => $amountUsd,
            'currency' => 'USD',
            'bill_number' => $cleanBill,
            'bakong_id' => $account,
            'merchant_name' => $name,
            'qr_usd_string' => $qrWithPrice,
            'qr_static_usd_string' => $rawStaticUsd,
        ];
    }

    /**
     * Calculate CRC16-CCITT (Polynomial 0x1021, Initial 0xFFFF)
     */
    public function calculateCrc16(string $data): string
    {
        $crc = 0xFFFF;
        $polynomial = 0x1021;
        $bytes = unpack('C*', $data);

        foreach ($bytes as $byte) {
            for ($i = 0; $i < 8; $i++) {
                $bit = (($byte >> (7 - $i)) & 1) === 1;
                $c15 = (($crc >> 15) & 1) === 1;
                $crc <<= 1;
                if ($c15 ^ $bit) {
                    $crc ^= $polynomial;
                }
            }
        }

        $crc &= 0xFFFF;
        return strtoupper(str_pad(dechex($crc), 4, '0', STR_PAD_LEFT));
    }

    /**
     * Check transaction status directly with National Bank of Cambodia (NBC) Bakong Open API
     */
    public function checkTransactionByMd5(string $md5): array
    {
        $token = $this->apiToken ?: env('BAKONG_API_TOKEN');
        if (!$token) {
            return [
                'success' => false,
                'paid' => false,
                'message' => 'Bakong API Token not configured.',
            ];
        }

        try {
            $ch = curl_init('https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $token,
                'Content-Type: application/json',
                'Accept: application/json'
            ]);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['md5' => $md5]));

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                return [
                    'success' => false,
                    'paid' => false,
                    'message' => 'Connection error: ' . $curlError,
                ];
            }

            $result = json_decode($response, true);
            
            // Response Code 0 means Transaction was Paid and Found on NBC Switch
            if (isset($result['responseCode']) && $result['responseCode'] === 0 && !empty($result['data'])) {
                return [
                    'success' => true,
                    'paid' => true,
                    'message' => 'Payment received successfully via Bakong!',
                    'data' => $result['data'],
                    'hash' => $result['data']['hash'] ?? null,
                    'from_account' => $result['data']['fromAccountId'] ?? null,
                    'to_account' => $result['data']['toAccountId'] ?? null,
                    'amount' => $result['data']['amount'] ?? null,
                    'currency' => $result['data']['currency'] ?? null,
                ];
            }

            return [
                'success' => true,
                'paid' => false,
                'message' => $result['responseMessage'] ?? 'Awaiting payment scan...',
                'raw' => $result,
            ];
        } catch (Throwable $e) {
            return [
                'success' => false,
                'paid' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
