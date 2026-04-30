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
      <SheetContent side="right" className="w-full sm:max-w-md sm:w-[400px] flex flex-col">
        <SheetHeader className="shrink-0">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {children}
        </div>

        <SheetFooter className="shrink-0 flex-row gap-2 pt-2 border-t border-gray-100">
          <Button 
            variant="outline" 
            onClick={() => {
              if (onCancel) onCancel();
              onOpenChange(false);
            }} 
            className="flex-1 rounded-xl"
            disabled={isSaving}
          >
            {cancelText}
          </Button>
          <Button 
            onClick={onSave} 
            className="flex-1 rounded-xl bg-nabawi hover:bg-nabawi-dark"
            disabled={isSaving}
          >
            {isSaving ? 'Menyimpan...' : saveText}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
