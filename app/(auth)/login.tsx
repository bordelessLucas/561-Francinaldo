import { Link, Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { BrandMark } from '@/components/ui/BrandMark';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { useAuth } from '@/contexts/AuthContext';

function getAuthErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' && error && 'code' in error
      ? String((error as { code?: string }).code)
      : '';

  switch (code) {
    case 'auth/invalid-email':
      return 'E-mail inválido.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Aguarde um momento e tente de novo.';
    case 'auth/network-request-failed':
      return 'Falha de rede. Verifique sua conexão.';
    default:
      return 'Não foi possível entrar. Verifique e-mail e senha.';
  }
}

export default function LoginScreen() {
  const { user, loading, signIn, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (loading) {
    return <LoadingState message="Verificando sessão..." />;
  }

  if (user) {
    return <Redirect href="/(app)" />;
  }

  async function handleSubmit() {
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      router.replace('/(app)');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPassword() {
    setError(null);
    setInfo(null);

    if (!email.trim()) {
      setError('Informe seu e-mail para recuperar a senha.');
      return;
    }

    setResetting(true);
    try {
      await resetPassword(email);
      setInfo('Enviamos um e-mail com instruções para redefinir sua senha.');
    } catch {
      setError('Não foi possível enviar a recuperação de senha. Verifique o e-mail.');
    } finally {
      setResetting(false);
    }
  }

  return (
    <Screen scroll>
      <View className="mb-10 mt-6">
        <BrandMark showTagline />
      </View>

      <View className="mb-8 gap-2">
        <Text className="font-display text-3xl text-ink">Entrar</Text>
        <Text className="font-sans text-base text-ink-muted">
          Acesse para abrir a Home e iniciar uma nova análise.
        </Text>
      </View>

      <View className="gap-4">
        <Input
          label="E-mail"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="seu@email.com"
        />
        <Input
          label="Senha"
          secureTextEntry
          autoComplete="password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
        />
        {error ? <Text className="font-sans text-sm text-signal">{error}</Text> : null}
        {info ? <Text className="font-sans text-sm text-brand-dark">{info}</Text> : null}
        <Button label="Entrar" onPress={handleSubmit} loading={submitting} className="mt-2" />
        <Pressable onPress={handleResetPassword} disabled={resetting} className="items-center py-2">
          <Text className="font-sansMedium text-sm text-brand-dark">
            {resetting ? 'Enviando...' : 'Esqueci minha senha'}
          </Text>
        </Pressable>
      </View>

      <View className="mt-8 flex-row items-center justify-center gap-1">
        <Text className="font-sans text-ink-muted">Ainda não tem conta?</Text>
        <Link href="/(auth)/register" className="font-sansSemi text-brand-dark">
          Criar conta
        </Link>
      </View>
    </Screen>
  );
}
