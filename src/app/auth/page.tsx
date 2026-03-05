
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Cpu, Loader2, ArrowRight } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;

    setIsLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update Firebase Auth profile
        await updateProfile(user, { displayName: name });
        
        // Create initial user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          name,
          email,
          createdAt: serverTimestamp(),
          monthlyCredits: 40000,
          creditsUsed: 0,
        });
      }
      
      router.push('/dashboard');
      toast({
        title: isLogin ? "Welcome Back" : "Account Created",
        description: `Successfully authenticated as ${email}`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <Card className="w-full max-w-md border-accent/10 shadow-2xl shadow-accent/5 backdrop-blur-sm bg-card/50">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Cpu className="text-primary-foreground w-7 h-7" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold font-headline">
            {isLogin ? 'Nexus Access' : 'Initialize Identity'}
          </CardTitle>
          <CardDescription className="font-body">
            {isLogin ? 'Enter credentials to enter the command center' : 'Register a new node in the global nexus'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="Lucas" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  className="bg-secondary/30 border-border/50"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="lucas@nexus.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="bg-secondary/30 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Security Protocol (Password)</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="bg-secondary/30 border-border/50"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full h-12 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Authenticate' : 'Register User'}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                {isLogin ? "Don't have access?" : "Already registered?"}
              </span>{' '}
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-accent hover:underline font-semibold"
              >
                {isLogin ? 'Initialize New Node' : 'Sign In Existing Node'}
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
