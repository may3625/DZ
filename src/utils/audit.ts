import { supabase } from '@/integrations/supabase/client';

export type AuditEntity = 'thread' | 'post' | 'checklist' | 'checklist_item' | 'assignment' | 'annotation';

export async function logAudit(
  action: string,
  entity_type: AuditEntity,
  entity_id?: string,
  diff?: Record<string, any>,
  metadata?: Record<string, any>
) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const actor_id = userData.user?.id ?? null;

    await supabase.from('audit_logs').insert({
      action,
      entity_type,
      entity_id: entity_id ?? null,
      diff: diff ?? null,
      metadata: metadata ?? null,
      actor_id,
    });
  } catch (e) {
    console.warn('Audit log failed', e);
  }
}
