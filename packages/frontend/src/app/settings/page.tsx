'use client';

import { motion } from 'framer-motion';
import { User, Wallet, Gamepad2, Bell, AlertTriangle, ExternalLink, Info } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, Button } from '@/components/common';
import { useWallet } from '@/components/providers/SuiProvider';

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */
function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pn-surface-2 border border-pn-border">
        <Icon className="h-4 w-4 text-pn-green" />
      </div>
      <h2 className="font-mono text-sm font-semibold uppercase tracking-[0.15em] text-pn-white">
        {title}
      </h2>
    </div>
  );
}

function FieldRow({ label, value, placeholder }: { label: string; value?: string; placeholder?: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-3 border-b border-pn-border last:border-b-0">
      <label className="text-sm text-pn-muted sm:w-32 shrink-0">{label}</label>
      <input
        type="text"
        readOnly
        disabled
        value={value ?? ''}
        placeholder={placeholder}
        className="flex-1 bg-pn-dark border border-pn-border rounded-lg px-3 py-2 text-sm text-pn-muted cursor-not-allowed placeholder:text-pn-muted/40"
      />
    </div>
  );
}

function ToggleRow({ label, description, disabled = true }: { label: string; description: string; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-pn-border last:border-b-0">
      <div>
        <p className="text-sm text-pn-text">{label}</p>
        <p className="text-xs text-pn-muted mt-0.5">{description}</p>
      </div>
      <button
        disabled={disabled}
        className="relative h-6 w-11 rounded-full bg-pn-surface-2 border border-pn-border cursor-not-allowed opacity-50"
      >
        <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-pn-muted transition-transform" />
      </button>
    </div>
  );
}

function GameProfileRow({ platform, connected = false }: { platform: string; connected?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-pn-border last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pn-dark border border-pn-border">
          <Gamepad2 className="h-4 w-4 text-pn-muted" />
        </div>
        <div>
          <p className="text-sm font-medium text-pn-text">{platform}</p>
          <p className="text-xs text-pn-muted">
            {connected ? 'Connected' : 'Not connected'}
          </p>
        </div>
      </div>
      <button
        disabled
        className="px-3 py-1.5 rounded-lg bg-pn-surface border border-pn-border text-xs text-pn-muted cursor-not-allowed opacity-50"
      >
        Connect
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function SettingsPage() {
  const { connected, address, connect } = useWallet();

  return (
    <div className="min-h-screen bg-pn-black flex flex-col">
      <Header />

      {/* Background effects */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(42,42,50,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(42,42,50,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <main className="relative z-10 flex-1">
        <div className="max-w-3xl mx-auto px-4 lg:px-6 pt-16 pb-20">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8"
          >
            <h1 className="font-primary text-3xl font-extrabold text-pn-white sm:text-4xl tracking-tight">
              Settings
            </h1>
            <p className="mt-2 text-pn-muted">
              Manage your PlayNode profile and preferences
            </p>
          </motion.div>

          {/* Coming-soon banner */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-8"
          >
            <div className="flex items-start gap-3 rounded-xl border border-pn-amber/20 bg-pn-amber/5 px-4 py-3">
              <Info className="h-5 w-5 text-pn-amber shrink-0 mt-0.5" />
              <p className="text-sm text-pn-amber leading-relaxed">
                Profile editing will be available when on-chain Node creation is live.
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {/* ---- Profile ---- */}
            <motion.div variants={fadeUp}>
              <Card>
                <SectionHeader icon={User} title="Profile" />
                <div className="space-y-0">
                  <FieldRow label="Display Name" placeholder="Your display name" />
                  <FieldRow label="Bio" placeholder="Tell us about yourself" />
                  <FieldRow label="Avatar URL" placeholder="https://..." />
                </div>
                <p className="mt-3 text-xs text-pn-muted/60 italic">Coming soon</p>
              </Card>
            </motion.div>

            {/* ---- Connected Wallets ---- */}
            <motion.div variants={fadeUp}>
              <Card>
                <SectionHeader icon={Wallet} title="Connected Wallets" />
                {connected && address ? (
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-pn-green animate-pulse" />
                      <div>
                        <p className="text-sm font-mono text-pn-text">
                          {address.slice(0, 6)}...{address.slice(-4)}
                        </p>
                        <p className="text-xs text-pn-green">Connected</p>
                      </div>
                    </div>
                    <span className="rounded-md bg-pn-green/10 px-2 py-1 font-mono text-[10px] text-pn-green uppercase tracking-wider">
                      Sui
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-6 gap-3">
                    <p className="text-sm text-pn-muted">No wallet connected</p>
                    <Button variant="primary" size="sm" onClick={connect}>
                      <Wallet className="h-4 w-4" />
                      Connect Wallet
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* ---- Game Profiles ---- */}
            <motion.div variants={fadeUp}>
              <Card>
                <SectionHeader icon={Gamepad2} title="Game Profiles" />
                <div className="space-y-0">
                  <GameProfileRow platform="Steam" />
                  <GameProfileRow platform="Riot Games" />
                  <GameProfileRow platform="Xbox" />
                </div>
              </Card>
            </motion.div>

            {/* ---- Notifications ---- */}
            <motion.div variants={fadeUp}>
              <Card>
                <SectionHeader icon={Bell} title="Notifications" />
                <div className="space-y-0">
                  <ToggleRow
                    label="Email Notifications"
                    description="Receive updates about your drops and reviews"
                  />
                  <ToggleRow
                    label="Push Notifications"
                    description="Get browser notifications for new activity"
                  />
                </div>
              </Card>
            </motion.div>

            {/* ---- Danger Zone ---- */}
            <motion.div variants={fadeUp}>
              <Card className="!border-pn-red/20">
                <SectionHeader icon={AlertTriangle} title="Danger Zone" />
                <p className="text-sm text-pn-muted mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <button
                  disabled
                  className="px-4 py-2 rounded-lg bg-pn-red/10 border border-pn-red/20 text-sm font-medium text-pn-red cursor-not-allowed opacity-50"
                >
                  Delete Account
                </button>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
