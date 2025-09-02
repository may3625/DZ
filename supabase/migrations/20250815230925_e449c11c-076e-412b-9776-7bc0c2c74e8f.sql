-- Create table for OCR extraction results
CREATE TABLE public.ocr_extractions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  original_filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  total_pages INTEGER DEFAULT 1,
  extracted_text TEXT,
  text_regions JSONB,
  metadata JSONB,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  confidence_score DECIMAL(3,2),
  language_detected TEXT,
  is_mixed_language BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for mapping results
CREATE TABLE public.ocr_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  extraction_id UUID NOT NULL REFERENCES public.ocr_extractions(id) ON DELETE CASCADE,
  form_type TEXT NOT NULL,
  mapped_data JSONB,
  mapped_fields JSONB,
  unmapped_fields JSONB,
  confidence_scores JSONB,
  mapping_status TEXT DEFAULT 'draft' CHECK (mapping_status IN ('draft', 'validated', 'approved', 'rejected')),
  validation_errors JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for approval workflow
CREATE TABLE public.ocr_approval_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mapping_id UUID NOT NULL REFERENCES public.ocr_mappings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reviewer_id UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_revision')),
  content JSONB NOT NULL,
  original_text TEXT,
  review_notes TEXT,
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ocr_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocr_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocr_approval_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ocr_extractions
CREATE POLICY "Users can view their own extractions" 
ON public.ocr_extractions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own extractions" 
ON public.ocr_extractions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own extractions" 
ON public.ocr_extractions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for ocr_mappings
CREATE POLICY "Users can view mappings for their extractions" 
ON public.ocr_mappings 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.ocr_extractions 
  WHERE id = ocr_mappings.extraction_id 
  AND user_id = auth.uid()
));

CREATE POLICY "Users can create mappings for their extractions" 
ON public.ocr_mappings 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.ocr_extractions 
  WHERE id = ocr_mappings.extraction_id 
  AND user_id = auth.uid()
));

CREATE POLICY "Users can update mappings for their extractions" 
ON public.ocr_mappings 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.ocr_extractions 
  WHERE id = ocr_mappings.extraction_id 
  AND user_id = auth.uid()
));

-- RLS Policies for ocr_approval_items
CREATE POLICY "Users can view their own approval items" 
ON public.ocr_approval_items 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = reviewer_id);

CREATE POLICY "Users can create their own approval items" 
ON public.ocr_approval_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own approval items" 
ON public.ocr_approval_items 
FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = reviewer_id);

-- Create indexes for better performance
CREATE INDEX idx_ocr_extractions_user_id ON public.ocr_extractions(user_id);
CREATE INDEX idx_ocr_extractions_status ON public.ocr_extractions(processing_status);
CREATE INDEX idx_ocr_mappings_extraction_id ON public.ocr_mappings(extraction_id);
CREATE INDEX idx_ocr_approval_items_user_id ON public.ocr_approval_items(user_id);
CREATE INDEX idx_ocr_approval_items_status ON public.ocr_approval_items(status);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ocr_extractions_updated_at
BEFORE UPDATE ON public.ocr_extractions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ocr_mappings_updated_at
BEFORE UPDATE ON public.ocr_mappings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ocr_approval_items_updated_at
BEFORE UPDATE ON public.ocr_approval_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();