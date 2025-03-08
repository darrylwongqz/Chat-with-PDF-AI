import { Button } from '@/components/ui/button';
import {
  BrainCogIcon,
  EyeIcon,
  GlobeIcon,
  MonitorSmartphoneIcon,
  ServerCogIcon,
  ZapIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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

export default function Home() {
  return (
    <main className="flex-1 overflow-scroll p-2 lg:p-5 bg-gradient-to-bl from-white to-indigo-600">
      <div className="bg-white py-24 sm:py-32 rounded-md drop-shadow-xl">
        <div className="flex flex-col justify-center items-center mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">
              Your Interactive Document Companion
            </h2>

            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Transform Your PDFs into Interactive Conversations
            </p>

            <p className="mt-6 text-lg leading-8 text-gray-600">
              Introducing{' '}
              <span className="font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                Chat with PDF
              </span>
              — the tool that transforms static documents into{' '}
              <span className="font-bold">dynamic conversations</span>,
              enhancing productivity 10x fold effortlessly.
            </p>

            <p className="mt-4 text-lg leading-8 text-gray-600">
              Simply upload your PDF, and
              <span className="font-semibold italic"> ask away.</span>
            </p>
          </div>

          <Button
            asChild
            className="mt-10 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg text-white font-medium px-8 py-3 rounded-md"
          >
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </div>

        <div className="relative overflow-hidden pt-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <Image
              alt="App screenshot"
              src="https://i.imgur.com/R7m4Oty.png"
              width={2432}
              height={1442}
              className="mb-[-0%] rounded-xl shadow-2xl ring-1 ring-gray-900/10"
            />
            <div aria-hidden="true" className="relative">
              <div className="absolute bottom-0 -inset-x-32 bg-gradient-to-t from-white/95 pt-[5%]" />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8">
          <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 text-gray-600 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-9">
                <dt className="inline font-semibold text-gray-900">
                  <feature.icon
                    aria-hidden="true"
                    className="absolute left-1 top-1 h-5 w-5 text-indigo-600"
                  />
                </dt>

                <dd>{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </main>
  );
}
