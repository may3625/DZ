import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Play, Upload, Settings, Volume2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VideoPlayerModal({ isOpen, onClose }: VideoPlayerModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    quality: '1080p',
    autoplay: false,
    loop: false,
    muted: false,
    controls: true,
    subtitles: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Configuration vidéo:', formData);
    toast({
      title: "Vidéo configurée",
      description: "Le lecteur vidéo a été configuré avec succès.",
    });
    onClose();
    setFormData({
      title: '',
      description: '',
      videoUrl: '',
      quality: '1080p',
      autoplay: false,
      loop: false,
      muted: false,
      controls: true,
      subtitles: false
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Configuration du lecteur vidéo
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titre de la vidéo</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Titre de la vidéo"
              required
            />
          </div>

          <div>
            <Label htmlFor="videoUrl">URL de la vidéo</Label>
            <Input
              id="videoUrl"
              value={formData.videoUrl}
              onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
              placeholder="https://example.com/video.mp4"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quality">Qualité vidéo</Label>
              <Select onValueChange={(value) => setFormData({...formData, quality: value})}>
                <SelectTrigger id="quality">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="480p">480p</SelectItem>
                  <SelectItem value="720p">720p</SelectItem>
                  <SelectItem value="1080p">1080p</SelectItem>
                  <SelectItem value="4k">4K</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Description de la vidéo"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoplay"
                checked={formData.autoplay}
                onCheckedChange={(checked) => setFormData({...formData, autoplay: checked as boolean})}
              />
              <Label htmlFor="autoplay">Lecture automatique</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="loop"
                checked={formData.loop}
                onCheckedChange={(checked) => setFormData({...formData, loop: checked as boolean})}
              />
              <Label htmlFor="loop">Lecture en boucle</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="muted"
                checked={formData.muted}
                onCheckedChange={(checked) => setFormData({...formData, muted: checked as boolean})}
              />
              <Label htmlFor="muted">Sourdine par défaut</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="controls"
                checked={formData.controls}
                onCheckedChange={(checked) => setFormData({...formData, controls: checked as boolean})}
              />
              <Label htmlFor="controls">Afficher les contrôles</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="subtitles"
                checked={formData.subtitles}
                onCheckedChange={(checked) => setFormData({...formData, subtitles: checked as boolean})}
              />
              <Label htmlFor="subtitles">Sous-titres</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              Configurer le lecteur
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}