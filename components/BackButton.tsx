'use client';

import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();
  
  return (
    <button 
      onClick={() => router.back()} 
      className="text-primary font-semibold hover:underline mb-6 inline-block flex items-center gap-1"
    >
      &larr; Volver
    </button>
  );
}
