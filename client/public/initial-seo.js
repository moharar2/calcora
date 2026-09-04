(function () {
  'use strict';

  var ORIGIN = 'https://moneycalci.online';
  var SOCIAL_IMAGE = ORIGIN + '/social-card.svg';

  var routes = {
    '/': { title: 'MoneyCalci — Calculate Smarter. Decide Better.', description: 'Free, easy-to-understand financial calculators for loans, mortgages, savings, investments, and more.' },
    '/calculators': { title: 'Financial Calculators — MoneyCalci', description: 'Explore free financial calculators for loans, mortgages, savings, investments, salary, taxes, and business decisions.' },
    '/categories': { title: 'Financial Calculator Categories — MoneyCalci', description: 'Browse MoneyCalci calculators by financial category, including loans, salary, taxes, investment, business, ecommerce, currency, and savings.' },
    '/finance': { title: 'Finance Calculators — MoneyCalci', description: 'Use free finance calculators to estimate payments, savings, interest, returns, and other everyday money scenarios.' },
    '/loans': { title: 'Loan Calculators — MoneyCalci', description: 'Compare loan and mortgage payment scenarios with free calculators for borrowing costs, interest, and repayment.' },
    '/salary': { title: 'Salary Calculators — MoneyCalci', description: 'Calculate salary, hourly pay, take-home pay estimates, and other useful paycheck scenarios with free tools.' },
    '/taxes': { title: 'Tax Calculators — MoneyCalci', description: 'Explore simple tax and take-home pay estimates to understand how assumptions can affect your money.' },
    '/investment': { title: 'Investment Calculators — MoneyCalci', description: 'Project investment growth, compound interest, returns, and long-term savings scenarios with free calculators.' },
    '/business': { title: 'Business Calculators — MoneyCalci', description: 'Calculate profit, margin, markup, ROI, and other useful business metrics with free, easy-to-understand tools.' },
    '/ecommerce': { title: 'Ecommerce Calculators — MoneyCalci', description: 'Calculate ecommerce profit, margin, markup, and pricing scenarios with simple free business tools.' },
    '/currency': { title: 'Currency Converter — MoneyCalci', description: 'Convert currencies with MoneyCalci and review the exchange-rate estimate for your selected currency pair.' },
    '/tools': { title: 'Financial Tools — MoneyCalci', description: 'Browse MoneyCalci financial tools and calculators for loans, savings, investment, salary, tax, business, and more.' },
    '/savings': { title: 'Savings Calculators — MoneyCalci', description: 'Plan savings growth, interest, contributions, and financial goals with free MoneyCalci calculators.' },
    '/loan-calculator': { title: 'Loan Calculator — Monthly Payment & Interest | MoneyCalci', description: "Estimate a fixed-rate loan payment, total interest, and repayment with MoneyCalci's free loan calculator." },
    '/mortgage-calculator': { title: 'Mortgage Calculator — Estimate Your Monthly Payment | MoneyCalci', description: 'Estimate mortgage principal, interest, property tax, insurance, PMI, and HOA costs with a clear fixed-rate calculator.' },
    '/personal-loan-calculator': { title: 'Personal Loan Calculator — Payment & Interest | MoneyCalci', description: 'Estimate personal-loan payments, interest, and total repayment for a fixed-rate installment scenario.' },
    '/salary-calculator': { title: 'Salary Calculator — Annual to Hourly Pay | MoneyCalci', description: 'Convert annual salary into monthly, biweekly, weekly, and hourly gross-pay estimates with MoneyCalci.' },
    '/take-home-pay-calculator': { title: 'Take-Home Pay Calculator — Simplified Net Pay Estimate | MoneyCalci', description: 'Estimate monthly and annual take-home pay from gross salary using a transparent simplified tax-rate assumption.' },
    '/compound-interest-calculator': { title: 'Compound Interest Calculator — Investment Growth | MoneyCalci', description: 'Calculate compound growth with an initial balance, monthly contributions, annual return, and time horizon.' },
    '/investment-calculator': { title: 'Investment Calculator — Project Future Value | MoneyCalci', description: 'Project an investment balance from starting capital, monthly contributions, return assumptions, and time horizon.' },
    '/roi-calculator': { title: 'ROI Calculator — Calculate Return on Investment | MoneyCalci', description: 'Calculate return on investment and profit or loss from an initial investment and final value.' },
    '/profit-margin-calculator': { title: 'Profit Margin Calculator — Profit, Margin & Markup | MoneyCalci', description: 'Calculate business profit, profit margin, and markup while keeping the two percentages distinct.' },
    '/currency-converter': { title: 'Currency Converter — Exchange Rate Calculator | MoneyCalci', description: 'Convert between currencies and review an estimated exchange rate with MoneyCalci’s free currency converter.' },
    '/savings-calculator': { title: 'Savings Calculator — Growth & Contributions | MoneyCalci', description: 'Estimate savings growth from a starting balance, recurring contributions, interest, and time.' },
    '/simple-interest-calculator': { title: 'Simple Interest Calculator — Interest & Total | MoneyCalci', description: 'Calculate simple interest and total amount from principal, rate, and time with a free MoneyCalci calculator.' },
    '/markup-calculator': { title: 'Markup Calculator — Price, Cost & Markup | MoneyCalci', description: 'Calculate markup, profit, selling price, and cost relationships with MoneyCalci’s free markup calculator.' },
    '/discount-calculator': { title: 'Discount Calculator — Sale Price & Savings | MoneyCalci', description: 'Calculate discounts, sale prices, and savings from an original price and discount percentage.' },
    '/sales-tax-calculator': { title: 'Sales Tax Calculator — Tax & Total Price | MoneyCalci', description: 'Calculate sales tax, tax-inclusive totals, and pre-tax prices with a simple free calculator.' },
    '/blog': { title: 'Financial Guides & Calculations — MoneyCalci', description: 'Read practical MoneyCalci guides explaining loans, compound interest, profit margin, ROI, gross pay, and net pay.' },
    '/blog/how-is-a-loan-payment-calculated': { title: 'How Is a Loan Payment Calculated? | MoneyCalci', description: 'Learn how fixed-rate loan payments are calculated, including principal, interest, rate, term, and amortization.' },
    '/blog/how-does-compound-interest-work': { title: 'How Does Compound Interest Work? | MoneyCalci', description: 'Learn how compound interest grows money over time and how compounding frequency and contributions affect growth.' },
    '/blog/how-to-calculate-profit-margin': { title: 'How to Calculate Profit Margin | MoneyCalci', description: 'Learn how to calculate gross profit margin from revenue and costs, with a simple formula and example.' },
    '/blog/how-to-calculate-roi': { title: 'How to Calculate ROI | MoneyCalci', description: 'Learn how to calculate return on investment using initial cost, final value, profit, and the standard ROI formula.' },
    '/blog/gross-pay-vs-net-pay': { title: 'Gross Pay vs Net Pay: What’s the Difference? | MoneyCalci', description: 'Understand the difference between gross pay and net pay, including taxes, deductions, and paycheck calculations.' },
    '/about': { title: 'About MoneyCalci', description: 'Learn how MoneyCalci creates clear educational financial estimates.' },
    '/contact': { title: 'Contact MoneyCalci', description: 'Contact MoneyCalci with questions or feedback about the calculators.' },
    '/privacy-policy': { title: 'Privacy Policy | MoneyCalci', description: 'Read how MoneyCalci handles local calculator preferences, shareable URLs, analytics, and data-use information.' },
    '/terms': { title: 'Terms of Use | MoneyCalci', description: 'Read the MoneyCalci terms of use and estimate disclaimer.' },
    '/disclaimer': { title: 'Financial Disclaimer | MoneyCalci', description: 'Read the MoneyCalci financial disclaimer and understand the limits of calculator estimates.' }
  };

  function normalizePath(pathname) {
    if (!pathname || pathname === '/') return '/';
    return pathname.replace(/\/+$/, '') || '/';
  }

  function upsertMeta(attribute, key, content) {
    var node = document.head.querySelector('meta[' + attribute + '="' + key + '"]');
    if (!node) {
      node = document.createElement('meta');
      node.setAttribute(attribute, key);
      document.head.appendChild(node);
    }
    node.setAttribute('content', content);
  }

  function setCanonical(url) {
    var link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  function removeCanonical() {
    var link = document.head.querySelector('link[rel="canonical"]');
    if (link) link.remove();
  }

  function applySeo() {
    var path = normalizePath(window.location.pathname);
    var config = routes[path];
    var isKnown = Boolean(config);
    var canonical = ORIGIN + (path === '/' ? '/' : path);

    if (!isKnown) {
      document.title = 'Page Not Found | MoneyCalci';
      upsertMeta('name', 'description', 'The MoneyCalci page you requested could not be found.');
      upsertMeta('name', 'robots', 'noindex,follow');
      removeCanonical();
      upsertMeta('property', 'og:title', 'Page Not Found | MoneyCalci');
      upsertMeta('property', 'og:description', 'The MoneyCalci page you requested could not be found.');
      upsertMeta('property', 'og:type', 'website');
      upsertMeta('property', 'og:url', canonical);
      upsertMeta('property', 'og:image', SOCIAL_IMAGE);
      upsertMeta('name', 'twitter:card', 'summary');
      upsertMeta('name', 'twitter:title', 'Page Not Found | MoneyCalci');
      upsertMeta('name', 'twitter:description', 'The MoneyCalci page you requested could not be found.');
      upsertMeta('name', 'twitter:image', SOCIAL_IMAGE);
      return;
    }

    document.title = config.title;
    upsertMeta('name', 'description', config.description);
    upsertMeta('name', 'robots', 'index,follow,max-image-preview:large');
    setCanonical(canonical);
    upsertMeta('property', 'og:type', path.indexOf('/blog/') === 0 ? 'article' : 'website');
    upsertMeta('property', 'og:site_name', 'MoneyCalci');
    upsertMeta('property', 'og:title', config.title);
    upsertMeta('property', 'og:description', config.description);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', SOCIAL_IMAGE);
    upsertMeta('name', 'twitter:card', 'summary');
    upsertMeta('name', 'twitter:title', config.title);
    upsertMeta('name', 'twitter:description', config.description);
    upsertMeta('name', 'twitter:image', SOCIAL_IMAGE);
  }

  window.MoneyCalciInitialSEO = { routes: routes, apply: applySeo };
  applySeo();
})();
