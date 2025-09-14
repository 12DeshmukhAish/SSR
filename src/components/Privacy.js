import React from 'react';

const PrivacyPolicy = ({ onClose }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-100 via-gray-50 to-slate-100 text-gray-800 shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-6 py-8 text-center relative">
          {/* Close button in header */}
          {/* {onClose && (
            // <button
            //   onClick={onClose}
            //   className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
            //   aria-label="Close"
            // >
            //   ×
            // </button>
          )} */}
          <div className="mb-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight text-gray-800">
              Privacy Policy
            </h1>
            <div className="w-24 h-1 bg-blue-400 mx-auto mb-4"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Effective Date Banner */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4">
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="text-lg font-semibold">Effective Date: March 25, 2025</span>
            </div>
          </div>

          <div className="px-8 py-10 space-y-10">
            {/* Introduction */}
            <section className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
              <div className="flex items-start space-x-3">
                <svg className="w-8 h-8 text-blue-600 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Commitment to Your Privacy</h2>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    SiliconMount Tech Services Pvt. Ltd. ("Company," "we," "us," or "our") respects your privacy and is committed to protecting it through this comprehensive Privacy Policy. We believe in transparency and want you to understand how we collect, use, and protect your personal information.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 1 */}
            <section className="group">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <span className="text-green-600 font-bold text-sm">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                    Information We Collect
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <p className="text-gray-700 leading-relaxed text-lg">
                          <strong>Personal Information:</strong> Name, email address, phone number, and other contact details you provide when registering or using our services.
                        </p>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                        </svg>
                        <p className="text-gray-700 leading-relaxed text-lg">
                          <strong>Payment Information:</strong> Billing details processed securely through third-party payment providers. We do not store your complete payment card information.
                        </p>
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <p className="text-gray-700 leading-relaxed text-lg">
                          <strong>Usage Data:</strong> Information about how you interact with our platform, including cookies, log files, and analytics data to improve our services.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="group">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <span className="text-blue-600 font-bold text-sm">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                    How We Use Your Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></div>
                      <p className="text-gray-700 leading-relaxed text-lg">
                        <strong>Service Delivery:</strong> To provide, maintain, and improve our SaaS platform and related services.
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></div>
                      <p className="text-gray-700 leading-relaxed text-lg">
                        <strong>Communication:</strong> To send you important updates, service notifications, and promotional offers (with your consent).
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></div>
                      <p className="text-gray-700 leading-relaxed text-lg">
                        <strong>Enhancement:</strong> To analyze usage patterns, improve user experience, and ensure platform security and reliability.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="group">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
                  <span className="text-red-600 font-bold text-sm">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-red-600 transition-colors">
                    Data Security
                  </h3>
                  <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                    <div className="flex items-start space-x-3">
                      <svg className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <p className="text-gray-700 leading-relaxed text-lg">
                        We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your information. However, please note that no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="group">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <span className="text-purple-600 font-bold text-sm">4</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
                    Sharing Your Information
                  </h3>
                  <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <svg className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-gray-700 leading-relaxed text-lg">
                          <strong>We do not sell your personal information.</strong> Your privacy is not for sale.
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <svg className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                        </svg>
                        <p className="text-gray-700 leading-relaxed text-lg">
                          We may share data with trusted third-party service providers who assist us in business operations, such as payment processing, hosting, and analytics - all under strict confidentiality agreements.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section className="group">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <span className="text-orange-600 font-bold text-sm">5</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors">
                    Your Rights
                  </h3>
                  <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                    <div className="flex items-start space-x-3">
                      <svg className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-gray-700 leading-relaxed text-lg mb-3">
                          You have the right to request access, correction, or deletion of your personal data by contacting us. We are committed to responding to your requests promptly and in accordance with applicable privacy laws.
                        </p>
                        <div className="text-sm text-orange-700 bg-orange-100 rounded-lg p-3">
                          <strong>Contact us:</strong> For any privacy-related requests or questions, please reach out to our support team.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      {/* Footer Section */}
      <footer className="w-full bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="text-center text-gray-600 text-sm">
            © {currentYear} SiliconMount Tech Services Pvt. Ltd. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;