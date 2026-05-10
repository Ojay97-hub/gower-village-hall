export function CookiesPolicy() {
  return (
    <div className="min-h-screen">
      <section className="relative bg-primary-300">
        <div className="flex items-center px-4 sm:px-6 lg:px-12 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto">
            <h1>Cookies Policy</h1>
            <p className="text-xl text-gray-800 mt-2">Last updated: May 2026</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-gray max-w-none">

          <p>
            This page explains what cookies are, which ones this website uses, and how you can control
            them.
          </p>

          <h2>What are cookies?</h2>
          <p>
            Cookies are small text files that a website stores on your device when you visit. They are
            widely used to make websites work efficiently and to provide information to the website
            operator.
          </p>

          <h2>Cookies this website uses</h2>

          <h3>Strictly necessary cookies</h3>
          <p>
            This website uses a small number of strictly necessary cookies to enable core functionality.
            These cannot be disabled without breaking the site.
          </p>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 font-semibold">Cookie</th>
                <th className="text-left py-2 pr-4 font-semibold">Purpose</th>
                <th className="text-left py-2 font-semibold">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-4 font-mono text-xs">sb-*</td>
                <td className="py-2 pr-4">Supabase authentication session — keeps administrator users logged in to the admin panel</td>
                <td className="py-2">Session / 1 week</td>
              </tr>
            </tbody>
          </table>
          <p className="text-sm text-gray-500 mt-2">
            These cookies are only set when an administrator logs in. Regular visitors to the public
            website are not issued any tracking or session cookies.
          </p>

          <h3>Analytics and advertising cookies</h3>
          <p>
            This website does <strong>not</strong> use Google Analytics, Facebook Pixel, or any other
            third-party advertising or tracking cookies.
          </p>

          <h2>How to manage cookies</h2>
          <p>
            You can control and delete cookies through your browser settings. Please note that disabling
            strictly necessary cookies may prevent parts of this website from working correctly.
          </p>
          <ul>
            <li><a href="https://support.google.com/chrome/answer/95647" className="text-primary-600 hover:text-primary-700" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" className="text-primary-600 hover:text-primary-700" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" className="text-primary-600 hover:text-primary-700" target="_blank" rel="noopener noreferrer">Safari</a></li>
            <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" className="text-primary-600 hover:text-primary-700" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
          </ul>

          <h2>Changes to this policy</h2>
          <p>
            We may update this policy if we change the cookies we use. The date at the top of this page
            will reflect the most recent revision.
          </p>

          <h2>Contact</h2>
          <p>
            If you have any questions about this cookies policy please contact us at{' '}
            <a href="mailto:info@penmaenandnicholastonvh.co.uk" className="text-primary-600 hover:text-primary-700">
              info@penmaenandnicholastonvh.co.uk
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
