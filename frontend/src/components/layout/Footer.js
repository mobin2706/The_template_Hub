'use client';

import Link from 'next/link';
import { FileText, Globe, AtSign, Mail, Heart } from 'lucide-react';

export default function Footer() {
  const categories = ['Education', 'Business', 'Design', 'Technology', 'Healthcare', 'Legal', 'Marketing'];

  return (
    <footer className="relative mt-20 border-t border-[var(--border-color)]">
      {/* Gradient top border glow */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#7c3aed] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>
                <span className="gradient-text">Template</span>
                <span className="text-[var(--text-primary)]">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6">
              Discover, share, and download professional templates for every need. Join thousands of creators and professionals.
            </p>
            <div className="flex gap-3">
              {[Globe, AtSign, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--surface)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-4 uppercase tracking-wider">Categories</h4>
            <ul className="space-y-2.5">
              {categories.map(cat => (
                <li key={cat}>
                  <Link
                    href={`/templates?category=${cat}`}
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-4 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/templates', label: 'Browse Templates' },
                { href: '/upload', label: 'Upload Template' },
                { href: '/templates?sort=popular', label: 'Trending' },
                { href: '/auth/signup', label: 'Create Account' },
              ].map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-4 uppercase tracking-wider">Stay Updated</h4>
            <p className="text-sm text-[var(--text-muted)] mb-4">Get notified about new templates and features.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="input-field text-sm !py-2.5 flex-1"
                id="newsletter-email"
              />
              <button className="px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--text-muted)]">
            © {new Date().getFullYear()} TemplateHub. All rights reserved.
          </p>
          <p className="text-sm text-[var(--text-muted)] flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" /> by TemplateHub Team
          </p>
        </div>
      </div>
    </footer>
  );
}
