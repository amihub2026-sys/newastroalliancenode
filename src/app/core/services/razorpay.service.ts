import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

interface Order {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}
interface PaymentResult {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
interface CheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  handler: (result: PaymentResult) => void;
  modal: { ondismiss: () => void };
}
interface Checkout {
  open(): void;
  on(event: string, callback: () => void): void;
}
declare global {
  interface Window {
    Razorpay?: new (options: CheckoutOptions) => Checkout;
  }
}

@Injectable({ providedIn: 'root' })
export class RazorpayService {
  private readonly http = inject(HttpClient);
  private script?: Promise<void>;

  private loadCheckout(): Promise<void> {
    if (typeof window === 'undefined')
      return Promise.reject(new Error('Open payment in your browser'));
    if (window.Razorpay) return Promise.resolve();
    if (!this.script) {
      this.script = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        const timeout = window.setTimeout(() => fail(), 15000);
        const fail = () => {
          window.clearTimeout(timeout);
          script.remove();
          reject(new Error('Unable to load secure checkout. Please retry.'));
        };
        script.onload = () => {
          window.clearTimeout(timeout);
          window.Razorpay ? resolve() : fail();
        };
        script.onerror = fail;
        document.head.appendChild(script);
      }).catch((error) => {
        this.script = undefined;
        throw error;
      });
    }
    return this.script;
  }

  async pay(planId: string): Promise<void> {
    if (!environment.paymentEnabled) throw new Error('Online payments are not enabled yet.');
    await this.loadCheckout();
    const { data: order } = await firstValueFrom(
      this.http.post<{ data: Order }>(`${environment.apiUrl}/payments/orders`, { planId }),
    );
    const result = await new Promise<PaymentResult>((resolve, reject) => {
      const checkout = new window.Razorpay!({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'Astro Alliance',
        handler: resolve,
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled. You can retry when ready.')),
        },
      });
      // Failed attempts remain in Checkout so the customer can retry or dismiss.
      checkout.open();
    });
    await firstValueFrom(this.http.post(`${environment.apiUrl}/payments/verify`, result));
  }
}
