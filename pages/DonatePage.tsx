import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { DonatePageContent } from '../types';
import PageBanner from '../components/PageBanner';
import Editable from '../components/Editable';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from '../components/PaymentForm';

// Remember to create a .env file in your project root and add your Stripe publishable key:
// VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
// FIX: Cast `import.meta` to `any` to access Vite environment variables and resolve TypeScript error.
const stripePromise = loadStripe((import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface DonatePageProps {
  content: DonatePageContent;
  apiUrl: string;
}

const DonatePage: React.FC<DonatePageProps> = ({ content, apiUrl }) => {
  const [step, setStep] = useState<'details' | 'payment' | 'thankyou'>('details');
  const [amount, setAmount] = useState(50);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    emailAddress: '',
  });
  const [clientSecret, setClientSecret] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  
  const presetAmounts = [25, 50, 100, 250, 500];
  const { language } = useI18n();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const response = await fetch(`${apiUrl}/api/create-payment-intent`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to initialize payment');
      
      setClientSecret(data.clientSecret);
      setStep('payment');

    } catch (error) {
      console.error(error);
      setStatus('error');
    } finally {
      setStatus('idle');
    }
  };

  const handlePaymentSuccess = async () => {
    // Send notification email after successful payment
    try {
      await fetch(`${apiUrl}/api/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, amount }),
      });
    } catch (emailError) {
      console.error("Failed to send notification email:", emailError);
      // Don't block the user flow for this, just log it.
    }
    setStep('thankyou');
  };

  const handlePaymentError = (message: string) => {
    console.error("Payment failed:", message);
    // You could set an error message in the state to display to the user here
  };
  
  const renderTextWithAmount = (text: string, value: number) => {
    return text.replace('{{amount}}', String(value));
  }
  
  if (!content) return null;

  if (step === 'thankyou') {
    return (
      <>
        <PageBanner 
          title={content.thankYou?.title?.[language] || 'Thank You!'}
          imageUrl="https://images.unsplash.com/photo-1527061011665-36521e61b244?q=80&w=1920&h=1080&fit=crop"
          basePath="donatePage.thankYou.title"
          localizedText={content.thankYou?.title}
        />
        <div className="bg-white py-8 lg:py-12">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <p className="text-xl text-brand-gray">
              {renderTextWithAmount(content.thankYou?.text?.[language] || 'Thank you for your generous donation of ${{amount}}.', amount)}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBanner
        title={content.banner?.title?.[language] || 'Donate'}
        imageUrl={content.banner?.imageUrl || ''}
        basePath="donatePage.banner.title"
        localizedText={content.banner?.title}
      />
      <div className="bg-brand-green-light py-8 lg:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="p-8 md:p-12">
              <Editable localizedText={content.intro || {en:'', es:''}} basePath="donatePage.intro" multiline>
                <p className="text-center text-brand-gray -mt-4 mb-8 text-lg">{content.intro?.[language]}</p>
              </Editable>
              
              {step === 'details' && (
                <form onSubmit={handleDetailsSubmit}>
                  {/* Amount Selection */}
                  <div className="mb-6">
                    <label className="block text-lg font-semibold text-brand-green-dark mb-3">{content.form?.chooseAmount?.[language] || 'Choose an amount'}</label>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                      {presetAmounts.map(preset => (
                        <button type="button" key={preset} onClick={() => setAmount(preset)} className={`p-3 border-2 rounded-lg font-bold text-center transition-colors ${amount === preset ? 'bg-brand-green text-white border-brand-green' : 'bg-white text-brand-green-dark border-gray-300 hover:border-brand-green'}`}>
                          ${preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Amount */}
                  <div className="mb-6">
                    <label className="block text-lg font-semibold text-brand-green-dark mb-3" htmlFor="custom-amount">{content.form?.customAmount?.[language] || 'Or enter a custom amount'}</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-lg text-gray-500">$</span>
                        <input type="number" id="custom-amount" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full pl-7 pr-3 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-brand-green focus:border-brand-green bg-white text-brand-gray" placeholder="50" min="1"/>
                    </div>
                  </div>

                  {/* Personal Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-brand-gray mb-1" htmlFor="firstName">{content.form?.firstName?.[language] || 'First Name'}</label>
                      <input type="text" id="firstName" required value={formData.firstName} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green bg-white text-brand-gray"/>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-brand-gray mb-1" htmlFor="lastName">{content.form?.lastName?.[language] || 'Last Name'}</label>
                      <input type="text" id="lastName" required value={formData.lastName} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green bg-white text-brand-gray"/>
                    </div>
                  </div>
                  <div className="mb-6">
                      <label className="block text-sm font-bold text-brand-gray mb-1" htmlFor="emailAddress">{content.form?.emailAddress?.[language] || 'Email Address'}</label>
                      <input type="email" id="emailAddress" required value={formData.emailAddress} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green bg-white text-brand-gray"/>
                  </div>
                  
                  {/* Submit Button */}
                  <div className="mt-8">
                    <button type="submit" disabled={status === 'sending'} className="w-full bg-brand-accent text-white font-bold text-xl py-4 rounded-lg hover:bg-brand-accent/90 transition-transform transform hover:scale-105 shadow-lg disabled:bg-gray-400">
                       {status === 'sending' ? 'Initializing...' : 'Proceed to Payment'}
                    </button>
                    {status === 'error' && <p className="text-red-500 mt-4 text-center">Could not initialize payment. Please try again later.</p>}
                  </div>
                </form>
              )}

              {step === 'payment' && clientSecret && (
                <div>
                  <h3 className="text-lg font-semibold text-brand-green-dark mb-4">Complete Your Donation of ${amount}</h3>
                  <Elements options={{ clientSecret }} stripe={stripePromise}>
                    <PaymentForm onSuccess={handlePaymentSuccess} onError={handlePaymentError} />
                  </Elements>
                  <button onClick={() => setStep('details')} className="w-full text-center mt-4 text-sm text-brand-gray hover:text-brand-green-dark"> &larr; Back to details</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DonatePage;