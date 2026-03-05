
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface RegisterNucleusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RegisterNucleusDialog({ open, onOpenChange }: RegisterNucleusDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'primary' | 'secondary' | 'tertiary'>('primary');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "You must be logged in to register a nucleus.",
      });
      return;
    }

    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide a name for the nucleus.",
      });
      return;
    }

    setIsLoading(true);
    const nucleiRef = collection(db, 'nuclei');
    const newNucleus = {
      name: name.trim(),
      type,
      status: 'offline',
      syncProgress: 0,
      userId: user.uid,
      createdAt: serverTimestamp(),
      tags: [],
      description: '',
    };

    addDoc(nucleiRef, newNucleus)
      .then(() => {
        toast({
          title: "Nucleus Registered",
          description: `"${name}" has been added to the registry.`,
        });
        setName('');
        setType('primary');
        onOpenChange(false);
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: nucleiRef.path,
          operation: 'create',
          requestResourceData: newNucleus,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Register New Nucleus</DialogTitle>
          <DialogDescription>
            Deploy a new orchestrator nucleus into the Nexus network.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="name">Nucleus Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Production Core Alpha"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="type">Nucleus Class</Label>
            <Select 
              value={type} 
              onValueChange={(val: any) => setType(val)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
                <SelectItem value="tertiary">Tertiary</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Classification within the trinuclear architecture.</p>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? "Registering..." : "Register Nucleus"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
