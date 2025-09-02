import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ExtractionJob {
  id: string;
  source: string;
  type: 'url' | 'file' | 'api' | any;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  extractedCount: number;
  errors: string[];
  results: Record<string, unknown>[];
}

export function ExtractionJobCard({ job }: { job: ExtractionJob }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant={job.status === 'completed' ? 'default' : job.status === 'error' ? 'destructive' : 'secondary'}>
            {job.status}
          </Badge>
          <div className="font-medium truncate max-w-[360px]">{job.source}</div>
        </div>
        <div className="text-sm opacity-80">{job.extractedCount} éléments</div>
      </div>
      <Progress value={job.progress} className="h-2" />
      {job.results && job.results.length > 0 && (
        <div className="mt-3 text-sm text-muted-foreground">
          {job.results.length} résultat(s) extrait(s)
        </div>
      )}
      {job.errors && job.errors.length > 0 && (
        <div className="mt-3 text-sm text-red-600">
          {job.errors.join(', ')}
        </div>
      )}
    </div>
  );
}