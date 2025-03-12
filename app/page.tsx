'use client';

import { Button } from '@/components/ui/button';
import {
  BrainCogIcon,
  EyeIcon,
  GlobeIcon,
  MonitorSmartphoneIcon,
  ServerCogIcon,
  ZapIcon,
  ArrowRightIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRef, useEffect } from 'react';

const features = [
  {
    name: 'Store your PDF Documents',
    description:
      'Secure cloud storage for your critical documents — accessible anytime, anywhere with just one click.',
    icon: GlobeIcon,
  },
  {
    name: 'Blazing Fast Responses',
    description:
      'Instant AI-powered answers that turn lengthy documents into actionable insights in seconds.',
    icon: ZapIcon,
  },
  {
    name: 'Chat Memorisation',
    description:
      'Smart conversations that learn from each interaction, creating a truly personalized document assistant.',
    icon: BrainCogIcon,
  },
  {
    name: 'Interactive PDF Viewer',
    description:
      'Transform dense documents into navigable, digestible content with our dynamic viewer.',
    icon: EyeIcon,
  },
  {
    name: 'Cloud Backup',
    description:
      'Enterprise-grade protection with continuous backup — your documents are always safe and available.',
    icon: ServerCogIcon,
  },
  {
    name: 'Responsive Across Devices',
    description:
      'Seamless experience across all your devices — start on desktop, continue on mobile without missing a beat.',
    icon: MonitorSmartphoneIcon,
  },
];

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const featureVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const floatAnimation = {
  hidden: { y: 0 },
  visible: {
    y: [0, -10, 0],
    transition: {
      repeat: Infinity,
      repeatType: 'reverse',
      duration: 3,
    },
  },
};

export default function Home() {
  const featuresRef = useRef<HTMLElement>(null);

  // Ensure body is scrollable
  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const scrollToFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="flex-1 bg-black text-white overflow-y-auto">
      {/* Hero Section with Gradient Background */}
      <section className="relative min-h-screen">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black z-0" />

        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-600/30 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />

        <motion.div
          className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-purple-600/20 blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-20 lg:pt-32">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Left side content */}
            <motion.div
              className="lg:w-1/2"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <motion.div
                variants={fadeIn}
                className="inline-block mb-2 px-4 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20"
              >
                <span className="text-sm font-medium text-indigo-300">
                  Revolutionizing Document Interaction
                </span>
              </motion.div>

              <motion.h1
                variants={fadeIn}
                className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                  Chat with PDF
                </span>
              </motion.h1>

              <motion.h2
                variants={fadeIn}
                className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white/90"
              >
                Transform Static Documents Into Dynamic Conversations
              </motion.h2>

              <motion.p
                variants={fadeIn}
                className="text-lg text-white/70 mb-8 max-w-xl"
              >
                Unlock the knowledge trapped in your PDFs with AI-powered
                conversations. Get instant answers, insights, and summaries from
                your documents with just a few clicks.
              </motion.p>

              <motion.div
                variants={fadeIn}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button
                  asChild
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 
                  transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/25 
                  text-white font-medium px-8 py-6 rounded-xl text-lg flex items-center gap-2"
                >
                  <Link href="/dashboard">
                    Get Started <ArrowRightIcon className="ml-1 h-5 w-5" />
                  </Link>
                </Button>

                <Button
                  onClick={scrollToFeatures}
                  className="bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30
                  transition-all duration-300 text-indigo-300 hover:text-white
                  font-medium px-8 py-6 rounded-xl text-lg"
                >
                  Explore Features
                </Button>
              </motion.div>
            </motion.div>

            {/* Right side image */}
            <motion.div
              className="lg:w-1/2"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <motion.div
                className="relative rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/20 border border-white/10"
                whileHover={{ scale: 1.02 }}
                animate={{
                  y: [0, -10, 0],
                  transition: {
                    repeat: Infinity,
                    repeatType: 'reverse',
                    duration: 3,
                  },
                }}
              >
                <Image
                  alt="App screenshot"
                  src="https://i.imgur.com/R7m4Oty.png"
                  width={2432}
                  height={1442}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          onClick={scrollToFeatures}
          style={{ cursor: 'pointer' }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-white"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        ref={featuresRef}
        className="py-24 sm:py-32 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black to-indigo-950/30 z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
          >
            <h2 className="text-base font-semibold text-indigo-400 mb-3">
              POWERFUL CAPABILITIES
            </h2>
            <p className="text-3xl md:text-4xl font-bold text-white">
              Everything you need to master your documents
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                variants={featureVariant}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10"
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-indigo-500/10">
                    <feature.icon className="h-6 w-6 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {feature.name}
                  </h3>
                </div>
                <p className="text-white/70">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-16 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
          >
            <Button
              asChild
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 
              transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/25 
              text-white font-medium px-8 py-6 rounded-xl text-lg"
            >
              <Link href="/dashboard">
                Try It Now <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
