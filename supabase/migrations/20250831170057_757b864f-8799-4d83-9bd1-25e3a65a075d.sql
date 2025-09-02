-- Fix RLS policy bugs in checklists and checklist_items tables

-- Drop and recreate the problematic policy for checklists
DROP POLICY IF EXISTS "Checklists readable by owner or assignees" ON public.checklists;

CREATE POLICY "Checklists readable by owner or assignees" 
ON public.checklists 
FOR SELECT 
USING (
  (created_by = auth.uid()) OR 
  (EXISTS ( 
    SELECT 1
    FROM assignments a
    WHERE (a.checklist_id = checklists.id) AND (a.assignee_id = auth.uid())
  ))
);

-- Also fix similar issue in checklist_items if it exists
DROP POLICY IF EXISTS "Items readable by owner or assignee" ON public.checklist_items;

CREATE POLICY "Items readable by owner or assignee" 
ON public.checklist_items 
FOR SELECT 
USING (
  (assignee_id = auth.uid()) OR 
  (EXISTS ( 
    SELECT 1
    FROM checklists c
    WHERE (c.id = checklist_items.checklist_id) AND (c.created_by = auth.uid())
  )) OR 
  (EXISTS ( 
    SELECT 1
    FROM assignments a
    WHERE (a.item_id = checklist_items.id) AND (a.assignee_id = auth.uid())
  ))
);

-- Fix similar issue in checklist_items update policy
DROP POLICY IF EXISTS "Items update by owner or assignee" ON public.checklist_items;

CREATE POLICY "Items update by owner or assignee" 
ON public.checklist_items 
FOR UPDATE 
USING (
  (EXISTS ( 
    SELECT 1
    FROM checklists c
    WHERE (c.id = checklist_items.checklist_id) AND (c.created_by = auth.uid())
  )) OR 
  (assignee_id = auth.uid()) OR 
  (EXISTS ( 
    SELECT 1
    FROM assignments a
    WHERE (a.item_id = checklist_items.id) AND (a.assignee_id = auth.uid())
  ))
);