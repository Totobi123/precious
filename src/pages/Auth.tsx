import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Lock, KeyRound, ArrowLeft, Sparkles, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { motion, AnimatePresence } from 'framer-motion';

type AuthStep = 'login' | 'signup' | 'otp';

const Auth = () => {
  const [step, setStep] = useState<AuthStep>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, verifyOtp } = useAuth();

  const clearError = () => setError('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.trim().length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    clearError();

    const { error } = await signUp(email.trim(), password.trim());
    setIsLoading(false);

    if (!error) {
      toast.success('Please check your email for the verification code. (Check SPAM folder)');
      setStep('otp');
    } else {
      setError(error.message || 'Signup failed. Please try again.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setIsLoading(true);
    clearError();

    const { error } = await verifyOtp(email.trim(), otp);
    setIsLoading(false);

    if (!error) {
      toast.success('Email verified! You can now sign in.');
      setPassword('');
      setOtp('');
      setStep('login');
    } else {
      setError(error.message || 'Invalid verification code. Please try again.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    clearError();

    const { error } = await signIn(email.trim(), password.trim());
    setIsLoading(false);

    if (!error) {
      toast.success('Welcome back!');
      navigate('/');
    } else {
      setError(error.message || 'Invalid email or password.');
    }
  };

  const fadeVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="heading-display text-3xl tracking-wider mb-1">Precious Chic Nails</h1>
            <p className="text-body text-muted-foreground text-sm">
              {step === 'login' && 'Sign in to your account'}
              {step === 'signup' && 'Create your account'}
              {step === 'otp' && 'Verify your email'}
            </p>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {/* ─── SIGNUP ─── */}
          {step === 'signup' && (
            <motion.form
              key="signup"
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onSubmit={handleSignup}
              className="bg-card rounded-2xl p-8 shadow-sm border border-border space-y-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={18} className="text-primary" />
                <h2 className="heading-display text-xl tracking-wider">Create Account</h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-xs tracking-wider uppercase font-medium">Email</Label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); clearError(); }}
                    placeholder="you@example.com"
                    className="pl-10 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-xs tracking-wider uppercase font-medium">Password</Label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); clearError(); }}
                    placeholder="Min. 6 characters"
                    className="pl-10 pr-10 rounded-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive font-medium">{error}</p>
              )}

              <Button type="submit" className="w-full btn-luxury" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Sign Up'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setStep('login'); clearError(); setPassword(''); }}
                  className="text-primary font-medium hover:underline"
                >
                  Sign in
                </button>
              </p>
            </motion.form>
          )}

          {/* ─── OTP VERIFICATION ─── */}
          {step === 'otp' && (
            <motion.form
              key="otp"
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onSubmit={handleVerifyOtp}
              className="bg-card rounded-2xl p-8 shadow-sm border border-border space-y-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={18} className="text-primary" />
                <h2 className="heading-display text-xl tracking-wider">Verify Email</h2>
              </div>

              <p className="text-sm text-muted-foreground">
                We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>. Enter it below.
              </p>

              <div className="flex justify-center py-2">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => { setOtp(value); clearError(); }}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {error && (
                <p className="text-sm text-destructive font-medium text-center">{error}</p>
              )}

              <Button type="submit" className="w-full btn-luxury" disabled={isLoading || otp.length !== 6}>
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </Button>

              <button
                type="button"
                onClick={() => { setStep('signup'); clearError(); setOtp(''); }}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
              >
                <ArrowLeft size={14} /> Back to sign up
              </button>
            </motion.form>
          )}

          {/* ─── LOGIN ─── */}
          {step === 'login' && (
            <motion.form
              key="login"
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onSubmit={handleLogin}
              className="bg-card rounded-2xl p-8 shadow-sm border border-border space-y-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <KeyRound size={18} className="text-primary" />
                <h2 className="heading-display text-xl tracking-wider">Welcome Back</h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-xs tracking-wider uppercase font-medium">Email</Label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); clearError(); }}
                    placeholder="you@example.com"
                    className="pl-10 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-xs tracking-wider uppercase font-medium">Password</Label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); clearError(); }}
                    placeholder="••••••••"
                    className="pl-10 pr-10 rounded-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive font-medium">{error}</p>
              )}

              <Button type="submit" className="w-full btn-luxury" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setStep('signup'); clearError(); setPassword(''); }}
                  className="text-primary font-medium hover:underline"
                >
                  Sign up
                </button>
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Auth;
