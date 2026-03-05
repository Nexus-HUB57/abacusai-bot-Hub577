"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, AlertCircle, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function BindValidator() {
  const [inputValue, setInputValue] = useState('');
  
  const validate = (val: string) => {
    // Trim surrounding whitespace which is common when copying/pasting
    const trimmed = val.trim();
    
    // Regex supports ":bind " followed by alphanumeric codes from 4 to 64 characters
    // The 'i' flag makes it case-insensitive
    const regex = /^:bind\s+([a-z0-9]{4,64})$/i;
    const match = trimmed.match(regex);
    
    if (match) {
      return { isValid: true, code: match[1] };
    }
    return { isValid: false, code: null };
  };

  const { isValid, code } = validate(inputValue);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <ShieldCheck className="w-5 h-5 text-accent" />
          Validação de Protocolo
        </CardTitle>
        <CardDescription className="font-body">Verifique instantaneamente se uma string segue o formato :bind exigido.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="validator" className="font-body">String de Entrada</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="validator"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ex: :bind wf1Jr8ZlxGgUH1z1yZE2ZPH0"
              className="pl-10 font-code text-xs bg-secondary/30"
            />
          </div>
        </div>

        {inputValue && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${isValid ? 'bg-green-500/10 border-green-500/30' : 'bg-destructive/10 border-destructive/30'}`}>
            {isValid ? (
              <ShieldCheck className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
            )}
            <div className="space-y-1 overflow-hidden">
              <p className={`font-bold font-headline text-sm ${isValid ? 'text-green-500' : 'text-destructive'}`}>
                {isValid ? 'Formato Válido' : 'Formato Inválido'}
              </p>
              <p className="text-xs text-muted-foreground font-body leading-relaxed">
                {isValid 
                  ? `Código extraído com sucesso: ${code}` 
                  : 'A string deve começar com ":bind " seguido por caracteres alfanuméricos (4-64 caracteres).'}
              </p>
              {isValid && (
                <div className="mt-2">
                  <Badge variant="outline" className="font-code text-[10px] bg-background/50 border-green-500/20 text-green-500 break-all py-1">
                    {code}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
