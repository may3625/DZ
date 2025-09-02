import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface ApiTestingModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function ApiTestingModal({ isOpen, onClose }: ApiTestingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>API Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-yellow-800 font-medium">En développement</p>
              <p className="text-yellow-700 text-sm">
                Cette fonctionnalité sera bientôt disponible.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}