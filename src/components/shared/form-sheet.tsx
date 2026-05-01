import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface FormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onSave: () => void;
  onCancel?: () => void;
  saveText?: string;
  cancelText?: string;
  isSaving?: boolean;
}

export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSave,
  onCancel,
  saveText = 'Simpan',
  cancelText = 'Batal',
  isSaving = false,
}: FormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md sm:w-[450px] flex flex-col p-0 border-l-white bg-white/95 backdrop-blur-xl">
        <SheetHeader className="shrink-0 p-6 border-b border-gray-100 bg-white/50">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1.5 h-6 bg-nabawi rounded-full" />
            <SheetTitle className="text-xl font-black text-gray-900 tracking-tight uppercase">{title}</SheetTitle>
          </div>
          {description && <SheetDescription className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4">{description}</SheetDescription>}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {children}
        </div>

        <SheetFooter className="shrink-0 flex-row gap-3 p-6 pt-4 border-t border-gray-100 bg-white/50 backdrop-blur-md">
          <Button 
            variant="outline" 
            onClick={() => {
              if (onCancel) onCancel();
              onOpenChange(false);
            }} 
            className="flex-1 h-12 rounded-2xl border-gray-200 font-black text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-all active:scale-95"
            disabled={isSaving}
          >
            {cancelText}
          </Button>
          <Button 
            onClick={onSave} 
            className="flex-1 h-12 rounded-2xl bg-nabawi hover:bg-nabawi-dark shadow-lg shadow-nabawi/20 font-black text-xs uppercase tracking-widest transition-all active:scale-95"
            disabled={isSaving}
          >
            {isSaving ? 'Processing...' : saveText}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
