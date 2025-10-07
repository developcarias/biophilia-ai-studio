import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { StripePaymentElementOptions } from '@stripe/stripe-js';

interface PaymentFormProps {
    onSuccess: () => void;
    onError: (message: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            return;
        }

        setIsProcessing(true);
        setMessage(null);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL is not strictly needed for `if_required` but good practice for some payment methods
                return_url: `${window.location.origin}${window.location.pathname}#/donate`,
            },
            redirect: 'if_required' // Handle result directly without redirecting
        });
        
        if (error) {
            const errorMessage = error.message || 'An unexpected error occurred.';
            setMessage(errorMessage);
            onError(errorMessage);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            // Payment succeeded
            onSuccess();
        } else {
            // Handle other statuses if needed, e.g. paymentIntent.status === 'processing'
            setMessage("Payment is processing.");
        }

        setIsProcessing(false);
    };

    const paymentElementOptions: StripePaymentElementOptions = {
        layout: "tabs",
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <PaymentElement id="payment-element" options={paymentElementOptions} />
            <button disabled={isProcessing || !stripe || !elements} id="submit" className="w-full bg-brand-accent text-white font-bold text-xl py-4 rounded-lg hover:bg-brand-accent/90 transition-transform transform hover:scale-105 shadow-lg disabled:bg-gray-400 mt-8">
                <span id="button-text">
                    {isProcessing ? "Processing..." : "Pay now"}
                </span>
            </button>
            {message && <div id="payment-message" className="text-red-500 mt-4 text-center">{message}</div>}
        </form>
    );
}

export default PaymentForm;
