export function PrivacyPolicy() {
  return (
    <div className="min-h-screen">
      <section className="relative bg-primary-300">
        <div className="flex items-center px-4 sm:px-6 lg:px-12 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto">
            <h1>Privacy Policy</h1>
            <p className="text-xl text-gray-800 mt-2">Last updated: May 2026</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-gray max-w-none">

          <h2>Who we are</h2>
          <p>
            Penmaen and Nicholaston Village Hall is a registered charity (Charity No. 1081661) based at
            Penmaen Parish Hall, Penmaen, Gower, Swansea, SA3 2HH. We are the data controller for the
            personal information we collect through this website.
          </p>
          <p>
            You can contact us about any privacy matter at{' '}
            <a href="mailto:info@penmaenandnicholastonvh.co.uk" className="text-primary-600 hover:text-primary-700">
              info@penmaenandnicholastonvh.co.uk
            </a>
            .
          </p>

          <h2>What information we collect and why</h2>

          <h3>Hall booking enquiries</h3>
          <p>
            When you submit a hall booking enquiry we collect your name, email address, phone number
            (optional), requested dates, and any details you provide. We use this information solely to
            respond to your enquiry and, if your booking proceeds, to manage the booking. The legal basis
            for this processing is our legitimate interest in operating the village hall.
          </p>

          <h3>Newsletter sign-ups</h3>
          <p>
            If you subscribe to our newsletter we collect your email address. We will only send you
            community news and updates about the hall. The legal basis for this processing is your
            consent. You can unsubscribe at any time by contacting us at the email address above.
          </p>

          <h3>Website usage</h3>
          <p>
            Our website is hosted by Vercel. Standard server logs (IP address, browser type, pages
            visited) may be collected automatically as part of normal website operation. We do not use
            this data to identify individuals.
          </p>

          <h2>How long we keep your information</h2>
          <ul>
            <li>Booking enquiry data is kept for up to 2 years after the enquiry date.</li>
            <li>Newsletter subscriber data is kept until you unsubscribe.</li>
            <li>Server logs are retained in line with Vercel's standard data retention policy.</li>
          </ul>

          <h2>Who we share your information with</h2>
          <p>We do not sell or share your personal data with third parties for marketing purposes. We use the following service providers who may process your data on our behalf:</p>
          <ul>
            <li><strong>Brevo</strong> — email delivery service used to send booking confirmations and newsletters</li>
            <li><strong>Supabase</strong> — database provider used to store booking enquiries and subscriber records</li>
            <li><strong>Vercel</strong> — website hosting provider</li>
          </ul>
          <p>All providers are required to handle your data securely and in accordance with applicable data protection law.</p>

          <h2>Your rights</h2>
          <p>Under UK data protection law you have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Ask us to correct inaccurate data</li>
            <li>Ask us to delete your data</li>
            <li>Ask us to restrict how we use your data</li>
            <li>Withdraw consent at any time (where we rely on consent)</li>
            <li>Lodge a complaint with the Information Commissioner's Office (ICO) at <a href="https://ico.org.uk" className="text-primary-600 hover:text-primary-700" target="_blank" rel="noopener noreferrer">ico.org.uk</a></li>
          </ul>
          <p>
            To exercise any of these rights please contact us at{' '}
            <a href="mailto:info@penmaenandnicholastonvh.co.uk" className="text-primary-600 hover:text-primary-700">
              info@penmaenandnicholastonvh.co.uk
            </a>
            . We will respond within 30 days.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            We may update this policy from time to time. The date at the top of this page will always
            reflect when it was last revised. Continued use of this website after any changes constitutes
            acceptance of the updated policy.
          </p>
        </div>
      </section>
    </div>
  );
}
