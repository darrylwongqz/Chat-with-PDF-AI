import { SignedIn, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from './ui/button';
import { FilePlus2 } from 'lucide-react';
import UpgradeButton from './UpgradeButton';

function Header() {
  return (
    <div className="flex justify-between bg-white shadow-sm p-5 border-b relative z-50">
      <Link href="/dashboard" className="text-2xl">
        Chat with{' '}
        <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-transparent bg-clip-text font-bold">
          PDF
        </span>
      </Link>

      <SignedIn>
        <div className="flex items-center space-x-2">
          <Button asChild variant="link" className="hidden md:flex">
            <Link href="/dashboard/upgrade">Pricing</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href="/dashboard">My Documents</Link>
          </Button>

          <Button asChild variant="outline" className="border-indigo-600">
            <Link href="/dashboard/upload">
              <FilePlus2 className="text-indigo-600" />
            </Link>
          </Button>

          <UpgradeButton />
          <UserButton />
        </div>
      </SignedIn>
    </div>
  );
}
export default Header;
