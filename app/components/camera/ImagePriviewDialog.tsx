import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ImagePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string | null;
}

const ImagePreviewDialog: React.FC<ImagePreviewDialogProps> = ({ 
  open, 
  onClose, 
  imageUrl 
}) => {
  const handleDownload = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `camera-capture-${new Date().getTime()}.png`;
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">Captured Image</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Image captured at {new Date().toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-2">
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt="Captured" 
              className="max-w-full rounded-md shadow-md" 
            />
          )}
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="dark:text-gray-100 dark:hover:bg-gray-700"
          >
            Close
          </Button>
          {imageUrl && (
            <Button 
              onClick={handleDownload}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download size={16} className="mr-2" />
              Download
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;