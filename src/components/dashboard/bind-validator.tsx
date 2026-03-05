
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
    const regex = /^:bind\s([A-Z0-9]{4})$/i;
    const match = val.match(regex);
    if (match) {
      return { isValid: true, code: match[1].toUpperCase() };
    }
    return { isValid: false, code: null };
  };

  const { isValid, code } = validate(inputValue);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-accent" />
          Bind Code Validation
        </CardTitle>
        <CardDescription>Instantly verify if a string matches the required bind format.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="validator">Input String</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="validator"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. :bind XJ49"
              className="pl-10 font-code"
            />
          </div>
        </div>

        {inputValue && (
          <div className={`p-4 rounded-lg border flex items-start gap-3 ${isValid ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
            {isValid ? (
              <ShieldCheck className="w-5 h-5 text-green-500 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className={`font-medium ${isValid ? 'text-green-500' : 'text-red-500'}`}>
                {isValid ? 'Valid Format' : 'Invalid Format'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isValid 
                  ? `Successfully extracted code: ${code}` 
                  : 'String must start with ":bind " followed by exactly 4 alphanumeric characters.'}
              </p>
              {isValid && (
                <div className="mt-2">
                  <Badge variant="outline" className="font-code text-green-500 border-green-500/30">
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
