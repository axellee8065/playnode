import { type FC } from 'react';
import Logo from '../common/Logo';

const footerLinks = [
  { label: 'About', href: '/about' },
  { label: 'Docs', href: '/docs' },
  { label: 'GitHub', href: 'https://github.com/playnode' },
  { label: 'Discord', href: 'https://discord.gg/playnode' },
];

const Footer: FC = () => {
  return (
    <footer className="border-t border-pn-border bg-pn-dark">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Logo size={22} showWordmark />
          <nav className="flex items-center gap-4">
            {footerLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs text-pn-muted hover:text-pn-text transition-colors"
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <p className="text-xs text-pn-muted">
          &copy; {new Date().getFullYear()} PlayNode. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
