import { Link } from 'react-router-dom';
import ClientIntakeForm from './ClientIntakeForm';

export default function HireUsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700">
                The Law Shop
              </Link>
            </div>
            <div className="flex items-center">
              <Link
                to="/"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Let's Work Together
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              Tell us about your legal needs and we'll create a personalized portal for seamless collaboration.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Response</h3>
              <p className="text-gray-600">We'll review your information and get back to you within 24 hours.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Portal</h3>
              <p className="text-gray-600">Access your documents and communicate securely through your personalized portal.</p>
            </div>
          </div>

          {/* Form */}
          <ClientIntakeForm />

          {/* Trust Indicators */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Trusted by over 1,000+ businesses nationwide
            </p>
            <div className="mt-4 flex justify-center space-x-6">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="ml-2 text-sm text-gray-600">SSL Encrypted</span>
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="ml-2 text-sm text-gray-600">GDPR Compliant</span>
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="ml-2 text-sm text-gray-600">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}