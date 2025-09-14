import React from 'react';

const TermsAndConditions = () => {
   const currentYear = new Date().getFullYear();
  const handleGoHome = () => {
    // In a real app, you would use React Router or window.location
    console.log('Navigate to home page');
    // window.location.href = 'ssrpro-home.html';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
     <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-8 text-center">
          <div className="mb-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight text-gray-800">
              Terms and Conditions
            </h1>
            <div className="w-24 h-1 bg-orange-500 mx-auto mb-4"></div>
          </div>
          {/* <p className="text-xl text-gray-600 font-medium">
            SSRPro India
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Developed by Siliconmount Tech Services Pvt. Ltd.
          </p> */}
        </div>
      </header>


      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Effective Date Banner */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4">
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="text-lg font-semibold">Effective Date: March 30, 2025</span>
            </div>
          </div>

          <div className="px-8 py-10 space-y-10">
            {/* Section 1 */}
            <section className="group">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <span className="text-orange-600 font-bold text-sm">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors">
                    Acceptance of Terms
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    By using our SaaS platform, you agree to these Terms and Conditions. If you do not agree, please do not use our services.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="group">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <span className="text-orange-600 font-bold text-sm">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors">
                    User Accounts
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-3 flex-shrink-0"></div>
                      <p className="text-gray-700 leading-relaxed text-lg">
                        Users must provide accurate information when creating accounts.
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-3 flex-shrink-0"></div>
                      <p className="text-gray-700 leading-relaxed text-lg">
                        You are responsible for maintaining account security and confidentiality.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="group">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <span className="text-orange-600 font-bold text-sm">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors">
                    Subscription and Payments
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-3 flex-shrink-0"></div>
                      <p className="text-gray-700 leading-relaxed text-lg">
                        Subscription plans and pricing are available on our website.
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-3 flex-shrink-0"></div>
                      <p className="text-gray-700 leading-relaxed text-lg">
                        Payments are non-refundable except as per our Refund Policy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="group">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <span className="text-orange-600 font-bold text-sm">4</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors">
                    Prohibited Activities
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0"></div>
                      <p className="text-gray-700 leading-relaxed text-lg">
                        Unauthorized access or misuse of the platform is strictly prohibited.
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0"></div>
                      <p className="text-gray-700 leading-relaxed text-lg">
                        Violating any applicable laws or regulations is forbidden.
                      </p>
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
                    Limitation of Liability
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    We are not liable for any indirect, incidental, or consequential damages arising from service use. Our liability is limited to the maximum extent permitted by law.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section className="group">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <span className="text-orange-600 font-bold text-sm">6</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors">
                    Modifications
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    We reserve the right to update these terms at any time. Continued use of our services constitutes acceptance of any modifications.
                  </p>
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

export default TermsAndConditions;